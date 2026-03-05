const { createCanvas, loadImage, GlobalFonts } = require('@napi-rs/canvas');
const axios = require('axios');
const fs = require('fs');
const path = require('path');

/**
 * 📱 FAKE TIKTOK PROFILE MAKER
 * Path: /v2/maker/faketiktok
 * Creator: ZennzXD (Converted by D2:业)
 */

const fontPath = path.join('/tmp', 'HelveticaNeue.otf'); // Simpan di /tmp biar aman di Vercel

async function initFont() {
    if (!fs.existsSync(fontPath)) {
        const resFont = await axios.get('https://uploader.zenzxz.dpdns.org/uploads/1772309173833.otf', { responseType: 'arraybuffer' });
        fs.writeFileSync(fontPath, Buffer.from(resFont.data));
    }
    GlobalFonts.registerFromPath(fontPath, 'HelveticaNeue');
}

async function toBufferFromUrl(url) {
    const res = await axios.get(url, { responseType: 'arraybuffer', timeout: 60000 });
    return Buffer.from(res.data);
}

function drawCircularImage(ctx, img, cx, cy, r) {
    const d = r * 2;
    ctx.save();
    ctx.beginPath();
    ctx.arc(cx, cy, r, 0, Math.PI * 2);
    ctx.closePath();
    ctx.clip();
    const scale = Math.max(d / img.width, d / img.height);
    const w = img.width * scale;
    const h = img.height * scale;
    ctx.drawImage(img, cx - w / 2, cy - h / 2, w, h);
    ctx.restore();
}

module.exports = function (app) {
    app.get("/v2/maker/faketiktok", async (req, res) => {
        const { name, username, following, followers, likes, url } = req.query;

        if (!name || !username || !url) {
            return res.status(400).json({
                status: false,
                message: "Parameter name, username, and url (pp) wajib diisi mbut! 🗿"
            });
        }

        try {
            await initFont();
            
            // Download aset gambar
            const [bgBuffer, addImgBuffer, avatarBuffer] = await Promise.all([
                toBufferFromUrl('https://uploader.zenzxz.dpdns.org/uploads/1772307584184.png'),
                toBufferFromUrl('https://uploader.zenzxz.dpdns.org/uploads/1772311723925.png'),
                toBufferFromUrl(url)
            ]);

            const [bg, add, avatar] = await Promise.all([
                loadImage(bgBuffer),
                loadImage(addImgBuffer),
                loadImage(avatarBuffer)
            ]);

            const canvas = createCanvas(bg.width, bg.height);
            const ctx = canvas.getContext('2d');

            // Draw Background
            ctx.drawImage(bg, 0, 0, bg.width, bg.height);
            
            // Draw Avatar & Plus Icon
            drawCircularImage(ctx, avatar, 150, 160, 117);
            ctx.drawImage(add, 210, 220, 60, 60);

            // Draw Name & Username
            ctx.textAlign = 'left';
            ctx.fillStyle = '#FFFFFF';
            ctx.font = 'bold 28pt HelveticaNeue';
            ctx.fillText(name, 290, 140);

            ctx.fillStyle = '#7F7F7F';
            ctx.font = '20pt HelveticaNeue';
            ctx.fillText(username, 290, 175);

            // Draw Stats
            ctx.textAlign = 'center';
            ctx.fillStyle = '#FFFFFF';
            ctx.font = 'bold 30pt HelveticaNeue';
            ctx.fillText(following || '0', 110, 350);
            ctx.fillText(followers || '0', 360, 350);
            ctx.fillText(likes || '0', 570, 350);

            const buffer = canvas.toBuffer('image/png');

            // Kirim Output Gambar
            res.set("Content-Type", "image/png");
            res.send(buffer);

        } catch (err) {
            res.status(500).json({
                status: false,
                error: err.message
            });
        }
    });
};
