import type { Metadata } from "next";
import "./globals.css";

export const metadata: Metadata = {
  title: "Old Royalists' Engineering Professionals' Association (OREPA)",
  description: "The unified platform for Royal College alumni in the engineering and technological sectors. Bridging the legacy of Reid Avenue with modern industry.",
  openGraph: {
    locale: "en_US",
    type: "website",
    title: "Old Royalists' Engineering Professionals' Association (OREPA)",
    description: "The unified platform for Royal College alumni in the engineering and technological sectors.",
    images: ["/images/hero.png"],
  },
  twitter: {
    card: "summary_large_image",
    title: "Old Royalists' Engineering Professionals' Association (OREPA)",
    description: "The unified platform for Royal College alumni in the engineering and technological sectors.",
    images: ["/images/hero.png"],
  },
  icons: {
    icon: "/favicon.ico",
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
