export default {
    async fetch(request, env, context) {
        try {
            const url = new URL(request.url);

            if (url.pathname === '/discord-interaction') {
                const interaction = await request.json();

                // Handle 'listento' command
                if (interaction.type === 2 && interaction.data.name === 'listento') {
                    const album = interaction.data.options.find(opt => opt.name === 'album').value;
                    const artist = interaction.data.options.find(opt => opt.name === 'artist').value;

                    console.log('Received listento command');
                    console.log('Fetching album info for:', album, 'by artist:', artist);

                    // Acknowledge the interaction immediately
                    const response = respondWithDeferredMessage();

                    // Handle the album info retrieval in the background
                    context.waitUntil(handleAlbumInfo(env, interaction, album, artist));

                    return response;
                }

                // Respond to PING interaction
                if (interaction.type === 1) {
                    return new Response(
                        JSON.stringify({ type: 1 }),
                        { headers: { 'Content-Type': 'application/json' } }
                    );
                }
            }

            // Fallback for unknown paths
            return new Response('Not Found', { status: 404 });
        } catch (error) {
            console.error('Error occurred:', error.message);
            return new Response(
                JSON.stringify({ error: error.message }),
                { headers: { 'Content-Type': 'application/json' }, status: 500 }
            );
        }
    }
};

// Function to handle album info retrieval and send response
async function handleAlbumInfo(env, interaction, album, artist) {
    try {
        // Fetch album info from Spotify
        const spotifyQuery = `album: "${album}" artist:"${artist}"`;
        const spotifyResponse = await env.SPOTIFY_SERVICE.fetch(
            `https://api-spotify-search.rian-db8.workers.dev/?q=${encodeURIComponent(spotifyQuery)}&type=album`
        );
        const spotifyData = await spotifyResponse.json();

        if (!spotifyData.data || spotifyData.data.length === 0) {
            await sendFollowUpMessage(env.DISCORD_APPLICATION_ID, interaction.token, {
                content: "Album not found on Spotify.",
                flags: 64 // Ephemeral flag
            });
            return;
        }

        const spotifyAlbum = spotifyData.data[0];
        const releaseYear = spotifyAlbum.releaseDate ? spotifyAlbum.releaseDate.split('-')[0] : 'Unknown';

        // Create custom URL
        const formattedArtist = spotifyAlbum.artist.replace(/\s+/g, '-').toLowerCase();
        const formattedAlbum = spotifyAlbum.name.replace(/\s+/g, '-').toLowerCase();
        const customUrl = `https://listentomore.com/album/${formattedArtist}_${formattedAlbum}`;

        // Fetch song link info from SongLink
        const songLinkResponse = await env.SONGLINK_SERVICE.fetch(
            `https://api-songlink.rian-db8.workers.dev/?url=${encodeURIComponent(spotifyAlbum.url)}`
        );
        const songLinkData = await songLinkResponse.json();

		console.log("Spotify Album Data:", spotifyAlbum);
		console.log("SongLink Data:", songLinkData);

        // Handle undefined URLs and provide fallback
        const streamingUrls = {
            spotify: spotifyAlbum.url ? `[Listen](${spotifyAlbum.url})` : 'Not available',
            appleMusic: songLinkData.appleUrl ? `[Listen](${songLinkData.appleUrl})` : 'Not available',
            youtube: songLinkData.youtubeUrl ? `[Listen](${songLinkData.youtubeUrl})` : 'Not available',
            songLink: songLinkData.pageUrl ? `[Listen](${songLinkData.pageUrl})` : 'Not available',
        };

        // Send a follow-up message with album info
        await sendFollowUpMessage(env.DISCORD_APPLICATION_ID, interaction.token, {
            content: `**${spotifyAlbum.name}** by **${spotifyAlbum.artist}** (${releaseYear})\n**Spotify:** ${streamingUrls.spotify}\n**Apple Music:** ${streamingUrls.appleMusic}\n**YouTube:** ${streamingUrls.youtube}\n**Other:** ${streamingUrls.songLink}`,
            embeds: [
                {
                    title: `${spotifyAlbum.name} by ${spotifyAlbum.artist}`,
                    url: customUrl,
                    description: `Click through for more details about this album.`,
                    thumbnail: {
                        url: spotifyAlbum.image || 'https://file.elezea.com/noun-no-image.png',
                    },
                },
            ],
        });
    } catch (error) {
        console.error("Error occurred while processing the interaction:", error);
        await sendFollowUpMessage(env.DISCORD_APPLICATION_ID, interaction.token, {
            content: "An error occurred while fetching the album details.",
            flags: 64, // Ephemeral flag
        });
    }
}

// Helper function to respond with a deferred message
function respondWithDeferredMessage() {
    return new Response(JSON.stringify({
        type: 5, // Deferred response
    }), { headers: { 'Content-Type': 'application/json' } });
}

// Helper function to send a follow-up message
async function sendFollowUpMessage(applicationId, token, messageContent) {
    const response = await fetch(`https://discord.com/api/v10/webhooks/${applicationId}/${token}`, {
        method: 'POST',
        headers: {
            'Content-Type': 'application/json',
        },
        body: JSON.stringify(messageContent),
    });

    if (!response.ok) {
        const errorBody = await response.text();
        console.error(`Failed to send follow-up message: ${response.statusText}. Response body: ${errorBody}`);
    }
}

// Helper function to respond with an ephemeral message
function respondWithEphemeralMessage(message) {
    return new Response(JSON.stringify({
        type: 4,
        data: {
            content: message,
            flags: 64,
        },
    }), { headers: { 'Content-Type': 'application/json' } });
}

// Helper function to respond with a regular message
function respondWithMessage(messageContent) {
    return new Response(JSON.stringify({
        type: 4,
        data: messageContent,
    }), { headers: { 'Content-Type': 'application/json' } });
}