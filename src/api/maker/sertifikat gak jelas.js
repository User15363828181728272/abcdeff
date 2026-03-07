const { createCanvas, GlobalFonts } = require("@napi-rs/canvas");

module.exports = function (app) {
    app.get("/v2/maker/cert-pro", async (req, res) => {
        const { name, title, reason, date } = req.query;

        if (!name || !title || !reason) {
            return res.status(400).json({ status: false, message: "Isi name, title, dan reason mbut! 🗿" });
        }

        try {
            const canvas = createCanvas(1200, 800);
            const ctx = canvas.getContext("2d");

            // 1. Background (Emas Klasik)
            const grad = ctx.createLinearGradient(0, 0, 1200, 800);
            grad.addColorStop(0, "#fdf6e3");
            grad.addColorStop(1, "#e6c867");
            ctx.fillStyle = grad;
            ctx.fillRect(0, 0, 1200, 800);

            // 2. Watermark Transparan "XTE APIS"
            ctx.save();
            ctx.textAlign = "center";
            ctx.fillStyle = "rgba(184, 134, 11, 0.1)"; // Opacity rendah
            ctx.font = "bold 150px serif";
            ctx.translate(600, 400);
            ctx.rotate(-Math.PI / 4); // Miring biar makin estetik
            ctx.fillText("XTE APIS", 0, 0);
            ctx.restore();

            // 3. Border
            ctx.strokeStyle = "#b8860b";
            ctx.lineWidth = 20;
            ctx.strokeRect(30, 30, 1140, 740);

            // 4. Content Text
            ctx.fillStyle = "#333";
            ctx.textAlign = "center";
            
            ctx.font = "bold 60px serif";
            ctx.fillText("SERTIFIKAT", 600, 150);

            ctx.font = "italic 40px serif";
            ctx.fillText("Diberikan kepada:", 600, 250);
            
            ctx.font = "bold 80px serif";
            ctx.fillText(name, 600, 350);

            ctx.font = "40px serif";
            ctx.fillText("Atas pencapaiannya sebagai:", 600, 450);
            
            ctx.fillStyle = "#8b0000";
            ctx.font = "bold 60px serif";
            ctx.fillText(reason, 600, 550);

            ctx.fillStyle = "#333";
            ctx.font = "30px serif";
            ctx.fillText(`Dalam acara: ${title}`, 600, 650);
            ctx.fillText(`Diterbitkan: ${date || new Date().toLocaleDateString()}`, 600, 720);

            const buffer = canvas.toBuffer("image/png");
            res.set("Content-Type", "image/png").send(buffer);

        } catch (e) {
            res.status(500).json({ status: false, error: e.message });
        }
    });
};
