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

                    // Asynchronously fetch the album info and send a follow-up message
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
        // Fetch album info from the other worker
        const albumInfoResponse = await env.TOKEN_SERVICE.fetch(
            `https://api-lastfm-albumdetail.rian-db8.workers.dev/?album=${encodeURIComponent(album)}&artist=${encodeURIComponent(artist)}`
        );

        if (!albumInfoResponse.ok) {
            console.error("Failed to fetch album info:", albumInfoResponse.statusText);
            await sendFollowUp(env.DISCORD_APPLICATION_ID, interaction.token, "Failed to fetch album details.");
            return;
        }

        const albumInfo = await albumInfoResponse.json();
        console.log("Album info fetched successfully:", albumInfo);

        // Check if the album info contains the necessary data
        if (!albumInfo.name || !albumInfo.artist || !albumInfo.url) {
            console.error('Invalid album info:', albumInfo);
            await sendFollowUp(env.DISCORD_APPLICATION_ID, interaction.token, "Failed to fetch valid album details.");
            return;
        }

        // Send a follow-up response with album info
        await sendFollowUp(env.DISCORD_APPLICATION_ID, interaction.token, albumInfo);
    } catch (error) {
        console.error("Error occurred while processing the interaction:", error);
        await sendFollowUp(env.DISCORD_APPLICATION_ID, interaction.token, "An error occurred while fetching the album details.");
    }
}

// Helper function to send follow-up messages to Discord
async function sendFollowUp(applicationId, token, albumInfo) {
    // Ensure the token is correctly passed from the interaction response
    if (!token) {
        console.error('Token is missing.');
        return;
    }

    const tags = Array.isArray(albumInfo.tags) ? albumInfo.tags.join(', ') : 'No tags available';
    const bio = albumInfo.bio ? albumInfo.bio.substring(0, 2048) : 'No biography available';

    const response = await fetch(`https://discord.com/api/v10/webhooks/${applicationId}/${token}`, {
        method: 'POST',
        headers: {
            'Content-Type': 'application/json',
        },
        body: JSON.stringify({
            content: `**Album:** ${albumInfo.name}\n**Artist:** ${albumInfo.artist}\n**Playcount:** ${albumInfo.userplaycount}\n**Tags:** ${tags}\n`,
            embeds: [
                {
                    title: albumInfo.name,
                    url: albumInfo.url,
                    description: bio,
                    image: {
                        url: albumInfo.image,
                    },
                    footer: {
                        text: 'Data from Last.fm',
                    },
                },
            ],
        }),
    });

    if (!response.ok) {
        console.error(`Failed to send follow-up message: ${response.statusText}`);
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