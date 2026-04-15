import prisma from "../config/prisma.js";

/**
 * Lấy danh sách tất cả Project.
 * Dùng cho dropdown "Chọn dự án" trên Frontend.
 *
 * @returns {Promise<Object[]>} Danh sách Project
 */
export async function getProjects(userId) {
  const projects = await prisma.project.findMany({
    where: {
      members: {
        some: { userId: userId }
      }
    },
    select: {
      id: true,
      name: true,
      key: true,
      description: true,
      members: {
        where: { userId: userId },
        select: { role: true }
      }
    },
    orderBy: { name: "asc" },
  });

  return projects;
}

// =============================================================
// createProject — Tạo dự án mới + tự động gán ADMIN cho người tạo
// =============================================================
/**
 * Tạo một dự án mới và tự động thêm người tạo vào bảng ProjectMember
 * với vai trò ADMIN. Sử dụng transaction để đảm bảo tính toàn vẹn.
 *
 * @param {Object} data - Dữ liệu dự án { name, key, description }
 * @param {string} creatorId - ID của user đang tạo dự án
 * @returns {Promise<Object>} Dự án vừa tạo kèm danh sách members
 */
export async function createProject(data, creatorId) {
  const { name, key, description } = data;

  // Validate bắt buộc
  if (!name || !name.trim()) {
    const err = new Error("Tên dự án (name) là bắt buộc.");
    err.statusCode = 400;
    throw err;
  }

  if (!key || !key.trim()) {
    const err = new Error("Mã dự án (key) là bắt buộc.");
    err.statusCode = 400;
    throw err;
  }

  // Kiểm tra key trùng
  const existing = await prisma.project.findUnique({
    where: { key: key.trim().toUpperCase() },
  });

  if (existing) {
    const err = new Error(`Mã dự án "${key}" đã tồn tại.`);
    err.statusCode = 409;
    throw err;
  }

  // Transaction: Tạo project + Gán creator làm ADMIN
  const project = await prisma.$transaction(async (tx) => {
    // Bước 1: Tạo project
    const newProject = await tx.project.create({
      data: {
        name: name.trim(),
        key: key.trim().toUpperCase(),
        description: description?.trim() || null,
      },
    });

    // Bước 2: Tự động gán người tạo làm ADMIN
    await tx.projectMember.create({
      data: {
        projectId: newProject.id,
        userId: creatorId,
        role: "ADMIN",
      },
    });

    // Trả về project kèm members
    return tx.project.findUnique({
      where: { id: newProject.id },
      include: {
        members: {
          include: {
            user: {
              select: { id: true, email: true, name: true, avatarUrl: true },
            },
          },
        },
      },
    });
  });

  return project;
}
