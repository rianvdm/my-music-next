export default {
    async fetch(request, env, ctx) {
        const apiKey = env.LASTFM_API_KEY;
        const username = env.LASTFM_USERNAME;

        const response = await fetch(`https://ws.audioscrobbler.com/2.0/?method=user.gettopartists&user=${username}&api_key=${apiKey}&period=7day&limit=6&format=json`);
        const data = await response.json();

        const topArtists = data.topartists.artist.map(artist => ({
            name: artist.name,
            playcount: artist.playcount,
            url: artist.url,
            mbid: artist.mbid,
        }));

        return new Response(JSON.stringify(topArtists), {
            headers: {
                'Content-Type': 'application/json',
                'Access-Control-Allow-Origin': '*',
            },
        });
    }
}
