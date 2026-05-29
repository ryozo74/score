'use client';

import { useTranslations } from 'next-intl';
import { useEffect, useState } from 'react';
import { useParams } from 'next/navigation';
import { getProjectPalette } from '@/app/lib/colorPalette';

interface ShotItem {
  name?: string;
  seq_code?: string;
  status?: string;
}

interface RetakeItem {
  shot_name?: string;
  note?: string;
}

interface TroubleItem {
  title?: string;
  description?: string;
  resolved?: boolean;
}

interface Tracker {
  shots?: ShotItem[];
  retakes?: RetakeItem[];
  troubles?: TroubleItem[];
}

interface TrackerData {
  project_id: string;
  tracker: Tracker | null;
}

function getToken(): string | null {
  if (typeof document === 'undefined') return null;
  const match = document.cookie.match(/score_token=([^;]+)/);
  return match ? match[1] : null;
}

export default function ProductionTrackerPage() {
  const t = useTranslations('cross');
  const params = useParams();
  const id = params?.id as string;

  const [data, setData] = useState<TrackerData | null>(null);
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (!id) return;
    const token = getToken();
    const headers: Record<string, string> = { 'Content-Type': 'application/json' };
    if (token) headers['Authorization'] = `Bearer ${token}`;

    fetch(`/api/bff/cross/production-tracker/${id}`, { headers })
      .then(async (res) => {
        if (!res.ok) throw new Error(`${res.status}`);
        return res.json();
      })
      .then((d: TrackerData) => {
        setData(d);
        setLoading(false);
      })
      .catch((err) => {
        setError(`データを取得できませんでした (${err.message})`);
        setLoading(false);
      });
  }, [id]);

  const tracker = data?.tracker;
  const isEmpty =
    !tracker ||
    ((!tracker.shots || tracker.shots.length === 0) &&
      (!tracker.retakes || tracker.retakes.length === 0) &&
      (!tracker.troubles || tracker.troubles.length === 0));

  const palette = getProjectPalette(id, 0);

  return (
    <div
      className="h-screen w-full text-slate-800 flex overflow-hidden font-sans"
      style={{ background: 'linear-gradient(135deg, #E0F2FE, #F3E8FF, #FCE7F3)' }}
    >
      <aside className="w-24 bg-white/30 backdrop-blur-xl border-r border-white/60 flex flex-col items-center py-4 gap-1 flex-shrink-0">
        <div className="text-2xl mb-1">📊</div>
        <p className="text-[9px] font-black text-indigo-600 tracking-widest mb-3" translate="no">Score</p>
        <nav className="flex flex-col items-center gap-1 w-full px-2 flex-1">
          <a
            href="/dashboard"
            className="flex flex-col items-center gap-0.5 py-2.5 w-full rounded-2xl text-slate-500 hover:bg-white/40 text-xs transition-all"
          >
            <span className="text-xl">🏠</span>
            <span>ホーム</span>
          </a>
          <a
            href="/cross/projects"
            className="flex flex-col items-center gap-0.5 py-2.5 w-full rounded-2xl text-slate-500 hover:bg-white/40 text-xs transition-all"
          >
            <span className="text-xl">🎞️</span>
            <span>Cross</span>
          </a>
        </nav>
      </aside>

      <main className="flex-1 flex flex-col relative overflow-hidden">
        <div className="px-8 pt-6 pb-2">
          <h1 className="text-2xl font-black text-slate-800">📊 {t('tracker.title')}</h1>
          <p className="text-xs text-slate-400 mt-0.5">
            {t('tracker.projectIdLabel')}: {id} — {t('tracker.subtitle')}
          </p>
        </div>

        <div className="flex-1 overflow-y-auto p-8 space-y-8">
          <a
            href="/cross/projects"
            className="inline-flex items-center gap-2 text-sm font-bold text-indigo-600 hover:text-indigo-800 transition-colors"
          >
            ← {t('projects.title')}
          </a>

          {error && (
            <div className="bg-white/40 backdrop-blur-md border border-rose-200 rounded-2xl p-4 text-rose-600 text-sm">
              🚨 {error}
            </div>
          )}

          {loading && !error && (
            <div className="bg-white/40 backdrop-blur-md border border-white/60 rounded-3xl p-6 text-slate-400 text-sm">
              読み込み中...
            </div>
          )}

          {!loading && !error && isEmpty && (
            <div className="bg-white/40 backdrop-blur-xl border border-white/60 rounded-3xl p-8 text-center shadow-xl">
              <div className="text-4xl mb-4">🚧</div>
              <p className="text-slate-700 font-bold">{t('tracker.emptyTitle')}</p>
              <p className="text-slate-400 text-sm mt-2">{t('tracker.emptyDesc')}</p>
            </div>
          )}

          {!loading && !error && !isEmpty && tracker && (
            <>
              {tracker.shots && tracker.shots.length > 0 && (
                <section>
                  <h2 className={`text-lg font-black mb-4 flex items-center gap-2 ${palette.title}`}>
                    <span className={`w-2 h-6 ${palette.sideBar} rounded-full inline-block`} />
                    🎬 {t('tracker.shots')}
                  </h2>
                  <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                    {tracker.shots.map((shot, i) => (
                      <div key={i} className={`${palette.childSoft} backdrop-blur-xl border rounded-3xl p-5 shadow-xl`}>
                        <div className="flex items-center gap-3 mb-3">
                          <div className={`w-10 h-10 rounded-2xl ${palette.childIconBg} flex items-center justify-center text-xl`}>🎞️</div>
                          <div>
                            <h3 className="text-sm font-black text-slate-800 truncate" translate="no">{shot.name ?? '—'}</h3>
                            {shot.seq_code && <p className="text-xs text-slate-500" translate="no">{shot.seq_code}</p>}
                          </div>
                        </div>
                        <span className={`inline-block px-3 py-1 ${palette.childBadge} text-xs font-bold rounded-full`} translate="no">
                          {shot.status ?? '—'}
                        </span>
                      </div>
                    ))}
                  </div>
                </section>
              )}

              {tracker.retakes && tracker.retakes.length > 0 && (
                <section>
                  <h2 className={`text-lg font-black mb-4 flex items-center gap-2 ${palette.title}`}>
                    <span className={`w-2 h-6 ${palette.sideBar} rounded-full inline-block`} />
                    🔁 {t('tracker.retakes')}
                  </h2>
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    {tracker.retakes.map((retake, i) => (
                      <div key={i} className={`${palette.childMed} backdrop-blur-xl border rounded-3xl p-5 shadow-xl`}>
                        <div className="flex items-start justify-between mb-2">
                          <div>
                            <h3 className="text-sm font-black text-slate-800" translate="no">{retake.shot_name ?? '—'}</h3>
                            {retake.note && <p className="text-xs text-slate-600 mt-1">{retake.note}</p>}
                          </div>
                          <span className="px-3 py-1 bg-amber-100 text-amber-700 text-xs font-bold rounded-full">
                            {t('tracker.retakes')}
                          </span>
                        </div>
                      </div>
                    ))}
                  </div>
                </section>
              )}

              {tracker.troubles && tracker.troubles.length > 0 && (
                <section>
                  <h2 className={`text-lg font-black mb-4 flex items-center gap-2 ${palette.title}`}>
                    <span className={`w-2 h-6 ${palette.sideBar} rounded-full inline-block`} />
                    ⚠️ {t('tracker.troubles')}
                  </h2>
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    {tracker.troubles.map((trouble, i) => (
                      <div key={i} className={`${palette.childStrong} backdrop-blur-xl border rounded-3xl p-5 shadow-xl`}>
                        <div className="flex items-start justify-between mb-2">
                          <div>
                            <h3 className="text-sm font-black text-slate-800" translate="no">{trouble.title ?? 'トラブル'}</h3>
                            {trouble.description && <p className="text-xs text-slate-700 mt-1">{trouble.description}</p>}
                          </div>
                          <span
                            className={`px-3 py-1 text-xs font-bold rounded-full ${
                              trouble.resolved ? 'bg-emerald-100 text-emerald-700' : 'bg-red-100 text-red-700'
                            }`}
                          >
                            {trouble.resolved ? t('tracker.resolved') : t('tracker.unresolved')}
                          </span>
                        </div>
                      </div>
                    ))}
                  </div>
                </section>
              )}
            </>
          )}
        </div>
      </main>
    </div>
  );
}
