import React from 'react';
import BoardColumn from '../components/BoardColumn';
import useIssues from '../hooks/useIssues';
import { Loader2, AlertTriangle, RefreshCcw, RotateCcw } from 'lucide-react';

// ── Thứ tự cột cố định theo luồng Kanban ──────────────────────
const COLUMN_STATUSES = ['TODO', 'IN_PROGRESS', 'TEST', 'DONE'];

/**
 * Board page — hiển thị 4 cột Kanban, fetch issue từ API.
 *
 * @prop {number} refreshKey  - Tăng từ parent (App) để trigger reload sau khi tạo issue mới
 */
const Board = ({ refreshKey = 0 }) => {
  const { grouped, issues, loading, error, refetch } = useIssues({}, refreshKey);

  // ── Loading state ──────────────────────────────────────────────
  if (loading) {
    return (
      <div className="flex flex-col items-center justify-center h-80 gap-3 text-gray-400">
        <Loader2 size={28} className="animate-spin text-blue-500" />
        <span className="text-sm">Đang tải bảng công việc...</span>
      </div>
    );
  }

  // ── Error state ────────────────────────────────────────────────
  if (error) {
    return (
      <div className="flex flex-col items-center justify-center h-80 gap-4 text-center">
        <div className="w-14 h-14 rounded-full bg-red-50 flex items-center justify-center">
          <AlertTriangle size={28} className="text-red-400" />
        </div>
        <div>
          <p className="text-sm font-semibold text-gray-700 mb-1">Tải dữ liệu thất bại</p>
          <p className="text-xs text-gray-400 max-w-xs">{error}</p>
        </div>
        <button
          onClick={refetch}
          className="inline-flex items-center gap-2 px-4 py-2 text-sm font-medium text-white bg-blue-600 hover:bg-blue-700 rounded-lg transition"
        >
          <RefreshCcw size={14} />
          Thử lại
        </button>
      </div>
    );
  }

  // ── Board UI ───────────────────────────────────────────────────
  return (
    <div className="flex flex-col h-full">

      {/* ── Page header ─────────────────────────────────────── */}
      <div className="flex items-start justify-between mb-4">
        <div>
          <h1 className="text-2xl font-bold text-gray-900 tracking-tight">Board</h1>
          <p className="text-sm text-gray-500 mt-0.5">
            {issues.length} issue{issues.length !== 1 ? 's' : ''} tổng cộng
          </p>
        </div>

        {/* Refresh button */}
        <button
          onClick={refetch}
          title="Làm mới board"
          className="p-2 rounded-lg text-gray-400 hover:text-gray-700 hover:bg-gray-100 transition"
        >
          <RotateCcw size={16} />
        </button>
      </div>

      {/* Divider */}
      <div className="border-b border-gray-200 mb-5" />

      {/* ── Kanban — 4 cột ──────────────────────────────────── */}
      <div className="grid grid-cols-1 sm:grid-cols-2 xl:grid-cols-4 gap-4 flex-1 min-h-0 pb-6">
        {COLUMN_STATUSES.map((status) => (
          <BoardColumn
            key={status}
            status={status}
            issues={grouped[status]}
          />
        ))}
      </div>

    </div>
  );
};

export default Board;
