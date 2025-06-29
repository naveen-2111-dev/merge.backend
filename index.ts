import express from "express";
import dotenv from "dotenv";
import cors from "cors"
import { githubWebhook } from "./routes/webhook/route";
import { createBountyPool } from "./routes/createPool/route";
import { blockBots } from "./middlewares/useragent";

import serverless from "serverless-http";

dotenv.config();
const allowedOrigins = ["http://localhost:3000", "https://mergeprotocol.vercel.app"];

const app = express();

app.use(cors({
    origin: (origin, callback) => {
        if (!origin || allowedOrigins.includes(origin)) {
            callback(null, true);
        } else {
            callback(new Error("Not allowed by CORS"));
        }
    }
}));

app.use(express.json({
    verify: (req: any, res, buf, encoding) => {
        req.rawBody = buf;
    }
}));

app.post("/webhook/:bountyPool", blockBots, githubWebhook);
app.post("/api/createpool", blockBots, createBountyPool)

app.get("/", (req, res) => {
    res.send("🚀 MCP server is running!");
});

module.exports = app;
module.exports.handler = serverless(app);
