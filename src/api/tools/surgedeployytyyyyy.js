
const { exec } = require('child_process');
const fs = require('fs');
const path = require('path');
const os = require('os');
const AdmZip = require('adm-zip');

/**
 * 🔥 XTE APIS - SURGE DEPLOYER (VERCEL READY)
 * Creator: D2:业
 */

module.exports = function (app, upload) {
    // Route: POST /v2/tools/deploy
    // 'upload' di sini dikirim dari index.js (Multer Instance)
    app.post("/v2/tools/deploy", upload.single('file'), async (req, res) => {
        const creator = "D2:业";
        
        try {
            const { domain } = req.body;
            const file = req.file;
            const surgeToken = process.env.SURGE_TOKEN || "5796d21b55ad39d9167d1964cf47c8a2"; 

            // 1. Validasi Input
            if (!file) {
                return res.status(400).json({ status: false, message: "File ZIP mana, Bos? 🗿" });
            }
            if (!domain) {
                return res.status(400).json({ status: false, message: "Isi nama subdomainnya dulu!" });
            }

            // 2. Setup Path di folder /tmp (Wajib di Vercel)
            const targetDomain = `${domain.toLowerCase().replace(/\s+/g, '-')}.surge.sh`;
            const extractPath = path.join(os.tmpdir(), `xte_deploy_${Date.now()}`);

            // 3. Ekstrak File ZIP
            const zip = new AdmZip(file.path);
            zip.extractAllTo(extractPath, true);

            // 4. Eksekusi Surge via NPX
            // Gunakan --token agar tidak minta login interaktif
            const command = `npx surge ${extractPath} ${targetDomain} --token ${surgeToken}`;

            exec(command, (error, stdout, stderr) => {
                // Hapus file sampah setelah selesai
                if (fs.existsSync(file.path)) fs.unlinkSync(file.path);
                if (fs.existsSync(extractPath)) fs.rmSync(extractPath, { recursive: true, force: true });

                if (error) {
                    console.error("Surge Error:", stderr);
                    return res.status(500).json({
                        status: false,
                        creator,
                        message: "Gagal Deploy ke Surge.",
                        error: stderr || error.message
                    });
                }

                // 5. Response Sukses
                res.json({
                    status: true,
                    creator,
                    result: {
                        url: `https://${targetDomain}`,
                        host: "Surge.sh",
                        message: "Website lu berhasil online! 🚀"
                    }
                });
            });

        } catch (e) {
            // Hapus file kalau terjadi crash di tengah jalan
            if (req.file && fs.existsSync(req.file.path)) fs.unlinkSync(req.file.path);
            
            res.status(500).json({
                status: false,
                creator,
                error: "System Error: " + e.message
            });
        }
    });
};
