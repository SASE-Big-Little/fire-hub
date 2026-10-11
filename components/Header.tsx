import Link from "next/link";
import { signOut } from "@/app/sign-in/actions";
import FlameLogo from "./FlameLogo";
import type { Profile } from "@/lib/auth";

// Add a link here when you add a new page to the menu.
const NAV_LINKS = [
  { href: "/resources", label: "Resources" },
  { href: "/ask", label: "Ask the Hub" },
  { href: "/games", label: "Games" },
];

export default function Header({ profile }: { profile: Profile }) {
  return (
    <header className="border-b border-border bg-surface">
      <div className="mx-auto flex max-w-5xl flex-wrap items-center gap-x-6 gap-y-2 px-6 py-3">
        <Link href="/" className="flex items-center gap-2 font-bold text-foreground">
          <FlameLogo />
          Fire Hub
        </Link>

        <nav className="flex flex-wrap gap-4 text-sm">
          {NAV_LINKS.map((link) => (
            <Link key={link.href} href={link.href} className="text-foreground hover:text-accent">
              {link.label}
            </Link>
          ))}
          {profile.role === "admin" && (
            <Link href="/admin" className="text-highlight hover:text-accent">
              Admin
            </Link>
          )}
        </nav>

        <div className="ml-auto flex items-center gap-3 text-sm">
          <span>
            {profile.display_name}{" "}
            <span className="text-muted">({profile.username})</span>
          </span>
          <form action={signOut}>
            <button type="submit" className="btn-secondary">
              Sign out
            </button>
          </form>
        </div>
      </div>
    </header>
  );
}
