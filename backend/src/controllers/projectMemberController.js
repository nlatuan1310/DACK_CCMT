import * as memberService from "../services/projectMemberService.js";

// =============================================================
// GET /api/projects/:projectId/members
// Lấy danh sách thành viên của dự án
// =============================================================
/**
 * Trả về danh sách tất cả thành viên kèm vai trò và thông tin user.
 * Mở cho cả ADMIN và USER (middleware requireMember đã chặn ngoài).
 */
export async function getMembers(req, res, next) {
  try {
    const { projectId } = req.params;

    const members = await memberService.getMembers(projectId);

    res.json({
      success: true,
      data: members,
      total: members.length,
    });
  } catch (err) {
    next(err);
  }
}

// =============================================================
// POST /api/projects/:projectId/members
// Mời thành viên mới vào dự án qua email
// =============================================================
/**
 * Nhận email từ body, tìm user và thêm vào dự án với role USER.
 * Chỉ ADMIN mới được gọi (middleware requireProjectRole đã chặn ngoài).
 */
export async function addMember(req, res, next) {
  try {
    const { projectId } = req.params;
    const { email } = req.body;

    // Validate đầu vào
    if (!email) {
      return res.status(400).json({
        success: false,
        message: "Vui lòng cung cấp email của người dùng cần mời.",
      });
    }

    const member = await memberService.addMemberByEmail(projectId, email);

    res.status(201).json({
      success: true,
      message: "Thêm thành viên thành công.",
      data: member,
    });
  } catch (err) {
    next(err);
  }
}

// =============================================================
// PATCH /api/projects/:projectId/members/:userId/role
// Thay đổi vai trò của thành viên (thăng/hạ cấp)
// =============================================================
/**
 * Nhận role mới từ body, cập nhật vai trò thành viên.
 * Chỉ ADMIN mới được gọi (middleware requireProjectRole đã chặn ngoài).
 */
export async function changeRole(req, res, next) {
  try {
    const { projectId, userId } = req.params;
    const { role } = req.body;

    // Validate đầu vào
    if (!role) {
      return res.status(400).json({
        success: false,
        message: "Vui lòng cung cấp vai trò mới (ADMIN hoặc USER).",
      });
    }

    const updated = await memberService.changeMemberRole(
      projectId,
      userId,
      role
    );

    res.json({
      success: true,
      message: "Cập nhật vai trò thành công.",
      data: updated,
    });
  } catch (err) {
    next(err);
  }
}
