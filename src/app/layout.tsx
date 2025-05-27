import type { Metadata } from "next";
import "./globals.css";

export const metadata: Metadata = {
  title: "User Story Generator",
  description: "AI Agent-based Intelligent Requirements Analysis and Story Generation Platform",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en">
      <body className="antialiased">
        {children}
      </body>
    </html>
  );
}
