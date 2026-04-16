import React, { useState, useMemo } from 'react';
import { useParams } from 'react-router-dom';
import useIssues from '../hooks/useIssues';
import { Loader2, AlertTriangle, RefreshCcw, RotateCcw, Plus } from 'lucide-react';
import { DragDropContext } from '@hello-pangea/dnd';
import { updateIssueStatus } from '../services/issueApi';
import IssueDetailModal from '../components/IssueDetailModal';
import CreateIssueModal from '../components/CreateIssueModal';
import EpicSwimlane from '../components/EpicSwimlane';

// ── Thứ tự cột cố định theo luồng Kanban ──────────────────────
const COLUMN_STATUSES = ['TODO', 'IN_PROGRESS', 'TEST', 'DONE'];

/**
 * Board page — hiển thị Kanban theo Epic Swimlane (kiểu Jira).
 * Mỗi Epic là 1 hàng ngang chứa 4 cột trạng thái bên trong.
 *
 * @prop {number} refreshKey  - Tăng từ parent (App) để trigger reload
 */
const Board = ({ refreshKey = 0 }) => {
  const { projectId } = useParams();
  const { epicGroups, issues, loading, error, refetch, updateLocalIssue } = useIssues({ projectId }, refreshKey);
  const [selectedAssignee, setSelectedAssignee] = useState('ALL');
  const [selectedIssue, setSelectedIssue] = useState(null);
  const [isCreateOpen, setIsCreateOpen] = useState(false);

  // Lấy danh sách thành viên duy nhất từ các issue hiện có
  const assignees = useMemo(() => {
    const map = new Map();
    issues.forEach(i => {
      if (i.assignee) {
        const id = i.assignee._id || i.assignee.id;
        if (id) map.set(id, i.assignee);
      }
    });
    return Array.from(map.values());
  }, [issues]);

  // Lọc epicGroups theo assignee
  const filteredEpicGroups = useMemo(() => {
    if (selectedAssignee === 'ALL') return epicGroups;

    return epicGroups.map((group) => {
      const newGrouped = {};
      COLUMN_STATUSES.forEach((status) => {
        newGrouped[status] = (group.grouped[status] || []).filter((issue) => {
          if (selectedAssignee === 'UNASSIGNED') return !issue.assignee;
          const assigneeId = issue.assignee?._id || issue.assignee?.id;
          return String(assigneeId) === selectedAssignee;
        });
      });

      const totalChildren = COLUMN_STATUSES.reduce((sum, s) => sum + newGrouped[s].length, 0);

      return { ...group, grouped: newGrouped, totalChildren };
    }).filter((group) => group.totalChildren > 0 || group.epic !== null);
  }, [epicGroups, selectedAssignee]);

  // ── Drag & Drop handler ─────────────────────────────────────────
  // droppableId format: "epicId::STATUS" hoặc "no-epic::STATUS"
  const handleDragEnd = async (result) => {
    const { destination, source, draggableId } = result;

    if (!destination) return;
    if (
      destination.droppableId === source.droppableId &&
      destination.index === source.index
    ) return;

    // Tách status mới từ droppableId (format: "epicId::STATUS")
    const newStatus = destination.droppableId.split('::')[1];
    if (!newStatus || !COLUMN_STATUSES.includes(newStatus)) return;

    // 1. Optimistic update local state (UI only)
    updateLocalIssue(draggableId, newStatus);

    try {
      // 2. Gọi API PATCH
      await updateIssueStatus(draggableId, newStatus);
    } catch (err) {
      console.error('Lỗi khi update status:', err);
      // Giật lại data nếu lỗi
      refetch();
    }
  };

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
            {' · '}
            {epicGroups.filter(g => g.epic !== null).length} epic
          </p>
        </div>

        {/* Toolbar */}
        <div className="flex items-center gap-3">
          {/* Lọc Assignee */}
          <select
            value={selectedAssignee}
            onChange={(e) => setSelectedAssignee(e.target.value)}
            className="border-gray-300 rounded-md text-sm text-gray-700 py-1.5 pl-3 pr-8 focus:ring-blue-500 focus:border-blue-500"
          >
            <option value="ALL">Tất cả thành viên</option>
            <option value="UNASSIGNED">Chưa giao (Unassigned)</option>
            {assignees.map(u => (
              <option key={u._id || u.id} value={u._id || u.id}>
                {u.name}
              </option>
            ))}
          </select>

          {/* Refresh button */}
          <button
            onClick={refetch}
            title="Làm mới board"
            className="p-1.5 rounded-lg text-gray-500 hover:text-gray-900 hover:bg-gray-100 transition"
          >
            <RotateCcw size={18} />
          </button>

          {/* Create Issue button */}
          <button 
            onClick={() => setIsCreateOpen(true)}
            className="bg-indigo-600 hover:bg-indigo-700 text-white px-3 py-1.5 rounded-md text-sm font-medium transition-colors shadow-sm flex items-center gap-1"
          >
            <Plus size={16} /> Tạo thẻ
          </button>
        </div>
      </div>

      {/* Column status legend */}
      <div className="grid grid-cols-4 gap-3 mb-3 pl-2">
        {COLUMN_STATUSES.map((status) => {
          const labels = { TODO: 'To Do', IN_PROGRESS: 'In Progress', TEST: 'Test', DONE: 'Done' };
          const dots   = { TODO: 'bg-gray-400', IN_PROGRESS: 'bg-blue-500', TEST: 'bg-purple-500', DONE: 'bg-green-500' };
          return (
            <div key={status} className="flex items-center gap-1.5 px-3 py-1.5">
              <span className={`w-2.5 h-2.5 rounded-full ${dots[status]}`} />
              <span className="text-xs font-semibold uppercase tracking-wide text-gray-500">
                {labels[status]}
              </span>
            </div>
          );
        })}
      </div>

      {/* Divider */}
      <div className="border-b border-gray-200 mb-4" />

      {/* ── Epic Swimlanes ───────────────────────────────────── */}
      <DragDropContext onDragEnd={handleDragEnd}>
        <div className="flex-1 min-h-0 pb-6 overflow-y-auto">
          {filteredEpicGroups.length === 0 ? (
            <div className="flex flex-col items-center justify-center py-20 text-center">
              <div className="w-14 h-14 rounded-full bg-gray-100 flex items-center justify-center mb-3">
                <span className="text-2xl text-gray-300">📋</span>
              </div>
              <p className="text-sm text-gray-400">Chưa có issue nào trên board</p>
            </div>
          ) : (
            filteredEpicGroups.map((group, idx) => (
              <EpicSwimlane
                key={group.epic?.id ?? 'no-epic'}
                epic={group.epic}
                grouped={group.grouped}
                totalChildren={group.totalChildren}
                epicId={group.epic?.id ?? 'no-epic'}
                onCardClick={(issue) => setSelectedIssue(issue)}
                onEpicClick={(epicIssue) => setSelectedIssue(epicIssue)}
              />
            ))
          )}
        </div>
      </DragDropContext>

      <IssueDetailModal
        isOpen={!!selectedIssue}
        issue={selectedIssue}
        onClose={() => setSelectedIssue(null)}
        onUpdate={() => {
          setSelectedIssue(null);
          refetch();
        }}
      />

      <CreateIssueModal
        isOpen={isCreateOpen}
        defaultProjectId={projectId}
        onClose={() => setIsCreateOpen(false)}
        onCreated={() => {
          setIsCreateOpen(false);
          refetch();
        }}
      />
    </div>
  );
};

export default Board;
