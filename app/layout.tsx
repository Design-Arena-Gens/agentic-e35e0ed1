import "./globals.css";
import { ReactNode } from "react";

export const metadata = {
  title: "Jarvis AI ? Emotional Voice Companion",
  description: "Futuristic voice companion with memory and automation.",
};

export default function RootLayout({ children }: { children: ReactNode }) {
  return (
    <html lang="en">
      <body className="min-h-screen antialiased selection:bg-hud-pulse/40 selection:text-white">
        {children}
      </body>
    </html>
  );
}
