import { useEffect, useRef, useState } from 'react';
import { Link } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import api from '../api/axios';
import { HINTS } from '../constant/Hints.js';

export default function MainPage() {
  const { user } = useAuth();
  const [activeDay, setActiveDay] = useState<number | null>(null);
  const [loading, setLoading] = useState(true);
  const [copiedDay, setCopiedDay] = useState<number | null>(null);
  const timeoutRef = useRef<number | null>(null);

  const handleCopyHint = async (hint: string, day: number) => {
    if (timeoutRef.current) {
      window.clearTimeout(timeoutRef.current);
    }

    try {
      await navigator.clipboard.writeText(hint);
      setCopiedDay(day);
      timeoutRef.current = window.setTimeout(() => setCopiedDay(null), 2000);
    } catch {
      // Fallback for older browsers
      const el = document.createElement('textarea');
      el.value = hint;
      document.body.appendChild(el);
      el.select();
      document.execCommand('copy');
      document.body.removeChild(el);
      setCopiedDay(day);
      timeoutRef.current = window.setTimeout(() => setCopiedDay(null), 2000);
    }
  };

  useEffect(() => {
    // Only fetch today's active day if user is logged in
    if (!user) {
      setLoading(false);
      return;
    }
    api
      .get<{ activeDay: number | null }>('/gift/today')
      .then((res) => setActiveDay(res.data.activeDay))
      .catch((err) => console.error(err))
      .finally(() => setLoading(false));
  }, [user]);

  return (
    <div className="flex-1 bg-black flex flex-col items-center justify-center gap-8 p-8">

      {/* Gift code display */}
      <div className="text-center">
        {loading ? (
          <p className="text-white text-lg lg:text-xl">Loading...</p>
        ) : !user ? (
          <div className="flex flex-col items-center gap-4">
            {/* Shown to guests */}
            <p className="text-white text-2xl font-bold tracking-widest mb-6 lg:text-4xl">
              Anime and
              <br/>
              Songkran Festival
              <br/>
              ✨ 2026 ✨
            </p>
            <Link
              to="/login"
              className="bg-red-600 text-white font-semibold px-6 py-3 rounded-lg hover:bg-white hover:text-red-600 transition lg:text-xl tracking-wide lg:tracking-wider"
            >
              Log in to see today's hint.
            </Link>
          </div>
        ) : activeDay ? (
          <div className="flex flex-col items-center gap-3 lg:gap-6">
            <p className="text-white text-2xl font-bold tracking-widest mb-6 lg:text-4xl">
              Anime and
              <br/>
              Songkran Festival
              <br/>
              ✨ 2026 ✨
            </p>
            <div className='flex flex-col lg:flex-row gap-6 lg:gap-12 w-full max-w-screen-xl'>
              {Array.from({ length: Math.min(activeDay, 3) }, (_, i) => i + 1).map((day) => (
                <div key={day} className="flex-1 flex flex-col p-2 gap-2">
                  <p className="text-white font-semibold text-md lg:text-xl tracking-wider lg:tracking-widest">Hint Day {day}</p>
                  <p className="bg-red-500 p-2 rounded-lg text-gray-900 font-sm font-light lg:text-lg tracking-wide hover:bg-red-600">{HINTS[day]}</p>
                  <button
                    onClick={() => handleCopyHint(HINTS[day], day)}
                    title="Copy hint"
                    className="flex items-center justify-center w-7 h-7 rounded-lg bg-white text-red-600 hover:bg-red-600 hover:text-white transition text-red-600 shrink-0"
                  >
                    {copiedDay === day ? (
                      <svg xmlns="http://www.w3.org/2000/svg" className="w-4 h-4 text-green-300" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
                        <polyline points="20 6 9 17 4 12" />
                      </svg>
                    ) : (
                      <svg xmlns="http://www.w3.org/2000/svg" className="w-4 h-4" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                        <rect x="9" y="9" width="13" height="13" rx="2" ry="2" />
                        <path d="M5 15H4a2 2 0 0 1-2-2V4a2 2 0 0 1 2-2h9a2 2 0 0 1 2 2v1" />
                      </svg>
                    )}
                  </button>
                </div>
              ))}
            </div>
            <Link
              to="/gift"
              className="mt-4 bg-red-600 text-white lg:text-xl tracking-wide lg:tracking-widest font-normal px-6 py-3 rounded-lg hover:bg-white hover:text-red-600 transition"
            >
              Enter codes →
            </Link>
          </div>
        ) : (
          <p className="text-white text-lg lg:text-xl">
            No gift code available today.
          </p>
        )}
      </div>
    </div>
  );
}
