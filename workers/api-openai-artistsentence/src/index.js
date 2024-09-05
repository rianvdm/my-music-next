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
            let artistSentence = await env.ARTIST_SENTENCE.get(artistName);
            if (artistSentence) {
                console.log(`Returning cached summary for ${artistName}`);
                return new Response(JSON.stringify({ data: artistSentence }), {
                    status: 200,
                    headers: {
                        'Content-Type': 'application/json',
                        'Access-Control-Allow-Origin': '*',
                    },
                });
            }

            // If not found in KV, generate it using OpenAI
            const prompt = `Write a one-sentence summary about the artist ${artistName}. Include their genres and similar artists. Start the sentence with He/She/They is/was/are/were, as appropriate."`;
            const max_tokens = 50;

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
            artistSentence = openAIJsonResponse.choices[0].message.content;

            // Set expiration for 6 months (180 days)
            const sixMonthsInSeconds = 180 * 24 * 60 * 60;

            // Store the new summary in KV for future requests with expiration
            await env.ARTIST_SENTENCE.put(artistName, artistSentence, { expirationTtl: sixMonthsInSeconds });

            // Return the artist summary
            return new Response(JSON.stringify({ data: artistSentence }), {
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