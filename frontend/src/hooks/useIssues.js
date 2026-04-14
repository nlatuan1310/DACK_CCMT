import { useState, useEffect, useMemo, useCallback } from 'react';
import { getIssues } from '../services/issueApi';

// ── Các trạng thái hợp lệ của board ──────────────────────────
const COLUMN_STATUSES = ['TODO', 'IN_PROGRESS', 'TEST', 'DONE'];

/**
 * Custom hook: fetch toàn bộ Issue từ backend và tách thành 4 mảng con theo status.
 *
 * @param {Object}  [filters]            - Query params tuỳ chọn (projectId, type, assigneeId…)
 * @param {number}  [refreshKey]         - Tăng giá trị này để trigger refetch thủ công
 * @returns {{ grouped, issues, loading, error, refetch }}
 *   - grouped  : { TODO: [], IN_PROGRESS: [], TEST: [], DONE: [] }
 *   - issues   : mảng phẳng toàn bộ issue
 *   - loading  : boolean
 *   - error    : string rỗng hoặc thông báo lỗi
 *   - refetch  : hàm gọi lại API thủ công
 *   - updateLocalIssue: cập nhật nhanh local state của 1 issue
 */
const useIssues = (filters = {}, refreshKey = 0) => {
  const [issues,  setIssues]  = useState([]);
  const [loading, setLoading] = useState(true);
  const [error,   setError]   = useState('');

  // Stringify filters để dùng trong dependency array
  const filtersKey = JSON.stringify(filters);

  const fetchIssues = useCallback(async () => {
    setLoading(true);
    setError('');
    try {
      const res = await getIssues(filters);
      setIssues(res.data ?? []);
    } catch (err) {
      setError(
        err.message || 'Không thể tải danh sách Issue. Kiểm tra kết nối backend.'
      );
    } finally {
      setLoading(false);
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [filtersKey, refreshKey]);

  useEffect(() => {
    fetchIssues();
  }, [fetchIssues]);

  const updateLocalIssue = useCallback((issueId, newStatus) => {
    setIssues((prev) =>
      prev.map((issue) =>
        String(issue.id) === String(issueId) ? { ...issue, status: newStatus } : issue
      )
    );
  }, []);

  // Tách mảng phẳng → { TODO: [], IN_PROGRESS: [], TEST: [], DONE: [] }
  const grouped = useMemo(() => {
    const map = Object.fromEntries(COLUMN_STATUSES.map((s) => [s, []]));
    for (const issue of issues) {
      if (map[issue.status] !== undefined) {
        map[issue.status].push(issue);
      }
    }
    return map;
  }, [issues]);

  return { grouped, issues, loading, error, refetch: fetchIssues, updateLocalIssue };
};

export default useIssues;
