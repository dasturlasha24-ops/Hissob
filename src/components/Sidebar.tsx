import { useState } from "react";
import PWAInstallBanner from "./PWAInstallBanner";
import { 
  LayoutDashboard, 
  Users, 
  UserPlus, 
  Settings as SettingsIcon, 
  Menu, 
  X, 
  CircleDollarSign,
  TrendingUp,
  LogOut
} from "lucide-react";

interface SidebarProps {
  currentTab: string;
  setCurrentTab: (tab: string) => void;
  projectName: string;
  userEmail?: string | null;
  onLogout?: () => void;
}

export default function Sidebar({ 
  currentTab, 
  setCurrentTab, 
  projectName,
  userEmail,
  onLogout
}: SidebarProps) {
  const [isOpen, setIsOpen] = useState(false);
  const [isHovered, setIsHovered] = useState(false);

  const menuItems = [
    { id: "dashboard", label: "Bosh sahifa (Analitika)", icon: LayoutDashboard },
    { id: "debtors", label: "Qarzdorlar Ro'yxati", icon: Users },
    { id: "add-debtor", label: "Yangi Qarzdor Qo'shish", icon: UserPlus },
    { id: "settings", label: "Sozlamalar", icon: SettingsIcon },
  ];

  const handleTabChange = (tabId: string) => {
    setCurrentTab(tabId);
    setIsOpen(false);
  };

  return (
    <>
      {/* Mobile Top Bar */}
      <header className="lg:hidden w-full backdrop-blur-md bg-[#09112e]/95 text-white border-b border-[#1a2652]/60 px-4 py-3 flex justify-between items-center z-40 fixed top-0 left-0">
        <div className="flex items-center gap-2">
          <div className="bg-blue-600 p-2 rounded-lg text-white">
            <CircleDollarSign className="w-5 h-5" />
          </div>
          <span className="font-bold tracking-tight uppercase text-sm">
            {projectName || "FINANCIER"}
          </span>
        </div>
        <button 
          onClick={() => setIsOpen(!isOpen)} 
          className="p-2 hover:bg-[#131d45] rounded-lg transition-colors focus:outline-none"
          aria-label="Toggle Menu"
        >
          {isOpen ? <X className="w-6 h-6" /> : <Menu className="w-6 h-6" />}
        </button>
      </header>

      {/* Mobile Backdrop Overlay */}
      {isOpen && (
        <div 
          onClick={() => setIsOpen(false)} 
          className="lg:hidden fixed inset-0 bg-black/60 backdrop-blur-sm z-40"
        />
      )}

      {/* Sidebar Container */}
      <aside 
        onMouseEnter={() => setIsHovered(true)}
        onMouseLeave={() => setIsHovered(false)}
        className={`
          fixed inset-y-0 left-0 z-50 
          bg-[#09112e]/95 text-white backdrop-blur-xl
          flex flex-col h-full transition-all duration-300 ease-in-out
          lg:translate-x-0 lg:static lg:h-screen lg:flex-shrink-0
          ${isOpen ? "translate-x-0 w-64" : "-translate-x-full lg:translate-x-0"}
          ${isOpen ? "pt-0" : "pt-16 lg:pt-0"}
          ${isHovered ? "lg:w-64" : "lg:w-[76px]"}
          border-r border-[#1a2652]/60
        `}
      >
        {/* Header section */}
        <div className="p-6 lg:px-5 border-b border-[#1a2652]/50 flex items-center justify-between">
          <div className="flex items-center gap-3 overflow-hidden">
            <div className="w-8.5 h-8.5 bg-gradient-to-tr from-blue-600 via-indigo-650 to-violet-500 rounded-xl flex items-center justify-center font-black text-lg text-white shrink-0 shadow-lg shadow-blue-500/10 tracking-wider">
              {projectName ? projectName.charAt(0).toUpperCase() : "F"}
            </div>
            <div className={`flex flex-col transition-all duration-300 ${isHovered ? "opacity-100 max-w-[170px] ml-1" : "lg:opacity-0 lg:max-w-0 lg:overflow-hidden"}`}>
              <span className="text-sm font-black tracking-tight uppercase text-white truncate whitespace-nowrap bg-clip-text bg-gradient-to-r from-white via-zinc-100 to-zinc-300">
                {projectName || "Financier"}
              </span>
              <span className="text-[9px] text-blue-400 font-mono tracking-widest uppercase flex items-center gap-1 whitespace-nowrap font-black">
                <TrendingUp className="w-2.5 h-2.5 text-blue-400" /> Shaxsiy Hisob
              </span>
            </div>
          </div>
          {isOpen && (
            <button 
              onClick={() => setIsOpen(false)} 
              className="lg:hidden p-1.5 hover:bg-[#131d45] rounded-lg transition-colors text-zinc-400 hover:text-white"
            >
              <X className="w-5 h-5" />
            </button>
          )}
        </div>

        {/* Menu Items */}
        <nav className={`flex-1 ${isHovered ? "px-3" : "px-3 lg:px-2"} py-6 space-y-1.5 overflow-y-auto`}>
          {menuItems.map((item) => {
            const Icon = item.icon;
            const isActive = currentTab === item.id;
            return (
              <button
                key={item.id}
                onClick={() => handleTabChange(item.id)}
                className={`
                  w-full flex items-center gap-3 ${isHovered ? "px-4 justify-start" : "px-4 lg:px-0 lg:justify-center"} py-3 rounded-xl text-xs font-black uppercase tracking-wider
                  transition-all duration-200 cursor-pointer group
                  ${isActive 
                    ? "bg-blue-600/25 text-blue-400 border-l-3 border-blue-500 shadow-md" 
                    : "text-zinc-400 hover:text-zinc-100 hover:bg-[#131d45]/60"
                  }
                `}
              >
                <Icon className={`
                  w-4.5 h-4.5 transition-transform duration-200 group-hover:scale-105 shrink-0
                  ${isActive ? "text-blue-400" : "text-zinc-400 group-hover:text-zinc-200"}
                `} />
                <span className={`transition-all duration-300 whitespace-nowrap ${isHovered ? "opacity-100 max-w-xs" : "lg:opacity-0 lg:max-w-0 lg:overflow-hidden"}`}>
                  {item.label}
                </span>
              </button>
            );
          })}
        </nav>

        {/* PWA Install Promotion Banner */}
        <PWAInstallBanner isCollapsed={!isHovered} />

        {/* Footer / User Profile section from bento grid design */}
        <div className={`mt-auto ${isHovered ? "p-3" : "p-3 lg:p-2"} border-t border-[#1a2652]/60 bg-[#060b21]/60 flex flex-col gap-2`}>
          <div className={`flex items-center justify-between gap-2 ${isHovered ? "p-3" : "p-2.5 lg:justify-center"} bg-[#131d45] rounded-2xl border border-[#1a2652]/40 hover:border-[#213271]/40 transition-colors`}>
            <div className="flex items-center gap-3 overflow-hidden">
              <div className="w-8.5 h-8.5 rounded-xl bg-gradient-to-tr from-indigo-600 to-blue-600 flex items-center justify-center font-bold text-white uppercase text-xs shadow-md shrink-0">
                {userEmail ? userEmail.substring(0, 2).toUpperCase() : "O'"}
              </div>
              <div className={`transition-all duration-300 flex flex-col ${isHovered ? "opacity-100 max-w-[130px]" : "lg:opacity-0 lg:max-w-0 lg:overflow-hidden"}`}>
                <p className="text-[9px] text-zinc-400 uppercase tracking-widest font-mono whitespace-nowrap truncate" title={userEmail || "O'qituvchi"}>
                  {userEmail || "O'qituvchi"}
                </p>
                <p className="text-xs font-black text-zinc-200 whitespace-nowrap">O'qituvchi</p>
              </div>
            </div>
            
            {onLogout && isHovered && (
              <button
                onClick={onLogout}
                className="p-1.5 hover:bg-rose-500/10 text-zinc-400 hover:text-rose-400 rounded-lg transition-colors cursor-pointer"
                title="Tizimdan chiqish"
              >
                <LogOut className="w-4 h-4" />
              </button>
            )}
          </div>

          {onLogout && !isHovered && (
            <button
              onClick={onLogout}
              className="w-full lg:flex hidden items-center justify-center py-2 bg-rose-500/10 hover:bg-rose-500/20 text-rose-450 hover:text-rose-450 rounded-xl text-[10px] font-black uppercase tracking-wider transition-all duration-200 cursor-pointer"
              title="Tizimdan chiqish"
            >
              <LogOut className="w-3.5 h-3.5" />
            </button>
          )}

          {onLogout && (
            <button
              onClick={onLogout}
              className="w-full lg:hidden flex items-center justify-center gap-2 py-3 bg-rose-500/10 hover:bg-rose-500/20 text-rose-450 hover:text-rose-400 rounded-xl text-[10px] font-black uppercase tracking-widest transition-all duration-200 cursor-pointer mt-1"
              title="Tizimdan chiqish"
            >
              <LogOut className="w-4 h-4" />
              <span>Tizimdan Chiqish</span>
            </button>
          )}
        </div>
      </aside>
    </>
  );
}
