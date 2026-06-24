import React, { useState, useMemo } from "react";
import { Debtor, RepaymentDay, Settings as SettingsType } from "../types";
import { formatCurrency, addDays } from "../utils";
import { 
  ArrowLeft, 
  Phone, 
  Calendar, 
  TrendingUp, 
  Check, 
  Trash2, 
  User, 
  Info, 
  Smartphone, 
  FileSpreadsheet, 
  Activity, 
  Coins, 
  AlertTriangle,
  XSquare,
  Edit2,
  Film,
  Play,
  Trash,
  UploadCloud,
  Video,
  Plus,
  Send,
  Share2,
  FileText,
  ShieldAlert
} from "lucide-react";

interface DebtorDetailsProps {
  debtor: Debtor;
  onBack: () => void;
  onUpdateDebtor: (updated: Debtor) => void;
  onDeleteDebtor: (id: string) => void;
  onShowSuccess?: (type: "kirim" | "chiqim", amount: number, debtorName: string) => void;
  settings?: SettingsType;
  isDark?: boolean;
}

export default function DebtorDetails({ 
  debtor, 
  onBack, 
  onUpdateDebtor, 
  onDeleteDebtor,
  onShowSuccess,
  settings,
  isDark
}: DebtorDetailsProps) {
  
  const [customPayAmount, setCustomPayAmount] = useState<number>(debtor.dailyInstallment);
  const [isEditing, setIsEditing] = useState(false);
  const [copied, setCopied] = useState(false);
  
  // Video Evidence states
  const [videoTitle, setVideoTitle] = useState("");
  const [activePlayVideo, setActivePlayVideo] = useState<string | null>(null);

  const handleAddVideo = (title: string, url: string, fileName: string, size?: string) => {
    const newVideo = {
      id: `video-${Date.now()}`,
      title: title.trim(),
      url,
      fileName,
      fileSize: size || "Noma'lum MB",
      date: new Date().toISOString().split("T")[0]
    };
    const currentVideos = debtor.videos || [];
    onUpdateDebtor({
      ...debtor,
      videos: [newVideo, ...currentVideos]
    });
  };

  const handleDeleteVideo = (videoId: string) => {
    const currentVideos = debtor.videos || [];
    onUpdateDebtor({
      ...debtor,
      videos: currentVideos.filter(v => v.id !== videoId)
    });
    const itemToDelete = currentVideos.find(v => v.id === videoId);
    if (itemToDelete && activePlayVideo === itemToDelete.url) {
      setActivePlayVideo(null);
    }
  };

  const handleLocalVideoUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    
    const url = URL.createObjectURL(file);
    const sizeMB = (file.size / (1024 * 1024)).toFixed(1) + " MB";
    const defaultTitle = videoTitle.trim() || file.name.replace(/\.[^/.]+$/, "");
    
    handleAddVideo(defaultTitle, url, file.name, sizeMB);
    setVideoTitle("");
  };

  // States for simple details editing
  const [editFirstName, setEditFirstName] = useState(debtor.firstName);
  const [editLastName, setEditLastName] = useState(debtor.lastName);
  const [editPhone, setEditPhone] = useState(debtor.phone);
  const [editNotes, setEditNotes] = useState(debtor.notes);

  // Computed properties
  const totalPaid = useMemo(() => {
    return debtor.repaymentSchedule.reduce((sum, item) => sum + item.paidAmount, 0);
  }, [debtor.repaymentSchedule]);

  const totalRemaining = useMemo(() => {
    return Math.max(0, debtor.totalExpected - totalPaid);
  }, [debtor.totalExpected, totalPaid]);

  const progressPercent = useMemo(() => {
    if (debtor.totalExpected === 0) return 0;
    return Math.round((totalPaid / debtor.totalExpected) * 100);
  }, [debtor.totalExpected, totalPaid]);

  const getTelegramShareUrl = (text: string) => {
    return `https://t.me/share/url?url=${encodeURIComponent(window.location.origin)}&text=${encodeURIComponent(text)}`;
  };

  const handleShareAgreement = () => {
    const paidDays = debtor.repaymentSchedule.filter(d => d.isPaid).length;
    const txt = `📝 QARZDORLIK/KREDIT SHARTNOMASI REPORTI
👤 Qarzdor: ${debtor.firstName} ${debtor.lastName}
📞 Telefon: ${debtor.phone}

💵 Berilgan summa: ${formatCurrency(debtor.amountGiven)}
📈 Ustama foiz: ${debtor.interestPercent}%
💰 Ustama jami foyda: ${formatCurrency(debtor.markupGiven)}
💳 Qaytariladigan jami summa: ${formatCurrency(debtor.totalExpected)}
📆 Muddati: ${debtor.termDays} kun (Kunlik: ${formatCurrency(debtor.dailyInstallment)})
📅 Boshlangan sana: ${debtor.startDate}

📊 To'lov holati:
- Jami qaytarildi: ${formatCurrency(totalPaid)}
- Qoldi (qarz summasi): ${formatCurrency(totalRemaining)}
- To'langan kunlar: ${paidDays} / ${debtor.termDays} ta kun

📌 Status: ${debtor.status.toUpperCase()}
ℹ️ Izoh: ${debtor.notes || "Mavjud emas"}

Sana: ${new Date().toLocaleDateString("uz-UZ")}
Tizim: ${settings?.projectName || "Qarz Daftari"}`;

    window.open(getTelegramShareUrl(txt), "_blank");
  };

  const handleShareReceipt = () => {
    const paidDays = debtor.repaymentSchedule.filter(d => d.isPaid).length;
    const lastLog = debtor.paymentLogs[0];
    const logText = lastLog 
      ? `📅 Oxirgi to'lov sanasi: ${lastLog.date}\n💰 To'lov summasi: ${formatCurrency(lastLog.amount)}\n📝 Izoh: ${lastLog.note}`
      : `Hozircha to'lovlar tarixi kiritilmagan.`;

    const txt = `💵 TO'LOV AMALGA OSHIRILDI (KVITANSIYA)
👤 Qarzdor: ${debtor.firstName} ${debtor.lastName}

${logText}

📊 Umumiy holat:
- To'langan jami summa: ${formatCurrency(totalPaid)}
- Qolgan jami qarz: ${formatCurrency(totalRemaining)}
- To'langan kunliklar: ${paidDays} / ${debtor.termDays} ta kun

Sana: ${new Date().toLocaleDateString("uz-UZ")}
Tizim: ${settings?.projectName || "Qarz Daftari"}`;

    window.open(getTelegramShareUrl(txt), "_blank");
  };

  const handleShareReminder = () => {
    const paidDays = debtor.repaymentSchedule.filter(d => d.isPaid).length;
    const txt = `⚠️ QARZDORLIKNI QAYTARISH BO'YICHA OGOHLANTIRISH
Hurmatli ${debtor.firstName} ${debtor.lastName},

Sizning oldimizdagi grafik muddati bo'yicha kunlik qarz to'lash majburiyatingiz kechikmoqda.

💵 Jami qaytarilishi kerak: ${formatCurrency(debtor.totalExpected)}
📉 Hozirgacha to'langan: ${formatCurrency(totalPaid)}
🔴 QOLGAN JAMI QARZINGIZ: ${formatCurrency(totalRemaining)}
📆 Kunlik qaytarish: ${formatCurrency(debtor.dailyInstallment)}

Iltimos, kechiktirmasdan to'lovni amalga oshirishingizni so'raymiz.

Murojaat uchun tel: ${debtor.phone}
Sana: ${new Date().toLocaleDateString("uz-UZ")}
Tizim: ${settings?.projectName || "Qarz Daftari"}`;

    window.open(getTelegramShareUrl(txt), "_blank");
  };

  // Handle single daily payment toggle
  const handleToggleDay = (dayId: string) => {
    const updatedSchedule = debtor.repaymentSchedule.map((day) => {
      if (day.id === dayId) {
        const nextState = !day.isPaid;
        const paidAmt = nextState ? day.amount : 0;
        
        // Log action if making a payment
        if (nextState) {
          const logExists = debtor.paymentLogs.some(l => l.note?.includes(`${day.dayIndex}-kun`));
          if (!logExists) {
            debtor.paymentLogs.unshift({
              id: `log-${Date.now()}-${Math.random()}`,
              amount: day.amount,
              date: new Date().toISOString().split("T")[0],
              note: `${day.dayIndex}-kunlik to'lov`
            });
          }
          if (onShowSuccess) {
            onShowSuccess("kirim", day.amount, `${debtor.firstName} ${debtor.lastName}`);
          }
        } else {
          // simple remove log
          debtor.paymentLogs = debtor.paymentLogs.filter(
            log => !log.note?.includes(`${day.dayIndex}-kun`)
          );
        }

        return {
          ...day,
          isPaid: nextState,
          paidAmount: paidAmt,
          paidDate: nextState ? new Date().toISOString().split("T")[0] : undefined
        };
      }
      return day;
    });

    // Check if fully paid
    const allPaid = updatedSchedule.every(day => day.isPaid);
    const updatedStatus = allPaid ? 'completed' : debtor.status === 'completed' ? 'active' : debtor.status;

    onUpdateDebtor({
      ...debtor,
      status: updatedStatus,
      repaymentSchedule: updatedSchedule,
      paymentLogs: [...debtor.paymentLogs]
    });
  };

  // Handle manual/arbitrary amount payment
  // This automatically distributes the funds from oldest unpaid day forwards
  const handleCustomPaymentSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (customPayAmount <= 0) return;

    let remainingFunds = customPayAmount;
    const updatedSchedule = debtor.repaymentSchedule.map((day) => {
      if (day.isPaid) return day;

      // Unpaid or partially paid day
      const dayRemaining = day.amount - day.paidAmount;
      if (remainingFunds >= dayRemaining) {
        remainingFunds -= dayRemaining;
        return {
          ...day,
          isPaid: true,
          paidAmount: day.amount,
          paidDate: new Date().toISOString().split("T")[0]
        };
      } else if (remainingFunds > 0) {
        const newPaid = day.paidAmount + remainingFunds;
        remainingFunds = 0;
        return {
          ...day,
          paidAmount: newPaid,
          isPaid: false
        };
      }
      return day;
    });

    // Create a payment log entry
    const newLog = {
      id: `log-${Date.now()}-${Math.random()}`,
      amount: customPayAmount,
      date: new Date().toISOString().split("T")[0],
      note: `Bo'lib to'lash: Maxsus kiritilgan to'lov summasi`
    };

    // Check if fully paid
    const allPaid = updatedSchedule.every(day => day.isPaid);
    const updatedStatus = allPaid ? 'completed' : debtor.status === 'completed' ? 'active' : debtor.status;

    onUpdateDebtor({
      ...debtor,
      status: updatedStatus,
      repaymentSchedule: updatedSchedule,
      paymentLogs: [newLog, ...debtor.paymentLogs]
    });

    if (onShowSuccess) {
      onShowSuccess("kirim", customPayAmount, `${debtor.firstName} ${debtor.lastName}`);
    }

    setCustomPayAmount(debtor.dailyInstallment);
  };

  // Change overall status (Active, Completed, Overdue, Loss)
  const handleChangeStatus = (newStatus: 'active' | 'completed' | 'overdue' | 'loss') => {
    let updatedSchedule = [...debtor.repaymentSchedule];
    if (newStatus === 'completed') {
      // Mark all as paid if marked completed manually
      updatedSchedule = updatedSchedule.map(day => ({
        ...day,
        isPaid: true,
        paidAmount: day.amount,
        paidDate: day.paidDate || new Date().toISOString().split("T")[0]
      }));
    }

    onUpdateDebtor({
      ...debtor,
      status: newStatus,
      repaymentSchedule: updatedSchedule
    });
  };

  const handleSaveDetails = (e: React.FormEvent) => {
    e.preventDefault();
    onUpdateDebtor({
      ...debtor,
      firstName: editFirstName,
      lastName: editLastName,
      phone: editPhone,
      notes: editNotes
    });
    setIsEditing(false);
  };

  const handleExportText = () => {
    let report = `QARZDORLIK REPORTI:\n`;
    report += `Mijoz: ${debtor.firstName} ${debtor.lastName}\n`;
    report += `Telefon: ${debtor.phone}\n`;
    report += `Berilgan sana: ${debtor.startDate}\n`;
    report += `Muddati: ${debtor.termDays} kun\n`;
    report += `Umumiy qarz summasi: ${formatCurrency(debtor.totalExpected)}\n`;
    report += `To'langan summa: ${formatCurrency(totalPaid)}\n`;
    report += `Qolgan summa: ${formatCurrency(totalRemaining)}\n`;
    report += `Kunlik to'lov: ${formatCurrency(debtor.dailyInstallment)}\n`;
    report += `Holati: ${debtor.status.toUpperCase()}\n`;
    
    try {
      navigator.clipboard.writeText(report);
      setCopied(true);
      setTimeout(() => setCopied(false), 3000);
    } catch (e) {
      console.error("Clipboard copy failed", e);
    }
  };

  return (
    <div className="space-y-6 animate-fade-in pb-16">
      
      {/* Top Bar Navigation */}
      <div className="flex flex-wrap items-center justify-between gap-4">
        <button 
          onClick={onBack}
          className={`flex items-center gap-2 transition-colors cursor-pointer text-sm font-bold py-1.5 ${
            isDark ? "text-zinc-400 hover:text-white" : "text-zinc-650 hover:text-zinc-900"
          }`}
        >
          <ArrowLeft className="w-4 h-4" /> Qarzdorlar sahifasiga qaytish
        </button>

        <div className="flex items-center gap-2">
          {/* Export Report */}
          <button
            onClick={handleExportText}
            className={`px-4 py-2 text-xs font-bold rounded-2xl border flex items-center gap-1.5 cursor-pointer transition-all duration-200 ${
              copied 
                ? "bg-emerald-50 border-emerald-205 text-emerald-700" 
                : isDark 
                  ? "bg-zinc-900 border-zinc-800 text-zinc-300 hover:bg-zinc-850" 
                  : "bg-zinc-50 border-zinc-205 hover:bg-zinc-100 text-zinc-700"
            }`}
          >
            <FileSpreadsheet className="w-3.5 h-3.5 text-blue-600" />
            {copied ? "Report nusxalandi! (Telegramga tayyor) ✓" : "Hisobot Nusxalash"}
          </button>

          {/* Delete Debtor */}
          <button
            onClick={() => {
              if (confirm(`${debtor.firstName} ${debtor.lastName} ismidagi barcha qarz yozuvlarini butunlay o'chirib yuborasizmi?`)) {
                onDeleteDebtor(debtor.id);
                onBack();
              }
            }}
            className="px-3.5 py-2 text-xs font-bold rounded-2xl bg-rose-50 border border-rose-205 hover:bg-rose-650 hover:text-white text-rose-700 flex items-center gap-1.5 cursor-pointer transition-all duration-150 ml-1"
          >
            <Trash2 className="w-3.5 h-3.5" />
            O'chirish
          </button>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        
        {/* Left column: Card Information, quick status and payments input */}
        <div className="space-y-6 lg:col-span-1">
          {/* Profile Card */}
          <div className={`rounded-3xl border p-6 transition-all duration-350 relative overflow-hidden ${
            isDark 
              ? "border-zinc-800 bg-zinc-900/40 backdrop-blur-md" 
              : "border-zinc-200 bg-white shadow-xs"
          }`}>
            {!isEditing ? (
              <div className="space-y-4">
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-3">
                    <div className="bg-blue-600 text-white p-3 rounded-2xl shadow-sm">
                      <User className="w-6 h-6 text-white" />
                    </div>
                    <div>
                      <h4 className={`text-lg font-black tracking-tight leading-tight ${isDark ? "text-white" : "text-zinc-900"}`}>
                        {debtor.firstName} {debtor.lastName}
                      </h4>
                      <p className={`text-xs mt-1 flex items-center gap-1.5 font-mono ${isDark ? "text-zinc-400" : "text-zinc-500"}`}>
                        <Smartphone className="w-3.5 h-3.5 text-zinc-400" />
                        {debtor.phone}
                      </p>
                    </div>
                  </div>
                  <button 
                    onClick={() => setIsEditing(true)}
                    className={`p-1.5 rounded-xl transition-colors cursor-pointer ${
                      isDark ? "hover:bg-zinc-800 text-zinc-405 hover:text-white" : "hover:bg-zinc-100 text-zinc-600 hover:text-zinc-900"
                    }`}
                  >
                    <Edit2 className="w-4 h-4" />
                  </button>
                </div>

                <div className={`rounded-2xl border p-3.5 text-xs space-y-1 ${
                  isDark ? "bg-zinc-900/60 border-zinc-800 text-zinc-300" : "bg-zinc-50 border-zinc-105 text-zinc-700"
                }`}>
                  <p className="font-bold text-zinc-400 mb-1 font-mono uppercase tracking-wider text-[9px]">Izoh / Maqsad</p>
                  <p className="leading-relaxed italic">
                    {debtor.notes || "Ushbu qarzga hech qanday izoh kiritilmagan."}
                  </p>
                </div>

                {/* Main Progress Indicator */}
                <div className="space-y-1.5 pt-2">
                  <div className="flex justify-between items-center text-xs font-mono font-bold">
                    <span className="text-zinc-400 font-semibold">To'langan qismi:</span>
                    <span className="text-blue-600 font-extrabold">{progressPercent}%</span>
                  </div>
                  <div className={`w-full rounded-full h-2 overflow-hidden border ${
                    isDark ? "bg-zinc-950 border-zinc-805" : "bg-zinc-100 border-zinc-150"
                  }`}>
                    <div 
                      className="bg-gradient-to-r from-blue-600 to-indigo-500 h-full rounded-full transition-all duration-300"
                      style={{ width: `${progressPercent}%` }}
                    />
                  </div>
                  <div className="flex justify-between text-[10px] text-zinc-455 font-mono pt-1">
                    <span>{formatCurrency(totalPaid)}</span>
                    <span>qoldi: {formatCurrency(totalRemaining)}</span>
                  </div>
                </div>
              </div>
            ) : (
              <form onSubmit={handleSaveDetails} className="space-y-4">
                <h3 className={`text-sm font-black uppercase font-mono tracking-wider ${isDark ? "text-white" : "text-zinc-900"}`}>Malumotlarni tahrirlash</h3>
                
                <div className="space-y-3.5 text-xs text-left">
                  <div>
                    <label className="text-zinc-450 font-bold font-mono mb-1 block">Mijoz Ismi</label>
                    <input 
                      type="text" 
                      value={editFirstName} 
                      onChange={(e) => setEditFirstName(e.target.value)}
                      className={`w-full px-3 py-2.5 rounded-xl border text-sm font-semibold focus:outline-none ${
                        isDark 
                          ? "bg-zinc-950 border-zinc-800 text-white" 
                          : "bg-zinc-50 border-zinc-200 text-zinc-900 focus:border-zinc-300"
                      }`}
                    />
                  </div>
                  
                  <div>
                    <label className="text-zinc-455 font-bold font-mono mb-1 block">Mijoz Familiyasi</label>
                    <input 
                      type="text" 
                      value={editLastName} 
                      onChange={(e) => setEditLastName(e.target.value)}
                      className={`w-full px-3 py-2.5 rounded-xl border text-sm font-semibold focus:outline-none ${
                        isDark 
                          ? "bg-zinc-950 border-zinc-800 text-white" 
                          : "bg-zinc-50 border-zinc-200 text-zinc-900 focus:border-zinc-300"
                      }`}
                    />
                  </div>

                  <div>
                    <label className="text-zinc-455 font-bold font-mono mb-1 block">Telefon raqami</label>
                    <input 
                      type="text" 
                      value={editPhone} 
                      onChange={(e) => setEditPhone(e.target.value)}
                      className={`w-full px-3 py-2.5 rounded-xl border text-sm font-semibold focus:outline-none font-mono ${
                        isDark 
                          ? "bg-zinc-950 border-zinc-800 text-white" 
                          : "bg-zinc-50 border-zinc-200 text-zinc-900 focus:border-zinc-300"
                      }`}
                    />
                  </div>

                  <div>
                    <label className="text-zinc-455 font-bold font-mono mb-1 block">Izoh / Shartlar</label>
                    <textarea 
                      value={editNotes} 
                      onChange={(e) => setEditNotes(e.target.value)}
                      rows={3}
                      className={`w-full px-3 py-2.5 rounded-xl border text-sm focus:outline-none ${
                        isDark 
                          ? "bg-zinc-950 border-zinc-800 text-white" 
                          : "bg-zinc-50 border-zinc-200 text-zinc-900 focus:border-zinc-300"
                      }`}
                    />
                  </div>
                </div>

                <div className="flex gap-2 pt-2 text-xs">
                  <button 
                    type="submit" 
                    className="flex-1 py-3 bg-blue-600 text-white font-extrabold rounded-xl hover:bg-blue-500 cursor-pointer shadow-sm uppercase tracking-wide text-[10px]"
                  >
                    Saqlash
                  </button>
                  <button 
                    type="button" 
                    onClick={() => setIsEditing(false)}
                    className={`flex-1 py-3 font-bold rounded-xl cursor-pointer ${
                      isDark ? "bg-zinc-800 text-zinc-300 hover:bg-zinc-700" : "bg-zinc-100 text-zinc-700 hover:bg-zinc-200"
                    }`}
                  >
                    Bekor qilish
                  </button>
                </div>
              </form>
            )}

            <div className="absolute top-0 right-0 w-32 h-32 bg-emerald-500/5 rounded-full blur-2xl pointer-events-none" />
          </div>          {/* Quick Ledger Balance Statuses */}
          <div className={`rounded-3xl border p-6 space-y-4 transition-all duration-300 ${
            isDark 
              ? "border-zinc-805 bg-zinc-900/40 backdrop-blur-md" 
              : "border-zinc-200 bg-white shadow-xs"
          }`}>
            <h4 className={`text-sm font-black font-mono uppercase tracking-wider ${isDark ? "text-white" : "text-zinc-900"}`}>Moliyaviy ko'rsatkichlar</h4>
            <div className={`space-y-3 text-sm divide-y transition-all ${isDark ? "divide-zinc-800" : "divide-zinc-100"}`}>
              <div className="flex items-center justify-between text-zinc-400">
                <span className="text-xs">Berilgan qarz:</span>
                <span className="font-mono font-bold">{formatCurrency(debtor.amountGiven)}</span>
              </div>
              <div className="flex items-center justify-between pt-3 text-base">
                <span className={`font-black text-xs ${isDark ? "text-white" : "text-zinc-900"}`}>Qaytariladigan jami:</span>
                <span className={`font-mono font-black ${isDark ? "text-white" : "text-zinc-955"}`}>{formatCurrency(debtor.totalExpected)}</span>
              </div>
              <div className="flex items-center justify-between pt-3">
                <span className="text-zinc-400 text-xs">Kunlik kutiladigan to'lo'v:</span>
                <span className="font-mono font-extrabold text-blue-600">{formatCurrency(debtor.dailyInstallment)} / kun</span>
              </div>
            </div>
          </div>

          {/* Dynamic Arbitrary Repayment input */}
          <div className={`rounded-3xl border p-6 transition-all duration-300 ${
            isDark 
              ? "border-zinc-805 bg-zinc-900/40 backdrop-blur-md" 
              : "border-zinc-200 bg-white shadow-xs"
          }`}>
            <h4 className={`text-sm font-black font-mono uppercase tracking-wider flex items-center gap-1.5 ${isDark ? "text-white" : "text-zinc-900"}`}>
              <Coins className="w-4.5 h-4.5 text-blue-605 text-blue-600" />
              Tezkor to'lov kiritish
            </h4>
            <p className={`text-xs mt-1 leading-relaxed ${isDark ? "text-zinc-400" : "text-zinc-550"}`}>
              Mijoz istalgancha pul berganda foydalaniladi. Tizim mablag'ni eng birinchi to'lanmagan kundan boshlab avtomat tarqatadi.
            </p>

            <form onSubmit={handleCustomPaymentSubmit} className="mt-4 space-y-3">
              <div>
                <label className="text-[10px] uppercase tracking-widest text-zinc-400 font-black font-mono mb-1 block">Yig'ilgan To'lov Miqdori</label>
                <div className="relative">
                  <input
                    type="text"
                    value={customPayAmount > 0 ? customPayAmount.toString().replace(/\B(?=(\d{3})+(?!\d))/g, " ") : ""}
                    onChange={(e) => {
                      const digits = e.target.value.replace(/\D/g, "");
                      setCustomPayAmount(parseInt(digits, 10) || 0);
                    }}
                    className={`w-full px-4 py-3 rounded-2xl border text-sm font-semibold font-mono focus:outline-none ${
                      isDark 
                        ? "bg-zinc-950 border-zinc-800 text-white" 
                        : "bg-zinc-50 border-zinc-200 text-zinc-900 focus:border-zinc-300"
                    }`}
                    placeholder="Masalan: 500 000"
                    required
                  />
                  <span className="absolute right-4 top-3 text-[10px] text-zinc-400 font-bold font-mono">SO'M</span>
                </div>
              </div>

              <button
                type="submit"
                className="w-full py-4 text-xs font-black rounded-2xl cursor-pointer bg-blue-605 bg-blue-600 text-white hover:bg-blue-505 transition-all flex items-center justify-center gap-1.5 uppercase tracking-wide shadow-sm"
              >
                <Check className="w-4 h-4 text-white" />
                To'lovni Qabul Qilish
              </button>
            </form>
          </div>

          {/* Set Status manually Controls */}
          <div className={`rounded-3xl border p-6 transition-all duration-300 space-y-3.5 ${
            isDark 
              ? "border-zinc-805 bg-zinc-900/40 backdrop-blur-md" 
              : "border-zinc-200 bg-white shadow-xs"
          }`}>
            <h4 className={`text-sm font-black font-mono uppercase tracking-wider ${isDark ? "text-white" : "text-zinc-900"}`}>Holatni o'zgartirish</h4>
            
            <div className="grid grid-cols-2 gap-2 text-xs">
              {/* Active */}
              <button
                onClick={() => handleChangeStatus('active')}
                className={`flex items-center justify-center gap-1 px-3 py-2.5 rounded-xl font-bold cursor-pointer transition-all border ${
                  debtor.status === 'active' 
                    ? "bg-blue-550 border-blue-600 text-white shadow-sm bg-blue-650"
                    : isDark 
                      ? "bg-zinc-800/40 text-zinc-400 border-zinc-800 hover:text-zinc-250" 
                      : "bg-zinc-50 text-zinc-600 border-zinc-100 hover:bg-zinc-100"
                }`}
              >
                <Activity className="w-3.5 h-3.5" />
                Faol
              </button>

              {/* Completed */}
              <button
                onClick={() => handleChangeStatus('completed')}
                className={`flex items-center justify-center gap-1 px-3 py-2.5 rounded-xl font-bold cursor-pointer transition-all border ${
                  debtor.status === 'completed' 
                    ? "bg-emerald-555 border-emerald-600 text-white shadow-sm bg-emerald-650" 
                    : isDark 
                      ? "bg-zinc-800/40 text-zinc-400 border-zinc-800 hover:text-zinc-250" 
                      : "bg-zinc-50 text-zinc-600 border-zinc-100 hover:bg-zinc-100"
                }`}
              >
                <Check className="w-3.5 h-3.5" />
                To'landi
              </button>

              {/* Overdue */}
              <button
                onClick={() => handleChangeStatus('overdue')}
                className={`flex items-center justify-center gap-1 px-3 py-2.5 rounded-xl font-bold cursor-pointer transition-all border ${
                  debtor.status === 'overdue' 
                    ? "bg-amber-500 text-white border-amber-600 shadow-sm" 
                    : isDark 
                      ? "bg-zinc-800/40 text-zinc-400 border-zinc-800 hover:text-zinc-250" 
                      : "bg-zinc-50 text-zinc-600 border-zinc-100 hover:bg-zinc-100"
                }`}
              >
                <AlertTriangle className="w-3.5 h-3.5" />
                Kechikdi
              </button>

              {/* Loss */}
              <button
                onClick={() => handleChangeStatus('loss')}
                className={`flex items-center justify-center gap-1 px-3 py-2.5 rounded-xl font-bold cursor-pointer transition-all border ${
                  debtor.status === 'loss' 
                    ? "bg-rose-500 text-white border-rose-600 shadow-sm" 
                    : isDark 
                      ? "bg-zinc-800/40 text-zinc-400 border-zinc-800 hover:text-zinc-250" 
                      : "bg-zinc-50 text-zinc-600 border-zinc-100 hover:bg-zinc-100"
                }`}
              >
                <XSquare className="w-3.5 h-3.5" />
                Ziyon
              </button>
            </div>
            
            {debtor.status === 'loss' && (
              <div className="p-3 bg-rose-500/10 border border-rose-500/20 rounded-xl flex gap-2">
                <AlertTriangle className="w-4 h-4 text-rose-455 shrink-0 mt-0.5" />
                <p className="text-[10px] text-rose-400 leading-relaxed font-mono">
                  Ziyon holatida, qolgan {formatCurrency(totalRemaining)} summa hisobotlarda jami yo'qotish ziyon sifatida qayd etiladi.
                </p>
              </div>
            )}
          </div>

          {/* Telegram orqali ma'lumotlarni jo'natish bo'limi */}
          <div className={`rounded-3xl border p-6 transition-all duration-300 space-y-4 ${
            isDark 
              ? "border-sky-500/20 bg-sky-950/10 backdrop-blur-md" 
              : "border-sky-200 bg-sky-50/20 shadow-xs"
          }`}>
            <div className="flex flex-wrap items-center justify-between gap-2 border-b pb-3.5 border-sky-500/10">
              <div>
                <h4 className={`text-sm font-black font-mono uppercase tracking-wider flex items-center gap-1.5 ${isDark ? "text-white" : "text-zinc-900"}`}>
                  <Send className="w-4.5 h-4.5 text-sky-500 animate-pulse" />
                  Telegram orqali xabar yuborish
                </h4>
                <p className={`text-[10px] ${isDark ? "text-zinc-400" : "text-zinc-550"}`}>
                  Mijozga shartnomalar, kvitansiya va qarzdorlik ogohlantirishlarini jo'nating
                </p>
              </div>

              {settings?.telegramPhone || settings?.telegramUsername ? (
                <span className="p-1 px-2.5 rounded-full bg-emerald-500/10 text-emerald-500 border border-emerald-550/20 text-[9px] font-bold font-mono">
                  ● Bog'langan
                </span>
              ) : (
                <span className="p-1 px-2.5 rounded-full bg-amber-500/10 text-amber-500 border border-amber-550/20 text-[9px] font-bold font-mono">
                  ⚠ Sozlamalarda profil kiritilmagan
                </span>
              )}
            </div>

            {/* Configured details show */}
            <div className={`p-3 rounded-2xl border text-[10.5px] font-mono leading-relaxed space-y-1 ${
              isDark ? "bg-zinc-950/40 border-zinc-800/80 text-zinc-300" : "bg-white border-zinc-150 text-zinc-700 shadow-3xs"
            }`}>
              <div className="font-bold flex items-center gap-1.5 text-sky-500">
                <Info className="w-3.5 h-3.5" /> Telegram bog'liqlik sozlamasi:
              </div>
              <p>
                {settings?.telegramPhone || settings?.telegramUsername ? (
                  <span>
                    Quyidagi xabarlar to'g'ridan-to'g'ri bog'langan Telegram hisobingizga yoki ulashish orqali mijozga uzatiladi:{" "}
                    <strong className="text-blue-500">
                      {settings?.telegramUsername ? `@${settings.telegramUsername}` : ""}
                      {settings?.telegramUsername && settings?.telegramPhone ? " • " : ""}
                      {settings?.telegramPhone ? settings.telegramPhone : ""}
                    </strong>
                  </span>
                ) : (
                  <span className="text-zinc-550">
                    Siz hali tizim sozlamalarida o'zingizning Telegram raqamingiz yoki username'ingizni kiritmadingiz. Sozlamalar bo'limidan kiritib qo'ysangiz osonlik bilan hisobotlarni jo'natasiz. Lekin quyidagi report ulashish amallari hozir ham to'liq faoldir!
                  </span>
                )}
              </p>
            </div>

            {/* Quick Share Buttons */}
            <div className="grid grid-cols-1 sm:grid-cols-3 gap-2.5 pt-1">
              <button
                type="button"
                onClick={handleShareAgreement}
                className={`p-3 rounded-2xl text-[10px] sm:text-xs font-black text-left flex flex-col justify-between border cursor-pointer hover:scale-[1.01] transition-all min-h-[90px] ${
                  isDark
                    ? "bg-zinc-950/40 border-zinc-800 text-zinc-200 hover:border-sky-500/40 hover:bg-sky-500/5"
                    : "bg-white border-zinc-200 text-zinc-800 hover:border-sky-500 hover:bg-sky-50/30 shadow-3xs"
                }`}
              >
                <div className="flex items-center justify-between w-full">
                  <FileText className="w-5 h-5 text-sky-500" />
                  <Share2 className="w-3.5 h-3.5 opacity-40 hover:opacity-100" />
                </div>
                <div>
                  <p className="font-extrabold leading-tight">Qarz Shartnomasi</p>
                  <p className="text-[9px] text-zinc-550 mt-0.5 font-bold font-mono">Barcha hisob-kitoblar</p>
                </div>
              </button>

              <button
                type="button"
                onClick={handleShareReceipt}
                className={`p-3 rounded-2xl text-[10px] sm:text-xs font-black text-left flex flex-col justify-between border cursor-pointer hover:scale-[1.01] transition-all min-h-[90px] ${
                  isDark
                    ? "bg-zinc-950/40 border-zinc-800 text-zinc-200 hover:border-sky-500/40 hover:bg-sky-500/5"
                    : "bg-white border-zinc-200 text-zinc-800 hover:border-sky-500 hover:bg-sky-50/30 shadow-3xs"
                }`}
              >
                <div className="flex items-center justify-between w-full">
                  <Coins className="w-5 h-5 text-emerald-500" />
                  <Share2 className="w-3.5 h-3.5 opacity-40 hover:opacity-100" />
                </div>
                <div>
                  <p className="font-extrabold leading-tight">To'lov Kvitansiyasi</p>
                  <p className="text-[9px] text-zinc-550 mt-0.5 font-bold font-mono">So'nggi kiritilgan to'lov</p>
                </div>
              </button>

              <button
                type="button"
                onClick={handleShareReminder}
                className={`p-3 rounded-2xl text-[10px] sm:text-xs font-black text-left flex flex-col justify-between border cursor-pointer hover:scale-[1.01] transition-all min-h-[90px] ${
                  isDark
                    ? "bg-zinc-950/40 border-rose-900/40 text-zinc-200 hover:border-rose-500/40 hover:bg-rose-500/5"
                    : "bg-white border-zinc-200 text-zinc-800 hover:border-rose-300 hover:bg-rose-50/30 shadow-3xs"
                }`}
              >
                <div className="flex items-center justify-between w-full">
                  <ShieldAlert className="w-5 h-5 text-rose-500 animate-pulse" />
                  <Share2 className="w-3.5 h-3.5 opacity-40 hover:opacity-100" />
                </div>
                <div>
                  <p className="font-extrabold leading-tight text-rose-600">To'lov Ogohlantirishi</p>
                  <p className="text-[9px] text-rose-550 mt-0.5 font-bold font-mono">Muddati kechikkanlarga</p>
                </div>
              </button>
            </div>
          </div>

          {/* Tasdiqlovchi Video Guvohnomalar (Video Proofs) */}
          <div className={`rounded-3xl border p-6 transition-all duration-300 space-y-4 ${
            isDark 
              ? "border-zinc-805 bg-zinc-900/40 backdrop-blur-md" 
              : "border-zinc-200 bg-white shadow-xs"
          }`}>
            <div className="flex items-center justify-between border-b pb-3.5">
              <div>
                <h4 className={`text-sm font-black font-mono uppercase tracking-wider flex items-center gap-1.5 ${isDark ? "text-white" : "text-zinc-900"}`}>
                  <Video className="w-4.5 h-4.5 text-blue-500 animate-pulse" />
                  Video Guvohliklar & Tilxatlar
                </h4>
                <p className={`text-[10px] ${isDark ? "text-zinc-400" : "text-zinc-550"}`}>
                  Qarz olish/to'lash kelishuvlarining tasdiqlovchi video yozuvlari
                </p>
              </div>
            </div>

            {/* If a video is currently playing, render the Premium Media Player */}
            {activePlayVideo && (
              <div className={`p-2.5 rounded-2xl border ${
                isDark ? "bg-zinc-950 border-zinc-805" : "bg-zinc-100 border-zinc-200"
              }`}>
                <div className="flex justify-between items-center mb-1.5 px-1.5">
                  <span className={`text-[9px] font-black font-mono uppercase tracking-widest ${
                    isDark ? "text-blue-400" : "text-blue-650"
                  }`}>
                    Hozir o'ynalmoqda
                  </span>
                  <button 
                    onClick={() => setActivePlayVideo(null)}
                    className={`text-[9px] font-bold font-mono px-2 py-0.5 rounded-md cursor-pointer transition-colors ${
                      isDark ? "bg-zinc-850 hover:bg-zinc-800 text-zinc-300" : "bg-zinc-200 hover:bg-zinc-300 text-zinc-700"
                    }`}
                  >
                    Yopish ✕
                  </button>
                </div>
                <div className="relative aspect-video rounded-xl overflow-hidden bg-black border border-zinc-800 shadow-inner">
                  <video 
                    src={activePlayVideo} 
                    controls 
                    autoPlay 
                    className="w-full h-full object-contain" 
                  />
                </div>
              </div>
            )}

            {/* List of uploaded videos for this debtor */}
            {(!debtor.videos || debtor.videos.length === 0) ? (
              <div className={`text-center py-7 px-4 rounded-2xl border border-dashed flex flex-col items-center justify-center ${
                isDark ? "border-zinc-800 bg-zinc-950/20" : "border-zinc-200 bg-zinc-50/50"
              }`}>
                <Film className="w-8 h-8 text-zinc-450 mb-2 animate-pulse" />
                <p className={`text-xs font-bold ${isDark ? "text-zinc-300" : "text-zinc-700"}`}>
                  Hozircha hechnarsa yuklanmagan
                </p>
                <p className="text-[10px] text-zinc-500 mt-1 max-w-xs text-center leading-normal font-medium">
                  Mijozning video tilxati yoki pul berilganlik og'zaki tasdig'ini quyidan fayl tanlab saqlang.
                </p>
              </div>
            ) : (
              <div className="space-y-2.5 max-h-[220px] overflow-y-auto pr-1">
                {debtor.videos.map((video) => (
                  <div 
                    key={video.id} 
                    className={`p-3 rounded-2xl border flex items-center justify-between gap-3 text-xs ${
                      isDark ? "bg-zinc-950 border-zinc-800/80" : "bg-zinc-50 border-zinc-150"
                    }`}
                  >
                    <div className="flex items-center gap-3 text-left overflow-hidden">
                      <button 
                        onClick={() => setActivePlayVideo(video.url)}
                        className={`w-9 h-9 shrink-0 rounded-xl flex items-center justify-center transition-all ${
                          activePlayVideo === video.url
                            ? "bg-blue-500 text-white"
                            : isDark ? "bg-zinc-900 text-zinc-400 hover:bg-zinc-850 hover:text-white" : "bg-white text-zinc-650 hover:bg-zinc-100 hover:text-zinc-900 border"
                        }`}
                      >
                        <Play className="w-4 h-4 fill-current ml-0.5" />
                      </button>
                      <div className="overflow-hidden">
                        <p className={`font-black tracking-tight truncate ${isDark ? "text-white" : "text-zinc-800"}`}>
                          {video.title}
                        </p>
                        <p className="text-[9px] text-zinc-500 font-bold font-mono truncate mt-0.5">
                          {video.fileName} • {video.fileSize}
                        </p>
                      </div>
                    </div>

                    <div className="flex items-center gap-2shrink-0">
                      <span className={`text-[9.5px] font-mono font-bold shrink-0 hidden sm:inline-block ${
                        isDark ? "text-zinc-500" : "text-zinc-400"
                      }`}>
                        {video.date}
                      </span>
                      <button 
                        onClick={() => handleDeleteVideo(video.id)}
                        className={`p-2 rounded-xl cursor-pointer hover:bg-rose-500/10 text-zinc-400 hover:text-rose-500 transition-colors border border-transparent hover:border-rose-500/20`}
                        title="O'chirish"
                      >
                        <Trash className="w-3.5 h-3.5" />
                      </button>
                    </div>
                  </div>
                ))}
              </div>
            )}

            {/* Quick Live Testing sample templates uploader */}
            <div className="space-y-2">
              <span className={`text-[9px] font-black uppercase tracking-wider font-mono block ${
                isDark ? "text-zinc-500" : "text-zinc-400"
              }`}>
                Sinab ko'rish uchun tezkor namunalar:
              </span>
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
                <button
                  type="button"
                  onClick={() => handleAddVideo(
                    "Og'zaki kelishuv shartnomasi", 
                    "https://assets.mixkit.co/videos/preview/mixkit-writing-on-a-paper-with-a-fountain-pen-42280-large.mp4",
                    "tilxat-shartnoma.mp4",
                    "2.4 MB"
                  )}
                  className={`px-3 py-2 rounded-xl text-[10px] font-black text-left flex items-center justify-between border cursor-pointer transition-all ${
                    isDark
                      ? "bg-zinc-950/40 border-zinc-800 text-zinc-300 hover:bg-zinc-850"
                      : "bg-zinc-50 border-zinc-200 text-zinc-700 hover:bg-zinc-100"
                  }`}
                >
                  <span>✍️ Shartnoma Videosu</span>
                  <Plus className="w-3.5 h-3.5 opacity-60" />
                </button>
                <button
                  type="button"
                  onClick={() => handleAddVideo(
                    "Kassa kirim-chiqim hisoblash", 
                    "https://assets.mixkit.co/videos/preview/mixkit-hand-counting-gold-coins-on-table-39832-large.mp4",
                    "kassa-hisob-tangalar.mp4",
                    "3.1 MB"
                  )}
                  className={`px-3 py-2 rounded-xl text-[10px] font-black text-left flex items-center justify-between border cursor-pointer transition-all ${
                    isDark
                      ? "bg-zinc-950/40 border-zinc-800 text-zinc-300 hover:bg-zinc-850"
                      : "bg-zinc-50 border-zinc-200 text-zinc-700 hover:bg-zinc-100"
                  }`}
                >
                  <span>💵 Kassa Hisoblash</span>
                  <Plus className="w-3.5 h-3.5 opacity-60" />
                </button>
              </div>
            </div>

            {/* Custom file select area */}
            <div className="space-y-2.5 pt-2 border-t border-dashed border-zinc-800/50">
              <div>
                <label className={`text-[10px] font-bold uppercase tracking-wider font-mono block mb-1.5 ${
                  isDark ? "text-zinc-400" : "text-zinc-500"
                }`}>
                  Video sarlavhasi (Ixtiyoriy)
                </label>
                <input 
                  type="text"
                  placeholder="Masalan: To'liq qarz topshirish tasdig'i"
                  value={videoTitle}
                  onChange={(e) => setVideoTitle(e.target.value)}
                  className={`w-full px-3 py-2.5 rounded-xl border text-xs font-semibold focus:outline-none transition-all ${
                    isDark 
                      ? "bg-zinc-950 border-zinc-805 text-white focus:border-zinc-700" 
                      : "bg-zinc-50 border-zinc-200 text-zinc-900 focus:border-zinc-300"
                  }`}
                />
              </div>

              <div>
                <label className="cursor-pointer group flex flex-col items-center justify-center border border-dashed border-zinc-700/60 hover:border-blue-500 rounded-2xl p-5 text-center transition-all bg-zinc-950/10 hover:bg-blue-500/5">
                  <UploadCloud className="w-7 h-7 text-zinc-400 group-hover:text-blue-500 transition-all mb-1.5" />
                  <span className={`text-[10.5px] font-bold ${isDark ? "text-zinc-300" : "text-zinc-700"}`}>
                    Video faylni tanlash va saqlash
                  </span>
                  <span className="text-[9px] text-zinc-500 font-medium mt-0.5">
                    MP4, WEBM yoki OGG formatida yuklang
                  </span>
                  <input 
                    type="file" 
                    accept="video/*" 
                    onChange={handleLocalVideoUpload} 
                    className="hidden" 
                  />
                </label>
              </div>
            </div>
          </div>

        </div>

        {/* Right column: The big daily installment schedule list */}
        <div className="lg:col-span-2 space-y-6">
          <div className={`rounded-3xl border p-6 transition-all duration-300 ${
            isDark 
              ? "border-zinc-805 bg-zinc-900/40 backdrop-blur-md" 
              : "border-zinc-200 bg-white shadow-xs"
          }`}>
            <div className={`flex flex-col sm:flex-row sm:items-center sm:justify-between gap-2 border-b pb-4 mb-4 ${
              isDark ? "border-zinc-850" : "border-zinc-100"
            }`}>
              <div>
                <h3 className={`text-lg font-black tracking-tight flex items-center gap-2 ${isDark ? "text-white" : "text-zinc-900"}`}>
                  <Calendar className="w-5.5 h-5.5 text-blue-600" />
                  Kunlik bo'lib-bo'lib to'lash taqvimi
                </h3>
                <p className={`text-xs ${isDark ? "text-zinc-400" : "text-zinc-500"}`}>
                  Har bir kunlik to'lovni tasdiqlash uchun belgilang
                </p>
              </div>

              <div className="text-xs font-mono font-bold text-zinc-455">
                To'langan kunliklar: <span className={isDark ? "text-white" : "text-zinc-900"}>{debtor.repaymentSchedule.filter(d=>d.isPaid).length}</span> ta / <span className="text-blue-600">{debtor.termDays} ta</span>
              </div>
            </div>

            {/* Repayment Days Grid Schedule */}
            <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-3.5 max-h-[580px] overflow-y-auto pr-1">
              {debtor.repaymentSchedule.map((day) => (
                <div 
                  key={day.id}
                  onClick={() => handleToggleDay(day.id)}
                  className={`
                    p-3.5 rounded-2xl border transition-all duration-205 cursor-pointer flex justify-between items-center group/card
                    ${day.isPaid 
                      ? isDark 
                        ? "bg-blue-500/10 border-blue-500/40 text-blue-400 font-bold" 
                        : "bg-blue-50/80 border-blue-200 text-blue-800 font-bold"
                      : isDark
                        ? "bg-rose-500/10 border-rose-500/30 text-rose-300 hover:border-rose-500/50 transition-all animate-pulse-subtle"
                        : "bg-rose-50/60 border-rose-150 text-rose-800 hover:border-rose-300"
                    }
                  `}
                >
                  <div className="space-y-1 text-left">
                    <span className="text-[9px] font-extrabold font-mono text-zinc-400 tracking-wider block">
                      {day.dayIndex}-KUN
                    </span>
                    <span className="font-mono font-extrabold text-sm select-all">
                      {formatCurrency(day.amount)}
                    </span>
                    <span className="text-[9px] text-zinc-450 font-mono block">
                      Sana: {day.dueDate}
                    </span>
                  </div>

                  <div className="flex items-center gap-1 font-mono">
                    {day.isPaid ? (
                      <span className="p-1 px-2 rounded-xl bg-blue-500/20 text-blue-500 border border-blue-400/20 text-[10px] font-bold flex items-center gap-0.5">
                        <Check className="w-3 h-3" /> To'landi (Ko'k)
                      </span>
                    ) : (
                      <span className="p-1 px-2 rounded-xl bg-rose-500/10 text-rose-500 border border-rose-450/20 text-[10px] font-bold flex items-center gap-0.5 animate-pulse">
                        Kutilmoqda (Qizil)
                      </span>
                    )}
                  </div>
                </div>
              ))}
            </div>
          </div>

          {/* Payment Logs History Timeline */}
          <div className={`rounded-3xl border p-6 transition-all duration-300 ${
            isDark 
              ? "border-zinc-805 bg-zinc-900/40 backdrop-blur-md" 
              : "border-zinc-200 bg-white shadow-xs"
          }`}>
            <h3 className={`text-sm font-black font-mono uppercase tracking-wider mb-4 border-b pb-3 ${
              isDark ? "text-white border-zinc-850" : "text-zinc-900 border-zinc-100"
            }`}>To'lovlar tarixi</h3>
            
            <div className="space-y-4 max-h-[220px] overflow-y-auto pr-1">
              {debtor.paymentLogs.length === 0 ? (
                <p className="text-xs text-zinc-500 font-mono font-bold text-center py-6">Xozircha hech qanday to'lovlar amalga oshirilmagan.</p>
              ) : (
                debtor.paymentLogs.map((log) => (
                  <div key={log.id} className={`flex items-start justify-between p-3.5 rounded-2xl border text-xs font-mono gap-3 ${
                    isDark ? "bg-zinc-950 border-zinc-800 text-zinc-300" : "bg-zinc-50 border-zinc-150 text-zinc-800"
                  }`}>
                    <div className="flex items-start gap-2.5 text-left">
                      <div className="bg-emerald-50 border border-emerald-150 p-1.5 rounded-lg text-emerald-700 text-center leading-none mt-0.5 font-bold">
                        +
                      </div>
                      <div>
                        <p className="text-zinc-900 font-extrabold">{log.note || "Qabul qilingan to'lov"}</p>
                        <p className="text-[10px] text-zinc-450 mt-0.5">Sana: {log.date}</p>
                      </div>
                    </div>

                    <div className="text-right">
                      <span className="text-emerald-700 font-black font-sans text-sm block">
                        +{formatCurrency(log.amount)}
                      </span>
                    </div>
                  </div>
                ))
              )}
            </div>
          </div>

        </div>

      </div>
    </div>
  );
}
