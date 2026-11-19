import React, { useMemo, useState } from 'react';
import {
  ArrowUpDown,
  Bookmark,
  Download,
  FileJson,
  Printer,
  X,
} from 'lucide-react';
import {
  downloadCsvFile,
  downloadJsonFile,
  formatMoney,
  formatNumber,
} from '../data/datasets';
import { CurrencyCode, ReportDocument } from '../types/analytics';
import { TrendChart } from './Charts';

interface ReportDetailSheetProps {
  report: ReportDocument | null;
  currency: CurrencyCode;
  isBookmarked: boolean;
  onToggleBookmark: (id: string) => void;
  onClose: () => void;
}

type SortField = 'name' | 'value' | 'growthPct' | 'sharePct';

export const ReportDetailSheet: React.FC<ReportDetailSheetProps> = ({
  report,
  currency,
  isBookmarked,
  onToggleBookmark,
  onClose,
}) => {
  const [sortField, setSortField] = useState<SortField>('value');
  const [sortAsc, setSortAsc] = useState(false);

  const sortedRows = useMemo(() => {
    if (!report) return [];
    return [...report.rows].sort((a, b) => {
      const av = a[sortField];
      const bv = b[sortField];
      if (typeof av === 'string' && typeof bv === 'string') {
        return sortAsc ? av.localeCompare(bv) : bv.localeCompare(av);
      }
      return sortAsc ? Number(av) - Number(bv) : Number(bv) - Number(av);
    });
  }, [report, sortField, sortAsc]);

  if (!report) return null;

  const handleSort = (field: SortField) => {
    if (sortField === field) {
      setSortAsc(!sortAsc);
    } else {
      setSortField(field);
      setSortAsc(false);
    }
  };

  const formatRowVal = (val: number) => {
    if (report.valueUnit === 'currency') {
      return formatMoney(val, currency, true);
    }
    if (report.valueUnit === 'percent') {
      return `${val.toFixed(1)}%`;
    }
    return formatNumber(val);
  };

  const handleCsvExport = () => {
    const headers = ['Nomi', 'Bo‘lim', 'Hudud', 'Ko‘rsatkich', 'O‘sish (%)', 'Ulush (%)'];
    const rows = sortedRows.map((r) => [
      r.name,
      r.category,
      r.region,
      r.value,
      r.growthPct,
      r.sharePct,
    ]);
    downloadCsvFile(`${report.id}.csv`, headers, rows);
  };

  return (
    <div
      className="fixed inset-0 z-50 flex items-end justify-center bg-slate-950/50 backdrop-blur-xs lg:items-stretch lg:justify-end"
      role="dialog"
      aria-modal="true"
      aria-label={report.title}
    >
      {/* Backdrop click */}
      <div className="absolute inset-0" onClick={onClose} />

      <div className="relative z-10 flex max-h-[92vh] w-full flex-col rounded-t-3xl bg-white shadow-2xl dark:bg-slate-900 lg:h-full lg:max-h-full lg:max-w-2xl lg:rounded-none lg:rounded-l-2xl">
        {/* Mobile grab handle */}
        <div className="flex justify-center pt-3 pb-1 lg:hidden">
          <div className="h-1.5 w-10 rounded-full bg-slate-300 dark:bg-slate-700" />
        </div>

        {/* Sheet Header */}
        <div className="flex items-start justify-between gap-4 border-b border-slate-100 px-5 py-4 dark:border-slate-800">
          <div className="min-w-0">
            <div className="flex flex-wrap items-center gap-2 text-xs text-slate-500 dark:text-slate-400">
              <span>{report.category}</span>
              <span aria-hidden="true">·</span>
              <span>{report.periodLabel}</span>
              <span aria-hidden="true">·</span>
              <span>{report.status}</span>
            </div>
            <h2 className="mt-1 text-lg font-bold text-slate-900 dark:text-slate-100">
              {report.title}
            </h2>
            <p className="mt-0.5 text-xs text-slate-500 dark:text-slate-400">
              Mas’ul: {report.author} · Yangilandi: {report.updatedAt}
            </p>
          </div>

          <div className="flex items-center gap-1 shrink-0">
            <button
              type="button"
              onClick={() => onToggleBookmark(report.id)}
              aria-label="Hisobotni saqlash"
              className="flex min-h-[44px] min-w-[44px] items-center justify-center rounded-xl text-slate-500 hover:bg-slate-100 dark:text-slate-400 dark:hover:bg-slate-800"
            >
              <Bookmark
                className={`h-5 w-5 ${
                  isBookmarked ? 'fill-blue-600 text-blue-600 dark:fill-blue-400 dark:text-blue-400' : ''
                }`}
              />
            </button>
            <button
              type="button"
              onClick={onClose}
              aria-label="Yopish"
              className="flex min-h-[44px] min-w-[44px] items-center justify-center rounded-xl text-slate-500 hover:bg-slate-100 dark:text-slate-400 dark:hover:bg-slate-800"
            >
              <X className="h-5 w-5" />
            </button>
          </div>
        </div>

        {/* Scrollable Body */}
        <div className="flex-1 space-y-6 overflow-y-auto px-5 py-5">
          {/* Executive Summary */}
          <div>
            <h3 className="text-xs font-semibold text-slate-500 dark:text-slate-400">
              Qisqacha tahliliy xulosa
            </h3>
            <p className="mt-1.5 text-sm leading-relaxed text-slate-700 dark:text-slate-300">
              {report.summary}
            </p>
          </div>

          {/* Highlight Metrics */}
          <div className="grid grid-cols-3 gap-2.5 sm:gap-3">
            {report.highlights.map((h) => (
              <div
                key={h.label}
                className="rounded-xl border border-slate-200/80 bg-slate-50/70 p-3 dark:border-slate-800 dark:bg-slate-800/50"
              >
                <p className="text-[11px] font-medium text-slate-500 dark:text-slate-400 truncate">
                  {h.label}
                </p>
                <p className="mt-1 font-mono text-sm font-bold text-slate-900 tabular-nums sm:text-base dark:text-slate-100">
                  {h.value}
                </p>
                <p
                  className={`mt-1 font-mono text-[11px] font-semibold tabular-nums ${
                    h.deltaPct >= 0
                      ? 'text-emerald-700 dark:text-emerald-400'
                      : 'text-rose-700 dark:text-rose-400'
                  }`}
                >
                  {h.deltaPct >= 0 ? '+' : ''}
                  {h.deltaPct}%
                </p>
              </div>
            ))}
          </div>

          {/* Series Trend */}
          {report.series.length > 0 && (
            <div className="rounded-xl border border-slate-200/80 p-4 dark:border-slate-800">
              <h3 className="mb-3 text-sm font-semibold text-slate-900 dark:text-slate-100">
                Davriy taqqoslash (Joriy vs Oldingi)
              </h3>
              <TrendChart
                data={report.series.map((s) => ({
                  label: s.label,
                  primary: s.value,
                  secondary: s.prevValue,
                }))}
                mode="bar"
                showSecondary
                primaryLabel="Joriy davr"
                secondaryLabel="Oldingi davr"
                formatValue={(v) => formatNumber(v)}
                height={180}
              />
            </div>
          )}

          {/* Detailed Sortable Table */}
          <div>
            <h3 className="mb-2.5 text-sm font-semibold text-slate-900 dark:text-slate-100">
              Batafsil ko‘rsatkichlar jadvali
            </h3>
            <div className="overflow-x-auto rounded-xl border border-slate-200/80 dark:border-slate-800">
              <table className="w-full text-left text-sm">
                <thead className="border-b border-slate-200 bg-slate-50 text-xs text-slate-500 dark:border-slate-800 dark:bg-slate-800/60 dark:text-slate-400">
                  <tr>
                    <th className="px-3.5 py-2.5 font-medium">
                      <button
                        type="button"
                        onClick={() => handleSort('name')}
                        className="inline-flex items-center gap-1 hover:text-slate-900 dark:hover:text-slate-200"
                      >
                        Nomi <ArrowUpDown className="h-3 w-3" />
                      </button>
                    </th>
                    <th className="px-3.5 py-2.5 text-right font-medium">
                      <button
                        type="button"
                        onClick={() => handleSort('value')}
                        className="inline-flex items-center gap-1 hover:text-slate-900 dark:hover:text-slate-200"
                      >
                        Qiymat <ArrowUpDown className="h-3 w-3" />
                      </button>
                    </th>
                    <th className="px-3.5 py-2.5 text-right font-medium">
                      <button
                        type="button"
                        onClick={() => handleSort('growthPct')}
                        className="inline-flex items-center gap-1 hover:text-slate-900 dark:hover:text-slate-200"
                      >
                        O‘sish <ArrowUpDown className="h-3 w-3" />
                      </button>
                    </th>
                    <th className="px-3.5 py-2.5 text-right font-medium">
                      <button
                        type="button"
                        onClick={() => handleSort('sharePct')}
                        className="inline-flex items-center gap-1 hover:text-slate-900 dark:hover:text-slate-200"
                      >
                        Ulush <ArrowUpDown className="h-3 w-3" />
                      </button>
                    </th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-100 dark:divide-slate-800">
                  {sortedRows.map((row) => (
                    <tr key={row.id} className="hover:bg-slate-50/70 dark:hover:bg-slate-800/40">
                      <td className="px-3.5 py-2.5">
                        <p className="font-medium text-slate-900 dark:text-slate-100">{row.name}</p>
                        <p className="text-xs text-slate-500 dark:text-slate-400">{row.region}</p>
                      </td>
                      <td className="px-3.5 py-2.5 text-right font-mono text-xs font-semibold text-slate-900 tabular-nums dark:text-slate-100">
                        {formatRowVal(row.value)}
                      </td>
                      <td
                        className={`px-3.5 py-2.5 text-right font-mono text-xs font-semibold tabular-nums ${
                          row.growthPct >= 0
                            ? 'text-emerald-700 dark:text-emerald-400'
                            : 'text-rose-700 dark:text-rose-400'
                        }`}
                      >
                        {row.growthPct >= 0 ? '+' : ''}
                        {row.growthPct.toFixed(1)}%
                      </td>
                      <td className="px-3.5 py-2.5 text-right font-mono text-xs text-slate-600 tabular-nums dark:text-slate-400">
                        {row.sharePct.toFixed(1)}%
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        </div>

        {/* Sticky Sheet Footer Actions */}
        <div className="no-print flex flex-wrap items-center gap-2.5 border-t border-slate-100 bg-white px-5 py-3.5 pb-safe dark:border-slate-800 dark:bg-slate-900">
          <button
            type="button"
            onClick={handleCsvExport}
            className="inline-flex min-h-[44px] flex-1 items-center justify-center gap-2 whitespace-nowrap rounded-xl bg-blue-600 px-4 py-2 text-sm font-semibold text-white hover:bg-blue-700 dark:bg-blue-500 dark:hover:bg-blue-600"
          >
            <Download className="h-4 w-4" />
            CSV yuklab olish
          </button>
          <button
            type="button"
            onClick={() => downloadJsonFile(`${report.id}.json`, report)}
            className="inline-flex min-h-[44px] items-center justify-center gap-2 whitespace-nowrap rounded-xl border border-slate-200 px-3.5 py-2 text-sm font-medium text-slate-700 hover:bg-slate-50 dark:border-slate-700 dark:text-slate-200 dark:hover:bg-slate-800"
          >
            <FileJson className="h-4 w-4" />
            JSON
          </button>
          <button
            type="button"
            onClick={() => window.print()}
            aria-label="Chop etish"
            className="inline-flex min-h-[44px] min-w-[44px] items-center justify-center rounded-xl border border-slate-200 text-slate-700 hover:bg-slate-50 dark:border-slate-700 dark:text-slate-200 dark:hover:bg-slate-800"
          >
            <Printer className="h-4 w-4" />
          </button>
        </div>
      </div>
    </div>
  );
};
