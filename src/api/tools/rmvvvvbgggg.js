const axios = require('axios');
const crypto = require('crypto');
const FormData = require('form-data');
const fs = require('fs');

/**
 * ✂️ REMOVE BACKGROUND (AI)
 * Path: /v2/tools/removebg
 * Method: POST
 * Creator: D2:业
 */

class RemoveBG {
    constructor() {
        this.baseUrl = 'https://removal.ai';
        this.apiUrl = 'https://api.removal.ai';
        this.ajaxUrl = 'https://removal.ai/wp-admin/admin-ajax.php';
        this.webToken = null;
    }

    generateCookies() {
        const rand = (n) => crypto.randomBytes(n).toString('hex').slice(0, n);
        const ts = Date.now();
        return `PHPSESSID=${rand(26)}; lang=en; _ga=GA1.1.${rand(8)}.${ts.toString().slice(0, 10)};`;
    }

    async getWebToken() {
        const headers = {
            'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36',
            'Referer': this.baseUrl + '/upload/',
            'Cookie': this.generateCookies()
        };
        const response = await axios.get(`${this.ajaxUrl}?action=ajax_get_webtoken&security=249c6a42bb`, { headers });
        if (response.data.success) {
            this.webToken = response.data.data.webtoken;
        }
    }

    async process(imageBuffer) {
        if (!this.webToken) await this.getWebToken();
        const formData = new FormData();
        formData.append('image_file', imageBuffer, { filename: 'image.png' });

        const response = await axios.post(`${this.apiUrl}/3.0/remove`, formData, {
            headers: {
                'Origin': this.baseUrl,
                'Referer': this.baseUrl + '/upload/',
                'Web-Token': this.webToken,
                ...formData.getHeaders()
            }
        });
        return response.data;
    }
}

const remover = new RemoveBG();

module.exports = function (app, upload) {
    // Kita pake POST karena kirim file
    app.post("/v2/tools/removebg", upload.single('file'), async (req, res) => {
        try {
            let imageBuffer;

            if (req.file) {
                // Jika user upload file
                imageBuffer = fs.readFileSync(req.file.path);
                if (fs.existsSync(req.file.path)) fs.unlinkSync(req.file.path); // Hapus temp
            } else if (req.query.url) {
                // Jika user kasih link URL
                const imgRes = await axios.get(req.query.url, { responseType: 'arraybuffer' });
                imageBuffer = Buffer.from(imgRes.data);
            } else {
                return res.status(400).json({ status: false, message: "Upload file (key: file) atau kasih parameter 'url' mbut! 🗿" });
            }

            const result = await remover.process(imageBuffer);

            // Jika berhasil, biasanya removal.ai balikin JSON berisi link gambar yang sudah bersih
            res.json({
                status: true,
                result: result
            });

        } catch (err) {
            res.status(500).json({ status: false, error: err.message });
        }
    });
};
