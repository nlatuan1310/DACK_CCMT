import { Router } from "express";
import * as issueController from "../controllers/issueController.js";

const router = Router();

// GET    /api/issues            → Lấy danh sách Issue (hỗ trợ filter)
router.get("/", issueController.getIssues);

// POST   /api/issues            → Tạo Issue mới
router.post("/", issueController.createIssue);

// PATCH  /api/issues/:id/status → Cập nhật trạng thái
router.patch("/:id/status", issueController.updateStatus);

export default router;
