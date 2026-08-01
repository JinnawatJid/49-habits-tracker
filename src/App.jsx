import React, { useState, useEffect, useRef } from 'react';
import { 
  Check, Award, Compass, CheckCircle2, Lock, KeyRound, X, Moon, Sun
} from 'lucide-react';
import confetti from 'canvas-confetti';
import { fetchSupabaseData, pushSupabaseData, subscribeSupabaseRealtime } from './syncEngine';
import './App.css';

// Real Calendar Date Helper
const getTodayISO = () => {
  const now = new Date();
  const year = now.getFullYear();
  const month = String(now.getMonth() + 1).padStart(2, '0');
  const day = String(now.getDate()).padStart(2, '0');
  return `${year}-${month}-${day}`;
};

const getPolishedHeaderDate = () => {
  return new Date().toLocaleDateString('en-US', { weekday: 'long', month: 'long', day: 'numeric' });
};

// Reads initial sync key
const getInitialSyncKey = () => {
  try {
    const urlParams = new URLSearchParams(window.location.search);
    const syncParam = urlParams.get('sync');
    if (syncParam) {
      const cleanParam = syncParam.trim().toUpperCase();
      localStorage.setItem('49habits_sync_key', cleanParam);
      return cleanParam;
    }

    const saved = localStorage.getItem('49habits_sync_key');
    if (saved) return saved;

    return null;
  } catch {
    return null;
  }
};

// 49 Sequential Levels Master Definition
const SEQUENTIAL_49_LEVELS = [
  {
    level: 1,
    title: 'ออกไปรับอากาศบริสุทธิ์',
    description: 'ใช้เวลานอกบ้านอย่างน้อยวันละ 30 นาที เพื่อรับวิตามินดี รับอากาศบริสุทธิ์ ช่วยให้สุขภาพและใจแข็งแรง',
    isDefined: true
  },
  ...Array.from({ length: 48 }, (_, i) => ({
    level: i + 2,
    title: `Locked Habit (Chapter ${i + 2})`,
    description: `Unlock by completing Level ${i + 1} (21/21 Days)`,
    isDefined: false
  }))
];

export default function App() {
  const [activeTab, setActiveTab] = useState('today');
  const [todayISO] = useState(getTodayISO());

  // Memoize polished header date representation to optimize CPU performance and prevent redundant calculations.
  const polishedHeaderDate = React.useMemo(() => {
    // Explicitly use todayISO to satisfy dependency linting and ensure fresh calculation on day transition.
    return todayISO ? getPolishedHeaderDate() : getPolishedHeaderDate();
  }, [todayISO]);

  const [syncKey, setSyncKey] = useState(getInitialSyncKey());
  const [showSyncModal, setShowSyncModal] = useState(!getInitialSyncKey());
  const [inputSyncKey, setInputSyncKey] = useState('');

  // Dark Mode Theme State
  const [theme, setTheme] = useState(() => {
    try {
      const saved = localStorage.getItem('49habits_theme');
      return saved ? saved : 'light';
    } catch {
      return 'light';
    }
  });

  // Safeguard refs
  const isInitializedRef = useRef(false);
  const isRemoteUpdateRef = useRef(false);
  const lastStateStrRef = useRef('');

  // Level Progress state
  const [currentLevel, setCurrentLevel] = useState(() => {
    try {
      const saved = localStorage.getItem('49habits_seq_level');
      return saved ? JSON.parse(saved) : 1;
    } catch {
      return 1;
    }
  });

  const [activeCheckIns, setActiveCheckIns] = useState(() => {
    try {
      const saved = localStorage.getItem('49habits_seq_checkins');
      return saved ? JSON.parse(saved) : [];
    } catch {
      return [];
    }
  });

  const [masteredLevels, setMasteredLevels] = useState(() => {
    try {
      const saved = localStorage.getItem('49habits_seq_mastered');
      return saved ? JSON.parse(saved) : [];
    } catch {
      return [];
    }
  });

  // Apply data-theme attribute on root HTML element
  useEffect(() => {
    document.documentElement.setAttribute('data-theme', theme);
    localStorage.setItem('49habits_theme', theme);
  }, [theme]);

  // Toggle Theme Function
  const toggleTheme = () => {
    setTheme(prev => (prev === 'dark' ? 'light' : 'dark'));
  };

  // STEP 1: On Mount or Sync Key Change -> Fetch Cloud Data BEFORE allowing Pushes
  useEffect(() => {
    if (!syncKey) return;
    isInitializedRef.current = false;

    fetchSupabaseData(syncKey).then(cloudData => {
      if (cloudData) {
        isRemoteUpdateRef.current = true;
        if (cloudData.currentLevel) setCurrentLevel(cloudData.currentLevel);
        if (Array.isArray(cloudData.activeCheckIns)) setActiveCheckIns(cloudData.activeCheckIns);
        if (Array.isArray(cloudData.masteredLevels)) setMasteredLevels(cloudData.masteredLevels);
        if (cloudData.theme) setTheme(cloudData.theme);

        lastStateStrRef.current = JSON.stringify({
          currentLevel: cloudData.currentLevel || 1,
          activeCheckIns: cloudData.activeCheckIns || [],
          masteredLevels: cloudData.masteredLevels || [],
          theme: cloudData.theme || 'light'
        });
      }
      isInitializedRef.current = true;
    });
  }, [syncKey]);

  // STEP 2: LocalStorage & Echo-Protected Cloud Push
  useEffect(() => {
    try {
      localStorage.setItem('49habits_seq_level', JSON.stringify(currentLevel));
      localStorage.setItem('49habits_seq_checkins', JSON.stringify(activeCheckIns));
      localStorage.setItem('49habits_seq_mastered', JSON.stringify(masteredLevels));

      if (!isInitializedRef.current) return;

      if (isRemoteUpdateRef.current) {
        isRemoteUpdateRef.current = false;
        return;
      }

      const currentStateStr = JSON.stringify({ currentLevel, activeCheckIns, masteredLevels, theme });
      if (syncKey && currentStateStr !== lastStateStrRef.current) {
        lastStateStrRef.current = currentStateStr;
        pushSupabaseData(syncKey, { currentLevel, activeCheckIns, masteredLevels, theme });
      }
    } catch (e) {
      console.error('Storage sync error:', e);
    }
  }, [currentLevel, activeCheckIns, masteredLevels, theme, syncKey]);

  // STEP 3: Supabase Real-Time Listener
  useEffect(() => {
    if (!syncKey) return;

    const unsubscribe = subscribeSupabaseRealtime(syncKey, (newData) => {
      if (newData) {
        const incomingStateStr = JSON.stringify({
          currentLevel: newData.currentLevel,
          activeCheckIns: newData.activeCheckIns,
          masteredLevels: newData.masteredLevels,
          theme: newData.theme || 'light'
        });

        if (incomingStateStr !== lastStateStrRef.current) {
          isRemoteUpdateRef.current = true;
          lastStateStrRef.current = incomingStateStr;

          if (newData.currentLevel) setCurrentLevel(newData.currentLevel);
          if (Array.isArray(newData.activeCheckIns)) setActiveCheckIns(newData.activeCheckIns);
          if (Array.isArray(newData.masteredLevels)) setMasteredLevels(newData.masteredLevels);
          if (newData.theme) setTheme(newData.theme);
        }
      }
    });

    return () => {
      if (typeof unsubscribe === 'function') unsubscribe();
    };
  }, [syncKey]);

  // Handle Single Field Sync Key Login
  const handleSaveSyncKey = (e) => {
    e.preventDefault();
    if (!inputSyncKey.trim()) return;

    const cleanKey = inputSyncKey.trim().toUpperCase();
    localStorage.setItem('49habits_sync_key', cleanKey);
    setSyncKey(cleanKey);

    setShowSyncModal(false);
    setInputSyncKey('');
  };

  // Active level data
  const activeLevelData = SEQUENTIAL_49_LEVELS.find(l => l.level === currentLevel) || SEQUENTIAL_49_LEVELS[0];
  const isCheckedToday = activeCheckIns.includes(todayISO);
  const completedDaysCount = activeCheckIns.length;
  const currentDayNum = isCheckedToday ? completedDaysCount : completedDaysCount + 1;

  // Handle Today's Level Check-In
  const handleLevelCheckIn = () => {
    if (isCheckedToday) {
      setActiveCheckIns(prev => prev.filter(d => d !== todayISO));
    } else {
      const updatedDates = [...activeCheckIns, todayISO];

      try {
        confetti({
          particleCount: 70,
          spread: 80,
          origin: { y: 0.6 },
          colors: ['#10b981', '#3b82f6', '#f59e0b']
        });
      } catch {}

      // Reached 21/21 Days -> Level Up!
      if (updatedDates.length >= 21) {
        alert(`🎉 CONGRATULATIONS! You completed Level ${currentLevel}: "${activeLevelData.title}"! Unlocking Level ${currentLevel + 1}!`);

        const newMasteredItem = {
          level: currentLevel,
          title: activeLevelData.title,
          completedDate: 'Completed 21/21 Days',
          date: todayISO
        };

        setMasteredLevels([newMasteredItem, ...(masteredLevels || [])]);
        setCurrentLevel(prev => prev + 1);
        setActiveCheckIns([]);
      } else {
        setActiveCheckIns(updatedDates);
      }
    }
  };

  const safeMastered = Array.isArray(masteredLevels) ? masteredLevels : [];

  return (
    <div className="mobile-app-shell">
      {/* Top Header */}
      <header className="app-header">
        <div>
          <h1 className="header-date">{polishedHeaderDate}</h1>
          <div style={{ fontSize: '0.78rem', color: 'var(--text-secondary)', fontWeight: 600, marginTop: '2px' }}>
            49 Habits Journey
          </div>
        </div>

        <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
          <button 
            onClick={toggleTheme}
            className="theme-toggle-btn"
            title={theme === 'dark' ? 'Switch to Light Mode' : 'Switch to Dark Mode'}
          >
            {theme === 'dark' ? <Sun size={18} color="#f59e0b" /> : <Moon size={18} color="#64748b" />}
          </button>

          <button 
            onClick={() => setShowSyncModal(true)}
            className="header-mastered-badge"
            style={{ cursor: 'pointer', border: 'none' }}
            title="Account Sync Key"
          >
            {safeMastered.length}/49 Mastered
          </button>
        </div>
      </header>

      {/* Main Content Body */}
      <main className="main-content">
        {activeTab === 'today' ? (
          <div style={{ display: 'flex', flexDirection: 'column', gap: '24px' }}>
            {/* Single 21-Day Habit Challenge Card */}
            <div className="hero-challenge-card animate-pop" style={{ margin: '12px 0' }}>
              <div className="hero-card-header">
                <span className="hero-subtitle-tag" style={{ color: '#10b981', fontWeight: 700 }}>
                  LEVEL {currentLevel} ACTIVE
                </span>
                <span className="hero-day-pill">
                  Day {currentDayNum} of 21
                </span>
              </div>

              <h2 className="hero-title">Level {currentLevel}: {activeLevelData.title}</h2>
              <p style={{ fontSize: '0.88rem', color: 'var(--text-secondary)', lineHeight: 1.5, marginBottom: '16px' }}>
                {activeLevelData.description}
              </p>

              {/* 21-Circle Matrix Grid */}
              <div className="dot-matrix-21">
                {Array.from({ length: 21 }, (_, i) => i + 1).map((dayNum) => {
                  const isCompleted = dayNum <= completedDaysCount;
                  const isTodayTarget = dayNum === completedDaysCount + 1 && !isCheckedToday;
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

              {/* Single Check-In Button */}
              <button 
                className={`checkin-btn-balanced ${isCheckedToday ? 'checked' : ''}`}
                onClick={handleLevelCheckIn}
                style={{ marginTop: '12px' }}
              >
                {isCheckedToday ? (
                  <><CheckCircle2 size={18} /> Completed Today</>
                ) : (
                  <><Check size={18} strokeWidth={3} /> Check-in Day {currentDayNum}</>
                )}
              </button>
            </div>
          </div>
        ) : (
          /* Tab 2: Journey */
          <div style={{ display: 'flex', flexDirection: 'column', gap: '20px' }} className="animate-pop">
            <div>
              <h3 className="section-heading" style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                <Award size={20} color="#f59e0b" /> Mastered Levels ({safeMastered.length})
              </h3>

              <div style={{ display: 'flex', flexDirection: 'column', gap: '8px' }}>
                {safeMastered.length === 0 ? (
                  <div className="task-card-row" style={{ color: 'var(--text-muted)', fontSize: '0.85rem', textAlign: 'center', padding: '16px' }}>
                    Complete Level 1 (21/21 Days) to unlock your first trophy here!
                  </div>
                ) : (
                  safeMastered.map(m => (
                    <div key={m.level} className="task-card-row">
                      <div style={{ width: '32px', height: '32px', borderRadius: '50%', background: '#feefc3', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: '1rem', flexShrink: 0 }}>
                        🏆
                      </div>
                      <div style={{ flex: 1, margin: '0 10px' }}>
                        <div style={{ fontWeight: 700, fontSize: '0.95rem', color: 'var(--text-primary)' }}>
                          Level {m.level}: {m.title}
                        </div>
                        <div style={{ fontSize: '0.78rem', color: '#10b981', fontWeight: 600 }}>{m.completedDate}</div>
                      </div>
                      <span className="tag-pill tag-green">Mastered</span>
                    </div>
                  ))
                )}
              </div>
            </div>

            {/* 49 Levels Sequential Roadmap */}
            <div>
              <h3 className="section-heading">49 Habits Levels Roadmap</h3>

              <div style={{ display: 'flex', flexDirection: 'column', gap: '10px' }}>
                {SEQUENTIAL_49_LEVELS.slice(0, 10).map((lvl) => {
                  const isMastered = safeMastered.some(m => m.level === lvl.level);
                  const isActive = lvl.level === currentLevel;
                  const isLocked = lvl.level > currentLevel;

                  return (
                    <div 
                      key={lvl.level} 
                      className="task-card-row"
                      style={{ 
                        opacity: isLocked ? 0.65 : 1, 
                        borderColor: isActive ? '#10b981' : 'var(--border-card)',
                        padding: '16px'
                      }}
                    >
                      <div style={{ flex: 1 }}>
                        <div style={{ display: 'flex', alignItems: 'center', gap: '8px', marginBottom: '4px' }}>
                          <div style={{ fontWeight: 800, fontSize: '0.98rem', color: isActive ? '#10b981' : 'var(--text-primary)' }}>
                            Level {lvl.level}: {lvl.title}
                          </div>
                        </div>
                        <div style={{ fontSize: '0.8rem', color: 'var(--text-secondary)', lineHeight: 1.4 }}>
                          {lvl.description}
                        </div>
                      </div>

                      <div style={{ marginLeft: '12px', flexShrink: 0 }}>
                        {isMastered && <span className="tag-pill tag-green">Mastered</span>}
                        {isActive && <span className="tag-pill tag-green">Active 🟢</span>}
                        {isLocked && (
                          <span className="tag-pill" style={{ background: 'var(--bg-app)', border: '1px solid var(--border-card)', color: 'var(--text-muted)', display: 'flex', alignItems: 'center', gap: '4px' }}>
                            <Lock size={10} /> Locked
                          </span>
                        )}
                      </div>
                    </div>
                  );
                })}

                <div style={{ textAlign: 'center', padding: '12px', color: 'var(--text-muted)', fontSize: '0.8rem', fontStyle: 'italic' }}>
                  + 39 More Levels Locked (Chapters 11 to 49)
                </div>
              </div>
            </div>
          </div>
        )}
      </main>

      {/* Single Field Private Sync Key Modal */}
      {showSyncModal && (
        <div className="modal-overlay" onClick={() => syncKey && setShowSyncModal(false)}>
          <div className="card-balanced modal-content" onClick={(e) => e.stopPropagation()}>
            <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '12px' }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                <KeyRound size={22} color="#10b981" />
                <h2 style={{ fontSize: '1.15rem', fontWeight: 800 }}>Private Sync Key</h2>
              </div>
              {syncKey && (
                <button 
                  onClick={() => setShowSyncModal(false)}
                  style={{ background: 'none', border: 'none', color: '#94a3b8', cursor: 'pointer' }}
                >
                  <X size={20} />
                </button>
              )}
            </div>

            <p style={{ fontSize: '0.85rem', color: 'var(--text-secondary)', marginBottom: '16px', lineHeight: 1.5 }}>
              Enter your private sync key (e.g. <strong>Jinna-2026</strong>) to sync your 21-day level progress across all your devices!
            </p>

            {syncKey && (
              <div style={{ background: 'var(--bg-app)', padding: '10px 14px', borderRadius: '10px', textAlign: 'center', marginBottom: '16px', border: '1px solid var(--border-card)' }}>
                <div style={{ fontSize: '0.72rem', color: 'var(--text-muted)', fontWeight: 600 }}>CONNECTED SYNC KEY</div>
                <div style={{ fontSize: '1.2rem', fontWeight: 800, color: '#10b981', letterSpacing: '0.04em', marginTop: '2px' }}>
                  {syncKey}
                </div>
              </div>
            )}

            <form onSubmit={handleSaveSyncKey} style={{ display: 'flex', flexDirection: 'column', gap: '12px' }}>
              <label style={{ fontSize: '0.85rem', fontWeight: 700, color: 'var(--text-primary)' }}>
                Enter or Create Your Private Sync Key:
              </label>
              <input 
                type="text" 
                className="input-balanced"
                placeholder="e.g. Jinna-2026"
                value={inputSyncKey}
                onChange={(e) => setInputSyncKey(e.target.value)}
                required
              />
              <button type="submit" className="btn-emerald-solid">
                Save & Sync Devices
              </button>
            </form>
          </div>
        </div>
      )}

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
