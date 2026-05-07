import React from 'react';
import Link from 'next/link';

export default function DashboardLayout({ children }: { children: React.ReactNode }) {
  return (
    <div className="flex flex-col md:flex-row min-h-screen bg-slate-950 text-slate-200">
      {/* Column 1: Sidebar Nav (20%) */}
      <aside className="w-full md:w-[20%] p-6 border-b md:border-b-0 md:border-r border-slate-700 bg-slate-950">
        <div className="flex items-center gap-3 mb-8">
          <div className="w-10 h-10 rounded-full bg-socratic-violet flex items-center justify-center font-bold text-white">
            C
          </div>
          <div>
            <h2 className="font-semibold text-lg">CerebIQ User</h2>
            <div className="flex items-center gap-2 text-sm text-slate-400">
              <span>Elo: 1200</span>
              <span className="flex items-center text-streak-fire font-bold">
                🔥 3
              </span>
            </div>
          </div>
        </div>
        <nav className="flex flex-col gap-4">
          <Link href="/dashboard" className="hover:text-focus-green transition-colors font-medium">Daily Gauntlet</Link>
          <Link href="/dashboard/training" className="hover:text-focus-green transition-colors font-medium">Training Grounds</Link>
          <Link href="/dashboard/war-room" className="hover:text-focus-green transition-colors font-medium">War Room</Link>
          <Link href="/dashboard/blitz" className="hover:text-focus-green transition-colors font-medium">Blitz Mode</Link>
        </nav>
      </aside>

      {/* Column 2: Main Stage (55%) */}
      <main className="w-full md:w-[55%] p-6 flex flex-col items-center justify-start overflow-y-auto">
        {children}
      </main>

      {/* Column 3: Pulse Panel (25%) */}
      <aside className="w-full md:w-[25%] p-6 border-t md:border-t-0 md:border-l border-slate-700 bg-slate-800">
        <div className="mb-8">
          <h3 className="text-sm uppercase tracking-wider font-semibold mb-4 text-slate-400">Relative Leaderboard</h3>
          <ul className="flex flex-col gap-3 text-sm">
            <li className="flex justify-between text-slate-400 p-2 rounded"><span>1. Euler</span> <span>1240</span></li>
            <li className="flex justify-between text-slate-400 p-2 rounded"><span>2. Turing</span> <span>1225</span></li>
            <li className="flex justify-between font-bold text-focus-green p-2 rounded bg-slate-950/50 border border-slate-700"><span>3. You</span> <span>1200</span></li>
            <li className="flex justify-between text-slate-400 p-2 rounded"><span>4. Lovelace</span> <span>1180</span></li>
            <li className="flex justify-between text-slate-400 p-2 rounded"><span>5. Nash</span> <span>1150</span></li>
          </ul>
        </div>
        <div>
          <h3 className="text-sm uppercase tracking-wider font-semibold mb-4 text-slate-400">Live Activity Feed</h3>
          <ul className="flex flex-col gap-3 text-xs text-slate-400">
            <li className="bg-slate-950/30 p-2 rounded"><strong>Euler</strong> solved "Midnight Bridge" in 2m14s</li>
            <li className="bg-slate-950/30 p-2 rounded"><strong>Turing</strong> started a Blitz session</li>
            <li className="bg-slate-950/30 p-2 rounded"><strong>Nash</strong> lost a 5-day streak</li>
          </ul>
        </div>
      </aside>
    </div>
  );
}
