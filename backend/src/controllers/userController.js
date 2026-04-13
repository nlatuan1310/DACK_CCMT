import * as userService from "../services/userService.js";

/**
 * GET /api/users
 * Trả về danh sách User (phục vụ dropdown Filter & Assign).
 */
export async function getUsers(req, res, next) {
  try {
    const users = await userService.getUsers();

    res.json({
      success: true,
      data: users,
    });
  } catch (err) {
    next(err);
  }
}
