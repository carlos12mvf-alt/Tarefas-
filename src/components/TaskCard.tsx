import { useState } from 'react';
import { Calendar, Trash2, Edit, Play, Check, ChevronDown, ChevronUp, AlertCircle, Circle, CheckCircle, GripVertical } from 'lucide-react';
import { Task, Category, Priority } from '../types';
import { DynamicIcon } from './DynamicIcon';
import { motion, AnimatePresence } from 'motion/react';

interface TaskCardProps {
  key?: string | number;
  task: Task;
  category: Category | undefined;
  onToggleComplete: (id: string) => void;
  onToggleSubtask: (taskId: string, subtaskId: string) => void;
  onDelete: (id: string) => void;
  onEdit: (task: Task) => void;
  onSelectFocus: (id: string) => void;
  isFocused: boolean;
}

export function TaskCard({
  task,
  category,
  onToggleComplete,
  onToggleSubtask,
  onDelete,
  onEdit,
  onSelectFocus,
  isFocused
}: TaskCardProps) {
  const [isExpanded, setIsExpanded] = useState(false);

  const priorityColors = {
    low: 'bg-zinc-100 text-zinc-700 border-zinc-200/50',
    medium: 'bg-amber-50 text-amber-700 border-amber-200/70',
    high: 'bg-rose-50 text-rose-700 border-rose-200/70',
  };

  const isOverdue = task.dueDate && !task.completed && new Date(task.dueDate + 'T23:59:59') < new Date();
  const completedSubtasksCount = task.subtasks.filter(s => s.completed).length;

  return (
    <motion.div
      layout
      initial={{ opacity: 0, y: 12 }}
      animate={{ opacity: 1, y: 0 }}
      exit={{ opacity: 0, y: -12 }}
      transition={{ duration: 0.28, ease: 'easeOut' }}
      className={`group relative bg-white border rounded-2xl p-4 md:p-5 transition-all shadow-sm ${
        task.completed
          ? 'opacity-65 border-stone-150 bg-stone-50/40'
          : isFocused
          ? 'border-indigo-400 ring-2 ring-indigo-500/10 shadow-md'
          : 'border-stone-200/60 hover:border-stone-300 hover:shadow-md'
      }`}
    >
      <div className="flex items-start gap-3.5">
        {/* Customized completion checkbox */}
        <button
          onClick={() => onToggleComplete(task.id)}
          className={`mt-1 flex-shrink-0 w-5 h-5 rounded-full border-2 flex items-center justify-center transition-all duration-200 ${
            task.completed
              ? 'bg-[#4f46e5] border-[#4f46e5] text-white'
              : 'border-stone-300 hover:border-[#4f46e5] hover:bg-indigo-50/40'
          }`}
        >
          {task.completed && <Check size={12} className="stroke-[3]" />}
        </button>

        {/* Task Title & Meta Row */}
        <div className="flex-1 min-w-0" onClick={() => setIsExpanded(!isExpanded)}>
          <div className="cursor-pointer">
            <h3
              className={`font-semibold text-[15px] leading-snug break-words pr-4 ${
                task.completed ? 'text-stone-400 line-through' : 'text-stone-800'
              }`}
            >
              {task.title}
            </h3>
            
            {task.description && !isExpanded && (
              <p className="text-stone-500 text-xs mt-1 truncate max-w-xl pb-0.5">
                {task.description}
              </p>
            )}
          </div>

          {/* Tags & Action Row */}
          <div className="flex flex-wrap items-center gap-2 mt-3 text-[11px] font-sans font-medium">
            {/* Category */}
            {category && (
              <span className={`inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full border ${category.color}`}>
                <DynamicIcon name={category.icon} size={11} />
                <span>{category.name}</span>
              </span>
            )}

            {/* Priority */}
            <span className={`inline-flex items-center px-2 py-0.5 rounded-full border uppercase tracking-wider text-[10px] ${priorityColors[task.priority]}`}>
              {task.priority === 'low' ? 'Baixa' : task.priority === 'medium' ? 'Média' : 'Alta'}
            </span>

            {/* Due Date */}
            {task.dueDate && (
              <span
                className={`inline-flex items-center gap-1.5 px-2 py-0.5 rounded-full border ${
                  isOverdue
                    ? 'bg-red-50 text-red-700 border-red-200 animate-pulse'
                    : 'bg-stone-50 text-stone-600 border-stone-200'
                }`}
              >
                <Calendar size={11} className={isOverdue ? 'text-red-500' : 'text-stone-400'} />
                <span>
                  {new Date(task.dueDate + 'T12:00:00').toLocaleDateString(undefined, {
                    month: 'short',
                    day: 'numeric'
                  })}
                </span>
                {isOverdue && <AlertCircle size={11} className="text-red-500 ml-0.5" />}
              </span>
            )}

            {/* Sub-task quick summary */}
            {task.subtasks.length > 0 && (
              <span className="bg-stone-100 text-stone-600 border border-stone-200/50 px-2 py-0.5 rounded-full">
                {completedSubtasksCount}/{task.subtasks.length} Subtarefas
              </span>
            )}
          </div>
        </div>

        {/* Hover / End Actions Menu */}
        <div className="flex items-center gap-1.5 flex-shrink-0 self-start md:self-center">
          {/* Focus Mode Play */}
          {!task.completed && (
            <button
              onClick={() => onSelectFocus(task.id)}
              className={`p-2 rounded-xl transition-all ${
                isFocused
                  ? 'bg-indigo-50 text-indigo-600 border border-indigo-200'
                  : 'text-stone-400 hover:text-[#4f46e5] hover:bg-stone-50 border border-transparent hover:border-stone-100'
              }`}
              title="Iniciar foco nesta tarefa"
            >
              <Play size={15} fill={isFocused ? "currentColor" : "none"} />
            </button>
          )}

          {/* Edit icon */}
          <button
            onClick={() => onEdit(task)}
            className="p-2 rounded-xl text-stone-400 hover:text-blue-500 hover:bg-stone-50 border border-transparent hover:border-stone-100 transition-all"
            title="Editar detalhes da tarefa"
          >
            <Edit size={15} />
          </button>

          {/* Delete icon */}
          <button
            onClick={() => onDelete(task.id)}
            className="p-2 rounded-xl text-stone-400 hover:text-rose-500 hover:bg-stone-50 border border-transparent hover:border-stone-100 transition-all"
            title="Excluir tarefa"
          >
            <Trash2 size={15} />
          </button>

          {/* Expand/Collapse arrow */}
          {(task.description || task.subtasks.length > 0) && (
            <button
              onClick={() => setIsExpanded(!isExpanded)}
              className="p-2 rounded-xl text-stone-400 hover:text-stone-700 hover:bg-stone-50 border border-transparent hover:border-stone-150 transition-all"
            >
              {isExpanded ? <ChevronUp size={15} /> : <ChevronDown size={15} />}
            </button>
          )}
        </div>
      </div>

      {/* Expanded detail section (Description & Checklist) */}
      <AnimatePresence>
        {isExpanded && (
          <motion.div
            initial={{ height: 0, opacity: 0 }}
            animate={{ height: 'auto', opacity: 1 }}
            exit={{ height: 0, opacity: 0 }}
            transition={{ duration: 0.24, ease: 'easeInOut' }}
            className="overflow-hidden"
          >
            <div className="mt-4 pt-4 border-t border-stone-100 flex flex-col gap-3.5">
              {/* Detailed Description */}
              {task.description && (
                <div>
                  <h4 className="text-xs font-mono uppercase tracking-wider text-stone-400 mb-1">
                    Como Notas / Anotações
                  </h4>
                  <p className="text-stone-600 text-[13px] leading-relaxed break-words whitespace-pre-line">
                    {task.description}
                  </p>
                </div>
              )}

              {/* Checklist Sub-tasks */}
              {task.subtasks.length > 0 && (
                <div>
                  <h4 className="text-xs font-mono uppercase tracking-wider text-stone-400 mb-2">
                    Progresso das Subtarefas ({completedSubtasksCount} / {task.subtasks.length})
                  </h4>
                  
                  {/* Progress Bar */}
                  <div className="w-full bg-stone-100 h-1.5 rounded-full mb-3 overflow-hidden">
                    <div 
                      className="bg-[#4f46e5] h-full rounded-full transition-all duration-300"
                      style={{ width: `${(completedSubtasksCount / task.subtasks.length) * 100}%` }}
                    />
                  </div>

                  {/* Subtask list */}
                  <div className="flex flex-col gap-2">
                    {task.subtasks.map(sub => (
                      <button
                        key={sub.id}
                        onClick={() => onToggleSubtask(task.id, sub.id)}
                        className={`text-left flex items-start gap-2 py-1.5 px-2.5 rounded-lg border transition-all ${
                          sub.completed
                            ? 'bg-stone-50 border-stone-100 text-stone-400'
                            : 'bg-white border-stone-150 text-stone-700 hover:border-stone-300 hover:bg-stone-50/50'
                        }`}
                      >
                        <span className="flex-shrink-0 mt-0.5">
                          {sub.completed ? (
                            <CheckCircle size={14} className="text-[#4f46e5]" />
                          ) : (
                            <Circle size={14} className="text-stone-400" />
                          )}
                        </span>
                        <span className={`text-[12.5px] leading-tight break-all ${sub.completed ? 'line-through' : ''}`}>
                          {sub.title}
                        </span>
                      </button>
                    ))}
                  </div>
                </div>
              )}
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </motion.div>
  );
}
