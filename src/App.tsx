import { useState, useEffect } from "react";
import Sidebar from "./components/Sidebar";
import Dashboard from "./components/Dashboard";
import DebtorsList from "./components/DebtorsList";
import AddDebtor from "./components/AddDebtor";
import DebtorDetails from "./components/DebtorDetails";
import Settings from "./components/Settings";
import SuccessPopup from "./components/SuccessPopup";
import Login from "./components/Login";
import LogoutConfirm from "./components/LogoutConfirm";
import { Debtor, Settings as SettingsType } from "./types";
import { defaultDebtors } from "./utils";
import { 
  collection, 
  getDocs, 
  setDoc, 
  doc, 
  deleteDoc, 
  getDoc,
  getDocFromServer
} from "firebase/firestore";
import { onAuthStateChanged, signOut, User } from "firebase/auth";
import { db, auth, handleFirestoreError, OperationType } from "./firebase";

const LOCAL_STORAGE_DEBTORS_KEY = "qarz_daftari_debtors_v2_clean";
const LOCAL_STORAGE_SETTINGS_KEY = "qarz_daftari_settings_v1";

const defaultSettings: SettingsType = {
  projectName: "Hisob-Kitob & Qarz Daftari",
  bgType: "gradient",
  bgPreset: "bg-gradient-to-br from-[#060b21] via-[#0b1739] to-[#020617]",
  customBgUrl: "",
  themeColor: "blue",
  telegramPhone: "",
  telegramUsername: ""
};

export default function App() {
  const [currentTab, setCurrentTab] = useState<string>("dashboard");
  const [debtors, setDebtors] = useState<Debtor[]>([]);
  const [settings, setSettings] = useState<SettingsType>(defaultSettings);
  const [isLoading, setIsLoading] = useState<boolean>(true);
  const [selectedDebtorId, setSelectedDebtorId] = useState<string | null>(null);
  const [user, setUser] = useState<User | null>(null);
  const [showLogoutConfirm, setShowLogoutConfirm] = useState<boolean>(false);
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

  const loadData = async () => {
    setIsLoading(true);
    try {
      // 1. Test database connection
      try {
        await getDocFromServer(doc(db, "test", "connection"));
      } catch (connectionErr) {
        console.warn("Firestore connection check info:", connectionErr);
      }

      // 2. Fetch debtors from Firestore
      const debtorsCollection = collection(db, "debtors");
      const snapshot = await getDocs(debtorsCollection);
      const loadedDebtors: Debtor[] = [];
      snapshot.forEach((docSnap) => {
        loadedDebtors.push(docSnap.data() as Debtor);
      });

      // Sort by createdAt descending
      loadedDebtors.sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime());
      setDebtors(loadedDebtors);
      localStorage.setItem(LOCAL_STORAGE_DEBTORS_KEY, JSON.stringify(loadedDebtors));

      // 3. Fetch settings from Firestore
      const settingsDocRef = doc(db, "settings", "global");
      const settingsSnap = await getDoc(settingsDocRef);
      if (settingsSnap.exists()) {
        const loadedSettings = settingsSnap.data() as SettingsType;
        setSettings(loadedSettings);
        localStorage.setItem(LOCAL_STORAGE_SETTINGS_KEY, JSON.stringify(loadedSettings));
      } else {
        await setDoc(settingsDocRef, defaultSettings);
        setSettings(defaultSettings);
        localStorage.setItem(LOCAL_STORAGE_SETTINGS_KEY, JSON.stringify(defaultSettings));
      }
    } catch (e) {
      console.error("Firestore loading failed, falling back to local storage:", e);
      // Fallback to LocalStorage
      const storedDebtors = localStorage.getItem(LOCAL_STORAGE_DEBTORS_KEY);
      if (storedDebtors) {
        setDebtors(JSON.parse(storedDebtors));
      } else {
        setDebtors([]);
      }

      const storedSettings = localStorage.getItem(LOCAL_STORAGE_SETTINGS_KEY);
      if (storedSettings) {
        setSettings(JSON.parse(storedSettings));
      } else {
        setSettings(defaultSettings);
      }
    } finally {
      setIsLoading(false);
    }
  };

  // Listen to Auth state changes on mount
  useEffect(() => {
    const unsubscribe = onAuthStateChanged(auth, (currentUser) => {
      setUser(currentUser);
      if (currentUser) {
        loadData();
      } else {
        setDebtors([]);
        setIsLoading(false);
      }
    });

    return () => unsubscribe();
  }, []);

  const handleLogout = async () => {
    setIsLoading(true);
    try {
      await signOut(auth);
    } catch (e) {
      console.error("Logout error", e);
    } finally {
      setIsLoading(false);
    }
  };

  const handleAddDebtor = async (newDebtor: Debtor) => {
    // Optimistic UI update
    const updated = [newDebtor, ...debtors];
    setDebtors(updated);
    localStorage.setItem(LOCAL_STORAGE_DEBTORS_KEY, JSON.stringify(updated));

    // Write to Firestore
    try {
      await setDoc(doc(db, "debtors", newDebtor.id), newDebtor);
    } catch (error) {
      handleFirestoreError(error, OperationType.WRITE, `debtors/${newDebtor.id}`);
    }
  };

  const handleUpdateDebtor = async (updatedDebtor: Debtor) => {
    // Optimistic UI update
    const updated = debtors.map((d) => (d.id === updatedDebtor.id ? updatedDebtor : d));
    setDebtors(updated);
    localStorage.setItem(LOCAL_STORAGE_DEBTORS_KEY, JSON.stringify(updated));

    // Update in Firestore
    try {
      await setDoc(doc(db, "debtors", updatedDebtor.id), updatedDebtor);
    } catch (error) {
      handleFirestoreError(error, OperationType.WRITE, `debtors/${updatedDebtor.id}`);
    }
  };

  const handleDeleteDebtor = async (id: string) => {
    // Optimistic UI update
    const updated = debtors.filter((d) => d.id !== id);
    setDebtors(updated);
    localStorage.setItem(LOCAL_STORAGE_DEBTORS_KEY, JSON.stringify(updated));
    if (selectedDebtorId === id) {
      setSelectedDebtorId(null);
    }

    // Delete from Firestore
    try {
      await deleteDoc(doc(db, "debtors", id));
    } catch (error) {
      handleFirestoreError(error, OperationType.DELETE, `debtors/${id}`);
    }
  };

  const handleUpdateSettings = async (newSettings: SettingsType) => {
    setSettings(newSettings);
    localStorage.setItem(LOCAL_STORAGE_SETTINGS_KEY, JSON.stringify(newSettings));

    // Write settings to Firestore
    try {
      await setDoc(doc(db, "settings", "global"), newSettings);
    } catch (error) {
      handleFirestoreError(error, OperationType.WRITE, "settings/global");
    }
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
        const importedDebtors = parsed.debtors as Debtor[];
        setDebtors(importedDebtors);
        localStorage.setItem(LOCAL_STORAGE_DEBTORS_KEY, JSON.stringify(importedDebtors));

        // Sync all imported debtors to Firestore in the background
        importedDebtors.forEach(async (debtor) => {
          try {
            await setDoc(doc(db, "debtors", debtor.id), debtor);
          } catch (e) {
            console.error(`Failed to sync imported debtor ${debtor.id} to Firestore`, e);
          }
        });

        if (parsed.settings && parsed.settings.projectName) {
          const importedSettings = parsed.settings as SettingsType;
          setSettings(importedSettings);
          localStorage.setItem(LOCAL_STORAGE_SETTINGS_KEY, JSON.stringify(importedSettings));
          setDoc(doc(db, "settings", "global"), importedSettings).catch((err) => {
            console.error("Failed to sync settings to Firestore", err);
          });
        }
        return true;
      }
      return false;
    } catch (e) {
      console.error("Failed to parse JSON backup files", e);
      return false;
    }
  };

  // Total reset back to clean state
  const handleResetData = async () => {
    const previousDebtors = [...debtors];
    setDebtors([]);
    localStorage.setItem(LOCAL_STORAGE_DEBTORS_KEY, JSON.stringify([]));
    setSettings(defaultSettings);
    localStorage.setItem(LOCAL_STORAGE_SETTINGS_KEY, JSON.stringify(defaultSettings));
    setCurrentTab("dashboard");
    setSelectedDebtorId(null);

    // Reset database
    try {
      for (const debtor of previousDebtors) {
        await deleteDoc(doc(db, "debtors", debtor.id));
      }
      await setDoc(doc(db, "settings", "global"), defaultSettings);
    } catch (e) {
      console.error("Firestore reset failed", e);
    }
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

  const isDarkBg = true; // Always premium eye-friendly dark blue theme as requested

  const getBackgroundClass = () => {
    if (settings.bgType === "solid" || settings.bgType === "system") {
      return "bg-[#060b21] text-slate-100";
    }
    if (settings.bgType === "gradient") {
      return settings.bgPreset || "bg-gradient-to-br from-[#060b21] via-[#0b1739] to-[#020617] text-white";
    }
    return "bg-[#060b21] text-white"; // default deep dark blue/navy
  };

  if (isLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-zinc-950 text-white">
        <div className="flex flex-col items-center gap-4">
          <div className="w-12 h-12 border-4 border-blue-500 border-t-transparent rounded-full animate-spin"></div>
          <p className="text-sm font-semibold tracking-wider text-zinc-400 uppercase animate-pulse">
            Tizimga ulanmoqda...
          </p>
        </div>
      </div>
    );
  }

  if (!user) {
    return (
      <Login 
        onSuccess={() => {}} 
        projectName={settings.projectName}
      />
    );
  }

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
          userEmail={user.email}
          onLogout={() => setShowLogoutConfirm(true)}
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

      {/* Logout Confirmation Modal */}
      <LogoutConfirm
        isOpen={showLogoutConfirm}
        onClose={() => setShowLogoutConfirm(false)}
        onConfirm={handleLogout}
        isDark={isDarkBg}
      />
    </div>
  );
}
