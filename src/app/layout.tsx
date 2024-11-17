import type { Metadata } from "next";
import localFont from "next/font/local";
import "./globals.css";

const Cheltenham = localFont({
  src: [
    {
      path: './fonts/CheltenhamStdLight.woff',
      weight: '300',
      style: 'normal',
    },
    {
      path: './fonts/CheltenhamStdLightItalic.woff',
      weight: '300',
      style: 'italic',
    },
    {
      path: './fonts/CheltenhamStdBook.woff',
      weight: '400',
      style: 'normal',
    },
    {
      path: './fonts/CheltenhamStdBookItalic.woff', 
      weight: '400',
      style: 'italic',
    },
    {
      path: './fonts/CheltenhamStdBold.woff',
      weight: '700', 
      style: 'normal',
    },
    {
      path: './fonts/CheltenhamStdBoldItalic.woff',
      weight: '700',
      style: 'italic',
    },
    {
      path: './fonts/CheltenhamStdUltra.woff',
      weight: '900',
      style: 'normal',
    },
    {
      path: './fonts/CheltenhamStdUltraItalic.woff',
      weight: '900',
      style: 'italic',
    }
  ],
  variable: '--font-cheltenham',
});


export const metadata: Metadata = {
  title: "Ahnopologetic Blog",
  description: "IMHO, my worldview, and a few other things",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en">
      <body
        className={`${Cheltenham.variable} antialiased`}
      >
        {children}
      </body>
    </html>
  );
}
