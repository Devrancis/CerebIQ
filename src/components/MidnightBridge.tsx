"use client";
import React, { useState } from 'react';
import { DndContext, useDraggable, useDroppable, DragEndEvent } from '@dnd-kit/core';

// Basic draggable item
function Explorer({ id, speed }: { id: string, speed: number }) {
  const { attributes, listeners, setNodeRef, transform } = useDraggable({
    id: id,
  });
  
  const style = transform ? {
    transform: `translate3d(${transform.x}px, ${transform.y}px, 0)`,
  } : undefined;

  return (
    <div 
      ref={setNodeRef} 
      style={style} 
      {...listeners} 
      {...attributes}
      className="w-16 h-16 rounded-full bg-slate-800 border-2 border-socratic-violet flex items-center justify-center font-bold text-slate-200 cursor-grab hover:bg-slate-700 hover:border-focus-green shadow-[0_0_10px_rgba(0,0,0,0.5)] z-10 transition-colors"
    >
      {speed}m
    </div>
  );
}

// Basic droppable area
function Zone({ id, title, children }: { id: string, title: string, children: React.ReactNode }) {
  const { isOver, setNodeRef } = useDroppable({
    id: id,
  });

  return (
    <div 
      ref={setNodeRef} 
      className={`w-48 min-h-[350px] p-4 rounded-xl border-2 flex flex-col items-center gap-4 transition-all duration-300 ${isOver ? 'bg-slate-800/80 border-focus-green shadow-[0_0_20px_rgba(79,157,105,0.2)]' : 'bg-slate-900/50 border-slate-700 shadow-inner'}`}
    >
      <h3 className="text-slate-400 font-bold mb-2 uppercase tracking-wider text-sm">{title}</h3>
      <div className="flex-1 w-full flex flex-col items-center gap-3">
        {children}
      </div>
    </div>
  );
}

export default function MidnightBridge({ isActive }: { isActive: boolean }) {
  // Store where each explorer is (start or end zone)
  const [explorers, setExplorers] = useState([
    { id: 'e1', speed: 1, zone: 'start' },
    { id: 'e2', speed: 2, zone: 'start' },
    { id: 'e3', speed: 5, zone: 'start' },
    { id: 'e4', speed: 10, zone: 'start' },
  ]);

  const handleDragEnd = (event: DragEndEvent) => {
    if (!isActive) return;
    
    const { active, over } = event;
    if (over && active.id) {
      setExplorers(explorers.map(e => 
        e.id === active.id ? { ...e, zone: over.id as string } : e
      ));
    }
  };

  return (
    <div className="w-full flex justify-between items-stretch gap-4 px-4">
      <DndContext onDragEnd={handleDragEnd}>
        <Zone id="start" title="Start Side">
          {explorers.filter(e => e.zone === 'start').map(e => (
            <Explorer key={e.id} id={e.id} speed={e.speed} />
          ))}
        </Zone>

        {/* Bridge Visual */}
        <div className="flex-1 flex flex-col items-center justify-center relative">
           <div className="w-full h-16 border-y-4 border-dashed border-slate-600 flex items-center justify-center bg-slate-950/40 relative">
              <div className="absolute bg-slate-800 px-4 py-2 rounded text-slate-400 font-mono text-sm shadow-md border border-slate-700">
                Chasm
              </div>
           </div>
           {/* Hint text */}
           <div className="absolute bottom-4 text-xs text-slate-500 font-mono">
             Drag explorers across
           </div>
        </div>

        <Zone id="end" title="Safe Zone">
          {explorers.filter(e => e.zone === 'end').map(e => (
            <Explorer key={e.id} id={e.id} speed={e.speed} />
          ))}
        </Zone>
      </DndContext>
    </div>
  );
}
