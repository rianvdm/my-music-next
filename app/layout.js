import { Inter } from "next/font/google";
import "./globals.css";

const inter = Inter({ subsets: ["latin"] });

export const metadata = {
  title: "Rian’s Music",
  description: "Tracking my Last.fm music listening habits.",
};

export default function RootLayout({ children }) {
  return (
    <html lang="en">
      <head>
        <link rel="icon" href="images/favicon.ico" />
      </head>
      <body className={inter.className}>{children}</body>
    </html>
  );
}