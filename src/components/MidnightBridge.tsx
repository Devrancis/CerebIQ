"use client";
import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { HelpCircle, RefreshCw, Undo2, ArrowLeftRight, Flame, Lightbulb } from 'lucide-react';

interface Explorer {
  id: string;
  name: string;
  speed: number;
}

interface Move {
  explorers: Explorer[];
  direction: 'forward' | 'backward';
  time: number;
}

interface MidnightBridgeProps {
  isActive: boolean;
  onSolveChange?: (solved: boolean, time: number) => void;
}

const EXPLORERS: Explorer[] = [
  { id: 'e1', name: 'Swift', speed: 1 },
  { id: 'e2', name: 'Steady', speed: 2 },
  { id: 'e3', name: 'Leisurely', speed: 5 },
  { id: 'e4', name: 'Slow', speed: 10 },
];

export default function MidnightBridge({ isActive, onSolveChange }: MidnightBridgeProps) {
  // Game states
  const [startZone, setStartZone] = useState<Explorer[]>(EXPLORERS);
  const [bridgeZone, setBridgeZone] = useState<Explorer[]>([]);
  const [endZone, setEndZone] = useState<Explorer[]>([]);
  const [flashlightZone, setFlashlightZone] = useState<'start' | 'end'>('start');
  const [elapsedTime, setElapsedTime] = useState<number>(0);
  const [history, setHistory] = useState<Move[]>([]);
  const [showRules, setShowRules] = useState<boolean>(false);
  const [isCrossing, setIsCrossing] = useState<boolean>(false);

  // Check solve state
  const isSolved = endZone.length === EXPLORERS.length && elapsedTime <= 17;
  const isFailed = elapsedTime > 17 || (endZone.length === EXPLORERS.length && elapsedTime > 17);

  useEffect(() => {
    if (onSolveChange) {
      onSolveChange(isSolved, elapsedTime);
    }
  }, [endZone, elapsedTime, isSolved, onSolveChange]);

  // Reset puzzle
  const handleReset = () => {
    setStartZone(EXPLORERS);
    setBridgeZone([]);
    setEndZone([]);
    setFlashlightZone('start');
    setElapsedTime(0);
    setHistory([]);
    setIsCrossing(false);
  };

  // Undo last move
  const handleUndo = () => {
    if (history.length === 0 || isCrossing) return;

    const lastMove = history[history.length - 1];
    const newHistory = history.slice(0, -1);
    setHistory(newHistory);

    // Subtract time
    setElapsedTime(prev => Math.max(0, prev - lastMove.time));

    // Reset flashlight
    const prevFlashlight = lastMove.direction === 'forward' ? 'start' : 'end';
    setFlashlightZone(prevFlashlight);

    // Revert explorers
    const movedIds = new Set(lastMove.explorers.map(e => e.id));
    if (lastMove.direction === 'forward') {
      // They moved to end; move them back to start
      setEndZone(prev => prev.filter(e => !movedIds.has(e.id)));
      setStartZone(prev => [...prev, ...lastMove.explorers].sort((a, b) => a.speed - b.speed));
    } else {
      // They moved to start; move them back to end
      setStartZone(prev => prev.filter(e => !movedIds.has(e.id)));
      setEndZone(prev => [...prev, ...lastMove.explorers].sort((a, b) => a.speed - b.speed));
    }
    
    // Clear bridge
    setBridgeZone([]);
  };

  // Click Explorer to load/unload from bridge
  const handleExplorerClick = (explorer: Explorer, currentZone: 'start' | 'bridge' | 'end') => {
    if (!isActive || isCrossing) return;

    if (currentZone === 'bridge') {
      // Unload from bridge back to the side of the flashlight
      setBridgeZone(prev => prev.filter(e => e.id !== explorer.id));
      if (flashlightZone === 'start') {
        setStartZone(prev => [...prev, explorer].sort((a, b) => a.speed - b.speed));
      } else {
        setEndZone(prev => [...prev, explorer].sort((a, b) => a.speed - b.speed));
      }
    } else {
      // Load onto bridge
      // Must be on the same side as the flashlight
      if (currentZone !== flashlightZone) return;
      // Bridge limit is 2
      if (bridgeZone.length >= 2) return;

      // Move to bridge
      setBridgeZone(prev => [...prev, explorer]);
      if (currentZone === 'start') {
        setStartZone(prev => prev.filter(e => e.id !== explorer.id));
      } else {
        setEndZone(prev => prev.filter(e => e.id !== explorer.id));
      }
    }
  };

  // Cross the bridge
  const handleCross = async () => {
    if (!isActive || bridgeZone.length === 0 || bridgeZone.length > 2 || isCrossing) return;

    setIsCrossing(true);
    const crossingTime = Math.max(...bridgeZone.map(e => e.speed));
    const nextFlashlightZone = flashlightZone === 'start' ? 'end' : 'start';
    const direction = flashlightZone === 'start' ? 'forward' : 'backward';

    // Simulate crossing animation delay
    await new Promise(resolve => setTimeout(resolve, 1000));

    // Move from bridge to destination zone
    if (nextFlashlightZone === 'end') {
      setEndZone(prev => [...prev, ...bridgeZone].sort((a, b) => a.speed - b.speed));
    } else {
      setStartZone(prev => [...prev, ...bridgeZone].sort((a, b) => a.speed - b.speed));
    }

    // Update history and stats
    setHistory(prev => [...prev, {
      explorers: bridgeZone,
      direction,
      time: crossingTime
    }]);
    setElapsedTime(prev => prev + crossingTime);
    setFlashlightZone(nextFlashlightZone);
    setBridgeZone([]);
    setIsCrossing(false);
  };

  return (
    <div className="w-full flex flex-col gap-6">
      {/* Game Header Metrics */}
      <div className="grid grid-cols-3 gap-4 items-center bg-slate-900/60 p-4 rounded-xl border border-slate-800">
        <div className="flex flex-col">
          <span className="text-xs text-slate-400 font-mono uppercase">Elapsed Time</span>
          <div className="flex items-baseline gap-1 mt-1">
            <span className={`text-2xl font-mono font-bold ${elapsedTime > 17 ? 'text-streak-fire' : 'text-focus-green'}`}>
              {elapsedTime}
            </span>
            <span className="text-sm text-slate-400 font-mono">/ 17 mins</span>
          </div>
        </div>
        
        <div className="flex justify-center gap-2">
          <button
            onClick={handleUndo}
            disabled={history.length === 0 || isCrossing}
            className="flex items-center gap-1.5 px-3 py-1.5 text-xs font-semibold rounded bg-slate-800 border border-slate-700 hover:bg-slate-700 hover:text-white transition-colors disabled:opacity-30 disabled:cursor-not-allowed text-slate-300"
            title="Undo last move"
          >
            <Undo2 size={14} />
            Undo
          </button>
          <button
            onClick={handleReset}
            disabled={isCrossing}
            className="flex items-center gap-1.5 px-3 py-1.5 text-xs font-semibold rounded bg-slate-800 border border-slate-700 hover:bg-slate-700 hover:text-white transition-colors disabled:opacity-30 disabled:cursor-not-allowed text-slate-300"
            title="Reset puzzle"
          >
            <RefreshCw size={14} />
            Reset
          </button>
        </div>

        <div className="flex flex-col items-end">
          <button
            onClick={() => setShowRules(!showRules)}
            className="flex items-center gap-1 text-xs font-semibold text-slate-400 hover:text-socratic-violet transition-colors"
          >
            <HelpCircle size={14} />
            Rules & Mechanics
          </button>
        </div>
      </div>

      {/* Rules Dropdown */}
      <AnimatePresence>
        {showRules && (
          <motion.div
            initial={{ opacity: 0, height: 0 }}
            animate={{ opacity: 1, height: 'auto' }}
            exit={{ opacity: 0, height: 0 }}
            className="overflow-hidden bg-slate-900/40 border border-slate-800 rounded-xl p-4 text-xs text-slate-400 leading-relaxed space-y-2"
          >
            <p><strong>Goal:</strong> Move all 4 explorers to the Safe Zone within 17 minutes.</p>
            <ul className="list-disc pl-4 space-y-1">
              <li>The bridge can hold at most <strong>2 explorers</strong> at a time.</li>
              <li>A crossing requires the <strong>flashlight</strong>, which must travel back and forth.</li>
              <li>When two cross, they move at the <strong>slower person's speed</strong>.</li>
              <li>You can click on explorers to place them on or off the bridge, then click <strong>Cross Bridge</strong> to travel.</li>
            </ul>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Puzzle Landscape */}
      <div className="flex items-stretch justify-between min-h-[320px] gap-4">
        {/* Left Bank: Start Zone */}
        <div className={`w-1/3 flex flex-col items-center p-4 rounded-xl border border-slate-800/80 bg-slate-900/30 transition-all ${flashlightZone === 'start' ? 'ring-1 ring-socratic-violet/40 bg-socratic-violet/5' : ''}`}>
          <div className="flex items-center gap-2 mb-3">
            <span className="text-xs font-bold uppercase tracking-wider text-slate-400">Start Bank</span>
            {flashlightZone === 'start' && (
              <motion.div
                animate={{ scale: [1, 1.15, 1] }}
                transition={{ repeat: Infinity, duration: 2 }}
                className="text-yellow-400"
                title="Flashlight is here"
              >
                <Lightbulb size={16} fill="currentColor" />
              </motion.div>
            )}
          </div>
          <div className="flex-1 w-full flex flex-col gap-3 justify-center items-center">
            {startZone.map(explorer => (
              <motion.button
                key={explorer.id}
                layoutId={explorer.id}
                onClick={() => handleExplorerClick(explorer, 'start')}
                disabled={flashlightZone !== 'start' || isCrossing || !isActive}
                className={`w-full max-w-[140px] p-3 rounded-lg border text-center transition-all ${
                  flashlightZone === 'start'
                    ? 'bg-slate-800 hover:bg-slate-700/80 border-slate-700 hover:border-socratic-violet text-slate-200 cursor-pointer'
                    : 'bg-slate-900/50 border-slate-800/50 text-slate-500 cursor-not-allowed'
                }`}
              >
                <div className="font-semibold text-sm">{explorer.name}</div>
                <div className="text-xs font-mono opacity-80 mt-0.5">{explorer.speed} min</div>
              </motion.button>
            ))}
            {startZone.length === 0 && (
              <span className="text-xs font-mono text-slate-600">Empty</span>
            )}
          </div>
        </div>

        {/* Center: Chasm & Bridge */}
        <div className="flex-1 flex flex-col justify-between items-center py-2 px-1">
          <div className="text-center">
            <span className="text-[10px] font-mono text-slate-500 uppercase tracking-widest">Midnight Chasm</span>
          </div>

          {/* Bridge Platform */}
          <div className="w-full flex flex-col items-center gap-4 my-auto">
            <div className="w-full h-2 bg-gradient-to-r from-slate-700 via-slate-800 to-slate-700 rounded-full shadow-md" />
            
            {/* Bridge Slot container */}
            <div className="flex gap-3 justify-center items-center w-full min-h-[90px] border border-dashed border-slate-700 rounded-lg p-2 bg-slate-900/10">
              {bridgeZone.map(explorer => (
                <motion.button
                  key={explorer.id}
                  layoutId={explorer.id}
                  onClick={() => handleExplorerClick(explorer, 'bridge')}
                  disabled={isCrossing || !isActive}
                  className="flex-1 max-w-[110px] p-2.5 rounded-lg bg-socratic-violet/20 border border-socratic-violet/40 hover:border-streak-fire text-slate-200 hover:bg-socratic-violet/30 transition-all text-center cursor-pointer shadow-lg"
                >
                  <div className="font-semibold text-xs truncate">{explorer.name}</div>
                  <div className="text-[10px] font-mono opacity-80 mt-0.5">{explorer.speed} min</div>
                </motion.button>
              ))}
              {bridgeZone.length === 0 && (
                <div className="text-xs font-mono text-slate-500 flex flex-col items-center gap-1">
                  <ArrowLeftRight size={16} />
                  <span>Load up to 2</span>
                </div>
              )}
            </div>
            
            <div className="w-full h-2 bg-gradient-to-r from-slate-700 via-slate-800 to-slate-700 rounded-full shadow-md" />

            {/* Action Cross Button */}
            <button
              onClick={handleCross}
              disabled={bridgeZone.length === 0 || bridgeZone.length > 2 || isCrossing || !isActive}
              className={`px-5 py-2 rounded-lg font-bold text-xs uppercase tracking-wider transition-all flex items-center gap-2 ${
                bridgeZone.length > 0 && bridgeZone.length <= 2 && !isCrossing
                  ? 'bg-focus-green text-slate-950 hover:bg-focus-green/90 shadow-[0_0_15px_rgba(79,157,105,0.3)] hover:scale-102 cursor-pointer'
                  : 'bg-slate-800 text-slate-500 border border-slate-700/50 cursor-not-allowed'
              }`}
            >
              {isCrossing ? (
                <>
                  <span className="animate-spin h-3.5 w-3.5 border-2 border-slate-950 border-t-transparent rounded-full" />
                  Crossing...
                </>
              ) : (
                'Cross Bridge'
              )}
            </button>
          </div>

          <div className="w-full flex justify-center">
            {/* Flashlight Path Indicator */}
            <div className="w-2/3 h-1 bg-slate-800 rounded relative">
              <motion.div
                animate={{ left: flashlightZone === 'start' ? '0%' : '100%', x: flashlightZone === 'start' ? 0 : -16 }}
                transition={{ duration: 0.8, ease: "easeInOut" }}
                className="absolute -top-1.5 w-4 h-4 rounded-full bg-yellow-400 shadow-[0_0_12px_rgba(250,204,21,0.6)] flex items-center justify-center"
              >
                <div className="w-1.5 h-1.5 bg-white rounded-full animate-ping" />
              </motion.div>
            </div>
          </div>
        </div>

        {/* Right Bank: End Zone */}
        <div className={`w-1/3 flex flex-col items-center p-4 rounded-xl border border-slate-800/80 bg-slate-900/30 transition-all ${flashlightZone === 'end' ? 'ring-1 ring-socratic-violet/40 bg-socratic-violet/5' : ''}`}>
          <div className="flex items-center gap-2 mb-3">
            {flashlightZone === 'end' && (
              <motion.div
                animate={{ scale: [1, 1.15, 1] }}
                transition={{ repeat: Infinity, duration: 2 }}
                className="text-yellow-400"
                title="Flashlight is here"
              >
                <Lightbulb size={16} fill="currentColor" />
              </motion.div>
            )}
            <span className="text-xs font-bold uppercase tracking-wider text-slate-400">Safe Bank</span>
          </div>
          <div className="flex-1 w-full flex flex-col gap-3 justify-center items-center">
            {endZone.map(explorer => (
              <motion.button
                key={explorer.id}
                layoutId={explorer.id}
                onClick={() => handleExplorerClick(explorer, 'end')}
                disabled={flashlightZone !== 'end' || isCrossing || !isActive}
                className={`w-full max-w-[140px] p-3 rounded-lg border text-center transition-all ${
                  flashlightZone === 'end'
                    ? 'bg-slate-800 hover:bg-slate-700/80 border-slate-700 hover:border-socratic-violet text-slate-200 cursor-pointer'
                    : 'bg-slate-900/50 border-slate-800/50 text-slate-500 cursor-not-allowed'
                }`}
              >
                <div className="font-semibold text-sm">{explorer.name}</div>
                <div className="text-xs font-mono opacity-80 mt-0.5">{explorer.speed} min</div>
              </motion.button>
            ))}
            {endZone.length === 0 && (
              <span className="text-xs font-mono text-slate-600">Empty</span>
            )}
          </div>
        </div>
      </div>

      {/* Solver status updates */}
      <AnimatePresence>
        {isSolved && (
          <motion.div
            initial={{ opacity: 0, scale: 0.95 }}
            animate={{ opacity: 1, scale: 1 }}
            exit={{ opacity: 0 }}
            className="p-4 rounded-xl border border-focus-green/30 bg-focus-green/10 text-center flex flex-col items-center gap-1"
          >
            <div className="flex items-center gap-2 text-focus-green font-bold">
              <span>🏆 Puzzle Solved!</span>
            </div>
            <p className="text-xs text-slate-300">
              Fantastic! You successfully guided all explorers across the bridge in exactly {elapsedTime} minutes. 
            </p>
          </motion.div>
        )}
        
        {isFailed && (
          <motion.div
            initial={{ opacity: 0, scale: 0.95 }}
            animate={{ opacity: 1, scale: 1 }}
            exit={{ opacity: 0 }}
            className="p-4 rounded-xl border border-streak-fire/30 bg-streak-fire/10 text-center flex flex-col items-center gap-1"
          >
            <div className="flex items-center gap-2 text-streak-fire font-bold">
              <span>⚠️ Limit Exceeded</span>
            </div>
            <p className="text-xs text-slate-300">
              You took {elapsedTime} minutes, exceeding the 17-minute limit. Try clicking <strong>Reset</strong> or <strong>Undo</strong> to find a faster sequence.
            </p>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Movement Log Timeline */}
      {history.length > 0 && (
        <div className="bg-slate-900/30 p-3 rounded-lg border border-slate-800/80">
          <h4 className="text-[10px] font-mono uppercase tracking-wider text-slate-500 mb-2">Crossing Log</h4>
          <div className="flex flex-col gap-1 max-h-[85px] overflow-y-auto pr-1">
            {history.map((move, index) => (
              <div key={index} className="flex justify-between items-center text-[11px] font-mono text-slate-400">
                <div className="flex items-center gap-1.5">
                  <span className="text-[9px] text-slate-600 bg-slate-800 px-1 rounded">#{index + 1}</span>
                  <span>{move.direction === 'forward' ? '➡️' : '⬅️'}</span>
                  <span className="text-slate-300 font-semibold">
                    {move.explorers.map(e => `${e.speed}m`).join(' & ')}
                  </span>
                </div>
                <span className="text-slate-500">took {move.time} min</span>
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  );
}
