import React, { useState, useEffect } from "react";
import { Debtor } from "../types";
import { generateRepaymentSchedule, formatCurrency } from "../utils";
import { 
  UserPlus, 
  CircleDollarSign, 
  Calendar, 
  Phone, 
  Info, 
  Sparkles,
  RefreshCw,
  Clock
} from "lucide-react";

interface AddDebtorProps {
  onAddDebtor: (debtor: Debtor) => void;
  onShowSuccess?: (type: "kirim" | "chiqim", amount: number, debtorName: string) => void;
  setCurrentTab: (tab: string) => void;
  isDark?: boolean;
}

export default function AddDebtor({ onAddDebtor, onShowSuccess, setCurrentTab, isDark = true }: AddDebtorProps) {
  const [firstName, setFirstName] = useState("");
  const [lastName, setLastName] = useState("");
  const [userIdInput, setUserIdInput] = useState(""); // optional custom ID
  const [phone, setPhone] = useState("+998 ");
  const [amountGiven, setAmountGiven] = useState<number>(6000000);
  const [termDays, setTermDays] = useState<number>(30);
  const [startDate, setStartDate] = useState(new Date().toISOString().split("T")[0]);
  
  // Custom margin / profit configuration
  const [interestPercent, setInterestPercent] = useState<number>(0);
  const [markupGiven, setMarkupGiven] = useState<number>(0); // 0% interest and 0 markup given
  
  const [notes, setNotes] = useState("");
  const [errorMsg, setErrorMsg] = useState("");

  const totalExpected = amountGiven + markupGiven;
  const dailyInstallment = termDays > 0 ? Math.round(totalExpected / termDays) : 0;

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setErrorMsg("");

    if (!firstName.trim() || !lastName.trim()) {
      setErrorMsg("Iltimos, ism va familiya maydonlarini to'ldiring.");
      return;
    }

    if (!phone.trim() || phone.trim() === "+998") {
      setErrorMsg("Iltimos, telefon raqamini kiritishingiz shart.");
      return;
    }

    if (amountGiven <= 0) {
      setErrorMsg("Berilgan summa noldan katta bo'lishi shart.");
      return;
    }

    if (termDays <= 0) {
      setErrorMsg("Muddati (kunlar) noldan katta bo'lishi shart.");
      return;
    }

    // Generate the repayment days
    const repaymentSchedule = generateRepaymentSchedule(
      amountGiven,
      termDays,
      markupGiven,
      startDate
    );

    const newDebtor: Debtor = {
      id: `debtor-${Date.now()}-${Math.random().toString(36).substr(2, 5)}`,
      firstName: firstName.trim(),
      lastName: lastName.trim(),
      phone: phone.trim(),
      amountGiven,
      termDays,
      startDate,
      interestPercent,
      markupGiven,
      totalExpected,
      dailyInstallment,
      status: "active",
      notes: notes.trim(),
      repaymentSchedule,
      paymentLogs: [],
      createdAt: new Date().toISOString(),
    };

    onAddDebtor(newDebtor);
    if (onShowSuccess) {
      onShowSuccess("chiqim", amountGiven, `${firstName.trim()} ${lastName.trim()}`);
    }
    setCurrentTab("debtors"); // back to lists
  };

  return (
    <div className="space-y-6 animate-fade-in pb-12">
      <div>
        <h1 className={`text-2xl md:text-3xl font-black tracking-tight flex items-center gap-2.5 ${isDark ? "text-white" : "text-zinc-900"}`}>
          <UserPlus className="w-8 h-8 text-blue-600" />
          Yangi Qarzdor Qo'shish
        </h1>
        <p className={`text-sm mt-1 ${isDark ? "text-zinc-400" : "text-zinc-500"}`}>
          Yangi sarmoya va uning foiz rejasini ro'yxatga olish hamda kunlik jadvalini faollashtirish
        </p>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Main Entry Form */}
        <form onSubmit={handleSubmit} className={`lg:col-span-2 space-y-5 rounded-3xl border p-6 transition-all duration-300 ${
          isDark 
            ? "border-zinc-800 bg-zinc-900/40 backdrop-blur-md" 
            : "border-zinc-200 bg-white shadow-xs"
        }`}>
          {errorMsg && (
            <div className="p-3.5 bg-rose-50 border border-rose-250 rounded-2xl text-rose-700 text-xs font-bold leading-relaxed">
              ⚠️ {errorMsg}
            </div>
          )}

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            {/* Ism */}
            <div>
              <label className={`block text-[10px] font-bold uppercase tracking-wider font-mono mb-2 ${isDark ? "text-zinc-400" : "text-zinc-500"}`}>Mijoz Ismi</label>
              <div className="relative">
                <input
                  type="text"
                  placeholder="Mijoz ismini kiriting"
                  value={firstName}
                  onChange={(e) => setFirstName(e.target.value)}
                  className={`w-full px-4 py-3 rounded-2xl border text-sm font-semibold focus:outline-none transition-all duration-200 ${
                    isDark 
                      ? "bg-zinc-950/40 border-zinc-800 focus:border-zinc-700 text-white" 
                      : "bg-zinc-50 border-zinc-200 focus:border-zinc-300 text-zinc-900"
                  }`}
                  required
                />
              </div>
            </div>

            {/* Familiya */}
            <div>
              <label className={`block text-[10px] font-bold uppercase tracking-wider font-mono mb-2 ${isDark ? "text-zinc-400" : "text-zinc-500"}`}>Mijoz Familiyasi</label>
              <div className="relative">
                <input
                  type="text"
                  placeholder="Familiyasini kiriting"
                  value={lastName}
                  onChange={(e) => setLastName(e.target.value)}
                  className={`w-full px-4 py-3 rounded-2xl border text-sm font-semibold focus:outline-none transition-all duration-200 ${
                    isDark 
                      ? "bg-zinc-950/40 border-zinc-800 focus:border-zinc-700 text-white" 
                      : "bg-zinc-50 border-zinc-200 focus:border-zinc-300 text-zinc-900"
                  }`}
                  required
                />
              </div>
            </div>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            {/* Telefon */}
            <div>
              <label className={`block text-[10px] font-bold uppercase tracking-wider font-mono mb-2 ${isDark ? "text-zinc-400" : "text-zinc-500"}`}>Telefon raqam</label>
              <div className="relative flex items-center">
                <Phone className="absolute left-4 w-4 h-4 text-zinc-400" />
                <input
                  type="text"
                  placeholder="+998 XX YYY YY YY"
                  value={phone}
                  onChange={(e) => setPhone(e.target.value)}
                  className={`w-full pl-11 pr-4 py-3 rounded-2xl border text-sm focus:outline-none transition-all duration-200 font-mono ${
                    isDark 
                      ? "bg-zinc-950/40 border-zinc-800 focus:border-zinc-700 text-white" 
                      : "bg-zinc-50 border-zinc-200 focus:border-zinc-300 text-zinc-900"
                  }`}
                  required
                />
              </div>
            </div>

            {/* Boshlanish sanasi */}
            <div>
              <label className={`block text-[10px] font-bold uppercase tracking-wider font-mono mb-2 ${isDark ? "text-zinc-400" : "text-zinc-500"}`}>Berilgan sana (Boshlanishi)</label>
              <div className="relative flex items-center">
                <Calendar className="absolute left-4 w-4 h-4 text-zinc-400" />
                <input
                  type="date"
                  value={startDate}
                  onChange={(e) => setStartDate(e.target.value)}
                  className={`w-full pl-11 pr-4 py-3 rounded-2xl border text-sm focus:outline-none transition-all duration-200 font-mono cursor-pointer ${
                    isDark 
                      ? "bg-zinc-950/40 border-zinc-800 focus:border-zinc-700 text-white" 
                      : "bg-zinc-50 border-zinc-200 focus:border-zinc-300 text-zinc-900"
                  }`}
                  required
                />
              </div>
            </div>
          </div>

          <hr className={`my-6 border-b-0 ${isDark ? "border-zinc-800" : "border-zinc-100"}`} />

          {/* Summations */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            {/* Qarz summasi */}
            <div>
              <label className={`block text-[10px] font-bold uppercase tracking-wider font-mono mb-2 ${isDark ? "text-zinc-400" : "text-zinc-500"}`}>
                Berilgan sarmoya summasi (UZS)
              </label>
              <div className="relative flex items-center">
                <CircleDollarSign className="absolute left-4 w-4 h-4 text-blue-600" />
                <input
                  type="text"
                  placeholder="Masalan: 6 000 000"
                  value={amountGiven > 0 ? amountGiven.toString().replace(/\B(?=(\d{3})+(?!\d))/g, " ") : ""}
                  onChange={(e) => {
                    const digits = e.target.value.replace(/\D/g, "");
                    setAmountGiven(parseInt(digits, 10) || 0);
                  }}
                  className={`w-full pl-11 pr-4 py-3 rounded-2xl border text-sm focus:outline-none transition-all duration-200 font-extrabold font-mono ${
                    isDark 
                      ? "bg-zinc-955/50 border-zinc-800 focus:border-zinc-705 text-white" 
                      : "bg-zinc-50 border-zinc-200 focus:border-zinc-305 text-zinc-900"
                  }`}
                  required
                />
              </div>
            </div>

            {/* Muddat kunlarda */}
            <div>
              <label className={`block text-[10px] font-bold uppercase tracking-wider font-mono mb-2 ${isDark ? "text-zinc-400" : "text-zinc-500"}`}>
                Muddati (Kun yoki Bo'lib to'lash miqdori)
              </label>
              <div className="relative flex items-center">
                <Clock className="absolute left-4 w-4 h-4 text-zinc-400" />
                <input
                  type="number"
                  placeholder="Masalan: 30 kun"
                  value={termDays || ""}
                  onChange={(e) => setTermDays(Math.max(1, parseInt(e.target.value) || 0))}
                  className={`w-full pl-11 pr-4 py-3 rounded-2xl border text-sm focus:outline-none transition-all duration-200 font-extrabold font-mono ${
                    isDark 
                      ? "bg-zinc-955/50 border-zinc-800 focus:border-zinc-705 text-white" 
                      : "bg-zinc-50 border-zinc-200 focus:border-zinc-305 text-zinc-900"
                  }`}
                  required
                />
              </div>
            </div>
          </div>
          {/* Notes */}
          <div>
            <label className={`block text-[10px] font-bold uppercase tracking-wider font-mono mb-2 ${isDark ? "text-zinc-400" : "text-zinc-500"}`}>Qo'shimcha izohlar</label>
            <textarea
              placeholder="Mablag' qanday maqsadlarda olinganligi yoki kafolat bergan shaxslar haqida..."
              value={notes}
              onChange={(e) => setNotes(e.target.value)}
              className={`w-full px-4 py-3 rounded-2xl border text-sm focus:outline-none transition-all duration-200 min-h-[90px] ${
                isDark 
                  ? "bg-zinc-950/40 border-zinc-800 focus:border-zinc-700 text-white" 
                  : "bg-zinc-50 border-zinc-200 focus:border-zinc-300 text-zinc-900"
              }`}
            />
          </div>

          <div className="pt-3">
            <button
              type="submit"
              className="w-full py-4 rounded-2xl cursor-pointer bg-blue-600 text-white font-extrabold hover:bg-blue-500 transition-all text-xs tracking-wider uppercase flex items-center justify-center gap-2 shadow-sm"
            >
              <UserPlus className="w-4 h-4 text-white" />
              Yangi Qarzdor Shartnomasini Tasdiqlash
            </button>
          </div>
        </form>

        {/* Live Calculation Preview Block */}
        <div className="lg:col-span-1 space-y-5">
          <div className={`rounded-3xl border p-6 sticky top-6 ${
            isDark 
              ? "border-zinc-800 bg-zinc-900/45 text-white" 
              : "border-zinc-200 bg-white text-zinc-900 shadow-xs"
          }`}>
            <h3 className="text-xs font-extrabold uppercase tracking-widest text-zinc-400 font-mono flex items-center gap-2">
              <Sparkles className="w-4 h-4 text-blue-600 animate-pulse" />
              Real-Vaqt Hisoblash
            </h3>

            <div className="mt-6 space-y-5">
              <div className={`p-4 rounded-2xl text-center border ${isDark ? "bg-zinc-900/60 border-zinc-800" : "bg-zinc-50 border-zinc-100"}`}>
                <span className="text-[9px] uppercase tracking-wider text-zinc-400 font-black font-mono">
                  Kunlik Bo'lib Qaytarish To'lovi
                </span>
                <div className="text-2xl md:text-3xl font-black text-blue-600 tracking-tight mt-1 font-mono">
                  {formatCurrency(dailyInstallment)}
                </div>
                <div className="text-[10px] text-zinc-405 mt-2 flex items-center justify-center gap-1.5 font-mono font-bold">
                  <span>Muddati: {termDays || 0} kun</span>
                  <span>•</span>
                  <span>Jami qaytaradi</span>
                </div>
              </div>

              <div className="space-y-3.5 divide-y divide-zinc-200/20 text-sm">
                <div className="flex items-center justify-between pt-1">
                  <span className="text-zinc-550 font-medium">Berilgan pul:</span>
                  <span className={`font-bold font-mono ${isDark ? "text-white" : "text-zinc-900"}`}>{formatCurrency(amountGiven)}</span>
                </div>

                <div className="flex items-center justify-between pt-3.5 text-base">
                  <span className="font-extrabold text-zinc-700">Jami Qaytarish Summasi:</span>
                  <span className={`font-black font-mono underline decoration-blue-500 decoration-2 ${
                    isDark ? "text-white" : "text-zinc-950"
                  }`}>
                    {formatCurrency(totalExpected)}
                  </span>
                </div>
              </div>

              <div className={`p-3.5 rounded-xl border flex gap-2 leading-relaxed text-[11px] ${
                isDark ? "bg-zinc-950 border-zinc-800 text-zinc-500" : "bg-blue-50/50 border-blue-105/20 text-zinc-500"
              }`}>
                <Info className="w-4 h-4 text-blue-600 shrink-0 mt-0.5" />
                <p>
                  Yangi qarzdor kiritilgandan so'ng dastur avtomatik ravishda <strong className={isDark ? "text-zinc-300" : "text-zinc-700"}>{termDays || 0} kunlik</strong> silliq to'lov kalendarini hisoblab chiqadi. Mijoz kunma-kun foizlarsiz berilgan sarmoyani bo'lib to'laydi.
                </p>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
