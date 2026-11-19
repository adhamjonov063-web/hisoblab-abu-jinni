import React, { useMemo, useState } from 'react';
import {
  ArrowDownRight,
  ArrowUpRight,
  BarChart3,
  LineChart,
  TrendingUp,
} from 'lucide-react';
import {
  bucketTimeSeries,
  formatMoney,
  formatNumber,
  getPeriodDays,
  getPeriodLabelUz,
} from '../data/datasets';
import { CurrencyCode, DatasetProfile, TimePeriod } from '../types/analytics';
import { ComparisonBars, DistributionRing, TrendChart } from './Charts';

interface OverviewTabProps {
  dataset: DatasetProfile;
  currency: CurrencyCode;
  period: TimePeriod;
  onPeriodChange: (p: TimePeriod) => void;
  onOpenAnalyzer: () => void;
}

const PERIOD_OPTIONS: { id: TimePeriod; label: string }[] = [
  { id: '7d', label: '7 kun' },
  { id: '30d', label: '30 kun' },
  { id: '90d', label: 'Chorak' },
  { id: '1y', label: '1 yil' },
];

const SLICE_COLORS = ['#2563EB', '#0EA5E9', '#16A34A', '#D97706', '#64748B'];

export const OverviewTab: React.FC<OverviewTabProps> = ({
  dataset,
  currency,
  period,
  onPeriodChange,
  onOpenAnalyzer,
}) => {
  const [selectedCategory, setSelectedCategory] = useState<string>('Barchasi');
  const [chartMode, setChartMode] = useState<'line' | 'bar'>('line');
  const [showExpenses, setShowExpenses] = useState<boolean>(true);
  const [chartMetric, setChartMetric] = useState<'revenue' | 'profit' | 'orders'>('revenue');

  const days = getPeriodDays(period);

  const { currentPoints, prevPoints } = useMemo(() => {
    const all =
      selectedCategory === 'Barchasi'
        ? dataset.dailyPoints
        : dataset.dailyPoints.filter((p) => p.category === selectedCategory);

    const sliceCurrent = all.slice(-days);
    const slicePrev = all.slice(-days * 2, -days);
    return {
      currentPoints: sliceCurrent,
      prevPoints: slicePrev.length > 0 ? slicePrev : sliceCurrent,
    };
  }, [dataset.dailyPoints, days, selectedCategory]);

  const metrics = useMemo(() => {
    const sum = (arr: typeof currentPoints, key: 'revenue' | 'expenses' | 'orders' | 'customers') =>
      arr.reduce((acc, p) => acc + p[key], 0);

    const rev = sum(currentPoints, 'revenue');
    const prevRev = sum(prevPoints, 'revenue');
    const exp = sum(currentPoints, 'expenses');
    const prevExp = sum(prevPoints, 'expenses');
    const profit = rev - exp;
    const prevProfit = prevRev - prevExp;
    const orders = sum(currentPoints, 'orders');
    const prevOrders = sum(prevPoints, 'orders');
    const avgCheck = orders > 0 ? rev / orders : 0;
    const prevAvgCheck = prevOrders > 0 ? prevRev / prevOrders : 0;

    const calcDelta = (curr: number, prev: number) => {
      if (prev <= 0) return 0;
      return ((curr - prev) / prev) * 100;
    };

    return {
      revenue: { val: rev, delta: calcDelta(rev, prevRev) },
      profit: { val: profit, delta: calcDelta(profit, prevProfit) },
      orders: { val: orders, delta: calcDelta(orders, prevOrders) },
      avgCheck: { val: avgCheck, delta: calcDelta(avgCheck, prevAvgCheck) },
      marginPct: rev > 0 ? (profit / rev) * 100 : 0,
    };
  }, [currentPoints, prevPoints]);

  const chartData = useMemo(() => {
    const buckets = bucketTimeSeries(currentPoints, period);
    return buckets.map((b) => ({
      label: b.label,
      primary:
        chartMetric === 'revenue'
          ? b.revenue
          : chartMetric === 'profit'
          ? b.profit
          : b.orders,
      secondary: chartMetric === 'revenue' && showExpenses ? b.expenses : undefined,
    }));
  }, [currentPoints, period, chartMetric, showExpenses]);

  const channelSlices = useMemo(() => {
    const map = new Map<string, number>();
    for (const p of currentPoints) {
      map.set(p.channel, (map.get(p.channel) || 0) + p.revenue);
    }
    return Array.from(map.entries())
      .sort((a, b) => b[1] - a[1])
      .map(([label, value], idx) => ({
        label,
        value,
        color: SLICE_COLORS[idx % SLICE_COLORS.length],
      }));
  }, [currentPoints]);

  const regionItems = useMemo(() => {
    const map = new Map<string, { revenue: number; orders: number }>();
    for (const p of currentPoints) {
      const prev = map.get(p.region) || { revenue: 0, orders: 0 };
      prev.revenue += p.revenue;
      prev.orders += p.orders;
      map.set(p.region, prev);
    }
    return Array.from(map.entries())
      .sort((a, b) => b[1].revenue - a[1].revenue)
      .map(([label, d]) => ({
        label,
        value: d.revenue,
        sublabel: `${formatNumber(d.orders)} ta buyurtma`,
      }));
  }, [currentPoints]);

  const insights = useMemo(() => {
    if (currentPoints.length === 0) return [];
    const peakDay = currentPoints.reduce((best, p) => (p.revenue > best.revenue ? p : best), currentPoints[0]);
    const lowDay = currentPoints.reduce((low, p) => (p.revenue < low.revenue ? p : low), currentPoints[0]);
    const topRegion = regionItems[0];
    const topChannel = channelSlices[0];

    return [
      {
        title: 'Eng yuqori kunlik natija',
        detail: `${peakDay.label} sanasida ${formatMoney(peakDay.revenue, currency, true)} tushum va ${formatNumber(peakDay.orders)} ta buyurtma qayd etildi.`,
      },
      {
        title: 'Yetakchi hudud va kanal',
        detail: topRegion && topChannel
          ? `${topRegion.label} hududi (${formatMoney(topRegion.value, currency, true)}) hamda ${topChannel.label} kanali asosiy o‘sish drayveri bo‘ldi.`
          : 'Hududiy ma’lumotlar hisoblanmoqda.',
      },
      {
        title: 'Rentabellik va eng past nuqta',
        detail: `O‘rtacha sof foyda marjasi ${metrics.marginPct.toFixed(1)}% ni tashkil etdi. Eng sokin kun (${lowDay.label}) ko‘rsatkichi: ${formatMoney(lowDay.revenue, currency, true)}.`,
      },
    ];
  }, [currentPoints, regionItems, channelSlices, currency, metrics.marginPct]);

  const kpiCards = [
    {
      label: 'Jami tushum',
      value: formatMoney(metrics.revenue.val, currency, true),
      delta: metrics.revenue.delta,
    },
    {
      label: 'Sof foyda',
      value: formatMoney(metrics.profit.val, currency, true),
      delta: metrics.profit.delta,
    },
    {
      label: 'Buyurtmalar soni',
      value: `${formatNumber(metrics.orders.val)} ta`,
      delta: metrics.orders.delta,
    },
    {
      label: 'O‘rtacha chek',
      value: formatMoney(metrics.avgCheck.val, currency, false),
      delta: metrics.avgCheck.delta,
    },
  ];

  return (
    <div className="space-y-6">
      {/* Filter Toolbar */}
      <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
        <div className="inline-flex items-center rounded-xl bg-slate-200/70 p-1 dark:bg-slate-800/80 overflow-x-auto no-scrollbar">
          {PERIOD_OPTIONS.map((opt) => {
            const active = period === opt.id;
            return (
              <button
                key={opt.id}
                type="button"
                onClick={() => onPeriodChange(opt.id)}
                className={`min-h-[38px] whitespace-nowrap shrink-0 rounded-lg px-3.5 py-1.5 text-xs font-semibold transition-colors ${
                  active
                    ? 'bg-white text-slate-900 shadow-xs dark:bg-slate-900 dark:text-slate-100'
                    : 'text-slate-600 hover:text-slate-900 dark:text-slate-400 dark:hover:text-slate-200'
                }`}
              >
                {opt.label}
              </button>
            );
          })}
        </div>

        {/* Category horizontal scroller */}
        <div className="flex items-center gap-1.5 overflow-x-auto no-scrollbar pb-0.5">
          {['Barchasi', ...dataset.categories].map((cat) => {
            const active = selectedCategory === cat;
            return (
              <button
                key={cat}
                type="button"
                onClick={() => setSelectedCategory(cat)}
                className={`min-h-[38px] whitespace-nowrap shrink-0 rounded-lg border px-3 py-1.5 text-xs font-medium transition-colors ${
                  active
                    ? 'border-blue-600 bg-blue-600 text-white dark:border-blue-500 dark:bg-blue-500'
                    : 'border-slate-200 bg-white text-slate-600 hover:bg-slate-50 dark:border-slate-800 dark:bg-slate-900 dark:text-slate-300 dark:hover:bg-slate-800'
                }`}
              >
                {cat}
              </button>
            );
          })}
        </div>
      </div>

      {/* 4 KPI Summary Grid */}
      <div className="grid grid-cols-2 gap-3 lg:grid-cols-4 lg:gap-4">
        {kpiCards.map((kpi) => {
          const isPositive = kpi.delta >= 0;
          return (
            <div
              key={kpi.label}
              className="rounded-2xl border border-slate-200/80 bg-white p-4 dark:border-slate-800 dark:bg-slate-900"
            >
              <p className="text-xs font-medium text-slate-500 dark:text-slate-400">
                {kpi.label}
              </p>
              <p className="mt-1.5 font-mono text-lg font-bold tracking-tight text-slate-900 tabular-nums sm:text-xl dark:text-slate-100">
                {kpi.value}
              </p>
              <div className="mt-2 flex items-center gap-1 text-xs font-medium">
                {isPositive ? (
                  <ArrowUpRight className="h-3.5 w-3.5 text-emerald-600 dark:text-emerald-400" />
                ) : (
                  <ArrowDownRight className="h-3.5 w-3.5 text-rose-600 dark:text-rose-400" />
                )}
                <span
                  className={`font-mono tabular-nums ${
                    isPositive
                      ? 'text-emerald-700 dark:text-emerald-400'
                      : 'text-rose-700 dark:text-rose-400'
                  }`}
                >
                  {isPositive ? '+' : ''}
                  {kpi.delta.toFixed(1)}%
                </span>
                <span className="text-slate-400 dark:text-slate-500 truncate">
                  oldingi davrga
                </span>
              </div>
            </div>
          );
        })}
      </div>

      {/* Main Chart Card */}
      <section className="rounded-2xl border border-slate-200/80 bg-white p-4 sm:p-5 dark:border-slate-800 dark:bg-slate-900">
        <div className="mb-4 flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
          <div>
            <h2 className="text-base font-semibold text-slate-900 dark:text-slate-100">
              Dinamika va ko‘rsatkichlar tahlili
            </h2>
            <p className="text-xs text-slate-500 dark:text-slate-400">
              {getPeriodLabelUz(period)} · {selectedCategory} · Grafik ustida barmoq yoki sichqoncha bilan suring
            </p>
          </div>

          <div className="flex flex-wrap items-center gap-2">
            {/* Metric switcher */}
            <div className="inline-flex rounded-lg bg-slate-100 p-0.5 dark:bg-slate-800">
              {[
                { id: 'revenue' as const, label: 'Tushum' },
                { id: 'profit' as const, label: 'Foyda' },
                { id: 'orders' as const, label: 'Buyurtma' },
              ].map((m) => (
                <button
                  key={m.id}
                  type="button"
                  onClick={() => setChartMetric(m.id)}
                  className={`min-h-[36px] whitespace-nowrap shrink-0 rounded-md px-2.5 py-1 text-xs font-medium transition-colors ${
                    chartMetric === m.id
                      ? 'bg-white text-slate-900 shadow-xs dark:bg-slate-900 dark:text-slate-100'
                      : 'text-slate-600 dark:text-slate-400'
                  }`}
                >
                  {m.label}
                </button>
              ))}
            </div>

            {/* Chart Type switcher */}
            <div className="inline-flex rounded-lg border border-slate-200 p-0.5 dark:border-slate-700">
              <button
                type="button"
                onClick={() => setChartMode('line')}
                aria-label="Chiziqli grafik"
                className={`flex min-h-[36px] min-w-[36px] items-center justify-center rounded-md transition-colors ${
                  chartMode === 'line'
                    ? 'bg-slate-900 text-white dark:bg-slate-100 dark:text-slate-900'
                    : 'text-slate-500 hover:text-slate-800 dark:text-slate-400'
                }`}
              >
                <LineChart className="h-4 w-4" />
              </button>
              <button
                type="button"
                onClick={() => setChartMode('bar')}
                aria-label="Ustunli grafik"
                className={`flex min-h-[36px] min-w-[36px] items-center justify-center rounded-md transition-colors ${
                  chartMode === 'bar'
                    ? 'bg-slate-900 text-white dark:bg-slate-100 dark:text-slate-900'
                    : 'text-slate-500 hover:text-slate-800 dark:text-slate-400'
                }`}
              >
                <BarChart3 className="h-4 w-4" />
              </button>
            </div>
          </div>
        </div>

        <TrendChart
          data={chartData}
          mode={chartMode}
          showSecondary={chartMetric === 'revenue' && showExpenses}
          primaryLabel={
            chartMetric === 'revenue'
              ? 'Tushum'
              : chartMetric === 'profit'
              ? 'Sof foyda'
              : 'Buyurtmalar'
          }
          secondaryLabel="Xarajatlar"
          formatValue={(v) =>
            chartMetric === 'orders'
              ? `${formatNumber(v)} ta`
              : formatMoney(v, currency, true)
          }
        />

        {chartMetric === 'revenue' && (
          <div className="mt-3 flex items-center justify-between border-t border-slate-100 pt-3 dark:border-slate-800">
            <label className="flex min-h-[40px] cursor-pointer items-center gap-2.5 text-xs font-medium text-slate-600 dark:text-slate-300">
              <input
                type="checkbox"
                checked={showExpenses}
                onChange={(e) => setShowExpenses(e.target.checked)}
                className="h-4 w-4 rounded border-slate-300 text-blue-600 focus:ring-blue-500"
              />
              Xarajatlarni solishtirish chizig‘ini ko‘rsatish
            </label>
            <button
              type="button"
              onClick={onOpenAnalyzer}
              className="min-h-[40px] whitespace-nowrap shrink-0 text-xs font-semibold text-blue-600 hover:text-blue-700 dark:text-blue-400"
            >
              Chuqur tahlilga o‘tish
            </button>
          </div>
        )}
      </section>

      {/* Two-Column Breakdown: Channels + Regions */}
      <div className="grid grid-cols-1 gap-4 lg:grid-cols-2">
        <section className="rounded-2xl border border-slate-200/80 bg-white p-4 sm:p-5 dark:border-slate-800 dark:bg-slate-900">
          <div className="mb-4 flex items-baseline justify-between gap-2">
            <h3 className="text-base font-semibold text-slate-900 dark:text-slate-100">
              Kanallar bo‘yicha ulush
            </h3>
            <span className="text-xs text-slate-500 dark:text-slate-400">
              Segmentga bosing
            </span>
          </div>
          <DistributionRing
            slices={channelSlices}
            centerLabel="Jami tushum"
            centerValue={formatMoney(metrics.revenue.val, currency, true)}
            formatValue={(v) => formatMoney(v, currency, true)}
          />
        </section>

        <section className="rounded-2xl border border-slate-200/80 bg-white p-4 sm:p-5 dark:border-slate-800 dark:bg-slate-900">
          <div className="mb-4 flex items-baseline justify-between gap-2">
            <h3 className="text-base font-semibold text-slate-900 dark:text-slate-100">
              Hududlar kesimida tushum
            </h3>
            <span className="text-xs text-slate-500 dark:text-slate-400">
              Top {regionItems.length} hudud
            </span>
          </div>
          <ComparisonBars
            items={regionItems}
            formatValue={(v) => formatMoney(v, currency, true)}
          />
        </section>
      </div>

      {/* Statistical Insights */}
      <section className="rounded-2xl border border-slate-200/80 bg-white p-4 sm:p-5 dark:border-slate-800 dark:bg-slate-900">
        <div className="mb-3 flex items-center gap-2">
          <TrendingUp className="h-4 w-4 text-blue-600 dark:text-blue-400" />
          <h3 className="text-base font-semibold text-slate-900 dark:text-slate-100">
            Avtomatik statistik xulosalar
          </h3>
        </div>
        <div className="divide-y divide-slate-100 dark:divide-slate-800">
          {insights.map((ins, i) => (
            <div key={i} className="py-3 first:pt-1 last:pb-1">
              <p className="text-sm font-semibold text-slate-800 dark:text-slate-200">
                {ins.title}
              </p>
              <p className="mt-0.5 text-sm leading-relaxed text-slate-600 dark:text-slate-400">
                {ins.detail}
              </p>
            </div>
          ))}
        </div>
      </section>
    </div>
  );
};
