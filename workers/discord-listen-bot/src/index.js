import nacl from 'tweetnacl';

export default {
    async fetch(request, env, context) {
        try {
            const url = new URL(request.url);

            if (url.pathname === '/discord-interaction') {
                const signature = request.headers.get('X-Signature-Ed25519');
                const timestamp = request.headers.get('X-Signature-Timestamp');
                const body = await request.text(); // Read the raw text body for signature verification

                // Validate the signature
                if (!verifySignature(signature, timestamp, body, env.DISCORD_PUBLIC_KEY)) {
                    return new Response('Invalid request signature', { status: 401 });
                }

                const interaction = JSON.parse(body); // Parse the body as JSON after verifying the signature

                // Handle 'listento' command
                if (interaction.type === 2 && interaction.data.name === 'listento') {
                    const album = interaction.data.options.find(opt => opt.name === 'album').value;
                    const artist = interaction.data.options.find(opt => opt.name === 'artist').value;

                    console.log('Received listento command');
                    console.log('Fetching album info for:', album, 'by artist:', artist);

                    // Acknowledge the interaction immediately with an ephemeral message
                    const response = respondWithEphemeralMessage("Fetching album details...");

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
            // Send an ephemeral error message to the user
            await sendFollowUpMessage(env.DISCORD_APPLICATION_ID, interaction.token, {
                content: "I couldn't find this album. Bad robot.",
                flags: 64, // Ephemeral flag
            });
            return;
        }

        const spotifyAlbum = spotifyData.data[0];
        const releaseYear = spotifyAlbum.releaseDate ? spotifyAlbum.releaseDate.split('-')[0] : 'Unknown';

        // Create custom URL
        const formattedArtist = spotifyAlbum.artist
            .replace(/\s+/g, '-') // Replace spaces with hyphens
            .replace(/&/g, 'and') // Replace & with "and"
            .toLowerCase();

        const formattedAlbum = spotifyAlbum.name
            .replace(/\s*\(.*?\)\s*/g, '') // Remove any text inside parentheses
            .replace(/\s+/g, '-') // Replace spaces with hyphens
            .replace(/&/g, 'and') // Replace & with "and"
            .toLowerCase();
        const customUrl = `https://listentomore.com/album/${formattedArtist}_${formattedAlbum}`;

        // Fetch song link info from SongLink
        const songLinkResponse = await env.SONGLINK_SERVICE.fetch(
            `https://api-songlink.rian-db8.workers.dev/?url=${encodeURIComponent(spotifyAlbum.url)}`
        );
        const songLinkData = await songLinkResponse.json();

        // Handle undefined URLs and provide fallback
        const streamingUrls = {
            songLink: songLinkData.pageUrl ? `[Listen](${songLinkData.pageUrl})` : 'n/a',
            spotify: spotifyAlbum.url ? `[Listen](${spotifyAlbum.url})` : 'n/a',
            appleMusic: songLinkData.appleUrl ? `[Listen](${songLinkData.appleUrl})` : 'n/a',
            youtube: songLinkData.youtubeUrl ? `[Listen](${songLinkData.youtubeUrl})` : 'n/a',
            deezer: songLinkData.deezerUrl ? `[Listen](${songLinkData.deezerUrl})` : 'n/a',
        };

        const sentenceResponse = await env.SENTENCE_SERVICE.fetch(
            `https://api-openai-artistsentence.rian-db8.workers.dev/?name=${encodeURIComponent(spotifyAlbum.artist)}`
        );
        const sentenceData = await sentenceResponse.json();

        // Ensure the artist sentence is available
        const artistSentence = sentenceData.data || "Artist sentence not available";

        // Fetch the user who invoked the command
        const username = interaction.member.user.username;

        // Send a new public message with album info (visible to everyone)
        await sendNewMessage(env.DISCORD_TOKEN, interaction.channel_id, {
            content: `**${username}** thinks you should listen to **${spotifyAlbum.name}** by **${spotifyAlbum.artist}** (${releaseYear})\n**Spotify:** ${streamingUrls.spotify}\n**Apple Music:** ${streamingUrls.appleMusic}\n**Deezer:** ${streamingUrls.deezer}\n**Songlink:** ${streamingUrls.songLink}`,
            embeds: [
                {
                    title: `${spotifyAlbum.name} by ${spotifyAlbum.artist}`,
                    url: customUrl,
                    description: `${artistSentence}`,
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
            flags: 64, // Ephemeral flag for errors
        });
    } finally {
        // Delete the initial "thinking" message
        await deleteInitialResponse(env.DISCORD_APPLICATION_ID, interaction.token);
    }
}


// Helper function to send a new message to the channel
async function sendNewMessage(botToken, channelId, messageContent) {
    const response = await fetch(`https://discord.com/api/v10/channels/${channelId}/messages`, {
        method: 'POST',
        headers: {
            'Authorization': `Bot ${botToken}`,
            'Content-Type': 'application/json',
        },
        body: JSON.stringify(messageContent),
    });

    if (!response.ok) {
        const errorBody = await response.text();
        console.error(`Failed to send new message: ${response.statusText}. Response body: ${errorBody}`);
    }
}

// Helper function to send follow-up messages to Discord
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

// Helper function to respond with an ephemeral message (only visible to the user)
function respondWithEphemeralMessage(message) {
    return new Response(JSON.stringify({
        type: 4,
        data: {
            content: message,
            flags: 64, // Ephemeral flag
        },
    }), { headers: { 'Content-Type': 'application/json' } });
}

// Helper function to delete the initial response
async function deleteInitialResponse(applicationId, token) {
    const response = await fetch(`https://discord.com/api/v10/webhooks/${applicationId}/${token}/messages/@original`, {
        method: 'DELETE',
    });

    if (!response.ok) {
        console.error(`Failed to delete initial response: ${response.statusText}`);
    }
}

// Helper function to verify the request signature
function verifySignature(signature, timestamp, body, publicKey) {
    const message = new TextEncoder().encode(timestamp + body);
    const signatureUint8 = hexToUint8(signature);
    const publicKeyUint8 = hexToUint8(publicKey);

    return nacl.sign.detached.verify(message, signatureUint8, publicKeyUint8);
}

// Helper function to convert a hex string to Uint8Array
function hexToUint8(hex) {
    const arr = new Uint8Array(hex.length / 2);
    for (let i = 0; i < hex.length; i += 2) {
        arr[i / 2] = parseInt(hex.substr(i, 2), 16);
    }
    return arr;
}

// Function to register the `/listento` command
// async function registerCommands(env) {
//     const discordApiUrl = `https://discord.com/api/v10/applications/${env.DISCORD_APPLICATION_ID}/commands`;

//     const commandBody = {
//         name: 'listento',
//         description: 'Get details about an album by artist',
//         type: 1, // Slash command
//         options: [
//             {
//                 name: 'album',
//                 description: 'The name of the album',
//                 type: 3, // STRING
//                 required: true,
//             },
//             {
//                 name: 'artist',
//                 description: 'The name of the artist',
//                 type: 3, // STRING
//                 required: true,
//             },
//         ],
//     };

//     const response = await fetch(discordApiUrl, {
//         method: 'POST',
//         headers: {
//             'Authorization': `Bot ${env.DISCORD_TOKEN}`,
//             'Content-Type': 'application/json',
//         },
//         body: JSON.stringify(commandBody),
//     });

//     if (!response.ok) {
//         const error = await response.text();
//         throw new Error(`Failed to register commands: ${response.statusText}. Response: ${error}`);
//     }

//     console.log('Command registered successfully');
// }
