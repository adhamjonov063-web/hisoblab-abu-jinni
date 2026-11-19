import React from 'react';
import {
  Bookmark,
  Check,
  Database,
  Download,
  Moon,
  Sun,
} from 'lucide-react';
import {
  DATASET_PRESETS,
  downloadCsvFile,
  SAMPLE_CSV_TEMPLATE,
} from '../data/datasets';
import {
  CurrencyCode,
  DatasetPresetId,
  ReportDocument,
} from '../types/analytics';

interface SettingsTabProps {
  activePreset: DatasetPresetId;
  onChangePreset: (id: DatasetPresetId) => void;
  currency: CurrencyCode;
  onChangeCurrency: (c: CurrencyCode) => void;
  isDark: boolean;
  onToggleDark: () => void;
  bookmarkedReports: ReportDocument[];
  onOpenReport: (r: ReportDocument) => void;
}

export const SettingsTab: React.FC<SettingsTabProps> = ({
  activePreset,
  onChangePreset,
  currency,
  onChangeCurrency,
  isDark,
  onToggleDark,
  bookmarkedReports,
  onOpenReport,
}) => {
  const handleDownloadTemplate = () => {
    const lines = SAMPLE_CSV_TEMPLATE.split('\n');
    const headers = lines[0].split(',');
    const rows = lines.slice(1).map((l) => l.split(','));
    downloadCsvFile('hisoblab_namuna_shablon.csv', headers, rows);
  };

  return (
    <div className="space-y-6 max-w-3xl">
      {/* Dataset Profile Switcher */}
      <section className="rounded-2xl border border-slate-200/80 bg-white p-4 sm:p-5 dark:border-slate-800 dark:bg-slate-900">
        <div className="mb-3 flex items-center gap-2">
          <Database className="h-4 w-4 text-blue-600 dark:text-blue-400" />
          <h2 className="text-base font-semibold text-slate-900 dark:text-slate-100">
            Faol ma’lumotlar bazasi
          </h2>
        </div>
        <p className="mb-4 text-xs text-slate-500 dark:text-slate-400">
          Turli biznes yo‘nalishlari bo‘yicha tayyor hisobot va tahlil profillarini almashtiring.
        </p>

        <div className="divide-y divide-slate-100 dark:divide-slate-800">
          {(Object.keys(DATASET_PRESETS) as DatasetPresetId[]).map((id) => {
            const preset = DATASET_PRESETS[id];
            const isSelected = activePreset === id;
            return (
              <button
                key={id}
                type="button"
                onClick={() => onChangePreset(id)}
                className="flex min-h-[60px] w-full items-center justify-between gap-3 py-3 text-left transition-colors hover:bg-slate-50/70 dark:hover:bg-slate-800/40 px-2 -mx-2 rounded-xl"
              >
                <div className="min-w-0">
                  <p className="text-sm font-semibold text-slate-900 dark:text-slate-100">
                    {preset.name}
                  </p>
                  <p className="mt-0.5 text-xs text-slate-500 dark:text-slate-400">
                    {preset.description}
                  </p>
                </div>
                <div
                  className={`flex h-6 w-6 shrink-0 items-center justify-center rounded-full border ${
                    isSelected
                      ? 'border-blue-600 bg-blue-600 text-white dark:border-blue-500 dark:bg-blue-500'
                      : 'border-slate-300 dark:border-slate-700'
                  }`}
                >
                  {isSelected && <Check className="h-3.5 w-3.5" />}
                </div>
              </button>
            );
          })}
        </div>
      </section>

      {/* Display & Formatting Preferences */}
      <section className="rounded-2xl border border-slate-200/80 bg-white p-4 sm:p-5 dark:border-slate-800 dark:bg-slate-900">
        <h2 className="text-base font-semibold text-slate-900 dark:text-slate-100">
          Ko‘rinish va valyuta sozlamalari
        </h2>

        <div className="mt-4 divide-y divide-slate-100 dark:divide-slate-800">
          <div className="flex min-h-[56px] items-center justify-between gap-4 py-3">
            <div>
              <p className="text-sm font-medium text-slate-900 dark:text-slate-100">
                Asosiy valyuta
              </p>
              <p className="text-xs text-slate-500 dark:text-slate-400">
                1 USD = 12 800 so‘m kursida hisoblanadi
              </p>
            </div>
            <div className="inline-flex rounded-xl bg-slate-100 p-1 dark:bg-slate-800">
              {(['UZS', 'USD'] as CurrencyCode[]).map((c) => (
                <button
                  key={c}
                  type="button"
                  onClick={() => onChangeCurrency(c)}
                  className={`min-h-[36px] rounded-lg px-3.5 text-xs font-semibold transition-colors ${
                    currency === c
                      ? 'bg-white text-slate-900 shadow-xs dark:bg-slate-900 dark:text-slate-100'
                      : 'text-slate-600 dark:text-slate-400'
                  }`}
                >
                  {c}
                </button>
              ))}
            </div>
          </div>

          <div className="flex min-h-[56px] items-center justify-between gap-4 py-3">
            <div>
              <p className="text-sm font-medium text-slate-900 dark:text-slate-100">
                Ilova mavzusi
              </p>
              <p className="text-xs text-slate-500 dark:text-slate-400">
                Yorug‘ yoki tungi rejimni tanlang
              </p>
            </div>
            <button
              type="button"
              onClick={onToggleDark}
              className="inline-flex min-h-[42px] items-center gap-2 rounded-xl border border-slate-200 bg-slate-50 px-3.5 py-2 text-xs font-semibold text-slate-800 hover:bg-slate-100 dark:border-slate-700 dark:bg-slate-800 dark:text-slate-100 dark:hover:bg-slate-700"
            >
              {isDark ? (
                <>
                  <Sun className="h-4 w-4 text-amber-400" />
                  Yorug‘ rejim
                </>
              ) : (
                <>
                  <Moon className="h-4 w-4 text-slate-600" />
                  Tungi rejim
                </>
              )}
            </button>
          </div>

          <div className="flex min-h-[56px] items-center justify-between gap-4 py-3">
            <div>
              <p className="text-sm font-medium text-slate-900 dark:text-slate-100">
                CSV shablon fayli
              </p>
              <p className="text-xs text-slate-500 dark:text-slate-400">
                O‘z ma’lumotlaringizni yuklash uchun namuna jadval
              </p>
            </div>
            <button
              type="button"
              onClick={handleDownloadTemplate}
              className="inline-flex min-h-[42px] items-center gap-2 rounded-xl border border-slate-200 px-3.5 py-2 text-xs font-semibold text-slate-700 hover:bg-slate-50 dark:border-slate-700 dark:text-slate-200 dark:hover:bg-slate-800"
            >
              <Download className="h-4 w-4" />
              Yuklab olish
            </button>
          </div>
        </div>
      </section>

      {/* Bookmarked Reports Quick List */}
      <section className="rounded-2xl border border-slate-200/80 bg-white p-4 sm:p-5 dark:border-slate-800 dark:bg-slate-900">
        <div className="mb-3 flex items-center gap-2">
          <Bookmark className="h-4 w-4 text-blue-600 dark:text-blue-400" />
          <h2 className="text-base font-semibold text-slate-900 dark:text-slate-100">
            Saqlangan hisobotlar ({bookmarkedReports.length})
          </h2>
        </div>

        {bookmarkedReports.length === 0 ? (
          <p className="text-xs text-slate-500 dark:text-slate-400">
            Hali birorta hisobot saqlanmagan. Hisobotlar bo‘limidan xatcho‘p belgisini bosib saqlashingiz mumkin.
          </p>
        ) : (
          <div className="divide-y divide-slate-100 dark:divide-slate-800">
            {bookmarkedReports.map((rep) => (
              <button
                key={rep.id}
                type="button"
                onClick={() => onOpenReport(rep)}
                className="flex min-h-[48px] w-full items-center justify-between gap-3 py-2.5 text-left hover:text-blue-600 dark:hover:text-blue-400"
              >
                <span className="truncate text-sm font-medium text-slate-800 dark:text-slate-200">
                  {rep.title}
                </span>
                <span className="shrink-0 text-xs text-slate-400">
                  {rep.periodLabel}
                </span>
              </button>
            ))}
          </div>
        )}
      </section>
    </div>
  );
};
