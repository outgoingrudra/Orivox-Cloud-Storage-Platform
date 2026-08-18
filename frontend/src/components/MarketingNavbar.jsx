import Link from "next/link";

import {
  Cloud,
} from "lucide-react";

import ThemeSwitcher from "./ThemeSwitcher";

export default function MarketingNavbar() {
  return (
    <header
      className="
        sticky
        top-0
        z-40
        border-b
        border-base-300/60
        bg-base-100/80
        backdrop-blur-xl
      "
    >
      <div
        className="
          mx-auto
          flex
          h-16
          max-w-7xl
          items-center
          justify-between
          px-5
          lg:px-8
        "
      >
        <Link
          href="/"
          className="flex items-center gap-2"
        >
          <div
            className="
              flex
              h-9
              w-9
              items-center
              justify-center
              rounded-xl
              bg-base-content
              text-base-100
            "
          >
            <Cloud size={20} />
          </div>

          <span className="text-xl font-bold tracking-tight">
            Orivox
          </span>
        </Link>

        <nav className="hidden items-center gap-8 md:flex">
          <a
            href="#features"
            className="text-sm font-medium opacity-70 transition hover:opacity-100"
          >
            Features
          </a>

          <a
            href="#security"
            className="text-sm font-medium opacity-70 transition hover:opacity-100"
          >
            Security
          </a>

          <a
            href="#about"
            className="text-sm font-medium opacity-70 transition hover:opacity-100"
          >
            About
          </a>
        </nav>

        <div className="flex items-center gap-2">
          <ThemeSwitcher />

          <Link
            href="/login"
            className="btn btn-ghost btn-sm hidden sm:inline-flex"
          >
            Sign in
          </Link>

          <Link
            href="/register"
            className="btn btn-neutral btn-sm rounded-xl px-5"
          >
            Get Started
          </Link>
        </div>
      </div>
    </header>
  );
}