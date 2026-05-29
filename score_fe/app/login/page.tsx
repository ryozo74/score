'use client';

import { useTranslations } from 'next-intl';
import { useState } from 'react';
import { useRouter } from 'next/navigation';

export const dynamic = 'force-dynamic';

export default function LoginPage() {
  const t = useTranslations();
  const router = useRouter();
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);
  const [langModal, setLangModal] = useState(false);

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setError('');
    setLoading(true);
    try {
      // Phase1 仮実装: 認証EP未実装のためlocalStorageにプレースホルダトークンを保存
      // Phase2以降で GET /login (score_be) または実認証EPと連携予定
      if (email && password) {
        const placeholder = `phase1_token_${btoa(email)}_${Date.now()}`;
        localStorage.setItem('score_token', placeholder);
        document.cookie = `score_token=${placeholder}; path=/; max-age=86400; SameSite=Lax`;
        router.push('/dashboard');
      } else {
        setError(t('login.error'));
      }
    } catch {
      setError(t('login.error'));
    } finally {
      setLoading(false);
    }
  }

  return (
    <div
      className="min-h-screen font-sans text-slate-800"
      style={{ background: 'linear-gradient(135deg,#E0F2FE,#F3E8FF,#FCE7F3)' }}
    >
      {/* Background blurred dashboard silhouette */}
      <div className="fixed inset-0 z-0 opacity-30 grayscale pointer-events-none p-10">
        <div className="h-16 bg-white/50 rounded-2xl mb-6" />
        <div className="grid grid-cols-3 gap-6 h-96">
          <div className="col-span-2 bg-white/50 rounded-3xl" />
          <div className="bg-white/50 rounded-3xl" />
        </div>
      </div>

      {/* Login overlay */}
      <div
        className="fixed inset-0 z-10 flex flex-col items-center justify-center p-4"
        style={{ backdropFilter: 'blur(2px)' }}
      >
        <div className="w-full max-w-md bg-white/40 backdrop-blur-xl border border-white/60 rounded-3xl shadow-xl p-10">

          {/* Logo */}
          <div className="text-center mb-8">
            <img
              src="/splash.png"
              alt="Score"
              className="mx-auto mb-3 h-24 w-auto select-none"
              draggable={false}
            />
            <h1 className="text-2xl font-black text-slate-800">
              <span translate="no">Score</span> にログイン
            </h1>
          </div>

          {/* Error */}
          {error && (
            <div className="mb-4 p-3 bg-rose-50 border border-rose-200 rounded-xl text-rose-600 text-sm font-medium">
              {error}
            </div>
          )}

          {/* Login Form */}
          <form onSubmit={handleSubmit}>
            <div className="mb-4">
              <label className="block text-xs font-bold text-slate-500 mb-1 uppercase tracking-widest">
                {t('login.email')}
              </label>
              <input
                type="email"
                name="username"
                placeholder="sato@studio.jp"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                required
                className="w-full bg-white/70 border border-white/80 rounded-xl px-4 py-3 text-slate-800 placeholder-slate-400 outline-none focus:ring-2 focus:ring-indigo-400 transition"
              />
            </div>

            <div className="mb-6">
              <label className="block text-xs font-bold text-slate-500 mb-1 uppercase tracking-widest">
                {t('login.password')}
              </label>
              <input
                type="password"
                name="password"
                placeholder="••••••••"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                required
                className="w-full bg-white/70 border border-white/80 rounded-xl px-4 py-3 text-slate-800 placeholder-slate-400 outline-none focus:ring-2 focus:ring-indigo-400 transition"
              />
            </div>

            <button
              type="submit"
              disabled={loading}
              className="w-full py-3 bg-indigo-600 hover:bg-indigo-700 disabled:opacity-60 text-white font-bold rounded-xl shadow-lg shadow-indigo-200 transition-all text-lg mb-6"
            >
              {loading ? '...' : t('login.submit')}
            </button>
          </form>

          {/* Divider */}
          <div className="flex items-center gap-3 mb-6">
            <div className="flex-1 h-px bg-slate-200" />
            <span className="text-sm text-slate-400 font-medium">{t('login.or')}</span>
            <div className="flex-1 h-px bg-slate-200" />
          </div>

          {/* Google SSO (Phase4 予定) */}
          <button
            type="button"
            className="w-full py-3 bg-white border border-slate-300 hover:bg-slate-50 text-slate-700 font-bold rounded-xl transition-all flex items-center justify-center gap-2 mb-6"
          >
            🔵 <span translate="no">Google</span> アカウントで続ける
          </button>

          {/* Footer */}
          <p className="text-center text-sm text-slate-400">
            管理者（<span translate="no">PM</span>）の方は →{' '}
            <a href="#" className="text-indigo-600 hover:underline font-medium">
              <span translate="no">Calendar</span> アプリ
            </a>
            （フル権限）<br />
            <span className="text-xs text-slate-400">
              ※ その他のロールは <span translate="no">Score</span> 経由で自分の予定のみ閲覧
            </span>
          </p>
        </div>

        {/* Next scene link */}
        <div className="mt-6">
          <a
            href="/routine"
            className="inline-block bg-white/40 backdrop-blur-xl border border-white/60 rounded-2xl shadow px-6 py-3 text-slate-700 font-bold hover:bg-white/60 transition-all"
          >
            次の場面へ →
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
          className="fixed inset-0 bg-black/30 backdrop-blur-sm flex items-center justify-center z-50"
          onClick={() => setLangModal(false)}
        >
          <div
            className="bg-white/90 backdrop-blur-xl border border-white/60 rounded-3xl shadow-2xl p-8 max-w-sm w-full mx-4 flex flex-col gap-4"
            onClick={(e) => e.stopPropagation()}
          >
            <h3 className="font-black text-slate-800 text-lg text-center">🌐 言語を選択</h3>
            <button className="w-full py-3 bg-white border border-slate-200 rounded-2xl font-bold text-slate-700 hover:bg-slate-50 transition-all">
              繁體中文
            </button>
            <button className="w-full py-3 bg-indigo-600 text-white rounded-2xl font-bold transition-all">
              日本語（現在）
            </button>
            <button className="w-full py-3 bg-white border border-slate-200 rounded-2xl font-bold text-slate-700 hover:bg-slate-50 transition-all">
              English
            </button>
            <p className="text-center text-xs text-slate-400">段階的に拡張中</p>
            <button
              onClick={() => setLangModal(false)}
              className="w-full py-2.5 bg-slate-100 hover:bg-slate-200 text-slate-600 font-bold rounded-2xl transition-all"
            >
              閉じる
            </button>
          </div>
        </div>
      )}
    </div>
  );
}
