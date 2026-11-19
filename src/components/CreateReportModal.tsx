import React, { useState } from 'react';
import { FileUp, Plus, Trash2, X } from 'lucide-react';
import { formatMoney, parseCsvText } from '../data/datasets';
import { CurrencyCode, CustomCsvDataset, ReportDocument, ReportRow } from '../types/analytics';

interface CreateReportModalProps {
  isOpen: boolean;
  currency: CurrencyCode;
  onClose: () => void;
  onCreateReport: (report: ReportDocument) => void;
  onUploadCsv: (csv: CustomCsvDataset) => void;
}

export const CreateReportModal: React.FC<CreateReportModalProps> = ({
  isOpen,
  currency,
  onClose,
  onCreateReport,
  onUploadCsv,
}) => {
  const [title, setTitle] = useState('');
  const [category, setCategory] = useState('Savdo');
  const [periodLabel, setPeriodLabel] = useState('Noyabr, 2026');
  const [summary, setSummary] = useState('');
  const [items, setItems] = useState<{ name: string; region: string; value: string }[]>([
    { name: 'Asosiy yo‘nalish', region: 'Toshkent', value: '125000000' },
    { name: 'Hududiy bo‘lim', region: 'Samarqand', value: '68000000' },
  ]);
  const [errorMsg, setErrorMsg] = useState('');

  if (!isOpen) return null;

  const handleAddRow = () => {
    setItems((prev) => [...prev, { name: '', region: 'Toshkent', value: '0' }]);
  };

  const handleRemoveRow = (idx: number) => {
    if (items.length <= 1) return;
    setItems((prev) => prev.filter((_, i) => i !== idx));
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!title.trim()) {
      setErrorMsg('Iltimos, hisobot sarlavhasini kiriting.');
      return;
    }

    const validItems = items.filter((it) => it.name.trim() !== '');
    if (validItems.length === 0) {
      setErrorMsg('Kamida bitta ma’lumot qatorini kiriting.');
      return;
    }

    const numericValues = validItems.map((it) => Math.max(0, Number(it.value) || 0));
    const total = numericValues.reduce((s, v) => s + v, 0) || 1;

    const rows: ReportRow[] = validItems.map((it, idx) => {
      const val = numericValues[idx];
      return {
        id: `custom-row-${Date.now()}-${idx}`,
        name: it.name.trim(),
        category,
        region: it.region.trim() || 'Toshkent',
        value: val,
        secondaryValue: Math.round(val / 100000),
        growthPct: 12.5 - idx * 2.1,
        sharePct: Number(((val / total) * 100).toFixed(1)),
      };
    });

    const newReport: ReportDocument = {
      id: `rep-custom-${Date.now()}`,
      title: title.trim(),
      category,
      periodLabel: periodLabel.trim() || 'Joriy davr',
      updatedAt: 'Bugun',
      author: 'Foydalanuvchi',
      status: 'Tayyor',
      summary:
        summary.trim() ||
        `${title.trim()} bo‘yicha ${rows.length} ta yo‘nalish kesimida umumiy qiymati ${formatMoney(total, currency, true)} bo‘lgan hisobot shakllantirildi.`,
      highlights: [
        { label: 'Jami qiymat', value: formatMoney(total, currency, true), deltaPct: 11.4 },
        { label: 'Qatorlar soni', value: `${rows.length} ta`, deltaPct: 0 },
        { label: 'O‘rtacha ulush', value: `${(100 / rows.length).toFixed(1)}%`, deltaPct: 2.5 },
      ],
      series: rows.map((r) => ({
        label: r.name.slice(0, 8),
        value: Math.round(r.value / 1_000_000),
        prevValue: Math.round((r.value * 0.85) / 1_000_000),
      })),
      rows,
      valueUnit: 'currency',
    };

    onCreateReport(newReport);
    setTitle('');
    setSummary('');
    setErrorMsg('');
    onClose();
  };

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    const reader = new FileReader();
    reader.onload = () => {
      try {
        const parsed = parseCsvText(String(reader.result || ''), file.name);
        onUploadCsv(parsed);
        onClose();
      } catch (err) {
        setErrorMsg(err instanceof Error ? err.message : 'CSV faylni o‘qishda xatolik.');
      }
    };
    reader.readAsText(file);
  };

  return (
    <div
      className="fixed inset-0 z-50 flex items-end justify-center bg-slate-950/50 backdrop-blur-xs sm:items-center sm:p-4"
      role="dialog"
      aria-modal="true"
      aria-label="Yangi hisobot yaratish"
    >
      <div className="absolute inset-0" onClick={onClose} />

      <div className="relative z-10 flex max-h-[92vh] w-full max-w-lg flex-col rounded-t-3xl bg-white shadow-2xl sm:rounded-2xl dark:bg-slate-900">
        <div className="flex justify-center pt-3 pb-1 sm:hidden">
          <div className="h-1.5 w-10 rounded-full bg-slate-300 dark:bg-slate-700" />
        </div>

        <div className="flex items-center justify-between border-b border-slate-100 px-5 py-4 dark:border-slate-800">
          <h2 className="text-base font-bold text-slate-900 dark:text-slate-100">
            Yangi hisobot yaratish
          </h2>
          <button
            type="button"
            onClick={onClose}
            aria-label="Yopish"
            className="flex min-h-[44px] min-w-[44px] items-center justify-center rounded-xl text-slate-500 hover:bg-slate-100 dark:hover:bg-slate-800"
          >
            <X className="h-5 w-5" />
          </button>
        </div>

        <form onSubmit={handleSubmit} className="flex-1 space-y-4 overflow-y-auto px-5 py-4">
          {/* Quick CSV Upload Option */}
          <label className="flex min-h-[52px] cursor-pointer items-center justify-between gap-3 rounded-xl border border-dashed border-blue-300 bg-blue-50/50 px-4 py-3 transition-colors hover:bg-blue-50 dark:border-blue-800 dark:bg-blue-950/30 dark:hover:bg-blue-950/50">
            <div className="flex items-center gap-3 min-w-0">
              <FileUp className="h-5 w-5 shrink-0 text-blue-600 dark:text-blue-400" />
              <div className="min-w-0">
                <p className="text-sm font-semibold text-blue-900 dark:text-blue-200">
                  CSV fayldan tezkor tahlil qilish
                </p>
                <p className="text-xs text-blue-700 dark:text-blue-400 truncate">
                  Qurilmadan .csv jadval yuklang
                </p>
              </div>
            </div>
            <input
              type="file"
              accept=".csv,text/csv"
              onChange={handleFileChange}
              className="sr-only"
            />
          </label>

          <div className="relative flex items-center py-1">
            <div className="flex-grow border-t border-slate-200 dark:border-slate-800" />
            <span className="mx-3 shrink text-xs text-slate-400">yoki qo‘lda kiriting</span>
            <div className="flex-grow border-t border-slate-200 dark:border-slate-800" />
          </div>

          {errorMsg && (
            <div className="rounded-xl bg-rose-50 px-3.5 py-2.5 text-xs font-medium text-rose-700 dark:bg-rose-950/50 dark:text-rose-300">
              {errorMsg}
            </div>
          )}

          <div>
            <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300">
              Hisobot nomi
            </label>
            <input
              type="text"
              value={title}
              onChange={(e) => setTitle(e.target.value)}
              placeholder="Masalan: Dekabr oyi reja hisoboti"
              className="mt-1 min-h-[44px] w-full rounded-xl border border-slate-200 bg-white px-3.5 text-sm text-slate-900 focus:border-blue-500 focus:outline-none dark:border-slate-700 dark:bg-slate-800 dark:text-slate-100"
            />
          </div>

          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300">
                Bo‘lim
              </label>
              <select
                value={category}
                onChange={(e) => setCategory(e.target.value)}
                className="mt-1 min-h-[44px] w-full rounded-xl border border-slate-200 bg-white px-3 text-sm text-slate-900 focus:border-blue-500 focus:outline-none dark:border-slate-700 dark:bg-slate-800 dark:text-slate-100"
              >
                <option value="Savdo">Savdo</option>
                <option value="Moliya">Moliya</option>
                <option value="Mijozlar">Mijozlar</option>
                <option value="Operatsion">Operatsion</option>
              </select>
            </div>
            <div>
              <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300">
                Davr
              </label>
              <input
                type="text"
                value={periodLabel}
                onChange={(e) => setPeriodLabel(e.target.value)}
                className="mt-1 min-h-[44px] w-full rounded-xl border border-slate-200 bg-white px-3.5 text-sm text-slate-900 focus:border-blue-500 focus:outline-none dark:border-slate-700 dark:bg-slate-800 dark:text-slate-100"
              />
            </div>
          </div>

          <div>
            <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300">
              Qisqacha izoh
            </label>
            <textarea
              rows={2}
              value={summary}
              onChange={(e) => setSummary(e.target.value)}
              placeholder="Asosiy xulosalar va natijalar..."
              className="mt-1 w-full rounded-xl border border-slate-200 bg-white px-3.5 py-2.5 text-sm text-slate-900 focus:border-blue-500 focus:outline-none dark:border-slate-700 dark:bg-slate-800 dark:text-slate-100"
            />
          </div>

          <div className="space-y-2">
            <div className="flex items-center justify-between">
              <label className="text-xs font-semibold text-slate-700 dark:text-slate-300">
                Ko‘rsatkich qatorlari (so‘mda)
              </label>
              <button
                type="button"
                onClick={handleAddRow}
                className="inline-flex min-h-[36px] items-center gap-1 text-xs font-semibold text-blue-600 dark:text-blue-400"
              >
                <Plus className="h-3.5 w-3.5" /> Qator qo‘shish
              </button>
            </div>

            {items.map((it, idx) => (
              <div key={idx} className="grid grid-cols-12 gap-2 items-center">
                <input
                  type="text"
                  value={it.name}
                  onChange={(e) =>
                    setItems((prev) =>
                      prev.map((row, i) => (i === idx ? { ...row, name: e.target.value } : row))
                    )
                  }
                  placeholder="Yo‘nalish"
                  className="col-span-5 min-h-[42px] rounded-lg border border-slate-200 bg-white px-2.5 text-xs dark:border-slate-700 dark:bg-slate-800"
                />
                <input
                  type="text"
                  value={it.region}
                  onChange={(e) =>
                    setItems((prev) =>
                      prev.map((row, i) => (i === idx ? { ...row, region: e.target.value } : row))
                    )
                  }
                  placeholder="Hudud"
                  className="col-span-3 min-h-[42px] rounded-lg border border-slate-200 bg-white px-2.5 text-xs dark:border-slate-700 dark:bg-slate-800"
                />
                <input
                  type="number"
                  value={it.value}
                  onChange={(e) =>
                    setItems((prev) =>
                      prev.map((row, i) => (i === idx ? { ...row, value: e.target.value } : row))
                    )
                  }
                  placeholder="Qiymat"
                  className="col-span-3 min-h-[42px] rounded-lg border border-slate-200 bg-white px-2.5 font-mono text-xs dark:border-slate-700 dark:bg-slate-800"
                />
                <button
                  type="button"
                  onClick={() => handleRemoveRow(idx)}
                  aria-label="Qatorni o‘chirish"
                  className="col-span-1 flex min-h-[42px] items-center justify-center text-slate-400 hover:text-rose-600"
                >
                  <Trash2 className="h-4 w-4" />
                </button>
              </div>
            ))}
          </div>

          <div className="flex items-center gap-3 pt-2 pb-safe">
            <button
              type="button"
              onClick={onClose}
              className="min-h-[44px] flex-1 rounded-xl border border-slate-200 text-sm font-semibold text-slate-700 hover:bg-slate-50 dark:border-slate-700 dark:text-slate-200 dark:hover:bg-slate-800"
            >
              Bekor qilish
            </button>
            <button
              type="submit"
              className="min-h-[44px] flex-1 rounded-xl bg-blue-600 text-sm font-semibold text-white hover:bg-blue-700 dark:bg-blue-500"
            >
              Saqlash
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};
