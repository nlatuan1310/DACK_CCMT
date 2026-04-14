import * as projectService from "../services/projectService.js";

/**
 * GET /api/projects
 * Lấy danh sách tất cả Project (dùng cho dropdown chọn dự án trên Frontend).
 */
export async function getProjects(req, res, next) {
  try {
    const projects = await projectService.getProjects();

    res.json({
      success: true,
      data: projects,
      total: projects.length,
    });
  } catch (err) {
    next(err);
  }
}
