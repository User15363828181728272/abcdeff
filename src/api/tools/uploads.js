const axios = require('axios');
const FormData = require('form-data');
const fs = require('fs');

/**
 * 📤 FILE UPLOADER (UPLOADF)
 * Path: /v2/tools/upload
 * Method: POST
 * Creator: D2:业
 */

module.exports = function (app, upload) {
    app.post("/v2/tools/upload", upload.single('file'), async (req, res) => {
        if (!req.file) {
            return res.status(400).json({ 
                status: false, 
                message: "Upload file-nya dulu mbut! Pakai key 'file' 🗿" 
            });
        }

        try {
            const formData = new FormData();
            formData.append('file', fs.createReadStream(req.file.path));

            const response = await axios.post('https://uploadf.com/fileup.php', formData, {
                headers: {
                    ...formData.getHeaders(),
                    'User-Agent': 'Mozilla/5.0 (X11; Linux x86_64) AppleWebKit/537.36',
                    'Origin': 'https://uploadf.com',
                    'Referer': 'https://uploadf.com/id/',
                    'X-Requested-With': 'XMLHttpRequest'
                }
            });

            // Hapus file dari temp setelah diupload
            if (fs.existsSync(req.file.path)) fs.unlinkSync(req.file.path);

            const data = response.data;
            if (data.FLG === '1') {
                res.json({
                    status: true,
                    result: {
                        url: 'https://uploadf.com/s/' + data.NAME,
                        originalName: data.NRF,
                        size: req.file.size
                    }
                });
            } else {
                res.status(500).json({ status: false, message: "Gagal upload mbut!" });
            }

        } catch (err) {
            res.status(500).json({ status: false, error: err.message });
        }
    });
};
