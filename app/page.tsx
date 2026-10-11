import Link from "next/link";
import FlameLogo from "@/components/FlameLogo";
import { getCurrentProfile } from "@/lib/auth";

const SECTIONS = [
  { href: "/resources", title: "Resources", text: "Browse the library, or submit something useful." },
  { href: "/ask", title: "Ask the Hub", text: "Ask a question. Answers come only from our resources." },
  { href: "/games", title: "Games", text: "Small games built by the Fire group." },
];

export default async function HomePage() {
  const profile = await getCurrentProfile();

  return (
    <main className="mx-auto flex w-full max-w-5xl flex-1 flex-col gap-8 px-6 py-12">
      <div className="flex items-center gap-3">
        <FlameLogo size={40} />
        <h1 className="text-3xl font-bold">
          Welcome{profile ? `, ${profile.display_name}` : ""}!
        </h1>
      </div>

      <div className="grid gap-4 sm:grid-cols-3">
        {SECTIONS.map((section) => (
          <Link key={section.href} href={section.href} className="card hover:border-accent">
            <h2 className="mb-1 text-lg font-semibold text-foreground">{section.title}</h2>
            <p className="text-sm text-muted">{section.text}</p>
          </Link>
        ))}
      </div>
    </main>
  );
}
