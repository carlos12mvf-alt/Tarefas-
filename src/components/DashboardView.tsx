import { Task, Category, Priority } from '../types';
import { 
  CheckCircle2, AlertCircle, Calendar, Play, Circle, Folder, ArrowRight,
  TrendingUp, Award, Clock
} from 'lucide-react';
import { DynamicIcon } from './DynamicIcon';
import { motion } from 'motion/react';

interface DashboardViewProps {
  tasks: Task[];
  categories: Category[];
  onSelectTab: (tab: 'all-tasks' | 'dashboard' | 'focus' | 'calendar') => void;
  onSelectTaskFocus: (id: string) => void;
  onToggleComplete: (id: string) => void;
}

export function DashboardView({
  tasks,
  categories,
  onSelectTab,
  onSelectTaskFocus,
  onToggleComplete
}: DashboardViewProps) {
  const completedTasks = tasks.filter(t => t.completed);
  const pendingTasks = tasks.filter(t => !t.completed);
  const completionRate = tasks.length > 0 ? Math.round((completedTasks.length / tasks.length) * 100) : 0;

  // Breakdown by priority
  const getPriorityCount = (p: Priority) => tasks.filter(t => t.priority === p && !t.completed).length;
  
  // Weekly trend / history (just mockup from completed dates or static list)
  const completedCount = completedTasks.length;

  // Next upcoming tasks (uncompleted, sorted by closest due date)
  const upcomingTasks = [...pendingTasks]
    .filter(t => t.dueDate)
    .sort((a, b) => new Date(a.dueDate!).getTime() - new Date(b.dueDate!).getTime())
    .slice(0, 3);

  return (
    <div className="flex flex-col gap-6 p-1">
      
      {/* Visual Welcome Board */}
      <div className="bg-[#4f46e5] rounded-3xl p-6 md:p-8 text-white relative overflow-hidden shadow-sm shadow-indigo-100">
        <div className="absolute right-0 bottom-0 top-0 opacity-10 pointer-events-none w-1/3 flex items-center justify-center">
          <Award size={200} className="transform translate-x-12 translate-y-12" />
        </div>
        <div className="relative z-10 max-w-lg">
          <span className="text-[10px] font-mono font-bold tracking-widest uppercase bg-[#4338ca]/50 px-2.5 py-1 rounded-full">
            Seu Painel Sereno
          </span>
          <h2 className="text-2xl md:text-3xl font-display font-bold mt-3 leading-tight tracking-tight">
            Pronto para organizar seus objetivos de foco?
          </h2>
          <p className="text-indigo-100 text-xs md:text-sm mt-2 font-medium">
            Você concluiu {completedTasks.length} tarefas de {tasks.length} e possui {pendingTasks.length} pendentes. Respire fundo, selecione um objetivo de focar e gerencie o dia com tranquilidade.
          </p>
          <div className="flex gap-3 mt-5">
            <button
              onClick={() => onSelectTab('all-tasks')}
              className="px-4 py-2 bg-white text-[#4f46e5] rounded-xl text-xs font-bold hover:bg-indigo-50 transition-all shadow-sm active:scale-95 flex items-center gap-1"
            >
              <span>Gerenciar Tarefas</span>
              <ArrowRight size={13} />
            </button>
            <button
              onClick={() => onSelectTab('focus')}
              className="px-4 py-2 bg-[#4338ca] hover:bg-[#3730a3] text-white border border-indigo-400/50 rounded-xl text-xs font-bold transition-all active:scale-95"
            >
              Iniciar Sessão de Foco
            </button>
          </div>
        </div>
      </div>

      {/* Stats Cards Bento Grid */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        
        {/* Completion Rate Dial */}
        <div className="bg-white border border-stone-200/80 rounded-2xl p-5 shadow-sm flex items-center gap-4">
          <div className="relative w-16 h-16 flex items-center justify-center shrink-0">
            <svg className="w-full h-full transform -rotate-90">
              <circle cx="32" cy="32" r="28" className="stroke-stone-50 fill-none" strokeWidth="4" />
              <circle 
                cx="32" 
                cy="32" 
                r="28" 
                className="stroke-[#4f46e5] fill-none" 
                strokeWidth="4" 
                strokeDasharray={2 * Math.PI * 28}
                strokeDashoffset={(2 * Math.PI * 28) * (1 - completionRate / 100)}
                strokeLinecap="round"
              />
            </svg>
            <span className="absolute font-sans font-bold text-[13px] text-stone-800">
              {completionRate}%
            </span>
          </div>
          <div>
            <span className="text-[10px] font-mono text-stone-400 font-bold uppercase tracking-wider block">
              Conclusões
            </span>
            <span className="text-xl font-bold text-stone-800 leading-none block mt-1">
              {completedTasks.length} / {tasks.length}
            </span>
            <span className="text-[11px] text-stone-500 mt-0.5 block">
              Progresso do Checklist
            </span>
          </div>
        </div>

        {/* High Priority count */}
        <div className="bg-white border border-stone-200/80 rounded-2xl p-5 shadow-sm flex items-center gap-4">
          <div className="w-12 h-12 rounded-xl bg-rose-50 border border-rose-100/50 flex items-center justify-center text-rose-500 shrink-0">
            <AlertCircle size={20} />
          </div>
          <div>
            <span className="text-[10px] font-mono text-stone-400 font-bold uppercase tracking-wider block">
              Prioridade Alta
            </span>
            <span className="text-xl font-bold text-stone-800 leading-none block mt-1">
              {getPriorityCount('high')} Pendentes
            </span>
            <span className="text-[11px] text-stone-500 mt-0.5 block">
              Exige ação imediata
            </span>
          </div>
        </div>

        {/* Medium Priority */}
        <div className="bg-white border border-stone-200/80 rounded-2xl p-5 shadow-sm flex items-center gap-4">
          <div className="w-12 h-12 rounded-xl bg-amber-50 border border-amber-100/50 flex items-center justify-center text-amber-500 shrink-0">
            <TrendingUp size={20} />
          </div>
          <div>
            <span className="text-[10px] font-mono text-stone-400 font-bold uppercase tracking-wider block">
              Prioridade Média
            </span>
            <span className="text-xl font-bold text-stone-800 leading-none block mt-1">
              {getPriorityCount('medium')} Ativas
            </span>
            <span className="text-[11px] text-stone-500 mt-0.5 block">
              Progresso padrão diário
            </span>
          </div>
        </div>

        {/* Finished Sessions / Productivity index */}
        <div className="bg-white border border-stone-200/80 rounded-2xl p-5 shadow-sm flex items-center gap-4">
          <div className="w-12 h-12 rounded-xl bg-blue-50 border border-blue-100/50 flex items-center justify-center text-blue-500 shrink-0">
            <Clock size={20} />
          </div>
          <div>
            <span className="text-[10px] font-mono text-stone-400 font-bold uppercase tracking-wider block">
              Índice de Produtividade
            </span>
            <span className="text-xl font-bold text-stone-800 leading-none block mt-1">
              {completedCount * 10 || 50} Bliss
            </span>
            <span className="text-[11px] text-emerald-500 font-medium mt-0.5 block">
              Ritmo de trabalho subindo
            </span>
          </div>
        </div>

      </div>

      {/* Main Analysis Split */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        
        {/* Upcoming Goals (Left 2 Col) */}
        <div className="lg:col-span-2 bg-white border border-stone-200/80 rounded-2xl p-6 shadow-sm flex flex-col gap-4">
          <div className="flex justify-between items-center pb-2 border-b border-stone-100">
            <div className="flex items-center gap-1.5">
              <Calendar size={16} className="text-[#4f46e5]" />
              <h3 className="font-display font-semibold text-stone-800">
                Próximos Marcos Prioritários
              </h3>
            </div>
            <button
              onClick={() => onSelectTab('all-tasks')}
              className="text-xs text-[#4f46e5] hover:text-[#4338ca] font-semibold"
            >
              Ver tudo
            </button>
          </div>

          <div className="flex flex-col gap-3">
            {upcomingTasks.length > 0 ? (
              upcomingTasks.map(task => {
                const category = categories.find(c => c.id === task.category);
                return (
                  <div
                    key={task.id}
                    className="flex items-center justify-between p-4 bg-stone-50/50 border border-stone-150 rounded-xl hover:bg-stone-50 transition-all group"
                  >
                    <div className="flex items-start gap-3 min-w-0 flex-1">
                      <button
                        onClick={() => onToggleComplete(task.id)}
                        className="mt-0.5 w-4 h-4 rounded-full border border-stone-300 hover:border-[#4f46e5] hover:bg-indigo-50/40 flex items-center justify-center shrink-0"
                      >
                        <Circle size={8} className="text-transparent" />
                      </button>
                      <div className="min-w-0 flex-1">
                        <span className="text-sm font-semibold text-stone-800 block truncate leading-none">
                          {task.title}
                        </span>
                        <div className="flex gap-2 items-center mt-1.5">
                          {category && (
                            <span className={`inline-flex items-center gap-1 text-[10px] font-sans font-semibold px-2 py-0.5 rounded-full border ${category.color}`}>
                              <DynamicIcon name={category.icon} size={9} />
                              <span>{category.name}</span>
                            </span>
                          )}
                          <span className="text-[10px] text-stone-400 font-mono">
                            Prazo: {task.dueDate}
                          </span>
                        </div>
                      </div>
                    </div>
                    
                    <button
                      onClick={() => onSelectTaskFocus(task.id)}
                      className="p-1.5 bg-white border border-stone-200 hover:border-indigo-200 text-stone-400 hover:text-[#4f46e5] rounded-lg group-hover:scale-105 transition-all opacity-0 group-hover:opacity-100 flex items-center gap-1 text-xs font-semibold shrink-0"
                    >
                      <Play size={10} fill="currentColor" />
                      <span>Focar</span>
                    </button>
                  </div>
                );
              })
            ) : (
              <div className="py-8 text-center text-stone-500 text-xs italic">
                Nenhum objetivo com prazo agendado para os próximos dias foi encontrado.
              </div>
            )}
          </div>
        </div>

        {/* Category Breakdown (Right Col) */}
        <div className="bg-white border border-stone-200/80 rounded-2xl p-6 shadow-sm flex flex-col gap-4">
          <div className="flex items-center gap-1.5 pb-2 border-b border-stone-100">
            <Folder size={16} className="text-[#4f46e5]" />
            <h3 className="font-display font-semibold text-stone-800">
              Distribuição por Categorias
            </h3>
          </div>

          <div className="flex flex-col gap-3.5 max-h-64 overflow-y-auto pr-0.5">
            {categories
              .filter(c => c.id !== 'all')
              .map(c => {
                const totalInCat = tasks.filter(t => t.category === c.id).length;
                const completedInCat = tasks.filter(t => t.category === c.id && t.completed).length;
                const progressInCat = totalInCat > 0 ? Math.round((completedInCat / totalInCat) * 100) : 0;

                return (
                  <div key={c.id} className="flex flex-col gap-1.5">
                    <div className="flex justify-between text-xs font-semibold text-stone-700">
                      <div className="flex items-center gap-1.5 min-w-0">
                        <span className={`p-1 rounded-md border text-[9px] shrink-0 ${c.color}`}>
                          <DynamicIcon name={c.icon} size={9} />
                        </span>
                        <span className="truncate">{c.name}</span>
                      </div>
                      <span className="shrink-0 text-stone-400">{completedInCat}/{totalInCat}</span>
                    </div>
                    <div className="relative w-full bg-stone-100 h-1.5 rounded-full overflow-hidden">
                      <div 
                        className="bg-[#4f46e5] h-full rounded-full transition-all duration-300"
                        style={{ width: `${progressInCat}%` }}
                      />
                    </div>
                  </div>
                );
              })}
          </div>
        </div>

      </div>

    </div>
  );
}
