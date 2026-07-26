import React, { useState, useEffect } from 'react';
import { 
  Check, Plus, Award, Compass, Trash2, CheckCircle2, 
  Sparkles, Calendar, Flame, RefreshCw, AlertCircle
} from 'lucide-react';
import confetti from 'canvas-confetti';
import './App.css';

// Helper functions for Real Calendar Date Engine
const getTodayString = () => {
  const now = new Date();
  const year = now.getFullYear();
  const month = String(now.getMonth() + 1).padStart(2, '0');
  const day = String(now.getDate()).padStart(2, '0');
  return `${year}-${month}-${day}`;
};

const getHeaderDateString = () => {
  return new Date().toLocaleDateString('en-US', { weekday: 'long', month: 'short', day: 'numeric' });
};

// Initial Production Starter Active Habit (Real Calendar Dates)
const getInitialActiveHabit = () => {
  const today = getTodayString();
  const startDate = new Date();
  startDate.setDate(startDate.getDate() - 13); // Started 13 days ago
  const startStr = startDate.toISOString().split('T')[0];

  // Generate 13 past check-in date strings up to yesterday
  const pastCheckIns = [];
  for (let i = 13; i >= 1; i--) {
    const d = new Date();
    d.setDate(d.getDate() - i);
    pastCheckIns.push(d.toISOString().split('T')[0]);
  }

  return {
    id: 'h-real-1',
    title: 'Read 10 Pages Daily',
    categoryTag: 'Book Club',
    tagColor: 'tag-green',
    startDate: startStr,
    checkInDates: pastCheckIns, // 13 check-ins done, today is day 14!
    targetDays: 21
  };
};

const INITIAL_MASTERED = [
  { id: 'm-1', title: 'Drink 1L Water Daily', completedDate: '2026-07-10 (21/21 Days)', tag: 'Self Care', tagColor: 'tag-pink' },
  { id: 'm-2', title: '10-Min Morning Meditation', completedDate: '2026-06-15 (21/21 Days)', tag: 'Mindfulness', tagColor: 'tag-yellow' },
  { id: 'm-3', title: 'Plan Today in Writing', completedDate: '2026-05-20 (21/21 Days)', tag: 'Chapter 1', tagColor: 'tag-blue' }
];

const INITIAL_TODOS = [
  { id: 't-1', text: 'Read 10 Pages Daily', tag: 'Book Club', tagColor: 'tag-green', completed: false, date: getTodayString() },
  { id: 't-2', text: 'Drink 1L Water First Thing', tag: 'Self Care', tagColor: 'tag-pink', completed: true, date: getTodayString() },
  { id: 't-3', text: 'Book Club monthly review', tag: 'Mindfulness', tagColor: 'tag-yellow', completed: false, date: getTodayString() }
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
  const [todayStr, setTodayStr] = useState(getTodayString());

  // Check if date changed (midnight reset check)
  useEffect(() => {
    const timer = setInterval(() => {
      const current = getTodayString();
      if (current !== todayStr) {
        setTodayStr(current);
      }
    }, 60000); // Check every minute
    return () => clearInterval(timer);
  }, [todayStr]);

  // LocalStorage State
  const [activeHabit, setActiveHabit] = useState(() => {
    const saved = localStorage.getItem('49habits_v2_active');
    return saved ? JSON.parse(saved) : getInitialActiveHabit();
  });

  const [masteredHabits, setMasteredHabits] = useState(() => {
    const saved = localStorage.getItem('49habits_v2_mastered');
    return saved ? JSON.parse(saved) : INITIAL_MASTERED;
  });

  const [todos, setTodos] = useState(() => {
    const saved = localStorage.getItem('49habits_v2_todos');
    return saved ? JSON.parse(saved) : INITIAL_TODOS;
  });

  const [newTodoText, setNewTodoText] = useState('');
  const [customHabitTitle, setCustomHabitTitle] = useState('');

  // LocalStorage Persistence
  useEffect(() => {
    localStorage.setItem('49habits_v2_active', JSON.stringify(activeHabit));
  }, [activeHabit]);

  useEffect(() => {
    localStorage.setItem('49habits_v2_mastered', JSON.stringify(masteredHabits));
  }, [masteredHabits]);

  useEffect(() => {
    localStorage.setItem('49habits_v2_todos', JSON.stringify(todos));
  }, [todos]);

  // Real Calendar Engine Calculations
  const isCheckedToday = activeHabit ? activeHabit.checkInDates.includes(todayStr) : false;
  const completedCount = activeHabit ? activeHabit.checkInDates.length : 0;
  const currentDayNum = isCheckedToday ? completedCount : completedCount + 1;

  // Handle Today's Check-In
  const handleCheckInToday = () => {
    if (!activeHabit) return;

    if (isCheckedToday) {
      // Toggle OFF today's check-in
      setActiveHabit(prev => ({
        ...prev,
        checkInDates: prev.checkInDates.filter(d => d !== todayStr)
      }));
    } else {
      // Toggle ON today's check-in
      const updatedDates = [...activeHabit.checkInDates, todayStr];

      try {
        confetti({
          particleCount: 60,
          spread: 70,
          origin: { y: 0.6 },
          colors: ['#10b981', '#3b82f6', '#f59e0b']
        });
      } catch (e) {}

      // If reached 21/21!
      if (updatedDates.length >= 21) {
        alert(`🎉 CONGRATULATIONS! You completed all 21 Days of "${activeHabit.title}" on ${todayStr}!`);

        const newMastered = {
          id: 'm-' + Date.now(),
          title: activeHabit.title,
          completedDate: `${todayStr} (21/21 Days)`,
          tag: activeHabit.categoryTag || 'Mastered',
          tagColor: activeHabit.tagColor || 'tag-green'
        };

        setMasteredHabits([newMastered, ...masteredHabits]);
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
      completed: false,
      date: todayStr
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
    if (activeHabit && !window.confirm(`Start "${title}" as your active 21-Day Challenge? (This will replace your current active challenge)`)) {
      return;
    }

    const newHabit = {
      id: 'h-' + Date.now(),
      title: title,
      categoryTag: tag || 'Challenge',
      tagColor: tagColor || 'tag-green',
      startDate: todayStr,
      checkInDates: [],
      targetDays: 21
    };

    setActiveHabit(newHabit);
    setActiveTab('today');
  };

  // Reset to Fresh State
  const handleResetToCleanState = () => {
    if (window.confirm('Reset app to a fresh empty state to start your own real 21-day challenge?')) {
      setActiveHabit(null);
      setTodos([]);
      localStorage.removeItem('49habits_v2_active');
      localStorage.removeItem('49habits_v2_todos');
    }
  };

  return (
    <div className="mobile-app-shell">
      {/* Top Header */}
      <header className="app-header">
        <div>
          <h1 className="header-date">{getHeaderDateString()}</h1>
          <div style={{ fontSize: '0.75rem', color: 'var(--text-muted)', fontWeight: 500 }}>
            Real Calendar Date • {todayStr}
          </div>
        </div>
        <div className="header-mastered-badge">
          {masteredHabits.length} Mastered
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

                {/* Real Calendar Check-In Button */}
                <button 
                  className={`checkin-btn-balanced ${isCheckedToday ? 'checked' : ''}`}
                  onClick={handleCheckInToday}
                >
                  {isCheckedToday ? (
                    <><CheckCircle2 size={18} /> Checked-in for Today ({todayStr})</>
                  ) : (
                    <><Check size={18} strokeWidth={3} /> Check-in Day {currentDayNum} ({todayStr})</>
                  )}
                </button>
              </div>
            ) : (
              <div className="hero-challenge-card animate-pop" style={{ textAlign: 'center', padding: '32px 20px' }}>
                <Award size={36} color="#10b981" style={{ marginBottom: '8px' }} />
                <h3 style={{ fontSize: '1.1rem', fontWeight: 800 }}>No Active 21-Day Challenge</h3>
                <p style={{ fontSize: '0.85rem', color: 'var(--text-secondary)', margin: '6px 0 16px' }}>
                  Pick your single habit challenge from your library to start your real 21-day journey today!
                </p>
                <button className="btn-emerald-solid" onClick={() => setActiveTab('journey')}>
                  <Compass size={18} /> Browse Habit Library
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

            {/* Quick Reset Option for User */}
            <div style={{ textAlign: 'center', marginTop: '10px' }}>
              <button 
                onClick={handleResetToCleanState}
                style={{ background: 'none', border: 'none', color: 'var(--text-muted)', fontSize: '0.78rem', cursor: 'pointer', display: 'inline-flex', alignItems: 'center', gap: '4px' }}
              >
                <RefreshCw size={12} /> Start Fresh (Clear Sample Data)
              </button>
            </div>
          </div>
        ) : (
          /* Tab 2: My Journey */
          <div style={{ display: 'flex', flexDirection: 'column', gap: '24px' }} className="animate-pop">
            <div>
              <h3 className="section-heading" style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                <Award size={20} color="#f59e0b" /> Mastered Habits ({masteredHabits.length})
              </h3>

              <div style={{ display: 'flex', flexDirection: 'column', gap: '10px' }}>
                {masteredHabits.length === 0 ? (
                  <div className="task-card-row" style={{ color: 'var(--text-muted)', fontSize: '0.85rem', textAlign: 'center' }}>
                    Complete your first 21-day challenge to unlock your first trophy here!
                  </div>
                ) : (
                  masteredHabits.map(m => (
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
                  ))
                )}
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

      {/* Bottom Nav Bar */}
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
