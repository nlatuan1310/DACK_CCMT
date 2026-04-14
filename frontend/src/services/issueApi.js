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

// ── Users ──────────────────────────────────────────────────────

/**
 * GET /api/users — Lấy danh sách User dùng cho Assignee dropdown.
 */
export const getUsers = () =>
  apiClient.get('/users').then((res) => res.data);

// ── Projects ───────────────────────────────────────────────────

/**
 * GET /api/projects — Lấy danh sách Project dùng cho Project dropdown.
 */
export const getProjects = () =>
  apiClient.get('/projects').then((res) => res.data);
