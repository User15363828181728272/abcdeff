const { createCanvas } = require("@napi-rs/canvas");

module.exports = function (app) {
    app.get("/v2/maker/bratv2", async (req, res) => {
        const { text } = req.query;

        if (!text) {
            return res.status(400).json({ status: false, message: "Masukin parameter 'text' mbut! 🗿" });
        }

        try {
            const canvas = createCanvas(500, 500);
            const ctx = canvas.getContext("2d");

            // Background
            ctx.fillStyle = "#FFFFFF";
            ctx.fillRect(0, 0, 500, 500);

            // Konfigurasi
            const maxWidth = 450;
            const maxHeight = 450;
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

            // Loop untuk mencari font size yang pas agar muat secara vertikal & horizontal
            while (fontSize > 10) {
                lines = wrapText(text, fontSize);
                const lineHeight = fontSize * 1.2;
                if (lines.length * lineHeight < maxHeight) break;
                fontSize -= 5;
            }

            // Draw Text
            ctx.fillStyle = "#000000";
            ctx.textAlign = "center";
            ctx.textBaseline = "middle";
            
            const lineHeight = fontSize * 1.2;
            const totalHeight = lines.length * lineHeight;
            let startY = 250 - (totalHeight / 2) + (lineHeight / 2);

            lines.forEach((line) => {
                ctx.fillText(line, 250, startY);
                startY += lineHeight;
            });

            const buffer = canvas.toBuffer("image/png");
            res.set("Content-Type", "image/png").send(buffer);

        } catch (err) {
            res.status(500).json({ status: false, error: err.message });
        }
    });
};
