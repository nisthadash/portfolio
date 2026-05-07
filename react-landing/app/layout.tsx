import type { Metadata } from "next"
import "./globals.css"

import { DM_Sans, Instrument_Serif, Plus_Jakarta_Sans } from "next/font/google"

const dmSans = DM_Sans({
  subsets: ["latin"],
  weight: ["300", "400"],
  variable: "--font-dm",
})

const instrumentSerif = Instrument_Serif({
  subsets: ["latin"],
  weight: ["400"],
  variable: "--font-instrument",
})

const plusJakarta = Plus_Jakarta_Sans({
  subsets: ["latin"],
  weight: ["400", "600", "700", "800"],
  variable: "--font-plus",
})

export const metadata: Metadata = {
  title: "Nistha — Portfolio",
  description: "Landing page",
}

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="en" className={`${dmSans.variable} ${instrumentSerif.variable} ${plusJakarta.variable}`}>
      <body className="bg-black text-white antialiased">{children}</body>
    </html>
  )
}

