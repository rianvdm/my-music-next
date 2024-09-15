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

                    // Respond immediately to prevent Discord timeout (within 3 seconds)
                    const initialResponse = new Response(
                        JSON.stringify({
                            type: 5, // Acknowledge the interaction and mark it as deferred
                        }),
                        { headers: { 'Content-Type': 'application/json' } }
                    );

                    // Asynchronously fetch album info and send follow-up message
                    context.waitUntil(handleAlbumInfo(env, interaction, album, artist));

                    return initialResponse;
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

// Function to handle album info retrieval and send follow-up message
async function handleAlbumInfo(env, interaction, album, artist) {
    try {
        // Fetch album info from Spotify
        const spotifyQuery = `album: "${album}" artist:"${artist}"`;
        const spotifyResponse = await env.SPOTIFY_SERVICE.fetch(
            `https://api-spotify-search.rian-db8.workers.dev/?q=${encodeURIComponent(spotifyQuery)}&type=album`
        );
        const spotifyData = await spotifyResponse.json();

        if (!spotifyData.data || spotifyData.data.length === 0) {
            await sendFollowUp(env.DISCORD_APPLICATION_ID, interaction.token, "Album not found on Spotify.");
            return;
        }

        const spotifyAlbum = spotifyData.data[0];
        const releaseYear = spotifyAlbum.releaseDate ? spotifyAlbum.releaseDate.split('-')[0] : 'Unknown';

        // Fetch song link info from SongLink
        const songLinkResponse = await env.SONGLINK_SERVICE.fetch(
            `https://api-songlink.rian-db8.workers.dev/?url=${encodeURIComponent(spotifyAlbum.url)}`
        );
        const songLinkData = await songLinkResponse.json();

		console.log("Spotify Album Data:", spotifyAlbum);
		console.log("SongLink Data:", songLinkData);

        // Handle undefined URLs and provide fallback
        const streamingUrls = {
            spotify: spotifyAlbum.url ? `[Link](${spotifyAlbum.url})` : 'Not available',
            appleMusic: songLinkData.appleUrl ? `[Link](${songLinkData.appleUrl})` : 'Not available',
            youtube: songLinkData.youtubeUrl ? `[Link](${songLinkData.youtubeUrl})` : 'Not available',
            songLink: songLinkData.pageUrl ? `[Link](${songLinkData.pageUrl})` : 'Not available',
        };



        // Send a follow-up response with album info
        await sendFollowUp(env.DISCORD_APPLICATION_ID, interaction.token, {
            content: `**Album:** ${spotifyAlbum.name} by ${spotifyAlbum.artist}, released in ${releaseYear}\n**Spotify:** ${streamingUrls.spotify}\n**Apple Music:** ${streamingUrls.appleMusic}\n**YouTube:** ${streamingUrls.youtube}\n**SongLink:** ${streamingUrls.songLink}`,
            embeds: [
                {
                    title: `${spotifyAlbum.name} by ${spotifyAlbum.artist}`,
                    url: songLinkData.pageUrl || spotifyAlbum.url,
                    description: `Release Year: ${releaseYear}`,
                    image: {
                        url: spotifyAlbum.image || 'https://file.elezea.com/noun-no-image.png', // Placeholder image if no image
                    },
                    footer: {
                        text: 'Data from Spotify and SongLink',
                    },
                },
            ],
        });
    } catch (error) {
        console.error("Error occurred while processing the interaction:", error);
        await sendFollowUp(env.DISCORD_APPLICATION_ID, interaction.token, "An error occurred while fetching the album details.");
    }
}

// Helper function to send follow-up messages to Discord
async function sendFollowUp(applicationId, token, messageContent) {
		const response = await fetch(`https://discord.com/api/v10/webhooks/${applicationId}/${token}`, {
		    method: 'POST',
		    headers: {
		        'Content-Type': 'application/json',
		    },
		    body: JSON.stringify({
		        content: messageContent.content,
		        embeds: messageContent.embeds,
		    }),
		});

		if (!response.ok) {
		    const errorBody = await response.text();
		    console.error(`Failed to send follow-up message: ${response.statusText}. Response body: ${errorBody}`);
}
}

// Function to register the `/listento` command
async function registerCommands(env) {
    const discordApiUrl = `https://discord.com/api/v10/applications/${env.DISCORD_APPLICATION_ID}/commands`;

    const commandBody = {
        name: 'listento',
        description: 'Get details about an album by artist',
        type: 1, // Slash command
        options: [
            {
                name: 'album',
                description: 'The name of the album',
                type: 3, // STRING
                required: true,
            },
            {
                name: 'artist',
                description: 'The name of the artist',
                type: 3, // STRING
                required: true,
            },
        ],
    };

    const response = await fetch(discordApiUrl, {
        method: 'POST',
        headers: {
            'Authorization': `Bot ${env.DISCORD_TOKEN}`,
            'Content-Type': 'application/json',
        },
        body: JSON.stringify(commandBody),
    });

    if (!response.ok) {
        const error = await response.text();
        throw new Error(`Failed to register commands: ${response.statusText}. Response: ${error}`);
    }

    console.log('Command registered successfully');
}