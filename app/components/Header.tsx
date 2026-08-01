import Image from "next/image";
import Link from "next/link";
import Darkmode from "./Darkmode";

const Header = () => {
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
                        href="/resume"
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

                    <Link
                        href="/signup"
                        className="btn btn-outline rounded-xl"
                    >
                        Sign up
                    </Link>

                    {/* <div className="dropdown dropdown-end">

                        <div
                            tabIndex={0}
                            role="button"
                            className="avatar cursor-pointer transition-transform hover:scale-105"
                        >
                            <div className="w-10 rounded-full ring ring-primary ring-offset-2 ring-offset-background">
                                <img
                                    alt="Tailwind CSS Navbar component"
                                    src="https://img.daisyui.com/images/stock/photo-1534528741775-53994a69daeb.webp" />
                                {/* <Image
                  src="https://img.daisyui.com/images/stock/photo-1534528741775-53994a69daeb.webp"
                  alt="Profile"
                  width={40}
                  height={40}
                /> */}

                            {/* </div>
                        </div> */}

                        {/* <ul
                            tabIndex={-1}
                            className="menu dropdown-content mt-3 w-56 rounded-2xl border border-border bg-card p-2 shadow-xl"
                        >
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
                                <button className="text-red-500">
                                    Logout
                                </button>
                            </li>
                        </ul> */} 

                    {/* </div> */}
                </div>

            </div>
        </header>
    );
};

export default Header;