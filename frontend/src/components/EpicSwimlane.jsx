import React, { useState } from 'react';
import { Zap, Inbox, ChevronDown, ChevronRight, ExternalLink } from 'lucide-react';
import { Droppable } from '@hello-pangea/dnd';
import IssueCard from './IssueCard';

// ── Cấu hình cột ───────────────────────────────────────────────
const COLUMN_STATUSES = ['TODO', 'IN_PROGRESS', 'TEST', 'DONE'];

const COLUMN_CONFIG = {
  TODO:        { label: 'To Do',        dotColor: 'bg-gray-400',   headerColor: 'text-gray-600' },
  IN_PROGRESS: { label: 'In Progress',  dotColor: 'bg-blue-500',   headerColor: 'text-blue-700' },
  TEST:        { label: 'Test',          dotColor: 'bg-purple-500', headerColor: 'text-purple-700' },
  DONE:        { label: 'Done',          dotColor: 'bg-green-500',  headerColor: 'text-green-700' },
};

// ── Tính % hoàn thành ──────────────────────────────────────────
const calcProgress = (grouped) => {
  let total = 0;
  let done  = 0;
  COLUMN_STATUSES.forEach((s) => {
    const n = grouped[s]?.length ?? 0;
    total += n;
    if (s === 'DONE') done += n;
  });
  return total === 0 ? 0 : Math.round((done / total) * 100);
};

/**
 * EpicSwimlane — 1 hàng swimlane cho 1 Epic (hoặc "Không thuộc Epic").
 *
 * @prop {Object|null} epic     - Dữ liệu Epic (null = nhóm "No Epic")
 * @prop {Object}      grouped  - { TODO: [], IN_PROGRESS: [], TEST: [], DONE: [] }
 * @prop {number}      totalChildren
 * @prop {string}      epicId   - Unique ID cho droppable prefix
 * @prop {Function}    onCardClick
 * @prop {Function}    onEpicClick - Mở chi tiết Epic (để xem/xóa)
 */
const EpicSwimlane = ({ epic, grouped, totalChildren, epicId, onCardClick, onEpicClick }) => {
  const [collapsed, setCollapsed] = useState(false);
  const progress = calcProgress(grouped);

  return (
    <div className="mb-5">
      {/* ── Swimlane Header ──────────────────────────────────── */}
      <div className="w-full flex items-center gap-3 px-4 py-2.5 rounded-lg bg-white border border-gray-200 hover:border-gray-300 shadow-sm hover:shadow transition-all group select-none">
        {/* Chevron — toggle collapse */}
        <button
          type="button"
          onClick={() => setCollapsed((p) => !p)}
          className="flex-shrink-0 p-0.5 rounded hover:bg-gray-100 transition-colors"
        >
          {collapsed ? (
            <ChevronRight size={16} className="text-gray-400 group-hover:text-gray-600 transition-colors" />
          ) : (
            <ChevronDown size={16} className="text-gray-400 group-hover:text-gray-600 transition-colors" />
          )}
        </button>

        {/* Epic icon + title (click to collapse) */}
        <button
          type="button"
          onClick={() => setCollapsed((p) => !p)}
          className="flex items-center gap-2 min-w-0 flex-1"
        >
          {epic ? (
            <>
              <span className="w-6 h-6 rounded-md bg-purple-100 flex items-center justify-center flex-shrink-0">
                <Zap size={14} className="text-purple-600" />
              </span>
              <span className="text-sm font-semibold text-gray-800 truncate">
                {epic.title}
              </span>
            </>
          ) : (
            <>
              <span className="w-6 h-6 rounded-md bg-gray-100 flex items-center justify-center flex-shrink-0">
                <Inbox size={14} className="text-gray-500" />
              </span>
              <span className="text-sm font-semibold text-gray-500 truncate">
                Không thuộc Epic nào
              </span>
            </>
          )}
        </button>

        {/* Nút xem chi tiết Epic */}
        {epic && onEpicClick && (
          <button
            type="button"
            onClick={(e) => {
              e.stopPropagation();
              onEpicClick(epic);
            }}
            title="Xem chi tiết / Xóa Epic"
            className="flex-shrink-0 p-1.5 rounded-md text-gray-400 hover:text-purple-600 hover:bg-purple-50 transition-colors"
          >
            <ExternalLink size={14} />
          </button>
        )}

        {/* Badge count */}
        <span className="text-xs font-medium bg-gray-100 text-gray-500 px-2 py-0.5 rounded-full flex-shrink-0">
          {totalChildren} issue{totalChildren !== 1 ? 's' : ''}
        </span>

        {/* Progress bar (chỉ hiển thị cho Epic thực) */}
        {epic && totalChildren > 0 && (
          <div className="flex items-center gap-2 flex-shrink-0 ml-2">
            <div className="w-20 h-1.5 bg-gray-200 rounded-full overflow-hidden">
              <div
                className="h-full bg-green-500 rounded-full transition-all duration-500"
                style={{ width: `${progress}%` }}
              />
            </div>
            <span className="text-[10px] font-medium text-gray-400 w-8 text-right">
              {progress}%
            </span>
          </div>
        )}
      </div>

      {/* ── Swimlane Body (4 cột) ────────────────────────────── */}
      {!collapsed && (
        <div className="grid grid-cols-1 sm:grid-cols-2 xl:grid-cols-4 gap-3 mt-2 pl-2">
          {COLUMN_STATUSES.map((status) => {
            const conf = COLUMN_CONFIG[status];
            const droppableId = `${epicId}::${status}`;
            const columnIssues = grouped[status] ?? [];

            return (
              <div
                key={status}
                className="flex flex-col bg-gray-50/80 rounded-lg border border-gray-200 min-h-[120px]"
              >
                {/* Mini column header */}
                <div className="flex items-center gap-1.5 px-3 py-2 border-b border-gray-100">
                  <span className={`w-2 h-2 rounded-full flex-shrink-0 ${conf.dotColor}`} />
                  <span className={`text-xs font-semibold uppercase tracking-wide ${conf.headerColor}`}>
                    {conf.label}
                  </span>
                  <span className="ml-auto text-[10px] font-semibold text-gray-400 bg-gray-100 px-1.5 py-0.5 rounded-full">
                    {columnIssues.length}
                  </span>
                </div>

                {/* Droppable area */}
                <Droppable droppableId={droppableId}>
                  {(provided, snapshot) => (
                    <div
                      ref={provided.innerRef}
                      {...provided.droppableProps}
                      className={`flex-1 flex flex-col gap-1.5 p-2 overflow-y-auto transition-colors ${
                        snapshot.isDraggingOver ? 'bg-blue-50/50' : ''
                      }`}
                    >
                      {columnIssues.length === 0 ? (
                        <div className="flex-1 flex items-center justify-center py-6">
                          <span className="text-[10px] text-gray-300">—</span>
                        </div>
                      ) : (
                        columnIssues.map((issue, index) => (
                          <IssueCard
                            key={issue.id}
                            issue={issue}
                            index={index}
                            onClick={() => onCardClick(issue)}
                          />
                        ))
                      )}
                      {provided.placeholder}
                    </div>
                  )}
                </Droppable>
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
};

export default EpicSwimlane;
