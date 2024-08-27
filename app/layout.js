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
        <meta charset="UTF-8" />
        <meta http-equiv="X-UA-Compatible" content="IE=edge" />
        <meta name="viewport" content="width=device-width, initial-scale=1.0" />
        <meta name="author" content="Rian van der Merwe" />
        <link rel="shortcut icon" type="image/png" href="/images/favicon.ico" />
        <link rel="apple-touch-icon" sizes="180x180" href="/images/apple-touch-icon.png" />
        <link rel="icon" type="image/png" sizes="32x32" href="/images/favicon-32x32.png" />
        <link rel="icon" type="image/png" sizes="16x16" href="/images/favicon-16x16.png" />

        {/* HTML Meta Tags */}
        <meta name="title" content="Rian’s Music" />
        <meta name="description" content="Real-time listening data and music recommendations." />

        {/* Open Graph / Facebook Meta Tags */}
        <meta property="og:url" content="https://music.rianvdm.com/" />
        <meta property="og:type" content="website" />
        <meta property="og:title" content="Rian's music" />
        <meta property="og:description" content="Real-time listening data and music recommendations." />
        <meta property="og:image" content="https://files.elezea.com/alberto-bigoni-4-DeS5a-hAM-unsplash.jpg" />

        {/* Twitter Meta Tags */}
        <meta name="twitter:card" content="summary_large_image" />
        <meta property="twitter:domain" content="music.rianvdm.com" />
        <meta property="twitter:url" content="https://music.rianvdm.com/" />
        <meta name="twitter:title" content="Rian's music" />
        <meta name="twitter:description" content="Real-time listening data and music recommendations." />
        <meta name="twitter:image" content="https://files.elezea.com/alberto-bigoni-4-DeS5a-hAM-unsplash.jpg" />
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