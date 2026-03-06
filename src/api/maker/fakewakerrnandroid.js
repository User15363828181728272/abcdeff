const { createCanvas, loadImage, GlobalFonts } = require('@napi-rs/canvas');
const axios = require('axios');
const fs = require('fs');
const path = require('path');

/**
 * 👥 FAKE WHATSAPP GROUP INTERFACE
 * Path: /v2/maker/fakegroup
 * Creator: ZennzXD (Converted by D2:业)
 */

const fontPath = path.join('/tmp', 'Roboto-Fake.ttf');

async function initFont() {
    if (!fs.existsSync(fontPath)) {
        const resFont = await axios.get('https://uploader.zenzxz.dpdns.org/uploads/1772788670620.ttf', { responseType: 'arraybuffer' });
        fs.writeFileSync(fontPath, Buffer.from(resFont.data));
    }
    GlobalFonts.registerFromPath(fontPath, 'RobotoFake');
}

async function toBufferFromUrl(url) {
    const res = await axios.get(url, { responseType: 'arraybuffer', timeout: 60000 });
    return Buffer.from(res.data);
}

function drawCircleImage(ctx, img, cx, cy, r) {
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
    app.get("/v2/maker/fakegroup", async (req, res) => {
        const { url, name, members, desc, author, date } = req.query;

        if (!url || !name || !members || !desc || !author || !date) {
            return res.status(400).json({
                status: false,
                message: "Parameter url, name, members, desc, author, dan date wajib diisi mbut! 🗿"
            });
        }

        try {
            await initFont();

            // Download Background & Avatar
            const [bgBuffer, avatarBuffer] = await Promise.all([
                toBufferFromUrl('https://uploader.zenzxz.dpdns.org/uploads/1772793725383.png'),
                toBufferFromUrl(url)
            ]);

            const bg = await loadImage(bgBuffer);
            const avatar = await loadImage(avatarBuffer);
            
            const canvas = createCanvas(bg.width, bg.height);
            const ctx = canvas.getContext('2d');

            // 1. Draw Background
            ctx.drawImage(bg, 0, 0, bg.width, bg.height);
            
            // 2. Draw Profile Picture (Circle)
            drawCircleImage(ctx, avatar, 540, 260, 140);

            // --- CENTER ALIGNMENT ---
            ctx.textAlign = 'center';

            // Nama Group
            ctx.fillStyle = '#FFFFFF';
            ctx.font = '32pt RobotoFake'; 
            ctx.fillText(name, 540, 490); 

            // Jumlah Anggota
            ctx.fillStyle = '#1DA656';
            ctx.font = '24pt RobotoFake';
            ctx.fillText(members + ' anggota', 540, 550); 

            // --- LEFT ALIGNMENT ---
            ctx.textAlign = 'left';

            // Deskripsi Group
            ctx.fillStyle = '#FFFFFF';
            ctx.font = '25pt RobotoFake';
            ctx.fillText(desc, 60, 890);

            // Info Pembuat
            ctx.fillStyle = '#757A7E';
            ctx.font = '25pt RobotoFake';
            ctx.fillText(`Dibuat oleh ${author}, ${date}`, 60, 980);

            const buffer = canvas.toBuffer('image/png');

            res.set("Content-Type", "image/png");
            res.send(buffer);

        } catch (err) {
            res.status(500).json({ status: false, error: err.message });
        }
    });
};
