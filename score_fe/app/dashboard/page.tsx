'use client';

import { useTranslations } from 'next-intl';
import { useEffect, useState } from 'react';

export const dynamic = 'force-dynamic';

interface MeUser {
  id: string;
  name: string;
  email: string;
  role?: string;
}

interface Shot {
  shot_id?: number;
  id?: number;
  name: string;
  status?: string;
  updated_at?: string;
}

function getToken(): string | null {
  if (typeof document === 'undefined') return null;
  const match = document.cookie.match(/score_token=([^;]+)/);
  return match ? match[1] : null;
}

function toJST(dateStr: string): string {
  try {
    return new Date(dateStr).toLocaleString('ja-JP', { timeZone: 'Asia/Tokyo' });
  } catch {
    return dateStr;
  }
}

export default function DashboardPage() {
  const t = useTranslations();
  const [user, setUser] = useState<MeUser | null>(null);
  const [shots, setShots] = useState<Shot[]>([]);
  const [meError, setMeError] = useState('');
  const [shotsError, setShotsError] = useState('');
  const [langModal, setLangModal] = useState(false);

  const nowJST = new Date().toLocaleString('ja-JP', { timeZone: 'Asia/Tokyo' });

  useEffect(() => {
    const token = getToken();
    const headers: Record<string, string> = {
      'Content-Type': 'application/json',
    };
    if (token) headers['Authorization'] = `Bearer ${token}`;

    // GET /api/bff/me
    fetch('/api/bff/me', { headers })
      .then(async (res) => {
        if (!res.ok) throw new Error(`${res.status}`);
        return res.json();
      })
      .then((data: MeUser) => setUser(data))
      .catch((err) => setMeError(`ユーザー情報を取得できませんでした (${err.message})`));

    // GET /api/bff/shots — project_id=1 をデフォルトとして使用
    fetch('/api/bff/shots?project_id=1', { headers })
      .then(async (res) => {
        if (!res.ok) throw new Error(`${res.status}`);
        return res.json();
      })
      .then((data: Shot[]) => setShots(data))
      .catch((err) => setShotsError(`SHOTリストを取得できませんでした (${err.message})`));
  }, []);

  const roleColor: Record<string, string> = {
    Director: 'text-purple-600',
    PM: 'text-emerald-600',
    'Lighting Lead': 'text-amber-500',
  };
  const roleColorBg: Record<string, string> = {
    Director: 'bg-purple-100',
    PM: 'bg-emerald-100',
    'Lighting Lead': 'bg-amber-100',
  };
  const userRoleColor = user?.role ? (roleColor[user.role] ?? 'text-indigo-600') : 'text-indigo-600';
  const userRoleBg = user?.role ? (roleColorBg[user.role] ?? 'bg-indigo-100') : 'bg-indigo-100';

  function statusBg(status?: string): string {
    if (status === 'retake') return 'bg-rose-500';
    if (status === 'approved') return 'bg-emerald-500';
    return 'bg-amber-500';
  }

  return (
    <div
      className="h-screen w-full text-slate-800 flex overflow-hidden font-sans"
      style={{ background: 'linear-gradient(135deg, #E0F2FE, #F3E8FF, #FCE7F3)' }}
    >
          {/* Sidebar */}
          <aside className="w-24 bg-white/30 backdrop-blur-xl border-r border-white/60 flex flex-col items-center py-4 gap-1 flex-shrink-0">
            <div className="text-2xl mb-1">🎬</div>
            <p className="text-[9px] font-black text-indigo-600 tracking-widest mb-3" translate="no">
              Score
            </p>
            <nav className="flex flex-col items-center gap-1 w-full px-2 flex-1">
              <a
                href="/dashboard"
                className="flex flex-col items-center gap-0.5 py-2.5 w-full rounded-2xl bg-indigo-100 text-indigo-600 font-bold text-xs transition-all"
              >
                <span className="text-xl">🏠</span>
                <span>ホーム</span>
              </a>
              <a
                href="/projects"
                className="flex flex-col items-center gap-0.5 py-2.5 w-full rounded-2xl text-slate-500 hover:bg-white/40 text-xs transition-all"
              >
                <span className="text-xl">🎞️</span>
                <span translate="no">Project</span>
              </a>
              <a
                href="/calendar"
                className="flex flex-col items-center gap-0.5 py-2.5 w-full rounded-2xl text-slate-500 hover:bg-white/40 text-xs transition-all"
              >
                <span className="text-xl">📅</span>
                <span translate="no">Calendar</span>
              </a>
              <a
                href="/messages"
                className="flex flex-col items-center gap-0.5 py-2.5 w-full rounded-2xl text-slate-500 hover:bg-white/40 text-xs transition-all"
              >
                <span className="text-xl">💬</span>
                <span>Messages</span>
              </a>
              <a
                href="/notifications"
                className="flex flex-col items-center gap-0.5 py-2.5 w-full rounded-2xl text-slate-500 hover:bg-white/40 text-xs transition-all"
              >
                <span className="text-xl">🔔</span>
                <span>通知</span>
              </a>
              <a
                href="/exit-report"
                className="flex flex-col items-center gap-0.5 py-2.5 w-full rounded-2xl text-slate-500 hover:bg-white/40 text-xs transition-all"
              >
                <span className="text-xl">🚪</span>
                <span>退勤</span>
              </a>
            </nav>

            {/* User avatar */}
            <div className="mt-auto flex flex-col items-center gap-1">
              {user ? (
                <>
                  <div
                    className={`w-10 h-10 rounded-full ${userRoleBg} ${userRoleColor} flex items-center justify-center font-black`}
                  >
                    {user.name?.[0] ?? 'U'}
                  </div>
                  <p className="text-[9px] text-slate-500" translate="no">
                    {user.name}
                  </p>
                  {user.role && (
                    <p className={`text-[8px] font-bold ${userRoleColor}`} translate="no">
                      {user.role}担当
                    </p>
                  )}
                </>
              ) : (
                <div className="w-10 h-10 rounded-full bg-indigo-100 flex items-center justify-center font-black text-indigo-600">
                  U
                </div>
              )}
            </div>
          </aside>

          {/* Main content */}
          <main className="flex-1 flex flex-col relative overflow-hidden">
            {/* Header */}
            <div className="px-8 pt-6 pb-2">
              <h1 className="text-2xl font-black text-slate-800">
                ☀️{' '}
                {t('dashboard.greeting', { name: user?.name ?? '...' })}
              </h1>
              <p className="text-sm text-slate-500 mt-1">
                {t('dashboard.subtitle')}
              </p>
              <p className="text-xs text-slate-400 mt-0.5">
                {nowJST} <span className="font-bold">JST</span>
              </p>
            </div>

            {/* Breadcrumb */}
            <nav className="text-xs text-slate-500 px-8 pb-2" aria-label="breadcrumb">
              <a href="/dashboard" className="hover:text-indigo-600 transition-colors">
                🏠 {t('nav.dashboard')}
              </a>
              <span className="mx-1">›</span>
              <span className="text-indigo-600 font-bold">{t('dashboard.title')}</span>
            </nav>

            {/* Scrollable content */}
            <div className="flex-1 overflow-y-auto p-10 space-y-8">

              {/* Me error */}
              {meError && (
                <div className="bg-white/40 backdrop-blur-md border border-rose-200 rounded-2xl p-4 text-rose-600 text-sm">
                  🚨 {meError}
                </div>
              )}

              {/* Notifications */}
              <section>
                <h2 className="font-black text-slate-800 text-base mb-3">🔔 通知 &amp; アラート</h2>
                <div className="space-y-3">
                  <div className="bg-white/40 backdrop-blur-md border border-rose-200 rounded-2xl p-4 flex items-start gap-3">
                    <span className="text-rose-500 text-lg mt-0.5">🔴</span>
                    <div>
                      <p className="text-sm font-black text-slate-800">リテイク指示あり</p>
                      <p className="text-xs text-slate-500 mt-0.5">最新の通知を確認してください</p>
                      <a
                        href="/qc-viewer"
                        className="text-xs text-indigo-500 font-bold hover:underline mt-1 inline-block"
                      >
                        詳細確認 →
                      </a>
                    </div>
                  </div>
                </div>
              </section>

              {/* AI proposals */}
              <section>
                <h2 className="font-black text-slate-800 text-base mb-3">
                  🤖 AI スケジュール提案（本日のアサインより）
                </h2>
                <p className="text-xs text-slate-500 mb-4">
                  ※ 本表示は過去 task 履歴の傾向集計に基づく注意喚起であり、未来予測ではありません
                </p>
                <div className="bg-white/40 backdrop-blur-xl border border-white/60 rounded-3xl shadow-xl p-6">
                  <p className="text-xs text-slate-500">
                    AI が本日のアサインを解析中... 後ほど提案が表示されます。
                  </p>
                </div>
              </section>

              {/* SHOT list */}
              <section>
                <h2 className="text-lg font-black text-slate-800 mb-5 flex items-center gap-2">
                  <span className="w-2 h-6 bg-indigo-400 rounded-full inline-block" />
                  📝 本日のタスク
                </h2>

                {shotsError && (
                  <div className="bg-white/40 backdrop-blur-md border border-amber-200 rounded-2xl p-4 text-amber-700 text-sm mb-4">
                    🚨 {shotsError}
                  </div>
                )}

                {shots.length === 0 && !shotsError && (
                  <div className="bg-white/40 backdrop-blur-md border border-white/60 rounded-3xl p-6 text-slate-400 text-sm">
                    本日のタスクはありません
                  </div>
                )}

                <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                  {shots.map((shot) => {
                    const shotId = shot.shot_id ?? shot.id;
                    return (
                      <a
                        key={shotId ?? shot.name}
                        href={`/shot/${shotId}`}
                        className="bg-white/40 backdrop-blur-md border border-white/60 rounded-3xl shadow-xl p-5 flex flex-col gap-3 hover:bg-white/60 transition-all group"
                      >
                        <div className="aspect-video rounded-2xl bg-gradient-to-br from-indigo-200 via-purple-200 to-blue-200 relative overflow-hidden flex items-end p-2">
                          <span
                            className="text-white text-xs font-bold bg-black/30 rounded px-2 py-0.5"
                            translate="no"
                          >
                            {shot.name}
                          </span>
                        </div>
                        <div className="flex items-center gap-4">
                          <div className="w-14 h-14 rounded-2xl bg-indigo-100 flex items-center justify-center text-2xl shrink-0 border border-white shadow-sm">
                            🎬
                          </div>
                          <div className="flex-1 min-w-0">
                            <h4
                              className="text-xs font-black text-slate-700 truncate"
                              translate="no"
                            >
                              {shot.name}
                            </h4>
                            {shot.status && (
                              <span
                                className={`inline-block mt-1 px-2.5 py-0.5 ${statusBg(shot.status)} text-white text-[10px] font-black rounded-full uppercase`}
                                translate="no"
                              >
                                {shot.status}
                              </span>
                            )}
                            {shot.updated_at && (
                              <p className="text-[10px] text-slate-400 mt-1">
                                {toJST(shot.updated_at)} JST
                              </p>
                            )}
                          </div>
                          <span className="text-slate-300 group-hover:text-indigo-400 transition-colors text-lg">
                            ›
                          </span>
                        </div>
                      </a>
                    );
                  })}
                </div>
              </section>
            </div>
          </main>

          {/* Language mini-footer */}
          <div className="fixed bottom-4 left-1/2 -translate-x-1/2 z-20 pointer-events-none flex justify-center">
            <button
              type="button"
              onClick={() => setLangModal(true)}
              className="pointer-events-auto bg-white/70 backdrop-blur-xl border border-white/60 rounded-full px-4 py-1.5 text-xs font-bold text-slate-600 hover:bg-white/90 shadow-lg transition-all"
            >
              🌐 Language
            </button>
          </div>

          {/* Language modal */}
          {langModal && (
            <div
              className="fixed inset-0 bg-black/30 backdrop-blur-sm flex items-center justify-center z-[999]"
              onClick={() => setLangModal(false)}
            >
              <div
                className="bg-white/90 backdrop-blur-xl border border-white/60 rounded-3xl shadow-2xl p-8 w-80 text-center"
                onClick={(e) => e.stopPropagation()}
              >
                <h3 className="text-lg font-black text-slate-800 mb-6">🌐 言語を選択</h3>
                <div className="flex flex-col gap-3">
                  <button className="w-full py-3 bg-slate-100 hover:bg-slate-200 text-slate-600 font-bold rounded-2xl text-sm transition-all">
                    繁體中文
                  </button>
                  <button className="w-full py-3 bg-indigo-600 text-white font-bold rounded-2xl text-sm cursor-default">
                    日本語（現在）
                  </button>
                  <button className="w-full py-3 bg-slate-100 hover:bg-slate-200 text-slate-600 font-bold rounded-2xl text-sm transition-all">
                    English
                  </button>
                </div>
                <p className="text-xs text-slate-400 mt-4">段階的に拡張中</p>
              </div>
            </div>
          )}
    </div>
  );
}
