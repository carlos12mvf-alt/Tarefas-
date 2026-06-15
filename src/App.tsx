import { useState, useEffect, useRef } from 'react';
import { 
  Search, Plus, SlidersHorizontal, ArrowUpDown, ChevronDown, 
  Menu, X, Sparkle, AlertCircle, FileText, CheckCircle2, ChevronRight, ListTodo
} from 'lucide-react';
import { Task, Category, TaskFilter, Priority } from './types';
import { DEFAULT_CATEGORIES, GET_INITIAL_TASKS } from './data';
import { Sidebar } from './components/Sidebar';
import { TaskCard } from './components/TaskCard';
import { TaskForm } from './components/TaskForm';
import { FocusTimer } from './components/FocusTimer';
import { DashboardView } from './components/DashboardView';
import { CalendarView } from './components/CalendarView';
import { Confetti, ConfettiRef } from './components/Confetti';
import { motion, AnimatePresence } from 'motion/react';

export default function App() {
  // --- States ---
  const [tasks, setTasks] = useState<Task[]>([]);
  const [categories, setCategories] = useState<Category[]>([]);
  
  const [filter, setFilter] = useState<TaskFilter>({
    search: '',
    category: 'all',
    priority: 'all',
    status: 'all',
    sortBy: 'createdAt',
    sortOrder: 'desc',
  });

  const [activeTab, setActiveTab] = useState<'all-tasks' | 'dashboard' | 'focus' | 'calendar'>('all-tasks');
  const [activeFocusTaskId, setActiveFocusTaskId] = useState<string | null>(null);

  // Modal / Sidebar forms state
  const [isFormOpen, setIsFormOpen] = useState(false);
  const [taskToEdit, setTaskToEdit] = useState<Task | null>(null);
  
  // Mobile UI state
  const [isMobileSidebarOpen, setIsMobileSidebarOpen] = useState(false);
  const [showFiltersDropdown, setShowFiltersDropdown] = useState(false);

  // Confetti Canvas trigger
  const confettiRef = useRef<ConfettiRef | null>(null);

  // --- Initial Loading ---
  useEffect(() => {
    const savedTasks = localStorage.getItem('bliss-tasks');
    const savedCategories = localStorage.getItem('bliss-categories');

    if (savedTasks) {
      setTasks(JSON.parse(savedTasks));
    } else {
      const initial = GET_INITIAL_TASKS();
      setTasks(initial);
      localStorage.setItem('bliss-tasks', JSON.stringify(initial));
    }

    if (savedCategories) {
      setCategories(JSON.parse(savedCategories));
    } else {
      setCategories(DEFAULT_CATEGORIES);
      localStorage.setItem('bliss-categories', JSON.stringify(DEFAULT_CATEGORIES));
    }
  }, []);

  // --- Helper state persist syncing ---
  const saveTasksToLocalStorage = (updatedTasks: Task[]) => {
    setTasks(updatedTasks);
    localStorage.setItem('bliss-tasks', JSON.stringify(updatedTasks));
  };

  const saveCategoriesToLocalStorage = (updatedCats: Category[]) => {
    setCategories(updatedCats);
    localStorage.setItem('bliss-categories', JSON.stringify(updatedCats));
  };

  // --- Task Action Handlers ---
  const handleToggleComplete = (taskId: string) => {
    const updated = tasks.map(task => {
      if (task.id === taskId) {
        const nextCompleted = !task.completed;
        
        // Trigger confetti celebration on complete transition!
        if (nextCompleted && confettiRef.current) {
          confettiRef.current.fire();
        }

        return {
          ...task,
          completed: nextCompleted,
          completedAt: nextCompleted ? new Date().toISOString() : undefined,
        };
      }
      return task;
    });
    saveTasksToLocalStorage(updated);
  };

  const handleToggleSubtask = (taskId: string, subtaskId: string) => {
    const updated = tasks.map(task => {
      if (task.id === taskId) {
        const updatedSubtasks = task.subtasks.map(sub => {
          if (sub.id === subtaskId) {
            const nextCompleted = !sub.completed;
            if (nextCompleted && confettiRef.current) {
              // Delightful micro burst
              confettiRef.current.fire();
            }
            return { ...sub, completed: nextCompleted };
          }
          return sub;
        });
        return { ...task, subtasks: updatedSubtasks };
      }
      return task;
    });
    saveTasksToLocalStorage(updated);
  };

  const handleDeleteTask = (taskId: string) => {
    const confirmed = window.confirm('Deseja excluir esta tarefa? Esta ação é irreversível.');
    if (!confirmed) return;

    const updated = tasks.filter(task => task.id !== taskId);
    saveTasksToLocalStorage(updated);
    
    if (activeFocusTaskId === taskId) {
      setActiveFocusTaskId(null);
    }
  };

  const handleOpenEditTask = (task: Task) => {
    setTaskToEdit(task);
    setIsFormOpen(true);
  };

  const handleCreateOrUpdateTask = (taskData: Omit<Task, 'id' | 'createdAt' | 'completedAt'>) => {
    if (taskToEdit) {
      // Update Mode
      const updated = tasks.map(t => {
        if (t.id === taskToEdit.id) {
          return {
            ...t,
            title: taskData.title,
            description: taskData.description,
            priority: taskData.priority,
            category: taskData.category,
            dueDate: taskData.dueDate,
            subtasks: taskData.subtasks,
            completed: taskData.completed,
          };
        }
        return t;
      });
      saveTasksToLocalStorage(updated);
      setTaskToEdit(null);
    } else {
      // Add Mode
      const newTask: Task = {
        ...taskData,
        id: `task-${Date.now()}`,
        createdAt: new Date().toISOString(),
      };
      saveTasksToLocalStorage([newTask, ...tasks]);
    }
    setIsFormOpen(false);
  };

  // --- Category Actions ---
  const handleAddCategory = (catData: Omit<Category, 'id'>) => {
    const newCat: Category = {
      ...catData,
      id: `cat-${Date.now()}`,
    };
    const updated = [...categories, newCat];
    saveCategoriesToLocalStorage(updated);
  };

  const handleDeleteCategory = (catId: string) => {
    const confirmed = window.confirm(
      'Excluir esta categoria? As tarefas associadas serão realocadas para a Caixa de Entrada.'
    );
    if (!confirmed) return;

    // Filter out the category
    const updatedCats = categories.filter(c => c.id !== catId);
    saveCategoriesToLocalStorage(updatedCats);

    // Reallocate tasks
    const reallocatedTasks = tasks.map(t => {
      if (t.category === catId) {
        return { ...t, category: 'inbox' };
      }
      return t;
    });
    saveTasksToLocalStorage(reallocatedTasks);

    // Reset filtering
    if (filter.category === catId) {
      setFilter(prev => ({ ...prev, category: 'all' }));
    }
  };

  const handleSelectTaskFocus = (taskId: string) => {
    setActiveFocusTaskId(taskId);
    setActiveTab('focus');
  };

  // --- Filter and Sort computations ---
  const getFilteredAndSortedTasks = () => {
    let list = [...tasks];

    // Search filter
    if (filter.search.trim()) {
      const q = filter.search.toLowerCase();
      list = list.filter(
        t => t.title.toLowerCase().includes(q) || t.description.toLowerCase().includes(q)
      );
    }

    // Category filter
    if (filter.category !== 'all') {
      list = list.filter(t => t.category === filter.category);
    }

    // Priority filter
    if (filter.priority !== 'all') {
      list = list.filter(t => t.priority === filter.priority);
    }

    // Status filter
    if (filter.status === 'active') {
      list = list.filter(t => !t.completed);
    } else if (filter.status === 'completed') {
      list = list.filter(t => t.completed);
    }

    // Sorting
    list.sort((a, b) => {
      let comparison = 0;

      if (filter.sortBy === 'dueDate') {
        const dateA = a.dueDate ? new Date(a.dueDate).getTime() : Infinity;
        const dateB = b.dueDate ? new Date(b.dueDate).getTime() : Infinity;
        comparison = dateA - dateB;
      } else if (filter.sortBy === 'priority') {
        const pValues = { high: 3, medium: 2, low: 1 };
        comparison = pValues[b.priority] - pValues[a.priority];
      } else if (filter.sortBy === 'alphabetical') {
        comparison = a.title.localeCompare(b.title);
      } else {
        // default: createdAt
        comparison = new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime();
      }

      return filter.sortOrder === 'asc' ? comparison : -comparison;
    });

    return list;
  };

  const clearAllFilters = () => {
    setFilter({
      search: '',
      category: 'all',
      priority: 'all',
      status: 'all',
      sortBy: 'createdAt',
      sortOrder: 'desc',
    });
  };

  const activeCategory = categories.find(c => c.id === filter.category);
  const displayTasksList = getFilteredAndSortedTasks();

  return (
    <div className="relative flex h-screen w-screen overflow-hidden bg-stone-50 text-stone-800 font-sans antialiased">
      
      {/* Confetti celebration canvas layer */}
      <Confetti ref={confettiRef} />

      {/* --- DESKTOP SIDEBAR --- */}
      <div className="hidden lg:block w-76 xl:w-80 h-full flex-shrink-0">
        <Sidebar
          categories={categories}
          tasks={tasks}
          filter={filter}
          onChangeFilter={f => setFilter(prev => ({ ...prev, ...f }))}
          onAddCategory={handleAddCategory}
          onDeleteCategory={handleDeleteCategory}
          activeTab={activeTab}
          onChangeTab={setActiveTab}
        />
      </div>

      {/* --- MOBILE SIDEBAR DRAWER --- */}
      <AnimatePresence>
        {isMobileSidebarOpen && (
          <>
            {/* Backdrop Mask */}
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 0.45 }}
              exit={{ opacity: 0 }}
              onClick={() => setIsMobileSidebarOpen(false)}
              className="fixed inset-0 bg-stone-900/60 z-40 lg:hidden"
            />
            {/* Drawer container */}
            <motion.div
              initial={{ x: '-100%' }}
              animate={{ x: 0 }}
              exit={{ x: '-100%' }}
              transition={{ type: 'spring', damping: 25, stiffness: 220 }}
              className="fixed inset-y-0 left-0 w-72 md:w-80 bg-white shadow-2xl z-50 lg:hidden"
            >
              <Sidebar
                categories={categories}
                tasks={tasks}
                filter={filter}
                onChangeFilter={f => setFilter(prev => ({ ...prev, ...f }))}
                onAddCategory={handleAddCategory}
                onDeleteCategory={handleDeleteCategory}
                activeTab={activeTab}
                onChangeTab={setActiveTab}
              />
            </motion.div>
          </>
        )}
      </AnimatePresence>

      {/* --- MAIN WORKSPACE AREA PANEL --- */}
      <div className="flex-1 flex flex-col h-full min-w-0 overflow-hidden">
        
        {/* Mobile Header Bar */}
        <header className="lg:hidden flex items-center justify-between px-5 py-4 border-b border-stone-200/65 bg-white shrink-0">
          <div className="flex items-center gap-2.5 font-sans">
            <button
              onClick={() => setIsMobileSidebarOpen(true)}
              className="p-2 -ml-2 rounded-xl text-stone-500 hover:text-stone-800 hover:bg-stone-50 transition-colors"
            >
              <Menu size={20} />
            </button>
            <span className="font-display font-bold text-base text-stone-800 tracking-tight leading-none">
              Tarefas <span className="text-[#4f46e5] font-medium">Bliss</span>
            </span>
          </div>

          <button
            onClick={() => {
              setTaskToEdit(null);
              setIsFormOpen(true);
            }}
            className="p-2.5 bg-[#4f46e5] text-white rounded-xl shadow-sm hover:bg-[#4338ca] transition-colors"
          >
            <Plus size={16} />
          </button>
        </header>

        {/* Dynamic Nav Tabs row inside header container */}
        <div className="flex-1 overflow-y-auto px-5 md:px-8 py-6 flex flex-col gap-6">
          
          {/* WORKSPACE VIEW: ALL TASKS */}
          {activeTab === 'all-tasks' && (
            <div className="flex flex-col gap-5">
              
              {/* Header section with Create & Search operations */}
              <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-2">
                <div>
                  <h2 className="text-2xl font-bold font-display text-stone-800 tracking-tight flex items-center gap-2">
                    <span>{activeCategory ? activeCategory.name : 'Todas as Tarefas'}</span>
                    <span className="text-xs bg-stone-150 text-stone-500 border border-stone-200 px-2.5 py-0.5 rounded-full font-sans font-medium self-center mt-1">
                      {displayTasksList.length} {displayTasksList.length === 1 ? 'item' : 'itens'}
                    </span>
                  </h2>
                  <p className="text-xs text-stone-400 mt-1">
                    Progredindo pelas metas diárias com clareza, calma e foco
                  </p>
                </div>
                
                {/* Floating Add Task Trigger */}
                <button
                  onClick={() => {
                    setTaskToEdit(null);
                    setIsFormOpen(true);
                  }}
                  className="hidden sm:flex items-center gap-1.5 px-4 py-2.5 bg-[#4f46e5] hover:bg-[#4338ca] text-white font-bold text-sm rounded-xl transition-all shadow-md shadow-indigo-100 active:scale-95 flex-shrink-0"
                >
                  <Plus size={16} />
                  <span>Criar Tarefa</span>
                </button>
              </div>

              {/* Filtering Controls Bar */}
              <div className="bg-white border border-stone-200/80 rounded-2xl p-4 flex flex-col gap-3 shadow-sm select-none">
                <div className="flex flex-col md:flex-row gap-3">
                  
                  {/* Search query input */}
                  <div className="relative flex-1">
                    <Search className="absolute inset-y-0 left-3.5 my-auto text-stone-400" size={16} />
                    <input
                      type="text"
                      value={filter.search}
                      onChange={e => setFilter(prev => ({ ...prev, search: e.target.value }))}
                      placeholder="Buscar tarefas por título, prioridade, descrição..."
                      className="w-full pl-10 pr-4 py-2.5 text-xs rounded-xl border border-stone-205 outline-none focus:border-[#4f46e5] transition-colors"
                    />
                    {filter.search && (
                      <button
                        onClick={() => setFilter(prev => ({ ...prev, search: '' }))}
                        className="absolute inset-y-0 right-3 flex items-center text-stone-400 hover:text-stone-700"
                      >
                        <X size={14} />
                      </button>
                    )}
                  </div>

                  {/* Filter Status Pills (All, Active, Completed) */}
                  <div className="flex border border-stone-200 rounded-xl p-0.5 bg-stone-50">
                    {(['all', 'active', 'completed'] as const).map(st => (
                      <button
                        key={st}
                        onClick={() => setFilter(prev => ({ ...prev, status: st }))}
                        className={`px-3 py-1.5 text-xs font-semibold rounded-lg transition-all ${
                          filter.status === st
                            ? 'bg-white text-stone-800 shadow-xs'
                            : 'text-stone-400 hover:text-stone-700'
                        }`}
                      >
                        {st === 'all' ? 'Todas' : st === 'active' ? 'Ativas' : 'Concluídas'}
                      </button>
                    ))}
                  </div>

                  {/* Trigger more configurations dropdown */}
                  <button
                    onClick={() => setShowFiltersDropdown(!showFiltersDropdown)}
                    className={`px-3.5 py-2 rounded-xl text-xs font-semibold border transition-all flex items-center gap-1.5 justify-center md:justify-start ${
                      showFiltersDropdown 
                        ? 'bg-indigo-50 border-indigo-200 text-[#4f46e5] font-bold' 
                        : 'border-stone-200 text-stone-500 hover:text-[#4f46e5] hover:bg-stone-50'
                    }`}
                  >
                    <SlidersHorizontal size={14} />
                    <span>Filtros de Foco</span>
                    <ChevronDown size={12} className={`transform transition-transform ${showFiltersDropdown ? 'rotate-180' : ''}`} />
                  </button>

                </div>

                {/* More configurations drawer details */}
                <AnimatePresence>
                  {showFiltersDropdown && (
                    <motion.div
                      initial={{ height: 0, opacity: 0 }}
                      animate={{ height: 'auto', opacity: 1 }}
                      exit={{ height: 0, opacity: 0 }}
                      className="overflow-hidden border-t border-stone-100 pt-3 flex flex-col sm:flex-row gap-4"
                    >
                      {/* Priority selector dropdown */}
                      <div className="flex flex-col gap-1 sm:w-1/3">
                        <span className="text-[10px] uppercase font-semibold font-mono text-stone-400 tracking-wider">
                          Prioridade
                        </span>
                        <select
                          value={filter.priority}
                          onChange={e => setFilter(prev => ({ ...prev, priority: e.target.value as any }))}
                          className="w-full px-3 py-2 bg-stone-50 border border-stone-200 rounded-lg text-xs font-medium text-stone-700"
                        >
                          <option value="all">Todas as Prioridades</option>
                          <option value="high">Alta Prioridade</option>
                          <option value="medium">Média Prioridade</option>
                          <option value="low">Baixa Prioridade</option>
                        </select>
                      </div>

                      {/* Sorting filter options */}
                      <div className="flex flex-col gap-1 sm:w-1/3">
                        <span className="text-[10px] uppercase font-semibold font-mono text-stone-400 tracking-wider">
                          Ordenar Por
                        </span>
                        <div className="flex gap-2">
                          <select
                            value={filter.sortBy}
                            onChange={e => setFilter(prev => ({ ...prev, sortBy: e.target.value as any }))}
                            className="flex-1 px-3 py-2 bg-stone-50 border border-stone-200 rounded-lg text-xs font-medium text-stone-700"
                          >
                            <option value="createdAt">Data de Criação</option>
                            <option value="dueDate">Prazo de Conclusão</option>
                            <option value="priority">Grau de Prioridade</option>
                            <option value="alphabetical">Nome da Tarefa (A-Z)</option>
                          </select>
                          
                          {/* Order ascend/descend toggler */}
                          <button
                            onClick={() => setFilter(prev => ({ ...prev, sortOrder: prev.sortOrder === 'asc' ? 'desc' : 'asc' }))}
                            className="p-2 border border-stone-200 rounded-lg bg-stone-50 text-stone-50/10 hover:text-stone-700"
                            title={filter.sortOrder === 'asc' ? 'Crescente' : 'Decrescente'}
                          >
                            <ArrowUpDown size={14} className="text-stone-500" />
                          </button>
                        </div>
                      </div>

                      {/* Clear configurations button */}
                      <div className="flex items-end sm:flex-1 justify-end">
                        <button
                          onClick={clearAllFilters}
                          className="px-3.5 py-2 text-xs font-bold text-rose-500 hover:text-rose-700 hover:bg-rose-50 rounded-lg transition-colors border border-transparent hover:border-rose-100"
                        >
                          Limpar Filtros
                        </button>
                      </div>
                    </motion.div>
                  )}
                </AnimatePresence>
              </div>

              {/* Floating Mobile quick task creation bar */}
              <div className="flex flex-col gap-3">
                {displayTasksList.length > 0 ? (
                  <div className="grid grid-cols-1 gap-3.5">
                    {displayTasksList.map(task => (
                      <TaskCard
                        key={task.id}
                        task={task}
                        category={categories.find(c => c.id === task.category)}
                        onToggleComplete={handleToggleComplete}
                        onToggleSubtask={handleToggleSubtask}
                        onDelete={handleDeleteTask}
                        onEdit={handleOpenEditTask}
                        onSelectFocus={handleSelectTaskFocus}
                        isFocused={activeFocusTaskId === task.id}
                      />
                    ))}
                  </div>
                ) : (
                  <div className="bg-white border border-stone-200/80 border-dashed rounded-3xl p-12 text-center flex flex-col items-center justify-center max-w-xl mx-auto w-full">
                    <div className="w-12 h-12 rounded-full bg-stone-50 border border-stone-150 flex items-center justify-center text-stone-400 mb-4">
                      <ListTodo size={20} />
                    </div>
                    <h3 className="font-display font-semibold text-stone-800 text-base leading-none">
                      Espaço de Trabalho Calmo
                    </h3>
                    <p className="text-xs text-stone-400 mt-2 max-w-sm">
                      Não encontramos nenhuma tarefa com os filtros selecionados. Respire fundo, crie uma nova tarefa e gerencie seu progresso com facilidade.
                    </p>
                    <button
                      onClick={() => {
                        setTaskToEdit(null);
                        setIsFormOpen(true);
                      }}
                      className="mt-5 px-4.5 py-2 bg-[#4f46e5] hover:bg-[#4338ca] text-white font-bold text-xs rounded-xl transition-all shadow-sm active:scale-95"
                    >
                      Adicionar Tarefa
                    </button>
                  </div>
                )}
              </div>

            </div>
          )}

          {/* WORKSPACE VIEW: STATS DASHBOARD */}
          {activeTab === 'dashboard' && (
            <DashboardView
              tasks={tasks}
              categories={categories}
              onSelectTab={setActiveTab}
              onSelectTaskFocus={handleSelectTaskFocus}
              onToggleComplete={handleToggleComplete}
            />
          )}

          {/* WORKSPACE VIEW: BLISS FOCUS TIMER */}
          {activeTab === 'focus' && (
            <div className="max-w-xl mx-auto w-full mt-4">
              <FocusTimer
                tasks={tasks}
                activeTaskId={activeFocusTaskId}
                onSelectTask={setActiveFocusTaskId}
                onCompleteTask={(id) => {
                  handleToggleComplete(id);
                  setActiveFocusTaskId(null);
                }}
              />
            </div>
          )}

          {/* WORKSPACE VIEW: SCHEDULE TIMELINE */}
          {activeTab === 'calendar' && (
            <CalendarView
              tasks={tasks}
              categories={categories}
              onToggleComplete={handleToggleComplete}
              onSelectTaskFocus={handleSelectTaskFocus}
            />
          )}

        </div>

      </div>

      {/* --- TASK FORM MODAL WRAPPER LAYER --- */}
      <AnimatePresence>
        {isFormOpen && (
          <div className="fixed inset-0 z-50 flex items-center justify-center px-4 bg-stone-900/40 backdrop-blur-xs select-none">
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              onClick={() => setIsFormOpen(false)}
              className="absolute inset-0"
            />
            <TaskForm
              taskToEdit={taskToEdit}
              categories={categories}
              onSubmit={handleCreateOrUpdateTask}
              onClose={() => setIsFormOpen(false)}
            />
          </div>
        )}
      </AnimatePresence>

    </div>
  );
}
