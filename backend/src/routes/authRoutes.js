import { Router } from "express";
import * as authController from "../controllers/authController.js";
import { verifyToken } from "../middlewares/authMiddleware.js";

const router = Router();

// POST /api/auth/register → Đăng ký tài khoản mới
router.post("/register", authController.register);

// POST /api/auth/login → Đăng nhập
router.post("/login", authController.login);

// GET /api/auth/me → Lấy thông tin user hiện tại (cần token)
router.get("/me", verifyToken, authController.getMe);

export default router;
