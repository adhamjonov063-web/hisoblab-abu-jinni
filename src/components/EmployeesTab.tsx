import React, { useMemo, useState } from 'react';
import {
  CheckCircle2,
  ChevronRight,
  Clock,
  Download,
  Plane,
  Plus,
  Search,
  Users,
} from 'lucide-react';
import {
  downloadCsvFile,
  formatMoney,
  formatNumber,
} from '../data/datasets';
import { CurrencyCode, Employee, EmployeeStatus } from '../types/analytics';
import { ComparisonBars } from './Charts';

interface EmployeesTabProps {
  employees: Employee[];
  currency: CurrencyCode;
  onSelectEmployee: (emp: Employee) => void;
  onOpenAddModal: () => void;
}

const DEPT_FILTERS = ['Barchasi', 'Savdo', 'Moliya', 'Mijozlar', 'Operatsion'];

function getInitials(name: string): string {
  return name
    .split(/\s+/)
    .filter(Boolean)
    .slice(0, 2)
    .map((p) => p[0].toUpperCase())
    .join('');
}

export const EmployeesTab: React.FC<EmployeesTabProps> = ({
  employees,
  currency,
  onSelectEmployee,
  onOpenAddModal,
}) => {
  const [searchQuery, setSearchQuery] = useState('');
  const [deptFilter, setDeptFilter] = useState('Barchasi');
  const [statusFilter, setStatusFilter] = useState<'Barchasi' | EmployeeStatus>('Barchasi');

  const filteredEmployees = useMemo(() => {
    return employees.filter((e) => {
      const q = searchQuery.trim().toLowerCase();
      const matchesSearch =
        q === '' ||
        e.fullName.toLowerCase().includes(q) ||
        e.role.toLowerCase().includes(q) ||
        e.region.toLowerCase().includes(q) ||
        e.department.toLowerCase().includes(q);
      const matchesDept = deptFilter === 'Barchasi' || e.department === deptFilter;
      const matchesStatus = statusFilter === 'Barchasi' || e.status === statusFilter;
      return matchesSearch && matchesDept && matchesStatus;
    });
  }, [employees, searchQuery, deptFilter, statusFilter]);

  const stats = useMemo(() => {
    const total = employees.length;
    const activeCount = employees.filter((e) => e.status === 'Faol').length;
    const avgTarget =
      total > 0
        ? employees.reduce((s, e) => s + e.targetCompletionPct, 0) / total
        : 0;
    const totalPayroll = employees.reduce((s, e) => s + e.monthlySalary, 0);
    return { total, activeCount, avgTarget, totalPayroll };
  }, [employees]);

  const topContributors = useMemo(() => {
    return [...filteredEmployees]
      .sort((a, b) => b.revenueGenerated - a.revenueGenerated)
      .slice(0, 5)
      .map((e) => ({
        label: e.fullName,
        value: e.revenueGenerated,
        sublabel: `${e.department} · Reja: ${e.targetCompletionPct}%`,
      }));
  }, [filteredEmployees]);

  const getStatusMeta = (status: EmployeeStatus) => {
    switch (status) {
      case 'Faol':
        return {
          icon: <CheckCircle2 className="h-3.5 w-3.5 text-emerald-600 dark:text-emerald-400" />,
          textClass: 'text-emerald-700 dark:text-emerald-400',
        };
      case 'Safarda':
        return {
          icon: <Plane className="h-3.5 w-3.5 text-blue-600 dark:text-blue-400" />,
          textClass: 'text-blue-700 dark:text-blue-400',
        };
      case 'Ta’tilda':
        return {
          icon: <Clock className="h-3.5 w-3.5 text-amber-600 dark:text-amber-400" />,
          textClass: 'text-amber-700 dark:text-amber-400',
        };
    }
  };

  const handleExportCsv = () => {
    const headers = [
      'F.I.Sh.',
      'Lavozim',
      'Bo‘lim',
      'Hudud',
      'Holat',
      'Oylik maosh (UZS)',
      'Keltirgan tushum (UZS)',
      'Reja bajarilishi (%)',
      'Bajarilgan vazifalar',
    ];
    const rows = filteredEmployees.map((e) => [
      e.fullName,
      e.role,
      e.department,
      e.region,
      e.status,
      e.monthlySalary,
      e.revenueGenerated,
      e.targetCompletionPct,
      e.completedTasks,
    ]);
    downloadCsvFile('hisoblab_ishchilar.csv', headers, rows);
  };

  return (
    <div className="space-y-5">
      {/* 4 KPI Summary Cards */}
      <div className="grid grid-cols-2 gap-3 lg:grid-cols-4 lg:gap-4">
        <div className="rounded-2xl border border-slate-200/80 bg-white p-4 dark:border-slate-800 dark:bg-slate-900">
          <p className="text-xs font-medium text-slate-500 dark:text-slate-400">
            Jami ishchilar
          </p>
          <p className="mt-1.5 font-mono text-lg font-bold text-slate-900 tabular-nums sm:text-xl dark:text-slate-100">
            {formatNumber(stats.total)} nafar
          </p>
          <p className="mt-1 text-xs text-slate-500 dark:text-slate-400">
            Faol shtat tarkibi
          </p>
        </div>

        <div className="rounded-2xl border border-slate-200/80 bg-white p-4 dark:border-slate-800 dark:bg-slate-900">
          <p className="text-xs font-medium text-slate-500 dark:text-slate-400">
            Ish joyida (Faol)
          </p>
          <p className="mt-1.5 font-mono text-lg font-bold text-emerald-700 tabular-nums sm:text-xl dark:text-emerald-400">
            {formatNumber(stats.activeCount)} nafar
          </p>
          <p className="mt-1 text-xs text-slate-500 dark:text-slate-400">
            {stats.total > 0 ? Math.round((stats.activeCount / stats.total) * 100) : 0}% ishtirok
          </p>
        </div>

        <div className="rounded-2xl border border-slate-200/80 bg-white p-4 dark:border-slate-800 dark:bg-slate-900">
          <p className="text-xs font-medium text-slate-500 dark:text-slate-400">
            O‘rtacha reja
          </p>
          <p className="mt-1.5 font-mono text-lg font-bold text-slate-900 tabular-nums sm:text-xl dark:text-slate-100">
            {stats.avgTarget.toFixed(1)}%
          </p>
          <p className="mt-1 text-xs text-slate-500 dark:text-slate-400">
            Jamoa samaradorligi
          </p>
        </div>

        <div className="rounded-2xl border border-slate-200/80 bg-white p-4 dark:border-slate-800 dark:bg-slate-900">
          <p className="text-xs font-medium text-slate-500 dark:text-slate-400">
            Oylik maosh fondi
          </p>
          <p className="mt-1.5 font-mono text-lg font-bold text-slate-900 tabular-nums sm:text-xl dark:text-slate-100">
            {formatMoney(stats.totalPayroll, currency, true)}
          </p>
          <p className="mt-1 text-xs text-slate-500 dark:text-slate-400">
            Joriy oylik hisob-kitob
          </p>
        </div>
      </div>

      {/* Search & Primary Actions */}
      <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
        <div className="relative flex-1">
          <Search className="pointer-events-none absolute left-3.5 top-1/2 h-4 w-4 -translate-y-1/2 text-slate-400" />
          <input
            type="search"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            placeholder="Ism, lavozim yoki hudud bo‘yicha qidirish..."
            className="min-h-[44px] w-full rounded-xl border border-slate-200 bg-white pl-10 pr-4 text-sm text-slate-900 placeholder:text-slate-400 focus:border-blue-500 focus:outline-none dark:border-slate-800 dark:bg-slate-900 dark:text-slate-100"
          />
        </div>

        <div className="flex items-center gap-2 shrink-0">
          <button
            type="button"
            onClick={handleExportCsv}
            className="inline-flex min-h-[44px] items-center justify-center gap-2 whitespace-nowrap rounded-xl border border-slate-200 bg-white px-3.5 py-2 text-xs font-semibold text-slate-700 transition-colors hover:bg-slate-50 dark:border-slate-700 dark:bg-slate-900 dark:text-slate-200 dark:hover:bg-slate-800"
          >
            <Download className="h-4 w-4" />
            CSV
          </button>

          <button
            type="button"
            onClick={onOpenAddModal}
            className="inline-flex min-h-[44px] flex-1 items-center justify-center gap-2 whitespace-nowrap rounded-xl bg-blue-600 px-4 py-2 text-sm font-semibold text-white transition-colors hover:bg-blue-700 active:scale-[0.98] sm:flex-initial dark:bg-blue-500 dark:hover:bg-blue-600"
          >
            <Plus className="h-4 w-4" />
            Ishchi qo‘shish
          </button>
        </div>
      </div>

      {/* Department & Status Filters */}
      <div className="flex flex-col gap-2.5 sm:flex-row sm:items-center sm:justify-between">
        <div className="flex items-center gap-1.5 overflow-x-auto no-scrollbar pb-0.5">
          {DEPT_FILTERS.map((dept) => {
            const active = deptFilter === dept;
            return (
              <button
                key={dept}
                type="button"
                onClick={() => setDeptFilter(dept)}
                className={`min-h-[38px] whitespace-nowrap shrink-0 rounded-lg px-3 py-1.5 text-xs font-semibold transition-colors ${
                  active
                    ? 'bg-slate-900 text-white dark:bg-slate-100 dark:text-slate-900'
                    : 'bg-slate-200/70 text-slate-600 hover:text-slate-900 dark:bg-slate-800 dark:text-slate-400 dark:hover:text-slate-200'
                }`}
              >
                {dept}
              </button>
            );
          })}
        </div>

        <select
          value={statusFilter}
          onChange={(e) => setStatusFilter(e.target.value as 'Barchasi' | EmployeeStatus)}
          aria-label="Holat bo‘yicha filtrlash"
          className="min-h-[38px] rounded-lg border border-slate-200 bg-white px-3 text-xs font-medium text-slate-700 focus:border-blue-500 focus:outline-none dark:border-slate-800 dark:bg-slate-900 dark:text-slate-200"
        >
          <option value="Barchasi">Barcha holatlar</option>
          <option value="Faol">Faol</option>
          <option value="Safarda">Safarda</option>
          <option value="Ta’tilda">Ta’tilda</option>
        </select>
      </div>

      {/* Main Split: Employee Tap List + Top Contributors Analytics */}
      <div className="grid grid-cols-1 gap-4 lg:grid-cols-3">
        {/* Employee Roster List */}
        <div className="rounded-2xl border border-slate-200/80 bg-white lg:col-span-2 dark:border-slate-800 dark:bg-slate-900">
          {filteredEmployees.length === 0 ? (
            <div className="flex flex-col items-center justify-center px-6 py-12 text-center">
              <Users className="h-9 w-9 text-slate-300 dark:text-slate-600" />
              <p className="mt-3 text-sm font-semibold text-slate-800 dark:text-slate-200">
                Ishchilar topilmadi
              </p>
              <p className="mt-1 text-xs text-slate-500 dark:text-slate-400">
                Filtrni tozalang yoki yangi ishchi qo‘shing.
              </p>
              <button
                type="button"
                onClick={() => {
                  setSearchQuery('');
                  setDeptFilter('Barchasi');
                  setStatusFilter('Barchasi');
                }}
                className="mt-4 min-h-[40px] rounded-lg border border-slate-200 px-4 py-2 text-xs font-semibold text-slate-700 hover:bg-slate-50 dark:border-slate-700 dark:text-slate-300 dark:hover:bg-slate-800"
              >
                Filtrlarni tozalash
              </button>
            </div>
          ) : (
            <div className="divide-y divide-slate-100 dark:divide-slate-800">
              {filteredEmployees.map((emp) => {
                const statusMeta = getStatusMeta(emp.status);
                return (
                  <button
                    key={emp.id}
                    type="button"
                    onClick={() => onSelectEmployee(emp)}
                    className="flex min-h-[68px] w-full items-center justify-between gap-3 px-4 py-3.5 text-left transition-colors hover:bg-slate-50/80 dark:hover:bg-slate-800/40 sm:px-5"
                  >
                    <div className="flex items-center gap-3.5 min-w-0">
                      <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-full bg-slate-100 font-display text-xs font-bold text-slate-700 dark:bg-slate-800 dark:text-slate-200">
                        {getInitials(emp.fullName)}
                      </div>
                      <div className="min-w-0">
                        <p className="truncate text-sm font-semibold text-slate-900 dark:text-slate-100">
                          {emp.fullName}
                        </p>
                        <div className="mt-0.5 flex flex-wrap items-center gap-x-2 gap-y-0.5 text-xs text-slate-500 dark:text-slate-400">
                          <span className="truncate max-w-[160px] sm:max-w-none">{emp.role}</span>
                          <span aria-hidden="true">·</span>
                          <span>{emp.department}</span>
                          <span aria-hidden="true">·</span>
                          <span>{emp.region}</span>
                          <span aria-hidden="true">·</span>
                          <span className={`inline-flex items-center gap-1 font-medium ${statusMeta.textClass}`}>
                            {statusMeta.icon}
                            {emp.status}
                          </span>
                        </div>
                      </div>
                    </div>

                    <div className="flex items-center gap-3 shrink-0">
                      <div className="text-right">
                        <p className="font-mono text-xs font-semibold text-slate-900 tabular-nums sm:text-sm dark:text-slate-100">
                          {formatMoney(emp.revenueGenerated, currency, true)}
                        </p>
                        <p
                          className={`font-mono text-[11px] font-medium tabular-nums ${
                            emp.targetCompletionPct >= 100
                              ? 'text-emerald-700 dark:text-emerald-400'
                              : 'text-amber-700 dark:text-amber-400'
                          }`}
                        >
                          Reja: {emp.targetCompletionPct}%
                        </p>
                      </div>
                      <ChevronRight className="h-4 w-4 text-slate-400" />
                    </div>
                  </button>
                );
              })}
            </div>
          )}
        </div>

        {/* Employee Performance Comparison Card */}
        <section className="rounded-2xl border border-slate-200/80 bg-white p-4 sm:p-5 dark:border-slate-800 dark:bg-slate-900">
          <div className="mb-4 flex items-baseline justify-between gap-2">
            <h3 className="text-base font-semibold text-slate-900 dark:text-slate-100">
              Natijadorlik reytingi
            </h3>
            <span className="text-xs text-slate-500 dark:text-slate-400">
              Top {topContributors.length} xodim
            </span>
          </div>
          {topContributors.length > 0 ? (
            <ComparisonBars
              items={topContributors}
              formatValue={(v) => formatMoney(v, currency, true)}
            />
          ) : (
            <p className="text-xs text-slate-500 dark:text-slate-400">
              Taqqoslash uchun xodimlar mavjud emas.
            </p>
          )}
        </section>
      </div>
    </div>
  );
};
