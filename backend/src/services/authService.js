import bcrypt from "bcryptjs";
import jwt from "jsonwebtoken";
import prisma from "../config/prisma.js";

// ── Config ───────────────────────────────────────────────────
const JWT_SECRET = process.env.JWT_SECRET || "fallback_secret";
const JWT_EXPIRES_IN = process.env.JWT_EXPIRES_IN || "7d";
const SALT_ROUNDS = 10;

// =============================================================
// Hàm helper — Tạo JWT token
// =============================================================
function generateToken(user) {
  return jwt.sign(
    { id: user.id, email: user.email, name: user.name },
    JWT_SECRET,
    { expiresIn: JWT_EXPIRES_IN }
  );
}

// =============================================================
// 1) Đăng ký (Register)
// =============================================================
/**
 * Tạo User mới: băm mật khẩu → lưu DB → trả token.
 * @param {{ name: string, email: string, password: string }} data
 */
export async function register({ name, email, password }) {
  // Kiểm tra email đã tồn tại chưa
  const existingUser = await prisma.user.findUnique({
    where: { email },
  });

  if (existingUser) {
    const error = new Error("Email này đã được đăng ký.");
    error.statusCode = 409; // Conflict
    throw error;
  }

  // Băm mật khẩu
  const hashedPassword = await bcrypt.hash(password, SALT_ROUNDS);

  // Tạo User mới trong DB
  const newUser = await prisma.user.create({
    data: {
      name,
      email,
      password: hashedPassword,
    },
  });

  // Tạo JWT
  const token = generateToken(newUser);

  return {
    user: {
      id: newUser.id,
      name: newUser.name,
      email: newUser.email,
      avatarUrl: newUser.avatarUrl,
    },
    token,
  };
}

// =============================================================
// 2) Đăng nhập (Login)
// =============================================================
/**
 * Kiểm tra email/password → trả token nếu hợp lệ.
 * @param {{ email: string, password: string }} data
 */
export async function login({ email, password }) {
  // Tìm user theo email
  const user = await prisma.user.findUnique({
    where: { email },
  });

  if (!user) {
    const error = new Error("Email hoặc mật khẩu không đúng.");
    error.statusCode = 401;
    throw error;
  }

  // So sánh hash mật khẩu
  const isMatch = await bcrypt.compare(password, user.password);

  if (!isMatch) {
    const error = new Error("Email hoặc mật khẩu không đúng.");
    error.statusCode = 401;
    throw error;
  }

  // Tạo JWT
  const token = generateToken(user);

  return {
    user: {
      id: user.id,
      name: user.name,
      email: user.email,
      avatarUrl: user.avatarUrl,
    },
    token,
  };
}

// =============================================================
// 3) Lấy thông tin cá nhân (Me)
// =============================================================
/**
 * Trả về thông tin User dựa trên ID (đã giải mã từ token).
 * @param {string} userId
 */
export async function getMe(userId) {
  const user = await prisma.user.findUnique({
    where: { id: userId },
    select: {
      id: true,
      name: true,
      email: true,
      avatarUrl: true,
      createdAt: true,
    },
  });

  if (!user) {
    const error = new Error("Không tìm thấy người dùng.");
    error.statusCode = 404;
    throw error;
  }

  return user;
}
