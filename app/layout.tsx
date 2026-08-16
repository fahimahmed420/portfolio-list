import type { Metadata } from "next";
import {
  Inter,
  Press_Start_2P,
  VT323,
  JetBrains_Mono,
  Fraunces,
} from "next/font/google";
import "./globals.css";

/* Each design opts into one of these via a CSS variable. Self-hosted by
   next/font at build time — no runtime requests to Google. */
const inter = Inter({
  subsets: ["latin"],
  variable: "--font-inter",
  display: "swap",
});

const pressStart = Press_Start_2P({
  subsets: ["latin"],
  weight: "400",
  variable: "--font-press-start",
  display: "swap",
});

const vt323 = VT323({
  subsets: ["latin"],
  weight: "400",
  variable: "--font-vt323",
  display: "swap",
});

const jetbrains = JetBrains_Mono({
  subsets: ["latin"],
  variable: "--font-jetbrains",
  display: "swap",
});

const fraunces = Fraunces({
  subsets: ["latin"],
  variable: "--font-fraunces",
  display: "swap",
});

export const metadata: Metadata = {
  title: {
    default: "Portfolio Designs",
    template: "%s — Portfolio Designs",
  },
  description:
    "A collection of reusable portfolio designs, each driven by a single shared content file. All content shown is placeholder data.",
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html
      lang="en"
      className={`${inter.variable} ${pressStart.variable} ${vt323.variable} ${jetbrains.variable} ${fraunces.variable}`}
    >
      <body>{children}</body>
    </html>
  );
}
