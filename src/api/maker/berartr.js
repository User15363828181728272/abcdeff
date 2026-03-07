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

            // Konfigurasi
            const margin = 30; // Jarak dari pinggir
            const maxWidth = 500 - (margin * 2);
            let fontSize = 120;
            let lines = [];

            // Fungsi Helper untuk Wrap Text
            const wrapText = (txt, size) => {
                ctx.font = `bold ${size}px Arial`;
                const words = txt.toUpperCase().split(' ');
                let result = [];
                let currentLine = words[0];

                for (let i = 1; i < words.length; i++) {
                    if (ctx.measureText(currentLine + " " + words[i]).width < maxWidth) {
                        currentLine += " " + words[i];
                    } else {
                        result.push(currentLine);
                        currentLine = words[i];
                    }
                }
                result.push(currentLine);
                return result;
            };

            // Loop cari fontSize yang pas
            while (fontSize > 10) {
                lines = wrapText(text, fontSize);
                const lineHeight = fontSize * 1.1;
                if (lines.length * lineHeight < (500 - margin * 2)) break;
                fontSize -= 5;
            }

            // 2. Draw Text (Rata Kiri)
            ctx.fillStyle = "#000000";
            ctx.textAlign = "left";
            ctx.textBaseline = "top";
            
            const lineHeight = fontSize * 1.1;
            let currentY = margin;

            lines.forEach((line) => {
                ctx.fillText(line, margin, currentY);
                currentY += lineHeight;
            });

            const buffer = canvas.toBuffer("image/png");
            res.set("Content-Type", "image/png").send(buffer);

        } catch (err) {
            res.status(500).json({ status: false, error: err.message });
        }
    });
};
