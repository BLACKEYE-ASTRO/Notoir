  import type { Metadata } from "next";
  import Providers from "./providers";
  import "./globals.css";

  export const metadata: Metadata = {
    title: "Notoir — Your personal workspace",
    description: "A simple, Notion-inspired rich-text notes app.",
  };

  export default function RootLayout({
    children,
  }: Readonly<{
    children: React.ReactNode;
  }>) {
    return (
      <html lang="en">
        <body className="min-h-screen bg-white antialiased">
          <Providers>{children}</Providers>
        </body>
      </html>
    );
  }