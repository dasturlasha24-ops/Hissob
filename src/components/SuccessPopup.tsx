import { useEffect, useState } from "react";
import { CheckCircle2, ArrowDownLeft, ArrowUpRight, X, Sparkles, Flame, Check } from "lucide-react";

interface SuccessPopupProps {
  isOpen: boolean;
  onClose: () => void;
  type: "kirim" | "chiqim";
  amount: number;
  debtorName: string;
  isDark: boolean;
}

export default function SuccessPopup({ isOpen, onClose, type, amount, debtorName, isDark }: SuccessPopupProps) {
  const [shouldRender, setShouldRender] = useState(isOpen);
  const [animate, setAnimate] = useState(false);

  useEffect(() => {
    if (isOpen) {
      setShouldRender(true);
      // Small timeout to trigger transition
      const timer = setTimeout(() => setAnimate(true), 50);
      return () => clearTimeout(timer);
    } else {
      setAnimate(false);
      const timer = setTimeout(() => setShouldRender(false), 300);
      return () => clearTimeout(timer);
    }
  }, [isOpen]);

  if (!shouldRender) return null;

  const formatCurrency = (val: number) => {
    return val.toString().replace(/\B(?=(\d{3})+(?!\d))/g, " ") + " UZS";
  };

  return (
    <div className="fixed inset-0 z-100 flex items-center justify-center p-4">
      {/* Backdrop */}
      <div 
        onClick={onClose}
        className={`absolute inset-0 bg-zinc-950/80 transition-opacity duration-300 backdrop-blur-xs ${
          animate ? "opacity-100" : "opacity-0"
        }`} 
      />

      {/* Modal Card */}
      <div 
        className={`relative w-full max-w-md overflow-hidden rounded-3xl border transition-all duration-300 transform shadow-2xl ${
          animate ? "scale-100 translate-y-0 opacity-100" : "scale-95 translate-y-4 opacity-0"
        } ${
          isDark 
            ? "border-zinc-800 bg-zinc-900/95 text-white" 
            : "border-zinc-200 bg-white text-zinc-900"
        }`}
      >
        {/* Glow Effects */}
        <div className={`absolute -top-24 -left-20 w-48 h-48 rounded-full blur-3xl opacity-20 pointer-events-none ${
          type === "kirim" ? "bg-emerald-500" : "bg-blue-500"
        }`} />
        <div className={`absolute -bottom-24 -right-20 w-48 h-48 rounded-full blur-3xl opacity-15 pointer-events-none ${
          type === "kirim" ? "bg-emerald-400" : "bg-purple-500"
        }`} />

        {/* Close Button */}
        <button 
          onClick={onClose}
          className={`absolute right-4.5 top-4.5 p-1.5 rounded-full transition-colors cursor-pointer ${
            isDark ? "hover:bg-zinc-800 text-zinc-400" : "hover:bg-zinc-100 text-zinc-500"
          }`}
        >
          <X className="w-5 h-5" />
        </button>

        <div className="p-6 md:p-8 flex flex-col items-center text-center relative z-10">
          
          {/* Animated Success Seal Icon */}
          <div className="relative mb-6">
            {/* outer rotating rim */}
            <div className={`absolute inset-0 rounded-full animate-spin-slow border-2 border-dashed ${
              type === "kirim" ? "border-emerald-500/40" : "border-blue-500/40"
            }`} style={{ animationDuration: '10s' }} />
            
            {/* inner solid glow circle */}
            <div className={`w-20 h-20 rounded-full flex items-center justify-center relative shadow-inner ${
              type === "kirim" 
                ? "bg-emerald-500/10 text-emerald-400 border border-emerald-500/20" 
                : "bg-blue-500/10 text-blue-400 border border-blue-500/20"
            }`}>
              {type === "kirim" ? (
                <Check className="w-9 h-9 text-emerald-505 animate-bounce-short" />
              ) : (
                <Sparkles className="w-8 h-8 text-blue-400 animate-pulse" />
              )}
            </div>

            {/* Float details indicator bubble */}
            <span className={`absolute -bottom-1 -right-1 px-2.5 py-1 rounded-full text-[9px] font-black tracking-wider uppercase font-mono shadow-sm flex items-center gap-1 border ${
              type === "kirim" 
                ? "bg-emerald-500 text-black border-emerald-400" 
                : "bg-blue-600 text-white border-blue-500"
            }`}>
              {type === "kirim" ? (
                <>
                  <ArrowDownLeft className="w-3 h-3 text-black" />
                  Kirim
                </>
              ) : (
                <>
                  <ArrowUpRight className="w-3 h-3 text-white" />
                  Chiqim
                </>
              )}
            </span>
          </div>

          {/* Titles */}
          <h2 className="text-xl font-extrabold tracking-tight">
            {type === "kirim" ? "Kirim Muhrlandi! 🟢" : "Chiqim Tasdiqlandi! 🔵"}
          </h2>
          <p className={`text-xs mt-1.5 max-w-xs ${isDark ? "text-zinc-400" : "text-zinc-500"}`}>
            {type === "kirim" 
              ? "To'lov miqdori mijoz qarz jadvaliga muvofiqlashtirildi va hisobga olindi" 
              : "Yangi qarz shartnomasi va uning kunlik to'lov grafigi muvaffaqiyatli faollashtirildi"}
          </p>

          {/* Amount Box */}
          <div className={`w-full mt-6 p-4 rounded-2xl border text-center relative ${
            isDark 
              ? "bg-zinc-950/50 border-zinc-800" 
              : "bg-zinc-50 border-zinc-200"
          }`}>
            <span className={`text-[10px] font-bold tracking-widest font-mono uppercase block ${
              isDark ? "text-zinc-500" : "text-zinc-400"
            }`}>
              Amal Summasi
            </span>
            <span className={`text-2xl font-black font-mono tracking-tight block mt-1 ${
              type === "kirim" ? "text-emerald-500" : "text-blue-500"
            }`}>
              {formatCurrency(amount)}
            </span>
          </div>

          {/* Debtor Meta Rows */}
          <div className="w-full mt-4 space-y-2.5 text-xs font-medium">
            <div className={`flex justify-between items-center py-2 border-b ${
              isDark ? "border-zinc-800/60 text-zinc-300" : "border-zinc-100 text-zinc-600"
            }`}>
              <span>Mijoz (Qarzdor):</span>
              <span className={`font-bold ${isDark ? "text-white" : "text-zinc-900"}`}>{debtorName}</span>
            </div>
            <div className={`flex justify-between items-center text-zinc-500`}>
              <span>Xizmat turi:</span>
              <span className={`font-mono font-bold ${type === "kirim" ? "text-emerald-500" : "text-blue-500"}`}>
                {type === "kirim" ? "KUNLIK TO'LOV" : "YANGI SARMOYA"}
              </span>
            </div>
            <div className={`flex justify-between items-center text-zinc-500`}>
              <span>Tizim holati:</span>
              <span className="text-zinc-400 flex items-center gap-1">
                <span className="w-2 h-2 rounded-full bg-emerald-500 animate-ping inline-block" />
                MUVAFFAQIYATLI
              </span>
            </div>
          </div>

          {/* Confirm Button */}
          <button
            onClick={onClose}
            className={`w-full mt-7 py-3 rounded-2xl font-bold cursor-pointer transition-all duration-200 transform active:scale-98 shadow-md hover:shadow-lg flex items-center justify-center gap-2 text-sm ${
              type === "kirim"
                ? "bg-emerald-500 hover:bg-emerald-400 text-zinc-950 font-black"
                : "bg-blue-600 hover:bg-blue-500 text-white font-black"
            }`}
          >
            Yopish va Davom etish
          </button>
        </div>
      </div>
    </div>
  );
}
