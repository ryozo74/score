'use client';

import { useTranslations } from 'next-intl';
import { useState } from 'react';

export const dynamic = 'force-dynamic';

export default function RoutinePage() {
  const t = useTranslations('routine');
  const [langModal, setLangModal] = useState(false);

  return (
    <div
      className="min-h-screen flex items-center justify-center p-4 font-sans text-slate-800"
      style={{ background: 'linear-gradient(135deg, #E0F2FE, #F3E8FF, #FCE7F3)' }}
    >
      {/* Background blur */}
      <div className="fixed inset-0 z-0 opacity-40 grayscale pointer-events-none p-10">
        <div className="h-20 bg-white/50 rounded-2xl mb-8" />
        <div className="grid grid-cols-3 gap-8 h-[500px]">
          <div className="col-span-2 bg-white/50 rounded-3xl" />
          <div className="bg-white/50 rounded-3xl" />
        </div>
      </div>

      {/* Overlay */}
      <div
        className="fixed inset-0 z-10 flex flex-col items-center justify-center p-4"
        style={{
          backgroundColor: 'rgba(238, 242, 255, 0.6)',
          backdropFilter: 'blur(25px)',
          WebkitBackdropFilter: 'blur(25px)',
        }}
      >
        <div
          className="w-full max-w-2xl rounded-[2rem] overflow-hidden relative"
          style={{
            backgroundColor: 'rgba(255, 255, 255, 0.7)',
            border: '1px solid rgba(255, 255, 255, 0.9)',
            boxShadow: '0 20px 40px -10px rgba(99, 102, 241, 0.2)',
          }}
        >
          <div className="p-8 md:p-12">
            <div className="text-center mb-8">
              <div className="text-5xl mb-4">☀️</div>
              <h1 className="text-3xl font-black text-slate-800 mb-2">{t('title')}</h1>
              <p className="text-slate-500 font-medium text-lg">{t('description')}</p>
            </div>

            <div className="bg-white/60 rounded-2xl p-6 border border-white mb-8">
              <p className="text-center text-slate-500 text-sm">{t('loading')}</p>
            </div>

            <a
              href="/dashboard"
              className="block w-full py-4 bg-indigo-600 hover:bg-indigo-700 text-white rounded-xl font-bold shadow-lg shadow-indigo-200 transition-all text-lg text-center"
            >
              ← {t('back')}
            </a>
          </div>
        </div>
      </div>

      {/* Language mini-footer */}
      <div className="fixed bottom-4 right-4 z-40">
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
