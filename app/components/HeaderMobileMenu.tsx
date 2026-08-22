"use client";

import { useState } from "react";
import Link from "next/link";
import { Menu, X, Briefcase, FileSearch, Search, Info, LogIn, LogOut } from "lucide-react";
import { logoutUser } from "@/app/action";

type UserType = {
  username: string;
  email: string;
} | null;

interface HeaderMobileMenuProps {
  user: UserType;
}

export default function HeaderMobileMenu({ user }: HeaderMobileMenuProps) {
  const [isOpen, setIsOpen] = useState(false);

  const toggleMenu = () => setIsOpen(!isOpen);
  const closeMenu = () => setIsOpen(false);

  return (
    <div className="md:hidden flex items-center">
      {/* Hamburger / Close Button */}
      <button
        onClick={toggleMenu}
        type="button"
        className="rounded-xl p-2 text-muted-foreground hover:bg-accent hover:text-foreground transition-all duration-200"
        aria-label={isOpen ? "Close Menu" : "Open Menu"}
      >
        {isOpen ? <X className="h-6 w-6" /> : <Menu className="h-6 w-6" />}
      </button>

      {/* Mobile Menu Dropdown */}
      {isOpen && (
        <div className="absolute left-0 right-0 top-16 z-50 border-b border-border bg-background/95 p-6 shadow-2xl backdrop-blur-xl animate-in slide-in-from-top duration-200">
          <nav className="flex flex-col gap-5">
            <Link
              href="/dashboard"
              onClick={closeMenu}
              className="flex items-center gap-3 text-base font-semibold text-muted-foreground hover:text-foreground transition-colors py-2"
            >
              <Briefcase className="h-5 w-5 text-blue-500" />
              Dashboard
            </Link>

            <Link
              href="/applications"
              onClick={closeMenu}
              className="flex items-center gap-3 text-base font-semibold text-muted-foreground hover:text-foreground transition-colors py-2"
            >
              <FileSearch className="h-5 w-5 text-cyan-500" />
              Applications
            </Link>

            <Link
              href="/jobs"
              onClick={closeMenu}
              className="flex items-center gap-3 text-base font-semibold text-muted-foreground hover:text-foreground transition-colors py-2"
            >
              <Search className="h-5 w-5 text-sky-500" />
              Search
            </Link>

            <Link
              href="/about"
              onClick={closeMenu}
              className="flex items-center gap-3 text-base font-semibold text-muted-foreground hover:text-foreground transition-colors py-2"
            >
              <Info className="h-5 w-5 text-indigo-500" />
              About
            </Link>

            <div className="my-2 border-t border-border" />

            {/* Auth / User Info */}
            {!user ? (
              <Link
                href="/login"
                onClick={closeMenu}
                className="flex w-full items-center justify-center gap-2 rounded-xl bg-blue-500 py-3 font-semibold text-white shadow-lg transition-transform active:scale-95"
              >
                <LogIn className="h-4 w-4" />
                Log In
              </Link>
            ) : (
              <div className="space-y-4">
                <div className="flex items-center gap-3">
                  <div className="w-10 rounded-full ring ring-primary ring-offset-2 ring-offset-background overflow-hidden">
                    <img
                      alt={user.username}
                      src={`https://api.dicebear.com/9.x/initials/svg?seed=${encodeURIComponent(user.username)}`}
                      className="h-10 w-10"
                    />
                  </div>
                  <div className="min-w-0">
                    <p className="truncate text-sm font-bold text-foreground">
                      {user.username}
                    </p>
                    <p className="truncate text-xs text-muted-foreground">
                      {user.email}
                    </p>
                  </div>
                </div>

                <form action={logoutUser} onSubmit={closeMenu}>
                  <button
                    type="submit"
                    className="flex w-full items-center justify-center gap-2 rounded-xl border border-red-500/20 bg-red-500/10 py-3 font-semibold text-red-500 transition-colors hover:bg-red-500/20"
                  >
                    <LogOut className="h-4 w-4" />
                    Logout
                  </button>
                </form>
              </div>
            )}
          </nav>
        </div>
      )}
    </div>
  );
}
