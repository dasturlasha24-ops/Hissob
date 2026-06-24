import { useState, useEffect } from "react";
import Sidebar from "./components/Sidebar";
import Dashboard from "./components/Dashboard";
import DebtorsList from "./components/DebtorsList";
import AddDebtor from "./components/AddDebtor";
import DebtorDetails from "./components/DebtorDetails";
import Settings from "./components/Settings";
import SuccessPopup from "./components/SuccessPopup";
import { Debtor, Settings as SettingsType } from "./types";
import { defaultDebtors } from "./utils";

const LOCAL_STORAGE_DEBTORS_KEY = "qarz_daftari_debtors_v2_clean";
const LOCAL_STORAGE_SETTINGS_KEY = "qarz_daftari_settings_v1";

const defaultSettings: SettingsType = {
  projectName: "Hisob-Kitob & Qarz Daftari",
  bgType: "solid",
  bgPreset: "",
  customBgUrl: "",
  themeColor: "blue",
  telegramPhone: "",
  telegramUsername: ""
};

export default function App() {
  const [currentTab, setCurrentTab] = useState<string>("dashboard");
  const [debtors, setDebtors] = useState<Debtor[]>([]);
  const [settings, setSettings] = useState<SettingsType>(defaultSettings);
  const [selectedDebtorId, setSelectedDebtorId] = useState<string | null>(null);
  const [popupData, setPopupData] = useState<{
    isOpen: boolean;
    type: "kirim" | "chiqim";
    amount: number;
    debtorName: string;
  }>({
    isOpen: false,
    type: "kirim",
    amount: 0,
    debtorName: ""
  });

  const triggerSuccessPopup = (type: "kirim" | "chiqim", amount: number, debtorName: string) => {
    setPopupData({
      isOpen: true,
      type,
      amount,
      debtorName,
    });
  };

  // Load from local storage on mount
  useEffect(() => {
    try {
      const storedDebtors = localStorage.getItem(LOCAL_STORAGE_DEBTORS_KEY);
      if (storedDebtors) {
        setDebtors(JSON.parse(storedDebtors));
      } else {
        // Initialize with realistic demo debtors for a rich initial experience
        setDebtors(defaultDebtors);
        localStorage.setItem(LOCAL_STORAGE_DEBTORS_KEY, JSON.stringify(defaultDebtors));
      }

      const storedSettings = localStorage.getItem(LOCAL_STORAGE_SETTINGS_KEY);
      if (storedSettings) {
        setSettings(JSON.parse(storedSettings));
      } else {
        localStorage.setItem(LOCAL_STORAGE_SETTINGS_KEY, JSON.stringify(defaultSettings));
      }
    } catch (e) {
      console.error("Local storage error during load", e);
    }
  }, []);

  // Save actions to local storage helper
  const saveDebtors = (updatedDebtors: Debtor[]) => {
    setDebtors(updatedDebtors);
    localStorage.setItem(LOCAL_STORAGE_DEBTORS_KEY, JSON.stringify(updatedDebtors));
  };

  const handleAddDebtor = (newDebtor: Debtor) => {
    const updated = [newDebtor, ...debtors];
    saveDebtors(updated);
  };

  const handleUpdateDebtor = (updatedDebtor: Debtor) => {
    const updated = debtors.map((d) => (d.id === updatedDebtor.id ? updatedDebtor : d));
    saveDebtors(updated);
  };

  const handleDeleteDebtor = (id: string) => {
    const updated = debtors.filter((d) => d.id !== id);
    saveDebtors(updated);
    if (selectedDebtorId === id) {
      setSelectedDebtorId(null);
    }
  };

  const handleUpdateSettings = (newSettings: SettingsType) => {
    setSettings(newSettings);
    localStorage.setItem(LOCAL_STORAGE_SETTINGS_KEY, JSON.stringify(newSettings));
  };

  // Backups: Export as JSON file
  const handleExportData = () => {
    const dataToExport = {
      version: 1,
      debtors,
      settings,
      exportedAt: new Date().toISOString()
    };
    const jsonString = `data:text/json;charset=utf-8,${encodeURIComponent(
      JSON.stringify(dataToExport, null, 2)
    )}`;
    const downloadAnchor = document.createElement("a");
    downloadAnchor.setAttribute("href", jsonString);
    downloadAnchor.setAttribute("download", `qarz-daftar-zaxira-${new Date().toISOString().split("T")[0]}.json`);
    document.body.appendChild(downloadAnchor);
    downloadAnchor.click();
    downloadAnchor.remove();
  };

  // Backups: Import JSON file
  const handleImportData = (jsonData: string): boolean => {
    try {
      const parsed = JSON.parse(jsonData);
      if (parsed && Array.isArray(parsed.debtors)) {
        // Simple valid checks
        const importedDebtors = parsed.debtors as Debtor[];
        setDebtors(importedDebtors);
        localStorage.setItem(LOCAL_STORAGE_DEBTORS_KEY, JSON.stringify(importedDebtors));

        if (parsed.settings && parsed.settings.projectName) {
          const importedSettings = parsed.settings as SettingsType;
          setSettings(importedSettings);
          localStorage.setItem(LOCAL_STORAGE_SETTINGS_KEY, JSON.stringify(importedSettings));
        }
        return true;
      }
      return false;
    } catch (e) {
      console.error("Failed to parse JSON backup files", e);
      return false;
    }
  };

  // Total reset back to demo
  const handleResetData = () => {
    setDebtors(defaultDebtors);
    localStorage.setItem(LOCAL_STORAGE_DEBTORS_KEY, JSON.stringify(defaultDebtors));
    setSettings(defaultSettings);
    localStorage.setItem(LOCAL_STORAGE_SETTINGS_KEY, JSON.stringify(defaultSettings));
    setCurrentTab("dashboard");
    setSelectedDebtorId(null);
  };

  const handleSelectDebtor = (id: string) => {
    setSelectedDebtorId(id);
    setCurrentTab("debtor-details");
  };

  // Retrieve active selected debtor
  const activeDebtor = debtors.find((d) => d.id === selectedDebtorId);

  // Background styling mapping
  const getBackgroundStyle = () => {
    if (settings.bgType === "image" && settings.customBgUrl) {
      return {
        backgroundImage: `url("${settings.customBgUrl}")`,
        backgroundSize: "cover",
        backgroundPosition: "center",
        backgroundAttachment: "fixed"
      };
    }
    return {};
  };

  const isDarkBg = settings.bgType === "image" || settings.bgType === "gradient";

  const getBackgroundClass = () => {
    if (settings.bgType === "solid" || settings.bgType === "system") {
      return "bg-zinc-100 text-zinc-950";
    }
    if (settings.bgType === "gradient") {
      // bgPreset contains the custom css class for styling gradients
      return settings.bgPreset || "bg-gradient-to-br from-slate-950 via-slate-900 to-emerald-950 text-white";
    }
    return "bg-slate-950 text-white"; // default dark back
  };

  return (
    <div 
      className={`min-h-screen flex flex-col lg:flex-row relative transition-all duration-300 ${isDarkBg ? "text-slate-100" : "text-zinc-950"} ${getBackgroundClass()}`}
      style={getBackgroundStyle() as any}
    >
      {/* Dark overlay backdrop to secure AAA high contrast readability over arbitrary custom background images */}
      {settings.bgType === "image" && (
        <div className="absolute inset-0 bg-slate-950/85 backdrop-blur-xs pointer-events-none z-0" />
      )}

      {/* Main sidebar container */}
      <div className="relative z-10 w-full lg:w-auto">
        <Sidebar 
          currentTab={currentTab} 
          setCurrentTab={(tab) => {
            setCurrentTab(tab);
            if (tab !== "debtor-details") {
              setSelectedDebtorId(null);
            }
          }} 
          projectName={settings.projectName}
        />
      </div>

      {/* Main Scrollable Content Panel */}
      <main className="flex-1 relative z-10 p-4 md:p-8 overflow-y-auto h-screen pt-20 lg:pt-8">
        <div className="max-w-7xl mx-auto">
          {currentTab === "dashboard" && (
            <Dashboard 
              debtors={debtors} 
              onSelectDebtor={handleSelectDebtor} 
              setCurrentTab={setCurrentTab}
              isDark={isDarkBg}
            />
          )}

          {currentTab === "debtors" && (
            <DebtorsList 
              debtors={debtors} 
              onSelectDebtor={handleSelectDebtor} 
              setCurrentTab={setCurrentTab}
              isDark={isDarkBg}
            />
          )}

          {currentTab === "add-debtor" && (
            <AddDebtor 
              onAddDebtor={handleAddDebtor}
              onShowSuccess={triggerSuccessPopup}
              setCurrentTab={setCurrentTab}
              isDark={isDarkBg}
            />
          )}

          {currentTab === "debtor-details" && activeDebtor && (
            <DebtorDetails 
              debtor={activeDebtor} 
              onBack={() => {
                setCurrentTab("debtors");
                setSelectedDebtorId(null);
              }}
              onUpdateDebtor={handleUpdateDebtor}
              onDeleteDebtor={handleDeleteDebtor}
              onShowSuccess={triggerSuccessPopup}
              settings={settings}
              isDark={isDarkBg}
            />
          )}

          {currentTab === "debtor-details" && !activeDebtor && (
            <div className={`text-center py-16 border rounded-3xl ${isDarkBg ? "bg-zinc-900/40 border-zinc-700/50 text-slate-300" : "bg-white border-zinc-200 text-zinc-500 shadow-sm"}`}>
              <p className="text-sm">Qarzdor topilmadi yoki o'chirilgan.</p>
              <button 
                onClick={() => setCurrentTab("debtors")}
                className="mt-4 px-4 py-2 text-xs bg-blue-600 text-white font-bold rounded-xl cursor-pointer shadow-md hover:bg-blue-500 transition-all"
              >
                Ro'yxatga qaytish
              </button>
            </div>
          )}

          {currentTab === "settings" && (
            <Settings 
              settings={settings}
              onUpdateSettings={handleUpdateSettings}
              onExportData={handleExportData}
              onImportData={handleImportData}
              onResetData={handleResetData}
              isDark={isDarkBg}
            />
          )}
        </div>
      </main>

      {/* Success Popup Modal */}
      <SuccessPopup
        isOpen={popupData.isOpen}
        onClose={() => setPopupData(prev => ({ ...prev, isOpen: false }))}
        type={popupData.type}
        amount={popupData.amount}
        debtorName={popupData.debtorName}
        isDark={isDarkBg}
      />
    </div>
  );
}
