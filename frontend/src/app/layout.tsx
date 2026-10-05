import type { Metadata } from "next";
import "./globals.css";

export const metadata: Metadata = {
  title: "AEGIS Mine Rescue — 3D Digital Twin MVP (SIH 2026)",
  description: "AI-Powered Underground Mine Safety, Monitoring and Rescue System Digital Twin",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en" className="dark">
      <body className="h-screen w-screen overflow-hidden bg-[#050811] font-mono text-slate-100 antialiased">
        {children}
      </body>
    </html>
  );
}
