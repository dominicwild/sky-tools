import type {Metadata} from "next";
import {Nunito} from "next/font/google";
import "./globals.css";

export const metadata: Metadata = {
  title: "Sky Quest Tracker",
};

const nunito = Nunito({
    variable: "--font-nunito",
    subsets: ["latin"]
})

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en">
      <body
        className={`${nunito.variable} antialiased min-h-screen`}
      >
        {children}
      </body>
    </html>
  );
}
