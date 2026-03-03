import type { Metadata } from "next";
import "./globals.css";

export const metadata: Metadata = {
  metadataBase: new URL("https://orepa.lk"),
  title: "Old Royalists' Engineering Professionals' Association (OREPA)",
  description: "The home of engineers who once walked the halls of Royal College, Colombo 7",
  openGraph: {
    locale: "en_US",
    type: "website",
    url: "https://orepa.lk/",
    siteName: "Old Royalists' Engineering Professionals' Association (OREPA)",
    title: "Old Royalists' Engineering Professionals' Association (OREPA)",
    description: "The home of engineers who once walked the halls of Royal College, Colombo 7",
    images: [{ url: "/images/opengraph-image.jpg", width: 1080, height: 567 }],
  },
  twitter: {
    card: "summary_large_image",
    title: "Old Royalists' Engineering Professionals' Association (OREPA)",
    description: "The home of engineers who once walked the halls of Royal College, Colombo 7",
    images: ["/images/opengraph-image.jpg"],
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
