import { useState, useMemo } from "react";
import { Debtor, FinanceSummary } from "../types";
import { 
  formatCurrency, 
  calculateFinanceSummary 
} from "../utils";
import { 
  ArrowUpRight, 
  ArrowDownRight, 
  Wallet, 
  TrendingUp, 
  HandCoins, 
  XOctagon, 
  CheckCircle,
  CalendarDays,
  User,
  Phone,
  ArrowRight
} from "lucide-react";

interface DashboardProps {
  debtors: Debtor[];
  onSelectDebtor: (id: string) => void;
  setCurrentTab: (tab: string) => void;
  isDark?: boolean;
}

export default function Dashboard({ debtors, onSelectDebtor, setCurrentTab, isDark }: DashboardProps) {
  const summary = useMemo(() => calculateFinanceSummary(debtors), [debtors]);

  // Find payments due today (based on current date or latest unpaid installment closest to today)
  const todayStr = useMemo(() => new Date().toISOString().split("T")[0], []);
  
  const todayDuePayments = useMemo(() => {
    const list: Array<{
      debtorId: string;
      fullName: string;
      phone: string;
      dayIndex: number;
      amount: number;
      dueDate: string;
    }> = [];

    debtors.forEach(debtor => {
      if (debtor.status !== 'active') return;
      // Find the first unpaid installment
      const nextUnpaid = debtor.repaymentSchedule.find(d => !d.isPaid);
      if (nextUnpaid) {
        // We include it as a recommendation for payment
        list.push({
          debtorId: debtor.id,
          fullName: `${debtor.firstName} ${debtor.lastName}`,
          phone: debtor.phone,
          dayIndex: nextUnpaid.dayIndex,
          amount: nextUnpaid.amount,
          dueDate: nextUnpaid.dueDate
        });
      }
    });

    // Sort so overdue/today are first
    return list.slice(0, 5); // Limit to top 5
  }, [debtors]);

  // Progress Bar percentage
  const paybackPercentage = useMemo(() => {
    if (summary.totalExpected === 0) return 0;
    return Math.round((summary.totalPaidAmount / summary.totalExpected) * 100);
  }, [summary]);

  const remainingToCollect = useMemo(() => {
    return Math.max(0, summary.totalExpected - summary.totalPaidAmount);
  }, [summary]);

  const remainingPercent = useMemo(() => {
    if (summary.totalExpected === 0) return 0;
    return Math.round((remainingToCollect / summary.totalExpected) * 100);
  }, [summary, remainingToCollect]);

  return (
    <div className="space-y-6 animate-fade-in">
      {/* Welcome Block / Header */}
      <div className="relative overflow-hidden rounded-3xl bg-gradient-to-r from-blue-700 to-indigo-900 border border-zinc-200/10 p-8 text-white flex flex-col md:flex-row md:items-center md:justify-between justify-end shadow-sm h-auto min-h-[140px] gap-4">
        <div className="relative z-10">
          <h1 className="text-2xl md:text-3xl font-extrabold tracking-tight">
            Mening Hisob-Kitoblarim
          </h1>
          <p className="text-sm text-blue-105 opacity-90 mt-1">
            Barcha moliyaviy amaliyotlar va qarzlar to'liq nazorati ostida
          </p>
        </div>
        <div className="relative z-10 flex items-center gap-2 bg-white/10 backdrop-blur-md px-4 py-2.5 rounded-xl border border-white/20 text-xs font-mono select-none">
          <CalendarDays className="w-4 h-4 text-blue-300" />
          <span className="font-semibold text-blue-50">Bugun: {new Date().toLocaleDateString("uz-UZ", { weekday: 'long', year: 'numeric', month: 'long', day: 'numeric' })}</span>
        </div>
        <div className="absolute inset-0 bg-radial-gradient from-blue-400/20 to-transparent opacity-50 pointer-events-none" />
      </div>

      {/* Grid Indicators / Stats Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-5">
        {/* Total Lent */}
        <div className={`premium-card relative overflow-hidden rounded-3xl border p-5 flex flex-col justify-between ${
          isDark 
            ? "border-zinc-800/80 bg-zinc-900/40 backdrop-blur-md text-white hover:border-blue-500/30 hover:shadow-[0_20px_40px_-15px_rgba(59,130,246,0.15)]" 
            : "border-zinc-150 bg-white text-zinc-900 shadow-[0_8px_30px_rgb(0,0,0,0.02)] hover:shadow-[0_20px_40px_-15px_rgba(0,0,0,0.06)]"
        }`}>
          <div className="flex justify-between items-center mb-4">
            <span className={`text-[10px] font-black uppercase tracking-widest font-mono ${isDark ? "text-zinc-400" : "text-zinc-550"}`}>Sof sarmoya (Berilgan)</span>
            <div className={`w-9 h-9 rounded-xl flex items-center justify-center shadow-xs transition-all ${
              isDark ? "bg-blue-500/10 text-blue-400" : "bg-blue-50 text-blue-600"
            }`}>
              <Wallet className="w-4.5 h-4.5" />
            </div>
          </div>
          <div>
            <p className="text-2xl font-black tracking-tight mb-1 text-premium-glow">{formatCurrency(summary.totalGiven)}</p>
            <p className={`text-[10px] font-mono leading-none ${isDark ? "text-zinc-550" : "text-zinc-450"}`}>
              Qaytariladigan jami: <span className={`font-bold ${isDark ? "text-zinc-300" : "text-zinc-700"}`}>{formatCurrency(summary.totalExpected)}</span>
            </p>
          </div>
        </div>

        {/* Uncollected / Remaining Balance */}
        <div className={`premium-card relative overflow-hidden rounded-3xl border p-5 flex flex-col justify-between ${
          isDark 
            ? "border-zinc-800/80 bg-zinc-900/40 backdrop-blur-md text-white hover:border-amber-500/30 hover:shadow-[0_20px_40px_-15px_rgba(245,158,11,0.15)]" 
            : "border-zinc-150 bg-white text-zinc-900 shadow-[0_8px_30px_rgb(0,0,0,0.02)] hover:shadow-[0_20px_40px_-15px_rgba(0,0,0,0.06)]"
        }`}>
          <div className="flex justify-between items-center mb-4">
            <span className={`text-[10px] font-black uppercase tracking-widest font-mono ${isDark ? "text-zinc-400" : "text-zinc-550"}`}>Kutilayotgan Qoldiq (Qolgan)</span>
            <div className={`w-9 h-9 rounded-xl flex items-center justify-center shadow-xs transition-all ${
              isDark ? "bg-amber-500/10 text-amber-400" : "bg-amber-50 text-amber-600"
            }`}>
              <TrendingUp className="w-4.5 h-4.5 scale-y-[-1]" />
            </div>
          </div>
          <div>
            <p className={`text-2xl font-black tracking-tight mb-1.5 ${isDark ? "text-amber-400" : "text-amber-600"}`}>
              {formatCurrency(remainingToCollect)}
            </p>
            <div className={`w-full rounded-full h-1 overflow-hidden ${isDark ? "bg-zinc-800" : "bg-zinc-100"}`}>
              <div 
                className="bg-amber-500 h-1 rounded-full transition-all duration-500" 
                style={{ width: `${Math.min(100, remainingPercent)}%` }}
              />
            </div>
            <div className="flex justify-between items-center text-[9px] text-zinc-500 font-mono font-bold mt-1.5">
              <span>{remainingPercent}% qaytarilishi kerak</span>
              <span>{formatCurrency(summary.totalExpected)}</span>
            </div>
          </div>
        </div>

        {/* Total Collected (Principal & Interest) */}
        <div className={`premium-card relative overflow-hidden rounded-3xl border p-5 flex flex-col justify-between ${
          isDark 
            ? "border-zinc-800/80 bg-zinc-900/40 backdrop-blur-md text-white hover:border-purple-500/30 hover:shadow-[0_20px_40px_-15px_rgba(168,85,247,0.15)]" 
            : "border-zinc-150 bg-white text-zinc-900 shadow-[0_8px_30px_rgb(0,0,0,0.02)] hover:shadow-[0_20px_40px_-15px_rgba(0,0,0,0.06)]"
        }`}>
          <div className="flex justify-between items-center mb-4">
            <span className={`text-[10px] font-black uppercase tracking-widest font-mono ${isDark ? "text-zinc-400" : "text-zinc-550"}`}>Yig'ilgan mablag'</span>
            <div className={`w-9 h-9 rounded-xl flex items-center justify-center shadow-xs transition-all ${
              isDark ? "bg-purple-500/10 text-purple-400" : "bg-purple-50 text-purple-600"
            }`}>
              <HandCoins className="w-4.5 h-4.5" />
            </div>
          </div>
          <div>
            <p className={`text-2xl font-black tracking-tight mb-1.5 ${isDark ? "text-purple-400" : "text-purple-600"}`}>
              {formatCurrency(summary.totalPaidAmount)}
            </p>
            <div className={`w-full rounded-full h-1 overflow-hidden ${isDark ? "bg-zinc-800" : "bg-zinc-100"}`}>
              <div 
                className="bg-gradient-to-r from-purple-500 to-indigo-500 h-1 rounded-full transition-all duration-500" 
                style={{ width: `${Math.min(100, paybackPercentage)}%` }}
              />
            </div>
            <span className="text-[9px] text-zinc-500 font-mono font-bold mt-1.5 block text-right">{paybackPercentage}% UZS qaytdi</span>
          </div>
        </div>

        {/* Total Losses / Bad Debts */}
        <div className={`premium-card relative overflow-hidden rounded-3xl border p-5 flex flex-col justify-between ${
          isDark 
            ? "border-zinc-800/80 bg-zinc-900/40 backdrop-blur-md text-white hover:border-rose-500/30 hover:shadow-[0_20px_40px_-15px_rgba(239,68,68,0.15)]" 
            : "border-zinc-150 bg-white text-zinc-900 shadow-[0_8px_30px_rgb(0,0,0,0.02)] hover:shadow-[0_20px_40px_-15px_rgba(0,0,0,0.06)]"
        }`}>
          <div className="flex justify-between items-center mb-4">
            <span className={`text-[10px] font-black uppercase tracking-widest font-mono ${isDark ? "text-zinc-400" : "text-zinc-550"}`}>Haqiqiy zarar / ziyonlar</span>
            <div className={`w-9 h-9 rounded-xl flex items-center justify-center shadow-xs transition-all ${
              isDark ? "bg-rose-500/10 text-rose-400" : "bg-rose-50 text-rose-600"
            }`}>
              <XOctagon className="w-4.5 h-4.5" />
            </div>
          </div>
          <div>
            <p className={`text-2xl font-black tracking-tight mb-1 ${isDark ? "text-rose-450" : "text-rose-600"}`}>{formatCurrency(summary.totalLoss)}</p>
            <p className={`text-[10px] font-mono mt-1 leading-normal ${isDark ? "text-zinc-500" : "text-zinc-450"}`}> qarz qaytara olmaganlar zaxirasi</p>
          </div>
        </div>
      </div>

      {/* Main Analysis Section */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Status Breakdown & Graphical Donut */}
        <div className={`rounded-3xl border p-6 flex flex-col justify-between ${
          isDark 
            ? "border-zinc-800 bg-zinc-900/50 text-white" 
            : "border-zinc-200 bg-white text-zinc-900 shadow-xs"
        }`}>
          <div>
            <h3 className="text-lg font-black tracking-tight">Qarzdorlar Holati</h3>
            <p className={`text-xs mt-1 ${isDark ? "text-zinc-400" : "text-zinc-500"}`}>Tizimdagi foydalanuvchilar holati tahlili</p>
          </div>

          {/* Custom SVG Circular Progress Chart */}
          <div className="flex items-center justify-center my-6">
            <div className="relative w-40 h-40 flex items-center justify-center">
              <svg className="w-full h-full transform -rotate-90" viewBox="0 0 100 100">
                <circle
                  cx="50"
                  cy="50"
                  r="40"
                  fill="transparent"
                  stroke={isDark ? "rgba(255,255,255,0.06)" : "rgba(0,0,0,0.05)"}
                  strokeWidth="8"
                />
                <circle
                  cx="50"
                  cy="50"
                  r="40"
                  fill="transparent"
                  stroke={isDark ? "#3b82f6" : "#2563eb"} // beautiful blue accent matching Financier
                  strokeWidth="8"
                  strokeDasharray={`${2.512 * paybackPercentage} ${2.512 * (100 - paybackPercentage)}`}
                  strokeLinecap="round"
                />
              </svg>
              <div className="absolute text-center">
                <span className={`text-3xl font-black tracking-tight ${isDark ? "text-white" : "text-zinc-900"}`}>
                  {paybackPercentage}%
                </span>
                <p className={`text-[9px] uppercase tracking-wider font-extrabold font-mono mt-0.5 ${isDark ? "text-zinc-400" : "text-zinc-400"}`}>
                  Qaytarildi
                </p>
              </div>
            </div>
          </div>

          <div className="space-y-2 mt-4">
            <div className={`flex items-center justify-between text-xs px-3 py-2.5 rounded-xl border ${
              isDark ? "bg-zinc-800/20 border-zinc-700/30 text-white" : "bg-zinc-55 border-zinc-100 text-zinc-800"
            }`}>
              <span className="flex items-center gap-1.5 font-semibold text-emerald-600">
                <span className="w-2 h-2 rounded-full bg-emerald-500" />
                Faol qarzdorlar
              </span>
              <span className="font-bold font-mono">{summary.activeCount} ta</span>
            </div>
            <div className={`flex items-center justify-between text-xs px-3 py-2.5 rounded-xl border ${
              isDark ? "bg-zinc-800/20 border-zinc-700/30 text-white" : "bg-zinc-55 border-zinc-100 text-zinc-800"
            }`}>
              <span className="flex items-center gap-1.5 font-semibold text-purple-650">
                <span className="w-2 h-2 rounded-full bg-purple-500" />
                To'liq to'langanlar
              </span>
              <span className="font-bold font-mono">{summary.completedCount} ta</span>
            </div>
            <div className={`flex items-center justify-between text-xs px-3 py-2.5 rounded-xl border ${
              isDark ? "bg-zinc-800/20 border-zinc-700/30 text-white" : "bg-zinc-55 border-zinc-100 text-zinc-800"
            }`}>
              <span className="flex items-center gap-1.5 font-semibold text-amber-600">
                <span className="w-2 h-2 rounded-full bg-amber-505" />
                Kechikkanlar
              </span>
              <span className="font-bold font-mono">{summary.overdueCount} ta</span>
            </div>
            <div className={`flex items-center justify-between text-xs px-3 py-2.5 rounded-xl border ${
              isDark ? "bg-zinc-800/20 border-zinc-700/30 text-white" : "bg-zinc-55 border-zinc-100 text-zinc-800"
            }`}>
              <span className="flex items-center gap-1.5 font-semibold text-rose-600">
                <span className="w-2 h-2 rounded-full bg-rose-500" />
                Ziyon qilinganlar
              </span>
              <span className="font-bold font-mono">{summary.lossCount} ta</span>
            </div>
          </div>
        </div>

        {/* Actionable Today's Repayments Checklist */}
        <div className={`lg:col-span-2 rounded-3xl border p-6 flex flex-col justify-between ${
          isDark 
            ? "border-zinc-800 bg-zinc-900/50 text-white" 
            : "border-zinc-200 bg-white text-zinc-950 shadow-xs"
        }`}>
          <div>
            <div className="flex items-center justify-between">
              <div>
                <h3 className="text-lg font-black tracking-tight">Yig'uv Monitoringi (Bo'lib to'lash)</h3>
                <p className={`text-xs mt-1 ${isDark ? "text-zinc-400" : "text-zinc-500"}`}>Hozirda kutilayotgan kunlik to'lov mustahkamlanmalari</p>
              </div>
              <button 
                onClick={() => setCurrentTab("debtors")}
                className="text-blue-600 hover:text-blue-700 text-xs hover:underline flex items-center gap-1 cursor-pointer font-bold transition-all"
              >
                Barchasi <ArrowRight className="w-3.5 h-3.5" />
              </button>
            </div>

            <div className="mt-6 space-y-3">
              {todayDuePayments.length === 0 ? (
                <div className={`text-center py-10 border border-dashed rounded-3xl ${
                  isDark ? "border-zinc-800 bg-zinc-900/20" : "border-zinc-200 bg-zinc-50/50"
                }`}>
                  <CheckCircle className="w-10 h-10 text-emerald-500 mx-auto opacity-80" />
                  <p className="text-sm font-semibold text-zinc-800 mt-3">Sizda bugun kutilayotgan to'lovlar mavjud emas</p>
                  <p className="text-xs text-zinc-500 mt-1">Barcha faol mijozlardan kunlik to'lovlar o'z vaqtida yig'ildi.</p>
                </div>
              ) : (
                todayDuePayments.map((p, index) => (
                  <div 
                    key={index} 
                    className={`flex flex-col sm:flex-row items-start sm:items-center justify-between p-4 rounded-2xl border transition-all duration-200 gap-3 ${
                      isDark 
                        ? "bg-zinc-800/30 border-zinc-700/20 hover:border-blue-500/30" 
                        : "bg-zinc-50 border-zinc-100 hover:border-zinc-300 shadow-2xs hover:bg-white"
                    }`}
                  >
                    <div className="flex items-center gap-3">
                      <div className={`p-2 rounded-xl text-center min-w-[46px] border ${
                        isDark ? "bg-zinc-800 border-zinc-700 text-zinc-300" : "bg-white border-zinc-200 text-zinc-700"
                      }`}>
                        <span className="block text-[8px] text-zinc-400 font-bold uppercase leading-none">KUN</span>
                        <span className="text-sm font-black text-blue-600 leading-normal">{p.dayIndex}</span>
                      </div>
                      <div>
                        <h4 className="text-sm font-extrabold flex items-center gap-1.5">
                          <User className="w-3.5 h-3.5 text-zinc-400" />
                          {p.fullName}
                        </h4>
                        <p className="text-xs mt-0.5 flex items-center gap-1 text-zinc-500">
                          <Phone className="w-3 h-3 text-zinc-400" />
                          <span className="font-mono">{p.phone}</span>
                        </p>
                      </div>
                    </div>
                    
                    <div className="flex sm:flex-col items-end justify-between sm:justify-center w-full sm:w-auto border-t sm:border-t-0 border-zinc-100/50 pt-2 sm:pt-0">
                      <span className="text-[10px] text-zinc-400 uppercase tracking-wider font-extrabold font-mono">Kunlik to'lov:</span>
                      <span className="text-zinc-900 font-extrabold font-mono text-sm">
                        {formatCurrency(p.amount)}
                      </span>
                    </div>

                    <button
                      onClick={() => onSelectDebtor(p.debtorId)}
                      className="w-full sm:w-auto px-4 py-2 text-xs font-bold rounded-xl bg-blue-600 text-white hover:bg-blue-500 transition-colors cursor-pointer text-center shadow-sm"
                    >
                      Boshqarish
                    </button>
                  </div>
                ))
              )}
            </div>
          </div>

          <div className={`mt-6 p-4 rounded-2xl border flex items-start gap-3 ${
            isDark ? "bg-blue-500/10 border-blue-500/20 text-blue-350" : "bg-blue-50 border-blue-105/30 text-blue-800"
          }`}>
            <div className="p-1 px-1.5 bg-blue-600 text-white rounded-md font-mono text-[9px] font-black leading-none mt-0.5">INFO</div>
            <p className="text-xs leading-relaxed">
              Tizim orqali jami <span className="font-bold">{formatCurrency(summary.totalPaidAmount)}</span> qaytarildi. Har kuni qarzdor sahifasidan olingan kunlik to'lovlarni kiritish orqali qulay va tezkor qarz qoldig'i monitoringini qilib boring.
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}
