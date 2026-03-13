import type { Metadata } from "next";
import "./globals.css";

export const metadata: Metadata = {
  title: "Projectant Management",
  description: "Project management for mentors and students",
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="en" className="dark">
      <body className="bg-[#020617] text-slate-100 antialiased">
        <div className="min-h-screen bg-gradient-to-b from-[#020617] via-[#020617] to-[#020617]">
          {children}
        </div>
      </body>
    </html>
  );
}
