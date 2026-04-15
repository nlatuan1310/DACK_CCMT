import React from 'react';
import IssueCard from './IssueCard';
import { Droppable } from '@hello-pangea/dnd';

// ── Cấu hình màu sắc cho từng cột ─────────────────────────────
const COLUMN_CONFIG = {
  TODO: {
    label:       'To Do',
    dotColor:    'bg-gray-400',
    headerColor: 'text-gray-600',
    countBg:     'bg-gray-100 text-gray-500',
    borderTop:   'border-t-gray-400',
  },
  IN_PROGRESS: {
    label:       'In Progress',
    dotColor:    'bg-blue-500',
    headerColor: 'text-blue-700',
    countBg:     'bg-blue-50 text-blue-600',
    borderTop:   'border-t-blue-500',
  },
  TEST: {
    label:       'Test',
    dotColor:    'bg-purple-500',
    headerColor: 'text-purple-700',
    countBg:     'bg-purple-50 text-purple-600',
    borderTop:   'border-t-purple-500',
  },
  DONE: {
    label:       'Done',
    dotColor:    'bg-green-500',
    headerColor: 'text-green-700',
    countBg:     'bg-green-50 text-green-600',
    borderTop:   'border-t-green-500',
  },
};

// ── Component ──────────────────────────────────────────────────
const BoardColumn = ({ status, issues = [], onCardClick }) => {
  const conf = COLUMN_CONFIG[status] ?? COLUMN_CONFIG.TODO;

  return (
    <div
      className={`
        flex flex-col bg-gray-50 rounded-xl min-h-[520px] w-full
        border-t-4 ${conf.borderTop}
        border border-t-0 border-gray-200
      `}
    >
      {/* Column Header */}
      <div className="flex items-center justify-between px-4 py-3 border-b border-gray-200">
        <div className="flex items-center gap-2">
          {/* Status dot */}
          <span className={`w-2.5 h-2.5 rounded-full flex-shrink-0 ${conf.dotColor}`} />
          <h3 className={`text-sm font-semibold uppercase tracking-wide ${conf.headerColor}`}>
            {conf.label}
          </h3>
        </div>

        {/* Issue count badge */}
        <span className={`text-xs font-semibold px-2 py-0.5 rounded-full ${conf.countBg}`}>
          {issues.length}
        </span>
      </div>

      {/* Issue list */}
      <Droppable droppableId={status}>
        {(provided, snapshot) => (
          <div
            ref={provided.innerRef}
            {...provided.droppableProps}
            className={`flex-1 flex flex-col gap-2 p-3 overflow-y-auto transition-colors ${
              snapshot.isDraggingOver ? 'bg-gray-100' : ''
            }`}
          >
            {issues.length === 0 ? (
              /* Empty state */
              <div className="flex-1 flex flex-col items-center justify-center py-10 text-center">
                <div className="w-10 h-10 rounded-full bg-gray-200 flex items-center justify-center mb-2">
                  <span className="text-gray-400 text-lg">·</span>
                </div>
                <p className="text-xs text-gray-400">Không có issue nào</p>
              </div>
            ) : (
              issues.map((issue, index) => (
                <IssueCard key={issue.id} issue={issue} index={index} onClick={() => onCardClick(issue)} />
              ))
            )}
            {provided.placeholder}
          </div>
        )}
      </Droppable>
    </div>
  );
};

export default BoardColumn;
