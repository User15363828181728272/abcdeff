const axios = require('axios');

/**
 * 👩‍🦰 RANDOM CECAN CHINA
 * Path: /v2/asupan/cecan
 * Creator: D2:业
 */

module.exports = function (app) {
    async function getCecanChina() {
        // 1. Ambil list URL dari Pastebin
        const { data } = await axios.get('https://pastebin.com/raw/j9Hrx7V4', {
            headers: { 'User-Agent': 'Mozilla/5.0' }
        });

        // Kadang pastebin return string, kadang udah auto-parse
        const json = typeof data === 'string' ? JSON.parse(data) : data;

        if (!json.china || !Array.isArray(json.china)) {
            throw new Error('Kategori China gak ketemu mbut! 🗿');
        }

        // 2. Pilih URL secara acak
        const randomUrl = json.china[Math.floor(Math.random() * json.china.length)];
        
        // 3. Ambil gambarnya dalam bentuk Buffer
        const response = await axios.get(randomUrl, { 
            responseType: 'arraybuffer',
            headers: { 'User-Agent': 'Mozilla/5.0' }
        });
        
        return Buffer.from(response.data);
    }

    app.get("/v2/asupan/cecan", async (req, res) => {
        try {
            const buffer = await getCecanChina();
            
            // Set header biar browser tau ini gambar, bukan teks
            res.set('Content-Type', 'image/jpeg');
            res.send(buffer);
        } catch (err) {
            // Kalau error, balikin JSON (Middleware di index.js bakal auto-format)
            res.status(500).json({ 
                status: false, 
                error: err.message 
            });
        }
    });
};
