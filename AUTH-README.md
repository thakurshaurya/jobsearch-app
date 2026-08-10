# Authentication — What We Built and Why

This document explains everything that was changed while building the login/signup
system, in plain language. It's written so you can come back in three months and
still understand why the code looks the way it does.

I left the original `README.md` alone — that's still the Next.js boilerplate.

---

## Table of contents

1. [The 30-second summary](#the-30-second-summary)
2. [Concepts you need first](#concepts-you-need-first)
3. [Part 1 — Fixing the signup route](#part-1--fixing-the-signup-route)
4. [Part 2 — The 400 error that wasn't your code](#part-2--the-400-error-that-wasnt-your-code)
5. [Part 3 — Removing the email verification](#part-3--removing-the-email-verification)
6. [Part 4 — Wiring up the signup form](#part-4--wiring-up-the-signup-form)
7. [Part 5 — Building login](#part-5--building-login)
8. [Part 6 — The header bug](#part-6--the-header-bug)
9. [File-by-file reference](#file-by-file-reference)
10. [Setup requirements](#setup-requirements)
11. [What's still missing](#whats-still-missing)

---

## The 30-second summary

- **Signup was completely broken** because of a single typo (`passsword` with three
  s's) in the user model. Fixed.
- **The database connection** wasn't being waited for, and had two bogus imports.
  Fixed.
- **Login didn't exist.** It's now a server action that checks the password and
  hands out a signed token stored in a secure cookie.
- **The header wouldn't show your avatar after logging in.** The cause was subtle —
  explained in detail in Part 6.

---

## Concepts you need first

Four ideas explain most of the decisions below.

### 1. Password hashing

We never store the actual password. When you sign up, `bcryptjs` scrambles your
password into something like `$2a$10$N9qo8uLOickgx2Z...`. This scrambling is
**one-way** — there's no "unscramble" function.

So how does login work? We scramble the password you just typed and compare the
two scrambles. If they match, you knew the password. `bcryptjs.compare()` does this.

Why bother? If someone steals your database, they get a pile of useless scrambles
instead of everyone's actual passwords. And since people reuse passwords, a leak
would otherwise expose their email and bank accounts too.

### 2. JWT (JSON Web Token)

HTTP is forgetful. Every request to your server is a stranger knocking on the
door — the server has no memory of the last one. So after you log in, we need to
hand you something that proves "I already logged in" on every future request.

A JWT is a string with three parts separated by dots:

```
eyJhbGciOiJIUzI1NiJ9.eyJ1c2VybmFtZSI6IlNoYW5rczEifQ.OFAyeUKCO6OtxqKuQ
   ^ header            ^ your data (readable!)        ^ signature
```

The middle part holds `userId`, `username`, `email`. **It is not encrypted** —
anyone can decode and read it. Never put a password or anything secret in there.

The third part is the important bit. It's a mathematical fingerprint created using
your `JWT_SECRET`. If someone edits the middle part to say `"isAdmin": true`, the
fingerprint no longer matches and `jwt.verify()` rejects it. Only someone holding
your `JWT_SECRET` can produce a valid fingerprint — which is why that secret must
never be committed to git or shipped to the browser.

Think of it as a tamper-evident wristband at a concert.

### 3. httpOnly cookies

The token has to live in the browser somewhere. There are two options:

| Where | Can JavaScript read it? | Risk |
|---|---|---|
| `localStorage` | Yes | Any malicious script on your page can steal the token |
| `httpOnly` cookie | **No** | Much safer |

We use an `httpOnly` cookie. The browser stores it and automatically attaches it
to every request to your site, but JavaScript on the page literally cannot see it.
So if a bad script sneaks in (from a dodgy npm package, say), it can't grab
your login token.

The cookie options we set, in English:

```ts
{
  httpOnly: true,      // JavaScript can't read it
  secure: true,        // only sent over HTTPS (production only — localhost is HTTP)
  sameSite: "strict",  // not sent when arriving from another website (blocks CSRF)
  maxAge: 604800,      // expires after 7 days, in seconds
  path: "/",           // valid on every page of the site
}
```

### 4. Server components vs client components

This is the one that caused the header bug, so it's worth understanding.

In the App Router, **components run on the server by default.** They render to
HTML on your machine and the browser receives finished HTML. They can talk to the
database and read secrets directly, because that code never reaches the browser.

Adding `"use client"` at the top changes this: the component's code is sent to the
browser and runs there. Only client components can use `useState`, `useEffect`,
`onClick`, and other interactive features.

The rule of thumb: **server by default, `"use client"` only when you need
interactivity.** Server components are the reason `lib/auth.ts` can read a secret
cookie safely — that file never leaves your server.

---

## Part 1 — Fixing the signup route

### The typo that broke everything

`models/userModel.js` had this:

```js
passsword : {              // ← three s's
    type : String,
    required : [true, "Please provide a password"],
}
```

Meanwhile the signup route was saving a field called `password` (correct spelling).

Mongoose (the library that talks to MongoDB) ignores fields you didn't declare in
the schema. So it silently threw away the `password` you sent, then noticed
`passsword` was missing, and — because it's marked `required` — refused to save
with the error *"Please provide a password."*

A genuinely confusing error, because the message names the exact thing you
thought you'd provided. **Fixed: `passsword` → `password`.**

### The database connection

`dbconfig/dbconfig.ts` had three problems:

**Problem 1 — two nonsense imports.**

```ts
import { log } from "console";        // never used
import { console } from "inspector";  // overwrites the real console!
```

The second line is the dangerous one. It replaces the normal `console` with
Node's debugging-inspector version, so your `console.log` calls could vanish into
nowhere. Both imports were deleted.

**Problem 2 — the connection wasn't awaited.**

```ts
mongoose.connect(process.env.MONGO_URI!);   // no await
```

Connecting to a database takes time (network round-trip). Without `await`, the
code moved straight on to running queries while the connection was still being
established. It worked most of the time by luck — the connection usually won the
race — which is the worst kind of bug, because it fails only occasionally and
usually under load. **Fixed: added `await`.**

**Problem 3 — `process.exit()` on a connection error.**

That command kills the entire Node process. One hiccup talking to MongoDB and your
whole dev server dies, forcing you to restart it. Replaced with `throw error`,
which surfaces the problem as a normal API error while the server keeps running.

**Also added — a reconnection guard:**

```ts
if (mongoose.connection.readyState >= 1) {
    return;
}
```

In development, Next.js reloads your code every time you save a file. Without
this guard, each reload opens *another* database connection, and after an
afternoon of work you've quietly exhausted MongoDB's connection limit. This line
says "already connected, nothing to do."

### The route itself

Three more changes to `app/api/users/signup/route.ts`:

**Moved `connectDB()` inside the handler.** It used to sit at the top of the file
as a bare `connectDB()` call, which runs once when the file first loads and
nobody waits for it or notices if it fails. Now it's `await connectDB()` as the
first line inside `POST`, so every request is guaranteed a live connection.

**Added input validation.** If `username`, `email` or `password` is missing, the
route returns `400` with a clear message instead of letting Mongoose fail with a
cryptic validation error.

**Stopped returning the password hash.** The old code did this:

```ts
return NextResponse.json({ savedUser })   // the ENTIRE database document
```

`savedUser` includes the hashed password, plus `verifyToken` and every other
internal field. Sending a password hash to the browser is a real leak — an
attacker who captures that response can attempt to crack it offline, at their
leisure, with no rate limiting to stop them. Now the response only contains
`_id`, `username`, and `email`.

Also changed the status from `201` on both paths to make the codes meaningful:
`201 Created` for signup (something new exists), `200 OK` for login (nothing was
created).

---

## Part 2 — The 400 error that wasn't your code

You sent this from your API client and got `400 Bad Request`:

```
{
   username:"Shanks1",
   email:"shanks1@gmail.com",
   password:"123456",
}
```

That's **JavaScript object syntax, not JSON.** They look nearly identical, which
is exactly why this catches everyone. JSON is stricter about two things:

| | JavaScript | JSON |
|---|---|---|
| Keys | `username: "x"` — quotes optional | `"username": "x"` — **quotes required** |
| Trailing comma | `{a: 1,}` — allowed | `{"a": 1,}` — **not allowed** |

So the server couldn't extract `username`/`email`/`password`, they came out
`undefined`, and the validation we'd just added correctly rejected the request.

The valid version:

```json
{
  "username": "Shanks1",
  "email": "shanks1@gmail.com",
  "password": "123456"
}
```

**A trick for next time:** most API clients have a **Format** button. Click it —
if your body is valid JSON it gets tidied up; if it's invalid, nothing happens or
you get an error. Instant sanity check before you blame your server code.

---

## Part 3 — Removing the email verification

You asked to strip this out until you own a domain, since Mailtrap can't send to
real addresses without a verified sending domain.

Removed from `app/api/users/signup/route.ts`:

- the `import { sendMail }` line
- the block that called `sendMail(...)` after saving the user
- `isVerified` from the JSON response

**Deliberately left in place** — `helpers/mailer.ts` (untouched, ready to use)
and the `isVerified`, `verifyToken`, `verifyTokenExpiry` fields in the user model.

You asked whether unused schema fields cause problems. They don't. MongoDB has no
fixed table structure — `isVerified` simply defaults to `false` on every new
user, and the two token fields stay empty. When you add verification later, the
fields are already waiting and no existing user data needs migrating.

---

## Part 4 — Wiring up the signup form

Your form was pure UI — beautiful, but the button did nothing. Your first draft
had four issues:

**1. Wrong URL.** It called `/api/signup`, but your route file lives at
`app/api/users/signup/route.ts`. In the App Router the folder path *is* the URL,
so the correct address is `/api/users/signup`. The missing `users/` segment meant
the request hit a route that doesn't exist.

**2. `onSubmit` was on the button.** This is the single most common React form
mistake. `submit` is a **form** event, not a button event — a `<form>` fires it
when a submit button inside it is pressed, or when the user hits Enter in a text
field. Putting `onSubmit` on the button means it never fires. Moved to the
`<motion.form>` tag, and the button got `type="submit"`.

**3. No feedback.** Failures went to `console.log`, where users never look. Added
an `error` state that renders a red box above the button.

**4. No loading state.** Nothing stopped you from clicking Create Account five
times while the first request was in flight, creating a race. Added a `loading`
state that disables the button and changes its text to "Creating Account…".

---

## Part 5 — Building login

### Why a server action instead of an API route

Your `app/api/users/login/route.ts` was empty. Your first draft of it had a few
bugs worth naming:

- `export async function GET` — should be `POST`. A GET request isn't supposed to
  have a body, and putting a password in one risks it being logged in server
  access logs or saved in browser history.
- `request: NextResponse` — should be `NextRequest`. `NextRequest` is what comes
  *in*, `NextResponse` is what goes *out*.
- Status `201 Created` — logging in doesn't create anything. Should be `200 OK`.
- No token was issued, so a "successful" login left the user no more logged in
  than before.

You then asked for it as a **server action** in `app/action/index.ts` instead, so
that's what we built. The difference:

| | API route | Server action |
|---|---|---|
| How you call it | `fetch("/api/...")` with JSON | call the function directly |
| Type safety | none — you can typo a field name | full — TypeScript checks the arguments |
| Boilerplate | build a request, parse a response | just a function call |

A file marked `"use server"` exports functions that **only ever run on the
server**. When your browser code calls `loginUser(email, password)`, Next.js
turns that into a network request behind the scenes. The function body — with its
database access and your `JWT_SECRET` — is never sent to the browser.

### What `loginUser` does

```
1. Connect to the database
2. Find the user by email        → not found?      return "Invalid credentials"
3. bcryptjs.compare passwords    → doesn't match?  return "Invalid credentials"
4. Sign a JWT holding userId, username, email
5. Store it in an httpOnly cookie
6. revalidatePath("/", "layout")  ← refresh the header (see Part 6)
7. redirect("/")
```

Two details in there are deliberate and easy to get wrong.

**Both failures return the identical message.** Tempting to write "User not
found" and "Wrong password" — much friendlier. But that difference lets an
attacker test emails one at a time and build a list of who has an account, which
is valuable for phishing and password-stuffing. Same message for both, always.

**`redirect()` sits outside the `try/catch`.** This one is genuinely surprising.
`redirect()` works by *throwing an exception* that the framework catches. If you
call it inside a `try`, your own `catch (error)` grabs it first and helpfully
converts your redirect into an error message. Next's own docs call this out under
`redirect` → Behavior. So the structure is:

```ts
try {
  // ...everything, including setting the cookie
} catch (error) {
  return { error: error.message };
}

redirect("/");   // outside — nothing after this line runs
```

### Logout

`logoutUser()` deletes the cookie and redirects to `/login`. Deleting the cookie
is genuinely all it takes — no cookie means no token, and no token means
`getCurrentUser()` returns `null`.

---

## Part 6 — The header bug

This was the interesting one. Login worked, the cookie was set — but the header
still showed "Log In" instead of your avatar until you manually refreshed.

### The first attempt, and why it failed

My initial version made `Header` a client component that read the user with
`useEffect`:

```tsx
useEffect(() => {
    setUser(getUser());
}, []);          // ← empty dependency array = "run once, on mount"
```

`Header` is rendered inside `app/layout.tsx`, the root layout. And **layouts in
the App Router deliberately preserve state across navigation** — that's a feature,
not a bug. It's how a video keeps playing or a sidebar keeps its scroll position
while you click between pages.

So when login finished and called `router.push("/")`, the root layout was *not*
rebuilt. `Header` stayed mounted the whole time. Its "run once, on mount" effect
had already run — back when you first loaded `/login` and were logged out — and
mount never happened again. It happily kept its original answer of `null`
forever. A hard refresh worked because that genuinely remounts everything.

### Your suggestion, and the precise reason it wouldn't work

You asked: why not extract the login-button/avatar into its own `"use client"`
component so it updates itself?

Reasonable instinct, but it wouldn't have fixed this. The problem was never
server-vs-client — it was that **the component instance never unmounts.** A
smaller `<UserMenu>` client component would still sit inside the root layout,
still stay mounted across the navigation, and still have a `useEffect` with an
empty dependency array that fires exactly once. Same bug, smaller file.

The thing worth taking away: `"use client"` doesn't mean "re-runs on
navigation." It means "ships to the browser and can hold state." An empty-dep
effect is tied to **mount**, and mount is precisely what wasn't happening again.

Your idea does work with one more piece — lifting the state up. An `AuthProvider`
in the layout holding `user` in `useState`, `UserMenu` reading it via a hook, and
the login page calling `setUser(...)` on success. Now it's a *state change*
rather than a mount, so React re-renders immediately. That's a legitimate design
and it's noted in [What's still missing](#whats-still-missing) as an option.

### The fix we used

Make the header read auth **on the server** instead:

**`lib/auth.ts`** — a `getCurrentUser()` function that reads the token cookie and
verifies it, returning `null` if it's missing, expired, or tampered with. It
starts with `import "server-only"`, which makes it a *build error* if a client
component ever imports it by mistake — a guard rail so your `JWT_SECRET` can
never accidentally be bundled into browser code.

**`app/components/Header.tsx`** — back to a server component. No `"use client"`,
no `useState`, no `useEffect`:

```tsx
const Header = async () => {
    const user = await getCurrentUser();
    return ( ...  {!user ? <LogInButton/> : <Avatar/>} ... );
};
```

Two nice consequences: the DaisyUI dropdown is pure CSS so it needs no JavaScript
at all, and the logout button became a plain `<form action={logoutUser}>` — a
server action submitted straight from a server component, no click handler needed.

**`revalidatePath("/", "layout")`** in the login action is the piece that ties it
together. It tells Next "the root layout's data is stale, rebuild it," so the
header re-renders with the new cookie as part of the redirect. Without it you'd
risk the client router reusing its cached copy of the old layout.

### What was thrown away, and why

The first attempt also stored a **second, JavaScript-readable cookie** holding
your username and email, so client code could read it. That's gone. The reason:
a cookie the browser's JavaScript can read is a cookie the *user* can edit in
devtools in about four seconds. Harmless while it only paints an avatar — but the
first time you write `if (user.isAdmin)` against it, you've handed out admin to
anyone who can open devtools.

Now username and email come from the **signed** JWT, verified on the server. One
source of truth, and it can't be forged without your secret.

### The tradeoff, stated honestly

Calling `cookies()` in the layout opts every page into **dynamic rendering** —
Next can no longer pre-build them as static HTML, because the output depends on
who's asking. That's a genuine performance cost, and it's the price of a
server-rendered logged-in header. For an app with a personalised header on every
page it's the normal trade; the client-provider approach above is what you'd
reach for if you wanted the pages to stay static.

### How we verified it

Rather than typing a password into your form, the fix was tested by generating a
valid token with your `JWT_SECRET` and requesting the page with it:

```
logged out            → "Log In"
with a token cookie   → avatar, "Shanks1", "Logout"
```

Same page, same code, different cookie. That proves the server is reading the
cookie and branching correctly.

---

## File-by-file reference

| File | What happened |
|---|---|
| `models/userModel.js` | Fixed `passsword` → `password` |
| `dbconfig/dbconfig.ts` | Rewritten: removed two bad imports, added `await`, added reconnect guard, removed `process.exit()` |
| `app/api/users/signup/route.ts` | `await connectDB()` moved inside handler; input validation; password hash no longer returned; email verification removed; returns `201` |
| `app/action/index.ts` | **New.** `loginUser()` and `logoutUser()` server actions |
| `lib/auth.ts` | **New.** Server-only `getCurrentUser()` — reads and verifies the token cookie |
| `app/components/Header.tsx` | Now an async server component; conditional Log In button vs avatar dropdown; logout via form action |
| `app/login/page.tsx` | Added `name` attributes to inputs, submit handler, loading state, error display |
| `app/signup/page.tsx` | Fixed API URL, moved `onSubmit` to the form, added loading state and error display |
| `README.md` | Untouched |
| `helpers/mailer.ts` | Untouched — parked until you have a domain |

---

## Setup requirements

`.env` in the project root (already present, and `.gitignore`d — keep it that way):

```
MONGO_URI=your_mongodb_connection_string
JWT_SECRET=a_long_random_string
MAILTRAP_TOKEN=your_mailtrap_token
```

`JWT_SECRET` should be long and random. Generate one with:

```bash
node -e "console.log(require('crypto').randomBytes(32).toString('hex'))"
```

If this secret ever leaks, anyone can forge a login token for any user. If you
change it, every existing token becomes invalid and all users are logged out —
which is also the emergency fix if you ever suspect it's been exposed.

Dependency added:

```bash
npm install jsonwebtoken
npm install --save-dev @types/jsonwebtoken
```

---

## What's still missing

Roughly in the order I'd tackle them.

**1. Nothing protects your routes.** This is the important one. `/dashboard` and
`/applications` are still reachable by anyone with the URL — the header only
*hides* the links. Hiding a link is decoration, not security. You need a check
that actually runs before those pages render.

One gotcha waiting for you there: Next's middleware runs on the **Edge runtime**,
which doesn't include Node's crypto module, so `jsonwebtoken` won't work in it.
Use the `jose` library for middleware instead. `getCurrentUser()` will keep
working fine inside pages and server components either way.

**2. Delete the dead login route.** `app/api/users/login/route.ts` still has a
`POST` handler that duplicates what the server action does. Two login paths means
two places to keep in sync, and one of them will eventually be forgotten. Pick
the server action and delete the route.

**3. Password rules.** Right now `123456` is an acceptable password. Enforce a
minimum length on both the form and the server — always the server too, since
anyone can bypass your form and call the endpoint directly.

**4. Email verification.** Everything's parked and ready: generate a random
token at signup, save it to `verifyToken` with an expiry in `verifyTokenExpiry`,
email the link, and flip `isVerified` when it's clicked.

**5. Forgot-password flow.** Your login page already links to
`/forgot-password`, which doesn't exist yet. Same mechanism as verification,
using the `forgotPasswordToken` fields.

**6. Optionally, the client provider.** If you later want the header to update
without a server round-trip — or want your pages to stay statically rendered —
that's the `AuthProvider` pattern from Part 6. About 30 lines. The server-side
`getCurrentUser()` stays regardless, because authorization decisions have to
happen on the server.

**7. Storing user data (your jobs question).** For tracking which jobs each user
applied to, use a **separate collection** with a `userId` reference rather than an
array inside the user document. Documents have a 16 MB ceiling and grow-forever
arrays get slow, plus a separate collection lets you ask questions in both
directions — "which jobs did this user apply to" *and* "who applied to this job."
An embedded array can only answer the first.
