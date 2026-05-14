'use client';
import { useEffect, useRef } from 'react';
import { useInView, animate } from 'framer-motion';

interface Props {
  value: number;
  format: (n: number) => string;
  duration?: number;
  className?: string;
}

export default function AnimatedNumber({ value, format, duration = 1.4, className }: Props) {
  const ref = useRef<HTMLSpanElement>(null);
  const inView = useInView(ref, { once: true, margin: '-40px' });

  useEffect(() => {
    if (!inView || !ref.current) return;
    const el = ref.current;
    const controls = animate(0, value, {
      duration,
      ease: [0.16, 1, 0.3, 1],
      onUpdate: (v) => { el.textContent = format(Math.round(v)); },
    });
    return controls.stop;
  }, [inView, value, duration, format]);

  return <span ref={ref} className={className}>{format(0)}</span>;
}
