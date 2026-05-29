import { getTranslations } from 'next-intl/server';

export const dynamic = 'force-dynamic';

export default async function IndexPage() {
  const t = await getTranslations('index');

  const storyFlowItems = [
    { href: '/index', label: '章ハブ', active: true },
    { href: '/login', label: 'ログイン' },
    { href: '/routine', label: '朝ルーティン' },
    { href: '/exit_report?mode=previous', label: '前日退勤報告' },
    { href: '/dashboard', label: 'ダッシュボード' },
    { href: '/shot/1', label: 'SHOT詳細' },
  ];

  const chapters = [
    {
      href: '/login',
      emoji: '☀️',
      labelColor: 'text-indigo-600',
      label: t('chapters.prologue.label'),
      title: t('chapters.prologue.title'),
      desc: t('chapters.prologue.desc'),
      accentColor: 'text-indigo-600',
      colSpan: '',
    },
    {
      href: '/routine',
      emoji: '🌅',
      labelColor: 'text-indigo-600',
      label: t('chapters.act1.label'),
      title: t('chapters.act1.title'),
      desc: t('chapters.act1.desc'),
      accentColor: 'text-indigo-600',
      colSpan: '',
    },
    {
      href: '/exit_report?mode=previous',
      emoji: '📅',
      labelColor: 'text-rose-500',
      label: t('chapters.act2.label'),
      title: t('chapters.act2.title'),
      desc: t('chapters.act2.desc'),
      accentColor: 'text-rose-500',
      colSpan: '',
    },
    {
      href: '/dashboard',
      emoji: '📋',
      labelColor: 'text-indigo-600',
      label: t('chapters.act3.label'),
      title: t('chapters.act3.title'),
      desc: t('chapters.act3.desc'),
      accentColor: 'text-indigo-600',
      colSpan: '',
    },
    {
      href: '/shot/1',
      emoji: '🎬',
      labelColor: 'text-indigo-600',
      label: t('chapters.act4.label'),
      title: t('chapters.act4.title'),
      desc: t('chapters.act4.desc'),
      accentColor: 'text-indigo-600',
      colSpan: 'md:col-span-2',
    },
  ];

  return (
    <div
      className="min-h-screen font-sans text-slate-800 p-8"
      style={{ background: 'linear-gradient(135deg,#E0F2FE,#F3E8FF,#FCE7F3)' }}
    >
      <div className="max-w-4xl mx-auto">
        {/* Header */}
        <div className="text-center mb-10">
          <div className="inline-flex items-center gap-3 mb-4">
            <span className="text-5xl font-black bg-gradient-to-br from-indigo-600 to-violet-600 bg-clip-text text-transparent">
              S.
            </span>
            <h1 className="text-3xl font-black text-slate-800">Score — {t('title')}</h1>
          </div>
          <p className="text-slate-500 text-lg">{t('subtitle')}</p>
        </div>

        {/* Story Flow */}
        <div className="bg-white/40 backdrop-blur-xl border border-white/60 rounded-3xl shadow-xl p-6 mb-8">
          <h2 className="text-xs font-black text-indigo-600 uppercase tracking-widest mb-4 text-center">
            {t('storyFlow')}
          </h2>
          <div className="flex flex-wrap items-center justify-center gap-2 text-sm font-bold text-slate-600">
            {storyFlowItems.map((item, i) => (
              <span key={item.href} className="inline-flex items-center gap-2">
                {i > 0 && <span className="text-slate-300">→</span>}
                <a
                  href={item.href}
                  className={
                    item.active
                      ? 'bg-indigo-600 text-white px-3 py-1.5 rounded-xl'
                      : 'bg-white/70 border border-white/80 px-3 py-1.5 rounded-xl hover:bg-white transition-all'
                  }
                >
                  {item.label}
                </a>
              </span>
            ))}
          </div>
        </div>

        {/* Chapter Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          {chapters.map((ch) => (
            <a
              key={ch.href}
              href={ch.href}
              className={`block bg-white/40 backdrop-blur-xl border border-white/60 rounded-3xl shadow-xl p-6 hover:shadow-2xl hover:-translate-y-1 transition-all duration-200 ${ch.colSpan}`}
            >
              <div className="text-3xl mb-3">{ch.emoji}</div>
              <div className={`text-xs font-bold ${ch.labelColor} uppercase tracking-widest mb-1`}>
                {ch.label}
              </div>
              <h2 className="text-xl font-black text-slate-800 mb-2">{ch.title}</h2>
              <p className="text-sm text-slate-500 leading-relaxed">{ch.desc}</p>
              <div className={`mt-4 ${ch.accentColor} font-bold text-sm`}>開く →</div>
            </a>
          ))}
        </div>

        {/* Full Story CTA */}
        <div className="mt-8">
          <a
            href="/login"
            className="block bg-gradient-to-br from-indigo-500 to-violet-600 border border-indigo-400/40 rounded-3xl shadow-xl p-6 hover:shadow-2xl hover:-translate-y-1 transition-all duration-200 text-center"
          >
            <div className="text-3xl mb-2">🎬</div>
            <h2 className="text-xl font-black text-white mb-1">{t('fullStory.title')}</h2>
            <p className="text-sm text-indigo-100">{t('fullStory.desc')}</p>
            <div className="mt-3 text-white font-bold text-sm">{t('fullStory.cta')} →</div>
          </a>
        </div>
      </div>
    </div>
  );
}
