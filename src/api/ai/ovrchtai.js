const axios = require('axios');
const crypto = require('crypto');

/**
 * 🤖 OVERCHAT AI (GPT-5.2-NANO)
 * Path: /v2/ai/overchat
 * Creator: Sanadrux (Converted by D2:业)
 */

const generateUUID = () => {
    return crypto.randomUUID ? crypto.randomUUID() : 'xxxxxxxx-xxxx-4xxx-yxxx-xxxxxxxxxxxx'.replace(/[xy]/g, function(c) {
        const r = Math.random() * 16 | 0, v = c == 'x' ? r : (r & 0x3 | 0x8);
        return v.toString(16);
    });
};

module.exports = function (app) {
    app.get("/v2/ai/overchat", async (req, res) => {
        const { q } = req.query;

        if (!q) {
            return res.status(400).json({
                status: false,
                creator: "D2:业",
                message: "Tanya apa mbut? Masukin parameter 'q'!"
            });
        }

        const apiUrl = "https://api.overchat.ai/v1/chat/completions";
        const headers = {
            'Content-Type': 'application/json',
            'Accept': '*/*',
            'X-Device-Platform': 'web',
            'X-Device-UUID': generateUUID(),
            'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/145.0.0.0 Safari/537.36',
            'Origin': 'https://overchat.ai',
            'Referer': 'https://overchat.ai/'
        };

        const payload = {
            chatId: generateUUID(),
            model: "gpt-5.2-nano",
            personaId: "free-chat-gpt-landing",
            messages: [
                { id: generateUUID(), role: "user", content: q }
            ],
            stream: true,
            temperature: 0.5
        };

        try {
            const response = await axios.post(apiUrl, payload, { 
                headers, 
                responseType: 'stream' 
            });

            let fullReply = "";

            response.data.on('data', (chunk) => {
                const lines = chunk.toString().split('\n');
                for (let line of lines) {
                    if (line.startsWith('data: ') && line.trim() !== 'data: [DONE]') {
                        try {
                            const json = JSON.parse(line.replace('data: ', ''));
                            const content = json.choices[0]?.delta?.content;
                            if (content) fullReply += content;
                        } catch (e) {}
                    }
                }
            });

            response.data.on('end', () => {
                res.json({
                    status: true,
                    creator: "D2:业",
                    result: {
                        model: "gpt-5.2-nano",
                        question: q,
                        reply: fullReply.trim()
                    }
                });
            });

        } catch (err) {
            res.status(500).json({
                status: false,
                error: err.message
            });
        }
    });
};
