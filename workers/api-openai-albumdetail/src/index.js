export default {
    async fetch(request, env) {
        try {
            const url = new URL(request.url);
            const artistName = url.searchParams.get('artist')?.toLowerCase();
            const albumName = url.searchParams.get('album')?.toLowerCase();
            const access_token = env.OPENAI_API_TOKEN;

            // Validate artist and album name
            if (!artistName || !albumName) {
                return new Response(JSON.stringify({ error: "Artist and Album name are required" }), {
                    status: 400,
                    headers: {
                        'Content-Type': 'application/json',
                        'Access-Control-Allow-Origin': '*',
                    },
                });
            }

            // Create a unique key by combining artistName and albumName
            const kvKey = `${encodeURIComponent(artistName)}_${encodeURIComponent(albumName)}`;

            // Check if the album summary is already in the KV store
            let albumSummary = await env.ALBUM_SUMMARIES.get(kvKey);
            if (albumSummary) {
                console.log(`Returning cached summary for ${artistName} - ${albumName}`);
                return new Response(JSON.stringify({ data: albumSummary }), {
                    status: 200,
                    headers: {
                        'Content-Type': 'application/json',
                        'Access-Control-Allow-Origin': '*',
                    },
                });
            }

            // If not found in KV, generate it using OpenAI
            const prompt = `I’m listening to “${albumName}” by “${artistName}” for the first time. Give me a two paragraph summary of the history, genre/style, cultural significance (if any), what I should pay attention to, and critical reception of the album. If the album doesn’t have enough credible references to provide a factual summary, simply say: "I don't have any information about this album."`;
            const max_tokens = 500;

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
            albumSummary = openAIJsonResponse.choices[0].message.content;

            // Set expiration for 6 months (180 days)
            const sixMonthsInSeconds = 180 * 24 * 60 * 60;

            // Store the new summary in KV for future requests with expiration
            await env.ALBUM_SUMMARIES.put(kvKey, albumSummary, { expirationTtl: sixMonthsInSeconds });

            // Return the album summary
            return new Response(JSON.stringify({ data: albumSummary }), {
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
}