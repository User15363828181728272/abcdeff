const axios = require('axios');

/**
 * 👩‍🦰 RANDOM CECAN KOREA
 * Path: /v2/asupan/korea
 * Creator: D2:业
 */

module.exports = function (app) {
    async function getCecanKorea() {
        // 1. Ambil list URL dari Pastebin
        const { data } = await axios.get('https://pastebin.com/raw/j9Hrx7V4', {
            headers: { 'User-Agent': 'Mozilla/5.0' }
        });

        const json = typeof data === 'string' ? JSON.parse(data) : data;

        // Cek kategori korea
        if (!json.korea || !Array.isArray(json.korea)) {
            throw new Error('Kategori Korea gak ketemu mbut! 🗿');
        }

        // 2. Pilih URL secara acak
        const randomUrl = json.korea[Math.floor(Math.random() * json.korea.length)];
        
        // 3. Ambil gambarnya dalam bentuk Buffer
        const response = await axios.get(randomUrl, { 
            responseType: 'arraybuffer',
            headers: { 'User-Agent': 'Mozilla/5.0' }
        });
        
        return Buffer.from(response.data);
    }

    app.get("/v2/asupan/korea", async (req, res) => {
        try {
            const buffer = await getCecanKorea();
            
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