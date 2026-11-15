import React, { useEffect, useState } from 'react';
import { Clock, Heart } from 'lucide-react';

interface LoveCounterProps {
  startDate?: string;
}

interface TimePassed {
  days: number;
  hours: number;
  minutes: number;
  seconds: number;
}

export const LoveCounter: React.FC<LoveCounterProps> = ({ startDate = "2024-06-01" }) => {
  const [time, setTime] = useState<TimePassed>({ days: 0, hours: 0, minutes: 0, seconds: 0 });

  useEffect(() => {
    const start = new Date(startDate).getTime();

    const updateCounter = () => {
      const now = new Date().getTime();
      const diff = Math.max(0, now - start);

      const days = Math.floor(diff / (1000 * 60 * 60 * 24));
      const hours = Math.floor((diff / (1000 * 60 * 60)) % 24);
      const minutes = Math.floor((diff / (1000 * 60)) % 60);
      const seconds = Math.floor((diff / 1000) % 60);

      setTime({ days, hours, minutes, seconds });
    };

    updateCounter();
    const interval = setInterval(updateCounter, 1000);
    return () => clearInterval(interval);
  }, [startDate]);

  return (
    <div className="bg-white/80 border border-rose-200/80 rounded-2xl p-3 sm:p-5 shadow-sm text-center max-w-md mx-auto my-3 sm:my-4">
      <div className="flex items-center justify-center gap-1.5 text-rose-500 text-[11px] sm:text-xs font-semibold uppercase tracking-wider mb-2">
        <Clock className="w-3 h-3 sm:w-3.5 sm:h-3.5" />
        <span>Time Spent In My World</span>
      </div>

      <div className="grid grid-cols-4 gap-1.5 sm:gap-2 text-slate-800">
        <div className="bg-rose-50/70 p-1.5 sm:p-2 rounded-xl">
          <div className="text-base sm:text-2xl font-black font-romantic text-rose-600">{time.days}</div>
          <div className="text-[9px] sm:text-[10px] uppercase font-bold text-slate-400">Days</div>
        </div>
        <div className="bg-rose-50/70 p-1.5 sm:p-2 rounded-xl">
          <div className="text-base sm:text-2xl font-black font-romantic text-rose-600">{time.hours}</div>
          <div className="text-[9px] sm:text-[10px] uppercase font-bold text-slate-400">Hours</div>
        </div>
        <div className="bg-rose-50/70 p-1.5 sm:p-2 rounded-xl">
          <div className="text-base sm:text-2xl font-black font-romantic text-rose-600">{time.minutes}</div>
          <div className="text-[9px] sm:text-[10px] uppercase font-bold text-slate-400">Mins</div>
        </div>
        <div className="bg-rose-50/70 p-1.5 sm:p-2 rounded-xl">
          <div className="text-base sm:text-2xl font-black font-romantic text-rose-600">{time.seconds}</div>
          <div className="text-[9px] sm:text-[10px] uppercase font-bold text-slate-400">Secs</div>
        </div>
      </div>

      <p className="text-[10px] sm:text-[11px] text-slate-500 mt-2 flex items-center justify-center gap-1 font-medium">
        <span>...and every second has made me fall more for you</span>
        <Heart className="w-2.5 h-2.5 sm:w-3 sm:h-3 fill-rose-500 text-rose-500 shrink-0" />
      </p>
    </div>
  );
};
