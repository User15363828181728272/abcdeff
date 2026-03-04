const axios = require("axios");
const cheerio = require("cheerio");

/**
 * 🎬 IQIYI SEARCH ENGINE (Drama, Movie, Anime)
 * Path: /v2/search/iqiyi
 * Creator: Nath (Converted by D2:业)
 */

module.exports = function (app) {
    app.get("/v2/search/iqiyi", async (req, res) => {
        const { q } = req.query;

        if (!q) {
            return res.status(400).json({
                status: false,
                message: "Mau cari film apa, Mbut? Masukin parameter 'q'!"
            });
        }

        try {
            const hdrs = {
                "User-Agent": "Mozilla/5.0 (Linux; Android 10; K) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/132.0.0.0 Mobile Safari/537.36",
                "Referer": "https://www.iq.com/",
            };

            const typeOf = { 1: "Movie", 2: "Drama", 3: "Anime", 4: "Variety" };

            // 1. Fetch data dari iQIYI
            const response = await axios.get(`https://www.iq.com/search?query=${encodeURIComponent(q)}&originInput=Drama`, { headers: hdrs });
            const $ = cheerio.load(response.data);

            // 2. Ambil JSON dari script Next Data
            const raw = $("#__NEXT_DATA__").text();
            if (!raw) throw new Error("Gagal mengambil data mentah dari iQIYI.");

            const parsed = JSON.parse(raw);
            const searchResult = parsed?.props?.initialState?.search?.result;
            
            if (!searchResult || !searchResult.videos) {
                return res.status(404).json({
                    status: false,
                    message: "Gada hasilnya, cari yang lain mbut! 🗿"
                });
            }

            // 3. Mapping data hasil pencarian
            const videos = (searchResult.videos || []).slice(0, 15).map(v => ({
                title: v.name?.replace(/<[^>]+>/g, "").trim(),
                year: v.publishYear || "N/A",
                type: typeOf[v.chnId] || "Other",
                episodes: v.marks?.left_bottom?.text || "N/A",
                rating: v.marks?.right_top?.num || "N/A",
                url: v.albumUrl || v.url ? "https:" + (v.albumUrl || v.url) : "N/A",
                thumbnail: v.imageUrl || "N/A"
            }));

            res.json({
                status: true,
                result: videos
            });

        } catch (err) {
            res.status(500).json({
                status: false,
                error: err.message
            });
        }
    });
};
