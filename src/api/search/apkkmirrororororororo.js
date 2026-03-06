const cloudscraper = require('cloudscraper');
const cheerio = require('cheerio');

/**
 * 🤖 APKMIRROR SEARCH ENGINE
 * Path: /v2/search/apkmirror
 * Creator: D2:业 (Scraper logic based on original)
 */

module.exports = function (app) {
    app.get("/v2/search/apkmirror", async (req, res) => {
        const { q } = req.query;

        if (!q) {
            return res.status(400).json({
                status: false,
                message: "Mau cari APK apa nih, Mbut? Masukin parameter 'q'!"
            });
        }

        try {
            const baseUrl = 'https://www.apkmirror.com';
            const searchParams = new URLSearchParams({
                'post_type': 'app_release',
                'searchtype': 'apk',
                's': q
            });

            // Scrape via cloudscraper untuk bypass anti-bot
            const html = await cloudscraper.get(`${baseUrl}/?${searchParams.toString()}`);
            const $ = cheerio.load(html);
            const results = [];

            $('.appRow').each((_, element) => {
                const row = $(element);
                const titleElement = row.find('h5.appRowTitle a.fontBlack');
                const title = titleElement.text().trim();
                const detailUrl = titleElement.attr('href');
                
                if (title && detailUrl) {
                    results.push({
                        title: title,
                        url: baseUrl + detailUrl,
                        version: row.find('.infoSlide-value').first().text().trim(),
                        fileSize: row.find('.infoSlide-value').eq(1).text().trim(),
                        developer: row.find('.byDeveloper').text().replace('by', '').trim(),
                        icon: row.find('img.ellipsisText').attr('src')
                    });
                }
            });

            res.json({
                status: true,
                total: results.length,
                result: results
            });

        } catch (err) {
            res.status(500).json({
                status: false,
                error: "Gagal menembus pertahanan APKMirror: " + err.message
            });
        }
    });
};
