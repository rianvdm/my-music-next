export default {
    async fetch(request, env) {
        try {
            const url = new URL(request.url);
            const artistName = url.searchParams.get('artist')?.toLowerCase();
            const albumName = url.searchParams.get('album')?.toLowerCase();
            const access_token = env.PERPLEXITY_API_TOKEN;

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
            let albumSummary = await env.ALBUM_SUMMARIES_P.get(kvKey);
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

            // If not found in KV, generate it using Perplexity API
            const prompt = `I’m listening to “${albumName}” by ${artistName} for the first time. Provide a 2-3 paragraph summary of the album's history, genre/style, cultural significance (if any), and critical reception.`;

            console.log("Getting new summary from Perplexity API");
            const perplexityResponse = await fetch("https://api.perplexity.ai/chat/completions", {
                method: "POST",
                headers: {
                    "Content-Type": "application/json",
                    Authorization: `Bearer ${access_token}`,
                },
                body: JSON.stringify({
                    model: "llama-3.1-sonar-small-128k-online",
                    messages: [
                        { role: "system", content: "You use succinct, plain language focused on accuracy and professionalism." },
                        { role: "user", content: prompt }
                    ],
                    max_tokens: 800,
                    return_citations: true,
                }),
            });

            // If the response is not successful, log more details and return an error
            if (!perplexityResponse.ok) {
                const errorText = await perplexityResponse.text();
                console.error(`Perplexity API error: ${perplexityResponse.status} ${perplexityResponse.statusText}`);
                console.error(`Error details: ${errorText}`);
                return new Response(JSON.stringify({ error: `Failed to fetch from Perplexity API: ${perplexityResponse.statusText}`, details: errorText }), {
                    status: perplexityResponse.status,
                    headers: {
                        'Content-Type': 'application/json',
                        'Access-Control-Allow-Origin': '*',
                    },
                });
            }

            // Parse the response JSON
            const perplexityJsonResponse = await perplexityResponse.json();
            albumSummary = perplexityJsonResponse.choices[0].message.content;

            // Set expiration for days * hours * minutes * seconds
            const expiration = 60 * 24 * 60 * 60;

            // Store the new summary in KV for future requests with expiration
            await env.ALBUM_SUMMARIES_P.put(kvKey, albumSummary, { expirationTtl: expiration });

            // Return the album summary
            return new Response(JSON.stringify({ data: albumSummary }), {
                status: 200,
                headers: {
                    'Content-Type': 'application/json',
                    'Access-Control-Allow-Origin': '*',
                },
            });
        } catch (error) {
            console.error(`Unexpected error: ${error.message}`);
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