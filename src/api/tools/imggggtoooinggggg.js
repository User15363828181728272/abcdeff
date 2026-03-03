const axios = require('axios');
const fs = require('fs');

/**
 * 📸 IMAGE TO PROMPT (AI VISION)
 * Path: /v2/tools/img2prompt
 * Method: POST
 * Creator: Rim (Converted by D2:业)
 */

module.exports = function (app, upload) {
    app.post("/v2/tools/img2prompt", upload.single('file'), async (req, res) => {
        const file = req.file;

        // 1. Validasi keberadaan file
        if (!file) {
            return res.status(400).json({
                status: false,
                message: "Gambarnya mana, Mbut? 🗿"
            });
        }

        try {
            // 2. Baca file dari temp folder dan convert ke Base64
            const mediaBuffer = fs.readFileSync(file.path);
            const base64 = `data:${file.mimetype};base64,${mediaBuffer.toString('base64')}`;

            // 3. Request ke API Vision Supabase
            const response = await axios.post(
                'https://wabpfqsvdkdjpjjkbnok.supabase.co/functions/v1/unified-prompt-dev',
                { 
                    feature: 'image-to-prompt-en', 
                    language: 'en', 
                    image: base64 
                },
                {
                    responseType: 'stream',
                    headers: {
                        'authorization': 'Bearer eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6IndhYnBmcXN2ZGtkanBqamtibm9rIiwicm9sZSI6ImFub24iLCJpYXQiOjE3MzczNjk5MjEsImV4cCI6MjA1Mjk0NTkyMX0.wGGq1SWLIRELdrntLntBz-QH-JxoHUdz8Gq-0ha-4a4',
                        'content-type': 'application/json',
                        'origin': 'https://generateprompt.ai',
                        'referer': 'https://generateprompt.ai/'
                    }
                }
            );

            // 4. Proses Stream Data menjadi Teks
            let result = '';
            response.data.on('data', (chunk) => {
                const lines = chunk.toString().split('\n');
                for (const line of lines) {
                    if (line.startsWith('data:')) {
                        const raw = line.slice(5).trim();
                        try {
                            const json = JSON.parse(raw);
                            const text = json?.choices?.[0]?.delta?.content || json?.content || json?.text || '';
                            result += text;
                        } catch (e) {
                            // Abaikan error parsing baris stream
                        }
                    }
                }
            });

            // 5. Kirim respon setelah stream selesai
            response.data.on('end', () => {
                // Hapus file temporary agar tidak menumpuk di Vercel
                if (fs.existsSync(file.path)) fs.unlinkSync(file.path);

                res.json({
                    status: true,
                    result: result.trim() || "Gagal mendapatkan deskripsi gambar."
                });
            });

            response.data.on('error', (err) => {
                throw new Error(err.message);
            });

        } catch (e) {
            // Pastikan file temp terhapus jika terjadi error
            if (file && fs.existsSync(file.path)) fs.unlinkSync(file.path);
            
            res.status(500).json({
                status: false,
                error: e.message
            });
        }
    });
};
