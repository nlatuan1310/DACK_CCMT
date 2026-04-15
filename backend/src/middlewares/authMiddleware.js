import jwt from "jsonwebtoken";
import prisma from "../config/prisma.js";

// ── Secret & config ──────────────────────────────────────────
const JWT_SECRET = process.env.JWT_SECRET || "fallback_secret";

// =============================================================
// 1) verifyToken — Xác thực JWT từ header Authorization
// =============================================================
/**
 * Đọc header `Authorization: Bearer <token>`, giải mã JWT.
 * Nếu hợp lệ  → gắn `req.user = { id, email, name }` rồi next().
 * Nếu thiếu/sai → trả HTTP 401 Unauthorized.
 */
export const verifyToken = (req, res, next) => {
  try {
    const authHeader = req.headers.authorization;

    if (!authHeader || !authHeader.startsWith("Bearer ")) {
      return res.status(401).json({
        success: false,
        message: "Không tìm thấy token xác thực. Vui lòng đăng nhập.",
      });
    }

    const token = authHeader.split(" ")[1];
    const decoded = jwt.verify(token, JWT_SECRET);

    // Gắn thông tin user đã giải mã vào request
    req.user = {
      id: decoded.id,
      email: decoded.email,
      name: decoded.name,
    };

    next();
  } catch (error) {
    if (error.name === "TokenExpiredError") {
      return res.status(401).json({
        success: false,
        message: "Token đã hết hạn. Vui lòng đăng nhập lại.",
      });
    }
    return res.status(401).json({
      success: false,
      message: "Token không hợp lệ.",
    });
  }
};

// =============================================================
// 2) requireProjectRole — Kiểm tra vai trò trong dự án (RBAC)
// =============================================================
/**
 * Factory middleware: nhận mảng roles được phép (VD: ["ADMIN"]).
 * Truy vấn bảng `ProjectMember` để kiểm tra vai trò của req.user
 * trong project hiện tại (lấy từ req.params.projectId hoặc req.body.projectId).
 *
 * ⚠️ Phải đặt SAU verifyToken trong chuỗi middleware.
 *
 * Ví dụ sử dụng:
 *   router.post("/", verifyToken, requireProjectRole(["ADMIN"]), controller);
 *   router.patch("/:id/status", verifyToken, requireProjectRole(["ADMIN", "USER"]), controller);
 *
 * @param {string[]} allowedRoles - Mảng vai trò cho phép, VD: ["ADMIN"] hoặc ["ADMIN", "USER"]
 * @returns {Function} Express middleware
 */
export const requireProjectRole = (allowedRoles) => {
  return async (req, res, next) => {
    try {
      // Lấy projectId từ params hoặc body
      const projectId = req.params.projectId || req.body.projectId;

      if (!projectId) {
        return res.status(400).json({
          success: false,
          message: "Thiếu projectId để kiểm tra quyền.",
        });
      }

      // Truy vấn bảng ProjectMember
      const membership = await prisma.projectMember.findUnique({
        where: {
          projectId_userId: {
            projectId: projectId,
            userId: req.user.id,
          },
        },
      });

      // Người dùng không phải thành viên dự án
      if (!membership) {
        return res.status(403).json({
          success: false,
          message: "Bạn không phải thành viên của dự án này.",
        });
      }

      // Kiểm tra role có nằm trong danh sách cho phép không
      if (!allowedRoles.includes(membership.role)) {
        return res.status(403).json({
          success: false,
          message: `Bạn không có quyền thực hiện hành động này. Yêu cầu: ${allowedRoles.join(" hoặc ")}.`,
        });
      }

      // Gắn thông tin membership vào request để controller sử dụng
      req.membership = membership;

      next();
    } catch (error) {
      console.error("❌ requireProjectRole error:", error.message);
      return res.status(500).json({
        success: false,
        message: "Lỗi khi kiểm tra quyền truy cập.",
      });
    }
  };
};

// =============================================================
// 3) requireMember — Shortcut: chỉ cần là thành viên dự án
// =============================================================
/**
 * Middleware tiện ích: chỉ kiểm tra user có thuộc dự án hay không,
 * không phân biệt role (ADMIN hay USER đều được).
 *
 * ⚠️ Phải đặt SAU verifyToken trong chuỗi middleware.
 */
export const requireMember = requireProjectRole(["ADMIN", "USER"]);
