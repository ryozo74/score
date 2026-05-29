'use client';

import { useTranslations } from 'next-intl';
import { Suspense, useState } from 'react';
import { useSearchParams } from 'next/navigation';

export const dynamic = 'force-dynamic';

function ExitReportContent() {
  const t = useTranslations('exitReport');
  const searchParams = useSearchParams();
  const mode = searchParams.get('mode');
  const [langModal, setLangModal] = useState(false);

  const isCurrentMode = mode === 'current';

  return (
    <div
      className="min-h-screen font-sans text-slate-800 flex"
      style={{ background: 'linear-gradient(135deg, #E0F2FE, #F3E8FF, #FCE7F3)' }}
    >
      {/* Sidebar */}
      <aside className="w-24 bg-white/30 backdrop-blur-xl border-r border-white/60 flex flex-col items-center py-4 gap-1 flex-shrink-0">
        <div className="text-2xl mb-1">🎬</div>
        <p className="text-[9px] font-black text-indigo-600 tracking-widest mb-3" translate="no">
          Score
        </p>
        <nav className="flex flex-col items-center gap-1 w-full px-2 flex-1">
          <a href="/dashboard" className="flex flex-col items-center gap-0.5 py-2.5 w-full rounded-2xl text-slate-500 hover:bg-white/40 text-xs transition-all">
            <span className="text-xl">🏠</span><span>ホーム</span>
          </a>
          <a href="#" className="flex flex-col items-center gap-0.5 py-2.5 w-full rounded-2xl text-slate-500 hover:bg-white/40 text-xs transition-all">
            <span className="text-xl">🎞️</span><span translate="no">Project</span>
          </a>
          <a href="#" className="flex flex-col items-center gap-0.5 py-2.5 w-full rounded-2xl text-slate-500 hover:bg-white/40 text-xs transition-all">
            <span className="text-xl">📅</span><span translate="no">Calendar</span>
          </a>
          <a href="/messages" className="flex flex-col items-center gap-0.5 py-2.5 w-full rounded-2xl text-slate-500 hover:bg-white/40 text-xs transition-all">
            <span className="text-xl">💬</span><span>Messages</span>
          </a>
          <a href="#" className="flex flex-col items-center gap-0.5 py-2.5 w-full rounded-2xl text-slate-500 hover:bg-white/40 text-xs transition-all">
            <span className="text-xl">🔔</span><span className="text-[8px]">通知</span>
          </a>
          <a href="/exit_report" className="flex flex-col items-center gap-0.5 py-2.5 w-full rounded-2xl bg-indigo-100 text-indigo-600 font-bold text-xs transition-all">
            <span className="text-xl">🚪</span><span>退勤</span>
          </a>
        </nav>
        <div className="mt-auto flex flex-col items-center gap-1">
          <div className="w-10 h-10 rounded-full bg-indigo-600 text-white flex items-center justify-center font-black">S</div>
        </div>
      </aside>

      {/* Main */}
      <div className="flex-1 overflow-y-auto pb-32">
        <div className="max-w-2xl mx-auto px-4 pt-8">
          <a href="/dashboard" className="inline-flex items-center gap-1 text-slate-500 hover:text-indigo-600 text-sm font-bold mb-6 transition-colors">
            ← {t('back')}
          </a>

          {/* Mode switcher */}
          <div className="bg-white/40 backdrop-blur-xl border border-white/60 rounded-3xl shadow-xl p-2 flex gap-2 mb-8">
            <a
              href="/exit_report?mode=previous"
              className={`flex-1 py-3 rounded-xl font-bold text-sm transition-all text-center ${!isCurrentMode ? 'bg-rose-500 text-white' : 'text-slate-600 hover:bg-white/40'}`}
            >
              📅 {t('previousMode')}
            </a>
            <a
              href="/exit_report?mode=current"
              className={`flex-1 py-3 rounded-xl font-bold text-sm transition-all text-center ${isCurrentMode ? 'bg-indigo-600 text-white' : 'text-slate-600 hover:bg-white/40'}`}
            >
              🚪 {t('currentMode')}
            </a>
          </div>

          {isCurrentMode ? (
            /* Today mode */
            <div className="space-y-6">
              <h1 className="text-2xl font-black text-slate-800">🚪 {t('title')}</h1>
              <div className="bg-white/40 backdrop-blur-xl border border-white/60 rounded-3xl shadow-xl p-6">
                <p className="text-sm text-slate-500">{t('loading')}</p>
              </div>
              <button
                type="button"
                onClick={() => console.log('TODO: POST /api/bff/timecards/clock_out')}
                className="w-full py-4 bg-slate-800 hover:bg-slate-900 text-white font-black text-lg rounded-2xl shadow-xl shadow-slate-300 transition-all"
              >
                提出 &amp; 退勤 🌙
              </button>
            </div>
          ) : (
            /* Previous day mode */
            <div className="space-y-6">
              <h1 className="text-2xl font-black text-slate-800">📅 {t('previousMode')}</h1>
              <div className="bg-rose-50 border border-rose-200 rounded-2xl p-4">
                <p className="text-sm text-rose-800 leading-relaxed font-medium">
                  昨夜未提出のまま強制ログアウトされました。本日中に提出してください。
                </p>
              </div>
              <div className="bg-white/40 backdrop-blur-xl border border-white/60 rounded-3xl shadow-xl p-6">
                <p className="text-sm text-slate-500">{t('loading')}</p>
              </div>
              <button
                type="button"
                onClick={() => console.log('TODO: POST /api/bff/messages')}
                className="w-full py-4 bg-rose-500 hover:bg-rose-600 text-white font-black text-lg rounded-2xl shadow-lg shadow-rose-200 transition-all"
              >
                📨 前日報告を提出
              </button>
            </div>
          )}
        </div>
      </div>

      {/* Language mini-footer */}
      <div className="fixed bottom-4 left-1/2 -translate-x-1/2 z-40">
        <button
          type="button"
          onClick={() => setLangModal(true)}
          className="bg-white/70 backdrop-blur-md border border-white/60 rounded-full px-4 py-2 text-xs font-bold text-slate-600 shadow hover:bg-white/90 transition-all"
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

export default function ExitReportPage() {
  return (
    <Suspense fallback={<div className="min-h-screen flex items-center justify-center" style={{ background: 'linear-gradient(135deg, #E0F2FE, #F3E8FF, #FCE7F3)' }}><p className="text-slate-500">読み込み中...</p></div>}>
      <ExitReportContent />
    </Suspense>
  );
}
