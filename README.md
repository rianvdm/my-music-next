### Hello 👋

My name is [Rian van der Merwe](https://elezea.com/) and this site started as a side project about the music I listen to, but then I got obsessed with it and now it's a whole lot more. The home page pulls data from [my Last.fm activity](https://www.last.fm/user/bordesak), and then it gets ✨enhanced✨ via APIs from Spotify, ChatGPT, and Perplexity. It has expanded to a full-fledged artist and album database. Have fun. Use the site to find information about an artist or album, and find your next favorite listen.

The site is built on [Cloudflare](https://cloudflare.com/) products, including [Pages](https://pages.cloudflare.com/), [Workers](https://workers.cloudflare.com/), and [Workers KV](https://www.cloudflare.com/developer-platform/workers-kv/). It's a wonderful set of tools to work with—and I'm not just saying that because [I work there](https://elezea.com/portfolio/).

If you want to chat about this project, feel free to [reach out](https://elezea.com/contact/)! And if you spot any bugs (there are lots!) or have any ideas for things to add, please [submit an issue on GitHub](https://github.com/rianvdm/my-music-next/issues).

## Discord Bot

I also have a Beta of a Discord Bot that lets you get streaming links for albums. You can [add it to your server here](https://discord.com/oauth2/authorize?client_id=1284593290947068024).

The `/listento` command gets details like this:

![](https://file.elezea.com/20240921-aoapEQAq-2x.png)

You can also use `/listennow` to get your most recent album from Last.fm:

![](https://file.elezea.com/20240921-NwqTUNLY-2x.png)

And finally (for now), the command `/whois` will give you a short description of an artist:

![](https://file.elezea.com/20240921-jgL6zFnS-2x.png)

If you'd like to test it out in your server, you can [install the bot here](https://discord.com/oauth2/authorize?client_id=1284593290947068024).