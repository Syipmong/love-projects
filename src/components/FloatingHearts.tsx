import { useEffect, useState } from 'react';
import { motion } from 'framer-motion';

interface HeartParticle {
  id: number;
  x: number;
  size: number;
  duration: number;
  delay: number;
  opacity: number;
  color: string;
}

export const FloatingHearts = () => {
  const [hearts, setHearts] = useState<HeartParticle[]>([]);

  useEffect(() => {
    const colors = ['#f43f5e', '#fb7185', '#fda4af', '#f472b6', '#e11d48'];
    const generated: HeartParticle[] = Array.from({ length: 22 }, (_, i) => ({
      id: i,
      x: Math.random() * 100, // percentage of screen width
      size: Math.random() * 22 + 14, // 14px to 36px
      duration: Math.random() * 10 + 10, // 10s to 20s
      delay: Math.random() * 8,
      opacity: Math.random() * 0.4 + 0.15,
      color: colors[Math.floor(Math.random() * colors.length)]
    }));
    setHearts(generated);
  }, []);

  return (
    <div className="fixed inset-0 pointer-events-none overflow-hidden z-0">
      {hearts.map((h) => (
        <motion.div
          key={h.id}
          initial={{ y: '105vh', x: `${h.x}vw`, opacity: 0, scale: 0.8 }}
          animate={{
            y: '-10vh',
            x: [`${h.x}vw`, `${h.x + (h.id % 2 === 0 ? 4 : -4)}vw`, `${h.x}vw`],
            opacity: [0, h.opacity, h.opacity, 0],
            rotate: [0, h.id % 2 === 0 ? 25 : -25, 0],
            scale: [0.8, 1.1, 0.9]
          }}
          transition={{
            duration: h.duration,
            repeat: Infinity,
            delay: h.delay,
            ease: 'linear'
          }}
          style={{
            position: 'absolute',
            fontSize: `${h.size}px`,
            color: h.color,
          }}
        >
          <svg
            width={h.size}
            height={h.size}
            viewBox="0 0 24 24"
            fill="currentColor"
            xmlns="http://www.w3.org/2000/svg"
          >
            <path d="M12 21.35l-1.45-1.32C5.4 15.36 2 12.28 2 8.5 2 5.42 4.42 3 7.5 3c1.74 0 3.41.81 4.5 2.09C13.09 3.81 14.76 3 16.5 3 19.58 3 22 5.42 22 8.5c0 3.78-3.4 6.86-8.55 11.54L12 21.35z" />
          </svg>
        </motion.div>
      ))}
    </div>
  );
};

