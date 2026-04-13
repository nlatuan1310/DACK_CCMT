import prisma from "../config/prisma.js";

/**
 * Lấy danh sách tất cả User.
 * Dùng cho dropdown Assign / Filter trên Frontend.
 *
 * @returns {Promise<Object[]>} Danh sách User
 */
export async function getUsers() {
  const users = await prisma.user.findMany({
    select: {
      id: true,
      name: true,
      email: true,
      avatarUrl: true,
    },
    orderBy: { name: "asc" },
  });

  return users;
}
