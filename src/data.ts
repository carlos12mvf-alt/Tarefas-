import { Category, Task } from './types';

export const DEFAULT_CATEGORIES: Category[] = [
  { id: 'all', name: 'Todas as Tarefas', color: 'bg-zinc-100 text-zinc-800 border-zinc-200 dark:bg-zinc-800 dark:text-zinc-200', icon: 'Folder' },
  { id: 'inbox', name: 'Entrada', color: 'bg-slate-100 text-slate-800 border-slate-200', icon: 'Inbox' },
  { id: 'work', name: 'Trabalho', color: 'bg-blue-50 text-blue-700 border-blue-200', icon: 'Briefcase' },
  { id: 'personal', name: 'Pessoal', color: 'bg-emerald-50 text-emerald-700 border-emerald-200', icon: 'User' },
  { id: 'wellness', name: 'Bem-estar', color: 'bg-rose-50 text-rose-700 border-rose-200', icon: 'Heart' },
  { id: 'shopping', name: 'Compras', color: 'bg-amber-50 text-amber-700 border-amber-200', icon: 'ShoppingCart' },
  { id: 'ideas', name: 'Ideias', color: 'bg-purple-50 text-purple-700 border-purple-200', icon: 'Sparkles' },
];

export const AVAILABLE_ICONS = [
  'Inbox', 'Briefcase', 'User', 'Heart', 'ShoppingCart', 'Sparkles', 
  'Book', 'Code', 'Coffee', 'Music', 'Target', 'Compass', 'Globe', 
  'Bookmark', 'Star', 'Smile', 'Sun', 'Moon', 'Gamepad', 'Calendar'
];

export const AVAILABLE_COLORS = [
  { name: 'Cinza', value: 'bg-slate-50 text-slate-700 border-slate-200' },
  { name: 'Azul', value: 'bg-blue-50 text-blue-700 border-blue-200' },
  { name: 'Verde Esmeralda', value: 'bg-emerald-50 text-emerald-700 border-emerald-200' },
  { name: 'Rosa', value: 'bg-rose-50 text-rose-700 border-rose-200' },
  { name: 'Âmbar', value: 'bg-amber-50 text-amber-700 border-amber-200' },
  { name: 'Roxo', value: 'bg-purple-50 text-purple-700 border-purple-200' },
  { name: 'Índigo', value: 'bg-indigo-50 text-indigo-700 border-indigo-200' },
  { name: 'Ciano', value: 'bg-teal-50 text-teal-700 border-teal-200' },
];

export const GET_INITIAL_TASKS = (): Task[] => {
  const today = new Date().toISOString().split('T')[0];
  const tomorrow = new Date(Date.now() + 86400000).toISOString().split('T')[0];
  const nextWeek = new Date(Date.now() + 86400000 * 7).toISOString().split('T')[0];

  return [
    {
      id: 'task-1',
      title: 'Planejar viagem relaxante no fim de semana',
      description: 'Encontrar um lugar bem sossegado perto da natureza para descansar e ler. Procurar por chalés pequenos ou retiros à beira do lago.',
      completed: false,
      priority: 'high',
      category: 'personal',
      dueDate: today,
      subtasks: [
        { id: 'sub-1-1', title: 'Pesquisar chalés na beira do lago', completed: true },
        { id: 'sub-1-2', title: 'Comparar preços e disponibilidades', completed: false },
        { id: 'sub-1-3', title: 'Rascunhar uma lista de bagagem simples', completed: false }
      ],
      createdAt: new Date(Date.now() - 3600000 * 24).toISOString()
    },
    {
      id: 'task-2',
      title: 'Criar mockups de alta fidelidade para o painel',
      description: 'Estruturar telas limpas e minimalistas para o painel de controle. Focar em layouts com bom uso de espaço negativo, grandes margens e tons suaves.',
      completed: false,
      priority: 'medium',
      category: 'work',
      dueDate: tomorrow,
      subtasks: [
        { id: 'sub-2-1', title: 'Definir uma paleta de cores pastel inteligente', completed: true },
        { id: 'sub-2-2', title: 'Projetar as abas da barra lateral e fluxo de navegação', completed: false },
        { id: 'sub-2-3', title: 'Ajustar o espaçamento e tracking da tipografia', completed: false }
      ],
      createdAt: new Date(Date.now() - 3600000 * 48).toISOString()
    },
    {
      id: 'task-3',
      title: 'Meditar por 15 minutos',
      description: 'Praticar atenção plena focando puramente no fluxo da respiração. Utilize o Cronômetro de Foco Bliss dentro deste aplicativo!',
      completed: true,
      priority: 'low',
      category: 'wellness',
      dueDate: today,
      subtasks: [],
      createdAt: new Date(Date.now() - 3600000 * 12).toISOString(),
      completedAt: new Date().toISOString()
    },
    {
      id: 'task-4',
      title: 'Fazer brainstorm de novas funções criativas',
      description: 'Fazer uma lista de microinterações calmantes e notificações inteligentes para engajar os usuários com carinho.',
      completed: false,
      priority: 'low',
      category: 'ideas',
      dueDate: nextWeek,
      subtasks: [
        { id: 'sub-4-1', title: 'Listar pelo menos 5 ideias para microanimações', completed: false }
      ],
      createdAt: new Date().toISOString()
    }
  ];
};
