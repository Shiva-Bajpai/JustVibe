// Vercel Serverless Function — proxies YouTube HTML pages to avoid CORS issues
// This runs server-side so no CORS restrictions apply.

export default async function handler(req, res) {
    // Set CORS headers for the frontend
    res.setHeader('Access-Control-Allow-Origin', '*');
    res.setHeader('Access-Control-Allow-Methods', 'GET, OPTIONS');
    res.setHeader('Access-Control-Allow-Headers', 'Content-Type');

