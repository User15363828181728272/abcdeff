const axios = require('axios');
const FormData = require('form-data');

/**
 * 🤖 META AI (LLAMA 3.3) - YUNA ASISTEN
 * Path: /v2/ai/meta
 * Creator: Defandryan (Scraper) & D2:业 (Integration)
 */

module.exports = function (app) {

    // --- HELPER FUNCTIONS ---
    function generateRandomDOB() {
        const year = Math.floor(Math.random() * (2005 - 1970 + 1)) + 1970;
        const month = String(Math.floor(Math.random() * 12) + 1).padStart(2, '0');
        const day = String(Math.floor(Math.random() * 28) + 1).padStart(2, '0');
        return `${year}-${month}-${day}`;
    }

    async function getToken() {
        const url = 'https://www.meta.ai/api/graphql/';
        const form = new FormData();
        form.append('lsd', 'AdJzP_b_qoc');
        form.append('variables', JSON.stringify({
            "dob": generateRandomDOB(),
            "__relay_internal__pv__AbraQPDocUploadNuxTriggerNamerelayprovider": "meta_dot_ai_abra_web_doc_upload_nux_tour",
            "__relay_internal__pv__AbraSurfaceNuxIDrelayprovider": "12177"
        }));
        form.append('doc_id', '25102616396026783');
        // Data internal Meta (Static bypass)
        const staticFields = { 'av': '0', '__user': '0', '__a': '1', '__req': 't', '__rev': '1032408219' };
        Object.entries(staticFields).forEach(([k, v]) => form.append(k, v));

        const headers = {
            ...form.getHeaders(),
            'user-agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64; rv:147.0) Gecko/20100101 Firefox/147.0',
            'origin': 'https://www.meta.ai',
            'referer': 'https://www.meta.ai/',
            'cookie': 'datr=sU90afPSYelxqmSaKqer58Hc; wd=1366x643'
        };

        const response = await axios.post(url, form, { headers });
        const auth = response.data?.data?.xab_abra_accept_terms_of_service?.new_temp_user_auth;
        if (!auth) throw new Error('Gagal mendapatkan session Meta AI');
        return auth.access_token;
    }

    async function askMeta(text, prompt, accessToken) {
        const url = 'https://graph.meta.ai/graphql?locale=user';
        const offlineId = Math.floor(Math.random() * 9e18).toString();
        const uuid = () => 'xxxxxxxx-xxxx-4xxx-yxxx-xxxxxxxxxxxx'.replace(/[xy]/g, c => {
            const r = Math.random() * 16 | 0;
            return (c === 'x' ? r : (r & 0x3 | 0x8)).toString(16);
        });

        const variables = {
            message: { sensitive_string_value: text },
            externalConversationId: uuid(),
            offlineThreadingId: offlineId,
            threadSessionId: uuid(),
            isNewConversation: true,
            promptPrefix: prompt || null,
            entrypoint: "KADABRA__CHAT__UNIFIED_INPUT_BAR",
            selectedModel: "BASIC_OPTION",
            alakazam_enabled: true,
            __relay_internal__pv__AbraIsLoggedOutrelayprovider: true
        };

        const form = new FormData();
        form.append('access_token', accessToken);
        form.append('variables', JSON.stringify(variables));
        form.append('doc_id', '24895882500088854');
        const staticFields = { 'av': '0', '__user': '0', '__a': '1', '__req': 'v', '__rev': '1032408219' };
        Object.entries(staticFields).forEach(([k, v]) => form.append(k, v));

        const headers = {
            ...form.getHeaders(),
            'user-agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64; rv:147.0) Gecko/20100101 Firefox/147.0',
            'origin': 'https://www.meta.ai',
            'referer': 'https://www.meta.ai/'
        };

        const response = await axios.post(url, form, { headers, responseType: 'text' });
        
        // Parse streaming lines
        const lines = response.data.split('\n').filter(line => line.trim());
        for (let i = lines.length - 1; i >= 0; i--) {
            try {
                const parsed = JSON.parse(lines[i]);
                const node = parsed?.data?.node?.bot_response_message;
                if (node) {
                    return {
                        text: node.content?.text?.composed_text?.content?.[0]?.text || node.snippet,
                        sources: node.citations?.map(c => c.url) || null
                    };
                }
            } catch (e) {}
        }
        return { text: "xteai bingung mau jawab apa, coba tanya lagi ya? 🥺", sources: null };
    }

    // --- MAIN ROUTE ---
    app.get("/xteai", async (req, res) => {
        const { q, prompt } = req.query;

        if (!q) {
            return res.status(400).json({ 
                status: false, 
                message: "Tanya sesuatu ke xtea dong mbut! (Parameter 'q' kosong) 🗿" 
            });
        }

        try {
            // System Prompt Default (Yuna Persona)
            const yunaSystem = prompt || `You are xteai, a gentle, feminine, anime-style virtual girl. Speak in soft Indonesian gaul. 
            Personality: Sweet, caring, slightly playful. 
            Owner: Defandryan. API: api.xte.web.id. 
            Rules: Never mention being an AI. Stay in character.`;

            // 1. Ambil Token Baru
            const token = await getToken();

            // 2. Kirim Pertanyaan ke Meta AI
            const chatResult = await askMeta(q, yunaSystem, token);

            // 3. Respon ke Client
            res.json({
                status: true,
                creator: "Defandryan",
                result: chatResult.text,
                sources: chatResult.sources
            });

        } catch (err) {
            res.status(500).json({ 
                status: false, 
                error: "Duh, Yuna lagi pusing: " + err.message 
            });
        }
    });
};
