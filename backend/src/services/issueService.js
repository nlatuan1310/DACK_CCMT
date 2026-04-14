import prisma from "../config/prisma.js";

// ── Trạng thái hợp lệ ───────────────────────────────────────
const VALID_STATUSES = ["TODO", "IN_PROGRESS", "TEST", "DONE"];
const VALID_TYPES = ["EPIC", "STORY", "TASK"];

/**
 * Tạo một Issue mới.
 * @param {Object} data - Dữ liệu issue từ request body
 * @returns {Promise<Object>} Issue vừa tạo
 */
export async function createIssue(data) {
  const {
    title,
    description,
    type = "TASK",
    status = "TODO",
    priority = 0,
    projectId,
    assigneeId,
    reporterId,
    parentId,
  } = data;

  // ── Validate bắt buộc ──────────────────────────────────────
  if (!title || !title.trim()) {
    const err = new Error("Tiêu đề (title) là bắt buộc.");
    err.statusCode = 400;
    throw err;
  }

  if (!projectId) {
    const err = new Error("Mã dự án (projectId) là bắt buộc.");
    err.statusCode = 400;
    throw err;
  }

  // ── Validate enum ──────────────────────────────────────────
  if (!VALID_TYPES.includes(type)) {
    const err = new Error(
      `type phải là một trong: ${VALID_TYPES.join(", ")}`
    );
    err.statusCode = 400;
    throw err;
  }

  if (!VALID_STATUSES.includes(status)) {
    const err = new Error(
      `status phải là một trong: ${VALID_STATUSES.join(", ")}`
    );
    err.statusCode = 400;
    throw err;
  }

  // ── Kiểm tra project tồn tại ──────────────────────────────
  const project = await prisma.project.findUnique({
    where: { id: projectId },
  });

  if (!project) {
    const err = new Error(`Không tìm thấy Project với id: ${projectId}`);
    err.statusCode = 404;
    throw err;
  }

  // ── Tính orderIndex tự động (đẩy xuống cuối cột) ──────────
  const maxOrder = await prisma.issue.aggregate({
    where: { projectId, status },
    _max: { orderIndex: true },
  });
  const nextOrder = (maxOrder._max.orderIndex ?? -1) + 1;

  // ── Tạo Issue ──────────────────────────────────────────────
  const issue = await prisma.issue.create({
    data: {
      title: title.trim(),
      description: description?.trim() || null,
      type,
      status,
      priority,
      orderIndex: nextOrder,
      projectId,
      assigneeId: assigneeId || null,
      reporterId: reporterId || null,
      parentId: parentId || null,
    },
    include: {
      assignee: { select: { id: true, name: true, avatarUrl: true } },
      reporter: { select: { id: true, name: true, avatarUrl: true } },
      project: { select: { id: true, name: true, key: true } },
    },
  });

  return issue;
}

/**
 * Cập nhật trạng thái (status) của Issue.
 * Dùng khi kéo thả trên Kanban board hoặc chuyển cột thủ công.
 *
 * @param {string} issueId - ID của issue cần cập nhật
 * @param {string} newStatus - Trạng thái mới (TODO | IN_PROGRESS | TEST | DONE)
 * @param {number} [orderIndex] - Vị trí mới trong cột (tuỳ chọn)
 * @returns {Promise<Object>} Issue sau khi cập nhật
 */
export async function updateIssueStatus(issueId, newStatus, orderIndex) {
  // ── Validate status ────────────────────────────────────────
  if (!VALID_STATUSES.includes(newStatus)) {
    const err = new Error(
      `status phải là một trong: ${VALID_STATUSES.join(", ")}`
    );
    err.statusCode = 400;
    throw err;
  }

  // ── Kiểm tra issue tồn tại ────────────────────────────────
  const existing = await prisma.issue.findUnique({
    where: { id: issueId },
  });

  if (!existing) {
    const err = new Error(`Không tìm thấy Issue với id: ${issueId}`);
    err.statusCode = 404;
    throw err;
  }

  // ── Tính orderIndex nếu không truyền ──────────────────────
  let finalOrder = orderIndex;
  if (finalOrder === undefined || finalOrder === null) {
    const maxOrder = await prisma.issue.aggregate({
      where: { projectId: existing.projectId, status: newStatus },
      _max: { orderIndex: true },
    });
    finalOrder = (maxOrder._max.orderIndex ?? -1) + 1;
  }

  // ── Cập nhật ──────────────────────────────────────────────
  const updated = await prisma.issue.update({
    where: { id: issueId },
    data: {
      status: newStatus,
      orderIndex: finalOrder,
    },
    include: {
      assignee: { select: { id: true, name: true, avatarUrl: true } },
      reporter: { select: { id: true, name: true, avatarUrl: true } },
      project: { select: { id: true, name: true, key: true } },
    },
  });

  return updated;
}

/**
 * Lấy danh sách Issue, hỗ trợ lọc theo project / status / type / assignee.
 *
 * @param {Object} filters - Query params từ request
 * @param {string} [filters.projectId] - Lọc theo dự án
 * @param {string} [filters.status]    - Lọc theo trạng thái
 * @param {string} [filters.type]      - Lọc theo loại (EPIC/STORY/TASK)
 * @param {string} [filters.assigneeId]- Lọc theo người được giao
 * @returns {Promise<Object[]>} Danh sách Issue kèm thông tin Assignee
 */
export async function getIssues(filters = {}) {
  const where = {};

  if (filters.projectId) where.projectId = filters.projectId;
  if (filters.status) where.status = filters.status;
  if (filters.type) where.type = filters.type;
  if (filters.assigneeId) where.assigneeId = filters.assigneeId;

  const issues = await prisma.issue.findMany({
    where,
    include: {
      assignee: { select: { id: true, name: true, avatarUrl: true } },
      reporter: { select: { id: true, name: true, avatarUrl: true } },
      project: { select: { id: true, name: true, key: true } },
      children: {
        select: { id: true, title: true, status: true, type: true },
      },
    },
    orderBy: [{ status: "asc" }, { orderIndex: "asc" }],
  });

  return issues;
}
