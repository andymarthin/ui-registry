import { useEffect, useRef, useState } from 'react';
import { Check, CreditCard, Download, FileText, Shield, Server, UserPlus, Users } from 'lucide-react';
import type { ActivityItem } from '../types';

export interface ActivityFeedCardProps {
  activities: ActivityItem[];
  onQuickAction?: (actionLabel: string) => void;
}

const CATEGORY_STYLES: Record<ActivityItem['category'], string> = {
  billing: 'bg-blue-50 text-blue-700 ring-blue-200/70',
  team: 'bg-violet-50 text-violet-700 ring-violet-200/70',
  system: 'bg-slate-100 text-slate-600 ring-slate-200',
  security: 'bg-amber-50 text-amber-700 ring-amber-200/70',
};

const CATEGORY_ICONS = {
  billing: CreditCard,
  team: Users,
  system: Server,
  security: Shield,
} as const;

const QUICK_ACTIONS = [
  { label: 'Export CSV', icon: Download },
  { label: 'Create Invoice', icon: FileText },
  { label: 'Invite Member', icon: UserPlus },
  { label: 'Audit Log', icon: Shield },
] as const;

export function ActivityFeedCard({ activities, onQuickAction }: ActivityFeedCardProps) {
  const [doneLabel, setDoneLabel] = useState<string | null>(null);
  const timer = useRef<ReturnType<typeof setTimeout> | null>(null);

  useEffect(
    () => () => {
      if (timer.current) clearTimeout(timer.current);
    },
    [],
  );

  const handleAction = (label: string) => {
    onQuickAction?.(label);
    setDoneLabel(label);
    if (timer.current) clearTimeout(timer.current);
    timer.current = setTimeout(() => setDoneLabel(null), 1600);
  };

  return (
    <section
      data-inspect-label="ActivityFeedCard"
      aria-label="Recent activity"
      className="flex min-w-0 flex-col rounded-xl border border-slate-200/90 bg-white shadow-xs"
    >
      <div className="flex items-center justify-between gap-3 border-b border-slate-200/90 px-5 py-4">
        <h2 className="text-base font-semibold text-slate-900">Recent Activity</h2>
        <span className="rounded-full bg-slate-100 px-2 py-0.5 text-xs font-medium text-slate-600 tabular-nums">
          {activities.length}
        </span>
      </div>

      {activities.length === 0 ? (
        <p className="px-5 py-8 text-center text-sm text-slate-500">No recent activity.</p>
      ) : (
        <ol className="max-h-96 divide-y divide-slate-100 overflow-y-auto px-5">
          {activities.map((item) => {
            const CatIcon = CATEGORY_ICONS[item.category];
            return (
              <li key={item.id} className="flex min-w-0 items-start gap-3 py-3.5">
                <span
                  className="flex size-9 shrink-0 items-center justify-center rounded-full bg-blue-50 text-xs font-semibold text-blue-700 ring-1 ring-blue-200/70"
                  aria-hidden="true"
                >
                  {item.actorInitials}
                </span>
                <div className="min-w-0 flex-1">
                  <p className="text-sm leading-snug text-slate-500">
                    <span className="font-semibold text-slate-900">{item.actor}</span> {item.action}{' '}
                    <span className="font-medium text-slate-900">{item.target}</span>
                  </p>
                  <div className="mt-1.5 flex flex-wrap items-center gap-2">
                    <span
                      className={`inline-flex items-center gap-1 rounded-full px-2 py-0.5 text-[11px] font-medium capitalize ring-1 ${CATEGORY_STYLES[item.category]}`}
                    >
                      <CatIcon className="size-3" aria-hidden="true" />
                      {item.category}
                    </span>
                    <span className="text-xs text-slate-400">{item.timeAgo}</span>
                  </div>
                </div>
              </li>
            );
          })}
        </ol>
      )}

      <div className="mt-auto border-t border-slate-200/90 p-5">
        <h3 className="text-xs font-semibold uppercase tracking-wide text-slate-500">
          Quick Actions
        </h3>
        <div className="mt-3 grid grid-cols-2 gap-2.5">
          {QUICK_ACTIONS.map(({ label, icon: Icon }) => {
            const done = doneLabel === label;
            return (
              <button
                key={label}
                type="button"
                onClick={() => handleAction(label)}
                className={`flex min-w-0 items-center justify-center gap-2 rounded-lg border px-3 py-2.5 text-sm font-medium transition-colors focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-blue-500 ${
                  done
                    ? 'border-emerald-200 bg-emerald-50 text-emerald-700'
                    : 'border-slate-200/90 bg-white text-slate-700 hover:border-blue-200 hover:bg-blue-50 hover:text-blue-700'
                }`}
              >
                {done ? (
                  <Check className="size-4 shrink-0" aria-hidden="true" />
                ) : (
                  <Icon className="size-4 shrink-0" aria-hidden="true" />
                )}
                <span className="truncate" aria-live="polite">
                  {done ? 'Done' : label}
                </span>
              </button>
            );
          })}
        </div>
      </div>
    </section>
  );
}
