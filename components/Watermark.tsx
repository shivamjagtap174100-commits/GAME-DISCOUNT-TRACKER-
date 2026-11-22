'use client';

import React from 'react';
import { Gamepad2, Sparkles, CheckCircle2 } from 'lucide-react';

export default function Watermark() {
  return (
    <aside
      aria-label="Creator Watermark"
      className="fixed bottom-4 left-4 z-30 pointer-events-auto"
    >
      <div className="group flex items-center gap-2 px-3 py-1.5 rounded-full bg-[#171A1D]/90 hover:bg-[#1D2226] border border-[#262D33] hover:border-accent-amber/50 backdrop-blur-md shadow-lg transition-all duration-300">
        <div className="w-4 h-4 rounded-full bg-accent-amber/20 flex items-center justify-center text-accent-amber">
          <Gamepad2 className="w-2.5 h-2.5" />
        </div>
        <span className="text-[11px] font-medium text-text-secondary group-hover:text-text-primary transition-colors flex items-center gap-1">
          <span className="text-text-muted text-[10px]">Built by</span>
          <span className="font-heading font-semibold text-accent-amber">Shivam Jagtap</span>
        </span>
        <CheckCircle2 className="w-3 h-3 text-accent-emerald ml-0.5 opacity-80 group-hover:opacity-100" />
      </div>
    </aside>
  );
}
