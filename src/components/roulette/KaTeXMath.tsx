'use client';

import React, { useMemo } from 'react';
import katex from 'katex';
import 'katex/dist/katex.min.css';

interface KaTeXMathProps {
  math: string;
  displayMode?: boolean;
  className?: string;
}

export function KaTeXMath({ math, displayMode = false, className = '' }: KaTeXMathProps) {
  const html = useMemo(() => {
    try {
      return katex.renderToString(math, {
        displayMode,
        throwOnError: false,
      });
    } catch (e) {
      console.error('KaTeX render error:', e);
      return math;
    }
  }, [math, displayMode]);

  return (
    <span
      className={`inline-block ${className}`}
      dangerouslySetInnerHTML={{ __html: html }}
    />
  );
}
