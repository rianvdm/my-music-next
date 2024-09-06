export const runtime = 'edge';

export default function AboutPage() {
  return (
    <div>
      <h1>About Rian’s Music</h1>
        <h3>Hello 👋</h3>
          <p>My name is <a href="https://elezea.com">Rian van der Merwe</a> and this is a side project about the music I listen to. It pulls data from <a href="https://www.last.fm/user/bordesak">my Last.fm activity</a> and <a href="https://www.discogs.com/user/elezea-records/collection">Discogs collection</a>,  and then I ✨enhance✨ the data using the APIs for Spotify, ChatGPT, and Perplexity. Like most side projects, it's always a work in progress.</p>
          <p>The site is built on <a href="https://cloudflare.com">Cloudflare</a> products, including <a href="https://pages.cloudflare.com/">Pages</a>, <a href="https://workers.cloudflare.com/">Workers</a>, and <a href="https://www.cloudflare.com/developer-platform/workers-kv/">Workers KV</a>.  It's a wonderful set of tools to work with—and I'm not just saying that because <a href="https://elezea.com/portfolio/">I work there</a>.</p>
          <p>If you want to chat about this project, feel free to <a href="https://elezea.com/contact/">reach out</a>!</p>
    </div>
  );
}