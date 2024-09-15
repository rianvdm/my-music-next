export default {
    async fetch(request, env, ctx) {
        const apiKey = env.LASTFM_API_KEY;
        const username = env.LASTFM_USERNAME;

        const response = await fetch(`https://ws.audioscrobbler.com/2.0/?method=user.gettopalbums&user=${username}&api_key=${apiKey}&period=7day&limit=6&format=json`);
        const data = await response.json();

        const backupImageUrl = 'https://file.elezea.com/noun-no-image.png';

        const topAlbums = data.topalbums?.album?.map(album => ({
            artist: album.artist.name,
            artistUrl: album.artist.url,
            name: album.name,
            playcount: parseInt(album.playcount, 10),
            albumUrl: album.url,
            image: album.image?.find(img => img.size === 'extralarge')?.['#text'] || backupImageUrl // Use backup image if none found
        })) || [];

        return new Response(JSON.stringify(topAlbums), {
            headers: {
                'Content-Type': 'application/json',
                'Access-Control-Allow-Origin': '*',
            },
        });
    }
}