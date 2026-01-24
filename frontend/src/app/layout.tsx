import type { Metadata } from "next";
import "./globals.css";

export const metadata: Metadata = {
  title: "CENTURY Official Website",
  description: "One of One",
  openGraph: {
    locale: "en_US",
    type: "website",
    title: "CENTURY Official Website",
    description: "One of One",
    images: ["/images/ogp.jpg"],
  },
  twitter: {
    card: "summary_large_image",
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
