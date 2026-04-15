import { Router } from "express";
import * as projectController from "../controllers/projectController.js";
import * as memberController from "../controllers/projectMemberController.js";
import {
  verifyToken,
  requireProjectRole,
  requireMember,
} from "../middlewares/authMiddleware.js";

const router = Router();

// GET /api/projects → Lấy danh sách tất cả dự án
router.get("/", projectController.getProjects);

// ── Member Management ────────────────────────────────────────
// GET    /api/projects/:projectId/members              → Xem danh sách thành viên (ADMIN + USER)
router.get(
  "/:projectId/members",
  verifyToken,
  requireMember,
  memberController.getMembers
);

// POST   /api/projects/:projectId/members              → Mời thành viên qua email (chỉ ADMIN)
router.post(
  "/:projectId/members",
  verifyToken,
  requireProjectRole(["ADMIN"]),
  memberController.addMember
);

// PATCH  /api/projects/:projectId/members/:userId/role → Đổi vai trò thành viên (chỉ ADMIN)
router.patch(
  "/:projectId/members/:userId/role",
  verifyToken,
  requireProjectRole(["ADMIN"]),
  memberController.changeRole
);

export default router;
