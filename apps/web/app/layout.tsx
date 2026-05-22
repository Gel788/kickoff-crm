import { AppToaster } from "@/components/kickoff/app-toaster";
import { PwaRegister } from "@/components/pwa-register";
import type { Metadata } from "next";
import { DM_Sans, JetBrains_Mono, Syne } from "next/font/google";
import "./globals.css";

const syne = Syne({
  subsets: ["latin", "latin-ext"],
  variable: "--font-syne",
  weight: ["600", "700", "800"],
});

const dmSans = DM_Sans({
  subsets: ["latin", "latin-ext"],
  variable: "--font-dm-sans",
  weight: ["400", "500", "600", "700"],
});

const jetbrains = JetBrains_Mono({
  subsets: ["latin", "cyrillic"],
  variable: "--font-jetbrains",
  weight: ["500", "600"],
});

export const metadata: Metadata = {
  title: "Kickoff — платформа лиги",
  description: "От заявки до протокола. Операционная система соревнований.",
  manifest: "/manifest.json",
  appleWebApp: { capable: true, title: "Kickoff" },
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="ru" className="dark">
      <body
        className={`${syne.variable} ${dmSans.variable} ${jetbrains.variable} min-h-screen`}
      >
        {children}
        <AppToaster />
        <PwaRegister />
      </body>
    </html>
  );
}
