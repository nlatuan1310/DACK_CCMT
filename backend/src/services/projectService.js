import prisma from "../config/prisma.js";

/**
 * Lấy danh sách tất cả Project.
 * Dùng cho dropdown "Chọn dự án" trên Frontend.
 *
 * @returns {Promise<Object[]>} Danh sách Project
 */
export async function getProjects() {
  const projects = await prisma.project.findMany({
    select: {
      id: true,
      name: true,
      key: true,
      description: true,
    },
    orderBy: { name: "asc" },
  });

  return projects;
}
