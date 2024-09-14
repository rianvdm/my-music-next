export default {
    async fetch(request, env) {
        try {
            const url = new URL(request.url);
            const albumTitle = url.searchParams.get('album')?.toLowerCase();
            const artistName = url.searchParams.get('artist')?.toLowerCase();
            const access_token = env.PERPLEXITY_API_TOKEN;

            // Validate album title and artist name
            if (!albumTitle || !artistName || albumTitle.trim().length === 0 || artistName.trim().length === 0) {
                return new Response(JSON.stringify({ error: "Album title and artist name are required" }), {
                    status: 400,
                    headers: {
                        'Content-Type': 'application/json',
                        'Access-Control-Allow-Origin': '*',
                    },
                });
            }

            // Generate the recommendation prompt
            const prompt = `I enjoyed the album "${albumTitle}" by ${artistName}. What are 2-3 other albums I should listen to if I enjoy that genre and style? Avoid albums that are very popular and mainstream, instead recommending what could be considered "hidden gems". If you don't have verifiable information about the album being asked about, inform the user that the album name is not valid.

                Use Markdown for formatting. Add a link to each album that says "More info" and links to https://listentomore.com/album/<artist_name>_<album_name>. 
                - Use an underscore (_) to separate artist name and album name.
                - Replace spaces in both artist names and album names with hyphens (-).
                - Only use lowercase letters, no uppercase letters.
                - Make sure the artist name and album name are formatted as "<artist-name>_<album-name>" where spaces are replaced with hyphens and the artist and album names are separated by an underscore (_).`;

            console.log("Getting new recommendations from Perplexity API");
            const perplexityResponse = await fetch("https://api.perplexity.ai/chat/completions", {
                method: "POST",
                headers: {
                    "Content-Type": "application/json",
                    Authorization: `Bearer ${access_token}`,
                },
                body: JSON.stringify({
                    model: "llama-3.1-sonar-large-128k-online",
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
            const albumRecommendations = perplexityJsonResponse.choices[0].message.content;

            // Return the album summary
            return new Response(JSON.stringify({ data: albumRecommendations }), {
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
};