'use client';

import { useTranslations } from 'next-intl';
import { useEffect, useState } from 'react';
import { useParams, useRouter } from 'next/navigation';
import { getTaskTypePalette } from '@/app/lib/colorPalette';

interface Task {
  task_id?: number;
  id?: number;
  shot_id?: number;
  type?: string;
  status?: string;
  assigned_to?: string;
  due_date?: string;
  updated_at?: string;
  name?: string;
  description?: string;
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

function statusBg(status?: string): string {
  if (status === 'retake') return 'bg-rose-500';
  if (status === 'approved') return 'bg-emerald-500';
  if (status === 'done') return 'bg-emerald-500';
  if (status === 'in_progress') return 'bg-indigo-500';
  return 'bg-amber-500';
}

export default function ShotDetailPage() {
  const t = useTranslations();
  const params = useParams();
  const router = useRouter();
  const shotId = params?.id as string;

  const [tasks, setTasks] = useState<Task[]>([]);
  const [tasksError, setTasksError] = useState('');
  const [loading, setLoading] = useState(true);

  const nowJST = new Date().toLocaleString('ja-JP', { timeZone: 'Asia/Tokyo' });

  useEffect(() => {
    if (!shotId) return;

    const token = getToken();
    if (!token) {
      router.replace('/login');
      return;
    }
    const headers: Record<string, string> = {
      'Content-Type': 'application/json',
    };
    if (token) headers['Authorization'] = `Bearer ${token}`;

    fetch(`/api/bff/shots/${shotId}/tasks`, { headers })
      .then(async (res) => {
        if (!res.ok) throw new Error(`${res.status}`);
        return res.json();
      })
      .then((data: Task[]) => {
        setTasks(data);
        setLoading(false);
      })
      .catch((err) => {
        setTasksError(`タスク一覧を取得できませんでした (${err.message})`);
        setLoading(false);
      });
  }, [shotId, router]);

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
            className="flex flex-col items-center gap-0.5 py-2.5 w-full rounded-2xl text-slate-500 hover:bg-white/40 text-xs transition-all"
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
        </nav>
      </aside>

      {/* Main content */}
      <main className="flex-1 flex flex-col relative overflow-hidden">
        {/* Header */}
        <div className="px-8 pt-6 pb-2">
          <h1 className="text-2xl font-black text-slate-800">
            🎬 {t('shot.detail.title')}
          </h1>
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
          <span className="text-indigo-600 font-bold">{t('shot.detail.title')}</span>
          {shotId && (
            <>
              <span className="mx-1">›</span>
              <span className="text-slate-600 font-bold" translate="no">#{shotId}</span>
            </>
          )}
        </nav>

        {/* Scrollable content */}
        <div className="flex-1 overflow-y-auto p-10 space-y-8">

          {/* Back link */}
          <a
            href="/dashboard"
            className="inline-flex items-center gap-2 text-sm font-bold text-indigo-600 hover:text-indigo-800 transition-colors"
          >
            ← {t('shot.detail.back')}
          </a>

          {/* SHOT ID header */}
          <div className="bg-white/40 backdrop-blur-xl border border-white/60 rounded-3xl shadow-xl p-6">
            <div className="flex items-center gap-4">
              <div className="w-16 h-16 rounded-2xl bg-indigo-100 flex items-center justify-center text-3xl shrink-0">
                🎬
              </div>
              <div>
                <p className="text-xs text-slate-400 uppercase tracking-widest">SHOT ID</p>
                <h2 className="text-2xl font-black text-slate-800" translate="no">#{shotId}</h2>
              </div>
            </div>
          </div>

          {/* Tasks section */}
          <section>
            <h2 className="text-lg font-black text-slate-800 mb-5 flex items-center gap-2">
              <span className="w-2 h-6 bg-indigo-400 rounded-full inline-block" />
              📋 {t('shot.detail.tasks')}
            </h2>

            {tasksError && (
              <div className="bg-white/40 backdrop-blur-md border border-rose-200 rounded-2xl p-4 text-rose-600 text-sm mb-4">
                🚨 {tasksError}
              </div>
            )}

            {loading && !tasksError && (
              <div className="bg-white/40 backdrop-blur-md border border-white/60 rounded-3xl p-6 text-slate-400 text-sm">
                {t('shot.detail.loading')}
              </div>
            )}

            {!loading && !tasksError && tasks.length === 0 && (
              <div className="bg-white/40 backdrop-blur-md border border-white/60 rounded-3xl p-6 text-slate-400 text-sm">
                {t('shot.detail.no_tasks')}
              </div>
            )}

            <div className="space-y-4">
              {tasks.map((task) => {
                const taskId = task.task_id ?? task.id;
                const typePalette = getTaskTypePalette(task.type);
                return (
                  <div
                    key={taskId ?? task.name}
                    className={`${typePalette.card} backdrop-blur-md border-2 rounded-3xl shadow-xl p-5 flex flex-col gap-2 relative overflow-hidden`}
                  >
                    <span className={`absolute left-0 top-0 bottom-0 w-1.5 ${typePalette.bar}`} aria-hidden />
                    <div className="flex items-center justify-between gap-4 pl-2">
                      <div className="flex items-center gap-3">
                        <div className={`w-10 h-10 rounded-xl ${typePalette.iconBg} flex items-center justify-center text-xl shrink-0`}>
                          🎯
                        </div>
                        <div>
                          <p className="text-xs text-slate-500 uppercase tracking-widest" translate="no">
                            Task #{taskId}
                          </p>
                          {task.type && (
                            <span className={`inline-block mt-1 px-2 py-0.5 ${typePalette.typeBadge} text-[10px] font-black rounded-full uppercase tracking-wider`} translate="no">
                              {task.type}
                            </span>
                          )}
                          {task.name && (
                            <p className={`text-sm font-bold ${typePalette.label} mt-1`}>{task.name}</p>
                          )}
                        </div>
                      </div>
                      {task.status && (
                        <span
                          className={`px-3 py-1 ${statusBg(task.status)} text-white text-xs font-black rounded-full uppercase shrink-0`}
                          translate="no"
                        >
                          {task.status}
                        </span>
                      )}
                    </div>

                    {task.description && (
                      <p className="text-xs text-slate-500 pl-13">{task.description}</p>
                    )}

                    <div className="flex flex-wrap gap-4 text-xs text-slate-400 pl-1">
                      {task.assigned_to && (
                        <span>
                          👤 <span translate="no">{task.assigned_to}</span>
                        </span>
                      )}
                      {task.due_date && (
                        <span>📅 {toJST(task.due_date)} JST</span>
                      )}
                      {task.updated_at && (
                        <span>🔄 {toJST(task.updated_at)} JST</span>
                      )}
                    </div>
                  </div>
                );
              })}
            </div>
          </section>
        </div>
      </main>
    </div>
  );
}
