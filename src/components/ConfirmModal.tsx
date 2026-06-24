import React from "react";
import { motion, AnimatePresence } from "motion/react";
import { Trash2, AlertTriangle, X } from "lucide-react";

interface ConfirmModalProps {
  isOpen: boolean;
  onClose: () => void;
  onConfirm: () => void;
  title: string;
  message: string;
  confirmText?: string;
  cancelText?: string;
  isDark?: boolean;
  variant?: "danger" | "warning" | "info";
}

export default function ConfirmModal({
  isOpen,
  onClose,
  onConfirm,
  title,
  message,
  confirmText = "Ha, o'chirish",
  cancelText = "Bekor qilish",
  isDark = true,
  variant = "danger"
}: ConfirmModalProps) {
  const getIconColorClass = () => {
    switch (variant) {
      case "danger":
        return "bg-rose-500/10 border-rose-500/25 text-rose-500 shadow-rose-500/5";
      case "warning":
        return "bg-amber-500/10 border-amber-500/25 text-amber-500 shadow-amber-500/5";
      default:
        return "bg-blue-500/10 border-blue-500/25 text-blue-500 shadow-blue-500/5";
    }
  };

  const getButtonClass = () => {
    switch (variant) {
      case "danger":
        return "bg-gradient-to-tr from-rose-600 to-red-500 hover:from-rose-500 hover:to-red-400 focus:ring-rose-500/40";
      case "warning":
        return "bg-gradient-to-tr from-amber-600 to-yellow-500 hover:from-amber-500 hover:to-yellow-400 focus:ring-amber-500/40";
      default:
        return "bg-gradient-to-tr from-blue-600 to-indigo-500 hover:from-blue-500 hover:to-indigo-400 focus:ring-blue-500/40";
    }
  };

  return (
    <AnimatePresence>
      {isOpen && (
        <div className="fixed inset-0 z-55 flex items-center justify-center p-4">
          {/* Backdrop */}
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            onClick={onClose}
            className="fixed inset-0 bg-black/80 backdrop-blur-xs"
          />

          {/* Modal Container */}
          <motion.div
            initial={{ opacity: 0, scale: 0.95, y: 15 }}
            animate={{ opacity: 1, scale: 1, y: 0 }}
            exit={{ opacity: 0, scale: 0.95, y: 15 }}
            transition={{ type: "spring", duration: 0.4 }}
            className={`w-full max-w-md rounded-[2.2rem] border p-7 shadow-2xl relative z-10 overflow-hidden ${
              isDark 
                ? "border-[#1a2652]/80 bg-[#09112e]/95 backdrop-blur-xl text-white" 
                : "border-zinc-200 bg-white text-zinc-900 shadow-zinc-500/10"
            }`}
          >
            {/* Ambient subtle glow based on variant */}
            <div className={`absolute top-[-20%] left-[-20%] w-[60%] h-[60%] rounded-full blur-[80px] pointer-events-none ${
              variant === "danger" ? "bg-rose-500/10" : variant === "warning" ? "bg-amber-500/10" : "bg-blue-500/10"
            }`} />

            {/* Close Button */}
            <button
              onClick={onClose}
              className={`absolute top-4 right-4 p-2 rounded-full transition-colors cursor-pointer ${
                isDark ? "hover:bg-[#131d45] text-zinc-400 hover:text-white" : "hover:bg-zinc-100 text-zinc-500 hover:text-zinc-950"
              }`}
            >
              <X className="w-5 h-5" />
            </button>

            {/* Icon, Title, and Message */}
            <div className="flex flex-col items-center text-center space-y-4 pt-4">
              <div className={`inline-flex items-center justify-center w-14 h-14 rounded-2xl border text-xl font-bold flex items-center justify-center shadow-lg ${getIconColorClass()}`}>
                {variant === "danger" || variant === "warning" ? (
                  <AlertTriangle className="w-7 h-7" />
                ) : (
                  <Trash2 className="w-7 h-7" />
                )}
              </div>

              <div className="space-y-1.5">
                <h3 className={`text-lg font-black tracking-tight leading-none uppercase font-mono ${
                  variant === "danger" ? "text-rose-450" : variant === "warning" ? "text-amber-450" : "text-blue-450"
                }`}>
                  {title}
                </h3>
                <p className={`text-sm font-semibold px-2 ${isDark ? "text-zinc-200" : "text-zinc-700"}`}>
                  {message}
                </p>
              </div>

              <p className={`text-xs leading-relaxed max-w-xs ${isDark ? "text-zinc-500" : "text-zinc-400"}`}>
                Ushbu amalni ortga qaytarib bo'lmaydi. Iltimos, qaror qabul qilishda diqqatli bo'ling.
              </p>
            </div>

            {/* Actions */}
            <div className="flex flex-col sm:flex-row gap-3 mt-6">
              <button
                onClick={() => {
                  onConfirm();
                  onClose();
                }}
                className={`flex-1 py-3.5 text-white rounded-2xl font-black text-xs uppercase tracking-widest transition-all duration-200 cursor-pointer shadow-lg hover:shadow-blue-550/10 active:scale-[0.99] flex items-center justify-center gap-1.5 ${getButtonClass()}`}
              >
                {variant === "danger" ? <Trash2 className="w-4 h-4" /> : null}
                <span>{confirmText}</span>
              </button>

              <button
                onClick={onClose}
                className={`flex-1 py-3.5 border font-black text-xs uppercase tracking-widest rounded-2xl transition-all duration-200 cursor-pointer ${
                  isDark 
                    ? "bg-[#131d45]/50 border-[#1a2652]/80 text-zinc-300 hover:bg-[#131d45] hover:text-white" 
                    : "bg-zinc-50 border-zinc-200 text-zinc-600 hover:bg-zinc-100 hover:text-zinc-900"
                }`}
              >
                {cancelText}
              </button>
            </div>
          </motion.div>
        </div>
      )}
    </AnimatePresence>
  );
}
