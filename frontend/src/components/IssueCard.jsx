import React from 'react';
import { BookOpen, Zap, CheckSquare, Bug } from 'lucide-react';
import { Draggable } from '@hello-pangea/dnd';

// ── Type config ────────────────────────────────────────────────
const TYPE_CONFIG = {
  EPIC:  { label: 'Epic',  icon: Zap,         color: 'bg-purple-100 text-purple-700' },
  STORY: { label: 'Story', icon: BookOpen,     color: 'bg-green-100  text-green-700'  },
  TASK:  { label: 'Task',  icon: CheckSquare,  color: 'bg-blue-100   text-blue-700'   },
  BUG:   { label: 'Bug',   icon: Bug,          color: 'bg-red-100    text-red-700'    },
};

// ── Priority dots ──────────────────────────────────────────────
const PRIORITY_COLOR = ['bg-gray-300', 'bg-blue-400', 'bg-yellow-400', 'bg-orange-400', 'bg-red-500'];
const PRIORITY_LABEL = ['Lowest', 'Low', 'Medium', 'High', 'Highest'];

// ── Initials avatar helper ─────────────────────────────────────
const getInitials = (name = '') =>
  name.split(' ').map((w) => w[0]).join('').toUpperCase().slice(0, 2);

const AVATAR_COLORS = [
  'bg-indigo-500', 'bg-teal-500', 'bg-orange-500',
  'bg-pink-500',   'bg-cyan-500', 'bg-emerald-500',
];
const pickColor = (name = '') =>
  AVATAR_COLORS[name.charCodeAt(0) % AVATAR_COLORS.length] ?? 'bg-gray-400';

// ── Component ──────────────────────────────────────────────────
const IssueCard = ({ issue, index }) => {
  const typeConf  = TYPE_CONFIG[issue.type] ?? TYPE_CONFIG.TASK;
  const TypeIcon  = typeConf.icon;
  const priority  = Math.min(Math.max(issue.priority ?? 0, 0), 4);

  return (
    <Draggable draggableId={String(issue.id)} index={index}>
      {(provided, snapshot) => (
        <div
          ref={provided.innerRef}
          {...provided.draggableProps}
          {...provided.dragHandleProps}
        className={`
          group bg-white rounded-lg border px-3 py-3
          shadow-sm transition-all duration-150 select-none
          ${snapshot.isDragging 
            ? 'border-blue-400 shadow-md rotate-2 z-50 ring-2 ring-blue-200' 
            : 'border-gray-200 hover:shadow-md hover:border-blue-300'
          }
        `}
    >
      {/* Top row: type badge + priority */}
      <div className="flex items-center justify-between mb-2">
        {/* Type badge */}
        <span className={`inline-flex items-center gap-1 text-xs font-medium px-2 py-0.5 rounded-full ${typeConf.color}`}>
          <TypeIcon size={11} />
          {typeConf.label}
        </span>

        {/* Priority dot */}
        <span
          title={PRIORITY_LABEL[priority]}
          className={`w-2.5 h-2.5 rounded-full flex-shrink-0 ${PRIORITY_COLOR[priority]}`}
        />
      </div>

      {/* Title */}
      <p className="text-sm font-medium text-gray-800 leading-snug mb-3 line-clamp-2 group-hover:text-blue-700 transition-colors">
        {issue.title}
      </p>

      {/* Bottom row: project key + assignee */}
      <div className="flex items-center justify-between">
        {/* Issue key */}
        <span className="text-xs text-gray-400 font-mono">
          {issue.project?.key ?? '—'}-{issue.id?.slice(-4).toUpperCase()}
        </span>

        {/* Assignee avatar */}
        {issue.assignee ? (
          <div
            title={issue.assignee.name}
            className={`
              w-6 h-6 rounded-full flex items-center justify-center
              text-white text-[10px] font-bold flex-shrink-0
              ${pickColor(issue.assignee.name)}
            `}
          >
            {getInitials(issue.assignee.name)}
          </div>
        ) : (
          <div
            title="Unassigned"
            className="w-6 h-6 rounded-full border-2 border-dashed border-gray-300 flex-shrink-0"
          />
        )}
      </div>
        </div>
      )}
    </Draggable>
  );
};

export default IssueCard;
