export default function AboutPage() {
  return (
    <div>
      <h1>About Rian’s Music</h1>
        <h3>Hello 👋</h3>
          <p>My name is <a href="https://elezea.com">Rian van der Merwe</a> and this is a side project about the music I listen to. It pulls data from <a href="https://www.last.fm/user/bordesak">my Last.fm activity</a> and then I <em>do stuff</em> with it. It's a work in progress.</p>
          <p>The site is built on Cloudflare's wonderful <a href="https://pages.cloudflare.com/">Pages</a> and <a href="https://workers.cloudflare.com/">Workers</a> products. And I'm not just saying that because I work there.</p>
            <div className="footer">
                <p><a href="https://youtu.be/cNtprycno14?t=9036">There’s a fire that’s been burning right outside my door.</a></p>
            </div>
    </div>
  );
}