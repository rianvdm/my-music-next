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
        <meta charSet="UTF-8" />
        <meta httpEquiv="X-UA-Compatible" content="IE=edge" />
        <meta name="viewport" content="width=device-width, initial-scale=1.0" />
        <meta name="author" content="Rian van der Merwe" />
        <link rel="shortcut icon" type="image/png" href="/images/favicon.ico" />
        <link rel="apple-touch-icon" sizes="180x180" href="/images/apple-touch-icon.png" />
        <link rel="icon" type="image/png" sizes="32x32" href="/images/favicon-32x32.png" />
        <link rel="icon" type="image/png" sizes="16x16" href="/images/favicon-16x16.png" />

      </head>
      <body className={inter.className}>
        <NavBar />
        {children}
        <div className="footer">
          <p>
            <a href="https://youtu.be/cNtprycno14?t=9036" target="_blank">
              There’s a fire that’s been burning right outside my door.
            </a>
          </p>
        </div>
      </body>
    </html>
  );
}