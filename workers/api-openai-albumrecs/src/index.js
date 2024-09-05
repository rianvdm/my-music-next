export default {
    async fetch(request, env) {
        try {
            const url = new URL(request.url);
            const albumTitle = url.searchParams.get('album')?.toLowerCase();
            const artistName = url.searchParams.get('artist')?.toLowerCase();
            const access_token = env.OPENAI_API_TOKEN;

            // Validate track title and artist name
            if (!albumTitle || !artistName || albumTitle.trim().length === 0 || artistName.trim().length === 0) {
                return new Response(JSON.stringify({ error: "Album title and artist name are required" }), {
                    status: 400,
                    headers: {
                        'Content-Type': 'application/json',
                        'Access-Control-Allow-Origin': '*',
                    },
                });
            }

            // Generate a new track summary using OpenAI
            const prompt = `I enjoyed the album "${albumTitle}" by "${artistName}". What are 2-3 other albums I should listen to if I enjoy that genre and style? Avoid albums that are very popular and mainstream, instead recommending what could be considered "hidden gems". If you don't have verifiable information about the album being asked about, inform the user that the album name is not valid.`;
            const max_tokens = 400;

            console.log("Getting summary from OpenAI");
            const openAIResponse = await fetch("https://api.openai.com/v1/chat/completions", {
                method: "POST",
                headers: {
                    "Content-Type": "application/json",
                    Authorization: `Bearer ${access_token}`,
                },
                body: JSON.stringify({
                    model: "gpt-4o",
                    messages: [
                        { role: "system", content: "You use conversational, plain language. You use proper paragraph spacing and bold artist, album, and track names. Do not make up albums that don't exist, only use verifiable information." },
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
            const trackSummary = openAIJsonResponse.choices[0].message.content;

            // Return the track summary directly without storing it
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