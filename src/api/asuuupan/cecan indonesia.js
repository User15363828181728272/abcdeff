const axios = require('axios');

/**
 * 👩‍🦰 RANDOM CECAN INDONESIA
 * Path: /v2/asupan/indonesia
 * Creator: D2:业
 */

module.exports = function (app) {
    async function getCecanIndo() {
        // 1. Ambil list URL dari Pastebin (Source sama dengan China)
        const { data } = await axios.get('https://pastebin.com/raw/j9Hrx7V4', {
            headers: { 'User-Agent': 'Mozilla/5.0' }
        });

        const json = typeof data === 'string' ? JSON.parse(data) : data;

        // Cek kategori indonesia
        if (!json.indonesia || !Array.isArray(json.indonesia)) {
            throw new Error('Kategori Indonesia gak ketemu mbut! 🗿');
        }

        // 2. Pilih URL secara acak
        const randomUrl = json.indonesia[Math.floor(Math.random() * json.indonesia.length)];
        
        // 3. Ambil gambarnya dalam bentuk Buffer
        const response = await axios.get(randomUrl, { 
            responseType: 'arraybuffer',
            headers: { 'User-Agent': 'Mozilla/5.0' }
        });
        
        return Buffer.from(response.data);
    }

    app.get("/v2/asupan/indonesia", async (req, res) => {
        try {
            const buffer = await getCecanIndo();
            
            // Render langsung jadi gambar
            res.set('Content-Type', 'image/jpeg');
            res.send(buffer);
        } catch (err) {
            res.status(500).json({ 
                status: false, 
                error: err.message 
            });
        }
    });
};