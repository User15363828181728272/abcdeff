const axios = require('axios');

/**
 * 📸 SSWEB ENGINE (NO APIKEY)
 * Path: /v2/tools/ssweb
 * Creator: D2:业
 */

async function getScreenshot(url, full, type) {
    const form = new URLSearchParams();
    form.append('url', url);
    form.append('device', type);
    if (full) form.append('full', 'on');
    form.append('cacheLimit', 0);

    // Request pertama untuk dapet link capture
    const res = await axios.post('https://www.screenshotmachine.com/capture.php', form);
    const cookies = res.headers['set-cookie'];
    
    // Request kedua untuk download gambarnya pakai cookie yang sama
    const buffer = await axios({
        url: 'https://www.screenshotmachine.com/' + res.data.link,
        headers: { 'cookie': cookies ? cookies.join('') : '' },
        responseType: 'arraybuffer'
    });
    return Buffer.from(buffer.data);
}

module.exports = function (app) {
    app.get("/v2/tools/ssweb", async (req, res) => {
        const { url, device, full } = req.query;

        // Validasi URL
        if (!url || !/^https?:\/\//.test(url)) {
            return res.status(400).json({ 
                status: false, 
                creator: "D2:业",
                message: "URL tidak valid! Pastikan diawali http:// atau https://" 
            });
        }

        try {
            const isFull = full === 'true' || full === '1' || full === 'on';
            const deviceType = (device || 'desktop').toLowerCase();
            
            // Validasi tipe device agar tidak error di server screenshotmachine
            const allowedDevices = ['desktop', 'tablet', 'phone'];
            const finalDevice = allowedDevices.includes(deviceType) ? deviceType : 'desktop';

            const imgBuffer = await getScreenshot(url, isFull, finalDevice);

            // Set header agar browser/bot ngebaca ini sebagai gambar PNG
            res.set("Content-Type", "image/png");
            res.send(imgBuffer);

        } catch (e) {
            console.error("SSWEB Error:", e.message);
            res.status(500).json({ 
                status: false, 
                creator: "D2:业",
                error: "Gagal mengambil gambar. Mungkin web tersebut memblokir bot." 
            });
        }
    });
};
