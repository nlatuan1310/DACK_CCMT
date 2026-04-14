import { Router } from "express";
import * as projectController from "../controllers/projectController.js";

const router = Router();

// GET /api/projects → Lấy danh sách tất cả dự án
router.get("/", projectController.getProjects);

export default router;
