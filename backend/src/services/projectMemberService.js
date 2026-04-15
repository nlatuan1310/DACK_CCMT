import prisma from "../config/prisma.js";

// =============================================================
// 1) getMembers — Lấy danh sách thành viên của dự án
// =============================================================
/**
 * Truy vấn tất cả thành viên thuộc một dự án, kèm thông tin user.
 *
 * @param {string} projectId - ID của dự án
 * @returns {Promise<Object[]>} Danh sách thành viên kèm thông tin user
 */
export async function getMembers(projectId) {
  const members = await prisma.projectMember.findMany({
    where: { projectId },
    include: {
      user: {
        select: {
          id: true,
          email: true,
          name: true,
          avatarUrl: true,
        },
      },
    },
    orderBy: { joinedAt: "asc" },
  });

  return members;
}

// =============================================================
// 2) addMemberByEmail — Mời thành viên vào dự án qua email
// =============================================================
/**
 * Tìm user theo email và thêm vào dự án với role mặc định USER.
 *
 * @param {string} projectId - ID của dự án
 * @param {string} email     - Email của người được mời
 * @returns {Promise<Object>} Thành viên vừa được thêm kèm thông tin user
 * @throws {Error} 404 nếu không tìm thấy email, 409 nếu đã là thành viên
 */
export async function addMemberByEmail(projectId, email) {
  // Bước 1: Tìm user theo email
  const user = await prisma.user.findUnique({
    where: { email },
  });

  if (!user) {
    const err = new Error("Không tìm thấy người dùng với email này.");
    err.statusCode = 404;
    throw err;
  }

  // Bước 2: Kiểm tra user đã là thành viên chưa
  const existing = await prisma.projectMember.findUnique({
    where: {
      projectId_userId: {
        projectId,
        userId: user.id,
      },
    },
  });

  if (existing) {
    const err = new Error("Người dùng đã là thành viên của dự án.");
    err.statusCode = 409;
    throw err;
  }

  // Bước 3: Tạo membership mới với role mặc định USER
  const member = await prisma.projectMember.create({
    data: {
      projectId,
      userId: user.id,
      role: "USER",
    },
    include: {
      user: {
        select: {
          id: true,
          email: true,
          name: true,
          avatarUrl: true,
        },
      },
    },
  });

  return member;
}

// =============================================================
// 3) changeMemberRole — Thay đổi vai trò thành viên
// =============================================================
/**
 * Thăng cấp hoặc hạ cấp vai trò của một thành viên trong dự án.
 *
 * @param {string} projectId - ID của dự án
 * @param {string} userId    - ID của thành viên cần đổi role
 * @param {string} newRole   - Vai trò mới ("ADMIN" hoặc "USER")
 * @returns {Promise<Object>} Thành viên đã cập nhật kèm thông tin user
 * @throws {Error} 400 nếu role không hợp lệ, 404 nếu member không tồn tại
 */
export async function changeMemberRole(projectId, userId, newRole) {
  // Bước 1: Validate role
  const validRoles = ["ADMIN", "USER"];
  if (!validRoles.includes(newRole)) {
    const err = new Error(
      `Role không hợp lệ. Chỉ chấp nhận: ${validRoles.join(", ")}.`
    );
    err.statusCode = 400;
    throw err;
  }

  // Bước 2: Kiểm tra membership tồn tại
  const existing = await prisma.projectMember.findUnique({
    where: {
      projectId_userId: {
        projectId,
        userId,
      },
    },
  });

  if (!existing) {
    const err = new Error("Thành viên không tồn tại trong dự án.");
    err.statusCode = 404;
    throw err;
  }

  // Bước 3: Cập nhật role
  const updated = await prisma.projectMember.update({
    where: {
      projectId_userId: {
        projectId,
        userId,
      },
    },
    data: { role: newRole },
    include: {
      user: {
        select: {
          id: true,
          email: true,
          name: true,
          avatarUrl: true,
        },
      },
    },
  });

  return updated;
}
