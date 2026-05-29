'use client';

import { useTranslations } from 'next-intl';
import { useState } from 'react';

export const dynamic = 'force-dynamic';

export default function GoodbyePage() {
  const t = useTranslations('goodbye');
  const [langModal, setLangModal] = useState(false);

  return (
    <div
      className="min-h-screen flex items-center justify-center p-6 font-sans text-slate-800"
      style={{ background: 'linear-gradient(135deg, #E0F2FE, #F3E8FF, #FCE7F3)' }}
    >
      <div className="bg-white/40 backdrop-blur-xl border border-white/60 rounded-3xl shadow-xl p-10 max-w-lg w-full">
        <div className="text-6xl text-center mb-4">🌙</div>

        <h1 className="text-3xl font-black text-slate-800 text-center mb-2">{t('title')}</h1>

        <p className="text-slate-500 text-center text-sm mb-8">{t('message')}</p>

        <div className="space-y-3">
          <a
            href="/login"
            className="block bg-indigo-600 text-white text-center font-semibold rounded-2xl px-6 py-3 hover:bg-indigo-700 transition-colors"
          >
            ↩️ {t('back')}
          </a>
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
