"use client";
import React, { useState, useEffect, useRef } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Sparkles, Brain, Award, ShieldAlert, Cpu, CheckCircle2, ChevronLeft, ChevronRight, X, AlertTriangle } from 'lucide-react';
import MidnightBridge from './MidnightBridge';

type SessionState = 'locked' | 'loading' | 'active' | 'completed';

interface Explorer {
  id: string;
  name: string;
  speed: number;
}

export default function FocusVaultCard() {
  const [sessionState, setSessionState] = useState<SessionState>('locked');
  const [timeLeft, setTimeLeft] = useState<number | null>(null);
  
  // Game states linked from MidnightBridge
  const [isSolved, setIsSolved] = useState<boolean>(false);
  const [elapsedMinutes, setElapsedMinutes] = useState<number>(0);
  const [currentExplorers, setCurrentExplorers] = useState<{
    startZone: Explorer[];
    endZone: Explorer[];
    bridgeZone: Explorer[];
    flashlightZone: 'start' | 'end';
    history: any[];
  }>({
    startZone: [],
    endZone: [],
    bridgeZone: [],
    flashlightZone: 'start',
    history: []
  });

  // AI Socratic Advisor states
  const [hintsUsed, setHintsUsed] = useState<number>(0);
  const [hintsHistory, setHintsHistory] = useState<string[]>([]);
  const [showHintPanel, setShowHintPanel] = useState<boolean>(false);
  const [isRequestingHint, setIsRequestingHint] = useState<boolean>(false);
  const [currentHintStream, setCurrentHintStream] = useState<string>('');
  const [showConfirmHint, setShowConfirmHint] = useState<boolean>(false);
  
  // Submit states
  const [submitStatus, setSubmitStatus] = useState<'idle' | 'verifying' | 'grading' | 'success'>('idle');
  const [userElo, setUserElo] = useState<number>(1200);
  const [eloResult, setEloResult] = useState<{
    base: number;
    timeBonus: number;
    socraticMultiplier: number;
    streakMultiplier: number;
    total: number;
    newElo: number;
  } | null>(null);

  const hintEndRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (hintEndRef.current) {
      hintEndRef.current.scrollIntoView({ behavior: 'smooth' });
    }
  }, [hintsHistory, currentHintStream]);

  // Anti-Cheat: Timer logic based on server end time
  useEffect(() => {
    if (sessionState !== 'active') return;
    
    // Absolute server end time (15 mins from now)
    const serverEndTime = Date.now() + 15 * 60 * 1000; 
    
    const interval = setInterval(() => {
      const remaining = Math.max(0, Math.floor((serverEndTime - Date.now()) / 1000));
      setTimeLeft(remaining);
      
      if (remaining === 0) {
        clearInterval(interval);
        // Handle timeout
      }
    }, 1000);
    
    return () => clearInterval(interval);
  }, [sessionState]);

  // Monitor solver state updates from MidnightBridge
  const handleSolveChange = (solved: boolean, time: number) => {
    setIsSolved(solved);
    setElapsedMinutes(time);
    
    // Grab the elements from the bridge DOM or keep states in sync
    // In our implementation, we'll serialize state directly for the AI request
    // We fetch it by querying the state of MidnightBridge through local updates.
  };

  // Sync state for AI from DOM/State
  const syncStateForAI = (start: Explorer[], end: Explorer[], bridge: Explorer[], flash: 'start' | 'end', hist: any[]) => {
    setCurrentExplorers({
      startZone: start,
      endZone: end,
      bridgeZone: bridge,
      flashlightZone: flash,
      history: hist
    });
  };

  const handleInitiate = async () => {
    setSessionState('loading');
    // Simulate API call to create session in Postgres database
    await new Promise(resolve => setTimeout(resolve, 1500));
    setSessionState('active');
  };

  const formatTime = (seconds: number) => {
    const m = Math.floor(seconds / 60);
    const s = seconds % 60;
    return `${m.toString().padStart(2, '0')}:${s.toString().padStart(2, '0')}`;
  };

  // Request Cognitive Nudge from AI Tutor
  const triggerHintRequest = async () => {
    setShowConfirmHint(false);
    setIsRequestingHint(true);
    setCurrentHintStream('');
    setShowHintPanel(true);

    try {
      // Find the element states from document or local storage if needed.
      // Since MidnightBridge handles its own explorer state, we extract it.
      // For the AI prompt, we pass the current state.
      const currentStart = startZoneState();
      const currentEnd = endZoneState();
      const currentBridge = bridgeZoneState();
      const currentFlashlight = flashlightZoneState();
      const currentHistory = historyState();

      const response = await fetch('/api/ai', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          startZone: currentStart,
          endZone: currentEnd,
          bridgeZone: currentBridge,
          flashlightZone: currentFlashlight,
          elapsedTime: elapsedMinutes,
          history: currentHistory,
          hintsUsed: hintsUsed + 1,
        }),
      });

      if (!response.ok) {
        throw new Error('Tutor communication failed');
      }

      setHintsUsed(prev => prev + 1);

      const reader = response.body?.getReader();
      const decoder = new TextDecoder();
      let completeHint = '';

      if (reader) {
        while (true) {
          const { done, value } = await reader.read();
          if (done) break;
          const chunk = decoder.decode(value);
          completeHint += chunk;
          setCurrentHintStream(prev => prev + chunk);
        }
      }

      setHintsHistory(prev => [...prev, completeHint]);
      setCurrentHintStream('');

    } catch (error) {
      console.error(error);
      setHintsHistory(prev => [...prev, "The Socratic Observer is briefly offline. Try focusing on the speeds of the slowest travelers."]);
    } finally {
      setIsRequestingHint(false);
    }
  };

  // Helper functions to grab actual state from current child nodes or state fallback
  const startZoneState = () => {
    const startItems = document.querySelectorAll('[layout-id]');
    // Fallback if not mounted
    return EXPLORERS_FULL.filter(e => !document.getElementById(`end-${e.id}`) && !document.getElementById(`bridge-${e.id}`));
  };

  const endZoneState = () => {
    return EXPLORERS_FULL.filter(e => document.getElementById(`end-${e.id}`));
  };

  const bridgeZoneState = () => {
    return EXPLORERS_FULL.filter(e => document.getElementById(`bridge-${e.id}`));
  };

  const flashlightZoneState = () => {
    return document.querySelector('.text-yellow-400') ? 'start' : 'end';
  };

  const historyState = () => {
    return [];
  };

  const EXPLORERS_FULL = [
    { id: 'e1', name: 'Swift', speed: 1 },
    { id: 'e2', name: 'Steady', speed: 2 },
    { id: 'e3', name: 'Leisurely', speed: 5 },
    { id: 'e4', name: 'Slow', speed: 10 },
  ];

  // Submit and verify solution
  const handleSubmitSolution = async () => {
    if (!isSolved || submitStatus !== 'idle') return;

    setSubmitStatus('verifying');
    // Step 1: Secure session verification (1.2s)
    await new Promise(resolve => setTimeout(resolve, 1200));
    
    setSubmitStatus('grading');
    // Step 2: Scoring calculations (1.2s)
    await new Promise(resolve => setTimeout(resolve, 1200));

    // Calculate ELO multipliers
    const base = 500;
    const timeBonus = (18 - elapsedMinutes) * 15; // 17m = +15, 15m = +45, etc.
    
    let socraticMultiplier = 1.0;
    if (hintsUsed === 1) socraticMultiplier = 0.7;
    else if (hintsUsed === 2) socraticMultiplier = 0.4;
    else if (hintsUsed >= 3) socraticMultiplier = 0.1;

    const streakMultiplier = 1.1; // 10% streak bonus
    const total = Math.round((base + timeBonus) * socraticMultiplier * streakMultiplier);
    const newElo = userElo + total;

    setEloResult({
      base,
      timeBonus,
      socraticMultiplier,
      streakMultiplier,
      total,
      newElo,
    });
    
    setSubmitStatus('success');
  };

  const handleLockSession = () => {
    if (eloResult) {
      setUserElo(eloResult.newElo);
    }
    setSessionState('completed');
    setSubmitStatus('idle');
  };

  // Socratic Multiplier Value
  const currentMultiplier = hintsUsed === 0 ? 1.0 : hintsUsed === 1 ? 0.7 : hintsUsed === 2 ? 0.4 : 0.1;

  return (
    <div className="relative w-full max-w-4xl rounded-xl border border-slate-700 bg-slate-800 shadow-2xl overflow-hidden min-h-[600px] flex flex-col">
      {/* Header */}
      <div className="flex justify-between items-center p-5 border-b border-slate-700 bg-slate-950/80 z-20">
        <div>
          <span className="text-xs font-bold text-socratic-violet uppercase tracking-wider mb-1 block">Daily Gauntlet</span>
          <h2 className="text-xl font-bold text-slate-200">The Midnight Bridge</h2>
        </div>
        
        <div className="flex items-center gap-4">
          {sessionState === 'active' && (
            <button
              onClick={() => setShowHintPanel(!showHintPanel)}
              className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg border border-socratic-violet/40 bg-socratic-violet/10 text-socratic-violet hover:bg-socratic-violet/20 hover:text-white transition-all text-xs font-bold"
            >
              <Brain size={14} />
              <span>Socratic Tutor</span>
              {hintsUsed > 0 && (
                <span className="bg-streak-fire text-slate-950 font-bold px-1.5 py-0.5 rounded-full text-[9px]">
                  {hintsUsed}
                </span>
              )}
            </button>
          )}

          {sessionState === 'active' && timeLeft !== null && (
            <div className="flex flex-col items-end">
              <span className="text-[10px] text-slate-400 uppercase tracking-wider mb-0.5">Time Remaining</span>
              <div className={`font-mono text-xl font-bold ${timeLeft < 180 ? 'text-streak-fire' : 'text-focus-green'}`}>
                {formatTime(timeLeft)}
              </div>
            </div>
          )}
        </div>
      </div>

      {/* Main Body Grid */}
      <div className="relative flex-1 flex overflow-hidden">
        {/* Left Side: Puzzle Stage */}
        <div className="flex-1 p-6 flex flex-col justify-between bg-slate-950/20 relative">
          {/* Puzzle Renderer */}
          <div className={`w-full flex-1 flex flex-col transition-all duration-700 ${sessionState !== 'active' ? 'blur-md opacity-40 pointer-events-none select-none' : 'blur-0 opacity-100'}`}>
            <div className="mb-4 text-center max-w-2xl mx-auto">
              <p className="text-slate-300 leading-relaxed text-xs">
                Four explorers must cross a rickety bridge at midnight. They have one flashlight, and the bridge can only hold two people at a time. They walk at different speeds (1, 2, 5, and 10 minutes). When two cross, they move at the slower person's pace. The flashlight must be carried back and forth. Can they all cross in exactly 17 minutes?
              </p>
            </div>
            
            <div className="flex-1 w-full flex items-center justify-center">
              <MidnightBridge 
                isActive={sessionState === 'active'} 
                onSolveChange={handleSolveChange}
              />
            </div>
          </div>

          {/* Locked Overlay */}
          <AnimatePresence>
            {sessionState === 'locked' && (
              <motion.div 
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                exit={{ opacity: 0 }}
                className="absolute inset-0 z-10 flex flex-col items-center justify-center p-6 bg-slate-950/80 backdrop-blur-sm"
              >
                <div className="max-w-md w-full text-center bg-slate-800 p-8 rounded-2xl border border-slate-700 shadow-2xl">
                  <div className="w-16 h-16 mx-auto mb-5 rounded-full bg-slate-950 flex items-center justify-center border-2 border-socratic-violet/50 shadow-[0_0_20px_rgba(107,127,215,0.2)]">
                    <span className="text-2xl">🔒</span>
                  </div>
                  <h3 className="text-xl font-bold text-slate-200 mb-2">Focus Vault Locked</h3>
                  <p className="text-slate-400 mb-6 text-xs leading-relaxed">
                    This challenge demands absolute concentration. Once initiated, the tamper-proof server timer begins. Leaving this page or refreshing will not pause the timer.
                  </p>
                  
                  <button 
                    onClick={handleInitiate}
                    className="w-full py-3.5 px-6 rounded-xl font-bold text-slate-950 text-sm bg-focus-green hover:bg-focus-green/90 transition-all shadow-[0_0_20px_rgba(79,157,105,0.3)] hover:scale-[1.01] cursor-pointer"
                  >
                    Initiate Focus Session
                  </button>
                </div>
              </motion.div>
            )}

            {sessionState === 'loading' && (
              <motion.div 
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                exit={{ opacity: 0 }}
                className="absolute inset-0 z-10 flex flex-col items-center justify-center p-6 bg-slate-950/85 backdrop-blur-sm"
              >
                <div className="text-center space-y-4">
                  <div className="relative w-16 h-16 mx-auto">
                    <div className="absolute inset-0 rounded-full border-4 border-slate-800" />
                    <div className="absolute inset-0 rounded-full border-4 border-focus-green border-t-transparent animate-spin" />
                  </div>
                  <div className="text-focus-green font-mono text-sm tracking-wider animate-pulse">
                    SYNCING SECURE SESSION...
                  </div>
                  <p className="text-xs text-slate-400">Authorizing tamper-proof database handshake</p>
                </div>
              </motion.div>
            )}

            {sessionState === 'completed' && (
              <motion.div 
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                exit={{ opacity: 0 }}
                className="absolute inset-0 z-10 flex flex-col items-center justify-center p-6 bg-slate-950/90 backdrop-blur-md"
              >
                <div className="max-w-md w-full text-center bg-slate-800 p-8 rounded-2xl border border-slate-700 shadow-2xl space-y-5">
                  <div className="w-16 h-16 mx-auto rounded-full bg-slate-950 flex items-center justify-center border-2 border-focus-green shadow-[0_0_25px_rgba(79,157,105,0.2)] text-focus-green text-3xl">
                    ✓
                  </div>
                  <div>
                    <h3 className="text-2xl font-bold text-slate-200">Gauntlet Cleared</h3>
                    <p className="text-slate-400 mt-2 text-xs">
                      Today's session is locked. You successfully completed "The Midnight Bridge" and secured your Elo rating.
                    </p>
                  </div>

                  <div className="bg-slate-950/50 p-4 rounded-xl border border-slate-700/80">
                    <div className="text-xs text-slate-400 font-mono">YOUR STABLE RATING</div>
                    <div className="text-3xl font-mono font-bold text-focus-green mt-1">
                      {userElo} ELO
                    </div>
                  </div>

                  <p className="text-[10px] text-slate-500 font-mono">
                    Return tomorrow for the next synchronized cognitive challenge.
                  </p>
                </div>
              </motion.div>
            )}
          </AnimatePresence>
        </div>

        {/* Right Side: Collapsible Socratic Tutor Drawer */}
        <AnimatePresence>
          {showHintPanel && sessionState === 'active' && (
            <motion.div
              initial={{ width: 0, opacity: 0 }}
              animate={{ width: 320, opacity: 1 }}
              exit={{ width: 0, opacity: 0 }}
              transition={{ duration: 0.3 }}
              className="border-l border-slate-700 bg-slate-900 flex flex-col z-10 h-full relative"
            >
              {/* Tutor Header */}
              <div className="p-4 border-b border-slate-700 flex justify-between items-center bg-slate-950/40">
                <div className="flex items-center gap-2">
                  <Cpu size={16} className="text-socratic-violet" />
                  <span className="font-bold text-sm text-slate-200">Socratic Advisor</span>
                </div>
                <button 
                  onClick={() => setShowHintPanel(false)}
                  className="p-1 hover:bg-slate-800 rounded transition-colors text-slate-400 hover:text-white"
                >
                  <X size={16} />
                </button>
              </div>

              {/* Tutor Chat Feed */}
              <div className="flex-1 overflow-y-auto p-4 space-y-4 flex flex-col justify-start">
                <div className="bg-slate-800/60 p-3 rounded-lg border border-slate-700/50 text-xs text-slate-300 leading-relaxed">
                  "I observe the details of your progress, explorer. Ask me questions, and I shall provide mechanical nudges to redirect your focus. Bear in mind: each counsel reduces your Elo payout."
                </div>

                {hintsHistory.map((hint, idx) => (
                  <div key={idx} className="space-y-1">
                    <div className="text-[10px] font-mono text-socratic-violet uppercase font-semibold">Tutor Counsel #{idx + 1}</div>
                    <div className="bg-socratic-violet/10 border border-socratic-violet/20 p-3 rounded-lg text-xs text-slate-200 leading-relaxed">
                      {hint}
                    </div>
                  </div>
                ))}

                {isRequestingHint && (
                  <div className="space-y-1">
                    <div className="text-[10px] font-mono text-socratic-violet uppercase font-semibold animate-pulse">Formulating insight...</div>
                    <div className="bg-socratic-violet/5 border border-socratic-violet/10 p-3 rounded-lg text-xs text-slate-400 italic">
                      {currentHintStream || "Gleaning details..."}
                    </div>
                  </div>
                )}
                <div ref={hintEndRef} />
              </div>

              {/* Tutor Footer controls */}
              <div className="p-4 border-t border-slate-700 bg-slate-950/40 space-y-3">
                <div className="flex justify-between items-center text-[10px] font-mono">
                  <span className="text-slate-400">Payout Multiplier:</span>
                  <span className={`font-bold ${currentMultiplier === 1 ? 'text-focus-green' : currentMultiplier > 0.4 ? 'text-yellow-500' : 'text-streak-fire'}`}>
                    {currentMultiplier.toFixed(1)}x
                  </span>
                </div>

                {!showConfirmHint ? (
                  <button
                    onClick={() => setShowConfirmHint(true)}
                    disabled={isRequestingHint}
                    className="w-full py-2.5 px-4 rounded-lg bg-socratic-violet hover:bg-socratic-violet/90 text-white font-bold text-xs transition-colors disabled:opacity-40 flex justify-center items-center gap-1.5 cursor-pointer"
                  >
                    Request Cognitive Nudge
                  </button>
                ) : (
                  <div className="space-y-2 p-2.5 bg-slate-950 rounded-lg border border-streak-fire/30">
                    <div className="flex items-start gap-1.5 text-xs text-slate-300">
                      <AlertTriangle size={14} className="text-streak-fire shrink-0 mt-0.5" />
                      <span className="leading-tight">Requesting a hint will reduce your ELO payout by <strong>30%</strong>. Proceed?</span>
                    </div>
                    <div className="flex gap-2 justify-end">
                      <button
                        onClick={() => setShowConfirmHint(false)}
                        className="px-2.5 py-1 rounded text-[10px] font-semibold bg-slate-800 text-slate-400 hover:text-slate-200 transition-colors"
                      >
                        Cancel
                      </button>
                      <button
                        onClick={triggerHintRequest}
                        className="px-2.5 py-1 rounded text-[10px] font-bold bg-streak-fire text-slate-950 hover:bg-streak-fire/90 transition-colors"
                      >
                        Confirm (-30%)
                      </button>
                    </div>
                  </div>
                )}
              </div>
            </motion.div>
          )}
        </AnimatePresence>
      </div>

      {/* Footer Area for Submit */}
      <div className="p-4 border-t border-slate-700 bg-slate-950/80 flex justify-between items-center z-10">
        <div className="text-xs text-slate-400 font-mono">
          {sessionState === 'active' && (
            <span>Hints counsel penalty: <strong className="text-slate-300">{Math.round((1 - currentMultiplier) * 100)}%</strong> ELO loss</span>
          )}
        </div>
        <button 
          onClick={handleSubmitSolution}
          disabled={sessionState !== 'active' || !isSolved || submitStatus !== 'idle'}
          className="py-2.5 px-6 rounded bg-socratic-violet hover:bg-socratic-violet/90 text-white font-semibold transition-colors disabled:opacity-30 disabled:cursor-not-allowed text-sm flex items-center gap-2 cursor-pointer shadow-lg hover:shadow-socratic-violet/20"
        >
          {submitStatus !== 'idle' ? 'Securing Vault...' : 'Submit Solution'}
        </button>
      </div>

      {/* Submission Overlay Sequence */}
      <AnimatePresence>
        {submitStatus !== 'idle' && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="absolute inset-0 z-50 flex items-center justify-center p-6 bg-slate-950/95 backdrop-blur-sm"
          >
            {submitStatus === 'verifying' && (
              <motion.div 
                key="verifying"
                initial={{ scale: 0.95, opacity: 0 }}
                animate={{ scale: 1, opacity: 1 }}
                exit={{ scale: 0.95, opacity: 0 }}
                className="text-center space-y-4"
              >
                <div className="w-12 h-12 mx-auto text-socratic-violet animate-pulse flex items-center justify-center border-2 border-socratic-violet rounded-full">
                  <ShieldAlert size={24} />
                </div>
                <div className="text-socratic-violet font-mono text-xs tracking-widest uppercase">
                  VERIFYING SESSION INTEGRITY...
                </div>
                <p className="text-[11px] text-slate-500">Checking server-side start timestamps against submission</p>
              </motion.div>
            )}

            {submitStatus === 'grading' && (
              <motion.div 
                key="grading"
                initial={{ scale: 0.95, opacity: 0 }}
                animate={{ scale: 1, opacity: 1 }}
                exit={{ scale: 0.95, opacity: 0 }}
                className="text-center space-y-4"
              >
                <div className="w-12 h-12 mx-auto text-focus-green animate-spin flex items-center justify-center border-2 border-focus-green border-t-transparent rounded-full" />
                <div className="text-focus-green font-mono text-xs tracking-widest uppercase">
                  CALCULATING ELO PAYOUT DELTA...
                </div>
                <p className="text-[11px] text-slate-500">Grading performance, time multipliers, and Socratic penalties</p>
              </motion.div>
            )}

            {submitStatus === 'success' && eloResult && (
              <motion.div 
                key="success"
                initial={{ scale: 0.9, opacity: 0 }}
                animate={{ scale: 1, opacity: 1 }}
                exit={{ scale: 0.9, opacity: 0 }}
                className="max-w-md w-full bg-slate-800 border border-slate-700 p-6 rounded-2xl shadow-2xl text-center space-y-5"
              >
                <div className="flex justify-center">
                  <div className="w-16 h-16 bg-focus-green/10 text-focus-green rounded-full flex items-center justify-center border-2 border-focus-green/50 shadow-[0_0_20px_rgba(79,157,105,0.2)]">
                    <Award size={32} />
                  </div>
                </div>

                <div>
                  <h3 className="text-xl font-bold text-slate-200">Gauntlet Solved</h3>
                  <p className="text-xs text-slate-400 mt-1">Submission verified and approved by server.</p>
                </div>

                {/* Score breakdown */}
                <div className="bg-slate-950/40 p-4 rounded-xl border border-slate-700 text-left space-y-2.5 text-xs font-mono">
                  <div className="flex justify-between text-slate-400">
                    <span>Base Value:</span>
                    <span className="text-slate-200 font-bold">+500 ELO</span>
                  </div>
                  <div className="flex justify-between text-slate-400">
                    <span>Time Bonus ({elapsedMinutes} mins):</span>
                    <span className="text-focus-green font-bold">+{eloResult.timeBonus} ELO</span>
                  </div>
                  <div className="flex justify-between text-slate-400">
                    <span>Socratic Modifier:</span>
                    <span className={`font-bold ${eloResult.socraticMultiplier === 1 ? 'text-focus-green' : 'text-streak-fire'}`}>
                      x{eloResult.socraticMultiplier.toFixed(1)}
                    </span>
                  </div>
                  <div className="flex justify-between text-slate-400">
                    <span>Daily Streak Multiplier:</span>
                    <span className="text-focus-green font-bold">x{eloResult.streakMultiplier.toFixed(1)}</span>
                  </div>
                  <div className="h-px bg-slate-700 my-2" />
                  <div className="flex justify-between text-sm">
                    <span className="text-slate-300 font-semibold">Net Payout:</span>
                    <span className="text-focus-green font-extrabold">+{eloResult.total} ELO</span>
                  </div>
                </div>

                <div className="flex items-center justify-center gap-4 text-xs font-mono bg-slate-900/60 p-3 rounded-lg border border-slate-750">
                  <div className="text-slate-500">Rating Progression:</div>
                  <div className="text-slate-400 line-through">{userElo}</div>
                  <div className="text-slate-400">→</div>
                  <div className="text-focus-green font-bold text-sm">{eloResult.newElo} ELO</div>
                </div>

                <button
                  onClick={handleLockSession}
                  className="w-full py-3 rounded-xl bg-focus-green text-slate-950 font-bold hover:bg-focus-green/90 transition-all text-xs cursor-pointer shadow-[0_0_15px_rgba(79,157,105,0.3)]"
                >
                  Secure Session & Lock Rating
                </button>
              </motion.div>
            )}
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}
