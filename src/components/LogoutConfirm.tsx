import React from "react";
import { motion, AnimatePresence } from "motion/react";
import { LogOut, X, AlertTriangle } from "lucide-react";

interface LogoutConfirmProps {
  isOpen: boolean;
  onClose: () => void;
  onConfirm: () => void;
  isDark?: boolean;
}

export default function LogoutConfirm({ isOpen, onClose, onConfirm, isDark }: LogoutConfirmProps) {
  return (
    <AnimatePresence>
      {isOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
          {/* Backdrop with motion fade */}
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            onClick={onClose}
            className="fixed inset-0 bg-black/80 backdrop-blur-sm"
          />

          {/* Dialog Container */}
          <motion.div
            initial={{ opacity: 0, scale: 0.95, y: 15 }}
            animate={{ opacity: 1, scale: 1, y: 0 }}
            exit={{ opacity: 0, scale: 0.95, y: 15 }}
            transition={{ type: "spring", duration: 0.4 }}
            className={`w-full max-w-md rounded-[2.2rem] border p-7 shadow-2xl relative z-10 overflow-hidden ${
              isDark 
                ? "border-zinc-800/80 bg-zinc-900/90 backdrop-blur-xl text-white" 
                : "border-zinc-200 bg-white text-zinc-900 shadow-zinc-500/10"
            }`}
          >
            {/* Ambient glowing effect */}
            <div className="absolute top-[-20%] left-[-20%] w-[60%] h-[60%] bg-rose-500/10 rounded-full blur-[80px] pointer-events-none" />

            {/* Close Button */}
            <button
              onClick={onClose}
              className={`absolute top-4 right-4 p-2 rounded-full transition-colors cursor-pointer ${
                isDark ? "hover:bg-zinc-800 text-zinc-400 hover:text-white" : "hover:bg-zinc-100 text-zinc-500 hover:text-zinc-950"
              }`}
            >
              <X className="w-5 h-5" />
            </button>

            {/* Icon & Title */}
            <div className="flex flex-col items-center text-center space-y-4 pt-4">
              <div className="inline-flex items-center justify-center w-14 h-14 rounded-2xl bg-rose-500/10 border border-rose-500/25 text-rose-500 shadow-lg shadow-rose-500/5 animate-bounce-subtle">
                <LogOut className="w-7 h-7" />
              </div>
              
              <div className="space-y-1.5">
                <h3 className="text-xl font-black tracking-tight leading-none uppercase font-mono text-rose-500">
                  Tizimdan chiqish
                </h3>
                <p className={`text-sm font-semibold ${isDark ? "text-zinc-300" : "text-zinc-650"}`}>
                  Haqiqatdan ham tizimdan chiqmoqchimisiz?
                </p>
              </div>

              <p className={`text-xs leading-relaxed max-w-xs ${isDark ? "text-zinc-500" : "text-zinc-400"}`}>
                Tizimdan chiqqandan so'ng, qayta kirish uchun administrator bergan login va parolni kiritishingiz kerak bo'ladi. Barcha joriy seans ma'lumotlari xavfsiz holda saqlanadi.
              </p>
            </div>

            {/* Action Buttons */}
            <div className="flex flex-col sm:flex-row gap-3 mt-6">
              <button
                onClick={onConfirm}
                className="flex-1 py-3.5 bg-gradient-to-tr from-rose-600 to-red-500 hover:from-rose-500 hover:to-red-400 text-white rounded-2xl font-black text-xs uppercase tracking-widest transition-all duration-200 cursor-pointer shadow-lg hover:shadow-rose-550/20 active:scale-[0.99] flex items-center justify-center gap-1.5"
              >
                <LogOut className="w-4 h-4" />
                <span>Ha, Chiqish</span>
              </button>
              
              <button
                onClick={onClose}
                className={`flex-1 py-3.5 border font-black text-xs uppercase tracking-widest rounded-2xl transition-all duration-200 cursor-pointer ${
                  isDark 
                    ? "bg-zinc-800/50 border-zinc-700/80 text-zinc-300 hover:bg-zinc-850 hover:text-white" 
                    : "bg-zinc-50 border-zinc-200 text-zinc-655 hover:bg-zinc-100 hover:text-zinc-900"
                }`}
              >
                Bekor qilish
              </button>
            </div>
          </motion.div>
        </div>
      )}
    </AnimatePresence>
  );
}
