const fs = require("fs");
const FormData = require("form-data");
const fetch = require("node-fetch");

/**
 * 🐱 NEKOHIME CDN UPLOADER
 * Path: /v2/tools/upload/neko
 * Method: POST (Multipart/form-data)
 * Creator: AhmadXyz (Converted by D2:业)
 */

module.exports = function (app, upload) {
    // Kita pakai 'upload.single' dari multer yang sudah di-pass dari index.js
    app.post("/v2/tools/upload-neko", upload.single('file'), async (req, res) => {
        const file = req.file;

        if (!file) {
            return res.status(400).json({
                status: false,
                creator: "D2:业",
                message: "Mana filenya, Bos? 🗿"
            });
        }

        try {
            const form = new FormData();
            // Baca file dari path temporary Multer
            form.append("file", fs.createReadStream(file.path));

            const response = await fetch("https://cdn.nekohime.site/upload", {
                method: "POST",
                headers: {
                    ...form.getHeaders(),
                    "User-Agent": "Mozilla/5.0 (Windows NT 10.0; Win64; x64)",
                    "Referer": "https://cdn.nekohime.site/"
                },
                body: form
            });

            const json = await response.json().catch(() => ({ error: "Gagal parsing JSON dari Nekohime" }));

            // Hapus file temporary di server Vercel biar gak menuhin RAM
            if (fs.existsSync(file.path)) fs.unlinkSync(file.path);

            res.json({
                status: true,
                creator: "D2:业",
                result: json
            });

        } catch (e) {
            // Pastikan file dihapus walau error
            if (file && fs.existsSync(file.path)) fs.unlinkSync(file.path);
            
            res.status(500).json({
                status: false,
                error: e.message
            });
        }
    });
};
