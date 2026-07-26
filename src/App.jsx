import React, { useState, useEffect } from 'react';
import { 
  Check, Plus, Award, Compass, Trash2, CheckCircle2, 
  Sparkles, BookOpen, Flame, Tag, ShieldCheck
} from 'lucide-react';
import confetti from 'canvas-confetti';
import './App.css';

// Pre-loaded initial state matching approved mockup
const INITIAL_ACTIVE_HABIT = {
  id: 'h-101',
  title: 'Read 10 Pages Daily',
  categoryTag: 'Book Club',
  tagColor: 'tag-green',
  currentDay: 14,
  completedDays: [1, 2, 3, 4, 5, 6, 7, 8, 9, 10, 11, 12, 13],
  checkedToday: false
};

const INITIAL_MASTERED = [
  { id: 'm-1', title: 'Drink 1L Water Daily', completedDate: 'Completed 21/21 Days', tag: 'Self Care', tagColor: 'tag-pink' },
  { id: 'm-2', title: '10-Min Morning Meditation', completedDate: 'Completed 21/21 Days', tag: 'Mindfulness', tagColor: 'tag-yellow' },
  { id: 'm-3', title: 'Plan Today in Writing', completedDate: 'Completed 21/21 Days', tag: 'Chapter 1', tagColor: 'tag-blue' }
];

const INITIAL_TODOS = [
  { id: 't-1', text: 'Read 10 Pages Daily', tag: 'Book Club', tagColor: 'tag-green', completed: false },
  { id: 't-2', text: 'Drink 1L Water First Thing', tag: 'Self Care', tagColor: 'tag-pink', completed: true },
  { id: 't-3', text: 'Book Club monthly review', tag: 'Mindfulness', tagColor: 'tag-yellow', completed: false }
];

const HABIT_LIBRARY = [
  { title: 'Read 10 Pages Daily', tag: 'Book Club', tagColor: 'tag-green', desc: 'Continuous daily reading to build knowledge.' },
  { title: 'Drink 1L Water Daily', tag: 'Self Care', tagColor: 'tag-pink', desc: 'Hydrate your body first thing upon waking.' },
  { title: '10-Min Morning Meditation', tag: 'Mindfulness', tagColor: 'tag-yellow', desc: 'Clear your mind before starting your workday.' },
  { title: 'Plan Today in Writing', tag: 'Chapter 1', tagColor: 'tag-blue', desc: 'Chapter 1 Rule: Write down your daily to-do list.' },
  { title: '15-Min Evening Screen-Free Time', tag: 'Rest', tagColor: 'tag-purple', desc: 'Wind down your eyes and brain before sleep.' }
];

export default function App() {
  const [activeTab, setActiveTab] = useState('today');

  // State with LocalStorage
  const [activeHabit, setActiveHabit] = useState(() => {
    const saved = localStorage.getItem('49habits_middleground_active');
    return saved ? JSON.parse(saved) : INITIAL_ACTIVE_HABIT;
  });

  const [masteredHabits, setMasteredHabits] = useState(() => {
    const saved = localStorage.getItem('49habits_middleground_mastered');
    return saved ? JSON.parse(saved) : INITIAL_MASTERED;
  });

  const [todos, setTodos] = useState(() => {
    const saved = localStorage.getItem('49habits_middleground_todos');
    return saved ? JSON.parse(saved) : INITIAL_TODOS;
  });

  const [newTodoText, setNewTodoText] = useState('');
  const [customHabitTitle, setCustomHabitTitle] = useState('');

  // LocalStorage Persistence
  useEffect(() => {
    localStorage.setItem('49habits_middleground_active', JSON.stringify(activeHabit));
  }, [activeHabit]);

  useEffect(() => {
    localStorage.setItem('49habits_middleground_mastered', JSON.stringify(masteredHabits));
  }, [masteredHabits]);

  useEffect(() => {
    localStorage.setItem('49habits_middleground_todos', JSON.stringify(todos));
  }, [todos]);

  // Check-In Today's Habit
  const handleCheckIn = () => {
    if (!activeHabit) return;

    if (activeHabit.checkedToday) {
      // Uncheck today
      setActiveHabit(prev => ({
        ...prev,
        checkedToday: false,
        completedDays: prev.completedDays.filter(d => d !== prev.currentDay)
      }));
    } else {
      // Check today
      const updatedDays = [...activeHabit.completedDays, activeHabit.currentDay];
      
      try {
        confetti({
          particleCount: 60,
          spread: 70,
          origin: { y: 0.6 },
          colors: ['#10b981', '#3b82f6', '#f59e0b']
        });
      } catch (e) {}

      // If reached 21/21!
      if (updatedDays.length === 21) {
        alert(`🎉 CONGRATULATIONS! You mastered all 21 Days of "${activeHabit.title}"!`);

        const newMastered = {
          id: 'm-' + Date.now(),
          title: activeHabit.title,
          completedDate: 'Completed 21/21 Days',
          tag: activeHabit.categoryTag || 'Mastered',
          tagColor: activeHabit.tagColor || 'tag-green'
        };

        setMasteredHabits([newMastered, ...masteredHabits]);
        setActiveHabit(null);
      } else {
        setActiveHabit(prev => ({
          ...prev,
          checkedToday: true,
          completedDays: updatedDays
        }));
      }
    }
  };

  // Add Task
  const handleAddTodo = (e) => {
    e.preventDefault();
    if (!newTodoText.trim()) return;

    const newItem = {
      id: 't-' + Date.now(),
      text: newTodoText.trim(),
      tag: 'Task',
      tagColor: 'tag-blue',
      completed: false
    };

    setTodos([newItem, ...todos]);
    setNewTodoText('');
  };

  // Toggle Task
  const toggleTodo = (id) => {
    setTodos(prev => prev.map(t => {
      if (t.id === id) {
        const nextState = !t.completed;
        if (nextState) {
          try {
            confetti({ particleCount: 30, spread: 50, origin: { y: 0.8 } });
          } catch (e) {}
        }
        return { ...t, completed: nextState };
      }
      return t;
    }));
  };

  // Delete Task
  const deleteTodo = (id) => {
    setTodos(prev => prev.filter(t => t.id !== id));
  };

  // Start New 21-Day Challenge
  const startNewChallenge = (title, tag, tagColor) => {
    if (activeHabit && !window.confirm(`Start "${title}" as your active 21-Day Challenge?`)) {
      return;
    }

    const newHabit = {
      id: 'h-' + Date.now(),
      title: title,
      categoryTag: tag || 'Challenge',
      tagColor: tagColor || 'tag-green',
      currentDay: 1,
      completedDays: [],
      checkedToday: false
    };

    setActiveHabit(newHabit);
    setActiveTab('today');
  };

  const formattedDate = new Date().toLocaleDateString('en-US', { weekday: 'long', month: 'short', day: 'numeric' });

  return (
    <div className="mobile-app-shell">
      {/* Top Header matching mockup */}
      <header className="app-header">
        <h1 className="header-date">{formattedDate}</h1>
        <div className="header-mastered-badge">
          {masteredHabits.length} Habits Mastered
        </div>
      </header>

      {/* Main View Area */}
      <main className="main-content">
        {activeTab === 'today' ? (
          <div style={{ display: 'flex', flexDirection: 'column', gap: '24px' }}>
            {/* Hero 21-Day Challenge Card matching mockup */}
            {activeHabit ? (
              <div className="hero-challenge-card animate-pop">
                <div className="hero-card-header">
                  <span className="hero-subtitle-tag">21-Day Challenge</span>
                  <span className="hero-day-pill">Day {activeHabit.currentDay} of 21</span>
                </div>

                <h2 className="hero-title">{activeHabit.title}</h2>

                {/* 21-Circle Matrix Grid */}
                <div className="dot-matrix-21">
                  {Array.from({ length: 21 }, (_, i) => i + 1).map((dayNum) => {
                    const isCompleted = activeHabit.completedDays.includes(dayNum);
                    const isTarget = dayNum === activeHabit.currentDay;
                    return (
                      <div 
                        key={dayNum} 
                        className={`dot-circle ${isCompleted ? 'completed' : ''} ${isTarget && !activeHabit.checkedToday ? 'today-target' : ''}`}
                      >
                        {isCompleted ? <Check size={12} strokeWidth={3} /> : ''}
                      </div>
                    );
                  })}
                </div>

                {/* Check-In Button */}
                <button 
                  className={`checkin-btn-balanced ${activeHabit.checkedToday ? 'checked' : ''}`}
                  onClick={handleCheckIn}
                >
                  {activeHabit.checkedToday ? (
                    <><CheckCircle2 size={18} /> Check-in Completed!</>
                  ) : (
                    <><Check size={18} strokeWidth={3} /> Check-in Day {activeHabit.currentDay}</>
                  )}
                </button>
              </div>
            ) : (
              <div className="hero-challenge-card animate-pop" style={{ textAlign: 'center', padding: '32px 20px' }}>
                <Award size={36} color="#10b981" style={{ marginBottom: '8px' }} />
                <h3 style={{ fontSize: '1.1rem', fontWeight: 800 }}>No Active 21-Day Challenge</h3>
                <p style={{ fontSize: '0.85rem', color: 'var(--text-secondary)', margin: '6px 0 16px' }}>
                  Pick your next single habit challenge from your library to start your 21-day journey!
                </p>
                <button className="btn-emerald-solid" onClick={() => setActiveTab('journey')}>
                  <Compass size={18} /> Browse Habit Library
                </button>
              </div>
            )}

            {/* Today's Checklist matching mockup */}
            <div>
              <h3 className="section-heading">Today's Checklist</h3>

              <form onSubmit={handleAddTodo} className="task-add-row">
                <input 
                  type="text" 
                  className="input-balanced" 
                  placeholder="Add a new task..."
                  value={newTodoText}
                  onChange={(e) => setNewTodoText(e.target.value)}
                />
                <button type="submit" className="btn-emerald-solid" style={{ width: 'auto', padding: '0 18px' }}>
                  <Plus size={20} />
                </button>
              </form>

              <div>
                {todos.length === 0 ? (
                  <div style={{ textAlign: 'center', padding: '24px', color: 'var(--text-muted)', fontSize: '0.88rem' }}>
                    No items in your checklist for today!
                  </div>
                ) : (
                  todos.map(item => (
                    <div key={item.id} className="task-card-row">
                      <div 
                        className={`task-checkbox-rounded ${item.completed ? 'checked' : ''}`}
                        onClick={() => toggleTodo(item.id)}
                      >
                        {item.completed && <Check size={14} color="white" strokeWidth={3} />}
                      </div>

                      <span 
                        className={`task-title ${item.completed ? 'completed' : ''}`}
                        onClick={() => toggleTodo(item.id)}
                      >
                        {item.text}
                      </span>

                      {item.tag && (
                        <span className={`tag-pill ${item.tagColor || 'tag-green'}`}>
                          {item.tag}
                        </span>
                      )}

                      <button 
                        onClick={() => deleteTodo(item.id)}
                        style={{ background: 'none', border: 'none', color: '#cbd5e1', cursor: 'pointer', marginLeft: '8px' }}
                      >
                        <Trash2 size={16} />
                      </button>
                    </div>
                  ))
                )}
              </div>
            </div>
          </div>
        ) : (
          /* Tab 2: My Journey (Mastered Wall & Library) */
          <div style={{ display: 'flex', flexDirection: 'column', gap: '24px' }} className="animate-pop">
            <div>
              <h3 className="section-heading" style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                <Award size={20} color="#f59e0b" /> Mastered Habits ({masteredHabits.length})
              </h3>

              <div style={{ display: 'flex', flexDirection: 'column', gap: '10px' }}>
                {masteredHabits.map(m => (
                  <div key={m.id} className="task-card-row">
                    <div style={{ width: '32px', height: '32px', borderRadius: '50%', background: '#feefc3', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: '1rem', flexShrink: 0 }}>
                      🏆
                    </div>
                    <div style={{ flex: 1, margin: '0 10px' }}>
                      <div style={{ fontWeight: 700, fontSize: '0.95rem', color: 'var(--text-primary)' }}>{m.title}</div>
                      <div style={{ fontSize: '0.78rem', color: '#10b981', fontWeight: 600 }}>{m.completedDate}</div>
                    </div>
                    <span className={`tag-pill ${m.tagColor || 'tag-green'}`}>{m.tag}</span>
                  </div>
                ))}
              </div>
            </div>

            <div>
              <h3 className="section-heading">Select Your Next 21-Day Challenge</h3>

              <div style={{ display: 'flex', flexDirection: 'column', gap: '10px' }}>
                {HABIT_LIBRARY.map((lib, idx) => (
                  <div key={idx} className="task-card-row" style={{ alignItems: 'flex-start', padding: '16px' }}>
                    <div style={{ flex: 1, marginRight: '12px' }}>
                      <div style={{ display: 'flex', alignItems: 'center', gap: '8px', marginBottom: '4px' }}>
                        <div style={{ fontWeight: 700, fontSize: '0.95rem' }}>{lib.title}</div>
                        <span className={`tag-pill ${lib.tagColor}`}>{lib.tag}</span>
                      </div>
                      <div style={{ fontSize: '0.8rem', color: 'var(--text-secondary)' }}>{lib.desc}</div>
                    </div>
                    <button 
                      className="btn-emerald-solid"
                      style={{ width: 'auto', padding: '8px 14px', fontSize: '0.8rem', flexShrink: 0 }}
                      onClick={() => startNewChallenge(lib.title, lib.tag, lib.tagColor)}
                    >
                      Start 21d
                    </button>
                  </div>
                ))}

                <div className="card-balanced" style={{ background: '#f8fafc', borderStyle: 'dashed' }}>
                  <div style={{ fontWeight: 700, fontSize: '0.9rem', marginBottom: '8px' }}>+ Create Custom 21-Day Habit</div>
                  <div style={{ display: 'flex', gap: '8px' }}>
                    <input 
                      type="text" 
                      className="input-balanced" 
                      placeholder="e.g. 10-min evening stretching"
                      value={customHabitTitle}
                      onChange={(e) => setCustomHabitTitle(e.target.value)}
                    />
                    <button 
                      className="btn-emerald-solid"
                      style={{ width: 'auto', padding: '0 16px' }}
                      onClick={() => {
                        if (customHabitTitle.trim()) {
                          startNewChallenge(customHabitTitle.trim(), 'Custom', 'tag-purple');
                          setCustomHabitTitle('');
                        }
                      }}
                    >
                      Start
                    </button>
                  </div>
                </div>
              </div>
            </div>
          </div>
        )}
      </main>

      {/* Bottom Nav Bar matching mockup */}
      <nav className="bottom-nav-balanced">
        <button 
          className={`nav-tab-btn ${activeTab === 'today' ? 'active' : ''}`}
          onClick={() => setActiveTab('today')}
        >
          <div className="nav-tab-icon">
            <CheckCircle2 size={18} />
          </div>
          <span>Today</span>
        </button>

        <button 
          className={`nav-tab-btn ${activeTab === 'journey' ? 'active' : ''}`}
          onClick={() => setActiveTab('journey')}
        >
          <div className="nav-tab-icon">
            <Compass size={18} />
          </div>
          <span>Journey</span>
        </button>
      </nav>
    </div>
  );
}
