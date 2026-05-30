'use client';

import React, { useRef } from 'react';
import Draggable from 'react-draggable';

export default function RobotDrone() {
  const nodeRef = useRef(null);
  
  return (
    <Draggable nodeRef={nodeRef} bounds="parent">
      <div 
        ref={nodeRef} 
        className="fixed top-12 right-12 z-[100] cursor-grab active:cursor-grabbing group select-none transition-transform duration-300"
      >
        <div className="relative">
          {/* Pervane Turbinleri */}
          <div className="flex justify-between w-80 px-4 translate-y-10 pointer-events-none">
            <div className="w-24 h-2 bg-blue-500 animate-[spin_0.04s_linear_infinite] rounded-full shadow-[0_0_30px_#3b82f6] opacity-60"></div>
            <div className="w-24 h-2 bg-blue-500 animate-[spin_0.04s_linear_infinite] rounded-full shadow-[0_0_30px_#3b82f6] opacity-60"></div>
          </div>
          
          {/* Mekanik Gövde */}
          <div className="bg-[#0a0a0a] border-2 border-blue-600/50 p-10 rounded-[4rem] shadow-[0_0_100px_rgba(59,130,246,0.1)] flex flex-col items-center backdrop-blur-3xl relative overflow-hidden">
            {/* Arka Plan Tarama Çizgileri */}
            <div className="absolute inset-0 bg-[linear-gradient(rgba(18,16,16,0)_50%,rgba(0,0,0,0.25)_50%),linear-gradient(90deg,rgba(255,0,0,0.06),rgba(0,255,0,0.02),rgba(0,0,255,0.06))] bg-[length:100%_4px,3px_100%] pointer-events-none"></div>
            
            <div className="w-64 h-64 bg-zinc-950 rounded-[3rem] flex items-center justify-center text-9xl border border-blue-500/10 relative overflow-hidden shadow-[inset_0_0_40px_rgba(0,0,0,1)]">
              👤
              <div className="absolute inset-0 bg-blue-500/10 animate-pulse"></div>
            </div>

            <div className="mt-8 flex flex-col items-center gap-3">
              <div className="px-8 py-2 bg-blue-600/10 border border-blue-500/40 rounded-full flex items-center gap-4 text-blue-400">
                <div className="w-3 h-3 bg-green-500 rounded-full animate-ping shadow-[0_0_15px_#22c55e]"></div>
                <span className="text-[12px] font-black tracking-[0.5em] uppercase">Pilot_Manual_Link</span>
              </div>
              <span className="text-[10px] text-zinc-700 font-mono tracking-tighter uppercase font-bold">Unit_Omr_V4.0 // Heavy_Duty</span>
            </div>
          </div>
        </div>
      </div>
    </Draggable>
  );
}