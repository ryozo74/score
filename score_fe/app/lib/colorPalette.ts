// Color palette for project/shot/task UI cards.
//
// Each project is assigned one of PROJECT_PALETTES based on a stable hash of its
// id (or fallback index). Children rendered under that project (shots, retakes,
// troubles) use the same family so the parent color is recognizable, with sub
// variants (soft/medium/strong) carrying enough contrast to remain distinct.
//
// Task type colors are independent (categorical), so a task's color reflects its
// type regardless of which project it lives under.
//
// All Tailwind class names below are written as complete static strings so the
// JIT compiler picks them up without a safelist.

export type ProjectPalette = {
  key: string;
  card: string;        // outer card bg + border (parent project card)
  sideBar: string;     // left accent bar on section headers
  badge: string;       // status-pill bg/text
  progressBar: string; // progress fill
  title: string;       // title accent text color
  childSoft: string;   // softest child variant (shots-like) bg+border
  childMed: string;    // medium child variant (retakes-like) bg+border
  childStrong: string; // strong child variant (troubles-like) bg+border
  childBadge: string;  // child status pill
  childIconBg: string; // small icon tile bg
};

export const PROJECT_PALETTES: ProjectPalette[] = [
  {
    key: 'indigo',
    card: 'bg-indigo-50/70 border-indigo-200',
    sideBar: 'bg-indigo-400',
    badge: 'bg-indigo-100 text-indigo-700',
    progressBar: 'bg-indigo-500',
    title: 'text-indigo-900',
    childSoft: 'bg-indigo-50/80 border-indigo-200',
    childMed: 'bg-indigo-100/80 border-indigo-300',
    childStrong: 'bg-indigo-200/80 border-indigo-400',
    childBadge: 'bg-indigo-100 text-indigo-700',
    childIconBg: 'bg-indigo-100',
  },
  {
    key: 'emerald',
    card: 'bg-emerald-50/70 border-emerald-200',
    sideBar: 'bg-emerald-400',
    badge: 'bg-emerald-100 text-emerald-700',
    progressBar: 'bg-emerald-500',
    title: 'text-emerald-900',
    childSoft: 'bg-emerald-50/80 border-emerald-200',
    childMed: 'bg-emerald-100/80 border-emerald-300',
    childStrong: 'bg-emerald-200/80 border-emerald-400',
    childBadge: 'bg-emerald-100 text-emerald-700',
    childIconBg: 'bg-emerald-100',
  },
  {
    key: 'amber',
    card: 'bg-amber-50/70 border-amber-200',
    sideBar: 'bg-amber-400',
    badge: 'bg-amber-100 text-amber-700',
    progressBar: 'bg-amber-500',
    title: 'text-amber-900',
    childSoft: 'bg-amber-50/80 border-amber-200',
    childMed: 'bg-amber-100/80 border-amber-300',
    childStrong: 'bg-amber-200/80 border-amber-400',
    childBadge: 'bg-amber-100 text-amber-700',
    childIconBg: 'bg-amber-100',
  },
  {
    key: 'rose',
    card: 'bg-rose-50/70 border-rose-200',
    sideBar: 'bg-rose-400',
    badge: 'bg-rose-100 text-rose-700',
    progressBar: 'bg-rose-500',
    title: 'text-rose-900',
    childSoft: 'bg-rose-50/80 border-rose-200',
    childMed: 'bg-rose-100/80 border-rose-300',
    childStrong: 'bg-rose-200/80 border-rose-400',
    childBadge: 'bg-rose-100 text-rose-700',
    childIconBg: 'bg-rose-100',
  },
  {
    key: 'cyan',
    card: 'bg-cyan-50/70 border-cyan-200',
    sideBar: 'bg-cyan-400',
    badge: 'bg-cyan-100 text-cyan-700',
    progressBar: 'bg-cyan-500',
    title: 'text-cyan-900',
    childSoft: 'bg-cyan-50/80 border-cyan-200',
    childMed: 'bg-cyan-100/80 border-cyan-300',
    childStrong: 'bg-cyan-200/80 border-cyan-400',
    childBadge: 'bg-cyan-100 text-cyan-700',
    childIconBg: 'bg-cyan-100',
  },
  {
    key: 'violet',
    card: 'bg-violet-50/70 border-violet-200',
    sideBar: 'bg-violet-400',
    badge: 'bg-violet-100 text-violet-700',
    progressBar: 'bg-violet-500',
    title: 'text-violet-900',
    childSoft: 'bg-violet-50/80 border-violet-200',
    childMed: 'bg-violet-100/80 border-violet-300',
    childStrong: 'bg-violet-200/80 border-violet-400',
    childBadge: 'bg-violet-100 text-violet-700',
    childIconBg: 'bg-violet-100',
  },
  {
    key: 'teal',
    card: 'bg-teal-50/70 border-teal-200',
    sideBar: 'bg-teal-400',
    badge: 'bg-teal-100 text-teal-700',
    progressBar: 'bg-teal-500',
    title: 'text-teal-900',
    childSoft: 'bg-teal-50/80 border-teal-200',
    childMed: 'bg-teal-100/80 border-teal-300',
    childStrong: 'bg-teal-200/80 border-teal-400',
    childBadge: 'bg-teal-100 text-teal-700',
    childIconBg: 'bg-teal-100',
  },
  {
    key: 'orange',
    card: 'bg-orange-50/70 border-orange-200',
    sideBar: 'bg-orange-400',
    badge: 'bg-orange-100 text-orange-700',
    progressBar: 'bg-orange-500',
    title: 'text-orange-900',
    childSoft: 'bg-orange-50/80 border-orange-200',
    childMed: 'bg-orange-100/80 border-orange-300',
    childStrong: 'bg-orange-200/80 border-orange-400',
    childBadge: 'bg-orange-100 text-orange-700',
    childIconBg: 'bg-orange-100',
  },
  {
    key: 'sky',
    card: 'bg-sky-50/70 border-sky-200',
    sideBar: 'bg-sky-400',
    badge: 'bg-sky-100 text-sky-700',
    progressBar: 'bg-sky-500',
    title: 'text-sky-900',
    childSoft: 'bg-sky-50/80 border-sky-200',
    childMed: 'bg-sky-100/80 border-sky-300',
    childStrong: 'bg-sky-200/80 border-sky-400',
    childBadge: 'bg-sky-100 text-sky-700',
    childIconBg: 'bg-sky-100',
  },
  {
    key: 'lime',
    card: 'bg-lime-50/70 border-lime-200',
    sideBar: 'bg-lime-400',
    badge: 'bg-lime-100 text-lime-700',
    progressBar: 'bg-lime-500',
    title: 'text-lime-900',
    childSoft: 'bg-lime-50/80 border-lime-200',
    childMed: 'bg-lime-100/80 border-lime-300',
    childStrong: 'bg-lime-200/80 border-lime-400',
    childBadge: 'bg-lime-100 text-lime-700',
    childIconBg: 'bg-lime-100',
  },
  {
    key: 'pink',
    card: 'bg-pink-50/70 border-pink-200',
    sideBar: 'bg-pink-400',
    badge: 'bg-pink-100 text-pink-700',
    progressBar: 'bg-pink-500',
    title: 'text-pink-900',
    childSoft: 'bg-pink-50/80 border-pink-200',
    childMed: 'bg-pink-100/80 border-pink-300',
    childStrong: 'bg-pink-200/80 border-pink-400',
    childBadge: 'bg-pink-100 text-pink-700',
    childIconBg: 'bg-pink-100',
  },
  {
    key: 'fuchsia',
    card: 'bg-fuchsia-50/70 border-fuchsia-200',
    sideBar: 'bg-fuchsia-400',
    badge: 'bg-fuchsia-100 text-fuchsia-700',
    progressBar: 'bg-fuchsia-500',
    title: 'text-fuchsia-900',
    childSoft: 'bg-fuchsia-50/80 border-fuchsia-200',
    childMed: 'bg-fuchsia-100/80 border-fuchsia-300',
    childStrong: 'bg-fuchsia-200/80 border-fuchsia-400',
    childBadge: 'bg-fuchsia-100 text-fuchsia-700',
    childIconBg: 'bg-fuchsia-100',
  },
];

function hashId(id: string | number | undefined | null): number {
  if (id === undefined || id === null || id === '') return 0;
  const s = String(id);
  let h = 0;
  for (let i = 0; i < s.length; i++) {
    h = (h * 31 + s.charCodeAt(i)) & 0x7fffffff;
  }
  return h;
}

export function getProjectPalette(id: string | number | undefined | null, fallbackIdx: number = 0): ProjectPalette {
  const h = id !== undefined && id !== null && id !== '' ? hashId(id) : fallbackIdx;
  return PROJECT_PALETTES[h % PROJECT_PALETTES.length];
}

// ---- Task type palette (categorical, project-independent) ----

export type TaskTypePalette = {
  key: string;
  card: string;     // task card outer bg+border
  iconBg: string;   // small icon tile
  typeBadge: string;
  bar: string;      // left accent strip (optional vertical bar)
  label: string;    // type label color
};

const TASK_TYPE_PALETTE_MAP: Record<string, TaskTypePalette> = {
  pm: {
    key: 'pm',
    card: 'bg-indigo-50/70 border-indigo-200',
    iconBg: 'bg-indigo-100',
    typeBadge: 'bg-indigo-100 text-indigo-700',
    bar: 'bg-indigo-400',
    label: 'text-indigo-800',
  },
  mgmt: {
    key: 'mgmt',
    card: 'bg-violet-50/70 border-violet-200',
    iconBg: 'bg-violet-100',
    typeBadge: 'bg-violet-100 text-violet-700',
    bar: 'bg-violet-400',
    label: 'text-violet-800',
  },
  delivery: {
    key: 'delivery',
    card: 'bg-emerald-50/70 border-emerald-200',
    iconBg: 'bg-emerald-100',
    typeBadge: 'bg-emerald-100 text-emerald-700',
    bar: 'bg-emerald-400',
    label: 'text-emerald-800',
  },
  review: {
    key: 'review',
    card: 'bg-amber-50/70 border-amber-200',
    iconBg: 'bg-amber-100',
    typeBadge: 'bg-amber-100 text-amber-700',
    bar: 'bg-amber-400',
    label: 'text-amber-800',
  },
  qc: {
    key: 'qc',
    card: 'bg-cyan-50/70 border-cyan-200',
    iconBg: 'bg-cyan-100',
    typeBadge: 'bg-cyan-100 text-cyan-700',
    bar: 'bg-cyan-400',
    label: 'text-cyan-800',
  },
  retake: {
    key: 'retake',
    card: 'bg-rose-50/70 border-rose-200',
    iconBg: 'bg-rose-100',
    typeBadge: 'bg-rose-100 text-rose-700',
    bar: 'bg-rose-400',
    label: 'text-rose-800',
  },
  reference: {
    key: 'reference',
    card: 'bg-teal-50/70 border-teal-200',
    iconBg: 'bg-teal-100',
    typeBadge: 'bg-teal-100 text-teal-700',
    bar: 'bg-teal-400',
    label: 'text-teal-800',
  },
  shooting: {
    key: 'shooting',
    card: 'bg-orange-50/70 border-orange-200',
    iconBg: 'bg-orange-100',
    typeBadge: 'bg-orange-100 text-orange-700',
    bar: 'bg-orange-400',
    label: 'text-orange-800',
  },
};

const DEFAULT_TASK_TYPE_PALETTE: TaskTypePalette = {
  key: 'other',
  card: 'bg-slate-50/70 border-slate-200',
  iconBg: 'bg-slate-100',
  typeBadge: 'bg-slate-200 text-slate-700',
  bar: 'bg-slate-400',
  label: 'text-slate-700',
};

export function getTaskTypePalette(type?: string | null): TaskTypePalette {
  if (!type) return DEFAULT_TASK_TYPE_PALETTE;
  const k = type.toLowerCase().trim();
  if (TASK_TYPE_PALETTE_MAP[k]) return TASK_TYPE_PALETTE_MAP[k];
  // common aliases
  if (k === 'management' || k === 'admin') return TASK_TYPE_PALETTE_MAP.mgmt;
  if (k === 'check' || k === 'qa') return TASK_TYPE_PALETTE_MAP.qc;
  return DEFAULT_TASK_TYPE_PALETTE;
}
