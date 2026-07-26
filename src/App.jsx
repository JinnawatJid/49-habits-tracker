import React, { useState, useEffect } from 'react';
import { 
  Check, Plus, Award, Compass, Trash2, CheckCircle2, 
  Sparkles, Flame
} from 'lucide-react';
import confetti from 'canvas-confetti';
import { fetchSupabaseData, pushSupabaseData, subscribeSupabaseRealtime } from './syncEngine';
import './App.css';

// Helper functions for Real Calendar Date Engine
const getTodayISO = () => {
  const now = new Date();
  const year = now.getFullYear();
  const month = String(now.getMonth() + 1).padStart(2, '0');
  const day = String(now.getDate()).padStart(2, '0');
  return `${year}-${month}-${day}`;
};

// Clean Human Date Header
const getPolishedHeaderDate = () => {
  return new Date().toLocaleDateString('en-US', { weekday: 'long', month: 'long', day: 'numeric' });
};

// Generate initial Sync Code behind the scenes
const getOrGenerateSyncCode = () => {
  try {
    const saved = localStorage.getItem('49habits_sync_code');
    if (saved) return saved;
    const newCode = `HABIT-${Math.floor(1000 + Math.random() * 9000)}`;
    localStorage.setItem('49habits_sync_code', newCode);
    return newCode;
  } catch (e) {
    return 'HABIT-1001';
  }
};

export default function App() {
  const [activeTab, setActiveTab] = useState('today');
  const [todayISO, setTodayISO] = useState(getTodayISO());
  const [syncCode] = useState(getOrGenerateSyncCode());

  // 100% Clean Production State (Zero Mock Data)
  const [activeHabit, setActiveHabit] = useState(() => {
    try {
      const saved = localStorage.getItem('49habits_clean_active');
      return saved ? JSON.parse(saved) : null;
    } catch (e) {
      return null;
    }
  });

  const [masteredHabits, setMasteredHabits] = useState(() => {
    try {
      const saved = localStorage.getItem('49habits_clean_mastered');
      return saved ? JSON.parse(saved) : [];
    } catch (e) {
      return [];
    }
  });

  const [todos, setTodos] = useState(() => {
    try {
      const saved = localStorage.getItem('49habits_clean_todos');
      return saved ? JSON.parse(saved) : [];
    } catch (e) {
      return [];
    }
  });

  const [newTodoText, setNewTodoText] = useState('');
  const [customHabitTitle, setCustomHabitTitle] = useState('');

  // LocalStorage & Silent Supabase Sync
  useEffect(() => {
    try {
      localStorage.setItem('49habits_clean_active', JSON.stringify(activeHabit));
      localStorage.setItem('49habits_clean_mastered', JSON.stringify(masteredHabits));
      localStorage.setItem('49habits_clean_todos', JSON.stringify(todos));
      pushSupabaseData(syncCode, { activeHabit, masteredHabits, todos });
    } catch (e) {
      console.error('Storage/Sync error:', e);
    }
  }, [activeHabit, masteredHabits, todos, syncCode]);

  // Silent Supabase Real-Time Listener
  useEffect(() => {
    const unsubscribe = subscribeSupabaseRealtime(syncCode, (newData) => {
      if (newData) {
        if (newData.active_habit !== undefined) setActiveHabit(newData.active_habit);
        if (Array.isArray(newData.mastered_habits)) setMasteredHabits(newData.mastered_habits);
        if (Array.isArray(newData.todos)) setTodos(newData.todos);
      }
    });

    return () => {
      if (typeof unsubscribe === 'function') unsubscribe();
    };
  }, [syncCode]);

  // Calculations with safe optional chaining
  const checkInDates = activeHabit && Array.isArray(activeHabit.checkInDates) ? activeHabit.checkInDates : [];
  const isCheckedToday = checkInDates.includes(todayISO);
  const completedCount = checkInDates.length;
  const currentDayNum = isCheckedToday ? completedCount : completedCount + 1;

  // Handle Today's Check-In
  const handleCheckInToday = () => {
    if (!activeHabit) return;

    if (isCheckedToday) {
      setActiveHabit(prev => ({
        ...prev,
        checkInDates: (prev?.checkInDates || []).filter(d => d !== todayISO)
      }));
    } else {
      const updatedDates = [...checkInDates, todayISO];

      try {
        confetti({
          particleCount: 60,
          spread: 70,
          origin: { y: 0.6 },
          colors: ['#10b981', '#3b82f6', '#f59e0b']
        });
      } catch (e) {}

      if (updatedDates.length >= 21) {
        alert(`🎉 CONGRATULATIONS! You completed all 21 Days of "${activeHabit.title}"!`);

        const newMastered = {
          id: 'm-' + Date.now(),
          title: activeHabit.title,
          completedDate: 'Completed 21/21 Days',
          tag: 'Mastered',
          tagColor: 'tag-green'
        };

        setMasteredHabits([newMastered, ...(masteredHabits || [])]);
        setActiveHabit(null);
      } else {
        setActiveHabit(prev => ({
          ...prev,
          checkInDates: updatedDates
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

    setTodos([newItem, ...(todos || [])]);
    setNewTodoText('');
  };

  // Toggle Task
  const toggleTodo = (id) => {
    setTodos(prev => (prev || []).map(t => {
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
    setTodos(prev => (prev || []).filter(t => t.id !== id));
  };

  // Create User's Custom 21-Day Challenge
  const handleCreateCustomChallenge = (e) => {
    e.preventDefault();
    if (!customHabitTitle.trim()) return;

    if (activeHabit && !window.confirm(`Start "${customHabitTitle.trim()}" as your active 21-Day Challenge?`)) {
      return;
    }

    const newHabit = {
      id: 'h-' + Date.now(),
      title: customHabitTitle.trim(),
      categoryTag: '21-Day Habit',
      tagColor: 'tag-green',
      startDate: todayISO,
      checkInDates: [],
      targetDays: 21
    };

    setActiveHabit(newHabit);
    setCustomHabitTitle('');
    setActiveTab('today');
  };

  const safeMastered = Array.isArray(masteredHabits) ? masteredHabits : [];
  const safeTodos = Array.isArray(todos) ? todos : [];

  return (
    <div className="mobile-app-shell">
      {/* Header matching approved mockup exactly */}
      <header className="app-header">
        <h1 className="header-date">{getPolishedHeaderDate()}</h1>
        <div className="header-mastered-badge">
          {safeMastered.length} Habits Mastered
        </div>
      </header>

      {/* Main Content Body */}
      <main className="main-content">
        {activeTab === 'today' ? (
          <div style={{ display: 'flex', flexDirection: 'column', gap: '24px' }}>
            {/* Hero 21-Day Challenge Card */}
            {activeHabit ? (
              <div className="hero-challenge-card animate-pop">
                <div className="hero-card-header">
                  <span className="hero-subtitle-tag">21-Day Challenge</span>
                  <span className="hero-day-pill">
                    Day {currentDayNum} of 21
                  </span>
                </div>

                <h2 className="hero-title">{activeHabit.title}</h2>

                {/* 21-Circle Matrix Grid */}
                <div className="dot-matrix-21">
                  {Array.from({ length: 21 }, (_, i) => i + 1).map((dayNum) => {
                    const isCompleted = dayNum <= completedCount;
                    const isTodayTarget = dayNum === completedCount + 1 && !isCheckedToday;
                    return (
                      <div 
                        key={dayNum} 
                        className={`dot-circle ${isCompleted ? 'completed' : ''} ${isTodayTarget ? 'today-target' : ''}`}
                      >
                        {isCompleted ? <Check size={12} strokeWidth={3} /> : ''}
                      </div>
                    );
                  })}
                </div>

                {/* Polished Button */}
                <button 
                  className={`checkin-btn-balanced ${isCheckedToday ? 'checked' : ''}`}
                  onClick={handleCheckInToday}
                >
                  {isCheckedToday ? (
                    <><CheckCircle2 size={18} /> Completed Today</>
                  ) : (
                    <><Check size={18} strokeWidth={3} /> Check-in Day {currentDayNum}</>
                  )}
                </button>
              </div>
            ) : (
              /* Clean Onboarding State */
              <div className="hero-challenge-card animate-pop" style={{ textAlign: 'center', padding: '36px 20px' }}>
                <Award size={40} color="#10b981" style={{ marginBottom: '12px' }} />
                <h3 style={{ fontSize: '1.2rem', fontWeight: 800 }}>Start Your 21-Day Journey</h3>
                <p style={{ fontSize: '0.88rem', color: 'var(--text-secondary)', margin: '8px 0 20px', lineHeight: 1.5 }}>
                  Set your single habit challenge to transform your life over the next 21 days!
                </p>
                <button className="btn-emerald-solid" onClick={() => setActiveTab('journey')}>
                  <Compass size={18} /> Create Your 21-Day Habit Challenge
                </button>
              </div>
            )}

            {/* Today's Checklist */}
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
                {safeTodos.length === 0 ? (
                  <div style={{ textAlign: 'center', padding: '28px', color: 'var(--text-muted)', fontSize: '0.88rem' }}>
                    Your checklist is empty for today. Add a task above to get started!
                  </div>
                ) : (
                  safeTodos.map(item => (
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
          /* Tab 2: My Journey */
          <div style={{ display: 'flex', flexDirection: 'column', gap: '24px' }} className="animate-pop">
            <div>
              <h3 className="section-heading" style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                <Award size={20} color="#f59e0b" /> Mastered Habits ({safeMastered.length})
              </h3>

              <div style={{ display: 'flex', flexDirection: 'column', gap: '10px' }}>
                {safeMastered.length === 0 ? (
                  <div className="task-card-row" style={{ color: 'var(--text-muted)', fontSize: '0.85rem', textAlign: 'center', padding: '20px' }}>
                    Complete your first 21-day challenge to unlock your first trophy here!
                  </div>
                ) : (
                  safeMastered.map(m => (
                    <div key={m.id} className="task-card-row">
                      <div style={{ width: '32px', height: '32px', borderRadius: '50%', background: '#feefc3', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: '1rem', flexShrink: 0 }}>
                        🏆
                      </div>
                      <div style={{ flex: 1, margin: '0 10px' }}>
                        <div style={{ fontWeight: 700, fontSize: '0.95rem', color: 'var(--text-primary)' }}>{m.title}</div>
                        <div style={{ fontSize: '0.78rem', color: '#10b981', fontWeight: 600 }}>{m.completedDate}</div>
                      </div>
                      <span className={`tag-pill ${m.tagColor || 'tag-green'}`}>{m.tag || 'Mastered'}</span>
                    </div>
                  ))
                )}
              </div>
            </div>

            {/* Create Your 21-Day Habit Challenge */}
            <div>
              <h3 className="section-heading">Create 21-Day Habit Challenge</h3>

              <form onSubmit={handleCreateCustomChallenge} className="card-balanced" style={{ background: '#f8fafc', display: 'flex', flexDirection: 'column', gap: '12px' }}>
                <label style={{ fontSize: '0.88rem', fontWeight: 700, color: 'var(--text-primary)' }}>
                  What habit do you want to challenge yourself with for 21 days?
                </label>
                <input 
                  type="text" 
                  className="input-balanced" 
                  placeholder="e.g. Read 10 pages daily"
                  value={customHabitTitle}
                  onChange={(e) => setCustomHabitTitle(e.target.value)}
                  required
                />
                <button type="submit" className="btn-emerald-solid">
                  Start 21-Day Challenge
                </button>
              </form>
            </div>
          </div>
        )}
      </main>

      {/* Bottom Nav Bar - STRICTLY 2 TABS matching approved mockup */}
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
