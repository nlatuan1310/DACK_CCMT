import apiClient from './apiClient';

// ── Issues ─────────────────────────────────────────────────────

/**
 * POST /api/issues — Tạo Issue mới.
 * @param {Object} payload
 * @param {string} payload.title       - Tên Issue (bắt buộc)
 * @param {string} payload.type        - 'EPIC' | 'STORY' | 'TASK'
 * @param {string} payload.status      - 'TODO' | 'IN_PROGRESS' | 'TEST' | 'DONE'
 * @param {string} payload.projectId   - ID dự án (bắt buộc)
 * @param {string} [payload.assigneeId]- ID người thực hiện
 * @param {string} [payload.description]
 * @returns {Promise<Object>} Issue vừa tạo
 */
export const createIssue = (payload) =>
  apiClient.post('/issues', payload).then((res) => res.data);

/**
 * GET /api/issues — Lấy danh sách Issue (có thể filter).
 * @param {Object} [params] - Query params: projectId, status, type, assigneeId
 */
export const getIssues = (params = {}) =>
  apiClient.get('/issues', { params }).then((res) => res.data);

/**
 * PATCH /api/issues/:id/status — Cập nhật trạng thái Issue (kéo thả).
 * @param {string} id - ID của issue
 * @param {string} status - Trạng thái mới ('TODO' | 'IN_PROGRESS' | 'TEST' | 'DONE')
 * @param {number} [orderIndex] - Vị trí mới (tùy chọn)
 */
export const updateIssueStatus = (id, status, orderIndex) =>
  apiClient.patch(`/issues/${id}/status`, { status, orderIndex }).then((res) => res.data);

/**
 * PUT /api/issues/:id — Cập nhật chi tiết Issue
 */
export const updateIssue = (id, payload) =>
  apiClient.put(`/issues/${id}`, payload).then((res) => res.data);

/**
 * DELETE /api/issues/:id — Xóa Issue
 */
export const deleteIssue = (id) =>
  apiClient.delete(`/issues/${id}`).then((res) => res.data);

// ── Project Members ────────────────────────────────────────────

/**
 * GET /api/projects/:projectId/members — Lấy danh sách Member làm Assignee.
 */
export const getProjectMembers = (projectId) =>
  apiClient.get(`/projects/${projectId}/members`).then((res) => res.data);

// ── Projects ───────────────────────────────────────────────────

/**
 * GET /api/projects — Lấy danh sách Project dùng cho Project dropdown.
 */
export const getProjects = () =>
  apiClient.get('/projects').then((res) => res.data);
