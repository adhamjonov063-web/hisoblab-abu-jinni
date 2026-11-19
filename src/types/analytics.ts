export type NavTab = 'overview' | 'reports' | 'employees' | 'analyzer' | 'settings';

export type TimePeriod = '7d' | '30d' | '90d' | '1y';

export type CurrencyCode = 'UZS' | 'USD';

export type ReportStatus = 'Tayyor' | 'Jarayonda' | 'Tekshiruvda';

export type EmployeeStatus = 'Faol' | 'Ta’tilda' | 'Safarda';

export type DatasetPresetId = 'retail' | 'saas' | 'logistics';

export interface DailyMetricPoint {
  date: string;       // ISO YYYY-MM-DD
  label: string;      // Short display label e.g. "12 Noy"
  revenue: number;    // in UZS
  expenses: number;   // in UZS
  orders: number;
  customers: number;
  category: string;
  region: string;
  channel: string;
}

export interface Employee {
  id: string;
  fullName: string;
  role: string;
  department: string;
  region: string;
  status: EmployeeStatus;
  phone: string;
  email: string;
  joinedAt: string;
  monthlySalary: number;     // in UZS
  revenueGenerated: number;  // in UZS
  completedTasks: number;
  targetCompletionPct: number;
  monthlyPerformance: { label: string; value: number; target: number }[];
}

export interface ReportRow {
  id: string;
  name: string;
  category: string;
  region: string;
  value: number;      // primary numeric metric (UZS or count)
  secondaryValue: number;
  growthPct: number;
  sharePct: number;
}

export interface ReportDocument {
  id: string;
  title: string;
  category: string;
  periodLabel: string;
  updatedAt: string;
  author: string;
  status: ReportStatus;
  summary: string;
  highlights: {
    label: string;
    value: string;
    deltaPct: number;
  }[];
  series: { label: string; value: number; prevValue: number }[];
  rows: ReportRow[];
  valueUnit: 'currency' | 'count' | 'percent';
}

export interface DatasetProfile {
  id: DatasetPresetId;
  name: string;
  description: string;
  categories: string[];
  regions: string[];
  channels: string[];
  dailyPoints: DailyMetricPoint[];
  reports: ReportDocument[];
  employees: Employee[];
}

export interface CustomCsvDataset {
  fileName: string;
  uploadedAt: string;
  headers: string[];
  numericColumns: string[];
  dimensionColumns: string[];
  rows: Record<string, string | number>[];
}
