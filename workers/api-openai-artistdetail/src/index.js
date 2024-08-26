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

            // Set prompt and tokens
            const prompt = `Write a summary to help someone decide if they might like the artist ${artistName}. Include verifiable facts about the artist’s history, genres, and styles. Write no more than two paragraphs.`;
            const max_tokens = 300;

            // Fetch the summary from OpenAI API
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
            const artistSummary = openAIJsonResponse.choices[0].message.content;

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