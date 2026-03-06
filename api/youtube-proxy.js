// Vercel Serverless Function — proxies YouTube HTML pages to avoid CORS issues
// This runs server-side so no CORS restrictions apply.

export default async function handler(req, res) {
    // Set CORS headers for the frontend
    res.setHeader('Access-Control-Allow-Origin', '*');
    res.setHeader('Access-Control-Allow-Methods', 'GET, OPTIONS');
    res.setHeader('Access-Control-Allow-Headers', 'Content-Type');

    if (req.method === 'OPTIONS') {
        return res.status(200).end();
    }

    const { type, q, id } = req.query;

    try {
        let url;
        if (type === 'search' && q) {
            url = `https://www.youtube.com/results?search_query=${encodeURIComponent(q)}`;
        } else if (type === 'playlist' && id) {
            url = `https://www.youtube.com/playlist?list=${encodeURIComponent(id)}`;
        } else {
            return res.status(400).json({ error: 'Missing required parameters. Use ?type=search&q=... or ?type=playlist&id=...' });
        }

        const response = await fetch(url, {
            headers: {
                'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0.0.0 Safari/537.36',
                'Accept-Language': 'en-US,en;q=0.9',
                'Accept': 'text/html,application/xhtml+xml,application/xml;q=0.9,*/*;q=0.8',
            },
        });

        if (!response.ok) {
            return res.status(response.status).json({ error: `YouTube returned status ${response.status}` });
        }
