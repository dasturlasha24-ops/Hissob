import React, { useState, useEffect } from "react";
import { motion, AnimatePresence } from "motion/react";
import { Download, Monitor, Smartphone, X, Check, ExternalLink } from "lucide-react";

interface PWAInstallBannerProps {
  isDark?: boolean;
  isCollapsed?: boolean;
}

export default function PWAInstallBanner({ isDark = true, isCollapsed = false }: PWAInstallBannerProps) {
  const [deferredPrompt, setDeferredPrompt] = useState<any>(null);
  const [isInstallable, setIsInstallable] = useState(false);
  const [showModal, setShowModal] = useState(false);
  const [isStandalone, setIsStandalone] = useState(false);
  const [installStatus, setInstallStatus] = useState<"idle" | "installing" | "installed">("idle");

  useEffect(() => {
    // Check if already running in standalone mode (PWA window)
    const checkStandalone = window.matchMedia("(display-mode: standalone)").matches || 
                            (window.navigator as any).standalone === true;
    setIsStandalone(checkStandalone);

    const handleBeforeInstallPrompt = (e: Event) => {
      e.preventDefault();
      setDeferredPrompt(e);
      setIsInstallable(true);
    };

    window.addEventListener("beforeinstallprompt", handleBeforeInstallPrompt);

    // Track when PWA is installed successfully
    const handleAppInstalled = () => {
      setInstallStatus("installed");
      setIsStandalone(true);
      setIsInstallable(false);
    };
    window.addEventListener("appinstalled", handleAppInstalled);

    return () => {
      window.removeEventListener("beforeinstallprompt", handleBeforeInstallPrompt);
      window.removeEventListener("appinstalled", handleAppInstalled);
    };
  }, []);

  const handleInstallClick = async () => {
    if (!deferredPrompt) {
      // If prompt isn't supported, we show the educational setup guide inside our modal
      setShowModal(true);
      return;
    }

    setShowModal(false);
    deferredPrompt.prompt();

    const { outcome } = await deferredPrompt.userChoice;
    if (outcome === "accepted") {
      setInstallStatus("installed");
      setDeferredPrompt(null);
      setIsInstallable(false);
    }
  };

  // If already standalone, we don't need to show install banner, but we can show an elegant badge
  if (isStandalone) {
    if (isCollapsed) {
      return (
        <div className="hidden lg:flex items-center justify-center w-10 h-10 bg-emerald-500/10 border border-emerald-500/20 text-emerald-400 rounded-xl mt-2 mx-auto shrink-0" title="Hisob App (Standalone)">
          <Check className="w-4 h-4" />
        </div>
      );
    }
    return (
      <div className="hidden lg:flex items-center gap-2 px-4 py-2 bg-emerald-500/10 border border-emerald-500/20 text-emerald-400 rounded-xl text-[10px] font-mono font-bold uppercase tracking-wider mt-2 mx-4 shrink-0 justify-center">
        <Check className="w-3.5 h-3.5" />
        <span>Hisob App (Standalone)</span>
      </div>
    );
  }

  return (
    <>
      {/* 1. Header/Sidebar Install Trigger Badge */}
      <div className={`px-4 py-2 mt-2 shrink-0 ${isCollapsed ? "mx-auto flex justify-center" : "mx-2 lg:mx-4"}`}>
        {isCollapsed ? (
          <button
            onClick={() => setShowModal(true)}
            className="w-11 h-11 flex items-center justify-center bg-gradient-to-tr from-blue-600 to-indigo-600 hover:from-blue-500 hover:to-indigo-500 text-white rounded-xl shadow-lg shadow-blue-500/15 cursor-pointer transition-all duration-200 hover:scale-[1.05] active:scale-[0.95] relative group"
            title="Dasturni o'rnatish (PWA)"
          >
            <Download className="w-5 h-5 animate-bounce-subtle text-blue-100 group-hover:text-white" />
            <span className="absolute -top-1 -right-1 w-2 h-2 rounded-full bg-emerald-400 animate-pulse" />
          </button>
        ) : (
          <button
            onClick={() => setShowModal(true)}
            className="w-full flex items-center justify-between gap-2.5 px-3.5 py-2.5 bg-gradient-to-tr from-blue-600 to-indigo-600 hover:from-blue-500 hover:to-indigo-500 text-white rounded-xl text-xs font-black uppercase tracking-wider shadow-lg shadow-blue-500/15 cursor-pointer transition-all duration-200 hover:scale-[1.02] active:scale-[0.98] group"
          >
            <div className="flex items-center gap-2">
              <Download className="w-4 h-4 animate-bounce-subtle text-blue-200" />
              <span className="text-left leading-none">
                Dasturni o'rnatish
                <span className="block text-[8.5px] font-mono text-blue-250 font-normal normal-case mt-0.5">
                  Tezkor & offline rejim
                </span>
              </span>
            </div>
            <span className="bg-white/15 px-1.5 py-0.5 rounded text-[8px] font-mono font-bold tracking-tight text-blue-100 group-hover:bg-white/20">
              PWA
            </span>
          </button>
        )}
      </div>

      {/* 2. Custom Premium Installation Promo Modal */}
      <AnimatePresence>
        {showModal && (
          <div className="fixed inset-0 z-55 flex items-center justify-center p-4">
            {/* Backdrop */}
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              onClick={() => setShowModal(false)}
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
              {/* Radial gradient background light */}
              <div className="absolute top-[-20%] left-[-20%] w-[60%] h-[60%] rounded-full blur-[80px] bg-blue-500/10 pointer-events-none" />

              {/* Close Button */}
              <button
                onClick={() => setShowModal(false)}
                className={`absolute top-4 right-4 p-2 rounded-full transition-colors cursor-pointer ${
                  isDark ? "hover:bg-[#131d45] text-zinc-400 hover:text-white" : "hover:bg-zinc-100 text-zinc-500 hover:text-zinc-950"
                }`}
              >
                <X className="w-5 h-5" />
              </button>

              <div className="flex flex-col items-center text-center space-y-5 pt-4">
                {/* PWA App Icon - Golden Coins / Money (Saves as /hisob_pwa_icon.jpg) */}
                <div className="relative group shrink-0">
                  <div className="absolute -inset-1 rounded-3xl bg-gradient-to-tr from-yellow-400 via-blue-500 to-indigo-600 opacity-60 blur-md group-hover:opacity-85 transition duration-300" />
                  <img
                    src="/hisob_pwa_icon.jpg"
                    alt="Hisob"
                    referrerPolicy="no-referrer"
                    onError={(e) => {
                      // Fallback if the image hasn't loaded yet
                      (e.target as HTMLImageElement).src = "https://images.unsplash.com/photo-1579621970563-ebec7560ff3e?auto=format&fit=crop&q=80&w=200";
                    }}
                    className="w-24 h-24 rounded-3xl relative border border-white/10 shadow-2xl object-cover shrink-0"
                  />
                </div>

                <div className="space-y-1.5">
                  <h3 className="text-2xl font-black tracking-tight leading-none uppercase font-mono bg-gradient-to-r from-yellow-300 via-blue-400 to-indigo-250 bg-clip-text text-transparent">
                    Hisob
                  </h3>
                  <p className={`text-xs font-mono tracking-widest uppercase font-bold ${isDark ? "text-blue-400" : "text-blue-600"}`}>
                    Mobil & Desktop Ilova
                  </p>
                </div>

                <p className={`text-sm font-semibold max-w-sm px-4 ${isDark ? "text-zinc-200" : "text-zinc-700"}`}>
                  Hisob dasturini bevosita smartfon yoki kompyuteringiz ekraniga yuklab oling va internetga ulanmasdan ham tezkor ishlashdan zavqlaning!
                </p>

                {/* Benefits List */}
                <div className={`w-full text-left p-4 rounded-2xl text-xs space-y-2 border ${
                  isDark ? "bg-[#060b21]/50 border-[#1a2652]/40" : "bg-zinc-50 border-zinc-150"
                }`}>
                  <div className="flex items-center gap-2.5">
                    <div className="w-5 h-5 rounded-md bg-emerald-500/10 text-emerald-400 flex items-center justify-center font-bold text-[10px]">✓</div>
                    <span className={isDark ? "text-zinc-300" : "text-zinc-650"}>Tezkor va xavfsiz oflayn rejim</span>
                  </div>
                  <div className="flex items-center gap-2.5">
                    <div className="w-5 h-5 rounded-md bg-emerald-500/10 text-emerald-400 flex items-center justify-center font-bold text-[10px]">✓</div>
                    <span className={isDark ? "text-zinc-300" : "text-zinc-650"}>Bosh ekranda chiroyli pul rasmli ikonka</span>
                  </div>
                  <div className="flex items-center gap-2.5">
                    <div className="w-5 h-5 rounded-md bg-emerald-500/10 text-emerald-400 flex items-center justify-center font-bold text-[10px]">✓</div>
                    <span className={isDark ? "text-zinc-300" : "text-zinc-650"}>Push xabarnomalar va qo'shimcha tezlik</span>
                  </div>
                </div>

                {/* Installation guide depending on OS support */}
                {isInstallable ? (
                  <button
                    onClick={handleInstallClick}
                    className="w-full py-4 bg-gradient-to-tr from-blue-600 to-indigo-600 hover:from-blue-500 hover:to-indigo-500 text-white rounded-2xl font-black text-xs uppercase tracking-widest transition-all duration-200 cursor-pointer shadow-lg shadow-blue-600/20 active:scale-[0.99] flex items-center justify-center gap-2"
                  >
                    <Download className="w-4 h-4" />
                    <span>Ilovani yuklab olish</span>
                  </button>
                ) : (
                  <div className="w-full space-y-4">
                    {/* iOS / Safari manual guide as fallback */}
                    <div className={`p-4 rounded-2xl border text-left space-y-3 ${
                      isDark ? "bg-amber-500/5 border-amber-500/20" : "bg-amber-500/5 border-amber-500/20"
                    }`}>
                      <h4 className="font-bold text-xs uppercase tracking-wider text-amber-400 flex items-center gap-1.5 font-mono">
                        <Smartphone className="w-4 h-4 text-amber-400" />
                        iOS / Safari uchun qo'lda o'rnatish
                      </h4>
                      <ol className={`list-decimal list-inside space-y-1 text-[11px] font-semibold leading-relaxed ${
                        isDark ? "text-zinc-350" : "text-zinc-600"
                      }`}>
                        <li>Safari brauzerida ulashish tugmasini (<span className="text-blue-400">"Share"</span> yoki <span className="font-bold">⎙</span>) bosing</li>
                        <li>Menyudan <span className="text-amber-400 font-bold">"Add to Home Screen"</span> (Bosh ekranga qo'shish) bandini tanlang</li>
                        <li>Sarlavhani <span className="text-blue-400">"Hisob"</span> qoldirib qo'shish tugmasini bosing</li>
                      </ol>
                    </div>

                    {/* Android/Chrome manual instructions */}
                    <div className={`p-4 rounded-2xl border text-left space-y-3 ${
                      isDark ? "bg-blue-500/5 border-blue-500/20" : "bg-blue-500/5 border-blue-500/20"
                    }`}>
                      <h4 className="font-bold text-xs uppercase tracking-wider text-blue-400 flex items-center gap-1.5 font-mono">
                        <Monitor className="w-4 h-4 text-blue-400" />
                        Android / Chrome uchun qo'lda o'rnatish
                      </h4>
                      <p className={`text-[11px] font-semibold leading-relaxed ${
                        isDark ? "text-zinc-350" : "text-zinc-600"
                      }`}>
                        Brauzeringizning manzillar satri (URL) o'ng tarafidagi <span className="text-blue-400 font-bold">Yuklab olish / O'rnatish (⊕)</span> belgisini bosing yoki Chrome menyusidan <span className="text-blue-400 font-bold">"Install App"</span> tanlang.
                      </p>
                    </div>

                    <button
                      onClick={() => setShowModal(false)}
                      className={`w-full py-3.5 border font-black text-xs uppercase tracking-widest rounded-2xl transition-all duration-200 cursor-pointer ${
                        isDark 
                          ? "bg-[#131d45]/50 border-[#1a2652]/80 text-zinc-300 hover:bg-[#131d45] hover:text-white" 
                          : "bg-zinc-50 border-zinc-200 text-zinc-655 hover:bg-zinc-100 hover:text-zinc-900"
                      }`}
                    >
                      Tushunarli, yopish
                    </button>
                  </div>
                )}
              </div>
            </motion.div>
          </div>
        )}
      </AnimatePresence>
    </>
  );
}
