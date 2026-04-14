import "dotenv/config";
import express from "express";
import cors from "cors";
import issueRoutes from "./routes/issueRoutes.js";
import userRoutes from "./routes/userRoutes.js";
import projectRoutes from "./routes/projectRoutes.js";
import { errorHandler } from "./middlewares/errorHandler.js";

const app = express();
const PORT = process.env.PORT || 5000;

// ── CORS — cho phép Frontend gọi API ────────────────────────
const corsOptions = {
  origin: [
    "http://localhost:5173", // Vite dev server
    "http://localhost:3000", // Dự phòng
  ],
  methods: ["GET", "POST", "PATCH", "PUT", "DELETE"],
  allowedHeaders: ["Content-Type", "Authorization"],
  credentials: true,
};
app.use(cors(corsOptions));

// ── Parse JSON body ──────────────────────────────────────────
app.use(express.json());

// ── Health-check ─────────────────────────────────────────────
app.get("/api/health", (_req, res) => {
  res.json({ status: "ok", timestamp: new Date().toISOString() });
});

// ── Routes ───────────────────────────────────────────────────
app.use("/api/issues", issueRoutes);
app.use("/api/users", userRoutes);
app.use("/api/projects", projectRoutes);

// ── Error handler (phải đặt cuối cùng) ──────────────────────
app.use(errorHandler);

// ── Start server ─────────────────────────────────────────────
app.listen(PORT, () => {
  console.log(`🚀 Server đang chạy tại http://localhost:${PORT}`);
});
