import React from 'react';
import FocusVaultCard from '@/components/FocusVaultCard';

export default function DashboardPage() {
  return (
    <div className="w-full max-w-5xl flex flex-col items-center">
      <div className="w-full mb-6">
        <h1 className="text-3xl font-bold text-slate-200">The War Room</h1>
        <p className="text-slate-400 mt-2">Enter the Focus Vault to begin today's logic gauntlet.</p>
      </div>
      
      <FocusVaultCard />
    </div>
  );
}
