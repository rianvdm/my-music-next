export default {
    async fetch(request, env) {
        try {
            const keyList = await env.ARTIST_FACTS.list();

            if (keyList.keys.length === 0) {
                return new Response(JSON.stringify({ data: "No facts found." }), {
                    status: 200,
                    headers: {
                        'Content-Type': 'application/json',
                        'Access-Control-Allow-Origin': '*',
                    },
                });
            }

            // Select a random key from the list
            const randomKey = keyList.keys[Math.floor(Math.random() * keyList.keys.length)].name;

            // Fetch the value for the selected key
            const randomFactJSON = await env.ARTIST_FACTS.get(randomKey);

            // Decode the JSON string to an object
            const randomFact = JSON.parse(randomFactJSON);

            // Return the decoded random fact
            return new Response(JSON.stringify({ data: randomFact.text }), { // Adjusted to return the 'text' field
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