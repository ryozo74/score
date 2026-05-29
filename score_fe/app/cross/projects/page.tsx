'use client';

import { useTranslations } from 'next-intl';
import { useEffect, useState } from 'react';
import { getProjectPalette } from '@/app/lib/colorPalette';

interface Project {
  id?: number | string;
  name?: string;
  status?: string;
}

interface Shot {
  name?: string;
  status?: string;
}

interface CrossProjectsData {
  projects: Project[];
  shots: Shot[];
}

function getToken(): string | null {
  if (typeof document === 'undefined') return null;
  const match = document.cookie.match(/score_token=([^;]+)/);
  return match ? match[1] : null;
}

export default function CrossProjectsPage() {
  const t = useTranslations('cross');
  const [data, setData] = useState<CrossProjectsData | null>(null);
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const token = getToken();
    const headers: Record<string, string> = { 'Content-Type': 'application/json' };
    if (token) headers['Authorization'] = `Bearer ${token}`;

    fetch('/api/bff/cross/projects', { headers })
      .then(async (res) => {
        if (!res.ok) throw new Error(`${res.status}`);
        return res.json();
      })
      .then((d: CrossProjectsData) => {
        setData(d);
        setLoading(false);
      })
      .catch((err) => {
        setError(`データを取得できませんでした (${err.message})`);
        setLoading(false);
      });
  }, []);

  return (
    <div
      className="h-screen w-full text-slate-800 flex overflow-hidden font-sans"
      style={{ background: 'linear-gradient(135deg, #E0F2FE, #F3E8FF, #FCE7F3)' }}
    >
      <aside className="w-24 bg-white/30 backdrop-blur-xl border-r border-white/60 flex flex-col items-center py-4 gap-1 flex-shrink-0">
        <div className="text-2xl mb-1">🎞️</div>
        <p className="text-[9px] font-black text-indigo-600 tracking-widest mb-3" translate="no">Score</p>
        <nav className="flex flex-col items-center gap-1 w-full px-2 flex-1">
          <a
            href="/dashboard"
            className="flex flex-col items-center gap-0.5 py-2.5 w-full rounded-2xl text-slate-500 hover:bg-white/40 text-xs transition-all"
          >
            <span className="text-xl">🏠</span>
            <span>ホーム</span>
          </a>
        </nav>
      </aside>

      <main className="flex-1 flex flex-col relative overflow-hidden">
        <div className="px-8 pt-6 pb-2">
          <h1 className="text-2xl font-black text-slate-800">🎞️ {t('projects.title')}</h1>
          <p className="text-xs text-slate-400 mt-0.5">{t('projects.subtitle')}</p>
        </div>

        <div className="flex-1 overflow-y-auto p-8 space-y-8">
          <a
            href="/dashboard"
            className="inline-flex items-center gap-2 text-sm font-bold text-indigo-600 hover:text-indigo-800 transition-colors"
          >
            ← ホーム
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

          {!loading && !error && (
            <>
              <section>
                <h2 className="text-lg font-black text-slate-800 mb-4 flex items-center gap-2">
                  <span className="w-2 h-6 bg-indigo-400 rounded-full inline-block" />
                  📽️ {t('projects.shotsSummary')}
                </h2>
                {(!data?.shots || data.shots.length === 0) ? (
                  <div className="bg-white/40 backdrop-blur-md border border-white/60 rounded-3xl p-6 text-slate-400 text-sm">
                    {t('projects.noShots')}
                  </div>
                ) : (
                  <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                    {data.shots.map((shot, i) => (
                      <div key={i} className="bg-white/40 backdrop-blur-xl border border-white/60 rounded-3xl p-5 shadow-xl">
                        <div className="flex items-center gap-3 mb-3">
                          <div className="w-10 h-10 rounded-2xl bg-indigo-100 flex items-center justify-center text-xl">🎬</div>
                          <h3 className="text-sm font-black text-slate-800 truncate" translate="no">{shot.name ?? '—'}</h3>
                        </div>
                        <span className="inline-block px-3 py-1 bg-indigo-100 text-indigo-600 text-xs font-bold rounded-full" translate="no">
                          {shot.status ?? '—'}
                        </span>
                      </div>
                    ))}
                  </div>
                )}
              </section>

              <section>
                <h2 className="text-lg font-black text-slate-800 mb-4 flex items-center gap-2">
                  <span className="w-2 h-6 bg-emerald-400 rounded-full inline-block" />
                  🗂️ {t('projects.projectsList')}
                </h2>
                {(!data?.projects || data.projects.length === 0) ? (
                  <div className="bg-white/40 backdrop-blur-md border border-white/60 rounded-3xl p-6 text-slate-400 text-sm">
                    {t('projects.noProjects')}
                  </div>
                ) : (
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                    {data.projects.map((project, i) => {
                      const palette = getProjectPalette(project.id, i);
                      return (
                        <a
                          key={project.id ?? i}
                          href={project.id !== undefined ? `/cross/production-tracker/${project.id}` : undefined}
                          className={`${palette.card} backdrop-blur-xl border-2 rounded-3xl p-6 shadow-xl block transition-transform hover:scale-[1.01]`}
                        >
                          <div className="flex items-start justify-between mb-4">
                            <div>
                              <h3 className={`text-base font-black ${palette.title}`} translate="no">{project.name ?? '—'}</h3>
                              <p className="text-xs text-slate-500 mt-1">ID: {project.id ?? '—'}</p>
                            </div>
                            <span className={`px-3 py-1 ${palette.badge} text-xs font-bold rounded-full`} translate="no">
                              {project.status ?? 'active'}
                            </span>
                          </div>
                          <div className="border-t border-white/60 pt-4">
                            <p className="text-xs text-slate-500">{t('projects.progressLabel')}</p>
                            <div className="mt-2 bg-white/50 rounded-full h-2 overflow-hidden">
                              <div className={`${palette.progressBar} h-full rounded-full`} style={{ width: '50%' }} />
                            </div>
                          </div>
                        </a>
                      );
                    })}
                  </div>
                )}
              </section>
            </>
          )}
        </div>
      </main>
    </div>
  );
}
