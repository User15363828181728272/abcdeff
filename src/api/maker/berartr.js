const { createCanvas } = require("@napi-rs/canvas");

module.exports = function (app) {
    app.get("/v2/maker/brat", async (req, res) => {
        const { text } = req.query;

        if (!text) {
            return res.status(400).json({ status: false, message: "Masukin teks-nya mbut! Contoh: ?text=melihat+nya+pun+tak+sudi" });
        }

        try {
      
            const canvas = createCanvas(500, 500);
            const ctx = canvas.getContext("2d");


            ctx.fillStyle = "#ffffff"; 
ctx.fillRect(0, 0, 500, 500);


            ctx.fillStyle = "black";
            ctx.textAlign = "left";
            ctx.textBaseline = "top";
            
            const fontSize = 70;
            ctx.font = `bold ${fontSize}px Arial`;
            
            const words = text.split(" ");
            let line = "";
            let y = 50;

            for (let n = 0; n < words.length; n++) {
                let testLine = line + words[n] + " ";
                let metrics = ctx.measureText(testLine);
                if (metrics.width > 420 && n > 0) {
                    ctx.fillText(line, 40, y);
                    line = words[n] + " ";
                    y += fontSize + 10;
                } else {
                    line = testLine;
                }
            }
            ctx.fillText(line, 40, y);

            const buffer = canvas.toBuffer("image/png");
            res.set("Content-Type", "image/png").send(buffer);

        } catch (err) {
            res.status(500).json({ status: false, error: err.message });
        }
    });
};
