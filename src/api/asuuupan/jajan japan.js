const axios = require('axios');

/**
 * 👩‍🦰 RANDOM CECAN JAPAN
 * Path: /v2/asupan/japan
 * Creator: D2:业
 */

module.exports = function (app) {
    async function getCecanJapan() {
        // 1. Ambil list URL dari Pastebin
        const { data } = await axios.get('https://pastebin.com/raw/j9Hrx7V4', {
            headers: { 'User-Agent': 'Mozilla/5.0' }
        });

        const json = typeof data === 'string' ? JSON.parse(data) : data;

        // Cek kategori japan
        if (!json.japan || !Array.isArray(json.japan)) {
            throw new Error('Kategori Japan gak ketemu mbut! 🗿');
        }

        // 2. Pilih URL secara acak
        const randomUrl = json.japan[Math.floor(Math.random() * json.japan.length)];
        
        // 3. Ambil gambarnya dalam bentuk Buffer
        const response = await axios.get(randomUrl, { 
            responseType: 'arraybuffer',
            headers: { 'User-Agent': 'Mozilla/5.0' }
        });
        
        return Buffer.from(response.data);
    }

    app.get("/v2/asupan/japan", async (req, res) => {
        try {
            const buffer = await getCecanJapan();
            
            // Render langsung jadi gambar di browser
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
