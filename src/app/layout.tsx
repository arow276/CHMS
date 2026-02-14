import type { Metadata } from "next";
import "./globals.css";

export const metadata: Metadata = {
  title: "Shepherd — Church Relationship System",
  description:
    "People, not paperwork. Relationships, not records. The first church relationship system that feels like talking to an executive assistant.",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en">
      <body className="antialiased">{children}</body>
    </html>
  );
}
