## Listen To More

**Listen To More** is a music discovery platform designed to help you explore albums, learn about artists, and find your next favorite listen. Search for any album or artist to get detailed information, streaming links across all platforms, and AI-generated summaries. Connect your Last.fm account to view personalized listening statistics, or link your Discogs collection to manage your physical music library. The platform integrates with Spotify for album data, Last.fm for scrobbling and recommendations, Discogs for collection tracking, and OpenAI for intelligent summaries. A companion Discord bot lets you quickly share album details and streaming links in any server.

Created by [Rian van der Merwe](https://elezea.com/).

## Discord Bot

If you are part of a Discord server where you share music with each other, the companion Discord Bot lets you easily generate streaming links (and other information) for albums. You can **[add it to your server here](https://discord.com/oauth2/authorize?client_id=1284593290947068024)**.

### List of commands:

| Command       | Description                                                                                                                                                       |
| ------------- | ----------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| `/listento`   | Enter an album and artist, get streaming links for all platforms as well as a link to more details about the album.                                               |
| `/listenurl`  | The same as `/listento`, but enter a streaming URL from any platform (Spotify, Apple Music, etc.).                                                                |
| `/listenlast` | Enter your Last.fm username, get the same details for the last album you listened to.                                                                             |
| `/whois`      | One-sentence summary of an artist.                                                                                                                                |
| `/whatis`     | Two-sentence summary of a musical genre, with a link to history, artists, and albums to check out.                                                                |
| `/ask`        | An excuse to play with prompting and open-source AI models, this is gives you short answers to your most pressing questions, using Rick Ruben as the personality. |

As an example, the `/listento`, `listenurl`, and `/listenlast` commands show details like this:

![](https://file.elezea.com/20241006-diqSo8zX-2x.png)

## Nerdy details

The site uses APIs from Last.fm, Spotify, OpenAI, and Perplexity to get album and artist data, and generate some interesting facts about it all. It is built on [Cloudflare](https://cloudflare.com/) products, including [Pages](https://pages.cloudflare.com/), [Workers](https://workers.cloudflare.com/), [Workers AI](https://ai.cloudflare.com/), and [Workers KV](https://www.cloudflare.com/developer-platform/workers-kv/). It's a wonderful set of tools to work with—and I'm not just saying that because [I work there](https://elezea.com/portfolio/).

If you want to chat about this project, feel free to [reach out](https://elezea.com/contact/)! And if you spot any bugs (there are lots!) or have any ideas for things to add, please [submit an issue on GitHub](https://github.com/rianvdm/my-music-next/issues).
