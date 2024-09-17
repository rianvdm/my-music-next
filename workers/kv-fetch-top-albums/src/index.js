export default {
    async fetch(request, env) {
        try {
            const topAlbumsData = await env.TOP_ALBUMS.get('topAlbums');

            if (!topAlbumsData) {
                return new Response(JSON.stringify({ error: 'No data found' }), {
                    status: 404,
                    headers: {
                        'Content-Type': 'application/json',
                        'Access-Control-Allow-Origin': '*',
                    },
                });
            }

            // Parse the data since it was stored as a JSON string
            const parsedData = JSON.parse(topAlbumsData);

            // Return the data as a JSON response
            return new Response(JSON.stringify(parsedData), {
                status: 200,
                headers: {
                    'Content-Type': 'application/json',
                    'Access-Control-Allow-Origin': '*',
                },
            });
        } catch (error) {
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