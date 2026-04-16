import * as projectService from "../services/projectService.js";

/**
 * GET /api/projects
 * Lấy danh sách tất cả Project (dùng cho dropdown chọn dự án trên Frontend).
 */
export async function getProjects(req, res, next) {
  try {
    const projects = await projectService.getProjects(req.user.id);

    res.json({
      success: true,
      data: projects,
      total: projects.length,
    });
  } catch (err) {
    next(err);
  }
}

// =============================================================
// POST /api/projects — Tạo dự án mới
// =============================================================
/**
 * Tạo dự án mới. Người gửi request (req.user) sẽ tự động được gán
 * làm ADMIN của dự án vừa tạo thông qua bảng ProjectMember.
 *
 * ⚠️ Yêu cầu verifyToken chạy trước (req.user.id phải có).
 */
export async function createProject(req, res, next) {
  try {
    const { name, key, description } = req.body;

    const project = await projectService.createProject(
      { name, key, description },
      req.user.id
    );

    res.status(201).json({
      success: true,
      message: "Tạo dự án thành công. Bạn đã được gán làm ADMIN.",
      data: project,
    });
  } catch (err) {
    next(err);
  }
}

/**
 * DELETE /api/projects/:projectId
 * Xóa dự án (chỉ ADMIN).
 */
export async function deleteProject(req, res, next) {
  try {
    const { projectId } = req.params;
    await projectService.deleteProject(projectId);
    res.json({
      success: true,
      message: "Xóa dự án thành công.",
    });
  } catch (err) {
    next(err);
  }
}
