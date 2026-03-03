
const express = require("express");
const fs = require("fs");
const cors = require("cors");
const path = require("path");
const axios = require("axios");
const multer = require("multer");
require("dotenv").config();

const app = express();
const DISCORD_WEBHOOK_URL = process.env.DISCORD_WEBHOOK || "https://discord.com/api/webhooks/1475655302383665213/U5FwGe2sMbUcujPKvq9fgLdjIO3Euf1xxsgI95fwHcaYHJ-x3VBAh_wSCENEnpK6p0h1";

const upload = multer({
    dest: "/tmp/",
    limits: { fileSize: 10 * 1024 * 1024 }
});

async function sendDiscord(message, embed = null) {
    if (!DISCORD_WEBHOOK_URL) return;
    try {
        const payload = { content: message };
        if (embed) payload.embeds = [embed];
        await axios.post(DISCORD_WEBHOOK_URL, payload);
    } catch (err) {
        console.error("Discord Error:", err.message);
    }
}

app.enable("trust proxy");
app.use(express.json());
app.use(express.urlencoded({ extended: false }));
app.use(cors());
app.set("json spaces", 2);

app.use((req, res, next) => {
    const originalJson = res.json;
    res.json = function (data) {
        if (typeof data === "object") {
            data = {
                status: data.status ?? true,
                creator: "D2:業",
                ...data
            };
        }
        return originalJson.call(this, data);
    };
    next();
});

const requestLog = new Map();
const bannedIPs = new Set();
const SPAM_LIMIT = 20;
const BAN_TIME = 60000;

app.use((req, res, next) => {
    const ip = req.headers["x-forwarded-for"]?.split(",")[0] || req.socket.remoteAddress;
    const now = Date.now();

    if (bannedIPs.has(ip)) {
        return res.status(429).json({ status: false, message: "Too many requests." });
    }

    if (!requestLog.has(ip)) requestLog.set(ip, []);
    const logs = requestLog.get(ip).filter((t) => now - t < 60000);
    logs.push(now);
    requestLog.set(ip, logs);

    if (logs.length > SPAM_LIMIT) {
        bannedIPs.add(ip);
        sendDiscord("⚠️ SPAM DETECTED", {
            color: 16711680,
            fields: [
                { name: "IP", value: `\`${ip}\`` },
                { name: "Path", value: `\`${req.url}\`` },
                { name: "Requests/min", value: `\`${logs.length}\`` }
            ],
            timestamp: new Date()
        });
        setTimeout(() => {
            bannedIPs.delete(ip);
            requestLog.delete(ip);
        }, BAN_TIME);
        return res.status(429).json({ status: false, message: "Spam detected." });
    }
    next();
});

app.use("/", express.static(path.join(__dirname, "api-page")));
app.use("/src", express.static(path.join(__dirname, "src")));

const apiFolder = path.join(__dirname, "src", "api");
if (fs.existsSync(apiFolder)) {
    const categories = fs.readdirSync(apiFolder);
    categories.forEach((category) => {
        const categoryPath = path.join(apiFolder, category);
        if (fs.statSync(categoryPath).isDirectory()) {
            const files = fs.readdirSync(categoryPath);
            files.forEach((file) => {
                if (file.endsWith(".js")) {
                    try {
                        const route = require(path.join(categoryPath, file));
                        if (typeof route === "function") {
                            route(app, upload);
                            console.log("Loaded:", file);
                        }
                    } catch (err) {
                        console.error("Route Error:", file, err.message);
                        sendDiscord("❌ ROUTE LOAD ERROR", {
                            color: 16711680,
                            fields: [
                                { name: "File", value: `\`${file}\`` },
                                { name: "Error", value: `\`${err.message}\`` }
                            ],
                            timestamp: new Date()
                        });
                    }
                }
            });
        }
    });
}

app.post("/api/request", async (req, res) => {
    const { name, detail } = req.body;
    const ip = req.headers["x-forwarded-for"]?.split(",")[0] || req.socket.remoteAddress;
    await sendDiscord("🚀 NEW REQUEST", {
        color: 3447003,
        fields: [
            { name: "Name", value: name || "N/A", inline: true },
            { name: "Type", value: "Request", inline: true },
            { name: "IP", value: `||\`${ip}\`||`, inline: true },
            { name: "Detail", value: `\`\`\`\n${detail || "N/A"}\n\`\`\`` }
        ],
        timestamp: new Date()
    });
    res.json({ message: "Request sent successfully." });
});

app.get("/", (req, res) => res.sendFile(path.join(__dirname, "api-page", "index.html")));
app.get("/docs", (req, res) => res.sendFile(path.join(__dirname, "api-page", "docs.html")));
app.get("/dev", (req, res) => res.sendFile(path.join(__dirname, "api-page", "dev.html")));
app.get("/nt", (req, res) => res.sendFile(path.join(__dirname, "api-page", "nt.html")));
app.get("/req", (req, res) => res.sendFile(path.join(__dirname, "api-page", "r.html")));

const openApiPath = path.join(__dirname, "src", "openapi.json");
if (fs.existsSync(openApiPath)) {
    app.get("/openapi.json", (req, res) => res.sendFile(openApiPath));
}

app.use((err, req, res, next) => {
    const ip = req.headers["x-forwarded-for"]?.split(",")[0] || req.socket.remoteAddress;
    console.error("Runtime Error:", req.url, err.message);
    sendDiscord("🚨 SERVER RUNTIME ERROR", {
        color: 15105570,
        fields: [
            { name: "Path", value: `\`${req.url}\`` },
            { name: "Method", value: `\`${req.method}\`` },
            { name: "IP", value: `\`${ip}\`||`, inline: true },
            { name: "Error", value: `\`${err.message}\`` }
        ],
        timestamp: new Date()
    });
    res.status(500).json({ status: false, error: "Internal Server Error" });
});

module.exports = app;
