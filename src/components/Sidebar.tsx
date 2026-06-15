import { useState, FormEvent } from 'react';
import { 
  Folder, SlidersHorizontal, ArrowUpDown, Plus, LayoutDashboard, Calendar, Sparkles, 
  Settings, UserCheck, CheckCircle2, ChevronRight, X, Sparkle, LogOut, CheckSquare
} from 'lucide-react';
import { Category, Task, TaskFilter, Priority } from '../types';
import { DynamicIcon } from './DynamicIcon';
import { AVAILABLE_ICONS, AVAILABLE_COLORS } from '../data';
import { motion, AnimatePresence } from 'motion/react';

interface SidebarProps {
  categories: Category[];
  tasks: Task[];
  filter: TaskFilter;
  onChangeFilter: (f: Partial<TaskFilter>) => void;
  onAddCategory: (category: Omit<Category, 'id'>) => void;
  onDeleteCategory: (id: string) => void;
  activeTab: 'all-tasks' | 'dashboard' | 'focus' | 'calendar';
  onChangeTab: (tab: 'all-tasks' | 'dashboard' | 'focus' | 'calendar') => void;
}

export function Sidebar({
  categories,
  tasks,
  filter,
  onChangeFilter,
  onAddCategory,
  onDeleteCategory,
  activeTab,
  onChangeTab
}: SidebarProps) {
  const [isAddingCategory, setIsAddingCategory] = useState(false);
  const [newCatName, setNewCatName] = useState('');
  const [newCatIcon, setNewCatIcon] = useState('Folder');
  const [newCatColor, setNewCatColor] = useState(AVAILABLE_COLORS[0].value);

  const getTaskCount = (catId: string) => {
    if (catId === 'all') {
      return tasks.filter(t => !t.completed).length;
    }
    return tasks.filter(t => t.category === catId && !t.completed).length;
  };

  const handleCreateCategory = (e: FormEvent) => {
    e.preventDefault();
    if (!newCatName.trim()) return;

    onAddCategory({
      name: newCatName.trim(),
      color: newCatColor,
      icon: newCatIcon
    });

    setNewCatName('');
    setIsAddingCategory(false);
  };

  return (
    <div className="flex flex-col h-full bg-white border-r border-stone-200/60 p-6 md:p-7 justify-between select-none">
      <div className="flex flex-col gap-6">
        
        {/* Profile / Application Brand Header */}
        <div className="flex items-center gap-3 pb-5 border-b border-stone-100">
          <div className="w-10 h-10 rounded-2xl bg-[#eef2ff] border border-indigo-150 flex items-center justify-center text-[#4f46e5]">
            <CheckSquare size={20} className="stroke-[2.5]" />
          </div>
          <div>
            <h1 className="font-display font-bold text-lg text-stone-800 tracking-tight leading-tight">
              BlissTasks <span className="text-[#4f46e5] font-medium">Bliss</span>
            </h1>
            <p className="text-[10.5px] font-mono text-stone-400 tracking-wide uppercase mt-0.5">
              Produtividade Refinada
            </p>
          </div>
        </div>

        {/* Primary View Selector Navigation */}
        <nav className="flex flex-col gap-1 font-sans">
          <span className="text-[10px] font-mono font-semibold uppercase tracking-wider text-stone-400 mb-2 px-2.5 block">
            Visualizações de Navegação
          </span>
          <button
            onClick={() => onChangeTab('all-tasks')}
            className={`flex items-center justify-between px-3.5 py-2.5 rounded-xl text-sm font-medium transition-all duration-300 ${
              activeTab === 'all-tasks'
                ? 'bg-[#eef2ff]'
                : ''
            }`}
          >
            <div className="flex items-center gap-2.5">
              <Folder size={17} />
              <span>Todas as Tarefas</span>
            </div>
          </button>

          <button
            onClick={() => onChangeTab('dashboard')}
            className={`flex items-center justify-between px-3.5 py-2.5 rounded-xl text-sm font-medium transition-all duration-300 ${
              activeTab === 'dashboard'
                ? 'bg-[#eef2ff]'
                : ''
            }`}
          >
            <div className="flex items-center gap-2.5">
              <LayoutDashboard size={17} />
              <span>Painel de Estatísticas</span>
            </div>
          </button>

          <button
            onClick={() => onChangeTab('focus')}
            className={`flex items-center justify-between px-3.5 py-2.5 rounded-xl text-sm font-medium transition-all duration-300 ${
              activeTab === 'focus'
                ? 'bg-[#eef2ff]'
                : ''
            }`}
          >
            <div className="flex items-center gap-2.5 flex-1">
              <Sparkles size={17} className="text-[#4f46e5]/85" />
              <span>Cronômetro de Foco Bliss</span>
            </div>
            {tasks.filter(t => !t.completed && t.priority === 'high').length > 0 && (
              <span className="w-1.5 h-1.5 rounded-full bg-rose-500" />
            )}
          </button>

          <button
            onClick={() => onChangeTab('calendar')}
            className={`flex items-center justify-between px-3.5 py-2.5 rounded-xl text-sm font-medium transition-all duration-300 ${
              activeTab === 'calendar'
                ? 'bg-[#eef2ff]'
                : ''
            }`}
          >
            <div className="flex items-center gap-2.5">
              <Calendar size={17} />
              <span>Linha do Tempo</span>
            </div>
          </button>
        </nav>

        {/* Categories / Custom lists */}
        <div className="flex flex-col gap-1.5 pt-4 border-t border-stone-100">
          <div className="flex items-center justify-between mb-2 px-2.5">
            <span className="text-[10px] font-mono font-semibold uppercase tracking-wider text-stone-400">
              Categorias Pessoais
            </span>
            <button
              onClick={() => setIsAddingCategory(!isAddingCategory)}
              className="p-1 rounded-md text-stone-400 hover:text-[#4f46e5] hover:bg-stone-50 border border-transparent hover:border-stone-100 transition-all"
              title="Adicionar Categoria/Lista Personalizada"
            >
              <Plus size={13} />
            </button>
          </div>

          {/* Add Category Form Inside Sidebar */}
          <AnimatePresence>
            {isAddingCategory && (
              <motion.form
                onSubmit={handleCreateCategory}
                initial={{ opacity: 0, height: 0 }}
                animate={{ opacity: 1, height: 'auto' }}
                exit={{ opacity: 0, height: 0 }}
                className="bg-stone-50 border border-stone-150 p-3 rounded-2xl flex flex-col gap-3.5 mb-2 overflow-hidden mx-1.5"
              >
                <div className="flex items-center justify-between pb-1.5 border-b border-stone-200/50">
                  <span className="text-xs font-semibold text-stone-700">Nova Categoria</span>
                  <button type="button" onClick={() => setIsAddingCategory(false)} className="text-stone-400 hover:text-stone-700">
                    <X size={12} />
                  </button>
                </div>

                <div className="flex flex-col gap-1">
                  <input
                    type="text"
                    required
                    maxLength={15}
                    value={newCatName}
                    onChange={e => setNewCatName(e.target.value)}
                    placeholder="Nome da Categoria"
                    className="px-2.5 py-1.5 text-xs bg-white border border-stone-200 outline-none rounded-xl focus:border-[#4f46e5] text-stone-700"
                  />
                </div>

                {/* Color Selector */}
                <div className="flex flex-col gap-1">
                  <span className="text-[9.5px] font-semibold text-stone-400 uppercase tracking-wider">Cor de Destaque</span>
                  <div className="flex flex-wrap gap-1">
                    {AVAILABLE_COLORS.map(c => (
                      <button
                        key={c.value}
                        type="button"
                        onClick={() => setNewCatColor(c.value)}
                        className={`w-5 h-5 rounded-md border text-[10px] flex items-center justify-center ${c.value} ${
                          newCatColor === c.value ? 'ring-2 ring-stone-900/10 border-stone-400 scale-105' : 'border-transparent'
                        }`}
                      >
                        Ab
                      </button>
                    ))}
                  </div>
                </div>

                {/* Icon Grid */}
                <div className="flex flex-col gap-1">
                  <span className="text-[9.5px] font-semibold text-stone-400 uppercase tracking-wider">Ícone Visual</span>
                  <div className="grid grid-cols-6 gap-1 max-h-20 overflow-y-auto pr-0.5 pt-0.5">
                    {AVAILABLE_ICONS.map(i => (
                      <button
                        key={i}
                        type="button"
                        onClick={() => setNewCatIcon(i)}
                        className={`p-1.5 rounded-lg border flex items-center justify-center hover:bg-white transition-all ${
                          newCatIcon === i 
                            ? 'bg-white border-stone-400 shadow-sm text-[#4f46e5]' 
                            : 'border-transparent text-stone-400 hover:text-stone-700'
                        }`}
                      >
                        <DynamicIcon name={i} size={11} />
                      </button>
                    ))}
                  </div>
                </div>

                <button
                  type="submit"
                  className="w-full py-1.5 bg-[#4f46e5] hover:bg-[#4338ca] text-white font-bold text-xs rounded-xl transition-all shadow-sm active:scale-95 mt-1"
                >
                  Criar Categoria
                </button>
              </motion.form>
            )}
          </AnimatePresence>

          {/* List Categories */}
          <div className="flex flex-col gap-0.5 max-h-56 overflow-y-auto pr-1">
            {categories.map(c => {
              const active = filter.category === c.id;
              const count = getTaskCount(c.id);
              const isDefaultInbox = ['all', 'inbox'].includes(c.id);

              return (
                <div
                  key={c.id}
                  className={`group/cat flex items-center justify-between rounded-xl px-2.5 py-2 text-xs font-semibold select-none transition-all duration-200 cursor-pointer ${
                    active
                      ? 'bg-[#eef2ff]/80 border-l-4 border-[#4f46e5] text-[#4f46e5]'
                      : 'text-stone-500 hover:text-stone-800 hover:bg-stone-50/50'
                  }`}
                  onClick={() => {
                    onChangeFilter({ category: c.id });
                    if (activeTab !== 'all-tasks' && activeTab !== 'dashboard') {
                      onChangeTab('all-tasks');
                    }
                  }}
                >
                  <div className="flex items-center gap-2 max-w-[80%]">
                    <span className={`p-1 rounded-lg border ${c.color} flex-shrink-0`}>
                      <DynamicIcon name={c.icon} size={11} />
                    </span>
                    <span className="truncate">{c.name}</span>
                  </div>
                  
                  <div className="flex items-center gap-1.5 shrink-0">
                    {count > 0 && (
                      <span className="text-[10px] bg-stone-100 text-stone-600 px-1.5 py-0.5 rounded-full font-sans font-medium">
                        {count}
                      </span>
                    )}

                    {/* Delete Custom lists */}
                    {!isDefaultInbox && (
                      <button
                        onClick={(e) => {
                          e.stopPropagation();
                          onDeleteCategory(c.id);
                        }}
                        className="opacity-0 group-hover/cat:opacity-100 p-0.5 text-stone-400 hover:text-rose-500 hover:bg-stone-100 rounded transition-all ml-1"
                        title="Excluir categoria"
                      >
                        <X size={11} />
                      </button>
                    )}
                  </div>
                </div>
              );
            })}
          </div>
        </div>

      </div>

      {/* Profile / Stats overview */}
      <div className="pt-5 border-t border-stone-100 flex flex-col gap-3 font-sans">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 rounded-full bg-indigo-50 border border-indigo-100 overflow-hidden flex items-center justify-center text-[#4f46e5] font-display font-bold text-sm">
            C
          </div>
          <div>
            <span className="text-xs font-semibold text-stone-800 block">
              Carlos M.
            </span>
            <span className="text-[10px] text-stone-400 font-medium block">
              Membro Pro (Persistência Local)
            </span>
          </div>
        </div>

        <div className="bg-stone-50/80 border border-stone-150 p-3 rounded-2xl">
          <div className="flex justify-between items-center text-xs text-stone-500 mb-1.5">
            <span className="font-medium">Metas Diárias</span>
            <span className="font-mono text-[11px] font-bold text-stone-700">
              {tasks.filter(t => t.completed).length}/{tasks.length} Concluídas
            </span>
          </div>
          <div className="w-full bg-stone-200/50 h-1.5 rounded-full overflow-hidden">
            <div 
              className="bg-[#4f46e5] h-full rounded-full transition-all duration-500" 
              style={{ 
                width: `${tasks.length > 0 ? (tasks.filter(t => t.completed).length / tasks.length) * 100 : 0}%` 
              }}
            />
          </div>
        </div>
      </div>

    </div>
  );
}
