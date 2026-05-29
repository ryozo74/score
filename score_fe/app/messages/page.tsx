'use client';

import { useTranslations } from 'next-intl';
import { useState } from 'react';

export const dynamic = 'force-dynamic';

export default function MessagesPage() {
  const t = useTranslations('messages');
  const [langModal, setLangModal] = useState(false);

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
          <a href="/messages" className="flex flex-col items-center gap-0.5 py-2.5 w-full rounded-2xl bg-indigo-100 text-indigo-600 font-bold text-xs transition-all">
            <span className="text-xl">💬</span><span>Messages</span>
          </a>
          <a href="#" className="flex flex-col items-center gap-0.5 py-2.5 w-full rounded-2xl text-slate-500 hover:bg-white/40 text-xs transition-all">
            <span className="text-xl">🔔</span><span className="text-[8px]">通知</span>
          </a>
          <a href="/exit_report" className="flex flex-col items-center gap-0.5 py-2.5 w-full rounded-2xl text-slate-500 hover:bg-white/40 text-xs transition-all">
            <span className="text-xl">🚪</span><span>退勤</span>
          </a>
        </nav>
        <div className="mt-auto flex flex-col items-center gap-1">
          <div className="w-10 h-10 rounded-full bg-indigo-600 text-white flex items-center justify-center font-black">S</div>
        </div>
      </aside>

      {/* Main */}
      <div className="flex-1 overflow-y-auto">
        <div className="max-w-3xl mx-auto px-6 pt-8 pb-32">
          <a href="/dashboard" className="inline-flex items-center gap-1 text-slate-500 hover:text-indigo-600 text-sm font-bold mb-6 transition-colors">
            ← {t('back')}
          </a>

          <div className="flex items-center gap-3 mb-8">
            <h1 className="text-2xl font-black text-slate-800">💬 {t('title')}</h1>
          </div>

          <div className="bg-white/40 backdrop-blur-xl border border-white/60 rounded-3xl shadow-xl p-8">
            <p className="text-center text-slate-400 text-sm">{t('loading')}</p>
          </div>

          <div className="mt-6 bg-white/40 backdrop-blur-xl border border-white/60 rounded-3xl shadow-xl p-8">
            <p className="text-center text-slate-400 text-sm">{t('empty')}</p>
          </div>

          {/* Navigation to exit report */}
          <div className="mt-8 flex justify-end">
            <a
              href="/exit_report?mode=current"
              className="bg-indigo-600 hover:bg-indigo-700 text-white text-sm font-bold rounded-xl px-4 py-2 transition-all"
            >
              🚪 退勤報告へ
            </a>
          </div>
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
