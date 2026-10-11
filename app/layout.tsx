import type { Metadata } from "next";
import Header from "@/components/Header";
import { getCurrentProfile } from "@/lib/auth";
import "./globals.css";

export const metadata: Metadata = {
  title: "Fire Hub",
  description: "Shared resources, Ask the Hub, and games for the Fire group.",
};

export default async function RootLayout({ children }: LayoutProps<"/">) {
  // null when signed out (then proxy.ts only lets you see /sign-in).
  const profile = await getCurrentProfile();

  return (
    <html lang="en" className="h-full antialiased">
      <body className="flex min-h-full flex-col">
        {profile && <Header profile={profile} />}
        {children}
      </body>
    </html>
  );
}
