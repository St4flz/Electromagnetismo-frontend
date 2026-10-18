import React, { useEffect, useRef } from 'react';
import katex from 'katex';

interface EquationDisplayProps {
  math: string;
  block?: boolean;
  className?: string;
}

export const EquationDisplay: React.FC<EquationDisplayProps> = ({
  math,
  block = true,
  className = '',
}) => {
  const containerRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (containerRef.current) {
      try {
        katex.render(math, containerRef.current, {
          displayMode: block,
          throwOnError: false,
        });
      } catch (e) {
        console.error('Error renderizando KaTeX:', e);
      }
    }
  }, [math, block]);

  return <div ref={containerRef} className={`equation-display ${className}`} />;
};
