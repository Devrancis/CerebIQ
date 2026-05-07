"use client";
import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import MidnightBridge from './MidnightBridge';

export default function FocusVaultCard() {
  const [sessionState, setSessionState] = useState<'locked' | 'loading' | 'active'>('locked');
  const [timeLeft, setTimeLeft] = useState<number | null>(null);
  
  // Anti-Cheat: Timer logic based on server end time
  useEffect(() => {
    if (sessionState !== 'active') return;
    
    // In a real app, this would be passed from the server or fetched
    // We are simulating an absolute server end time (15 mins from now)
    const serverEndTime = Date.now() + 15 * 60 * 1000; 
    
    const interval = setInterval(() => {
      const remaining = Math.max(0, Math.floor((serverEndTime - Date.now()) / 1000));
      setTimeLeft(remaining);
      
      if (remaining === 0) {
        clearInterval(interval);
      }
    }, 1000);
    
    return () => clearInterval(interval);
  }, [sessionState]);

  const handleInitiate = async () => {
    setSessionState('loading');
    // Simulate API call to create session
    await new Promise(resolve => setTimeout(resolve, 1500));
    setSessionState('active');
  };

  const formatTime = (seconds: number) => {
    const m = Math.floor(seconds / 60);
    const s = seconds % 60;
    return `${m.toString().padStart(2, '0')}:${s.toString().padStart(2, '0')}`;
  };

  return (
    <div className="relative w-full max-w-4xl rounded-xl border border-slate-700 bg-slate-800 shadow-2xl overflow-hidden min-h-[600px] flex flex-col">
      {/* Header */}
      <div className="flex justify-between items-center p-5 border-b border-slate-700 bg-slate-950/80">
        <div>
          <span className="text-xs font-bold text-socratic-violet uppercase tracking-wider mb-1 block">Daily Gauntlet</span>
          <h2 className="text-xl font-bold text-slate-200">The Midnight Bridge</h2>
        </div>
        {sessionState === 'active' && timeLeft !== null && (
          <div className="flex flex-col items-end">
            <span className="text-xs text-slate-400 uppercase tracking-wider mb-1">Time Remaining</span>
            <div className={`font-mono text-2xl font-bold ${timeLeft < 300 ? 'text-streak-fire' : 'text-focus-green'}`}>
              {formatTime(timeLeft)}
            </div>
          </div>
        )}
      </div>

      {/* Content Area */}
      <div className="relative flex-1 p-6 flex flex-col items-center justify-center bg-slate-950/20">
        
        {/* The Puzzle */}
        <div className={`w-full h-full flex flex-col transition-all duration-700 ${sessionState !== 'active' ? 'blur-md opacity-40 pointer-events-none select-none' : 'blur-0 opacity-100'}`}>
          <div className="mb-8 text-center max-w-2xl mx-auto">
            <p className="text-slate-300 leading-relaxed text-sm">
              Four explorers must cross a rickety bridge at midnight. They have one flashlight, and the bridge can only hold two people at a time. They walk at different speeds (1, 2, 5, and 10 minutes). When two cross, they move at the slower person's pace. The flashlight must be carried back and forth. Can they all cross in exactly 17 minutes?
            </p>
          </div>
          
          <div className="flex-1 w-full flex items-center justify-center">
             <MidnightBridge isActive={sessionState === 'active'} />
          </div>
        </div>

        {/* Focus Vault Overlay */}
        <AnimatePresence>
          {sessionState !== 'active' && (
            <motion.div 
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0, backdropFilter: "blur(0px)" }}
              transition={{ duration: 0.6, ease: "easeInOut" }}
              className="absolute inset-0 z-10 flex flex-col items-center justify-center p-6 backdrop-blur-sm bg-slate-950/70"
            >
              <div className="max-w-md w-full text-center bg-slate-800 p-8 rounded-2xl border border-slate-700 shadow-2xl">
                <div className="w-20 h-20 mx-auto mb-6 rounded-full bg-slate-950 flex items-center justify-center border-2 border-socratic-violet/50 shadow-[0_0_20px_rgba(107,127,215,0.2)]">
                  <span className="text-3xl">🔒</span>
                </div>
                <h3 className="text-2xl font-bold text-slate-200 mb-3">Focus Vault Locked</h3>
                <p className="text-slate-400 mb-8 text-sm leading-relaxed">
                  This challenge demands absolute concentration. Once initiated, the tamper-proof server timer begins. Leaving this page or refreshing will not pause the timer. 
                </p>
                
                <button 
                  onClick={handleInitiate}
                  disabled={sessionState === 'loading'}
                  className="w-full py-4 px-6 rounded-xl font-bold text-slate-950 text-lg bg-focus-green hover:bg-focus-green/90 transition-all shadow-[0_0_20px_rgba(79,157,105,0.3)] hover:shadow-[0_0_30px_rgba(79,157,105,0.5)] disabled:opacity-70 disabled:cursor-not-allowed flex justify-center items-center"
                >
                  {sessionState === 'loading' ? (
                    <span className="animate-pulse">Syncing Secure Session...</span>
                  ) : (
                    <span>Initiate Focus Session</span>
                  )}
                </button>
              </div>
            </motion.div>
          )}
        </AnimatePresence>

      </div>
      
      {/* Footer Area for Submit */}
      <div className="p-4 border-t border-slate-700 bg-slate-950/80 flex justify-end">
        <button 
          disabled={sessionState !== 'active'}
          className="py-2 px-6 rounded bg-socratic-violet hover:bg-socratic-violet/90 text-white font-semibold transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
        >
          Submit Solution
        </button>
      </div>
    </div>
  );
}
