import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "AnimeKai API",
  description: "AnimeKai REST API — Next.js edition",
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="en">
      <body>{children}</body>
    </html>
  );
}