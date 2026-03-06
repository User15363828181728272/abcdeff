const { createCanvas, loadImage, GlobalFonts } = require('@napi-rs/canvas');
const axios = require('axios');
const fs = require('fs');
const path = require('path');

/**
 * 💰 FAKE DANA BALANCE GENERATOR
 * Path: /v2/maker/fakedana
 * Creator: ZennzXD (Converted by D2:业)
 */

const fontPath = path.join('/tmp', 'danafont.ttf');

async function initFont() {
    if (!fs.existsSync(fontPath)) {
        const resFont = await axios.get('https://uploader.zenzxz.dpdns.org/uploads/1772380545889.ttf', { responseType: 'arraybuffer' });
        fs.writeFileSync(fontPath, Buffer.from(resFont.data));
    }
    GlobalFonts.registerFromPath(fontPath, 'danafont');
}

async function toBufferFromUrl(url) {
    const res = await axios.get(url, { responseType: 'arraybuffer', timeout: 60000 });
    return Buffer.from(res.data);
}

module.exports = function (app) {
    app.get("/v2/maker/fakedana", async (req, res) => {
        const { nominal } = req.query;

        if (!nominal) {
            return res.status(400).json({
                status: false,
                message: "Masukin nominal-nya mbut! Contoh: 50.000 🗿"
            });
        }

        try {
            await initFont();
            
            // Fetch Aset Background & Icon
            const [bgBuffer, eyeBuffer] = await Promise.all([
                toBufferFromUrl('https://uploader.zenzxz.dpdns.org/uploads/1772379873467.png'),
                toBufferFromUrl('https://uploader.zenzxz.dpdns.org/uploads/1772381535428.jpeg')
            ]);

            const [bg, eye] = await Promise.all([
                loadImage(bgBuffer),
                loadImage(eyeBuffer)
            ]);

            const canvas = createCanvas(bg.width, bg.height);
            const ctx = canvas.getContext('2d');

            // Draw Canvas
            ctx.drawImage(bg, 0, 0, bg.width, bg.height);

            // Draw Nominal
            ctx.fillStyle = '#FFFFFF';
            ctx.textAlign = 'left';
            ctx.font = '30pt danafont';
            
            const textX = 150;
            const textY = 100;
            ctx.fillText(nominal, textX, textY);

            // Draw Eye Icon
            const textWidth = ctx.measureText(nominal).width;
            ctx.drawImage(eye, textX + textWidth + 15, textY - 40, 50, 50);

            const buffer = canvas.toBuffer('image/png');

            res.set("Content-Type", "image/png");
            res.send(buffer);

        } catch (err) {
            res.status(500).json({ status: false, error: err.message });
        }
    });
};
