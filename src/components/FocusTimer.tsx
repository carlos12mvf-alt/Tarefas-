import { useState, useEffect, useRef } from 'react';
import { Play, Pause, RotateCcw, Timer, Sparkles, CheckCircle2, Moon, Sun, Wind } from 'lucide-react';
import { Task } from '../types';
import { motion, AnimatePresence } from 'motion/react';

interface FocusTimerProps {
  tasks: Task[];
  activeTaskId: string | null;
  onSelectTask: (id: string | null) => void;
  onCompleteTask: (id: string) => void;
}

export function FocusTimer({ tasks, activeTaskId, onSelectTask, onCompleteTask }: FocusTimerProps) {
  const [mode, setMode] = useState<'pomodoro' | 'shortBreak' | 'longBreak'>('pomodoro');
  const [timeLeft, setTimeLeft] = useState(25 * 60);
  const [isRunning, setIsRunning] = useState(false);
  
  // Breathing guide state
  const [breathPhase, setBreathPhase] = useState<'in' | 'hold' | 'out'>('in');
  const [breathSeconds, setBreathSeconds] = useState(0);

  const activeTask = tasks.find(t => t.id === activeTaskId);

  // Default times
  const TIMES = {
    pomodoro: 25 * 60,
    shortBreak: 5 * 60,
    longBreak: 15 * 60,
  };

  useEffect(() => {
    setTimeLeft(TIMES[mode]);
    setIsRunning(false);
  }, [mode]);

  // Global countdown timer
  useEffect(() => {
    let interval: any = null;
    if (isRunning) {
      interval = setInterval(() => {
        setTimeLeft(prev => {
          if (prev <= 1) {
            setIsRunning(false);
            // Play a calm chiming sound using simple Web Audio API synthesized chime!
            playPeacefulChime();
            return 0;
          }
          return prev - 1;
        });
      }, 1000);
    } else {
      clearInterval(interval);
    }
    return () => clearInterval(interval);
  }, [isRunning]);

  // Breathing Guide loop
  useEffect(() => {
    let interval: any = null;
    if (isRunning && mode === 'pomodoro') {
      interval = setInterval(() => {
        setBreathSeconds(prev => {
          const next = (prev + 1) % 12; // 4s in, 4s hold, 4s out loop
          if (next < 4) {
            setBreathPhase('in');
          } else if (next < 8) {
            setBreathPhase('hold');
          } else {
            setBreathPhase('out');
          }
          return next;
        });
      }, 1000);
    } else {
      setBreathSeconds(0);
      setBreathPhase('in');
      clearInterval(interval);
    }
    return () => clearInterval(interval);
  }, [isRunning, mode]);

  const playPeacefulChime = () => {
    try {
      const audioCtx = new (window.AudioContext || (window as any).webkitAudioContext)();
      
      // First tone (root)
      const osc1 = audioCtx.createOscillator();
      const gain1 = audioCtx.createGain();
      osc1.connect(gain1);
      gain1.connect(audioCtx.destination);
      osc1.frequency.setValueAtTime(523.25, audioCtx.currentTime); // C5
      gain1.gain.setValueAtTime(0.3, audioCtx.currentTime);
      gain1.gain.exponentialRampToValueAtTime(0.0001, audioCtx.currentTime + 2.5);
      
      // Second tone (major third - peaceful vibe)
      const osc2 = audioCtx.createOscillator();
      const gain2 = audioCtx.createGain();
      osc2.connect(gain2);
      gain2.connect(audioCtx.destination);
      osc2.frequency.setValueAtTime(659.25, audioCtx.currentTime); // E5
      gain2.gain.setValueAtTime(0.2, audioCtx.currentTime + 0.15);
      gain2.gain.exponentialRampToValueAtTime(0.0001, audioCtx.currentTime + 2.5);

      // Third tone (perfect fifth - serene resolution)
      const osc3 = audioCtx.createOscillator();
      const gain3 = audioCtx.createGain();
      osc3.connect(gain3);
      gain3.connect(audioCtx.destination);
      osc3.frequency.setValueAtTime(783.99, audioCtx.currentTime + 0.3); // G5
      gain3.gain.setValueAtTime(0.25, audioCtx.currentTime + 0.3);
      gain3.gain.exponentialRampToValueAtTime(0.0001, audioCtx.currentTime + 3.0);

      osc1.start();
      osc2.start();
      osc3.start();

      osc1.stop(audioCtx.currentTime + 3.0);
      osc2.stop(audioCtx.currentTime + 3.0);
      osc3.stop(audioCtx.currentTime + 3.0);
    } catch (e) {
      console.log('Audio Context failed to play', e);
    }
  };

  const formatTime = (seconds: number) => {
    const mins = Math.floor(seconds / 60);
    const secs = seconds % 60;
    return `${mins.toString().padStart(2, '0')}:${secs.toString().padStart(2, '0')}`;
  };

  const getProgress = () => {
    const total = TIMES[mode];
    return ((total - timeLeft) / total) * 100;
  };

  return (
    <div className="bg-white rounded-3xl p-8 border border-stone-100 shadow-sm flex flex-col items-center justify-between min-h-[500px]">
      
      {/* Top Header */}
      <div className="w-full flex items-center justify-between mb-2">
        <div className="flex items-center gap-2 text-stone-800 font-medium">
          <Timer className="text-[#4f46e5]" size={20} />
          <span className="font-display tracking-tight text-lg">Cronômetro de Foco Bliss</span>
        </div>
        <div className="flex gap-1 bg-stone-50 p-1 rounded-full border border-stone-100">
          {(['pomodoro', 'shortBreak', 'longBreak'] as const).map(m => (
            <button
              key={m}
              onClick={() => setMode(m)}
              className={`px-3 py-1 text-xs font-medium rounded-full transition-all duration-300 ${
                mode === m
                  ? 'bg-[#4f46e5] text-white shadow-sm'
                  : 'text-stone-500 hover:text-stone-800'
              }`}
            >
              {m === 'pomodoro' ? 'Foco' : m === 'shortBreak' ? 'Pausa Curta' : 'Pausa Longa'}
            </button>
          ))}
        </div>
      </div>

      {/* Main Timer Display & Breathing visualization */}
      <div className="relative my-8 flex items-center justify-center w-64 h-64">
        {/* Outer Circular SVG Progress Bar */}
        <svg className="absolute w-full h-full transform -rotate-90">
          <circle
            cx="128"
            cy="128"
            r="116"
            className="stroke-stone-50 fill-none"
            strokeWidth="8"
          />
          <motion.circle
            cx="128"
            cy="128"
            r="116"
            className="stroke-[#4f46e5] fill-none"
            strokeWidth="8"
            strokeDasharray={2 * Math.PI * 116}
            initial={{ strokeDashoffset: 2 * Math.PI * 116 }}
            animate={{ strokeDashoffset: (2 * Math.PI * 116) * (1 - getProgress() / 100) }}
            transition={{ duration: 0.5, ease: 'easeOut' }}
            strokeLinecap="round"
          />
        </svg>

        {/* Breathing guide pulse animation */}
        <AnimatePresence>
          {isRunning && mode === 'pomodoro' && (
            <motion.div
              layoutId="breathCircle"
              className={`absolute rounded-full filter blur-md opacity-35 ${
                breathPhase === 'in'
                  ? 'bg-violet-300'
                  : breathPhase === 'hold'
                  ? 'bg-indigo-300'
                  : 'bg-purple-300'
              }`}
              style={{ width: '220px', height: '220px' }}
              animate={{
                scale: breathPhase === 'in' ? 1.05 : breathPhase === 'hold' ? 1.08 : 0.85,
              }}
              transition={{
                duration: breathPhase === 'hold' ? 4 : 4,
                ease: 'easeInOut'
              }}
            />
          )}
        </AnimatePresence>

        {/* Inner Content */}
        <div className="z-10 flex flex-col items-center">
          <span className="font-display font-bold text-5xl text-stone-800 tracking-tight">
            {formatTime(timeLeft)}
          </span>
          <span className="text-xs text-stone-400 mt-1 uppercase tracking-wider font-mono">
            {mode === 'pomodoro' ? 'Mantenha o Foco' : 'Aproveite a Pausa'}
          </span>

          {/* Prompt indicating breathing state */}
          <AnimatePresence mode="wait">
            {isRunning && mode === 'pomodoro' && (
              <motion.div
                key={breathPhase}
                initial={{ opacity: 0, y: 5 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -5 }}
                className="flex items-center gap-1.5 text-[#4f46e5] font-medium text-sm mt-3 px-3 py-1 rounded-full bg-indigo-50/50 border border-indigo-100"
              >
                <Wind size={13} className="animate-pulse" />
                <span className="capitalize font-sans tracking-wide">
                  {breathPhase === 'in' && 'Inspire...'}
                  {breathPhase === 'hold' && 'Segure o ar...'}
                  {breathPhase === 'out' && 'Expire lentamente...'}
                </span>
              </motion.div>
            )}
          </AnimatePresence>
        </div>
      </div>

      {/* Controls */}
      <div className="flex items-center justify-center gap-4 mb-4">
        <button
          onClick={() => {
            setTimeLeft(TIMES[mode]);
            setIsRunning(false);
          }}
          className="p-3 rounded-full hover:bg-stone-100 text-stone-500 hover:text-stone-800 transition-colors border border-transparent hover:border-stone-200"
          title="Reiniciar cronômetro"
        >
          <RotateCcw size={18} />
        </button>

        <button
          onClick={() => setIsRunning(!isRunning)}
          className={`flex items-center justify-center p-5 rounded-full shadow-lg hover:shadow-xl transition-all hover:scale-105 active:scale-95 ${
            isRunning 
              ? 'bg-rose-500 text-white shadow-rose-100' 
              : 'bg-[#4f46e5] text-white shadow-indigo-100'
          }`}
        >
          {isRunning ? <Pause size={24} fill="currentColor" /> : <Play size={24} fill="currentColor" className="translate-x-0.5" />}
        </button>

        <div className="w-10 h-10" /> {/* Spacer to balance layout */}
      </div>

      {/* Selected Task Status details */}
      <div className="w-full bg-stone-50 rounded-2xl p-4 border border-stone-100/50 flex flex-col items-stretch">
        <span className="text-xs text-stone-400 font-mono mb-2 uppercase tracking-wider block">
          Alvo de Foco Atual
        </span>
        
        {activeTask ? (
          <div>
            <div className="flex items-start justify-between gap-3">
              <div className="flex-1">
                <h4 className="font-medium text-stone-800 text-sm break-words line-clamp-2">
                  {activeTask.title}
                </h4>
                {activeTask.description && (
                  <p className="text-xs text-stone-500 mt-1 line-clamp-1">
                    {activeTask.description}
                  </p>
                )}
              </div>
              <button
                onClick={() => onCompleteTask(activeTask.id)}
                className="text-stone-400 hover:text-[#4f46e5] p-1.5 hover:bg-white rounded-lg border border-transparent hover:border-stone-100 hover:shadow-sm transition-all flex-shrink-0"
                title="Marcar tarefa concluída"
              >
                <CheckCircle2 size={18} />
              </button>
            </div>
            
            {activeTask.subtasks.length > 0 && (
              <div className="mt-3 pt-2.5 border-t border-stone-200/50">
                <div className="flex justify-between text-xs text-stone-500 mb-1 font-sans">
                  <span>Subtarefas do Foco</span>
                  <span>
                    {activeTask.subtasks.filter(s => s.completed).length}/{activeTask.subtasks.length}
                  </span>
                </div>
                <div className="w-full bg-stone-200/60 h-1 rounded-full overflow-hidden">
                  <div 
                    className="bg-[#4f46e5] h-full rounded-full transition-all duration-300" 
                    style={{ 
                       width: `${(activeTask.subtasks.filter(s => s.completed).length / activeTask.subtasks.length) * 100}%` 
                    }}
                  />
                </div>
              </div>
            )}
            
            <button
              onClick={() => onSelectTask(null)}
              className="mt-3 text-[11px] font-medium text-stone-400 hover:text-stone-600 self-start transition-colors"
            >
              Excluir Foco Ativo
            </button>
          </div>
        ) : (
          <div className="py-2 text-center">
            <span className="text-xs text-stone-500 italic block mb-2">
              Nenhum objetivo de foco ativo selecionado.
            </span>
            <div className="flex flex-col gap-1.5 max-h-32 overflow-y-auto pr-1">
              {tasks.filter(t => !t.completed).length > 0 ? (
                tasks
                  .filter(t => !t.completed)
                  .slice(0, 3)
                  .map(task => (
                    <button
                      key={task.id}
                      onClick={() => onSelectTask(task.id)}
                      className="text-left py-1.5 px-2.5 text-xs text-stone-600 hover:text-stone-900 bg-white hover:bg-stone-100 rounded-lg border border-stone-100 hover:border-stone-200 transition-all flex items-center justify-between gap-1 group truncate"
                    >
                      <span className="truncate flex-1 font-medium">{task.title}</span>
                      <Sparkles size={11} className="text-stone-300 group-hover:text-[#4f46e5] opacity-0 group-hover:opacity-100 transition-all" />
                    </button>
                  ))
              ) : (
                <span className="text-[11px] text-stone-400 block p-1">
                  Crie uma tarefa para carregar seu foco.
                </span>
              )}
            </div>
          </div>
        )}
      </div>

    </div>
  );
}
