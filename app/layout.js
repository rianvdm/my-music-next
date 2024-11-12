export const runtime = 'edge';

import { Inter } from "next/font/google";
import "./globals.css";
import NavBar from './navbar';
import { headers } from 'next/headers';

const inter = Inter({ subsets: ["latin"] });

export async function generateMetadata() {
  const headersList = headers();
  const pathname = headersList.get('x-invoke-path') || '';

  // Check if the current path is for an album or artist
  if (pathname.startsWith('/album/') || pathname.startsWith('/artist/') || pathname.startsWith('/recommendations')) {
    // Return an empty object to use the specific metadata defined in those pages
    return {};
  }

  // Default metadata for other pages
  return {
    title: "Listen To More",
    description: "Learn some trivia, dig deep into an artist or album, find your next listen.",
    openGraph: {
      title: "Listen To More",
      description: "Learn some trivia, dig deep into an artist or album, find your next listen.",
      url: "https://listentomore.com/",
      siteName: "Listen To More",
      images: [
        {
          url: "https://file.elezea.com/listen_to_more_card2.png",
          width: 1200,
          height: 630,
        },
      ],
      locale: "en_US",
      type: "website",
    },
    twitter: {
      card: "summary_large_image",
      title: "Listen To More",
      description: "Learn some trivia, dig deep into an artist or album, find your next listen.",
      images: ["https://file.elezea.com/listen_to_more_card2.png"],
    },
  };
}

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
        <link rel="me" href="https://github.com/rianvdm">
        <link rel="me" href="https://mastodon.social/@rianvdm">
      </head>
      <body className={inter.className}>
        <NavBar />
        {children}
        <div className="footer">
          <p>
            <a href="https://youtu.be/cNtprycno14?t=9036" target="_blank">
              There's a fire that's been burning right outside my door
            </a><br />
            <a href="https://github.com/rianvdm/my-music-next/issues" target="_blank">Submit a bug </a> | <a href="/privacy">Privacy</a> | <a href="/terms">Terms</a>
          </p>
        </div>
      </body>
    </html>
  );
}