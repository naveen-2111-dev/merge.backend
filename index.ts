import express from "express";
import dotenv from "dotenv";
import { githubWebhook } from "./routes/webhook/route";
import { createBountyPool } from "./routes/createPool/route";
import { blockBots } from "./middlewares/useragent";

dotenv.config();

const app = express();

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

// const PORT = process.env.PORT || 3000;
// app.listen(PORT, () => {
//     console.log(`Server running on http://localhost:${PORT}`);
// });
