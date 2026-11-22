'use client';

import React, { useEffect } from 'react';
import { AlertTriangle, RefreshCw } from 'lucide-react';

export default function GlobalError({
  error,
  reset,
}: {
  error: Error & { digest?: string };
  reset: () => void;
}) {
  useEffect(() => {
    console.error('Application Error:', error);
  }, [error]);

  return (
    <div className="min-h-[70vh] flex flex-col items-center justify-center px-4 text-center space-y-4">
      <div className="w-14 h-14 rounded-2xl bg-[#291717] border border-accent-red/30 flex items-center justify-center text-accent-red">
        <AlertTriangle className="w-7 h-7" />
      </div>
      <h2 className="font-heading text-2xl font-bold text-text-primary">
        Something Went Wrong
      </h2>
      <p className="text-xs text-text-muted max-w-md">
        An unexpected error occurred while rendering this view. Our data accuracy engine is logging this event.
      </p>
      <button
        onClick={() => reset()}
        className="px-4 py-2 bg-accent-amber text-[#101214] font-bold text-xs rounded-md flex items-center gap-2 shadow"
      >
        <RefreshCw className="w-3.5 h-3.5" />
        <span>Try Again</span>
      </button>
    </div>
  );
}
