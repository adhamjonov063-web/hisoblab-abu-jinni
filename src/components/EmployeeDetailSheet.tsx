import React from 'react';
import {
  Calendar,
  Mail,
  Pencil,
  Phone,
  Trash2,
  X,
} from 'lucide-react';
import { formatMoney, formatNumber } from '../data/datasets';
import { CurrencyCode, Employee } from '../types/analytics';
import { TrendChart } from './Charts';

interface EmployeeDetailSheetProps {
  employee: Employee | null;
  currency: CurrencyCode;
  onClose: () => void;
  onEdit: (emp: Employee) => void;
  onDelete: (id: string) => void;
}

export const EmployeeDetailSheet: React.FC<EmployeeDetailSheetProps> = ({
  employee,
  currency,
  onClose,
  onEdit,
  onDelete,
}) => {
  if (!employee) return null;

  return (
    <div
      className="fixed inset-0 z-50 flex items-end justify-center bg-slate-950/50 backdrop-blur-xs lg:items-stretch lg:justify-end"
      role="dialog"
      aria-modal="true"
      aria-label={employee.fullName}
    >
      <div className="absolute inset-0" onClick={onClose} />

      <div className="relative z-10 flex max-h-[92vh] w-full flex-col rounded-t-3xl bg-white shadow-2xl dark:bg-slate-900 lg:h-full lg:max-h-full lg:max-w-xl lg:rounded-none lg:rounded-l-2xl">
        {/* Grab handle */}
        <div className="flex justify-center pt-3 pb-1 lg:hidden">
          <div className="h-1.5 w-10 rounded-full bg-slate-300 dark:bg-slate-700" />
        </div>

        {/* Header */}
        <div className="flex items-start justify-between gap-4 border-b border-slate-100 px-5 py-4 dark:border-slate-800">
          <div className="min-w-0">
            <div className="flex flex-wrap items-center gap-2 text-xs text-slate-500 dark:text-slate-400">
              <span>{employee.department}</span>
              <span aria-hidden="true">·</span>
              <span>{employee.region}</span>
              <span aria-hidden="true">·</span>
              <span>{employee.status}</span>
            </div>
            <h2 className="mt-1 text-lg font-bold text-slate-900 dark:text-slate-100">
              {employee.fullName}
            </h2>
            <p className="text-xs font-medium text-slate-600 dark:text-slate-400">
              {employee.role}
            </p>
          </div>

          <button
            type="button"
            onClick={onClose}
            aria-label="Yopish"
            className="flex min-h-[44px] min-w-[44px] shrink-0 items-center justify-center rounded-xl text-slate-500 hover:bg-slate-100 dark:text-slate-400 dark:hover:bg-slate-800"
          >
            <X className="h-5 w-5" />
          </button>
        </div>

        {/* Scrollable Content */}
        <div className="flex-1 space-y-5 overflow-y-auto px-5 py-5">
          {/* 3 Metric Summary Strip */}
          <div className="grid grid-cols-3 gap-2.5">
            <div className="rounded-xl border border-slate-200/80 bg-slate-50/70 p-3 dark:border-slate-800 dark:bg-slate-800/50">
              <p className="text-[11px] font-medium text-slate-500 dark:text-slate-400">
                Keltirgan tushum
              </p>
              <p className="mt-1 font-mono text-sm font-bold text-slate-900 tabular-nums dark:text-slate-100">
                {formatMoney(employee.revenueGenerated, currency, true)}
              </p>
            </div>
            <div className="rounded-xl border border-slate-200/80 bg-slate-50/70 p-3 dark:border-slate-800 dark:bg-slate-800/50">
              <p className="text-[11px] font-medium text-slate-500 dark:text-slate-400">
                Reja bajarilishi
              </p>
              <p
                className={`mt-1 font-mono text-sm font-bold tabular-nums ${
                  employee.targetCompletionPct >= 100
                    ? 'text-emerald-700 dark:text-emerald-400'
                    : 'text-amber-700 dark:text-amber-400'
                }`}
              >
                {employee.targetCompletionPct}%
              </p>
            </div>
            <div className="rounded-xl border border-slate-200/80 bg-slate-50/70 p-3 dark:border-slate-800 dark:bg-slate-800/50">
              <p className="text-[11px] font-medium text-slate-500 dark:text-slate-400">
                Oylik maosh
              </p>
              <p className="mt-1 font-mono text-sm font-bold text-slate-900 tabular-nums dark:text-slate-100">
                {formatMoney(employee.monthlySalary, currency, true)}
              </p>
            </div>
          </div>

          {/* Performance Trend Chart */}
          <div className="rounded-xl border border-slate-200/80 p-4 dark:border-slate-800">
            <div className="mb-3 flex items-baseline justify-between">
              <h3 className="text-sm font-semibold text-slate-900 dark:text-slate-100">
                Oylik ko‘rsatkichlar (mln so‘m)
              </h3>
              <span className="font-mono text-xs text-slate-500 tabular-nums dark:text-slate-400">
                {formatNumber(employee.completedTasks)} ta vazifa
              </span>
            </div>
            <TrendChart
              data={employee.monthlyPerformance.map((m) => ({
                label: m.label,
                primary: m.value,
                secondary: m.target,
              }))}
              mode="bar"
              showSecondary
              primaryLabel="Natija"
              secondaryLabel="Reja"
              formatValue={(v) => `${formatNumber(v)} mln`}
              height={175}
            />
          </div>

          {/* Contact & Work Details */}
          <div className="rounded-xl border border-slate-200/80 divide-y divide-slate-100 dark:border-slate-800 dark:divide-slate-800">
            <div className="flex items-center justify-between gap-3 px-4 py-3 text-sm">
              <span className="flex items-center gap-2 text-slate-500 dark:text-slate-400">
                <Phone className="h-4 w-4" /> Telefon
              </span>
              <span className="font-mono text-xs font-medium text-slate-900 dark:text-slate-100">
                {employee.phone}
              </span>
            </div>
            <div className="flex items-center justify-between gap-3 px-4 py-3 text-sm">
              <span className="flex items-center gap-2 text-slate-500 dark:text-slate-400">
                <Mail className="h-4 w-4" /> Elektron pochta
              </span>
              <span className="text-xs font-medium text-slate-900 dark:text-slate-100">
                {employee.email}
              </span>
            </div>
            <div className="flex items-center justify-between gap-3 px-4 py-3 text-sm">
              <span className="flex items-center gap-2 text-slate-500 dark:text-slate-400">
                <Calendar className="h-4 w-4" /> Ishga kirgan sana
              </span>
              <span className="text-xs font-medium text-slate-900 dark:text-slate-100">
                {employee.joinedAt}
              </span>
            </div>
          </div>
        </div>

        {/* Sticky Footer */}
        <div className="flex items-center gap-2.5 border-t border-slate-100 bg-white px-5 py-3.5 pb-safe dark:border-slate-800 dark:bg-slate-900">
          <button
            type="button"
            onClick={() => onEdit(employee)}
            className="inline-flex min-h-[44px] flex-1 items-center justify-center gap-2 rounded-xl bg-blue-600 px-4 text-sm font-semibold text-white hover:bg-blue-700 dark:bg-blue-500 dark:hover:bg-blue-600"
          >
            <Pencil className="h-4 w-4" />
            Tahrirlash
          </button>
          <button
            type="button"
            onClick={() => onDelete(employee.id)}
            aria-label="Ishchini o‘chirish"
            className="inline-flex min-h-[44px] items-center justify-center gap-1.5 rounded-xl border border-rose-200 px-4 text-sm font-semibold text-rose-600 hover:bg-rose-50 dark:border-rose-900/60 dark:text-rose-400 dark:hover:bg-rose-950/40"
          >
            <Trash2 className="h-4 w-4" />
            O‘chirish
          </button>
        </div>
      </div>
    </div>
  );
};
