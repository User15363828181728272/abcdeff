const https = require('https');
const zlib = require('zlib');

/**
 * 🎬 FREEREELS API SCRAPER (Short Drama & Anime)
 * Path: /v2/search/freereels
 * Creator: ConvertSW (Converted by D2:业)
 */

// Helper: Request Handler (Native HTTPS to handle GZIP)
const request = (url, method, headers, body = null) => {
    return new Promise((resolve, reject) => {
        const options = {
            method,
            headers: { ...headers, 'Accept-Encoding': 'gzip' }
        };
        const req = https.request(url, options, (res) => {
            const chunks = [];
            res.on('data', (chunk) => chunks.push(chunk));
            res.on('end', () => {
                let buffer = Buffer.concat(chunks);
                if (res.headers['content-encoding'] === 'gzip') buffer = zlib.gunzipSync(buffer);
                try {
                    resolve(JSON.parse(buffer.toString()));
                } catch (e) {
                    resolve(buffer.toString());
                }
            });
        });
        req.on('error', reject);
        if (body) req.write(JSON.stringify(body));
        req.end();
    });
};

module.exports = function (app) {
    app.get("/v2/search/freereels", async (req, res) => {
        const { q, type = 'search' } = req.query; // type: search, hotlist, info

        const headers = {
            'country': 'ID',
            'device-id': 'ab7d060a1c2a6b47',
            'app-version': '2.1.91',
            'User-Agent': 'okhttp/4.12.0',
            'Content-Type': 'application/json',
            'Authorization': `oauth_signature=1131ffdde3288b27f4f0a73eea6d534d,oauth_token=4zd4fL5xRaK7L9azadaEEN2vqGoRbf5f,ts=${Date.now()}`
        };

        try {
            let result;
            if (type === 'hotlist') {
                // Get Trending
                result = await request('https://apiv2.free-reels.com/frv2-api/search/hot-list', 'POST', headers, {});
            } else if (type === 'info' && q) {
                // Get Detail Drama (q = series_id)
                result = await request(`https://apiv2.free-reels.com/frv2-api/drama/info_v2?series_id=${q}`, 'GET', headers);
            } else {
                // Default Search
                if (!q) return res.status(400).json({ status: false, message: "Masukan keyword 'q'!" });
                const body = { next: '', keyword: q, timestamp: Date.now() };
                result = await request('https://apiv2.free-reels.com/frv2-api/search/drama', 'POST', headers, body);
            }

            res.json({
                status: true,
                type: type,
                result: result.data || result
            });

        } catch (err) {
            res.status(500).json({ status: false, error: err.message });
        }
    });
};
