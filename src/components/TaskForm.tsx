import { useState, useEffect, FormEvent } from 'react';
import { X, Plus, Calendar, ListTodo, AlertCircle, Trash } from 'lucide-react';
import { Task, Category, Priority, Subtask } from '../types';
import { DynamicIcon } from './DynamicIcon';
import { motion } from 'motion/react';

interface TaskFormProps {
  taskToEdit?: Task | null;
  categories: Category[];
  onSubmit: (taskData: Omit<Task, 'id' | 'createdAt' | 'completedAt'>) => void;
  onClose: () => void;
}

export function TaskForm({ taskToEdit, categories, onSubmit, onClose }: TaskFormProps) {
  const [title, setTitle] = useState('');
  const [description, setDescription] = useState('');
  const [priority, setPriority] = useState<Priority>('medium');
  const [category, setCategory] = useState('inbox');
  const [dueDate, setDueDate] = useState('');
  
  // Subtasks building
  const [subtasks, setSubtasks] = useState<Omit<Subtask, 'id'>[]>([]);
  const [newSubtaskTitle, setNewSubtaskTitle] = useState('');

  // Hydrate fields if we are in EDIT mode
  useEffect(() => {
    if (taskToEdit) {
      setTitle(taskToEdit.title);
      setDescription(taskToEdit.description || '');
      setPriority(taskToEdit.priority);
      setCategory(taskToEdit.category);
      setDueDate(taskToEdit.dueDate || '');
      setSubtasks(taskToEdit.subtasks.map(({ title, completed }) => ({ title, completed })));
    } else {
      // Clear values if we are in ADD mode
      setTitle('');
      setDescription('');
      setPriority('medium');
      setCategory('inbox');
      setDueDate('');
      setSubtasks([]);
    }
  }, [taskToEdit]);

  const handleAddSubtask = (e?: FormEvent) => {
    if (e) e.preventDefault();
    if (!newSubtaskTitle.trim()) return;

    setSubtasks([...subtasks, { title: newSubtaskTitle.trim(), completed: false }]);
    setNewSubtaskTitle('');
  };

  const handleRemoveSubtask = (index: number) => {
    setSubtasks(subtasks.filter((_, idx) => idx !== index));
  };

  const handleQuickDate = (daysAhead: number) => {
    const date = new Date();
    date.setDate(date.getDate() + daysAhead);
    setDueDate(date.toISOString().split('T')[0]);
  };

  const handleSubmit = (e: FormEvent) => {
    e.preventDefault();
    if (!title.trim()) return;

    // Convert draft subtasks to structural subtasks
    const finalSubtasks: Subtask[] = subtasks.map((sub, idx) => ({
      id: `sub-${Date.now()}-${idx}`,
      title: sub.title,
      completed: sub.completed
    }));

    onSubmit({
      title: title.trim(),
      description: description.trim(),
      completed: taskToEdit ? taskToEdit.completed : false,
      priority,
      category,
      dueDate: dueDate || undefined,
      subtasks: finalSubtasks
    });

    onClose();
  };

  return (
    <motion.div
      initial={{ opacity: 0, scale: 0.96 }}
      animate={{ opacity: 1, scale: 1 }}
      exit={{ opacity: 0, scale: 0.96 }}
      transition={{ duration: 0.22, ease: 'easeOut' }}
      className="bg-white rounded-3xl border border-stone-200/80 shadow-xl overflow-hidden w-full max-w-lg flex flex-col max-h-[85vh]"
    >
      {/* Header */}
      <div className="flex items-center justify-between px-6 py-5 border-b border-stone-100 flex-shrink-0">
        <div>
          <h2 className="text-xl font-bold font-display text-stone-800 tracking-tight">
            {taskToEdit ? 'Editar Detalhes da Tarefa' : 'Criar Nova Tarefa'}
          </h2>
          <p className="text-xs text-stone-400 mt-1">
            Preencha os detalhes para organizar seus objetivos de foco
          </p>
        </div>
        <button
          onClick={onClose}
          className="p-1.5 rounded-full hover:bg-stone-50 text-stone-400 hover:text-stone-700 border border-transparent hover:border-stone-100 transition-all"
        >
          <X size={18} />
        </button>
      </div>

      {/* Form Content */}
      <form onSubmit={handleSubmit} className="flex-1 overflow-y-auto px-6 py-5 flex flex-col gap-5">
        
        {/* Title Input */}
        <div className="flex flex-col gap-1.5">
          <label className="text-xs font-semibold text-stone-500 font-mono uppercase tracking-wider">
            Nome da Tarefa *
          </label>
          <input
            type="text"
            required
            value={title}
            onChange={e => setTitle(e.target.value)}
            placeholder="ex: Concluir minha meditação matinal"
            className="w-full px-4 py-3 rounded-2xl border border-stone-200 focus:border-[#4f46e5] focus:ring-4 focus:ring-[#4f46e5]/10 outline-none text-stone-800 text-sm transition-all"
          />
        </div>

        {/* Description / Notes text Area */}
        <div className="flex flex-col gap-1.5">
          <label className="text-xs font-semibold text-stone-500 font-mono uppercase tracking-wider">
            Notas / Descrição
          </label>
          <textarea
            value={description}
            onChange={e => setDescription(e.target.value)}
            placeholder="Adicione notas, links, contextos ou pensamentos estruturados..."
            rows={3}
            className="w-full px-4 py-3 rounded-2xl border border-stone-200 focus:border-[#4f46e5] focus:ring-4 focus:ring-[#4f46e5]/10 outline-none text-stone-800 text-sm transition-all resize-none"
          />
        </div>

        {/* Priority & Category Grid */}
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          
          {/* Category SELECT */}
          <div className="flex flex-col gap-1.5">
            <label className="text-xs font-semibold text-stone-500 font-mono uppercase tracking-wider">
              Categoria
            </label>
            <div className="relative">
              <select
                value={category}
                onChange={e => setCategory(e.target.value)}
                className="w-full appearance-none px-4 py-3 pr-10 rounded-2xl border border-stone-200 focus:border-[#4f46e5] focus:ring-4 focus:ring-[#4f46e5]/10 outline-none text-stone-700 text-sm transition-all bg-white"
              >
                {categories
                  .filter(c => c.id !== 'all')
                  .map(c => (
                    <option key={c.id} value={c.id}>
                      {c.name}
                    </option>
                  ))}
              </select>
              <div className="absolute inset-y-0 right-3 flex items-center pointer-events-none text-stone-400">
                <DynamicIcon name={(categories.find(c => c.id === category) || categories[1]).icon} size={15} />
              </div>
            </div>
          </div>

          {/* Priority SELECT */}
          <div className="flex flex-col gap-1.5">
            <label className="text-xs font-semibold text-stone-500 font-mono uppercase tracking-wider">
              Prioridade
            </label>
            <div className="flex bg-stone-50 p-1.5 border border-stone-200 rounded-2xl gap-1">
              {(['low', 'medium', 'high'] as const).map(p => (
                <button
                  key={p}
                  type="button"
                  onClick={() => setPriority(p)}
                  className={`flex-1 text-center py-1.5 text-xs font-semibold uppercase tracking-wider rounded-xl transition-all ${
                    priority === p
                      ? p === 'high'
                        ? 'bg-rose-500 text-white shadow-sm'
                        : p === 'medium'
                        ? 'bg-amber-500 text-white shadow-sm'
                        : 'bg-zinc-700 text-white shadow-sm'
                      : 'text-stone-400 hover:text-stone-700 hover:bg-stone-100/50'
                  }`}
                >
                  {p === 'low' ? 'Baixa' : p === 'medium' ? 'Média' : 'Alta'}
                </button>
              ))}
            </div>
          </div>

        </div>

        {/* Due Date & Quick Dates */}
        <div className="flex flex-col gap-2 border-t border-stone-100 pt-4">
          <label className="text-xs font-semibold text-stone-500 font-mono uppercase tracking-wider flex items-center gap-1.5">
            <Calendar size={13} className="text-stone-400" />
            <span>Data de Conclusão Alvo</span>
          </label>
          <div className="flex flex-col sm:flex-row gap-2">
            <input
              type="date"
              value={dueDate}
              onChange={e => setDueDate(e.target.value)}
              className="px-4 py-2.5 rounded-xl border border-stone-200 focus:border-[#4f46e5] focus:ring-4 focus:ring-[#4f46e5]/10 outline-none text-stone-700 text-sm transition-all sm:w-1/2"
            />
            {/* Quick date buttons */}
            <div className="flex flex-wrap gap-1.5 sm:flex-1 justify-start sm:justify-end items-center">
              <button
                type="button"
                onClick={() => handleQuickDate(0)}
                className="px-3 py-2 text-xs text-stone-600 bg-stone-50 hover:bg-stone-100 border border-stone-250 rounded-lg transition-colors"
              >
                Hoje
              </button>
              <button
                type="button"
                onClick={() => handleQuickDate(1)}
                className="px-3 py-2 text-xs text-stone-600 bg-stone-50 hover:bg-stone-100 border border-stone-250 rounded-lg transition-colors"
              >
                Amanhã
              </button>
              {dueDate && (
                <button
                  type="button"
                  onClick={() => setDueDate('')}
                  className="px-2.5 py-1.5 text-xs text-rose-500 hover:text-rose-700 transition-colors"
                >
                  Limpar
                </button>
              )}
            </div>
          </div>
        </div>

        {/* Sub-tasks / Checklists Editor Section */}
        <div className="flex flex-col gap-2.5 border-t border-stone-100 pt-4">
          <label className="text-xs font-semibold text-stone-500 font-mono uppercase tracking-wider flex items-center gap-1.5">
            <ListTodo size={13} className="text-stone-400" />
            <span>Subtarefas / Lista de Ações ({subtasks.length})</span>
          </label>

          {/* Subtask adding input */}
          <div className="flex gap-2">
            <input
              type="text"
              value={newSubtaskTitle}
              onChange={e => setNewSubtaskTitle(e.target.value)}
              onKeyDown={e => {
                if (e.key === 'Enter') {
                  e.preventDefault();
                  handleAddSubtask();
                }
              }}
              placeholder="ex: Fazer esboço de fluxos, revisar com o time..."
              className="flex-1 px-4 py-2.5 rounded-xl border border-stone-200 focus:border-[#4f46e5] focus:ring-4 focus:ring-[#4f46e5]/10 outline-none text-stone-700 text-xs transition-all"
            />
            <button
              type="button"
              onClick={() => handleAddSubtask()}
              className="px-4 bg-stone-100 hover:bg-indigo-50 text-stone-600 hover:text-indigo-700 border border-stone-200/60 rounded-xl flex items-center justify-center transition-all active:scale-95 text-xs font-medium"
            >
              <Plus size={16} className="mr-1" /> Add
            </button>
          </div>

          {/* Render draft subtasks */}
          {subtasks.length > 0 && (
            <div className="flex flex-col gap-1.5 mt-1 max-h-40 overflow-y-auto pr-1">
              {subtasks.map((sub, idx) => (
                <div
                  key={idx}
                  className="flex items-center justify-between px-3 py-2 bg-stone-50/50 rounded-xl border border-stone-150 text-xs"
                >
                  <span className="text-stone-700 truncate mr-2 font-medium">
                    {sub.title}
                  </span>
                  <button
                    type="button"
                    onClick={() => handleRemoveSubtask(idx)}
                    className="p-1 text-stone-400 hover:text-rose-500 hover:bg-white rounded border border-transparent hover:border-stone-100 transition-all flex-shrink-0"
                  >
                    <Trash size={12} />
                  </button>
                </div>
              ))}
            </div>
          )}
        </div>

      </form>

      {/* Footer Submission Actions */}
      <div className="px-6 py-4 border-t border-stone-100 bg-stone-50/50 flex items-center justify-end gap-3 flex-shrink-0">
        <button
          type="button"
          onClick={onClose}
          className="px-5 py-2.5 rounded-xl text-stone-500 hover:text-stone-800 text-sm font-medium transition-colors"
        >
          Cancelar
        </button>
        <button
          onClick={handleSubmit}
          className="px-6 py-2.5 bg-[#4f46e5] hover:bg-[#4338ca] font-bold text-white text-sm rounded-xl transition-all shadow-sm shadow-indigo-100 active:scale-95"
        >
          {taskToEdit ? 'Salvar Alterações' : 'Criar Tarefa'}
        </button>
      </div>

    </motion.div>
  );
}
