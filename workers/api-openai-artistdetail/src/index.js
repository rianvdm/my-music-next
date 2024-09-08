export default {
    async fetch(request, env) {
        try {
            const url = new URL(request.url);
            const artistName = url.searchParams.get('name')?.toLowerCase();
            const access_token = env.OPENAI_API_TOKEN;

            // Validate artist name
            if (!artistName || artistName.trim().length === 0) {
                return new Response(JSON.stringify({ error: "Artist name is required" }), {
                    status: 400,
                    headers: {
                        'Content-Type': 'application/json',
                        'Access-Control-Allow-Origin': '*',
                    },
                });
            }

            // Check if the artist summary is already in the KV store
            let artistSummary = await env.ARTIST_SUMMARIES.get(artistName);
            if (artistSummary) {
                console.log(`Returning cached summary for ${artistName}`);
                return new Response(JSON.stringify({ data: artistSummary }), {
                    status: 200,
                    headers: {
                        'Content-Type': 'application/json',
                        'Access-Control-Allow-Origin': '*',
                    },
                });
            }

            // If not found in KV, generate it using OpenAI
            const prompt = `Write a summary of the artist ${artistName}. Include verifiable facts about the artist’s history, genres, and styles. Include one or two interesting facts about them (without stating that it's an interesting fact). Also recommend similar artists to check out if one likes their music. Write no more than two paragraphs. If no verifiable facts are available for the artist, don't make something up. Simply state "I don't have any information about this artist".`;
            const max_tokens = 300;

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
            artistSummary = openAIJsonResponse.choices[0].message.content;

            // Set expiration for 6 months (180 days)
            const sixMonthsInSeconds = 180 * 24 * 60 * 60;

            // Store the new summary in KV for future requests with expiration
            await env.ARTIST_SUMMARIES.put(artistName, artistSummary, { expirationTtl: sixMonthsInSeconds });

            // Return the artist summary
            return new Response(JSON.stringify({ data: artistSummary }), {
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