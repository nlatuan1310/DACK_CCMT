import "dotenv/config";
import express from "express";
import cors from "cors";
import issueRoutes from "./routes/issueRoutes.js";
import { errorHandler } from "./middlewares/errorHandler.js";

const app = express();
const PORT = process.env.PORT || 5000;

// ── Middlewares ──────────────────────────────────────────────
app.use(cors());
app.use(express.json());

// ── Health-check ─────────────────────────────────────────────
app.get("/api/health", (_req, res) => {
  res.json({ status: "ok", timestamp: new Date().toISOString() });
});

// ── Routes ───────────────────────────────────────────────────
app.use("/api/issues", issueRoutes);

// ── Error handler (phải đặt cuối cùng) ──────────────────────
app.use(errorHandler);

// ── Start server ─────────────────────────────────────────────
app.listen(PORT, () => {
  console.log(`🚀 Server đang chạy tại http://localhost:${PORT}`);
});
