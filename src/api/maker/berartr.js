const { createCanvas } = require("@napi-rs/canvas");

module.exports = function (app) {
    app.get("/v2/maker/brat", async (req, res) => {
        const { text } = req.query;

        if (!text) {
            return res.status(400).json({ status: false, message: "Masukin parameter 'text' mbut! 🗿" });
        }

        try {
            const canvas = createCanvas(500, 500);
            const ctx = canvas.getContext("2d");

            // 1. Background Putih
            ctx.fillStyle = "#FFFFFF";
            ctx.fillRect(0, 0, 500, 500);

            // 2. Logic Adaptive Font Size
            let fontSize = 120; // Mulai dari ukuran gede
            let textWidth = 450;
            
            ctx.font = `bold ${fontSize}px Arial`;
            // Kecilin font sampe muat di lebar canvas
            while (ctx.measureText(text.toUpperCase()).width > textWidth && fontSize > 20) {
                fontSize -= 5;
                ctx.font = `bold ${fontSize}px Arial`;
            }

            // 3. Draw Text di Tengah
            ctx.fillStyle = "#000000";
            ctx.textAlign = "center";
            ctx.textBaseline = "middle";
            ctx.fillText(text.toUpperCase(), 250, 250);

            const buffer = canvas.toBuffer("image/png");
            res.set("Content-Type", "image/png").send(buffer);

        } catch (err) {
            res.status(500).json({ status: false, error: err.message });
        }
    });
};
