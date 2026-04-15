import { Router } from "express";
import * as issueController from "../controllers/issueController.js";
import {
  verifyToken,
  requireProjectRole,
  requireMember,
} from "../middlewares/authMiddleware.js";
import prisma from "../config/prisma.js";

const router = Router();

// ── Middleware phụ: Resolve projectId từ Issue ───────────────
/**
 * Dùng cho các route có :id (issueId) nhưng không có projectId.
 * Truy vấn DB lấy projectId của issue rồi gắn vào req.body.projectId
 * để requireProjectRole / requireMember có thể kiểm tra.
 */
const resolveIssueProjectId = async (req, res, next) => {
  try {
    const issue = await prisma.issue.findUnique({
      where: { id: req.params.id },
      select: { projectId: true },
    });

    if (!issue) {
      return res.status(404).json({
        success: false,
        message: `Không tìm thấy Issue với id: ${req.params.id}`,
      });
    }

    // Gắn projectId vào body để middleware RBAC sử dụng
    req.body.projectId = issue.projectId;
    next();
  } catch (error) {
    next(error);
  }
};

// GET    /api/issues            → Lấy danh sách Issue (hỗ trợ filter)
router.get("/", verifyToken, issueController.getIssues);

// POST   /api/issues            → Tạo Issue mới (CHỈ ADMIN)
// projectId đã có sẵn trong req.body → requireProjectRole đọc trực tiếp
router.post(
  "/",
  verifyToken,
  requireProjectRole(["ADMIN"]),
  issueController.createIssue
);

// PATCH  /api/issues/:id/status → Cập nhật trạng thái (ADMIN + USER đều được)
// Cần resolveIssueProjectId trước vì route chỉ có :id, không có projectId
router.patch(
  "/:id/status",
  verifyToken,
  resolveIssueProjectId,
  requireMember,
  issueController.updateStatus
);

export default router;

