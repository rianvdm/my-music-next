import { Inter } from "next/font/google";
import "./globals.css";
import NavBar from './navbar';

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
      <body className={inter.className}>
        <NavBar />
        {children}
        <div className="footer">
          <p>
            <a href="https://youtu.be/cNtprycno14?t=9036">
              There’s a fire that’s been burning right outside my door.
            </a>
          </p>
        </div>
      </body>
    </html>
  );
}