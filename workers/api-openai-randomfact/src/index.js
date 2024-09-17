export default {
    // This will be triggered when a cron job runs
    async scheduled(event, env, context) {
        try {
            const keyList = await env.ARTIST_FACTS.list(); // List all keys in the KV store

            if (keyList.keys.length >= 10) {
                // Sort the keys by creation date (assuming metadata.timestamp is available)
                keyList.keys.sort((a, b) => new Date(a.metadata.timestamp) - new Date(b.metadata.timestamp));
                
                // Delete the oldest entries until only 9 remain
                const keysToDelete = keyList.keys.slice(0, keyList.keys.length - 9);
                await Promise.all(keysToDelete.map(key => env.ARTIST_FACTS.delete(key.name)));
            }

            // Generate a new fact using OpenAI
            const access_token = env.OPENAI_API_TOKEN;
            const genres = ['rock', 'pop', 'jazz', 'electronic', 'hip-hop', 'metal', 'alternative', 'singer-songwriter', 'blues', 'soul', 'punk'];
            const randomGenre = genres[Math.floor(Math.random() * genres.length)];
            const unit = ['musical artist', 'band', 'song'];
            const randomUnit = unit[Math.floor(Math.random() * unit.length)];
            const prompt = `Give me an interesting, verifiable fact about a ${randomGenre} ${randomUnit}. Use two sentences or less, and start with the phrase "Did you know".`;
            const max_tokens = 100;

            console.log(prompt);

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
                    temperature: 1.1,
                }),
            });

            if (!openAIResponse.ok) {
                console.error('Failed to fetch from OpenAI API:', openAIResponse.statusText);
                return;
            }

            const openAIJsonResponse = await openAIResponse.json();
            const artistSummary = openAIJsonResponse.choices[0].message.content;

            // Encode the artist summary as JSON to handle special characters and escape issues
            const encodedArtistSummary = JSON.stringify({ text: artistSummary });

            // Add timestamp to metadata
            const metadata = {
                timestamp: new Date().toISOString(),
            };

            // Store the encoded fact in KV
            const newKey = `fact_${new Date().getTime()}`; // Use a timestamp as the key to ensure uniqueness
            await env.ARTIST_FACTS.put(newKey, encodedArtistSummary, { metadata });

            console.log('New fact added to KV:', artistSummary);
        } catch (error) {
            console.error('Error occurred in cron job:', error);
        }
    }
};