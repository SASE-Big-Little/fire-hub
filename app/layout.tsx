import type { Metadata } from "next";
import "./globals.css";

export const metadata: Metadata = {
  title: "Fire Hub",
  description: "Shared resources, Ask the Hub, and games for the Fire group.",
};

export default function RootLayout({ children }: LayoutProps<"/">) {
  return (
    <html lang="en" className="h-full antialiased">
      <body className="flex min-h-full flex-col">{children}</body>
    </html>
  );
}
