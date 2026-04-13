import * as issueService from "../services/issueService.js";

/**
 * POST /api/issues
 * Tạo một Issue mới (Epic / Story / Task).
 */
export async function createIssue(req, res, next) {
  try {
    const issue = await issueService.createIssue(req.body);

    res.status(201).json({
      success: true,
      message: "Tạo Issue thành công.",
      data: issue,
    });
  } catch (err) {
    next(err);
  }
}

/**
 * PATCH /api/issues/:id/status
 * Cập nhật trạng thái của Issue (dùng cho kéo-thả Kanban).
 */
export async function updateStatus(req, res, next) {
  try {
    const { id } = req.params;
    const { status, orderIndex } = req.body;

    if (!status) {
      const err = new Error("Trường status là bắt buộc.");
      err.statusCode = 400;
      throw err;
    }

    const updated = await issueService.updateIssueStatus(
      id,
      status,
      orderIndex
    );

    res.json({
      success: true,
      message: "Cập nhật trạng thái thành công.",
      data: updated,
    });
  } catch (err) {
    next(err);
  }
}
