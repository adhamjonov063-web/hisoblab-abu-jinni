import React, { useMemo, useState } from 'react';
import {
  Bookmark,
  CheckCircle2,
  ChevronRight,
  Clock,
  FileSpreadsheet,
  Plus,
  Search,
} from 'lucide-react';
import { ReportDocument, ReportStatus } from '../types/analytics';

interface ReportsTabProps {
  reports: ReportDocument[];
  bookmarkedIds: string[];
  onToggleBookmark: (id: string) => void;
  onSelectReport: (report: ReportDocument) => void;
  onOpenCreateModal: () => void;
}

type StatusFilter = 'Barchasi' | ReportStatus | 'Saqlanganlar';

export const ReportsTab: React.FC<ReportsTabProps> = ({
  reports,
  bookmarkedIds,
  onToggleBookmark,
  onSelectReport,
  onOpenCreateModal,
}) => {
  const [searchQuery, setSearchQuery] = useState('');
  const [statusFilter, setStatusFilter] = useState<StatusFilter>('Barchasi');

  const filteredReports = useMemo(() => {
    return reports.filter((r) => {
      const matchesSearch =
        searchQuery.trim() === '' ||
        r.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
        r.category.toLowerCase().includes(searchQuery.toLowerCase()) ||
        r.author.toLowerCase().includes(searchQuery.toLowerCase());

      if (!matchesSearch) return false;
      if (statusFilter === 'Barchasi') return true;
      if (statusFilter === 'Saqlanganlar') return bookmarkedIds.includes(r.id);
      return r.status === statusFilter;
    });
  }, [reports, searchQuery, statusFilter, bookmarkedIds]);

  const filterOptions: StatusFilter[] = [
    'Barchasi',
    'Tayyor',
    'Tekshiruvda',
    'Jarayonda',
    'Saqlanganlar',
  ];

  const getStatusMeta = (status: ReportStatus) => {
    switch (status) {
      case 'Tayyor':
        return {
          icon: <CheckCircle2 className="h-3.5 w-3.5 text-emerald-600 dark:text-emerald-400" />,
          textClass: 'text-emerald-700 dark:text-emerald-400',
        };
      case 'Tekshiruvda':
        return {
          icon: <Clock className="h-3.5 w-3.5 text-amber-600 dark:text-amber-400" />,
          textClass: 'text-amber-700 dark:text-amber-400',
        };
      case 'Jarayonda':
        return {
          icon: <Clock className="h-3.5 w-3.5 text-blue-600 dark:text-blue-400" />,
          textClass: 'text-blue-700 dark:text-blue-400',
        };
    }
  };

  return (
    <div className="space-y-5">
      {/* Search + New Report Header */}
      <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
        <div className="relative flex-1">
          <Search className="pointer-events-none absolute left-3.5 top-1/2 h-4 w-4 -translate-y-1/2 text-slate-400" />
          <input
            type="search"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            placeholder="Hisobot nomi, bo‘lim yoki muallif bo‘yicha qidirish..."
            className="min-h-[44px] w-full rounded-xl border border-slate-200 bg-white pl-10 pr-4 text-sm text-slate-900 placeholder:text-slate-400 focus:border-blue-500 focus:outline-none dark:border-slate-800 dark:bg-slate-900 dark:text-slate-100"
          />
        </div>

        <button
          type="button"
          onClick={onOpenCreateModal}
          className="inline-flex min-h-[44px] items-center justify-center gap-2 whitespace-nowrap shrink-0 rounded-xl bg-blue-600 px-4 py-2 text-sm font-semibold text-white transition-colors hover:bg-blue-700 active:scale-[0.98] dark:bg-blue-500 dark:hover:bg-blue-600"
        >
          <Plus className="h-4 w-4" />
          Yangi hisobot
        </button>
      </div>

      {/* Status Segmented Tabs */}
      <div className="flex items-center gap-1.5 overflow-x-auto no-scrollbar pb-0.5">
        {filterOptions.map((opt) => {
          const active = statusFilter === opt;
          return (
            <button
              key={opt}
              type="button"
              onClick={() => setStatusFilter(opt)}
              className={`min-h-[38px] whitespace-nowrap shrink-0 rounded-lg px-3 py-1.5 text-xs font-semibold transition-colors ${
                active
                  ? 'bg-slate-900 text-white dark:bg-slate-100 dark:text-slate-900'
                  : 'bg-slate-200/70 text-slate-600 hover:text-slate-900 dark:bg-slate-800 dark:text-slate-400 dark:hover:text-slate-200'
              }`}
            >
              {opt}
            </button>
          );
        })}
      </div>

      {/* Interactive Tap List Rows */}
      <div className="rounded-2xl border border-slate-200/80 bg-white dark:border-slate-800 dark:bg-slate-900">
        {filteredReports.length === 0 ? (
          <div className="flex flex-col items-center justify-center px-6 py-12 text-center">
            <FileSpreadsheet className="h-9 w-9 text-slate-300 dark:text-slate-600" />
            <p className="mt-3 text-sm font-semibold text-slate-800 dark:text-slate-200">
              Mos hisobot topilmadi
            </p>
            <p className="mt-1 text-xs text-slate-500 dark:text-slate-400">
              Qidiruv so‘zini o‘zgartiring yoki yangi hisobot yarating.
            </p>
            <button
              type="button"
              onClick={() => {
                setSearchQuery('');
                setStatusFilter('Barchasi');
              }}
              className="mt-4 min-h-[40px] rounded-lg border border-slate-200 px-4 py-2 text-xs font-semibold text-slate-700 hover:bg-slate-50 dark:border-slate-700 dark:text-slate-300 dark:hover:bg-slate-800"
            >
              Filtrlarni tozalash
            </button>
          </div>
        ) : (
          <div className="divide-y divide-slate-100 dark:divide-slate-800">
            {filteredReports.map((report) => {
              const statusMeta = getStatusMeta(report.status);
              const isBookmarked = bookmarkedIds.includes(report.id);
              const primaryHighlight = report.highlights[0];

              return (
                <div
                  key={report.id}
                  className="flex items-center gap-3 px-4 py-3.5 transition-colors hover:bg-slate-50/80 dark:hover:bg-slate-800/40 sm:px-5"
                >
                  <button
                    type="button"
                    onClick={() => onSelectReport(report)}
                    className="flex min-h-[52px] flex-1 items-center justify-between gap-3 text-left min-w-0"
                  >
                    <div className="flex items-start gap-3.5 min-w-0">
                      <div className="mt-0.5 flex h-10 w-10 shrink-0 items-center justify-center rounded-xl bg-slate-100 text-slate-700 dark:bg-slate-800 dark:text-slate-300">
                        <FileSpreadsheet className="h-5 w-5" />
                      </div>
                      <div className="min-w-0">
                        <p className="text-sm font-semibold text-slate-900 dark:text-slate-100 line-clamp-1">
                          {report.title}
                        </p>
                        <div className="mt-1 flex flex-wrap items-center gap-x-2 gap-y-0.5 text-xs text-slate-500 dark:text-slate-400">
                          <span>{report.category}</span>
                          <span aria-hidden="true">·</span>
                          <span>{report.periodLabel}</span>
                          <span aria-hidden="true">·</span>
                          <span className={`inline-flex items-center gap-1 font-medium ${statusMeta.textClass}`}>
                            {statusMeta.icon}
                            {report.status}
                          </span>
                        </div>
                      </div>
                    </div>

                    <div className="flex items-center gap-3 shrink-0">
                      {primaryHighlight && (
                        <div className="hidden text-right sm:block">
                          <p className="font-mono text-sm font-semibold text-slate-900 tabular-nums dark:text-slate-100">
                            {primaryHighlight.value}
                          </p>
                          <p className="text-[11px] text-slate-500 dark:text-slate-400">
                            {primaryHighlight.label}
                          </p>
                        </div>
                      )}
                      <ChevronRight className="h-4 w-4 text-slate-400" />
                    </div>
                  </button>

                  <button
                    type="button"
                    onClick={() => onToggleBookmark(report.id)}
                    aria-label={isBookmarked ? 'Saqlanganlardan olib tashlash' : 'Hisobotni saqlash'}
                    className="flex min-h-[44px] min-w-[44px] shrink-0 items-center justify-center rounded-xl text-slate-400 transition-colors hover:bg-slate-100 hover:text-blue-600 dark:hover:bg-slate-800"
                  >
                    <Bookmark
                      className={`h-4 w-4 ${
                        isBookmarked ? 'fill-blue-600 text-blue-600 dark:fill-blue-400 dark:text-blue-400' : ''
                      }`}
                    />
                  </button>
                </div>
              );
            })}
          </div>
        )}
      </div>
    </div>
  );
};
