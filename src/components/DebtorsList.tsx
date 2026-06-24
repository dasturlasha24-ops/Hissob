import { useState, useMemo } from "react";
import { Debtor } from "../types";
import { formatCurrency } from "../utils";
import { 
  Search, 
  Filter, 
  Phone, 
  Calendar, 
  Clock, 
  TrendingUp, 
  User, 
  Sparkles,
  ChevronRight,
  PieChart
} from "lucide-react";

interface DebtorsListProps {
  debtors: Debtor[];
  onSelectDebtor: (id: string) => void;
  setCurrentTab: (tab: string) => void;
  isDark?: boolean;
}

export default function DebtorsList({ debtors, onSelectDebtor, setCurrentTab, isDark }: DebtorsListProps) {
  const [searchTerm, setSearchTerm] = useState("");
  const [statusFilter, setStatusFilter] = useState<string>("all");

  // Filter list
  const filteredDebtors = useMemo(() => {
    return debtors.filter((debtor) => {
      const fullName = `${debtor.firstName} ${debtor.lastName}`.toLowerCase();
      const phoneClean = debtor.phone.replace(/[^0-9]/g, "");
      const searchClean = searchTerm.toLowerCase();

      const matchesSearch = 
        fullName.includes(searchClean) || 
        debtor.phone.toLowerCase().includes(searchClean) ||
        phoneClean.includes(searchClean);

      const matchesStatus = statusFilter === "all" || debtor.status === statusFilter;

      return matchesSearch && matchesStatus;
    });
  }, [debtors, searchTerm, statusFilter]);

  // Quick stats
  const paidStats = useMemo(() => {
    let totalExpectedSum = 0;
    let totalPaidSum = 0;
    
    filteredDebtors.forEach((d) => {
      totalExpectedSum += d.totalExpected;
      d.repaymentSchedule.forEach(r => totalPaidSum += r.paidAmount);
    });

    return {
      totalExpectedSum,
      totalPaidSum,
      percent: totalExpectedSum > 0 ? Math.round((totalPaidSum / totalExpectedSum) * 100) : 0
    };
  }, [filteredDebtors]);

  return (
    <div className="space-y-6 animate-fade-in pb-12">
      {/* Page Header */}
      <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4">
        <div>
          <h1 className={`text-2xl md:text-3xl font-black tracking-tight flex items-center gap-2.5 ${isDark ? "text-white" : "text-zinc-900"}`}>
            <PieChart className="w-8 h-8 text-blue-600" />
            Qarzdorlar Daftari
          </h1>
          <p className={`text-sm mt-1 shadow-2xs ${isDark ? "text-zinc-400" : "text-zinc-500"}`}>
            Barcha qarzdorlar ro'yxati, kunlik monitoring va harakatlar boshqaruvi
          </p>
        </div>
        <button
          onClick={() => setCurrentTab("add-debtor")}
          className="px-5 py-3 rounded-2xl bg-blue-600 text-white font-extrabold hover:bg-blue-500 hover:scale-[1.01] active:scale-[0.99] transition-all text-xs cursor-pointer shadow-md shadow-blue-500/10 tracking-wide uppercase"
        >
          + Yangi Qarz Qo'shish
        </button>
      </div>

      {/* Filter and Search Panel */}
      <div className={`p-4 rounded-3xl border flex flex-col md:flex-row gap-4 items-center justify-between transition-all duration-300 ${
        isDark 
          ? "border-zinc-800 bg-zinc-900/40 backdrop-blur-md" 
          : "border-zinc-200 bg-white shadow-xs"
      }`}>
        {/* Search */}
        <div className="relative w-full md:max-w-md flex items-center">
          <Search className="absolute left-3.5 w-4.5 h-4.5 text-zinc-400 pointer-events-none" />
          <input
            type="text"
            placeholder="Mijoz ismi yoki telefon raqami..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className={`w-full pl-11 pr-4 py-3 rounded-2xl border transition-colors text-sm font-medium focus:outline-none focus:ring-2 focus:ring-blue-500/10 ${
              isDark 
                ? "bg-zinc-950/40 border-zinc-800 focus:border-zinc-700 text-white" 
                : "bg-zinc-50 border-zinc-200 focus:border-zinc-300 text-zinc-900"
            }`}
          />
        </div>

        {/* Status filters */}
        <div className="flex flex-wrap items-center gap-2 w-full md:w-auto">
          <Filter className="w-4 h-4 text-zinc-400 mr-1 shrink-0 hidden sm:block" />
          {[
            { id: "all", label: "Barchasi" },
            { id: "active", label: "Faol" },
            { id: "completed", label: "To'langan" },
            { id: "overdue", label: "Muddati o'tgan" },
            { id: "loss", label: "Ziyon" }
          ].map((status) => {
            const isButtonActive = statusFilter === status.id;
            return (
              <button
                key={status.id}
                onClick={() => setStatusFilter(status.id)}
                className={`
                  px-3 py-2 rounded-xl text-xs font-bold cursor-pointer transition-all duration-150 border
                  ${isButtonActive 
                    ? "bg-blue-600 text-white border-blue-600 shadow-sm" 
                    : isDark 
                      ? "bg-zinc-800/40 text-zinc-300 border-zinc-800 hover:bg-zinc-800" 
                      : "bg-zinc-50 text-zinc-650 border-zinc-100 hover:border-zinc-200 hover:bg-zinc-100"
                  }
                `}
              >
                {status.label}
              </button>
            );
          })}
        </div>
      </div>

      {/* Active filters statistics */}
      <div className={`flex flex-wrap items-center justify-between gap-4 text-xs font-mono ${isDark ? "text-zinc-500" : "text-zinc-400"}`}>
        <div>
          Topildi: <span className={`font-black font-sans text-sm ${isDark ? "text-white" : "text-zinc-800"}`}>{filteredDebtors.length} ta</span> tarmoqdagi mijoz
        </div>
        {filteredDebtors.length > 0 && (
          <div className="flex items-center gap-2">
            <span>Yig'ilgan sarmoya miqdori:</span>
            <span className="text-emerald-600 font-extrabold">{formatCurrency(paidStats.totalPaidSum)}</span>
            <span>/</span>
            <span className="text-zinc-700 font-bold">{formatCurrency(paidStats.totalExpectedSum)} ({paidStats.percent}%)</span>
          </div>
        )}
      </div>

      {/* Grid List */}
      {filteredDebtors.length === 0 ? (
        <div className={`text-center py-20 border border-dashed rounded-3xl ${
          isDark ? "border-zinc-800 bg-zinc-900/10" : "border-zinc-200 bg-white shadow-2xs"
        }`}>
          <p className="text-sm font-semibold text-zinc-400">Ma'lumot topilmadi</p>
          <p className="text-xs text-zinc-500 mt-2">Qidiruv yoki filtr mezonlariga mos keladigan qarzdorlar mavjud emas.</p>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-5">
          {filteredDebtors.map((debtor) => {
            // Find total paid by counting schedule logs
            const debtorPaid = debtor.repaymentSchedule.reduce((sum, current) => sum + current.paidAmount, 0);
            const debtorProgress = debtor.totalExpected > 0 ? Math.round((debtorPaid / debtor.totalExpected) * 100) : 0;
            
            // Determine status display config
            let statusBadge = {
              text: "Faollik",
              style: isDark 
                ? "bg-emerald-500/10 text-emerald-400 border-emerald-500/20" 
                : "bg-emerald-50 text-emerald-700 border-emerald-200"
            };

            if (debtor.status === "completed") {
              statusBadge = {
                text: "To'landi",
                style: isDark 
                  ? "bg-purple-500/10 text-purple-400 border-purple-500/20" 
                  : "bg-purple-50 text-purple-700 border-purple-200"
              };
            } else if (debtor.status === "overdue") {
              statusBadge = {
                text: "Kechikdi",
                style: isDark 
                  ? "bg-amber-500/10 text-amber-500 border-amber-500/20" 
                  : "bg-amber-100/70 text-amber-800 border-amber-200"
              };
            } else if (debtor.status === "loss") {
              statusBadge = {
                text: "Ziyon",
                style: isDark 
                  ? "bg-rose-500/15 text-rose-400 border-rose-500/25" 
                  : "bg-rose-50 text-rose-700 border-rose-200"
              };
            }

            return (
              <div 
                key={debtor.id}
                className={`premium-card group relative overflow-hidden rounded-3xl border p-5 flex flex-col justify-between ${
                  isDark 
                    ? "border-zinc-800/80 bg-zinc-900/40 backdrop-blur-md text-white hover:border-zinc-700 hover:shadow-[0_25px_50px_-12px_rgba(0,0,0,0.5)]" 
                    : "border-zinc-150 bg-white text-zinc-900 hover:border-zinc-300 hover:shadow-[0_20px_40px_-15px_rgba(0,0,0,0.06)] shadow-[0_8px_30px_rgb(0,0,0,0.015)]"
                }`}
              >
                {/* Status and Top details */}
                <div className="flex items-start justify-between gap-2 z-10">
                  <div className="flex items-center gap-3">
                    <div className={`p-3 rounded-2xl border flex items-center justify-center shrink-0 shadow-3xs ${
                      isDark ? "bg-zinc-850 border-zinc-700/60 text-zinc-300" : "bg-zinc-50 border-zinc-200 text-zinc-650"
                    }`}>
                      <User className="w-5 h-5" />
                    </div>
                    <div>
                      <h3 className={`text-base font-black tracking-tight transition-colors ${isDark ? "text-white group-hover:text-blue-400" : "text-zinc-900 group-hover:text-blue-600"}`}>
                        {debtor.firstName} {debtor.lastName}
                      </h3>
                      <p className={`text-xs font-mono flex items-center gap-1 mt-0.5 font-bold ${isDark ? "text-zinc-500" : "text-zinc-450"}`}>
                        <Phone className="w-3 h-3 text-zinc-400" />
                        {debtor.phone}
                      </p>
                    </div>
                  </div>

                  <span className={`px-2.5 py-1 text-[9px] font-black uppercase tracking-widest rounded-lg border ${statusBadge.style}`}>
                    {statusBadge.text}
                  </span>
                </div>

                <hr className={`my-4 ${isDark ? "border-zinc-800/80" : "border-zinc-100"}`} />

                {/* Main financials */}
                <div className="space-y-4 z-10">
                  <div className="grid grid-cols-2 gap-3 text-xs font-mono">
                    <div>
                      <span className="text-zinc-500 text-[9px] uppercase font-bold tracking-widest block">Sarmoya:</span>
                      <span className={`font-black text-sm block mt-0.5 ${isDark ? "text-zinc-200" : "text-zinc-850"}`}>{formatCurrency(debtor.amountGiven)}</span>
                    </div>
                    <div>
                      <span className="text-zinc-500 text-[9px] uppercase font-bold tracking-widest block">Kunlik To'lov:</span>
                      <span className="text-blue-600 font-black text-sm block mt-0.5">{formatCurrency(debtor.dailyInstallment)}</span>
                    </div>
                  </div>

                  <div className="grid grid-cols-2 gap-3 text-xs font-mono">
                    <div>
                      <span className="text-zinc-500 text-[9px] uppercase font-bold tracking-widest block">Jami To'langan:</span>
                      <span className="text-emerald-600 font-black text-sm block mt-0.5">{formatCurrency(debtorPaid)}</span>
                    </div>
                    <div>
                      <span className="text-zinc-500 text-[9px] uppercase font-bold tracking-widest block">Qolgan Qarz:</span>
                      <span className={`font-black text-sm block mt-0.5 ${isDark ? "text-white" : "text-zinc-950"}`}>{formatCurrency(Math.max(0, debtor.totalExpected - debtorPaid))}</span>
                    </div>
                  </div>

                  {/* Progress bar line */}
                  <div className="space-y-1.5">
                    <div className="flex justify-between items-center text-[9px] font-mono font-bold">
                      <span className="text-zinc-400">Yig'uv: {debtorProgress}%</span>
                      <span className="text-zinc-400">Muddati: {debtor.termDays} kun</span>
                    </div>
                    <div className={`w-full rounded-full h-1.5 overflow-hidden border ${
                      isDark ? "bg-zinc-950 border-zinc-800/60" : "bg-zinc-100 border-zinc-200"
                    }`}>
                      <div 
                        className={`h-full rounded-full transition-all duration-300 ${debtor.status === 'loss' ? 'bg-rose-500' : 'bg-gradient-to-r from-blue-600 via-indigo-600 to-purple-600'}`}
                        style={{ width: `${debtorProgress}%` }}
                      />
                    </div>
                  </div>
                </div>

                {/* Bottom dates & trigger */}
                <div className={`mt-5 pt-3.5 border-t flex items-center justify-between text-xs font-mono ${isDark ? "border-zinc-800/85 text-zinc-500" : "border-zinc-100 text-zinc-400"}`}>
                  <div className="flex items-center gap-1 font-bold">
                    <Calendar className="w-3.5 h-3.5 text-zinc-400" />
                    <span>Hujjat: {debtor.startDate}</span>
                  </div>
                  <button
                    onClick={() => onSelectDebtor(debtor.id)}
                    className="flex items-center gap-0.5 text-blue-600 hover:text-blue-700 transition-colors cursor-pointer text-[10px] font-black uppercase tracking-wider"
                  >
                    Boshqarish
                    <ChevronRight className="w-4 h-4 group-hover:translate-x-0.5 transition-transform" />
                  </button>
                </div>
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
}
