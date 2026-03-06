const { createCanvas, loadImage, GlobalFonts } = require("@napi-rs/canvas");
const axios = require("axios");

/**
 * 👥 FAKE GROUP MAKER V2 (ADAPTIVE UI)
 * Path: /v2/maker/fakegroupv2
 * Creator: ZennzXD (Converted by D2:业)
 */

const BG_URL = "https://uploader.zenzxz.dpdns.org/uploads/1772216660350.jpeg";

module.exports = function (app) {

    // --- INTERNAL HELPERS ---
    async function toBufferFromUrl(url) {
        const res = await axios.get(url, { responseType: "arraybuffer", timeout: 60000 });
        return Buffer.from(res.data);
    }

    function fitFontSize(ctx, text, maxWidth, startSize, minSize, weight = 400) {
        let size = startSize;
        while (size > minSize) {
            ctx.font = `${weight} ${size}px Helvetica`;
            if (ctx.measureText(text).width <= maxWidth) return size;
            size -= 1;
        }
        return minSize;
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

    // --- ROUTE HANDLER ---
    app.get("/v2/maker/fakegroupv2", async (req, res) => {
        const { url, title, number, time } = req.query;

        if (!url || !title || !number || !time) {
            return res.status(400).json({
                status: false,
                message: "Parameter url, title, number, dan time wajib ada mbut! 🗿"
            });
        }

        try {
            const [bgBuf, avatarBuf] = await Promise.all([
                toBufferFromUrl(BG_URL),
                toBufferFromUrl(url)
            ]);

            const [bg, avatar] = await Promise.all([
                loadImage(bgBuf),
                loadImage(avatarBuf)
            ]);

            const canvas = createCanvas(bg.width, bg.height);
            const ctx = canvas.getContext("2d");

            // 1. Draw Background
            ctx.drawImage(bg, 0, 0, bg.width, bg.height);

            const centerX = bg.width / 2;
            const ppX = centerX;
            const ppY = bg.height * 0.23;
            const ppR = bg.height * 0.105;

            // 2. Draw Profile Picture & Border
            drawCircleImage(ctx, avatar, ppX, ppY, ppR);
            ctx.beginPath();
            ctx.arc(ppX, ppY, ppR, 0, Math.PI * 2);
            ctx.lineWidth = Math.max(2, Math.round(ppR * 0.08));
            ctx.strokeStyle = "rgba(255,255,255,0.12)";
            ctx.stroke();

            ctx.textAlign = "center";
            ctx.textBaseline = "middle";

            // 3. Draw Time (Top)
            ctx.fillStyle = "#FFFFFF";
            ctx.font = `400 ${bg.height * 0.02}px Helvetica`;
            ctx.fillText(time, centerX, bg.height * 0.025);

            // 4. Draw Title (Adaptive Size)
            const maxWidth = bg.width * 0.8;
            const titleSize = fitFontSize(ctx, title, maxWidth, bg.height * 0.035, bg.height * 0.028, 600);
            ctx.fillStyle = "#FFFFFF";
            ctx.font = `600 ${titleSize}px Helvetica`;
            ctx.fillText(title, centerX, bg.height * 0.37);

            // 5. Draw Subtitle (Group • Number)
            const subText = `Group • ${number}`;
            const subSize = fitFontSize(ctx, subText, maxWidth, bg.height * 0.022, bg.height * 0.02, 400);
            ctx.fillStyle = "#A1A1A6";
            ctx.font = `400 ${subSize}px Helvetica`;
            ctx.fillText(subText, centerX, bg.height * 0.41);

            const buffer = canvas.toBuffer("image/png");

            // Render Gambar Langsung
            res.set("Content-Type", "image/png");
            res.send(buffer);

        } catch (err) {
            res.status(500).json({ status: false, error: err.message });
        }
    });
};
