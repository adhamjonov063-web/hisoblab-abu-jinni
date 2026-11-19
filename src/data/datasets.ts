import {
  CurrencyCode,
  CustomCsvDataset,
  DailyMetricPoint,
  DatasetPresetId,
  DatasetProfile,
  Employee,
  ReportDocument,
  TimePeriod,
} from '../types/analytics';

const UZ_MONTHS = [
  'Yan', 'Fev', 'Mar', 'Apr', 'May', 'Iyn',
  'Iyl', 'Avg', 'Sen', 'Okt', 'Noy', 'Dek',
];

function formatShortUzDate(date: Date): string {
  return `${date.getDate()} ${UZ_MONTHS[date.getMonth()]}`;
}

function generateDailySeries(
  daysCount: number,
  seedOffset: number,
  baseRevenue: number,
  baseOrders: number,
  categories: string[],
  regions: string[],
  channels: string[]
): DailyMetricPoint[] {
  const anchor = new Date('2026-11-17T12:00:00Z');
  const points: DailyMetricPoint[] = [];

  for (let i = daysCount - 1; i >= 0; i--) {
    const d = new Date(anchor);
    d.setDate(anchor.getDate() - i);

    const idx = daysCount - 1 - i;
    const wave = Math.sin((idx + seedOffset) * 0.38) * 0.18 + Math.cos((idx + seedOffset) * 0.17) * 0.12;
    const trend = (idx / daysCount) * 0.24;
    const weekendBoost = d.getDay() === 0 || d.getDay() === 6 ? 1.14 : 1.0;

    const revenue = Math.round(baseRevenue * (1 + wave + trend) * weekendBoost);
    const expenseRatio = 0.54 + Math.sin((idx + seedOffset) * 0.5) * 0.06;
    const expenses = Math.round(revenue * expenseRatio);
    const orders = Math.max(12, Math.round(baseOrders * (1 + wave * 0.85 + trend) * weekendBoost));
    const customers = Math.max(8, Math.round(orders * (0.68 + ((idx % 5) * 0.04))));

    points.push({
      date: d.toISOString().slice(0, 10),
      label: formatShortUzDate(d),
      revenue,
      expenses,
      orders,
      customers,
      category: categories[(idx + seedOffset) % categories.length],
      region: regions[(idx * 3 + seedOffset) % regions.length],
      channel: channels[(idx * 2 + seedOffset) % channels.length],
    });
  }

  return points;
}

const RETAIL_REPORTS: ReportDocument[] = [
  {
    id: 'rep-retail-01',
    title: 'Noyabr oyi savdo va tushum hisoboti',
    category: 'Savdo',
    periodLabel: '1–17 Noyabr, 2026',
    updatedAt: '17-noyabr, 2026',
    author: 'M. Karimova',
    status: 'Tayyor',
    summary:
      'Elektronika va uy texnikasi bo‘limlarida mavsumiy talab oshishi hisobiga umumiy tushum o‘tgan oyning shu davriga nisbatan 16.4% ga o‘sdi. Mobil ilova orqali kelgan buyurtmalar ulushi 48% ga yetdi.',
    highlights: [
      { label: 'Jami tushum', value: '842.5 mln so‘m', deltaPct: 16.4 },
      { label: 'Buyurtmalar soni', value: '3 184 ta', deltaPct: 11.2 },
      { label: 'O‘rtacha chek', value: '264 600 so‘m', deltaPct: 4.7 },
    ],
    series: [
      { label: '1-haf', value: 185, prevValue: 162 },
      { label: '2-haf', value: 214, prevValue: 188 },
      { label: '3-haf', value: 238, prevValue: 195 },
      { label: '4-haf', value: 205, prevValue: 179 },
    ],
    rows: [
      { id: 'r1', name: 'Elektronika', category: 'Savdo', region: 'Toshkent', value: 342000000, secondaryValue: 1120, growthPct: 21.4, sharePct: 40.6 },
      { id: 'r2', name: 'Uy jihozlari', category: 'Savdo', region: 'Samarqand', value: 218500000, secondaryValue: 845, growthPct: 14.8, sharePct: 25.9 },
      { id: 'r3', name: 'Kiyim-kechak', category: 'Savdo', region: 'Farg‘ona', value: 164000000, secondaryValue: 790, growthPct: 9.2, sharePct: 19.5 },
      { id: 'r4', name: 'Aksessuarlar', category: 'Savdo', region: 'Buxoro', value: 118000000, secondaryValue: 429, growthPct: 12.1, sharePct: 14.0 },
    ],
    valueUnit: 'currency',
  },
  {
    id: 'rep-retail-02',
    title: 'Hududlar kesimida xarajatlar va marja tahlili',
    category: 'Moliya',
    periodLabel: 'IV chorak, 2026',
    updatedAt: '15-noyabr, 2026',
    author: 'S. Rahimov',
    status: 'Tayyor',
    summary:
      'Logistika va ombor saqlash xarajatlarini optimallashtirish natijasida Samarqand va Farg‘ona filiallarida sof foyda marjasi 3.8 punktga yaxshilandi.',
    highlights: [
      { label: 'Sof foyda', value: '312.8 mln so‘m', deltaPct: 19.1 },
      { label: 'Operatsion xarajat', value: '529.7 mln so‘m', deltaPct: -4.2 },
      { label: 'Foyda marjasi', value: '37.1%', deltaPct: 3.8 },
    ],
    series: [
      { label: 'Avg', value: 245, prevValue: 210 },
      { label: 'Sen', value: 268, prevValue: 229 },
      { label: 'Okt', value: 292, prevValue: 254 },
      { label: 'Noy', value: 313, prevValue: 263 },
    ],
    rows: [
      { id: 'f1', name: 'Toshkent shahri', category: 'Moliya', region: 'Toshkent', value: 148000000, secondaryValue: 39, growthPct: 18.5, sharePct: 47.3 },
      { id: 'f2', name: 'Samarqand viloyati', category: 'Moliya', region: 'Samarqand', value: 64200000, secondaryValue: 36, growthPct: 22.0, sharePct: 20.5 },
      { id: 'f3', name: 'Farg‘ona vodiysi', category: 'Moliya', region: 'Farg‘ona', value: 58600000, secondaryValue: 34, growthPct: 15.4, sharePct: 18.7 },
      { id: 'f4', name: 'Buxoro va Navoiy', category: 'Moliya', region: 'Buxoro', value: 42000000, secondaryValue: 32, growthPct: 11.2, sharePct: 13.5 },
    ],
    valueUnit: 'currency',
  },
  {
    id: 'rep-retail-03',
    title: 'Mijozlarni saqlab qolish va sodiqlik ko‘rsatkichlari',
    category: 'Mijozlar',
    periodLabel: 'Oktyabr – Noyabr, 2026',
    updatedAt: '14-noyabr, 2026',
    author: 'D. Azizova',
    status: 'Tekshiruvda',
    summary:
      'Takroriy xarid qilgan mijozlar ulushi 61.4% ga chiqdi. Keshbek dasturi ishtirokchilari o‘rtacha oyiga 2.4 marta buyurtma bermoqda.',
    highlights: [
      { label: 'Faol mijozlar', value: '12 490 nafar', deltaPct: 8.6 },
      { label: 'Qaytish darajasi', value: '61.4%', deltaPct: 5.2 },
      { label: 'Yangi ro‘yxatdan o‘tganlar', value: '1 840 nafar', deltaPct: 14.3 },
    ],
    series: [
      { label: 'Iyl', value: 53, prevValue: 48 },
      { label: 'Avg', value: 55, prevValue: 50 },
      { label: 'Okt', value: 58, prevValue: 52 },
      { label: 'Noy', value: 61, prevValue: 55 },
    ],
    rows: [
      { id: 'm1', name: 'Mobil ilova mijozlari', category: 'Mijozlar', region: 'Barcha', value: 6120, secondaryValue: 68, growthPct: 24.1, sharePct: 49.0 },
      { id: 'm2', name: 'Veb-sayt xaridorlari', category: 'Mijozlar', region: 'Barcha', value: 3480, secondaryValue: 54, growthPct: 9.4, sharePct: 27.9 },
      { id: 'm3', name: 'Chakana do‘konlar', category: 'Mijozlar', region: 'Toshkent', value: 2890, secondaryValue: 57, growthPct: 3.1, sharePct: 23.1 },
    ],
    valueUnit: 'count',
  },
  {
    id: 'rep-retail-04',
    title: 'Ombor qoldiqlari va aylanma tezligi audit xulosasi',
    category: 'Operatsion',
    periodLabel: '1–15 Noyabr, 2026',
    updatedAt: '12-noyabr, 2026',
    author: 'J. Tursunov',
    status: 'Jarayonda',
    summary:
      'Tez aylanuvchi tovarlar zaxirasi optimal 18 kunlik darajada ushlab turilibdi. Mavsumiy qoldiqlarni 12% ga qisqartirish bo‘yicha tavsiyalar tayyorlandi.',
    highlights: [
      { label: 'O‘rtacha aylanma', value: '18.2 kun', deltaPct: -9.5 },
      { label: 'Kechikkan jo‘natmalar', value: '2.1%', deltaPct: -1.4 },
      { label: 'To‘liq bajarilgan buyurtma', value: '97.9%', deltaPct: 2.3 },
    ],
    series: [
      { label: '1-haf', value: 94, prevValue: 91 },
      { label: '2-haf', value: 96, prevValue: 92 },
      { label: '3-haf', value: 97, prevValue: 93 },
      { label: '4-haf', value: 98, prevValue: 94 },
    ],
    rows: [
      { id: 'o1', name: 'Markaziy ombor (Sergeli)', category: 'Operatsion', region: 'Toshkent', value: 14200, secondaryValue: 99, growthPct: 6.2, sharePct: 52.0 },
      { id: 'o2', name: 'Samarqand tarqatish punkti', category: 'Operatsion', region: 'Samarqand', value: 6840, secondaryValue: 97, growthPct: 8.9, sharePct: 25.1 },
      { id: 'o3', name: 'Farg‘ona hududiy ombori', category: 'Operatsion', region: 'Farg‘ona', value: 6250, secondaryValue: 96, growthPct: 4.5, sharePct: 22.9 },
    ],
    valueUnit: 'count',
  },
];

const SAAS_REPORTS: ReportDocument[] = [
  {
    id: 'rep-saas-01',
    title: 'Oylik takroriy daromad (MRR) va tariflar tahlili',
    category: 'Moliya',
    periodLabel: 'Noyabr, 2026',
    updatedAt: '17-noyabr, 2026',
    author: 'A. Xolmatov',
    status: 'Tayyor',
    summary:
      'Korporativ (Pro va Biznes) tariflarga o‘tish sur’ati oshgani sababli oylik takroriy daromad 22.8% ga ko‘tarildi. Bekor qilish ko‘rsatkichi (Churn) 2.3% gacha pasaydi.',
    highlights: [
      { label: 'Oylik MRR', value: '486.0 mln so‘m', deltaPct: 22.8 },
      { label: 'Faol tashkilotlar', value: '1 420 ta', deltaPct: 14.5 },
      { label: 'Churn darajasi', value: '2.3%', deltaPct: -0.9 },
    ],
    series: [
      { label: 'Avg', value: 372, prevValue: 310 },
      { label: 'Sen', value: 405, prevValue: 335 },
      { label: 'Okt', value: 448, prevValue: 368 },
      { label: 'Noy', value: 486, prevValue: 396 },
    ],
    rows: [
      { id: 's1', name: 'Biznes tarifi', category: 'Moliya', region: 'Toshkent', value: 265000000, secondaryValue: 310, growthPct: 28.4, sharePct: 54.5 },
      { id: 's2', name: 'Pro jamoa', category: 'Moliya', region: 'Samarqand', value: 158000000, secondaryValue: 640, growthPct: 19.2, sharePct: 32.5 },
      { id: 's3', name: 'Start tarifi', category: 'Moliya', region: 'Buxoro', value: 63000000, secondaryValue: 470, growthPct: 8.7, sharePct: 13.0 },
    ],
    valueUnit: 'currency',
  },
  {
    id: 'rep-saas-02',
    title: 'Foydalanuvchi faolligi va API yuklamasi hisoboti',
    category: 'Operatsion',
    periodLabel: '1–17 Noyabr, 2026',
    updatedAt: '16-noyabr, 2026',
    author: 'N. Rustamov',
    status: 'Tayyor',
    summary:
      'Kunlik faol foydalanuvchilar (DAU) soni 9 840 nafarga yetdi. Eng ko‘p ishlatilgan modul — avtomatik hisobot eksporti va mobil tasdiqlash.',
    highlights: [
      { label: 'Kunlik faol (DAU)', value: '9 840 nafar', deltaPct: 15.3 },
      { label: 'O‘rtacha sessiya', value: '14.2 daqiqa', deltaPct: 6.4 },
      { label: 'Tizim barqarorligi', value: '99.94%', deltaPct: 0.1 },
    ],
    series: [
      { label: '1-haf', value: 8400, prevValue: 7300 },
      { label: '2-haf', value: 9120, prevValue: 7900 },
      { label: '3-haf', value: 9540, prevValue: 8250 },
      { label: '4-haf', value: 9840, prevValue: 8530 },
    ],
    rows: [
      { id: 'u1', name: 'Mobil ilova (iOS/Android)', category: 'Operatsion', region: 'Barcha', value: 5620, secondaryValue: 16, growthPct: 21.0, sharePct: 57.1 },
      { id: 'u2', name: 'Veb kabinet', category: 'Operatsion', region: 'Barcha', value: 3210, secondaryValue: 19, growthPct: 11.4, sharePct: 32.6 },
      { id: 'u3', name: 'API integratsiyalar', category: 'Operatsion', region: 'Toshkent', value: 1010, secondaryValue: 99, growthPct: 17.8, sharePct: 10.3 },
    ],
    valueUnit: 'count',
  },
];

const LOGISTICS_REPORTS: ReportDocument[] = [
  {
    id: 'rep-log-01',
    title: 'Viloyatlararo yetkazib berish va tezlik hisoboti',
    category: 'Operatsion',
    periodLabel: '1–17 Noyabr, 2026',
    updatedAt: '17-noyabr, 2026',
    author: 'O. Qodirov',
    status: 'Tayyor',
    summary:
      'Yangi ekspress yo‘nalishlar ishga tushirilgach, viloyatlarga o‘rtacha yetkazib berish vaqti 29 soatdan 21 soatga qisqardi.',
    highlights: [
      { label: 'Jami jo‘natmalar', value: '18 420 ta', deltaPct: 19.7 },
      { label: 'O‘z vaqtida yetkazish', value: '96.4%', deltaPct: 3.1 },
      { label: '1 jo‘natma tannarxi', value: '19 400 so‘m', deltaPct: -6.8 },
    ],
    series: [
      { label: '1-haf', value: 4100, prevValue: 3500 },
      { label: '2-haf', value: 4520, prevValue: 3780 },
      { label: '3-haf', value: 4890, prevValue: 4010 },
      { label: '4-haf', value: 4910, prevValue: 4120 },
    ],
    rows: [
      { id: 'l1', name: 'Toshkent – Samarqand', category: 'Operatsion', region: 'Samarqand', value: 5420, secondaryValue: 98, growthPct: 22.1, sharePct: 29.4 },
      { id: 'l2', name: 'Toshkent – Farg‘ona vodiysi', category: 'Operatsion', region: 'Farg‘ona', value: 6890, secondaryValue: 96, growthPct: 18.4, sharePct: 37.4 },
      { id: 'l3', name: 'Toshkent – Buxoro/Navoiy', category: 'Operatsion', region: 'Buxoro', value: 3610, secondaryValue: 95, growthPct: 15.2, sharePct: 19.6 },
      { id: 'l4', name: 'Shahar ichida ekspress', category: 'Operatsion', region: 'Toshkent', value: 2500, secondaryValue: 99, growthPct: 25.0, sharePct: 13.6 },
    ],
    valueUnit: 'count',
  },
];

const RETAIL_EMPLOYEES: Employee[] = [
  {
    id: 'emp-ret-01',
    fullName: 'Madina Karimova',
    role: 'Savdo bo‘limi rahbari',
    department: 'Savdo',
    region: 'Toshkent',
    status: 'Faol',
    phone: '+998 90 412 34 56',
    email: 'm.karimova@hisoblab.uz',
    joinedAt: '12-mart, 2023',
    monthlySalary: 14500000,
    revenueGenerated: 312000000,
    completedTasks: 148,
    targetCompletionPct: 118,
    monthlyPerformance: [
      { label: 'Avg', value: 245, target: 240 },
      { label: 'Sen', value: 272, target: 250 },
      { label: 'Okt', value: 294, target: 260 },
      { label: 'Noy', value: 312, target: 265 },
    ],
  },
  {
    id: 'emp-ret-02',
    fullName: 'Sardor Rahimov',
    role: 'Bosh moliyaviy tahlilchi',
    department: 'Moliya',
    region: 'Toshkent',
    status: 'Faol',
    phone: '+998 91 584 22 10',
    email: 's.rahimov@hisoblab.uz',
    joinedAt: '04-iyun, 2022',
    monthlySalary: 13200000,
    revenueGenerated: 148000000,
    completedTasks: 94,
    targetCompletionPct: 106,
    monthlyPerformance: [
      { label: 'Avg', value: 118, target: 120 },
      { label: 'Sen', value: 130, target: 125 },
      { label: 'Okt', value: 139, target: 135 },
      { label: 'Noy', value: 148, target: 140 },
    ],
  },
  {
    id: 'emp-ret-03',
    fullName: 'Dilnoza Azizova',
    role: 'Mijozlar bilan ishlash menejeri',
    department: 'Mijozlar',
    region: 'Samarqand',
    status: 'Faol',
    phone: '+998 93 741 88 90',
    email: 'd.azizova@hisoblab.uz',
    joinedAt: '19-yanvar, 2024',
    monthlySalary: 9800000,
    revenueGenerated: 176500000,
    completedTasks: 215,
    targetCompletionPct: 112,
    monthlyPerformance: [
      { label: 'Avg', value: 140, target: 135 },
      { label: 'Sen', value: 151, target: 145 },
      { label: 'Okt', value: 164, target: 150 },
      { label: 'Noy', value: 177, target: 158 },
    ],
  },
  {
    id: 'emp-ret-04',
    fullName: 'Jasur Tursunov',
    role: 'Hududiy ombor va logistika nazoratchisi',
    department: 'Operatsion',
    region: 'Farg‘ona',
    status: 'Safarda',
    phone: '+998 94 309 17 44',
    email: 'j.tursunov@hisoblab.uz',
    joinedAt: '08-sentyabr, 2023',
    monthlySalary: 10500000,
    revenueGenerated: 118400000,
    completedTasks: 176,
    targetCompletionPct: 97,
    monthlyPerformance: [
      { label: 'Avg', value: 112, target: 115 },
      { label: 'Sen', value: 115, target: 118 },
      { label: 'Okt', value: 114, target: 120 },
      { label: 'Noy', value: 118, target: 122 },
    ],
  },
  {
    id: 'emp-ret-05',
    fullName: 'Kamola Islomova',
    role: 'Katta savdo mutaxassisi',
    department: 'Savdo',
    region: 'Buxoro',
    status: 'Ta’tilda',
    phone: '+998 97 221 05 71',
    email: 'k.islomova@hisoblab.uz',
    joinedAt: '27-aprel, 2024',
    monthlySalary: 8900000,
    revenueGenerated: 87600000,
    completedTasks: 109,
    targetCompletionPct: 92,
    monthlyPerformance: [
      { label: 'Avg', value: 94, target: 90 },
      { label: 'Sen', value: 99, target: 92 },
      { label: 'Okt', value: 95, target: 95 },
      { label: 'Noy', value: 88, target: 95 },
    ],
  },
];

const SAAS_EMPLOYEES: Employee[] = [
  {
    id: 'emp-saas-01',
    fullName: 'Azizbek Xolmatov',
    role: 'Korporativ savdo direktori',
    department: 'Savdo',
    region: 'Toshkent',
    status: 'Faol',
    phone: '+998 90 888 12 34',
    email: 'a.xolmatov@hisoblab.uz',
    joinedAt: '15-fevral, 2023',
    monthlySalary: 18000000,
    revenueGenerated: 265000000,
    completedTasks: 86,
    targetCompletionPct: 124,
    monthlyPerformance: [
      { label: 'Avg', value: 198, target: 180 },
      { label: 'Sen', value: 215, target: 195 },
      { label: 'Okt', value: 242, target: 205 },
      { label: 'Noy', value: 265, target: 214 },
    ],
  },
  {
    id: 'emp-saas-02',
    fullName: 'Nodirbek Rustamov',
    role: 'Tizim arxitektori va tahlilchi',
    department: 'Operatsion',
    region: 'Toshkent',
    status: 'Faol',
    phone: '+998 93 512 90 11',
    email: 'n.rustamov@hisoblab.uz',
    joinedAt: '10-oktyabr, 2022',
    monthlySalary: 19500000,
    revenueGenerated: 158000000,
    completedTasks: 134,
    targetCompletionPct: 109,
    monthlyPerformance: [
      { label: 'Avg', value: 135, target: 130 },
      { label: 'Sen', value: 142, target: 138 },
      { label: 'Okt', value: 150, target: 142 },
      { label: 'Noy', value: 158, target: 145 },
    ],
  },
  {
    id: 'emp-saas-03',
    fullName: 'Mohira Yuldasheva',
    role: 'Mijozlar muvaffaqiyati menejeri',
    department: 'Mijozlar',
    region: 'Samarqand',
    status: 'Faol',
    phone: '+998 99 304 55 28',
    email: 'm.yuldasheva@hisoblab.uz',
    joinedAt: '03-may, 2024',
    monthlySalary: 11200000,
    revenueGenerated: 63000000,
    completedTasks: 192,
    targetCompletionPct: 115,
    monthlyPerformance: [
      { label: 'Avg', value: 49, target: 45 },
      { label: 'Sen', value: 54, target: 50 },
      { label: 'Okt', value: 59, target: 52 },
      { label: 'Noy', value: 63, target: 55 },
    ],
  },
];

const LOGISTICS_EMPLOYEES: Employee[] = [
  {
    id: 'emp-log-01',
    fullName: 'Otabek Qodirov',
    role: 'Logistika operatsiyalari boshlig‘i',
    department: 'Operatsion',
    region: 'Toshkent',
    status: 'Faol',
    phone: '+998 90 777 40 20',
    email: 'o.qodirov@hisoblab.uz',
    joinedAt: '20-iyul, 2022',
    monthlySalary: 15000000,
    revenueGenerated: 245000000,
    completedTasks: 310,
    targetCompletionPct: 114,
    monthlyPerformance: [
      { label: 'Avg', value: 195, target: 185 },
      { label: 'Sen', value: 210, target: 195 },
      { label: 'Okt', value: 230, target: 205 },
      { label: 'Noy', value: 245, target: 215 },
    ],
  },
  {
    id: 'emp-log-02',
    fullName: 'Sherzod Alimov',
    role: 'Farg‘ona vodiysi koordinatori',
    department: 'Operatsion',
    region: 'Farg‘ona',
    status: 'Safarda',
    phone: '+998 91 612 73 19',
    email: 'sh.alimov@hisoblab.uz',
    joinedAt: '11-noyabr, 2023',
    monthlySalary: 10800000,
    revenueGenerated: 168000000,
    completedTasks: 245,
    targetCompletionPct: 104,
    monthlyPerformance: [
      { label: 'Avg', value: 144, target: 140 },
      { label: 'Sen', value: 152, target: 148 },
      { label: 'Okt', value: 161, target: 155 },
      { label: 'Noy', value: 168, target: 162 },
    ],
  },
  {
    id: 'emp-log-03',
    fullName: 'Gulnoza Sobirova',
    role: 'Hisob-kitob va tarif mutaxassisi',
    department: 'Moliya',
    region: 'Samarqand',
    status: 'Faol',
    phone: '+998 93 905 14 82',
    email: 'g.sobirova@hisoblab.uz',
    joinedAt: '09-yanvar, 2024',
    monthlySalary: 9500000,
    revenueGenerated: 112000000,
    completedTasks: 168,
    targetCompletionPct: 101,
    monthlyPerformance: [
      { label: 'Avg', value: 98, target: 98 },
      { label: 'Sen', value: 104, target: 102 },
      { label: 'Okt', value: 108, target: 106 },
      { label: 'Noy', value: 112, target: 110 },
    ],
  },
];

export const DATASET_PRESETS: Record<DatasetPresetId, DatasetProfile> = {
  retail: {
    id: 'retail',
    name: 'Chakana savdo va E-tijorat',
    description: 'Do‘konlar, onlayn buyurtmalar, tushum va hududiy savdo hisobotlari',
    categories: ['Elektronika', 'Uy jihozlari', 'Kiyim-kechak', 'Aksessuarlar'],
    regions: ['Toshkent', 'Samarqand', 'Farg‘ona', 'Buxoro', 'Namangan'],
    channels: ['Mobil ilova', 'Veb-sayt', 'Do‘kon', 'Hamkorlar'],
    dailyPoints: generateDailySeries(
      365,
      1,
      46500000,
      175,
      ['Elektronika', 'Uy jihozlari', 'Kiyim-kechak', 'Aksessuarlar'],
      ['Toshkent', 'Samarqand', 'Farg‘ona', 'Buxoro', 'Namangan'],
      ['Mobil ilova', 'Veb-sayt', 'Do‘kon', 'Hamkorlar']
    ),
    reports: RETAIL_REPORTS,
    employees: RETAIL_EMPLOYEES,
  },
  saas: {
    id: 'saas',
    name: 'Raqamli xizmatlar (SaaS)',
    description: 'Obuna daromadlari (MRR), mijozlar faolligi va tarif tahlili',
    categories: ['Biznes tarifi', 'Pro jamoa', 'Start tarifi', 'API xizmatlar'],
    regions: ['Toshkent', 'Samarqand', 'Buxoro', 'Andijon', 'Xorazm'],
    channels: ['Mobil ilova', 'Veb kabinet', 'To‘g‘ridan-to‘g‘ri savdo', 'Hamkorlar'],
    dailyPoints: generateDailySeries(
      365,
      7,
      16800000,
      95,
      ['Biznes tarifi', 'Pro jamoa', 'Start tarifi', 'API xizmatlar'],
      ['Toshkent', 'Samarqand', 'Buxoro', 'Andijon', 'Xorazm'],
      ['Mobil ilova', 'Veb kabinet', 'To‘g‘ridan-to‘g‘ri savdo', 'Hamkorlar']
    ),
    reports: SAAS_REPORTS,
    employees: SAAS_EMPLOYEES,
  },
  logistics: {
    id: 'logistics',
    name: 'Logistika va Yetkazib berish',
    description: 'Yuk tashish hajmi, marshrutlar samaradorligi va ombor xarajatlari',
    categories: ['Ekspress pochta', 'Yirik yuklar', 'Sovuq zanjir', 'Fulfilment'],
    regions: ['Toshkent', 'Farg‘ona', 'Samarqand', 'Buxoro', 'Qashqadaryo'],
    channels: ['Mobil ilova', 'Korporativ shartnoma', 'Filial punkti', 'API'],
    dailyPoints: generateDailySeries(
      365,
      13,
      28400000,
      480,
      ['Ekspress pochta', 'Yirik yuklar', 'Sovuq zanjir', 'Fulfilment'],
      ['Toshkent', 'Farg‘ona', 'Samarqand', 'Buxoro', 'Qashqadaryo'],
      ['Mobil ilova', 'Korporativ shartnoma', 'Filial punkti', 'API']
    ),
    reports: LOGISTICS_REPORTS,
    employees: LOGISTICS_EMPLOYEES,
  },
};

export const USD_RATE = 12800;

export function formatMoney(amountUzs: number, currency: CurrencyCode, compact = false): string {
  const val = currency === 'USD' ? amountUzs / USD_RATE : amountUzs;

  if (compact) {
    if (currency === 'USD') {
      if (Math.abs(val) >= 1_000_000) return `$${(val / 1_000_000).toFixed(2)} mln`;
      if (Math.abs(val) >= 1_000) return `$${(val / 1_000).toFixed(1)} ming`;
      return `$${Math.round(val).toLocaleString('uz-UZ')}`;
    }
    if (Math.abs(val) >= 1_000_000_000) return `${(val / 1_000_000_000).toFixed(2)} mlrd so‘m`;
    if (Math.abs(val) >= 1_000_000) return `${(val / 1_000_000).toFixed(1)} mln so‘m`;
    if (Math.abs(val) >= 1_000) return `${Math.round(val / 1_000)} ming so‘m`;
    return `${Math.round(val)} so‘m`;
  }

  if (currency === 'USD') {
    return `$${Math.round(val).toString().replace(/\B(?=(\d{3})+(?!\d))/g, ' ')}`;
  }
  return `${Math.round(val).toString().replace(/\B(?=(\d{3})+(?!\d))/g, ' ')} so‘m`;
}

export function formatNumber(n: number): string {
  return Math.round(n).toString().replace(/\B(?=(\d{3})+(?!\d))/g, ' ');
}

export function getPeriodDays(period: TimePeriod): number {
  switch (period) {
    case '7d':
      return 7;
    case '30d':
      return 30;
    case '90d':
      return 90;
    case '1y':
      return 365;
  }
}

export function getPeriodLabelUz(period: TimePeriod): string {
  switch (period) {
    case '7d':
      return 'So‘nggi 7 kun';
    case '30d':
      return 'So‘nggi 30 kun';
    case '90d':
      return 'So‘nggi chorak (90 kun)';
    case '1y':
      return 'Yillik (365 kun)';
  }
}

export function bucketTimeSeries(
  points: DailyMetricPoint[],
  period: TimePeriod
): { label: string; revenue: number; expenses: number; profit: number; orders: number }[] {
  if (period === '7d') {
    return points.map((p) => ({
      label: p.label,
      revenue: p.revenue,
      expenses: p.expenses,
      profit: p.revenue - p.expenses,
      orders: p.orders,
    }));
  }
  if (period === '30d') {
    // Group into 10 3-day buckets for clean mobile legibility
    const buckets: { label: string; revenue: number; expenses: number; profit: number; orders: number }[] = [];
    for (let i = 0; i < points.length; i += 3) {
      const slice = points.slice(i, i + 3);
      const rev = slice.reduce((s, p) => s + p.revenue, 0);
      const exp = slice.reduce((s, p) => s + p.expenses, 0);
      const ord = slice.reduce((s, p) => s + p.orders, 0);
      buckets.push({
        label: slice[slice.length - 1].label,
        revenue: rev,
        expenses: exp,
        profit: rev - exp,
        orders: ord,
      });
    }
    return buckets;
  }
  if (period === '90d') {
    // Group into ~13 weekly buckets
    const buckets: { label: string; revenue: number; expenses: number; profit: number; orders: number }[] = [];
    for (let i = 0; i < points.length; i += 7) {
      const slice = points.slice(i, i + 7);
      const rev = slice.reduce((s, p) => s + p.revenue, 0);
      const exp = slice.reduce((s, p) => s + p.expenses, 0);
      const ord = slice.reduce((s, p) => s + p.orders, 0);
      buckets.push({
        label: slice[0].label,
        revenue: rev,
        expenses: exp,
        profit: rev - exp,
        orders: ord,
      });
    }
    return buckets;
  }

  // 1y: Group by month
  const monthMap = new Map<string, { label: string; revenue: number; expenses: number; profit: number; orders: number }>();
  for (const p of points) {
    const monthKey = p.date.slice(0, 7);
    const monthIdx = parseInt(p.date.slice(5, 7), 10) - 1;
    const existing = monthMap.get(monthKey) || {
      label: UZ_MONTHS[monthIdx],
      revenue: 0,
      expenses: 0,
      profit: 0,
      orders: 0,
    };
    existing.revenue += p.revenue;
    existing.expenses += p.expenses;
    existing.profit += p.revenue - p.expenses;
    existing.orders += p.orders;
    monthMap.set(monthKey, existing);
  }
  return Array.from(monthMap.values());
}

export function parseCsvText(csvText: string, fileName: string): CustomCsvDataset {
  const lines = csvText
    .split(/\r?\n/)
    .map((l) => l.trim())
    .filter((l) => l.length > 0);

  if (lines.length < 2) {
    throw new Error('CSV faylda kamida sarlavha qatori va 1 ta ma’lumot qatori bo‘lishi kerak.');
  }

  const splitLine = (line: string): string[] => {
    const result: string[] = [];
    let current = '';
    let inQuotes = false;
    for (let i = 0; i < line.length; i++) {
      const ch = line[i];
      if (ch === '"') {
        inQuotes = !inQuotes;
      } else if ((ch === ',' || ch === ';') && !inQuotes) {
        result.push(current.trim());
        current = '';
      } else {
        current += ch;
      }
    }
    result.push(current.trim());
    return result;
  };

  const headers = splitLine(lines[0]).map((h, i) => h.replace(/^"|"$/g, '') || `Ustun_${i + 1}`);
  const rows: Record<string, string | number>[] = [];

  for (let i = 1; i < lines.length; i++) {
    const cells = splitLine(lines[i]);
    if (cells.length === 0) continue;
    const row: Record<string, string | number> = {};
    headers.forEach((h, idx) => {
      const raw = (cells[idx] ?? '').replace(/^"|"$/g, '');
      const normalized = raw.replace(/\s+/g, '').replace(',', '.');
      const num = Number(normalized);
      if (raw !== '' && !Number.isNaN(num) && /^-?\d+(\.\d+)?$/.test(normalized)) {
        row[h] = num;
      } else {
        row[h] = raw;
      }
    });
    rows.push(row);
  }

  const numericColumns = headers.filter((h) =>
    rows.some((r) => typeof r[h] === 'number')
  );
  const dimensionColumns = headers.filter((h) => !numericColumns.includes(h));

  return {
    fileName,
    uploadedAt: 'Hozir yuklandi',
    headers,
    numericColumns,
    dimensionColumns,
    rows,
  };
}

export function downloadCsvFile(filename: string, headers: string[], rows: (string | number)[][]): void {
  const escape = (val: string | number) => {
    const s = String(val);
    if (s.includes(',') || s.includes('"') || s.includes('\n')) {
      return `"${s.replace(/"/g, '""')}"`;
    }
    return s;
  };
  const csvContent =
    '\uFEFF' +
    [headers.map(escape).join(','), ...rows.map((r) => r.map(escape).join(','))].join('\n');
  const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
  const url = URL.createObjectURL(blob);
  const link = document.createElement('a');
  link.href = url;
  link.setAttribute('download', filename);
  document.body.appendChild(link);
  link.click();
  document.body.removeChild(link);
  URL.revokeObjectURL(url);
}

export function downloadJsonFile(filename: string, data: unknown): void {
  const blob = new Blob([JSON.stringify(data, null, 2)], { type: 'application/json;charset=utf-8;' });
  const url = URL.createObjectURL(blob);
  const link = document.createElement('a');
  link.href = url;
  link.setAttribute('download', filename);
  document.body.appendChild(link);
  link.click();
  document.body.removeChild(link);
  URL.revokeObjectURL(url);
}

export const SAMPLE_CSV_TEMPLATE = `Hudud,Kategoriya,Savdo_summasi,Buyurtmalar,Mijozlar
Toshkent,Elektronika,185000000,640,490
Samarqand,Elektronika,92000000,320,255
Farg'ona,Uy jihozlari,74500000,280,210
Buxoro,Kiyim-kechak,58000000,310,245
Namangan,Aksessuarlar,41200000,260,195
Andijon,Uy jihozlari,63800000,245,190`;
