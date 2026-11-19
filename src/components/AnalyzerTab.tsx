import React, { useMemo, useState } from 'react';
import {
  ArrowUpDown,
  Download,
  FileSpreadsheet,
  FileUp,
  Search,
  Trash2,
} from 'lucide-react';
import {
  downloadCsvFile,
  formatMoney,
  formatNumber,
  getPeriodDays,
  parseCsvText,
  SAMPLE_CSV_TEMPLATE,
} from '../data/datasets';
import {
  CurrencyCode,
  CustomCsvDataset,
  DatasetProfile,
  TimePeriod,
} from '../types/analytics';
import { TrendChart } from './Charts';

interface AnalyzerTabProps {
  dataset: DatasetProfile;
  currency: CurrencyCode;
  period: TimePeriod;
  customCsv: CustomCsvDataset | null;
  onUploadCsv: (csv: CustomCsvDataset | null) => void;
}

type DimensionKey = 'region' | 'category' | 'channel';
type MetricKey = 'revenue' | 'profit' | 'expenses' | 'orders' | 'customers';
type AggregationMode = 'sum' | 'avg' | 'max';

export const AnalyzerTab: React.FC<AnalyzerTabProps> = ({
  dataset,
  currency,
  period,
  customCsv,
  onUploadCsv,
}) => {
  const [sourceMode, setSourceMode] = useState<'preset' | 'csv'>(customCsv ? 'csv' : 'preset');
  const [dimension, setDimension] = useState<DimensionKey>('region');
  const [metric, setMetric] = useState<MetricKey>('revenue');
  const [aggregation, setAggregation] = useState<AggregationMode>('sum');
  const [chartType, setChartType] = useState<'bar' | 'line'>('bar');
  const [searchTerm, setSearchTerm] = useState('');
  const [sortAsc, setSortAsc] = useState(false);
  const [csvError, setCsvError] = useState('');

  // Custom CSV column selectors
  const [csvDimCol, setCsvDimCol] = useState<string>('');
  const [csvMetricCol, setCsvMetricCol] = useState<string>('');

  const activeCsv = sourceMode === 'csv' && customCsv ? customCsv : null;

  const effectiveCsvDim =
    activeCsv && activeCsv.dimensionColumns.includes(csvDimCol)
      ? csvDimCol
      : activeCsv?.dimensionColumns[0] || activeCsv?.headers[0] || '';

  const effectiveCsvMetric =
    activeCsv && activeCsv.numericColumns.includes(csvMetricCol)
      ? csvMetricCol
      : activeCsv?.numericColumns[0] || '';

  const periodPoints = useMemo(() => {
    const days = getPeriodDays(period);
    return dataset.dailyPoints.slice(-days);
  }, [dataset.dailyPoints, period]);

  const aggregatedRows = useMemo(() => {
    const groups = new Map<string, number[]>();

    if (activeCsv && effectiveCsvDim && effectiveCsvMetric) {
      for (const row of activeCsv.rows) {
        const key = String(row[effectiveCsvDim] ?? 'Noma’lum') || 'Noma’lum';
        const val = Number(row[effectiveCsvMetric]) || 0;
        const list = groups.get(key) || [];
        list.push(val);
        groups.set(key, list);
      }
    } else {
      for (const p of periodPoints) {
        const key = p[dimension];
        const val =
          metric === 'profit'
            ? p.revenue - p.expenses
            : p[metric];
        const list = groups.get(key) || [];
        list.push(val);
        groups.set(key, list);
      }
    }

    const computed = Array.from(groups.entries()).map(([label, values]) => {
      const sum = values.reduce((s, v) => s + v, 0);
      const avg = values.length > 0 ? sum / values.length : 0;
      const max = values.length > 0 ? Math.max(...values) : 0;
      const min = values.length > 0 ? Math.min(...values) : 0;
      const selectedVal =
        aggregation === 'sum' ? sum : aggregation === 'avg' ? avg : max;

      return {
        label,
        count: values.length,
        value: selectedVal,
        sum,
        avg,
        min,
        max,
      };
    });

    const filtered = searchTerm.trim()
      ? computed.filter((r) => r.label.toLowerCase().includes(searchTerm.toLowerCase()))
      : computed;

    return filtered.sort((a, b) => (sortAsc ? a.value - b.value : b.value - a.value));
  }, [
    activeCsv,
    effectiveCsvDim,
    effectiveCsvMetric,
    periodPoints,
    dimension,
    metric,
    aggregation,
    searchTerm,
    sortAsc,
  ]);

  const summaryStats = useMemo(() => {
    if (aggregatedRows.length === 0) {
      return { total: 0, average: 0, min: 0, max: 0 };
    }
    const vals = aggregatedRows.map((r) => r.value);
    const total = vals.reduce((s, v) => s + v, 0);
    return {
      total,
      average: total / vals.length,
      min: Math.min(...vals),
      max: Math.max(...vals),
    };
  }, [aggregatedRows]);

  const isCurrencyMetric =
    !activeCsv && (metric === 'revenue' || metric === 'profit' || metric === 'expenses');

  const formatMetricVal = (v: number, compact = true) => {
    if (isCurrencyMetric) {
      return formatMoney(v, currency, compact);
    }
    return formatNumber(v);
  };

  const handleCsvFileUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    setCsvError('');
    const reader = new FileReader();
    reader.onload = () => {
      try {
        const parsed = parseCsvText(String(reader.result || ''), file.name);
        if (parsed.numericColumns.length === 0) {
          setCsvError('CSV faylda tahlil qilish uchun kamida bitta raqamli ustun bo‘lishi kerak.');
          return;
        }
        onUploadCsv(parsed);
        setSourceMode('csv');
      } catch (err) {
        setCsvError(err instanceof Error ? err.message : 'Faylni o‘qib bo‘lmadi.');
      }
    };
    reader.readAsText(file);
  };

  const handleLoadSampleCsv = () => {
    const parsed = parseCsvText(SAMPLE_CSV_TEMPLATE, 'namuna_savdo_2026.csv');
    onUploadCsv(parsed);
    setSourceMode('csv');
    setCsvError('');
  };

  const handleExportAnalyzed = () => {
    const headers = ['Guruh', 'Yozuvlar soni', 'Tanlangan qiymat', 'O‘rtacha', 'Maksimum'];
    const rows = aggregatedRows.map((r) => [
      r.label,
      r.count,
      Math.round(r.value),
      Math.round(r.avg),
      Math.round(r.max),
    ]);
    downloadCsvFile('hisoblab_tahlil_natijasi.csv', headers, rows);
  };

  return (
    <div className="space-y-5">
      {/* Data Source Switcher + CSV Upload */}
      <div className="flex flex-col gap-3 rounded-2xl border border-slate-200/80 bg-white p-4 sm:flex-row sm:items-center sm:justify-between dark:border-slate-800 dark:bg-slate-900">
        <div className="inline-flex rounded-xl bg-slate-100 p-1 dark:bg-slate-800">
          <button
            type="button"
            onClick={() => setSourceMode('preset')}
            className={`min-h-[38px] whitespace-nowrap rounded-lg px-3 py-1.5 text-xs font-semibold transition-colors ${
              sourceMode === 'preset'
                ? 'bg-white text-slate-900 shadow-xs dark:bg-slate-900 dark:text-slate-100'
                : 'text-slate-600 dark:text-slate-400'
            }`}
          >
            Joriy ma’lumotlar
          </button>
          <button
            type="button"
            onClick={() => {
              if (customCsv) {
                setSourceMode('csv');
              } else {
                handleLoadSampleCsv();
              }
            }}
            className={`min-h-[38px] whitespace-nowrap rounded-lg px-3 py-1.5 text-xs font-semibold transition-colors ${
              sourceMode === 'csv'
                ? 'bg-white text-slate-900 shadow-xs dark:bg-slate-900 dark:text-slate-100'
                : 'text-slate-600 dark:text-slate-400'
            }`}
          >
            {customCsv ? `CSV: ${customCsv.fileName}` : 'Namuna CSV tahlili'}
          </button>
        </div>

        <div className="flex flex-wrap items-center gap-2">
          <label className="inline-flex min-h-[40px] cursor-pointer items-center gap-2 whitespace-nowrap rounded-xl border border-slate-200 bg-white px-3.5 py-2 text-xs font-semibold text-slate-700 transition-colors hover:bg-slate-50 dark:border-slate-700 dark:bg-slate-800 dark:text-slate-200 dark:hover:bg-slate-700">
            <FileUp className="h-4 w-4 text-blue-600 dark:text-blue-400" />
            CSV fayl yuklash
            <input
              type="file"
              accept=".csv,text/csv"
              onChange={handleCsvFileUpload}
              className="sr-only"
            />
          </label>
          {customCsv && (
            <button
              type="button"
              onClick={() => {
                onUploadCsv(null);
                setSourceMode('preset');
              }}
              aria-label="Yuklangan CSV ni o‘chirish"
              className="inline-flex min-h-[40px] min-w-[40px] items-center justify-center rounded-xl border border-slate-200 text-slate-500 hover:text-rose-600 dark:border-slate-700 dark:text-slate-400"
            >
              <Trash2 className="h-4 w-4" />
            </button>
          )}
        </div>
      </div>

      {csvError && (
        <div className="rounded-xl bg-rose-50 px-4 py-3 text-xs font-medium text-rose-700 dark:bg-rose-950/50 dark:text-rose-300">
          {csvError}
        </div>
      )}

      {/* Dimension / Metric / Aggregation Controls */}
      <div className="grid grid-cols-1 gap-3 rounded-2xl border border-slate-200/80 bg-white p-4 sm:grid-cols-3 dark:border-slate-800 dark:bg-slate-900">
        <div>
          <label className="block text-xs font-semibold text-slate-500 dark:text-slate-400">
            Guruhlash (X o‘qi)
          </label>
          {activeCsv ? (
            <select
              value={effectiveCsvDim}
              onChange={(e) => setCsvDimCol(e.target.value)}
              className="mt-1.5 min-h-[44px] w-full rounded-xl border border-slate-200 bg-slate-50 px-3 text-sm font-medium text-slate-900 focus:border-blue-500 focus:outline-none dark:border-slate-700 dark:bg-slate-800 dark:text-slate-100"
            >
              {(activeCsv.dimensionColumns.length > 0
                ? activeCsv.dimensionColumns
                : activeCsv.headers
              ).map((col) => (
                <option key={col} value={col}>
                  {col}
                </option>
              ))}
            </select>
          ) : (
            <select
              value={dimension}
              onChange={(e) => setDimension(e.target.value as DimensionKey)}
              className="mt-1.5 min-h-[44px] w-full rounded-xl border border-slate-200 bg-slate-50 px-3 text-sm font-medium text-slate-900 focus:border-blue-500 focus:outline-none dark:border-slate-700 dark:bg-slate-800 dark:text-slate-100"
            >
              <option value="region">Hududlar bo‘yicha</option>
              <option value="category">Kategoriyalar bo‘yicha</option>
              <option value="channel">Kanallar bo‘yicha</option>
            </select>
          )}
        </div>

        <div>
          <label className="block text-xs font-semibold text-slate-500 dark:text-slate-400">
            Ko‘rsatkich (Y o‘qi)
          </label>
          {activeCsv ? (
            <select
              value={effectiveCsvMetric}
              onChange={(e) => setCsvMetricCol(e.target.value)}
              className="mt-1.5 min-h-[44px] w-full rounded-xl border border-slate-200 bg-slate-50 px-3 text-sm font-medium text-slate-900 focus:border-blue-500 focus:outline-none dark:border-slate-700 dark:bg-slate-800 dark:text-slate-100"
            >
              {activeCsv.numericColumns.map((col) => (
                <option key={col} value={col}>
                  {col}
                </option>
              ))}
            </select>
          ) : (
            <select
              value={metric}
              onChange={(e) => setMetric(e.target.value as MetricKey)}
              className="mt-1.5 min-h-[44px] w-full rounded-xl border border-slate-200 bg-slate-50 px-3 text-sm font-medium text-slate-900 focus:border-blue-500 focus:outline-none dark:border-slate-700 dark:bg-slate-800 dark:text-slate-100"
            >
              <option value="revenue">Tushum</option>
              <option value="profit">Sof foyda</option>
              <option value="expenses">Xarajatlar</option>
              <option value="orders">Buyurtmalar soni</option>
              <option value="customers">Mijozlar soni</option>
            </select>
          )}
        </div>

        <div>
          <label className="block text-xs font-semibold text-slate-500 dark:text-slate-400">
            Hisoblash usuli
          </label>
          <div className="mt-1.5 grid grid-cols-3 gap-1 rounded-xl bg-slate-100 p-1 dark:bg-slate-800">
            {[
              { id: 'sum' as const, label: 'Yig‘indi' },
              { id: 'avg' as const, label: 'O‘rtacha' },
              { id: 'max' as const, label: 'Maks' },
            ].map((agg) => (
              <button
                key={agg.id}
                type="button"
                onClick={() => setAggregation(agg.id)}
                className={`min-h-[36px] rounded-lg text-xs font-semibold transition-colors ${
                  aggregation === agg.id
                    ? 'bg-white text-slate-900 shadow-xs dark:bg-slate-900 dark:text-slate-100'
                    : 'text-slate-600 dark:text-slate-400'
                }`}
              >
                {agg.label}
              </button>
            ))}
          </div>
        </div>
      </div>

      {/* 4 Summary Stats Strip */}
      <div className="grid grid-cols-2 gap-3 lg:grid-cols-4">
        {[
          { label: 'Umumiy yig‘indi', val: summaryStats.total },
          { label: 'Guruhlar o‘rtachasi', val: summaryStats.average },
          { label: 'Eng yuqori qiymat', val: summaryStats.max },
          { label: 'Eng past qiymat', val: summaryStats.min },
        ].map((st) => (
          <div
            key={st.label}
            className="rounded-2xl border border-slate-200/80 bg-white p-3.5 dark:border-slate-800 dark:bg-slate-900"
          >
            <p className="text-xs text-slate-500 dark:text-slate-400">{st.label}</p>
            <p className="mt-1 font-mono text-base font-bold text-slate-900 tabular-nums dark:text-slate-100">
              {formatMetricVal(st.val, true)}
            </p>
          </div>
        ))}
      </div>

      {/* Visual Chart of Aggregated Dimensions */}
      <section className="rounded-2xl border border-slate-200/80 bg-white p-4 sm:p-5 dark:border-slate-800 dark:bg-slate-900">
        <div className="mb-3 flex items-center justify-between gap-2">
          <h3 className="text-base font-semibold text-slate-900 dark:text-slate-100">
            Taqqoslash grafigi
          </h3>
          <div className="inline-flex rounded-lg bg-slate-100 p-0.5 dark:bg-slate-800">
            <button
              type="button"
              onClick={() => setChartType('bar')}
              className={`min-h-[34px] rounded-md px-2.5 text-xs font-medium ${
                chartType === 'bar'
                  ? 'bg-white text-slate-900 shadow-xs dark:bg-slate-900 dark:text-slate-100'
                  : 'text-slate-500'
              }`}
            >
              Ustunli
            </button>
            <button
              type="button"
              onClick={() => setChartType('line')}
              className={`min-h-[34px] rounded-md px-2.5 text-xs font-medium ${
                chartType === 'line'
                  ? 'bg-white text-slate-900 shadow-xs dark:bg-slate-900 dark:text-slate-100'
                  : 'text-slate-500'
              }`}
            >
              Chiziqli
            </button>
          </div>
        </div>

        <TrendChart
          data={aggregatedRows.map((r) => ({
            label: r.label,
            primary: r.value,
          }))}
          mode={chartType}
          primaryLabel={activeCsv ? effectiveCsvMetric : metric === 'orders' ? 'Buyurtmalar' : 'Qiymat'}
          formatValue={(v) => formatMetricVal(v, true)}
        />
      </section>

      {/* Interactive Data Table */}
      <section className="rounded-2xl border border-slate-200/80 bg-white dark:border-slate-800 dark:bg-slate-900">
        <div className="flex flex-col gap-3 border-b border-slate-100 p-4 sm:flex-row sm:items-center sm:justify-between dark:border-slate-800">
          <div className="relative flex-1 sm:max-w-xs">
            <Search className="pointer-events-none absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-slate-400" />
            <input
              type="search"
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              placeholder="Jadval ichidan qidirish..."
              className="min-h-[40px] w-full rounded-xl border border-slate-200 bg-slate-50 pl-9 pr-3 text-xs text-slate-900 focus:border-blue-500 focus:outline-none dark:border-slate-700 dark:bg-slate-800 dark:text-slate-100"
            />
          </div>

          <button
            type="button"
            onClick={handleExportAnalyzed}
            className="inline-flex min-h-[40px] items-center justify-center gap-2 whitespace-nowrap rounded-xl border border-slate-200 px-3.5 py-2 text-xs font-semibold text-slate-700 hover:bg-slate-50 dark:border-slate-700 dark:text-slate-200 dark:hover:bg-slate-800"
          >
            <Download className="h-3.5 w-3.5" />
            Natijani yuklab olish
          </button>
        </div>

        {aggregatedRows.length === 0 ? (
          <div className="flex flex-col items-center justify-center py-10 text-center">
            <FileSpreadsheet className="h-8 w-8 text-slate-300 dark:text-slate-600" />
            <p className="mt-2 text-sm font-medium text-slate-600 dark:text-slate-400">
              Qidiruv bo‘yicha qatorlar topilmadi
            </p>
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-left text-sm">
              <thead className="border-b border-slate-200 bg-slate-50 text-xs text-slate-500 dark:border-slate-800 dark:bg-slate-800/50 dark:text-slate-400">
                <tr>
                  <th className="px-4 py-3 font-medium">Guruh</th>
                  <th className="px-4 py-3 text-right font-medium">Yozuv</th>
                  <th className="px-4 py-3 text-right font-medium">
                    <button
                      type="button"
                      onClick={() => setSortAsc(!sortAsc)}
                      className="inline-flex items-center gap-1 hover:text-slate-900 dark:hover:text-slate-200"
                    >
                      Qiymat <ArrowUpDown className="h-3 w-3" />
                    </button>
                  </th>
                  <th className="px-4 py-3 text-right font-medium hidden sm:table-cell">
                    O‘rtacha
                  </th>
                  <th className="px-4 py-3 text-right font-medium">Ulush</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100 dark:divide-slate-800">
                {aggregatedRows.map((row) => {
                  const share =
                    summaryStats.total > 0 ? (row.value / summaryStats.total) * 100 : 0;
                  return (
                    <tr
                      key={row.label}
                      className="hover:bg-slate-50/70 dark:hover:bg-slate-800/40"
                    >
                      <td className="px-4 py-3 font-medium text-slate-900 dark:text-slate-100">
                        {row.label}
                      </td>
                      <td className="px-4 py-3 text-right font-mono text-xs text-slate-500 tabular-nums dark:text-slate-400">
                        {row.count}
                      </td>
                      <td className="px-4 py-3 text-right font-mono text-xs font-semibold text-slate-900 tabular-nums dark:text-slate-100">
                        {formatMetricVal(row.value, false)}
                      </td>
                      <td className="hidden px-4 py-3 text-right font-mono text-xs text-slate-600 tabular-nums sm:table-cell dark:text-slate-400">
                        {formatMetricVal(row.avg, true)}
                      </td>
                      <td className="px-4 py-3 text-right font-mono text-xs font-medium text-blue-600 tabular-nums dark:text-blue-400">
                        {share.toFixed(1)}%
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        )}
      </section>
    </div>
  );
};
