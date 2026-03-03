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

        if (!file) {
            return res.status(400).json({
                status: false,
                creator: "D2:业",
                message: "Gambarnya mana, Mbut? 🗿 (Key: 'file')"
            });
        }

        try {
            // 1. Convert gambar yang diupload ke Base64
            const mediaBuffer = fs.readFileSync(file.path);
            const base64 = `data:${file.mimetype};base64,${mediaBuffer.toString('base64')}`;

            // 2. Tembak ke API Supabase Rim
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

            // 3. Gabungkan hasil stream teksnya
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
                        } catch (e) {}
                    }
                }
            });

            response.data.on('end', () => {
                // Hapus file sampah
                if (fs.existsSync(file.path)) fs.unlinkSync(file.path);

                res.json({
                    status: true,
                    creator: "D2:业",
                    result: result.trim()
                });
            });

        } catch (e) {
            if (file && fs.existsSync(file.path)) fs.unlinkSync(file.path);
            res.status(500).json({
                status: false,
                error: e.message
            });
        }
    });
};
