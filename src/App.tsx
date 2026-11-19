import React, { useEffect, useMemo, useState } from 'react';
import {
  BarChart2,
  FileSpreadsheet,
  LayoutDashboard,
  Plus,
  SlidersHorizontal,
  Users,
} from 'lucide-react';
import { AnalyzerTab } from './components/AnalyzerTab';
import { CreateReportModal } from './components/CreateReportModal';
import { EmployeeDetailSheet } from './components/EmployeeDetailSheet';
import { EmployeeFormModal } from './components/EmployeeFormModal';
import { EmployeesTab } from './components/EmployeesTab';
import { OverviewTab } from './components/OverviewTab';
import { ReportDetailSheet } from './components/ReportDetailSheet';
import { ReportsTab } from './components/ReportsTab';
import { SettingsTab } from './components/SettingsTab';
import { DATASET_PRESETS } from './data/datasets';
import {
  CurrencyCode,
  CustomCsvDataset,
  DatasetPresetId,
  Employee,
  NavTab,
  ReportDocument,
  TimePeriod,
} from './types/analytics';

const NAV_ITEMS: { id: NavTab; label: string; icon: React.ComponentType<{ className?: string }> }[] = [
  { id: 'overview', label: 'Umumiy', icon: LayoutDashboard },
  { id: 'reports', label: 'Hisobotlar', icon: FileSpreadsheet },
  { id: 'employees', label: 'Ishchilar', icon: Users },
  { id: 'analyzer', label: 'Tahlil', icon: BarChart2 },
  { id: 'settings', label: 'Sozlamalar', icon: SlidersHorizontal },
];

const TAB_TITLES: Record<NavTab, { title: string; subtitle: string }> = {
  overview: {
    title: 'Umumiy ko‘rsatkichlar',
    subtitle: 'Asosiy moliyaviy va operatsion natijalar dinamikasi',
  },
  reports: {
    title: 'Hisobotlar ro‘yxati',
    subtitle: 'Tayyor hisobotlarni ko‘rish, saralash va eksport qilish',
  },
  employees: {
    title: 'Ishchilar va samaradorlik',
    subtitle: 'Xodimlar ro‘yxati, reja bajarilishi va oylik natijalar tahlili',
  },
  analyzer: {
    title: 'Ma’lumotlarni tahlil qilish',
    subtitle: 'Ustunlar kesimida guruhlash, taqqoslash va CSV tahlili',
  },
  settings: {
    title: 'Ma’lumotlar va sozlamalar',
    subtitle: 'Faol biznes profili, valyuta va ko‘rinish parametrlari',
  },
};

export default function App() {
  const [activeTab, setActiveTab] = useState<NavTab>('overview');
  const [activePreset, setActivePreset] = useState<DatasetPresetId>('retail');
  const [period, setPeriod] = useState<TimePeriod>('30d');
  const [currency, setCurrency] = useState<CurrencyCode>('UZS');
  const [isDark, setIsDark] = useState<boolean>(() => {
    try {
      return localStorage.getItem('hisoblab_dark') === 'true';
    } catch {
      return false;
    }
  });

  const [customReports, setCustomReports] = useState<ReportDocument[]>(() => {
    try {
      const saved = localStorage.getItem('hisoblab_custom_reports');
      return saved ? JSON.parse(saved) : [];
    } catch {
      return [];
    }
  });

  const [bookmarkedIds, setBookmarkedIds] = useState<string[]>(() => {
    try {
      const saved = localStorage.getItem('hisoblab_bookmarks');
      return saved ? JSON.parse(saved) : ['rep-retail-01'];
    } catch {
      return ['rep-retail-01'];
    }
  });

  const [employeesByPreset, setEmployeesByPreset] = useState<Record<DatasetPresetId, Employee[]>>(() => {
    try {
      const saved = localStorage.getItem('hisoblab_employees');
      if (saved) return JSON.parse(saved);
    } catch {
      // ignore
    }
    return {
      retail: DATASET_PRESETS.retail.employees,
      saas: DATASET_PRESETS.saas.employees,
      logistics: DATASET_PRESETS.logistics.employees,
    };
  });

  const [customCsv, setCustomCsv] = useState<CustomCsvDataset | null>(null);
  const [selectedReport, setSelectedReport] = useState<ReportDocument | null>(null);
  const [selectedEmployee, setSelectedEmployee] = useState<Employee | null>(null);
  const [isCreateOpen, setIsCreateOpen] = useState<boolean>(false);
  const [isEmpFormOpen, setIsEmpFormOpen] = useState<boolean>(false);
  const [editingEmployee, setEditingEmployee] = useState<Employee | null>(null);
  const [toastMsg, setToastMsg] = useState<string | null>(null);

  useEffect(() => {
    document.documentElement.classList.toggle('dark', isDark);
    try {
      localStorage.setItem('hisoblab_dark', String(isDark));
    } catch {
      // ignore storage errors
    }
  }, [isDark]);

  useEffect(() => {
    try {
      localStorage.setItem('hisoblab_custom_reports', JSON.stringify(customReports));
    } catch {
      // ignore
    }
  }, [customReports]);

  useEffect(() => {
    try {
      localStorage.setItem('hisoblab_bookmarks', JSON.stringify(bookmarkedIds));
    } catch {
      // ignore
    }
  }, [bookmarkedIds]);

  useEffect(() => {
    try {
      localStorage.setItem('hisoblab_employees', JSON.stringify(employeesByPreset));
    } catch {
      // ignore
    }
  }, [employeesByPreset]);

  const showToast = (msg: string) => {
    setToastMsg(msg);
    setTimeout(() => {
      setToastMsg((curr) => (curr === msg ? null : curr));
    }, 3200);
  };

  const currentDataset = DATASET_PRESETS[activePreset];
  const currentEmployees = employeesByPreset[activePreset] || currentDataset.employees;

  const allReports = useMemo(() => {
    return [...customReports, ...currentDataset.reports];
  }, [customReports, currentDataset.reports]);

  const bookmarkedReports = useMemo(() => {
    return allReports.filter((r) => bookmarkedIds.includes(r.id));
  }, [allReports, bookmarkedIds]);

  const handleToggleBookmark = (id: string) => {
    setBookmarkedIds((prev) =>
      prev.includes(id) ? prev.filter((item) => item !== id) : [...prev, id]
    );
  };

  const handleCreateReport = (rep: ReportDocument) => {
    setCustomReports((prev) => [rep, ...prev]);
    setActiveTab('reports');
    setSelectedReport(rep);
    showToast('Yangi hisobot saqlandi');
  };

  const handleUploadCsv = (csv: CustomCsvDataset | null) => {
    setCustomCsv(csv);
    if (csv) {
      setActiveTab('analyzer');
      showToast(`${csv.fileName} tahlil uchun yuklandi`);
    }
  };

  const handleSaveEmployee = (emp: Employee) => {
    setEmployeesByPreset((prev) => {
      const list = prev[activePreset] || [];
      const exists = list.some((item) => item.id === emp.id);
      const updatedList = exists
        ? list.map((item) => (item.id === emp.id ? emp : item))
        : [emp, ...list];
      return { ...prev, [activePreset]: updatedList };
    });
    if (selectedEmployee?.id === emp.id) {
      setSelectedEmployee(emp);
    }
    showToast(editingEmployee ? 'Ishchi ma’lumotlari yangilandi' : 'Yangi ishchi qo‘shildi');
    setEditingEmployee(null);
  };

  const handleDeleteEmployee = (id: string) => {
    setEmployeesByPreset((prev) => ({
      ...prev,
      [activePreset]: (prev[activePreset] || []).filter((e) => e.id !== id),
    }));
    setSelectedEmployee(null);
    showToast('Ishchi ro‘yxatdan o‘chirildi');
  };

  return (
    <div className="min-h-screen bg-slate-50 text-slate-900 dark:bg-slate-950 dark:text-slate-100">
      {/* Top Bar Contract: [Brand] — [4 single-line nav links on desktop] — [1 primary action] */}
      <header className="no-print sticky top-0 z-30 border-b border-slate-200/80 bg-white/90 backdrop-blur-md dark:border-slate-800 dark:bg-slate-900/90">
        <div className="mx-auto flex h-[52px] max-w-7xl items-center justify-between gap-8 px-4 sm:px-6 lg:h-16">
          {/* Zone 1: Single-line Brand Title */}
          <button
            type="button"
            onClick={() => setActiveTab('overview')}
            className="font-display text-lg font-bold tracking-tight text-slate-900 whitespace-nowrap shrink-0 dark:text-slate-100"
          >
            HisobLab
          </button>

          {/* Zone 2: Concise single-line desktop nav links */}
          <nav className="hidden lg:flex items-center gap-7 text-sm font-medium text-slate-600 dark:text-slate-400">
            {NAV_ITEMS.map((item) => {
              const active = activeTab === item.id;
              return (
                <button
                  key={item.id}
                  type="button"
                  onClick={() => setActiveTab(item.id)}
                  className={`relative py-2 whitespace-nowrap shrink-0 transition-colors ${
                    active
                      ? 'font-semibold text-blue-600 dark:text-blue-400'
                      : 'hover:text-slate-900 dark:hover:text-slate-100'
                  }`}
                >
                  {item.label}
                  {active && (
                    <span className="absolute inset-x-0 -bottom-[17px] h-0.5 bg-blue-600 dark:bg-blue-400" />
                  )}
                </button>
              );
            })}
          </nav>

          {/* Zone 3: 1 Primary Action */}
          <div className="flex items-center shrink-0">
            <button
              type="button"
              onClick={() => {
                if (activeTab === 'employees') {
                  setEditingEmployee(null);
                  setIsEmpFormOpen(true);
                } else {
                  setIsCreateOpen(true);
                }
              }}
              className="inline-flex min-h-[38px] items-center gap-1.5 whitespace-nowrap shrink-0 rounded-xl bg-blue-600 px-3.5 py-1.5 text-xs font-semibold text-white transition-colors hover:bg-blue-700 active:scale-[0.98] sm:min-h-[40px] sm:px-4 dark:bg-blue-500 dark:hover:bg-blue-600"
            >
              <Plus className="h-4 w-4" />
              <span>{activeTab === 'employees' ? 'Ishchi qo‘shish' : 'Yangi hisobot'}</span>
            </button>
          </div>
        </div>
      </header>

      {/* Main Content Area (Leaves space on mobile for fixed 60px bottom tab bar) */}
      <main className="mx-auto max-w-7xl px-4 pt-5 pb-24 sm:px-6 lg:py-8">
        {/* Page Heading + Active Profile Context */}
        <div className="mb-5 flex flex-col gap-1 sm:mb-6 sm:flex-row sm:items-end sm:justify-between">
          <div>
            <h1 className="font-display text-xl font-bold tracking-tight text-slate-900 sm:text-2xl dark:text-slate-100">
              {TAB_TITLES[activeTab].title}
            </h1>
            <p className="mt-0.5 text-xs text-slate-500 sm:text-sm dark:text-slate-400">
              {TAB_TITLES[activeTab].subtitle}
            </p>
          </div>
          <div className="text-xs text-slate-500 dark:text-slate-400">
            Profil: <span className="font-medium text-slate-700 dark:text-slate-300">{currentDataset.name}</span>
          </div>
        </div>

        {/* Active Tab View */}
        {activeTab === 'overview' && (
          <OverviewTab
            dataset={currentDataset}
            currency={currency}
            period={period}
            onPeriodChange={setPeriod}
            onOpenAnalyzer={() => setActiveTab('analyzer')}
          />
        )}

        {activeTab === 'reports' && (
          <ReportsTab
            reports={allReports}
            bookmarkedIds={bookmarkedIds}
            onToggleBookmark={handleToggleBookmark}
            onSelectReport={(r) => setSelectedReport(r)}
            onOpenCreateModal={() => setIsCreateOpen(true)}
          />
        )}

        {activeTab === 'employees' && (
          <EmployeesTab
            employees={currentEmployees}
            currency={currency}
            onSelectEmployee={(emp) => setSelectedEmployee(emp)}
            onOpenAddModal={() => {
              setEditingEmployee(null);
              setIsEmpFormOpen(true);
            }}
          />
        )}

        {activeTab === 'analyzer' && (
          <AnalyzerTab
            dataset={currentDataset}
            currency={currency}
            period={period}
            customCsv={customCsv}
            onUploadCsv={handleUploadCsv}
          />
        )}

        {activeTab === 'settings' && (
          <SettingsTab
            activePreset={activePreset}
            onChangePreset={(id) => {
              setActivePreset(id);
              showToast(`${DATASET_PRESETS[id].name} profili faollashtirildi`);
            }}
            currency={currency}
            onChangeCurrency={setCurrency}
            isDark={isDark}
            onToggleDark={() => setIsDark((d) => !d)}
            bookmarkedReports={bookmarkedReports}
            onOpenReport={(r) => setSelectedReport(r)}
          />
        )}
      </main>

      {/* Mobile Fixed Bottom Tab Bar (60px height, thumb-zone anchored, hidden on lg+) */}
      <nav
        aria-label="Asosiy mobil navigatsiya"
        className="no-print fixed bottom-0 left-0 right-0 z-40 border-t border-slate-200/90 bg-white/95 backdrop-blur-md pb-safe lg:hidden dark:border-slate-800 dark:bg-slate-900/95"
      >
        <div className="grid h-[60px] grid-cols-5 items-center">
          {NAV_ITEMS.map((item) => {
            const Icon = item.icon;
            const active = activeTab === item.id;
            return (
              <button
                key={item.id}
                type="button"
                onClick={() => setActiveTab(item.id)}
                className={`flex min-h-[44px] flex-col items-center justify-center gap-1 transition-colors ${
                  active
                    ? 'text-blue-600 dark:text-blue-400'
                    : 'text-slate-500 hover:text-slate-800 dark:text-slate-400 dark:hover:text-slate-200'
                }`}
              >
                <Icon className={`h-5 w-5 ${active ? 'stroke-[2.25]' : 'stroke-[1.75]'}`} />
                <span className="text-[10px] font-medium tracking-tight leading-none whitespace-nowrap">
                  {item.label}
                </span>
              </button>
            );
          })}
        </div>
      </nav>

      {/* Report Detail Drawer / Bottom Sheet */}
      <ReportDetailSheet
        report={selectedReport}
        currency={currency}
        isBookmarked={selectedReport ? bookmarkedIds.includes(selectedReport.id) : false}
        onToggleBookmark={handleToggleBookmark}
        onClose={() => setSelectedReport(null)}
      />

      {/* Employee Detail Drawer / Bottom Sheet */}
      <EmployeeDetailSheet
        employee={selectedEmployee}
        currency={currency}
        onClose={() => setSelectedEmployee(null)}
        onEdit={(emp) => {
          setEditingEmployee(emp);
          setIsEmpFormOpen(true);
        }}
        onDelete={handleDeleteEmployee}
      />

      {/* Create Report / CSV Upload Modal */}
      <CreateReportModal
        isOpen={isCreateOpen}
        currency={currency}
        onClose={() => setIsCreateOpen(false)}
        onCreateReport={handleCreateReport}
        onUploadCsv={handleUploadCsv}
      />

      {/* Add / Edit Employee Modal */}
      <EmployeeFormModal
        isOpen={isEmpFormOpen}
        editingEmployee={editingEmployee}
        regions={currentDataset.regions}
        onClose={() => {
          setIsEmpFormOpen(false);
          setEditingEmployee(null);
        }}
        onSave={handleSaveEmployee}
      />

      {/* Subtle Toast Notification */}
      {toastMsg && (
        <div
          role="status"
          className="fixed bottom-20 left-1/2 z-50 -translate-x-1/2 rounded-xl bg-slate-900 px-4 py-2.5 text-xs font-medium text-white shadow-lg lg:bottom-6 dark:bg-slate-100 dark:text-slate-900"
        >
          {toastMsg}
        </div>
      )}
    </div>
  );
}
