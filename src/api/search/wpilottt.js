const axios = require('axios');

/**
 * 🌐 WEBPILOT AI SEARCH (BROWSING MODE)
 * Path: /v2/search/webpilot
 * Creator: Nath (Converted by D2:业)
 */

module.exports = function (app) {
    app.get("/v2/search/webpilot", async (req, res) => {
        const { q } = req.query;

        if (!q) {
            return res.status(400).json({
                status: false,
                creator: "D2:业",
                message: "Masukan query pencarian! Contoh: /v2/search/webpilot?q=berita+hari+ini"
            });
        }

        try {
            const base = "https://api.webpilotai.com/rupee/v1/search";
            const headers = {
                "accept": "application/json, text/plain, */*, text/event-stream",
                "content-type": "application/json;charset=UTF-8",
                "origin": "https://www.webpilot.ai",
                "referer": "https://www.webpilot.ai/",
                "user-agent": "Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/131.0.0.0 Safari/537.36",
            };

            const response = await axios.post(base, {
                q: q,
                threadId: ""
            }, { 
                headers, 
                responseType: "text" // Kita ambil teks mentah untuk di-parse
            });

            // PARSING STREAM DATA MENJADI TEKS UTUH
            let fullContent = "";
            let sources = [];
            const lines = response.data.split("\n");

            for (const line of lines) {
                if (line.startsWith("data:")) {
                    const raw = line.slice(5).trim();
                    if (raw === "[DONE]") continue;

                    try {
                        const json = JSON.parse(raw);
                        // Ambil konten teks
                        if (json.type === "data" && json.data?.content) {
                            fullContent += json.data.content;
                        }
                        // Ambil sumber website yang dikunjungi
                        if (json.type === "action" && json.action === "using_internet") {
                            sources.push({
                                title: json.data.title,
                                link: json.data.link
                            });
                        }
                    } catch (e) {
                        // Ignore parse error untuk baris non-JSON
                    }
                }
            }

            res.json({
                status: true,
                creator: "D2:业",
                result: {
                    query: q,
                    answer: fullContent.trim(),
                    sources: sources
                }
            });

        } catch (err) {
            res.status(500).json({
                status: false,
                error: err.message
            });
        }
    });
};
