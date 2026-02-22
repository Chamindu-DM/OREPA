import type { Metadata } from "next";
import "./globals.css";

export const metadata: Metadata = {
  metadataBase: new URL(process.env.NEXT_PUBLIC_BASE_URL || "https://orepa.vercel.app"),
  title: "Old Royalists' Engineering Professionals' Association (OREPA)",
  description: "The home of engineers who once walked the halls of Royal College, Colombo 7",
  openGraph: {
    locale: "en_US",
    type: "website",
    title: "Old Royalists' Engineering Professionals' Association (OREPA)",
    description: "The home of engineers who once walked the halls of Royal College, Colombo 7",
    images: [
      {
        url: "/images/hero.png",
        width: 1200,
        height: 630,
        alt: "OREPA - Old Royalists' Engineering Professionals' Association",
      },
    ],
  },
  twitter: {
    card: "summary_large_image",
    title: "Old Royalists' Engineering Professionals' Association (OREPA)",
    description: "The home of engineers who once walked the halls of Royal College, Colombo 7",
    images: ["/images/hero.png"],
  },
  icons: {
    icon: "/Orepa_logo_h.ico",
  },
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en">
      <body>{children}</body>
    </html>
  );
}
