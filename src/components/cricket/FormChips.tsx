import React from 'react';

export type FormResult = 'W' | 'L' | 'NR' | 'D';

interface FormChipsProps {
  results: FormResult[];
  className?: string;
}

export function FormChips({ results, className = '' }: FormChipsProps) {
  const getBadgeStyle = (res: FormResult) => {
    switch (res) {
      case 'W':
        return 'bg-win text-white font-bold';
      case 'L':
        // Crucial requirement: NEVER use red for losses! Dark slate #374151 with 'L'
        return 'bg-loss text-white font-bold';
      case 'NR':
      case 'D':
      default:
        return 'bg-draw-nr text-white font-medium';
    }
  };

  return (
    <div className={`inline-flex items-center gap-1.5 ${className}`}>
      {results.map((res, idx) => (
        <span
          key={idx}
          className={`w-6 h-6 rounded flex items-center justify-center text-xs tracking-wider select-none shadow-sm ${getBadgeStyle(
            res
          )}`}
          title={res === 'W' ? 'Won' : res === 'L' ? 'Lost' : 'No Result'}
        >
          {res}
        </span>
      ))}
    </div>
  );
}
