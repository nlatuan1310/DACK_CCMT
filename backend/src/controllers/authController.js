import * as authService from "../services/authService.js";

// =============================================================
// POST /api/auth/register — Đăng ký tài khoản mới
// =============================================================
export async function register(req, res, next) {
  try {
    const { name, email, password } = req.body;

    // Validate đầu vào cơ bản
    if (!name || !email || !password) {
      return res.status(400).json({
        success: false,
        message: "Vui lòng nhập đầy đủ Tên, Email và Mật khẩu.",
      });
    }

    if (password.length < 6) {
      return res.status(400).json({
        success: false,
        message: "Mật khẩu phải có ít nhất 6 ký tự.",
      });
    }

    const result = await authService.register({ name, email, password });

    res.status(201).json({
      success: true,
      message: "Đăng ký thành công!",
      data: result,
    });
  } catch (err) {
    next(err);
  }
}

// =============================================================
// POST /api/auth/login — Đăng nhập
// =============================================================
export async function login(req, res, next) {
  try {
    const { email, password } = req.body;

    // Validate đầu vào cơ bản
    if (!email || !password) {
      return res.status(400).json({
        success: false,
        message: "Vui lòng nhập Email và Mật khẩu.",
      });
    }

    const result = await authService.login({ email, password });

    res.json({
      success: true,
      message: "Đăng nhập thành công!",
      data: result,
    });
  } catch (err) {
    next(err);
  }
}

// =============================================================
// GET /api/auth/me — Lấy thông tin người dùng hiện tại
// =============================================================
/**
 * Route này yêu cầu verifyToken chạy trước.
 * req.user.id đã được gắn sẵn từ middleware.
 */
export async function getMe(req, res, next) {
  try {
    const user = await authService.getMe(req.user.id);

    res.json({
      success: true,
      data: user,
    });
  } catch (err) {
    next(err);
  }
}
