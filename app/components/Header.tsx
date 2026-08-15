import Link from "next/link";
import Darkmode from "./Darkmode";
import { getCurrentUser } from "@/lib/auth";
import { logoutUser } from "@/app/action";

const Header = async () => {
    const user = await getCurrentUser();

    return (
        <header className="sticky top-0 z-50 border-b border-border/60 bg-background/80 backdrop-blur-xl">
            <div className="mx-auto flex h-16 max-w-7xl items-center justify-between px-6">

                {/* Logo */}
                <Link
                    href="/"
                    className="text-2xl font-extrabold hero-gradient tracking-tight"
                >
                    JobSearch AI
                </Link>

                {/* Navigation */}
                <nav className="hidden items-center gap-8 md:flex">
                    <Link
                        href="/jobs"
                        className="text-sm font-medium text-muted-foreground transition-colors hover:text-foreground"
                    >
                        Jobs
                    </Link>

                    <Link
                        href="/dashboard"
                        className="text-sm font-medium text-muted-foreground transition-colors hover:text-foreground"
                    >
                        Dashboard
                    </Link>

                    <Link
                        href="/upload?reset=true"
                        className="text-sm font-medium text-muted-foreground transition-colors hover:text-foreground"
                    >
                        Resume
                    </Link>

                    <Link
                        href="/about"
                        className="text-sm font-medium text-muted-foreground transition-colors hover:text-foreground"
                    >
                        About
                    </Link>
                </nav>

                {/* Right Section */}
                <div className="flex items-center gap-4">

                    <Darkmode />

                    {!user ? (
                        <Link
                            href="/login"
                            className="btn bg-transparent text-muted-foreground rounded-xl shadow-lg hover:scale-105 transition-all duration-300"
                        >
                            Log In
                        </Link>
                    ) : (
                        <div className="dropdown dropdown-end">

                            <div
                                tabIndex={0}
                                role="button"
                                className="avatar cursor-pointer transition-transform hover:scale-105"
                            >
                                <div className="w-10 rounded-full ring ring-primary ring-offset-2 ring-offset-background">
                                    <img
                                        alt={user.username}
                                        src={`https://api.dicebear.com/9.x/initials/svg?seed=${encodeURIComponent(user.username)}`}
                                    />
                                </div>
                            </div>

                            <ul
                                tabIndex={-1}
                                className="menu dropdown-content mt-3 w-56 rounded-2xl border border-border bg-card p-2 shadow-xl"
                            >
                                <li className="menu-title">
                                    <span>{user.username}</span>
                                </li>

                                <li>
                                    <Link href="/profile">Profile</Link>
                                </li>

                                <li>
                                    <Link href="/settings">Settings</Link>
                                </li>

                                <li>
                                    <Link href="/applications">Applications</Link>
                                </li>

                                <div className="my-2 border-t border-border" />

                                <li>
                                    <form action={logoutUser}>
                                        <button type="submit" className="text-red-500 w-full text-left">
                                            Logout
                                        </button>
                                    </form>
                                </li>
                            </ul>
                        </div>
                    )}
                </div>

            </div>
        </header>
    );
};

export default Header;
