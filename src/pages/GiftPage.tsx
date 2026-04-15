import { useEffect, useState } from 'react';
import api from '../api/axios';

// Songkran 2026 unlock dates — must match backend
const UNLOCK_DATES: Record<number, string> = {
  1: '2026-04-15',
  2: '2026-04-16',
  3: '2026-04-17',
};

interface DayStatus {
  day: number;
  isRedeemed: boolean;
}

// Get today's date string in Bangkok timezone
function getTodayBangkok(): string {
  return new Date().toLocaleDateString('en-CA', { timeZone: 'Asia/Bangkok' });
}

export default function GiftPage() {
  const [status, setStatus] = useState<DayStatus[] | null>(null);
  const [inputs, setInputs] = useState<Record<number, string>>({ 1: '', 2: '', 3: '' });
  const [messages, setMessages] = useState<Record<number, string>>({ 1: '', 2: '', 3: '' });
  const [loading, setLoading] = useState<Record<number, boolean>>({ 1: false, 2: false, 3: false });
  const [allDone, setAllDone] = useState(false);

  const today = getTodayBangkok();

  // Load current redemption status on mount
  useEffect(() => {
    api
      .get<{ status: DayStatus[]; allDone: boolean }>('/gift/status')
      .then((res) => {
        setStatus(res.data.status);
        setAllDone(res.data.allDone);
      })
      .catch((err) => console.error(err));
  }, []);

  const handleRedeem = async (day: number) => {
    setMessages((prev) => ({ ...prev, [day]: '' }));
    setLoading((prev) => ({ ...prev, [day]: true }));

    try {
      const res = await api.post<{ message: string; allDone: boolean }>('/gift/redeem', {
        day,
        code: inputs[day].trim(),
      });
      setMessages((prev) => ({ ...prev, [day]: '✓ ' + res.data.message }));

      // Update local status to mark this day as redeemed
      setStatus((prev) =>
        prev ? prev.map((s) => (s.day === day ? { ...s, isRedeemed: true } : s)) : prev
      );

      if (res.data.allDone) setAllDone(true);
    } catch (err: unknown) {
      const msg =
        (err as { response?: { data?: { message?: string } } })?.response?.data?.message ||
        'Something went wrong';
      setMessages((prev) => ({ ...prev, [day]: '✗ ' + msg }));
    } finally {
      setLoading((prev) => ({ ...prev, [day]: false }));
    }
  };

  const isUnlocked = (day: number): boolean => today >= UNLOCK_DATES[day];

  const getDayStatus = (day: number): DayStatus | undefined =>
    status?.find((s) => s.day === day);

  return (
    <div className="flex-1 bg-black flex flex-col items-center justify-center p-8 gap-8">

      {/* QR Reveal — shown when all 3 codes are redeemed */}
      {allDone && (
        <div className="bg-white rounded-2xl p-6 flex flex-col items-center gap-3">
          <p className="text-red-600 font-bold text-lg lg:text-xl tracking-widest">Special Gift Unlocked!</p>
          <img src='/Reward.png' alt='Special Gift' className='w-40 h-40'/>
          <p className="text-red-400 text-sm lg:text-base tracking-wide">Scan to reveal your surprise.</p>
        </div>
      )}

      {/* 3 Code input cards */}
      <div className="flex flex-col sm:flex-row gap-6 w-full max-w-4xl">
        {[1, 2, 3].map((day) => {
          const unlocked = isUnlocked(day);
          const dayStatus = getDayStatus(day);
          const redeemed = dayStatus?.isRedeemed ?? false;

          return (
            <div
              key={day}
              className="flex-1 bg-white/20 backdrop-blur rounded-2xl p-5 flex flex-col gap-3"
            >
              {/* Day label */}
              <div className="flex items-center justify-between">
                <p className="text-white font-bold text-md lg:text-xl uppercase tracking-wider">
                  Day {day}
                </p>
                {redeemed && (
                  <span className="bg-green-400 text-green-900 text-sm lg:text-base font-normal px-2 py-0.5 rounded-full">
                    Done
                  </span>
                )}
              </div>

              {/* Locked state */}
              {!unlocked ? (
                <div className="flex flex-col items-center gap-2 py-2 lg:gap-3">
                  <span className="text-5xl">🔒</span>
                  <p className="text-white text-lg text-center tracking-wide">
                    Unlocks {UNLOCK_DATES[day]}
                  </p>
                </div>
              ) : redeemed ? (
                // Already redeemed
                <div className="flex flex-col items-center gap-2 py-2 lg:gap-3">
                  <span className="text-5xl">✅</span>
                  <p className="text-green-400 text-lg tracking-wide text-center">Redeemed!</p>
                </div>
              ) : (
                // Unlocked — show input
                <div className="flex flex-col gap-4">
                  <input
                    type="text"
                    placeholder="Enter code"
                    value={inputs[day]}
                    onChange={(e) =>
                      setInputs((prev) => ({ ...prev, [day]: e.target.value }))
                    }
                    className="w-full px-3 py-2 rounded-lg bg-white/80 text-black lg:text-base placeholder:text-gray-500 text-sm font-mono focus:outline-none focus:ring-2 focus:ring-red-600"
                  />
                  <button
                    onClick={() => handleRedeem(day)}
                    disabled={loading[day] || !inputs[day].trim()}
                    className="w-full bg-red-600 text-white font-normal text-lg tracking-wider py-2 rounded-lg hover:bg-white hover:text-red-600 transition disabled:opacity-50 disabled:cursor-not-allowed"
                  >
                    {loading[day] ? 'Checking...' : 'Redeem'}
                  </button>
                </div>
              )}

              {/* Success / error message */}
              {messages[day] && (
                <p
                  className={`text-lg tracking-md text-center ${
                    messages[day].startsWith('✓')
                      ? 'text-green-200'
                      : 'text-red-300'
                  }`}
                >
                  {messages[day]}
                </p>
              )}
            </div>
          );
        })}
      </div>
    </div>
  );
}
