import { Task, Category } from '../types';
import { CalendarDays, AlertCircle, Circle, CheckCircle2, ChevronRight, Play } from 'lucide-react';
import { DynamicIcon } from './DynamicIcon';
import { motion } from 'motion/react';

interface CalendarViewProps {
  tasks: Task[];
  categories: Category[];
  onToggleComplete: (id: string) => void;
  onSelectTaskFocus: (id: string) => void;
}

export function CalendarView({
  tasks,
  categories,
  onToggleComplete,
  onSelectTaskFocus
}: CalendarViewProps) {
  const todayStr = new Date().toISOString().split('T')[0];
  const tomorrowDate = new Date();
  tomorrowDate.setDate(tomorrowDate.getDate() + 1);
  const tomorrowStr = tomorrowDate.toISOString().split('T')[0];

  const pendingTasks = tasks.filter(t => !t.completed);

  // Group tasks
  const todayTasks = pendingTasks.filter(t => t.dueDate === todayStr);
  const tomorrowTasks = pendingTasks.filter(t => t.dueDate === tomorrowStr);
  
  const upcomingTasks = pendingTasks.filter(t => {
    if (!t.dueDate) return false;
    return t.dueDate > tomorrowStr;
  }).sort((a, b) => new Date(a.dueDate!).getTime() - new Date(b.dueDate!).getTime());

  const noDateTasks = pendingTasks.filter(t => !t.dueDate);

  const renderTimelineSection = (title: string, sub: string, list: Task[], colorCode: string) => (
    <div className="flex flex-col gap-2 flex-1 min-w-[280px]">
      <div className="flex items-center justify-between pb-2 border-b border-stone-200/50 mb-1">
        <div>
          <h3 className="font-display font-bold text-sm text-stone-800 tracking-tight flex items-center gap-1.5">
            <span className={`w-2.5 h-2.5 rounded-full ${colorCode}`} />
            <span>{title}</span>
          </h3>
          <p className="text-[10px] text-stone-400 mt-0.5">{sub}</p>
        </div>
        <span className="text-[10px] bg-stone-100 text-stone-600 font-bold px-2 py-0.5 rounded-full font-mono">
          {list.length}
        </span>
      </div>

      <div className="flex flex-col gap-2.5 max-h-[60vh] overflow-y-auto pr-1">
        {list.length > 0 ? (
          list.map(task => {
            const category = categories.find(c => c.id === task.category);
            const priorityColors = {
              low: 'border-l-stone-300',
              medium: 'border-l-amber-400',
              high: 'border-l-rose-400',
            };

            return (
              <motion.div
                key={task.id}
                layoutId={`timeline-${task.id}`}
                className={`bg-white border border-stone-200/60 border-l-4 ${priorityColors[task.priority]} rounded-xl p-3 shadow-xs hover:border-stone-300 hover:shadow-sm transition-all group flex items-start gap-2.5`}
              >
                <button
                  onClick={() => onToggleComplete(task.id)}
                  className="mt-0.5 w-4 h-4 rounded-full border border-stone-300 hover:border-[#4f46e5] hover:bg-indigo-50/40 flex items-center justify-center shrink-0"
                >
                  <Circle size={8} className="text-transparent" />
                </button>
                <div className="flex-1 min-w-0">
                  <h4 className="text-xs font-semibold text-stone-800 truncate line-clamp-2">
                    {task.title}
                  </h4>
                  <div className="flex items-center gap-1.5 mt-2 flex-wrap">
                    {category && (
                      <span className={`text-[9px] font-sans font-bold px-2 py-0.5 rounded-full border ${category.color} flex items-center gap-0.5`}>
                        <DynamicIcon name={category.icon} size={8} />
                        <span>{category.name}</span>
                      </span>
                    )}
                    {task.dueDate && (
                      <span className="text-[9px] text-stone-400 font-mono">
                        {task.dueDate}
                      </span>
                    )}
                  </div>
                </div>
                <button
                  onClick={() => onSelectTaskFocus(task.id)}
                  className="p-1 text-stone-400 hover:text-[#4f46e5] hover:bg-stone-50 rounded-lg border border-stone-100 group-hover:scale-105 transition-all opacity-0 group-hover:opacity-100 self-center"
                  title="Focar"
                >
                  <Play size={10} fill="currentColor" />
                </button>
              </motion.div>
            );
          })
        ) : (
          <div className="py-8 text-center text-stone-400 text-xs italic border border-dashed border-stone-200 rounded-xl">
            Tudo tranquilo... Sem tarefas
          </div>
        )}
      </div>
    </div>
  );

  return (
    <div className="flex flex-col gap-5 p-1">
      
      {/* Title block */}
      <div className="flex items-center gap-2 pb-2.5">
        <CalendarDays className="text-[#4f46e5]" size={20} />
        <h2 className="text-xl font-bold font-display text-stone-800 tracking-tight leading-none">
          Cronograma de Prazos
        </h2>
        <p className="text-xs text-stone-400 border-l border-stone-200 pl-3 ml-1 self-center">
          Visão geral de tarefas organizadas por metas e prazos definidos
        </p>
      </div>

      {/* Grid Timeline Lists */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        {renderTimelineSection('Hoje', 'Lista de tarefas de hoje', todayTasks, 'bg-[#4f46e5]')}
        {renderTimelineSection('Amanhã', 'Tarefas para amanhã', tomorrowTasks, 'bg-amber-400')}
        {renderTimelineSection('Próximos Dias', 'Prazos futuros', upcomingTasks, 'bg-blue-400')}
        {renderTimelineSection('Algum Dia', 'Ações sem data definida', noDateTasks, 'bg-stone-300')}
      </div>

    </div>
  );
}
