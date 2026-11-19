import React, { useEffect, useState } from 'react';
import { X } from 'lucide-react';
import { Employee, EmployeeStatus } from '../types/analytics';

interface EmployeeFormModalProps {
  isOpen: boolean;
  editingEmployee: Employee | null;
  regions: string[];
  onClose: () => void;
  onSave: (employee: Employee) => void;
}

export const EmployeeFormModal: React.FC<EmployeeFormModalProps> = ({
  isOpen,
  editingEmployee,
  regions,
  onClose,
  onSave,
}) => {
  const [fullName, setFullName] = useState('');
  const [role, setRole] = useState('');
  const [department, setDepartment] = useState('Savdo');
  const [region, setRegion] = useState(regions[0] || 'Toshkent');
  const [status, setStatus] = useState<EmployeeStatus>('Faol');
  const [phone, setPhone] = useState('+998 90 ');
  const [email, setEmail] = useState('');
  const [monthlySalary, setMonthlySalary] = useState('10000000');
  const [revenueGenerated, setRevenueGenerated] = useState('120000000');
  const [targetPct, setTargetPct] = useState('105');
  const [error, setError] = useState('');

  useEffect(() => {
    if (editingEmployee) {
      setFullName(editingEmployee.fullName);
      setRole(editingEmployee.role);
      setDepartment(editingEmployee.department);
      setRegion(editingEmployee.region);
      setStatus(editingEmployee.status);
      setPhone(editingEmployee.phone);
      setEmail(editingEmployee.email);
      setMonthlySalary(String(editingEmployee.monthlySalary));
      setRevenueGenerated(String(editingEmployee.revenueGenerated));
      setTargetPct(String(editingEmployee.targetCompletionPct));
    } else {
      setFullName('');
      setRole('');
      setDepartment('Savdo');
      setRegion(regions[0] || 'Toshkent');
      setStatus('Faol');
      setPhone('+998 90 123 45 67');
      setEmail('');
      setMonthlySalary('10000000');
      setRevenueGenerated('120000000');
      setTargetPct('105');
    }
    setError('');
  }, [editingEmployee, isOpen, regions]);

  if (!isOpen) return null;

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!fullName.trim() || !role.trim()) {
      setError('Iltimos, ishchining F.I.Sh. va lavozimini kiriting.');
      return;
    }

    const revNum = Math.max(0, Number(revenueGenerated) || 0);
    const salNum = Math.max(0, Number(monthlySalary) || 0);
    const pctNum = Math.max(0, Math.min(300, Number(targetPct) || 100));
    const revMln = Math.max(10, Math.round(revNum / 1_000_000));
    const targetMln = Math.max(10, Math.round(revMln / (pctNum / 100 || 1)));

    const cleanSlug = fullName
      .trim()
      .toLowerCase()
      .replace(/[^a-z0-9]+/g, '.')
      .replace(/^\.+|\.+$/g, '');

    const saved: Employee = {
      id: editingEmployee ? editingEmployee.id : `emp-custom-${Date.now()}`,
      fullName: fullName.trim(),
      role: role.trim(),
      department,
      region,
      status,
      phone: phone.trim() || '+998 90 000 00 00',
      email: email.trim() || `${cleanSlug || 'xodim'}@hisoblab.uz`,
      joinedAt: editingEmployee ? editingEmployee.joinedAt : '17-noyabr, 2026',
      monthlySalary: salNum,
      revenueGenerated: revNum,
      completedTasks: editingEmployee ? editingEmployee.completedTasks : Math.round(pctNum * 1.2),
      targetCompletionPct: pctNum,
      monthlyPerformance: editingEmployee
        ? editingEmployee.monthlyPerformance
        : [
            { label: 'Avg', value: Math.round(revMln * 0.82), target: Math.round(targetMln * 0.85) },
            { label: 'Sen', value: Math.round(revMln * 0.89), target: Math.round(targetMln * 0.9) },
            { label: 'Okt', value: Math.round(revMln * 0.95), target: Math.round(targetMln * 0.95) },
            { label: 'Noy', value: revMln, target: targetMln },
          ],
    };

    onSave(saved);
    onClose();
  };

  return (
    <div
      className="fixed inset-0 z-50 flex items-end justify-center bg-slate-950/50 backdrop-blur-xs sm:items-center sm:p-4"
      role="dialog"
      aria-modal="true"
      aria-label={editingEmployee ? 'Ishchini tahrirlash' : 'Yangi ishchi qo‘shish'}
    >
      <div className="absolute inset-0" onClick={onClose} />

      <div className="relative z-10 flex max-h-[92vh] w-full max-w-lg flex-col rounded-t-3xl bg-white shadow-2xl sm:rounded-2xl dark:bg-slate-900">
        <div className="flex justify-center pt-3 pb-1 sm:hidden">
          <div className="h-1.5 w-10 rounded-full bg-slate-300 dark:bg-slate-700" />
        </div>

        <div className="flex items-center justify-between border-b border-slate-100 px-5 py-4 dark:border-slate-800">
          <h2 className="text-base font-bold text-slate-900 dark:text-slate-100">
            {editingEmployee ? 'Ishchi ma’lumotlarini tahrirlash' : 'Yangi ishchi qo‘shish'}
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

        <form onSubmit={handleSubmit} className="flex-1 space-y-3.5 overflow-y-auto px-5 py-4">
          {error && (
            <div className="rounded-xl bg-rose-50 px-3.5 py-2.5 text-xs font-medium text-rose-700 dark:bg-rose-950/50 dark:text-rose-300">
              {error}
            </div>
          )}

          <div>
            <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300">
              Familiya va ism
            </label>
            <input
              type="text"
              value={fullName}
              onChange={(e) => setFullName(e.target.value)}
              placeholder="Masalan: Javohirbek Alimov"
              className="mt-1 min-h-[44px] w-full rounded-xl border border-slate-200 bg-white px-3.5 text-sm text-slate-900 focus:border-blue-500 focus:outline-none dark:border-slate-700 dark:bg-slate-800 dark:text-slate-100"
            />
          </div>

          <div>
            <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300">
              Lavozim
            </label>
            <input
              type="text"
              value={role}
              onChange={(e) => setRole(e.target.value)}
              placeholder="Masalan: Hududiy savdo menejeri"
              className="mt-1 min-h-[44px] w-full rounded-xl border border-slate-200 bg-white px-3.5 text-sm text-slate-900 focus:border-blue-500 focus:outline-none dark:border-slate-700 dark:bg-slate-800 dark:text-slate-100"
            />
          </div>

          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300">
                Bo‘lim
              </label>
              <select
                value={department}
                onChange={(e) => setDepartment(e.target.value)}
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
                Hudud
              </label>
              <select
                value={region}
                onChange={(e) => setRegion(e.target.value)}
                className="mt-1 min-h-[44px] w-full rounded-xl border border-slate-200 bg-white px-3 text-sm text-slate-900 focus:border-blue-500 focus:outline-none dark:border-slate-700 dark:bg-slate-800 dark:text-slate-100"
              >
                {regions.map((r) => (
                  <option key={r} value={r}>
                    {r}
                  </option>
                ))}
              </select>
            </div>
          </div>

          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300">
                Holat
              </label>
              <select
                value={status}
                onChange={(e) => setStatus(e.target.value as EmployeeStatus)}
                className="mt-1 min-h-[44px] w-full rounded-xl border border-slate-200 bg-white px-3 text-sm text-slate-900 focus:border-blue-500 focus:outline-none dark:border-slate-700 dark:bg-slate-800 dark:text-slate-100"
              >
                <option value="Faol">Faol</option>
                <option value="Safarda">Safarda</option>
                <option value="Ta’tilda">Ta’tilda</option>
              </select>
            </div>

            <div>
              <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300">
                Telefon
              </label>
              <input
                type="tel"
                value={phone}
                onChange={(e) => setPhone(e.target.value)}
                className="mt-1 min-h-[44px] w-full rounded-xl border border-slate-200 bg-white px-3.5 font-mono text-xs text-slate-900 focus:border-blue-500 focus:outline-none dark:border-slate-700 dark:bg-slate-800 dark:text-slate-100"
              />
            </div>
          </div>

          <div className="grid grid-cols-3 gap-2.5">
            <div>
              <label className="block text-[11px] font-semibold text-slate-700 dark:text-slate-300">
                Maosh (so‘m)
              </label>
              <input
                type="number"
                value={monthlySalary}
                onChange={(e) => setMonthlySalary(e.target.value)}
                className="mt-1 min-h-[42px] w-full rounded-xl border border-slate-200 bg-white px-2.5 font-mono text-xs text-slate-900 focus:border-blue-500 focus:outline-none dark:border-slate-700 dark:bg-slate-800 dark:text-slate-100"
              />
            </div>

            <div>
              <label className="block text-[11px] font-semibold text-slate-700 dark:text-slate-300">
                Tushum (so‘m)
              </label>
              <input
                type="number"
                value={revenueGenerated}
                onChange={(e) => setRevenueGenerated(e.target.value)}
                className="mt-1 min-h-[42px] w-full rounded-xl border border-slate-200 bg-white px-2.5 font-mono text-xs text-slate-900 focus:border-blue-500 focus:outline-none dark:border-slate-700 dark:bg-slate-800 dark:text-slate-100"
              />
            </div>

            <div>
              <label className="block text-[11px] font-semibold text-slate-700 dark:text-slate-300">
                Reja (%)
              </label>
              <input
                type="number"
                value={targetPct}
                onChange={(e) => setTargetPct(e.target.value)}
                className="mt-1 min-h-[42px] w-full rounded-xl border border-slate-200 bg-white px-2.5 font-mono text-xs text-slate-900 focus:border-blue-500 focus:outline-none dark:border-slate-700 dark:bg-slate-800 dark:text-slate-100"
              />
            </div>
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
              {editingEmployee ? 'Yangilash' : 'Qo‘shish'}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};
