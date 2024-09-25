### Hello 👋

My name is [Rian van der Merwe](https://elezea.com/) and this site started as a side project about the music I listen to, but then I got obsessed with it and now it's a whole lot more. The home page pulls data from [my Last.fm activity](https://www.last.fm/user/bordesak), and then it gets ✨enhanced✨ via APIs from Spotify, ChatGPT, and Perplexity. It has since expanded into a full-fledged artist and album database. Use the site to find information about an artist or album, and find your next favorite listen.

## Discord Bot

There is also a Discord Bot that lets you easily generate get streaming links (and other information) for albums. You can [add it to your server here](https://discord.com/oauth2/authorize?client_id=1284593290947068024).

### Current commands:

| Command        | Description                                                                                                          |
|----------------|----------------------------------------------------------------------------------------------------------------------|
| `/listento`    | Lets you enter an album and artist, and then it gets you streaming links for all platforms as well as a link to more details about the album. |
| `/listenurl`   | Does the same, but you can just enter a streaming URL from any platform (Spotify, Apple Music, etc.)                 |
| `/listennow`   | Asks you to enter your Last.fm username, and then it gets the same details for the last album you listened to.       |
| `/whois`       | Gives you a one-sentence summary of an artist.                                                                      |


As an example, the `/listento`, `listenurl`, and `/listennow` commands shows details like this:

![](https://file.elezea.com/20240921-aoapEQAq-2x.png)

## Nerdy details

The site is built on [Cloudflare](https://cloudflare.com/) products, including [Pages](https://pages.cloudflare.com/), [Workers](https://workers.cloudflare.com/), and [Workers KV](https://www.cloudflare.com/developer-platform/workers-kv/). It's a wonderful set of tools to work with—and I'm not just saying that because [I work there](https://elezea.com/portfolio/).

If you want to chat about this project, feel free to [reach out](https://elezea.com/contact/)! And if you spot any bugs (there are lots!) or have any ideas for things to add, please [submit an issue on GitHub](https://github.com/rianvdm/my-music-next/issues).