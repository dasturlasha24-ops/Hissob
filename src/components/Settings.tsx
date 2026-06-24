import React, { useState, useRef } from "react";
import { Settings as SettingsType } from "../types";
import ConfirmModal from "./ConfirmModal";
import { 
  Settings as SettingsIcon, 
  Save, 
  Image as ImageIcon, 
  Download, 
  Upload, 
  RotateCcw, 
  Check, 
  Info,
  Sparkles,
  Send,
  Phone
} from "lucide-react";

interface SettingsProps {
  settings: SettingsType;
  onUpdateSettings: (settings: SettingsType) => void;
  onExportData: () => void;
  onImportData: (jsonData: string) => boolean;
  onResetData: () => void;
  isDark?: boolean;
}

export default function Settings({ 
  settings, 
  onUpdateSettings, 
  onExportData, 
  onImportData, 
  onResetData,
  isDark
}: SettingsProps) {
  
  const [projectName, setProjectName] = useState(settings.projectName);
  const [bgType, setBgType] = useState<SettingsType["bgType"]>(settings.bgType);
  const [customBgUrl, setCustomBgUrl] = useState(settings.customBgUrl);
  const [bgPreset, setBgPreset] = useState(settings.bgPreset);
  const [themeColor, setThemeColor] = useState(settings.themeColor);
  const [telegramPhone, setTelegramPhone] = useState(settings.telegramPhone || "");
  const [telegramUsername, setTelegramUsername] = useState(settings.telegramUsername || "");
  const [showResetConfirm, setShowResetConfirm] = useState(false);
  
  const [importStatus, setImportStatus] = useState<{ type: 'success' | 'error' | null, msg: string }>({ type: null, msg: "" });
  const [saveStatus, setSaveStatus] = useState(false);
  const fileInputRef = useRef<HTMLInputElement>(null);

  // Background presets listing
  const presets = [
    { id: "emerald_cyber", label: "Lux Emerald Ledger Wallpaper", url: "/src/assets/images/dashboard_bg_1782128204817.jpg", style: "bg-emerald-950 border-emerald-500/40" },
    { id: "dark_slate", label: "Sokin Tungi Slate (Monoxrom)", url: "https://images.unsplash.com/photo-1618005182384-a83a8bd57fbe?auto=format&fit=crop&w=1200&q=80", style: "bg-slate-900 border-slate-500/20" },
    { id: "golden_finance", label: "Elegant Oltin Oqim", url: "https://images.unsplash.com/photo-1639762681485-074b7f938ba0?auto=format&fit=crop&w=1200&q=80", style: "bg-amber-950 border-amber-500/20" },
    { id: "stellar_space", label: "Samoviy Yulduzlar", url: "https://images.unsplash.com/photo-1534796636912-3b95b3ab5986?auto=format&fit=crop&w=1200&q=80", style: "bg-indigo-950 border-indigo-500/20" },
  ];

  // Gradients presets listing
  const gradients = [
    { id: "grad-1", label: "Sleek Emerald Gradient", style: "bg-gradient-to-br from-slate-950 via-slate-900 to-emerald-950 border-emerald-500/30", cssClass: "bg-gradient-to-br from-slate-950 via-slate-900 to-emerald-950" },
    { id: "grad-2", label: "Teal Deep Sea", style: "bg-gradient-to-br from-slate-950 via-slate-900 to-teal-950 border-teal-500/30", cssClass: "bg-gradient-to-br from-slate-950 via-slate-900 to-teal-950" },
    { id: "grad-3", label: "Rich Cosmic Purple", style: "bg-gradient-to-br from-slate-950 via-slate-900 to-purple-950 border-purple-500/30", cssClass: "bg-gradient-to-br from-slate-950 via-slate-900 to-purple-950" },
    { id: "grad-4", label: "Charcoal Platinum", style: "bg-gradient-to-br from-slate-950 via-slate-900 to-slate-800 border-slate-500/30", cssClass: "bg-gradient-to-br from-slate-950 via-slate-900 to-slate-800" },
  ];

  const handleSave = (e: React.FormEvent) => {
    e.preventDefault();
    onUpdateSettings({
      projectName: projectName.trim() || "Shaxsiy Qarz Daftari",
      bgType,
      customBgUrl: customBgUrl.trim(),
      bgPreset,
      themeColor,
      telegramPhone: telegramPhone.trim(),
      telegramUsername: telegramUsername.trim()
    });

    setSaveStatus(true);
    setTimeout(() => setSaveStatus(false), 2000);
  };

  const selectPreset = (presetUrl: string, id: string) => {
    setBgType('image');
    setBgPreset(id);
    setCustomBgUrl(presetUrl);
  };

  const selectGradient = (gradientClass: string) => {
    setBgType('gradient');
    setBgPreset(gradientClass);
  };

  // Import Database file handler
  const handleImportFile = (e: React.ChangeEvent<HTMLInputElement>) => {
    setImportStatus({ type: null, msg: "" });
    const file = e.target.files?.[0];
    if (!file) return;

    const reader = new FileReader();
    reader.onload = (event) => {
      try {
        const jsonContent = event.target?.result as string;
        const success = onImportData(jsonContent);
        if (success) {
          setImportStatus({ type: 'success', msg: "Ma'lumotlar zaxiradan muvaffaqiyatli tiklandi! Tizim yangilandi." });
        } else {
          setImportStatus({ type: 'error', msg: "Xatolik: Yuklangan fayl formati mos emas." });
        }
      } catch (err) {
        setImportStatus({ type: 'error', msg: "Xatolik: Faylni o'qishda xatolik yuz berdi." });
      }
    };
    reader.readAsText(file);
  };

  return (
    <div className="space-y-6 animate-fade-in pb-16">
      
      {/* Settings Header */}
      <div>
        <h1 className={`text-2xl md:text-3xl font-black tracking-tight flex items-center gap-2.5 ${isDark ? "text-white" : "text-zinc-900"}`}>
          <SettingsIcon className="w-8 h-8 text-blue-600" />
          Moslashtirish va Sozlamalar
        </h1>
        <p className={`text-sm mt-1 shadow-2xs ${isDark ? "text-zinc-400" : "text-zinc-500"}`}>
          Loyiha nomini o'zgartirish, dekorativ orqa fonlar, zaxira nusxalarni boshqarish
        </p>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        
        {/* Left main setting: Name and backgrounds */}
        <form onSubmit={handleSave} className={`lg:col-span-2 space-y-6 rounded-3xl border p-6 transition-all duration-300 ${
          isDark 
            ? "border-zinc-800 bg-zinc-900/40 backdrop-blur-md" 
            : "border-zinc-200 bg-white shadow-xs"
        }`}>
          {saveStatus && (
            <div className="p-3.5 bg-emerald-50 border border-emerald-250 text-emerald-800 text-xs font-bold rounded-2xl flex items-center gap-2">
              <Check className="w-4 h-4 text-emerald-600" /> Sozlamalar muvaffaqiyatli saqlandi!
            </div>
          )}

          {/* Project Name Setting */}
          <div className="space-y-2">
            <label className={`block text-[10px] font-bold uppercase tracking-wider font-mono ${isDark ? "text-zinc-400" : "text-zinc-500"}`}>
              Loyiha Nomi (Sarlavha)
            </label>
            <input
              type="text"
              value={projectName}
              onChange={(e) => setProjectName(e.target.value)}
              placeholder="Masalan: Shaxsiy Hisob-Kitob Daftari"
              className={`w-full px-4 py-3 rounded-2xl border text-sm font-semibold focus:outline-none transition-all duration-200 ${
                isDark 
                  ? "bg-zinc-950/40 border-zinc-800 focus:border-zinc-700 text-white" 
                  : "bg-zinc-50 border-zinc-200 focus:border-zinc-300 text-zinc-900"
              }`}
              required
            />
            <p className="text-[10px] text-zinc-450 leading-normal font-mono font-bold">
              Ushbu nom sidebar va sarlavhalarda dinamik ravishda ko'rsatiladi.
            </p>
          </div>

          <hr className={`border-b-0 ${isDark ? "border-zinc-800" : "border-zinc-100"}`} />

          {/* Telegram Sozlamalari (Telegram Integration Settings) */}
          <div className="space-y-4">
            <div>
              <span className="flex items-center gap-1.5 text-xs font-black uppercase font-mono tracking-wider text-blue-500">
                <Send className="w-4 h-4 animate-pulse" />
                Telegram Integratsiyasi & Bog'lash
              </span>
              <p className={`text-[11px] mt-0.5 font-medium ${isDark ? "text-zinc-400" : "text-zinc-500"}`}>
                Qarzdorlik shartnomalari, kunlik to'lovlar va hisobotlarni Telegram'ga bitta klavish bilan yuborish uchun hisobingizni sozlang.
              </p>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div className="space-y-2">
                <label className={`block text-[10px] font-extrabold uppercase tracking-wide font-mono ${isDark ? "text-zinc-350" : "text-zinc-650"}`}>
                  Sizning telefon raqamingiz (Telegram)
                </label>
                <div className="relative">
                  <div className="absolute inset-y-0 left-0 pl-3.5 flex items-center pointer-events-none">
                    <Phone className="h-4 w-4 text-zinc-500" />
                  </div>
                  <input
                    type="tel"
                    placeholder="Masalan: +998901234567"
                    value={telegramPhone}
                    onChange={(e) => setTelegramPhone(e.target.value)}
                    className={`w-full pl-10 pr-4 py-3 rounded-2xl border text-xs font-semibold focus:outline-none transition-all duration-200 ${
                      isDark 
                        ? "bg-zinc-950/40 border-zinc-800 focus:border-zinc-700 text-white placeholder-zinc-600" 
                        : "bg-zinc-50 border-zinc-200 focus:border-zinc-300 text-zinc-900"
                    }`}
                  />
                </div>
              </div>

              <div className="space-y-2">
                <label className={`block text-[10px] font-extrabold uppercase tracking-wide font-mono ${isDark ? "text-zinc-350" : "text-zinc-650"}`}>
                  Telegram foydalanuvchi nomi (@username)
                </label>
                <div className="relative">
                  <div className="absolute inset-y-0 left-0 pl-3.5 flex items-center pointer-events-none">
                    <span className="text-zinc-500 font-bold font-mono text-xs">@</span>
                  </div>
                  <input
                    type="text"
                    placeholder="shaxsiy_username"
                    value={telegramUsername}
                    onChange={(e) => setTelegramUsername(e.target.value)}
                    className={`w-full pl-8 pr-4 py-3 rounded-2xl border text-xs font-semibold focus:outline-none transition-all duration-200 ${
                      isDark 
                        ? "bg-zinc-950/40 border-zinc-800 focus:border-zinc-700 text-white placeholder-zinc-600" 
                        : "bg-zinc-50 border-zinc-200 focus:border-zinc-300 text-zinc-900"
                    }`}
                  />
                </div>
              </div>
            </div>
            <div className={`p-3 rounded-2xl border text-[10.5px] font-mono leading-relaxed space-y-1.5 ${
              isDark ? "bg-zinc-950/40 border-zinc-800/60 text-zinc-400" : "bg-zinc-50 border-zinc-200 text-zinc-600"
            }`}>
              <div className="flex items-center gap-1.5 font-bold text-blue-500">
                <Info className="w-3.5 h-3.5" /> Qanday ishlaydi?
              </div>
              <p>
                Raqam yoki foydalanuvchi nomingizni saqlaning. Qarzdor burchagida paydo bo'ladigan <strong>"Telegramga jo'natish"</strong> tugmasini bosganingizda, tizim ushbu foydalanuvchiga/guruhga qarzdor hisoboti, jami limitlar va qolgan kunlarni chiroyli formatlangan matn ko'rinishida yuborish imkonini taqdim etadi.
              </p>
            </div>
          </div>

          <hr className={`border-b-0 ${isDark ? "border-zinc-800" : "border-zinc-100"}`} />

          {/* Background settings */}
          <div className="space-y-4">
            <label className={`block text-[10px] font-bold uppercase tracking-wider font-mono ${isDark ? "text-zinc-400" : "text-zinc-500"}`}>
              Glavni Fon turi va rasmi ("Glavni fonga rasim qo'yish")
            </label>

            {/* Select Wallpaper Types */}
            <div className="grid grid-cols-3 gap-2.5">
              {[
                { id: "image", label: "Rasm Fon" },
                { id: "gradient", label: "Gradient" },
                { id: "solid", label: "Tungi Slate" }
              ].map((type) => (
                <button
                  key={type.id}
                  type="button"
                  onClick={() => setBgType(type.id as SettingsType["bgType"])}
                  className={`py-3.5 rounded-2xl border text-xs font-bold transition-all cursor-pointer ${
                    bgType === type.id 
                      ? "bg-blue-600 text-white border-blue-650 shadow-sm" 
                      : isDark
                        ? "bg-zinc-800/40 border-zinc-805 text-zinc-400 hover:text-zinc-200 hover:bg-zinc-800"
                        : "bg-zinc-50 border-zinc-100 text-zinc-600 hover:border-zinc-200 hover:bg-zinc-100"
                  }`}
                >
                  {type.label}
                </button>
              ))}
            </div>

            {/* If Preset or Built-in Wallpaper */}
            {bgType === "image" && (
              <div className="space-y-4 animate-fade-in pt-2">
                {/* Built-in high-quality presets */}
                <span className={`text-[10px] font-bold font-mono uppercase block ${isDark ? "text-zinc-400" : "text-zinc-500"}`}>Chiroyli fona tayyor rasmlar</span>
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3.5">
                  {presets.map((preset) => {
                    const isSelected = bgPreset === preset.id;
                    return (
                      <div
                        key={preset.id}
                        onClick={() => selectPreset(preset.url, preset.id)}
                        className={`relative rounded-2xl border-2 p-3 h-20 flex flex-col justify-end overflow-hidden cursor-pointer group transition-all duration-200 ${
                          isSelected 
                            ? "border-blue-600 bg-blue-50/10" 
                            : isDark ? "border-zinc-800 bg-zinc-900/60 hover:border-zinc-700" : "border-zinc-200 bg-zinc-50 hover:border-zinc-300"
                        }`}
                      >
                        {/* Fake background blurred preview */}
                        <div 
                          className="absolute inset-0 opacity-40 bg-cover bg-center group-hover:scale-105 transition-transform" 
                          style={{ backgroundImage: `url(${preset.url})` }}
                        />
                        <div className="absolute inset-0 bg-gradient-to-t from-zinc-950 via-zinc-950/60 to-transparent" />
                        
                        <span className="relative z-10 text-xs font-bold text-white truncate">{preset.label}</span>
                        {isSelected && (
                          <div className="absolute top-2 right-2 bg-blue-600 p-1 rounded-full text-white">
                            <Check className="w-3 h-3" />
                          </div>
                        )}
                      </div>
                    );
                  })}
                </div>

                {/* Direct Image URL input */}
                <div className="space-y-2 pt-2">
                  <span className={`text-[10px] font-bold font-mono uppercase block ${isDark ? "text-zinc-400" : "text-zinc-500"}`}>Maxsus rasm havolasi (URL link)</span>
                  <div className="relative">
                    <ImageIcon className="absolute left-3.5 top-3.5 w-4 h-4 text-zinc-400" />
                    <input
                      type="url"
                      value={customBgUrl}
                      onChange={(e) => {
                        setCustomBgUrl(e.target.value);
                        setBgPreset("custom");
                      }}
                      placeholder="https://images.unsplash.com/... yoki har qanday rasm ssilkasi"
                      className={`w-full pl-11 pr-4 py-3 rounded-2xl border text-xs focus:outline-none font-mono ${
                        isDark 
                          ? "bg-zinc-950/50 border-zinc-800 focus:border-zinc-700 text-white" 
                          : "bg-zinc-50 border-zinc-200 focus:border-zinc-300 text-zinc-900"
                      }`}
                    />
                  </div>
                  <p className="text-[10px] text-zinc-455 leading-relaxed font-mono font-bold">
                    Istagan rasmingiz URL manzilini joylang. Dastur avtomatik ravishda orqa fonga o'rnatib moslashtiradi.
                  </p>
                </div>
              </div>
            )}

            {/* If Gradient background option */}
            {bgType === "gradient" && (
              <div className="space-y-3 animate-fade-in pt-2">
                <span className={`text-[10px] font-bold font-mono uppercase block ${isDark ? "text-zinc-400" : "text-zinc-500"}`}>Gradient ranglarni tanlang</span>
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3.5">
                  {gradients.map((g) => {
                    const isSelected = bgPreset === g.cssClass;
                    return (
                      <div
                        key={g.id}
                        onClick={() => selectGradient(g.cssClass)}
                        className={`p-4 h-16 rounded-2xl border-2 flex items-center justify-between cursor-pointer transition-all ${g.style} ${
                          isSelected ? "border-blue-500" : "hover:scale-[1.01]"
                        }`}
                      >
                        <span className="text-xs font-bold text-white">{g.label}</span>
                        {isSelected && (
                          <div className="bg-blue-600 p-1.5 rounded-full text-white">
                            <Check className="w-3 h-3" />
                          </div>
                        )}
                      </div>
                    );
                  })}
                </div>
              </div>
            )}

            {/* Solid system slate */}
            {bgType === "solid" && (
              <div className={`p-4 rounded-2xl text-xs font-mono leading-relaxed border ${
                isDark ? "bg-zinc-900/60 border-zinc-800 text-zinc-400" : "bg-zinc-50 border-zinc-150 text-zinc-500"
              }`}>
                Tungi Slate rejimi faollashtirildi. Hech qanday rasmlarsiz sof qora silliq monoxrom interfeys. Batareyani tejaydi va ko'zni charchatmaydi.
              </div>
            )}
          </div>

          <button
            type="submit"
            className="w-full py-4 rounded-2xl bg-blue-600 text-white font-extrabold text-xs hover:bg-blue-500 transition-all flex items-center justify-center gap-1.5 cursor-pointer uppercase tracking-wider shadow-md"
          >
            <Save className="w-4 h-4 text-white" />
            O'zgarishlarni Saqlash
          </button>
        </form>

        {/* Right column: Backups/Data export/import & Reset */}
        <div className="space-y-6 animate-fade-in">
          
          {/* Export / Import backup */}
          <div className={`rounded-3xl border p-6 space-y-4 transition-all duration-300 ${
            isDark 
              ? "border-zinc-800 bg-zinc-900/40 backdrop-blur-md" 
              : "border-zinc-200 bg-white shadow-xs"
          }`}>
            <h3 className={`text-sm font-bold font-mono uppercase tracking-wider flex items-center gap-1.5 ${isDark ? "text-white" : "text-zinc-900"}`}>
              <Download className="w-4 h-4 text-blue-600" />
              Ma'lumotlar zaxirasi (Backups)
            </h3>
            <p className={`text-xs leading-relaxed ${isDark ? "text-zinc-400" : "text-zinc-500"}`}>
              Daftardagi barcha qarzdorlar va to'lovlar tarixini JSON fayl ko'rinishida yuklab oling. Keyinchalik istalgan qurilmada uni yuklashingiz mumkin.
            </p>

            {importStatus.type && (
              <div className={`p-3 text-xs font-bold rounded-2xl border ${importStatus.type === 'success' 
                ? "bg-emerald-50 border-emerald-250 text-emerald-800" 
                : "bg-rose-50 border-rose-250 text-rose-800"
              }`}>
                {importStatus.msg}
              </div>
            )}

            <div className="space-y-2.5 pt-2">
              {/* Export Trigger */}
              <button
                type="button"
                onClick={onExportData}
                className={`w-full py-3.5 text-xs rounded-2xl border font-bold cursor-pointer transition-all flex items-center justify-center gap-1.5 ${
                  isDark 
                    ? "bg-zinc-950 border-zinc-800 hover:border-zinc-700 text-zinc-250" 
                    : "bg-zinc-50 border-zinc-200 hover:bg-zinc-100 text-zinc-800"
                }`}
              >
                <Download className="w-4 h-4 text-blue-600" />
                Ma'lumotlarni Yuklab Olish (.json)
              </button>

              {/* Import Trigger */}
              <input
                type="file"
                ref={fileInputRef}
                onChange={handleImportFile}
                accept=".json"
                className="hidden"
              />
              <button
                type="button"
                onClick={() => fileInputRef.current?.click()}
                className={`w-full py-3.5 text-xs rounded-2xl border font-bold cursor-pointer transition-all flex items-center justify-center gap-1.5 ${
                  isDark 
                    ? "bg-zinc-950 border-zinc-800 hover:border-zinc-700 text-zinc-250" 
                    : "bg-zinc-50 border-zinc-200 hover:bg-zinc-100 text-zinc-800"
                }`}
              >
                <Upload className="w-4 h-4 text-emerald-600" />
                Zaxira Fayldan Tiklash (.json)
              </button>
            </div>
          </div>

          {/* Reset All Database */}
          <div className="rounded-3xl border border-rose-600/10 bg-rose-50/5 p-6 space-y-4">
            <h3 className="text-sm font-bold text-rose-600 font-mono uppercase tracking-wider flex items-center gap-1.5">
              <RotateCcw className="w-4.5 h-4.5 text-rose-600" />
              Tizimni Qayta Tiklash
            </h3>
            <p className="text-xs text-rose-500 leading-relaxed font-semibold">
              Barcha kiritilgan qarzdorlar ro'yxatini va to'lovlar loglarni o'chirib yuboradi, hamda ilovani ilk holatiga qaytaradi (demo ma'lumotlar bilan).
            </p>

            <button
              type="button"
              onClick={() => {
                setShowResetConfirm(true);
              }}
              className="w-full py-3.5 text-xs font-extrabold rounded-2xl bg-rose-50 border border-rose-200 hover:bg-rose-600 hover:text-white hover:border-rose-650 cursor-pointer transition-all flex items-center justify-center gap-1.5 text-rose-700 uppercase tracking-wider"
            >
              <RotateCcw className="w-4 h-4" />
              Ma'lumolarni butunlay tozalash
            </button>
          </div>

        </div>

      </div>

      {/* Custom Confirm Modal for Full Reset */}
      <ConfirmModal
        isOpen={showResetConfirm}
        onClose={() => setShowResetConfirm(false)}
        onConfirm={onResetData}
        title="Ma'lumotlarni tozalash"
        message="DIQQAT! Barcha kiritilgan shaxsiy qarz yozuvlari va to'lovlar butunlay o'chib ketadi. Amallarni tasdiqlaysizmi?"
        confirmText="Ha, butunlay tozalash"
        cancelText="Bekor qilish"
        isDark={isDark}
        variant="danger"
      />
    </div>
  );
}
