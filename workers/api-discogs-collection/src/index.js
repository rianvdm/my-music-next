export default {
    async fetch(request, env, ctx) {
        const DiscogsToken = env.DISCOGS_API_TOKEN;
        const DiscogsUser = env.DISCOGS_USERNAME;

        const apiUrl = `https://api.discogs.com/users/${encodeURIComponent(DiscogsUser)}/collection/folders/0/releases?token=${encodeURIComponent(DiscogsToken)}&sort=added&sort_order=desc&per_page=10`;

        console.log(`Fetching data from Discogs API: ${apiUrl}`);

        try {
            const response = await fetch(apiUrl, {
                headers: {
                    'User-Agent': 'Cloudflare Worker',
                }
            });

            if (!response.ok) {
                console.error(`Error fetching data: ${response.status} - ${response.statusText}`);
                return new Response(JSON.stringify({ error: response.statusText }), {
                    status: response.status,
                    headers: {
                        'Content-Type': 'application/json',
                        'Access-Control-Allow-Origin': '*',
                    },
                });
            }

            const data = await response.json();
            console.log(`Received data: ${JSON.stringify(data)}`);

            // Extract the relevant information from the API response
            const latestAdditions = data.releases?.map(release => ({
                title: release.basic_information.title,
                artist: release.basic_information.artists?.map(artist => artist.name).join(', ') || '',
                year: release.basic_information.year,
                format: release.basic_information.formats?.map(format => format.name).join(', ') || '',
                label: release.basic_information.labels?.map(label => label.name).join(', ') || '',
                imageUrl: release.basic_information.cover_image,
                genre: release.basic_information.genres[0],
                discogsUrl: release.basic_information.resource_url.replace('api.discogs.com/releases', 'discogs.com/release'), // Modify URL format
                addedDate: release.date_added,
            })) || [];

            console.log(`Parsed latest additions: ${JSON.stringify(latestAdditions)}`);

            return new Response(JSON.stringify(latestAdditions), {
                headers: {
                    'Content-Type': 'application/json',
                    'Access-Control-Allow-Origin': '*',
                },
            });
        } catch (error) {
            console.error(`Fetch failed: ${error.message}`);
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