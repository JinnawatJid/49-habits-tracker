import React, { useState, useEffect, useRef } from 'react';
import { 
  Check, Award, Compass, CheckCircle2, Lock, KeyRound, X, Moon, Sun,
  Coins, Plus, Trash2, TrendingUp, Sparkles, Scale, ArrowUpRight, ArrowDownRight, Package, RefreshCw
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
  return new Date().toLocaleDateString('en-US', { weekday: 'long', month: 'short', day: 'numeric' });
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
  } catch (e) {
    return null;
  }
};

// 49 Sequential Levels Master Definition (7-Day Sprint Model)
const SEQUENTIAL_49_LEVELS = [
  {
    level: 1,
    title: 'ออกไปรับอากาศบริสุทธิ์',
    description: 'ใช้เวลานอกบ้านอย่างน้อยวันละ 30 นาที เพื่อรับวิตามินดี รับอากาศบริสุทธิ์ ช่วยให้สุขภาพและใจแข็งแรง',
    targetDays: 7,
    isDefined: true
  },
  {
    level: 2,
    title: 'ล้างหน้าปั๊บขยับ 1 นาที',
    description: 'วิดพื้นเพื่อสร้างความกระปรี้กระเปร่า',
    targetDays: 7,
    isDefined: true
  },
  ...Array.from({ length: 47 }, (_, i) => ({
    level: i + 3,
    title: `Locked Habit (Chapter ${i + 3})`,
    description: `Unlock by completing Level ${i + 2} (7 Days Sprint)`,
    targetDays: 7,
    isDefined: false
  }))
];

export default function App() {
  const [activeTab, setActiveTab] = useState('today');
  const [todayISO] = useState(getTodayISO());
  const [syncKey, setSyncKey] = useState(getInitialSyncKey());
  const [showSyncModal, setShowSyncModal] = useState(!getInitialSyncKey());
  const [inputSyncKey, setInputSyncKey] = useState('');

  // Dark Mode Theme State
  const [theme, setTheme] = useState(() => {
    try {
      const saved = localStorage.getItem('49habits_theme');
      return saved ? saved : 'light';
    } catch (e) {
      return 'light';
    }
  });

  // Safeguard refs against race conditions
  const isInitializedRef = useRef(false);
  const isRemoteUpdateRef = useRef(false);
  const lastStateStrRef = useRef('');

  // Level Progress state
  const [currentLevel, setCurrentLevel] = useState(() => {
    try {
      const saved = localStorage.getItem('49habits_seq_level');
      return saved ? JSON.parse(saved) : 1;
    } catch (e) {
      return 1;
    }
  });

  const [activeCheckIns, setActiveCheckIns] = useState(() => {
    try {
      const saved = localStorage.getItem('49habits_seq_checkins');
      return saved ? JSON.parse(saved) : [];
    } catch (e) {
      return [];
    }
  });

  const [masteredLevels, setMasteredLevels] = useState(() => {
    try {
      const saved = localStorage.getItem('49habits_seq_mastered');
      return saved ? JSON.parse(saved) : [];
    } catch (e) {
      return [];
    }
  });

  // Gold DCA State
  const [goldTransactions, setGoldTransactions] = useState(() => {
    try {
      const saved = localStorage.getItem('49habits_gold_txs');
      return saved ? JSON.parse(saved) : [];
    } catch (e) {
      return [];
    }
  });

  // Gold Spot Price per Baht Gold (1 Baht = 15.244g)
  const [goldSpotPricePerBaht, setGoldSpotPricePerBaht] = useState(() => {
    try {
      const saved = localStorage.getItem('49habits_gold_spot');
      return saved ? Number(saved) : 64150;
    } catch (e) {
      return 64150;
    }
  });

  const [isLiveLoading, setIsLiveLoading] = useState(false);
  const [lastSpotUpdatedTime, setLastSpotUpdatedTime] = useState('');

  // Redesigned Log Gold Modal State
  const [showGoldModal, setShowGoldModal] = useState(false);
  const [goldModalMode, setGoldModalMode] = useState('buy'); // 'buy' or 'redeem'
  const [inputGoldTHB, setInputGoldTHB] = useState('100');
  const [inputGoldPricePerBaht, setInputGoldPricePerBaht] = useState(64150);
  const [inputRefId, setInputRefId] = useState('');
  const [inputRedeemBarSize, setInputRedeemBarSize] = useState('0.1');

  // Sync modal inputGoldPricePerBaht with goldSpotPricePerBaht
  useEffect(() => {
    setInputGoldPricePerBaht(goldSpotPricePerBaht);
  }, [goldSpotPricePerBaht]);

  // Apply theme data attribute
  useEffect(() => {
    document.documentElement.setAttribute('data-theme', theme);
    localStorage.setItem('49habits_theme', theme);
  }, [theme]);

  const toggleTheme = () => {
    setTheme(prev => (prev === 'dark' ? 'light' : 'dark'));
  };

  // Same-Origin Native API Gold Price Fetcher with Console Logging
  const fetchLiveGoldPrice = async () => {
    setIsLiveLoading(true);
    console.log('[Gold API Client] Fetching live price from /api/gold-price...');
    try {
      const res = await fetch('/api/gold-price');
      if (res.ok) {
        const data = await res.json();
        console.log('[Gold API Client] Received payload:', data);
        if (data && data.pricePerBaht && Number(data.pricePerBaht) > 30000) {
          const newPrice = Number(data.pricePerBaht);
          setGoldSpotPricePerBaht(newPrice);
          console.log('[Gold API Client] Updated Gold Spot Reference to:', newPrice, 'THB/Baht');
          const nowTime = new Date().toLocaleTimeString('en-US', { hour: '2-digit', minute: '2-digit' });
          setLastSpotUpdatedTime(nowTime);
          setIsLiveLoading(false);
          return;
        }
      }
    } catch (e) {
      console.error('[Gold API Client] Fetch error:', e);
    }

    console.log('[Gold API Client] Using default GTA spot price 64,150 THB/Baht');
    const nowTime = new Date().toLocaleTimeString('en-US', { hour: '2-digit', minute: '2-digit' });
    setLastSpotUpdatedTime(nowTime);
    setIsLiveLoading(false);
  };

  // Auto-fetch live spot price on app mount
  useEffect(() => {
    fetchLiveGoldPrice();
  }, []);

  // STEP 1: On Mount or Sync Key Change -> Fetch Cloud Data BEFORE Pushing
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
        if (Array.isArray(cloudData.goldTransactions)) setGoldTransactions(cloudData.goldTransactions);

        lastStateStrRef.current = JSON.stringify({
          currentLevel: cloudData.currentLevel || 1,
          activeCheckIns: cloudData.activeCheckIns || [],
          masteredLevels: cloudData.masteredLevels || [],
          theme: cloudData.theme || 'light',
          goldTransactions: cloudData.goldTransactions || []
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
      localStorage.setItem('49habits_gold_txs', JSON.stringify(goldTransactions));
      localStorage.setItem('49habits_gold_spot', goldSpotPricePerBaht.toString());

      if (!isInitializedRef.current) return;

      if (isRemoteUpdateRef.current) {
        isRemoteUpdateRef.current = false;
        return;
      }

      const currentStateStr = JSON.stringify({ currentLevel, activeCheckIns, masteredLevels, theme, goldTransactions });
      if (syncKey && currentStateStr !== lastStateStrRef.current) {
        lastStateStrRef.current = currentStateStr;
        pushSupabaseData(syncKey, { currentLevel, activeCheckIns, masteredLevels, theme, goldTransactions });
      }
    } catch (e) {
      console.error('Storage sync error:', e);
    }
  }, [currentLevel, activeCheckIns, masteredLevels, theme, goldTransactions, goldSpotPricePerBaht, syncKey]);

  // STEP 3: Supabase Real-Time Listener
  useEffect(() => {
    if (!syncKey) return;

    const unsubscribe = subscribeSupabaseRealtime(syncKey, (newData) => {
      if (newData) {
        const incomingStateStr = JSON.stringify({
          currentLevel: newData.currentLevel,
          activeCheckIns: newData.activeCheckIns,
          masteredLevels: newData.masteredLevels,
          theme: newData.theme || 'light',
          goldTransactions: newData.goldTransactions || []
        });

        if (incomingStateStr !== lastStateStrRef.current) {
          isRemoteUpdateRef.current = true;
          lastStateStrRef.current = incomingStateStr;

          if (newData.currentLevel) setCurrentLevel(newData.currentLevel);
          if (Array.isArray(newData.activeCheckIns)) setActiveCheckIns(newData.activeCheckIns);
          if (Array.isArray(newData.masteredLevels)) setMasteredLevels(newData.masteredLevels);
          if (newData.theme) setTheme(newData.theme);
          if (Array.isArray(newData.goldTransactions)) setGoldTransactions(newData.goldTransactions);
        }
      }
    });

    return () => {
      if (typeof unsubscribe === 'function') unsubscribe();
    };
  }, [syncKey]);

  // Single Field Sync Key Login
  const handleSaveSyncKey = (e) => {
    e.preventDefault();
    if (!inputSyncKey.trim()) return;

    const cleanKey = inputSyncKey.trim().toUpperCase();
    localStorage.setItem('49habits_sync_key', cleanKey);
    setSyncKey(cleanKey);

    setShowSyncModal(false);
    setInputSyncKey('');
  };

  // Auto-calculated Buy Weight math
  const numTHB = Number(inputGoldTHB) || 0;
  const numPricePerBaht = Number(inputGoldPricePerBaht) || 64150;
  const autoCalculatedGrams = numPricePerBaht > 0 ? (numTHB * 15.244) / numPricePerBaht : 0;
  const autoCalculatedBaht = autoCalculatedGrams / 15.244;

  // Log Gold Transaction (Buy or Redeem)
  const handleSaveGoldTransaction = (e) => {
    e.preventDefault();

    if (goldModalMode === 'buy') {
      if (numTHB <= 0 || autoCalculatedGrams <= 0) return;

      const newTx = {
        id: 'gt-' + Date.now(),
        type: 'buy',
        date: getTodayISO(),
        amountTHB: numTHB,
        weightGrams: autoCalculatedGrams,
        pricePerBaht: numPricePerBaht,
        refId: inputRefId.trim(),
        isPhysicalBar: false
      };

      setGoldTransactions([newTx, ...goldTransactions]);
    } else {
      // Redeem Mode
      const redeemGrams = Number(inputRedeemBarSize) || 0.1;

      const newTx = {
        id: 'gt-' + Date.now(),
        type: 'redeem',
        date: getTodayISO(),
        amountTHB: 0,
        weightGrams: -redeemGrams,
        barSize: redeemGrams,
        refId: inputRefId.trim(),
        isPhysicalBar: true
      };

      setGoldTransactions([newTx, ...goldTransactions]);
    }

    setInputGoldTHB('100');
    setInputRefId('');
    setShowGoldModal(false);

    try {
      confetti({
        particleCount: 60,
        spread: 70,
        origin: { y: 0.65 },
        colors: ['#10b981', '#3b82f6', '#f59e0b']
      });
    } catch (err) {}
  };

  // Delete Gold Transaction
  const handleDeleteGoldTx = (id) => {
    setGoldTransactions(prev => prev.filter(tx => tx.id !== id));
  };

  // Portfolio Metrics Calculations
  const safeGoldTxs = Array.isArray(goldTransactions) ? goldTransactions : [];
  const totalSpentTHB = safeGoldTxs.reduce((sum, tx) => sum + (Number(tx.amountTHB) || 0), 0);
  const totalWeightGrams = safeGoldTxs.reduce((sum, tx) => sum + (Number(tx.weightGrams) || 0), 0);
  const avgCostPerGram = totalWeightGrams > 0 ? (totalSpentTHB / Math.max(totalWeightGrams, 0.0001)) : 0;

  const currentMarketValueTHB = Math.max(totalWeightGrams, 0) * (goldSpotPricePerBaht / 15.244);
  const netProfitTHB = currentMarketValueTHB - totalSpentTHB;
  const netProfitPercent = totalSpentTHB > 0 ? ((netProfitTHB / totalSpentTHB) * 100) : 0;
  const physicalBarsCount = safeGoldTxs.filter(tx => tx.isPhysicalBar || tx.type === 'redeem').length;

  // Active level data & 7-Day Sprint math
  const activeLevelData = SEQUENTIAL_49_LEVELS.find(l => l.level === currentLevel) || SEQUENTIAL_49_LEVELS[0];
  const targetDays = activeLevelData.targetDays || 7;
  const isCheckedToday = activeCheckIns.includes(todayISO);
  const completedDaysCount = activeCheckIns.length;
  const currentDayNum = isCheckedToday ? completedDaysCount : completedDaysCount + 1;

  // Handle Today's Check-In
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
      } catch (e) {}

      // Reached 7/7 Days -> Level Up!
      if (updatedDates.length >= targetDays) {
        alert(`Congratulations! You completed Level ${currentLevel}: "${activeLevelData.title}"! Unlocking Level ${currentLevel + 1}!`);

        const newMasteredItem = {
          level: currentLevel,
          title: activeLevelData.title,
          completedDate: `Completed ${targetDays} Days Sprint`,
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
          <h1 className="header-date">{getPolishedHeaderDate()}</h1>
          <div style={{ fontSize: '0.78rem', color: 'var(--text-secondary)', fontWeight: 600, marginTop: '2px' }}>
            {activeTab === 'gold' ? 'Gold DCA Portfolio' : '49 Habits Journey'}
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
            {/* Single 7-Day Sprint Habit Challenge Card */}
            <div className="hero-challenge-card animate-pop" style={{ margin: '12px 0' }}>
              <div className="hero-card-header">
                <span className="hero-subtitle-tag" style={{ color: '#10b981', fontWeight: 700 }}>
                  LEVEL {currentLevel} ACTIVE • 7 DAYS SPRINT
                </span>
                <span className="hero-day-pill">
                  Day {currentDayNum} of {targetDays}
                </span>
              </div>

              <h2 className="hero-title">Level {currentLevel}: {activeLevelData.title}</h2>
              <p style={{ fontSize: '0.88rem', color: 'var(--text-secondary)', lineHeight: 1.5, marginBottom: '20px' }}>
                {activeLevelData.description}
              </p>

              {/* 7-Circle Matrix Single Row */}
              <div className="dot-matrix-21" style={{ gridTemplateColumns: 'repeat(7, 1fr)', gap: '8px', marginBottom: '20px' }}>
                {Array.from({ length: targetDays }, (_, i) => i + 1).map((dayNum) => {
                  const isCompleted = dayNum <= completedDaysCount;
                  const isTodayTarget = dayNum === completedDaysCount + 1 && !isCheckedToday;
                  return (
                    <div 
                      key={dayNum} 
                      className={`dot-circle ${isCompleted ? 'completed' : ''} ${isTodayTarget ? 'today-target' : ''}`}
                    >
                      {isCompleted ? <Check size={14} strokeWidth={3} /> : `Day ${dayNum}`}
                    </div>
                  );
                })}
              </div>

              {/* Single Check-In Button */}
              <button 
                className={`checkin-btn-balanced ${isCheckedToday ? 'checked' : ''}`}
                onClick={handleLevelCheckIn}
                style={{ marginTop: '8px' }}
              >
                {isCheckedToday ? (
                  <><CheckCircle2 size={18} /> Completed Today</>
                ) : (
                  <><Check size={18} strokeWidth={3} /> Check-in Day {currentDayNum}</>
                )}
              </button>
            </div>
          </div>
        ) : activeTab === 'journey' ? (
          /* Tab 2: Journey */
          <div style={{ display: 'flex', flexDirection: 'column', gap: '20px' }} className="animate-pop">
            <div>
              <h3 className="section-heading" style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                <Award size={20} color="#f59e0b" /> Mastered Levels ({safeMastered.length})
              </h3>

              <div style={{ display: 'flex', flexDirection: 'column', gap: '8px' }}>
                {safeMastered.length === 0 ? (
                  <div className="task-card-row" style={{ color: 'var(--text-muted)', fontSize: '0.85rem', textAlign: 'center', padding: '16px' }}>
                    Complete Level 1 to unlock Level 2 and earn your first trophy here
                  </div>
                ) : (
                  safeMastered.map(m => (
                    <div key={m.level} className="task-card-row">
                      <div style={{ width: '32px', height: '32px', borderRadius: '50%', background: 'var(--bg-app)', border: '1px solid var(--border-card)', display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0 }}>
                        <Award size={18} color="#f59e0b" />
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
                        {isActive && <span className="tag-pill tag-green">Active</span>}
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
        ) : (
          /* Tab 3: Gold DCA Portfolio Tracker */
          <div style={{ display: 'flex', flexDirection: 'column', gap: '20px' }} className="animate-pop">
            {/* Portfolio Summary Hero Card */}
            <div className="hero-challenge-card" style={{ margin: 0, padding: '22px' }}>
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: '16px' }}>
                <div>
                  <div style={{ fontSize: '0.75rem', fontWeight: 700, color: 'var(--text-muted)', textTransform: 'uppercase', letterSpacing: '0.05em' }}>
                    PORTFOLIO VALUE
                  </div>
                  <div style={{ fontSize: '1.8rem', fontWeight: 800, color: 'var(--text-primary)', marginTop: '4px' }}>
                    {currentMarketValueTHB.toLocaleString('en-US', { maximumFractionDigits: 0 })} <span style={{ fontSize: '1.05rem', fontWeight: 700, color: 'var(--text-secondary)' }}>THB</span>
                  </div>
                </div>

                <div className="tag-pill tag-green" style={{ display: 'flex', alignItems: 'center', gap: '4px', padding: '6px 12px', fontSize: '0.85rem', fontWeight: 700 }}>
                  <TrendingUp size={14} />
                  {netProfitTHB >= 0 ? '+' : ''}{netProfitTHB.toLocaleString('en-US', { maximumFractionDigits: 0 })} THB ({netProfitPercent >= 0 ? '+' : ''}{netProfitPercent.toFixed(1)}%)
                </div>
              </div>

              {/* Key Metrics Grid */}
              <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: '10px', paddingTop: '16px', borderTop: '1px solid var(--border-card)' }}>
                <div>
                  <div style={{ fontSize: '0.72rem', color: 'var(--text-muted)', fontWeight: 600 }}>Total Invested</div>
                  <div style={{ fontSize: '0.95rem', fontWeight: 800, color: 'var(--text-primary)', marginTop: '2px' }}>
                    {totalSpentTHB.toLocaleString()} THB
                  </div>
                </div>

                <div>
                  <div style={{ fontSize: '0.72rem', color: 'var(--text-muted)', fontWeight: 600 }}>Gold Accumulated</div>
                  <div style={{ fontSize: '0.95rem', fontWeight: 800, color: 'var(--accent-emerald)', marginTop: '2px' }}>
                    {totalWeightGrams.toFixed(4)} g
                  </div>
                  <div style={{ fontSize: '0.68rem', color: 'var(--text-secondary)', fontWeight: 600, marginTop: '2px' }}>
                    {physicalBarsCount} Physical Bars
                  </div>
                </div>

                <div>
                  <div style={{ fontSize: '0.72rem', color: 'var(--text-muted)', fontWeight: 600 }}>Average Cost</div>
                  <div style={{ fontSize: '0.95rem', fontWeight: 800, color: 'var(--text-primary)', marginTop: '2px' }}>
                    {avgCostPerGram.toLocaleString('en-US', { maximumFractionDigits: 0 })} THB/g
                  </div>
                </div>
              </div>
            </div>

            {/* Log Buy / Redeem Button */}
            <button 
              className="btn-emerald-solid"
              onClick={() => setShowGoldModal(true)}
              style={{ height: '48px', fontSize: '0.98rem' }}
            >
              <Plus size={20} /> Log Gold Transaction
            </button>

            {/* Live Gold Spot Reference Card (Clean Read-Only Display) */}
            <div className="card-balanced" style={{ padding: '16px' }}>
              <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '10px' }}>
                <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                  <Coins size={18} color="#10b981" />
                  <span style={{ fontSize: '0.88rem', fontWeight: 700, color: 'var(--text-primary)' }}>
                    Gold Spot Reference
                  </span>
                </div>

                <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                  <span className="tag-pill tag-green" style={{ display: 'flex', alignItems: 'center', gap: '4px', padding: '4px 8px', fontSize: '0.72rem', fontWeight: 700 }}>
                    <span style={{ width: '6px', height: '6px', borderRadius: '50%', background: '#10b981', display: 'inline-block' }}></span> Live
                  </span>

                  <button 
                    onClick={fetchLiveGoldPrice}
                    className="theme-toggle-btn"
                    style={{ width: '30px', height: '30px' }}
                    title="Refresh Live Gold Price"
                  >
                    <RefreshCw size={14} className={isLiveLoading ? 'spin-icon' : ''} />
                  </button>
                </div>
              </div>

              <div style={{ fontSize: '1.4rem', fontWeight: 800, color: 'var(--text-primary)' }}>
                {goldSpotPricePerBaht.toLocaleString()} <span style={{ fontSize: '0.85rem', color: 'var(--text-muted)' }}>THB/Baht</span>
              </div>

              <div style={{ fontSize: '0.72rem', color: 'var(--text-muted)', marginTop: '6px', fontWeight: 500 }}>
                {lastSpotUpdatedTime ? `Updated ${lastSpotUpdatedTime} • ` : ''}Official Thai Gold Traders Association
              </div>
            </div>

            {/* Recent Purchases & Redemptions List */}
            <div>
              <h3 className="section-heading">Recent Purchases & Redemptions</h3>

              <div style={{ display: 'flex', flexDirection: 'column', gap: '10px' }}>
                {safeGoldTxs.length === 0 ? (
                  <div className="task-card-row" style={{ color: 'var(--text-muted)', fontSize: '0.85rem', textAlign: 'center', padding: '24px' }}>
                    No gold transactions logged yet. Click "+ Log Gold Transaction" above to start tracking
                  </div>
                ) : (
                  safeGoldTxs.map(tx => (
                    <div key={tx.id} className="task-card-row">
                      <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
                        <div style={{ 
                          width: '36px', height: '36px', borderRadius: '50%', 
                          background: tx.type === 'redeem' ? '#fef3c7' : 'var(--bg-app)', 
                          border: '1px solid var(--border-card)', 
                          display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0 
                        }}>
                          {tx.type === 'redeem' ? <Package size={18} color="#f59e0b" /> : <Coins size={18} color="#10b981" />}
                        </div>
                        <div>
                          <div style={{ fontWeight: 700, fontSize: '0.95rem', color: 'var(--text-primary)' }}>
                            {tx.type === 'redeem' ? (
                              `Redeemed ${Math.abs(tx.weightGrams || 0.1)}g Physical Bar`
                            ) : (
                              `${Number(tx.amountTHB).toLocaleString()} THB → +${Number(tx.weightGrams).toFixed(4)} g Gold`
                            )}
                          </div>
                          <div style={{ fontSize: '0.78rem', color: 'var(--text-secondary)' }}>
                            {tx.date} {tx.refId && `• Ref: ${tx.refId}`}
                          </div>
                        </div>
                      </div>

                      <button 
                        onClick={() => handleDeleteGoldTx(tx.id)}
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
        )}
      </main>

      {/* Log Gold Transaction Modal (Buy vs Redeem Switcher) */}
      {showGoldModal && (
        <div className="modal-overlay" onClick={() => setShowGoldModal(false)}>
          <div className="card-balanced modal-content" onClick={(e) => e.stopPropagation()}>
            <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '14px' }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                <Coins size={22} color="#10b981" />
                <h2 style={{ fontSize: '1.15rem', fontWeight: 800 }}>Log Gold Transaction</h2>
              </div>
              <button 
                onClick={() => setShowGoldModal(false)}
                style={{ background: 'none', border: 'none', color: '#94a3b8', cursor: 'pointer' }}
              >
                <X size={20} />
              </button>
            </div>

            {/* Segmented Mode Switcher */}
            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', background: 'var(--bg-app)', padding: '4px', borderRadius: '12px', border: '1px solid var(--border-card)', marginBottom: '18px' }}>
              <button 
                type="button"
                onClick={() => setGoldModalMode('buy')}
                style={{
                  padding: '8px',
                  borderRadius: '9px',
                  border: 'none',
                  fontSize: '0.85rem',
                  fontWeight: 700,
                  cursor: 'pointer',
                  background: goldModalMode === 'buy' ? 'var(--surface-card)' : 'transparent',
                  color: goldModalMode === 'buy' ? 'var(--text-primary)' : 'var(--text-muted)',
                  boxShadow: goldModalMode === 'buy' ? '0 1px 3px rgba(0,0,0,0.1)' : 'none',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  gap: '6px'
                }}
              >
                <ArrowUpRight size={16} color="#10b981" /> Buy Gold
              </button>

              <button 
                type="button"
                onClick={() => setGoldModalMode('redeem')}
                style={{
                  padding: '8px',
                  borderRadius: '9px',
                  border: 'none',
                  fontSize: '0.85rem',
                  fontWeight: 700,
                  cursor: 'pointer',
                  background: goldModalMode === 'redeem' ? 'var(--surface-card)' : 'transparent',
                  color: goldModalMode === 'redeem' ? 'var(--text-primary)' : 'var(--text-muted)',
                  boxShadow: goldModalMode === 'redeem' ? '0 1px 3px rgba(0,0,0,0.1)' : 'none',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  gap: '6px'
                }}
              >
                <Package size={16} color="#f59e0b" /> Redeem Bar
              </button>
            </div>

            <form onSubmit={handleSaveGoldTransaction} style={{ display: 'flex', flexDirection: 'column', gap: '14px' }}>
              {goldModalMode === 'buy' ? (
                <>
                  <div>
                    <label style={{ fontSize: '0.85rem', fontWeight: 700, color: 'var(--text-primary)', marginBottom: '6px', display: 'block' }}>
                      Amount Paid (THB)
                    </label>
                    <input 
                      type="number" 
                      className="input-balanced"
                      placeholder="e.g. 100"
                      value={inputGoldTHB}
                      onChange={(e) => setInputGoldTHB(e.target.value)}
                      required
                      autoFocus
                    />
                  </div>

                  <div>
                    <label style={{ fontSize: '0.85rem', fontWeight: 700, color: 'var(--text-primary)', marginBottom: '6px', display: 'block' }}>
                      Gold Price per Baht (THB/Baht)
                    </label>
                    <input 
                      type="number" 
                      className="input-balanced"
                      placeholder="e.g. 64150"
                      value={inputGoldPricePerBaht}
                      onChange={(e) => setInputGoldPricePerBaht(Number(e.target.value))}
                      required
                    />
                  </div>

                  {/* Auto-Calculated Result Box */}
                  <div style={{ background: 'var(--bg-app)', border: '1px solid var(--accent-emerald)', padding: '12px 14px', borderRadius: '12px' }}>
                    <div style={{ fontSize: '0.75rem', fontWeight: 700, color: '#10b981', textTransform: 'uppercase', letterSpacing: '0.04em' }}>
                      GOLD WEIGHT RECEIVED (AUTO-CALCULATED)
                    </div>
                    <div style={{ fontSize: '1.1rem', fontWeight: 800, color: 'var(--text-primary)', marginTop: '4px' }}>
                      +{autoCalculatedGrams.toFixed(5)} g <span style={{ fontSize: '0.82rem', color: 'var(--text-secondary)', fontWeight: 600 }}>({autoCalculatedBaht.toFixed(5)} Baht of Gold)</span>
                    </div>
                  </div>
                </>
              ) : (
                /* Redeem Mode */
                <>
                  <div>
                    <label style={{ fontSize: '0.85rem', fontWeight: 700, color: 'var(--text-primary)', marginBottom: '6px', display: 'block' }}>
                      Physical Bar Size to Redeem
                    </label>
                    <select 
                      className="input-balanced"
                      value={inputRedeemBarSize}
                      onChange={(e) => setInputRedeemBarSize(e.target.value)}
                    >
                      <option value="0.1">0.1g Physical Bar</option>
                      <option value="0.5">0.5g Physical Bar</option>
                      <option value="1.0">1.0g Physical Bar</option>
                      <option value="15.244">1.0 Baht Gold Bar (15.244g)</option>
                    </select>
                  </div>

                  <div style={{ background: 'var(--bg-app)', border: '1px solid var(--border-card)', padding: '12px 14px', borderRadius: '12px' }}>
                    <div style={{ fontSize: '0.78rem', color: 'var(--text-secondary)', lineHeight: 1.4 }}>
                      Redeeming deducts <strong>-{inputRedeemBarSize}g</strong> from your digital gold pool and adds <strong>+1 Physical Bar</strong> to your physical vault inventory!
                    </div>
                  </div>
                </>
              )}

              <div>
                <label style={{ fontSize: '0.85rem', fontWeight: 700, color: 'var(--text-primary)', marginBottom: '6px', display: 'block' }}>
                  Reference ID (Optional)
                </label>
                <input 
                  type="text" 
                  className="input-balanced"
                  placeholder="e.g. MGB0000S260730656202"
                  value={inputRefId}
                  onChange={(e) => setInputRefId(e.target.value)}
                />
              </div>

              <button type="submit" className="btn-emerald-solid" style={{ height: '46px', marginTop: '4px' }}>
                {goldModalMode === 'buy' ? 'Save Buy Transaction' : 'Save Redeem Transaction'}
              </button>
            </form>
          </div>
        </div>
      )}

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
              Enter your private sync key to sync your 7-day sprint and gold DCA portfolio across all your devices
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
                Enter or Create Private Sync Key
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

      {/* Bottom Nav Bar (3 Tabs) */}
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

        <button 
          className={`nav-tab-btn ${activeTab === 'gold' ? 'active' : ''}`}
          onClick={() => setActiveTab('gold')}
        >
          <div className="nav-tab-icon">
            <Coins size={18} />
          </div>
          <span>Gold DCA</span>
        </button>
      </nav>
    </div>
  );
}
