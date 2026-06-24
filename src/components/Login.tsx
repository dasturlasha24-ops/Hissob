import React, { useState } from "react";
import { 
  signInWithEmailAndPassword,
  sendPasswordResetEmail
} from "firebase/auth";
import { auth } from "../firebase";
import { 
  Lock, 
  Mail, 
  Eye, 
  EyeOff, 
  ShieldCheck, 
  KeyRound, 
  AlertCircle,
  HelpCircle
} from "lucide-react";

interface LoginProps {
  onSuccess: () => void;
  projectName?: string;
}

export default function Login({ onSuccess, projectName }: LoginProps) {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [resetSent, setResetSent] = useState(false);
  const [showHelp, setShowHelp] = useState(false);

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!email || !password) {
      setError("Iltimos, email va parolni to'liq kiriting.");
      return;
    }

    setLoading(true);
    setError(null);

    try {
      await signInWithEmailAndPassword(auth, email.trim(), password);
      onSuccess();
    } catch (err: any) {
      console.error("Login error:", err);
      // Friendly Uzbek error translation
      if (err.code === "auth/invalid-credential" || err.code === "auth/wrong-password" || err.code === "auth/user-not-found") {
        setError("Email yoki parol noto'g'ri kiritildi. Iltimos, qaytadan urinib ko'ring.");
      } else if (err.code === "auth/too-many-requests") {
        setError("Haddan tashqari ko'p urinishlar qilindi. Hisob vaqtincha bloklandi, keyinroq qayta urining.");
      } else if (err.code === "auth/invalid-email") {
        setError("Email formati noto'g'ri. Masalan: info@domain.com");
      } else {
        setError(err.message || "Tizimga kirishda xatolik yuz berdi.");
      }
    } finally {
      setLoading(false);
    }
  };

  const handleForgotPassword = async () => {
    if (!email) {
      setError("Parolni tiklash uchun avval email manzilingizni yozing.");
      return;
    }
    setLoading(true);
    setError(null);
    try {
      await sendPasswordResetEmail(auth, email.trim());
      setResetSent(true);
      setTimeout(() => setResetSent(false), 6000);
    } catch (err: any) {
      console.error("Reset error:", err);
      if (err.code === "auth/invalid-email") {
        setError("Email formati noto'g'ri.");
      } else if (err.code === "auth/user-not-found") {
        setError("Ushbu email bilan ro'yxatdan o'tgan foydalanuvchi topilmadi.");
      } else {
        setError("Parolni tiklash xabarini yuborib bo'lmadi.");
      }
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen w-full flex items-center justify-center bg-zinc-950 text-white font-sans relative overflow-hidden px-4">
      {/* Decorative premium background light spots */}
      <div className="absolute top-[-10%] left-[-10%] w-[50%] h-[50%] bg-blue-600/10 rounded-full blur-[120px] pointer-events-none"></div>
      <div className="absolute bottom-[-10%] right-[-10%] w-[50%] h-[50%] bg-indigo-600/10 rounded-full blur-[120px] pointer-events-none"></div>
      
      {/* Dynamic line background pattern */}
      <div className="absolute inset-0 bg-[linear-gradient(to_right,#0f172a_1px,transparent_1px),linear-gradient(to_bottom,#0f172a_1px,transparent_1px)] bg-[size:4rem_4rem] [mask-image:radial-gradient(ellipse_60%_50%_at_50%_50%,#000_70%,transparent_100%)] opacity-30 pointer-events-none"></div>

      <div className="w-full max-w-md relative z-10 space-y-6">
        {/* Brand Header */}
        <div className="text-center space-y-3">
          <div className="inline-flex items-center justify-center w-16 h-16 rounded-3xl bg-gradient-to-tr from-blue-600 via-indigo-600 to-violet-500 shadow-xl shadow-blue-500/20 mb-1 border border-white/10 animate-pulse">
            <ShieldCheck className="w-8 h-8 text-white" />
          </div>
          <h1 className="text-3xl font-black tracking-tight bg-clip-text bg-gradient-to-r from-white via-zinc-100 to-zinc-400">
            {projectName || "Qarz Daftari"}
          </h1>
          <p className="text-sm font-mono tracking-widest text-zinc-400 uppercase font-bold">
            🔒 BELONGS TO AFZALBEK
          </p>
        </div>

        {/* Card Body */}
        <div className="p-8 rounded-[2rem] border border-zinc-800/80 bg-zinc-900/40 backdrop-blur-xl shadow-2xl relative">
          <div className="absolute top-4 right-4">
            <button 
              type="button"
              onClick={() => setShowHelp(!showHelp)}
              className="text-zinc-500 hover:text-blue-400 transition-colors p-1 rounded-full hover:bg-zinc-800/40"
              title="Yordam"
            >
              <HelpCircle className="w-5 h-5" />
            </button>
          </div>

          {showHelp ? (
            <div className="space-y-4 py-2 animate-fadeIn text-xs leading-relaxed text-zinc-300 font-sans">
              <h3 className="font-extrabold text-sm text-blue-400 flex items-center gap-1.5 uppercase font-mono">
                <KeyRound className="w-4 h-4" /> Kirish bo'yicha yo'riqnoma:
              </h3>
              <p>
                1. Ushbu tizimga faqat loyiha administratori (siz) tomonidan yaratilgan login va parollar orqali kirish mumkin.
              </p>
              <p>
                2. Yangi o'qituvchilarni qo'shish uchun Firebase Console boshqaruv panelining <strong className="text-emerald-400">Authentication</strong> bo'limiga o'tib, ularning email manzili va parolini kiriting.
              </p>
              <p>
                3. O'qituvchi o'z login ma'lumotlarini kiritib, tizimga kirgandan so'ng barcha mijozlar (qarzdorlar) va hisob-kitoblarni xavfsiz boshqarish imkoniyatiga ega bo'ladi.
              </p>
              <button 
                type="button"
                onClick={() => setShowHelp(false)}
                className="w-full mt-2 p-2.5 rounded-xl bg-zinc-800 hover:bg-zinc-700/80 transition-all font-bold text-center text-[10px] uppercase tracking-wider cursor-pointer"
              >
                Tushunarli, Orqaga qaytish
              </button>
            </div>
          ) : (
            <form onSubmit={handleLogin} className="space-y-5">
              {error && (
                <div className="p-3.5 rounded-2xl bg-rose-500/10 border border-rose-500/20 text-xs text-rose-400 flex items-start gap-2.5 leading-relaxed font-sans">
                  <AlertCircle className="w-4.5 h-4.5 text-rose-500 shrink-0 mt-0.5" />
                  <span>{error}</span>
                </div>
              )}

              {resetSent && (
                <div className="p-3.5 rounded-2xl bg-emerald-500/10 border border-emerald-550/20 text-xs text-emerald-400 flex items-start gap-2.5 leading-relaxed font-sans">
                  <ShieldCheck className="w-4.5 h-4.5 text-emerald-500 shrink-0 mt-0.5" />
                  <span>Parolni tiklash havolasi emailingizga yuborildi. Iltimos, pochtangizni tekshiring.</span>
                </div>
              )}

              <div className="space-y-1.5">
                <label className="text-[10px] font-black uppercase tracking-widest text-zinc-400 font-mono block">
                  Email Manzil
                </label>
                <div className="relative">
                  <div className="absolute inset-y-0 left-0 pl-3.5 flex items-center pointer-events-none text-zinc-500">
                    <Mail className="w-4.5 h-4.5" />
                  </div>
                  <input
                    type="email"
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    placeholder="oqtuvchi@gmail.com"
                    required
                    disabled={loading}
                    className="w-full pl-11 pr-4 py-3 bg-zinc-950/60 border border-zinc-800/80 rounded-2xl text-sm placeholder-zinc-600 focus:outline-hidden focus:ring-2 focus:ring-blue-500/40 focus:border-blue-500 transition-all"
                  />
                </div>
              </div>

              <div className="space-y-1.5">
                <div className="flex justify-between items-center">
                  <label className="text-[10px] font-black uppercase tracking-widest text-zinc-400 font-mono block">
                    Maxfiy Parol
                  </label>
                  <button
                    type="button"
                    onClick={handleForgotPassword}
                    disabled={loading}
                    className="text-[10px] font-black uppercase tracking-wider text-blue-500 hover:text-blue-400 transition-colors"
                  >
                    Parolni unutdingizmi?
                  </button>
                </div>
                <div className="relative">
                  <div className="absolute inset-y-0 left-0 pl-3.5 flex items-center pointer-events-none text-zinc-500">
                    <Lock className="w-4.5 h-4.5" />
                  </div>
                  <input
                    type={showPassword ? "text" : "password"}
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    placeholder="••••••••"
                    required
                    disabled={loading}
                    className="w-full pl-11 pr-11 py-3 bg-zinc-950/60 border border-zinc-800/80 rounded-2xl text-sm placeholder-zinc-600 focus:outline-hidden focus:ring-2 focus:ring-blue-500/40 focus:border-blue-500 transition-all"
                  />
                  <button
                    type="button"
                    onClick={() => setShowPassword(!showPassword)}
                    className="absolute inset-y-0 right-0 pr-3.5 flex items-center text-zinc-500 hover:text-white transition-colors"
                  >
                    {showPassword ? (
                      <EyeOff className="w-4.5 h-4.5" />
                    ) : (
                      <Eye className="w-4.5 h-4.5" />
                    )}
                  </button>
                </div>
              </div>

              <button
                type="submit"
                disabled={loading}
                className="w-full py-3.5 bg-gradient-to-tr from-blue-600 via-indigo-600 to-violet-500 hover:from-blue-500 hover:to-indigo-500 text-white rounded-2xl font-black text-xs uppercase tracking-widest cursor-pointer shadow-lg hover:shadow-blue-550/20 active:scale-[0.99] transition-all flex items-center justify-center gap-2 mt-2"
              >
                {loading ? (
                  <>
                    <div className="w-4.5 h-4.5 border-2 border-white border-t-transparent rounded-full animate-spin"></div>
                    <span>Tizimga kirilmoqda...</span>
                  </>
                ) : (
                  <>
                    <Lock className="w-4 h-4" />
                    <span>Xavfsiz Kirish</span>
                  </>
                )}
              </button>
            </form>
          )}
        </div>

        {/* Footer info label */}
        <p className="text-center text-[10px] font-mono text-zinc-500 leading-relaxed font-bold">
          Xavfsizlik tizimi faollashtirilgan. <br />
          Sessiyalar shifrlangan va xavfsiz holda himoyalanadi.
        </p>
      </div>
    </div>
  );
}
