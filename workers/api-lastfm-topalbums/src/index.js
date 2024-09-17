export default {
    async scheduled(event, env, ctx) {
        const apiKey = env.LASTFM_API_KEY;
        const username = env.LASTFM_USERNAME;

        try {
            // Fetch top albums from Last.fm API
            const response = await fetch(`https://ws.audioscrobbler.com/2.0/?method=user.gettopalbums&user=${username}&api_key=${apiKey}&period=7day&limit=6&format=json`);
            const data = await response.json();

            const backupImageUrl = 'https://file.elezea.com/noun-no-image.png';

            // Map the top albums data to a simplified structure
            const topAlbums = data.topalbums?.album?.map(album => ({
                artist: album.artist.name,
                artistUrl: album.artist.url,
                name: album.name,
                playcount: parseInt(album.playcount, 10),
                albumUrl: album.url,
                image: album.image?.find(img => img.size === 'extralarge')?.['#text'] || backupImageUrl // Use backup image if none found
            })) || [];

            // Convert the data to a JSON string for storage
            const topAlbumsString = JSON.stringify(topAlbums);

            // Save the top albums data in the TOP_ALBUMS KV store, replacing the existing data
            await env.TOP_ALBUMS.put('topAlbums', topAlbumsString);

            console.log('Top albums data saved successfully.');
        } catch (error) {
            console.error(`Error fetching or saving top albums: ${error.message}`);
        }
    }
};