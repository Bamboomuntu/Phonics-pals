import React, { useState, useEffect } from 'react';
import { GameButton } from '../components/GameButton';
import { getCorpusStats, downloadExport, getAllSessions } from '../utils/storage';

interface DashboardProps {
  onBack: () => void;
}

export const Dashboard: React.FC<DashboardProps> = ({ onBack }) => {
  const [stats, setStats] = useState<{
    totalRecordings: number;
    totalSessions: number;
    uniqueLanguages: string[];
    uniqueWords: number;
    lastSessionDate: string | null;
  } | null>(null);
  const [sessions, setSessions] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    loadStats();
  }, []);

  const loadStats = async () => {
    setLoading(true);
    try {
      const s = await getCorpusStats();
      setStats(s);
      const allSessions = await getAllSessions();
      setSessions(allSessions.reverse().slice(0, 20));
    } catch (e) {
      console.error('Failed to load stats:', e);
    }
    setLoading(false);
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="animate-spin w-12 h-12 border-4 border-blue-100 border-t-blue-500 rounded-full" />
      </div>
    );
  }

  return (
    <div className="w-full max-w-4xl p-6 flex flex-col gap-6 animate-in fade-in duration-500">
      <div className="flex items-center justify-between">
        <button
          onClick={onBack}
          className="bg-white px-5 py-3 rounded-2xl shadow-md border-b-4 border-gray-200 hover:bg-gray-50 active:translate-y-1 active:border-b-0 transition-all font-black text-blue-600 flex items-center gap-2 uppercase text-xs tracking-wider"
        >
          ← HOME
        </button>
        <h1 className="text-xl md:text-2xl font-black text-blue-900">
          📊 Corpus Dashboard
        </h1>
        <div className="w-24" />
      </div>

      {/* Stats Grid */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
        <StatCard label="Recordings" value={stats?.totalRecordings || 0} icon="🎙️" color="bg-green-50 border-green-300" />
        <StatCard label="Sessions" value={stats?.totalSessions || 0} icon="🎮" color="bg-blue-50 border-blue-300" />
        <StatCard label="Languages" value={stats?.uniqueLanguages.length || 0} icon="🌍" color="bg-yellow-50 border-yellow-300" />
        <StatCard label="Words" value={stats?.uniqueWords || 0} icon="📝" color="bg-purple-50 border-purple-300" />
      </div>

      {/* Language breakdown */}
      <div className="bg-white rounded-3xl p-6 shadow-lg border-b-8 border-gray-100">
        <h3 className="text-lg font-black text-blue-800 mb-4">🌍 Languages Recorded</h3>
        {stats?.uniqueLanguages.length ? (
          <div className="flex flex-wrap gap-2">
            {stats.uniqueLanguages.map((lang, i) => (
              <span key={i} className="bg-blue-50 px-4 py-2 rounded-full font-bold text-blue-600 text-sm border border-blue-100">
                {lang}
              </span>
            ))}
          </div>
        ) : (
          <p className="text-blue-900/40 font-bold text-sm">No recordings yet. Play a game first!</p>
        )}
      </div>

      {/* Recent Sessions */}
      <div className="bg-white rounded-3xl p-6 shadow-lg border-b-8 border-gray-100">
        <h3 className="text-lg font-black text-blue-800 mb-4">📋 Recent Sessions</h3>
        {sessions.length > 0 ? (
          <div className="space-y-2">
            {sessions.map((s: any, i) => (
              <div key={i} className="flex items-center justify-between bg-gray-50 rounded-2xl p-3">
                <div className="flex items-center gap-3">
                  <span className="text-lg">🎯</span>
                  <div>
                    <p className="font-bold text-blue-800 text-sm">{s.topic}</p>
                    <p className="text-blue-900/40 text-xs font-medium">
                      {new Date(s.date).toLocaleDateString()} · {s.wordCount} words
                    </p>
                  </div>
                </div>
                <div className="text-right text-sm font-bold text-blue-600">
                  ⭐ {s.englishStars} · 🎙️ {s.recordings}
                </div>
              </div>
            ))}
          </div>
        ) : (
          <p className="text-blue-900/40 font-bold text-sm">No sessions yet.</p>
        )}
      </div>

      {/* Export */}
      <div className="bg-amber-50 border-2 border-dashed border-amber-200 rounded-3xl p-6 text-center">
        <h3 className="text-lg font-black text-amber-800 mb-2">📦 Data Export</h3>
        <p className="text-amber-700/60 font-bold text-sm mb-4">
          Export all recordings and session data as JSON for the data pipeline.
        </p>
        <div className="flex gap-3 justify-center">
          <GameButton color="yellow" size="md" onClick={downloadExport}>
            DOWNLOAD JSON
          </GameButton>
          <button
            onClick={loadStats}
            className="bg-white px-6 py-3 rounded-2xl border-b-4 border-gray-200 font-bold text-blue-600 hover:bg-gray-50 active:translate-y-1 active:border-b-0 transition-all text-sm"
          >
            ↻ REFRESH
          </button>
        </div>
        {stats?.lastSessionDate && (
          <p className="text-amber-700/30 font-bold text-xs mt-3">
            Last session: {new Date(stats.lastSessionDate).toLocaleString()}
          </p>
        )}
      </div>

      <div className="text-center text-blue-900/20 font-black uppercase text-[10px] tracking-widest pb-8">
        Phonic Pals Corpus Dashboard · v1.0
      </div>
    </div>
  );
};

const StatCard: React.FC<{ label: string; value: number; icon: string; color: string }> = ({ label, value, icon, color }) => (
  <div className={`${color} border-2 rounded-3xl p-4 md:p-6 text-center shadow-sm`}>
    <div className="text-2xl md:text-3xl mb-1">{icon}</div>
    <div className="text-2xl md:text-3xl font-black text-blue-900">{value}</div>
    <div className="text-[10px] md:text-xs font-bold text-blue-900/50 uppercase tracking-wider mt-1">{label}</div>
  </div>
);
