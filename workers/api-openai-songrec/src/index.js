export default {
    async fetch(request, env) {
        try {
            const url = new URL(request.url);
            const trackTitle = url.searchParams.get('title')?.toLowerCase();
            const artistName = url.searchParams.get('artist')?.toLowerCase();
            const access_token = env.OPENAI_API_TOKEN;

            // Validate track title and artist name
            if (!trackTitle || !artistName || trackTitle.trim().length === 0 || artistName.trim().length === 0) {
                return new Response(JSON.stringify({ error: "Track title and artist name are required" }), {
                    status: 400,
                    headers: {
                        'Content-Type': 'application/json',
                        'Access-Control-Allow-Origin': '*',
                    },
                });
            }

            // Construct the key for the KV store using both track title and artist name
            const trackKey = `${encodeURIComponent(trackTitle)}_${encodeURIComponent(artistName)}`;

            // Check if the track summary is already in the KV store
            let trackSummary = await env.TRACK_SUMMARY.get(trackKey);
            if (trackSummary) {
                console.log(`Returning cached summary for ${trackTitle} by ${artistName}`);
                return new Response(JSON.stringify({ data: trackSummary }), {
                    status: 200,
                    headers: {
                        'Content-Type': 'application/json',
                        'Access-Control-Allow-Origin': '*',
                    },
                });
            }

            // Fetch all keys in the KV store
            const keyList = await env.TRACK_SUMMARY.list();

            // If there are more than 12 entries, delete the oldest ones
            if (keyList.keys.length >= 12) {
                // Sort the keys by creation date (assuming metadata.timestamp is available)
                keyList.keys.sort((a, b) => new Date(a.metadata.timestamp) - new Date(b.metadata.timestamp));
                
                // Delete the oldest entries until only 11 remain (making space for the new one)
                const keysToDelete = keyList.keys.slice(0, keyList.keys.length - 11);
                await Promise.all(keysToDelete.map(key => env.TRACK_SUMMARY.delete(key.name)));
            }

            // If not found in KV, generate it using OpenAI
            const prompt = `Write one sentence to help me decide if I want to listen to the song "${trackTitle}" by "${artistName}". Include genres, styles, and the general vibe.`;
            const max_tokens = 60;

            console.log("Getting new summary from OpenAI");
            const openAIResponse = await fetch("https://api.openai.com/v1/chat/completions", {
                method: "POST",
                headers: {
                    "Content-Type": "application/json",
                    Authorization: `Bearer ${access_token}`,
                },
                body: JSON.stringify({
                    model: "gpt-4o",
                    messages: [
                        { role: "system", content: "You use succinct, plain language focused on accuracy and professionalism." },
                        { role: "user", content: prompt }
                    ],
                    max_tokens: max_tokens,
                    n: 1,
                    temperature: 1,
                }),
            });

            // If the response is not successful, return an error
            if (!openAIResponse.ok) {
                return new Response(JSON.stringify({ error: `Failed to fetch from OpenAI API: ${openAIResponse.statusText}` }), {
                    status: openAIResponse.status,
                    headers: {
                        'Content-Type': 'application/json',
                        'Access-Control-Allow-Origin': '*',
                    },
                });
            }

            // Parse the response JSON
            const openAIJsonResponse = await openAIResponse.json();
            trackSummary = openAIJsonResponse.choices[0].message.content;

            // Add timestamp to metadata
            const metadata = {
                timestamp: new Date().toISOString(),
            };

            // Set expiration for 6 months (180 days)
            const sixMonthsInSeconds = 180 * 24 * 60 * 60;

            // Store the new summary in KV with expiration and metadata
            await env.TRACK_SUMMARY.put(trackKey, trackSummary, { expirationTtl: sixMonthsInSeconds, metadata });

            // Return the track summary
            return new Response(JSON.stringify({ data: trackSummary }), {
                status: 200,
                headers: {
                    'Content-Type': 'application/json',
                    'Access-Control-Allow-Origin': '*',
                },
            });
        } catch (error) {
            // If an error occurs, return a 500 status code and error message
            return new Response(JSON.stringify({ error: error.message }), {
                status: 500,
                headers: {
                    'Content-Type': 'application/json',
                    'Access-Control-Allow-Origin': '*',
                },
            });
        }
    }
};