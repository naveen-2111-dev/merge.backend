import express from "express";
import dotenv from "dotenv";
import cors from "cors"
import cookieParser from "cookie-parser";
import { githubWebhook } from "./routes/webhook/route";
import { createBountyPool } from "./routes/createPool/route";
import { blockBots } from "./middlewares/useragent";

import serverless from "serverless-http";
import { githubCallback } from "./routes/callback/route";

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

app.use(cookieParser());

app.use(express.json({
    verify: (req: any, res, buf, encoding) => {
        req.rawBody = buf;
    }
}));

app.post("/webhook/:bountyPool", blockBots, githubWebhook);
app.get("/call__back", blockBots, githubCallback)
app.post("/api/createpool", blockBots, createBountyPool)

app.get("/", (req, res) => {
    res.send("🚀 MCP server is running!");
});

module.exports = app;
module.exports.handler = serverless(app);
