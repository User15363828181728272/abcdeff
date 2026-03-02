const axios = require('axios');

/**
 * 💌 NGL.LINK BULK SPAMMER (PROTECTED)
 * Path: /v2/tools/ngl-bulk
 * Params: user, msg, total, delay, apikey
 * Creator: D2:业
 */

const sleep = (ms) => new Promise(resolve => setTimeout(resolve, ms));

module.exports = function (app) {
    app.get("/v2/tools/nglspam", async (req, res) => {
        let { user, msg, total, delay, apikey } = req.query;

        // 1. CEK API KEY (THE GUARD)
        if (apikey !== "estehsegar") {
            return res.status(403).json({
                status: false,
                creator: "D2:业",
                message: "API Key salah atau tidak ada! Mau nyepam ya? 🗿"
            });
        }

        // 2. Validasi & Parsing Input
        if (!user || !msg) return res.status(400).json({ status: false, message: "User & Msg wajib ada!" });
        
        total = parseInt(total) || 5; 
        delay = parseInt(delay) || 1; 

        // Limit Vercel Tier Free (Max 50 req agar tidak Timeout)
        if (total > 50) return res.status(400).json({ status: false, message: "Maksimal 50 pesan biar server gak meledak, Bos!" });

        const results = {
            success: 0,
            failed: 0,
            logs: []
        };

        try {
            // 3. Start Bulk Operation
            for (let i = 1; i <= total; i++) {
                const deviceId = [...Array(32)].map(() => Math.floor(Math.random() * 16).toString(16)).join('');
                
                try {
                    await axios({
                        method: 'post',
                        url: 'https://ngl.link/api/submit',
                        headers: {
                            'Content-Type': 'application/x-www-form-urlencoded; charset=UTF-8',
                            'User-Agent': 'Mozilla/5.0 (Linux; Android 10; K)'
                        },
                        data: new URLSearchParams({
                            username: user,
                            question: msg,
                            deviceId: deviceId
                        }).toString()
                    });
                    
                    results.success++;
                    results.logs.push(`[${i}] Sukses`);
                } catch (e) {
                    results.failed++;
                    results.logs.push(`[${i}] Gagal: ${e.message}`);
                }

                if (i < total) await sleep(delay * 1000);
            }

            res.json({
                status: true,
                creator: "D2:业",
                result: {
                    target: user,
                    sent: results.success,
                    failed: results.failed,
                    speed: `${delay}s/msg`,
                    logs: results.logs
                }
            });

        } catch (err) {
            res.status(500).json({ status: false, error: err.message });
        }
    });
};
