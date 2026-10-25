import React from 'react';
import { 
  LayoutDashboard, 
  Layers, 
  Sprout, 
  Cpu, 
  CloudSun, 
  BarChart3, 
  FileText, 
  CheckSquare, 
  Settings, 
  ArrowRight, 
  Leaf,
  X
} from 'lucide-react';

export default function Sidebar({ 
  activeTab, 
  setActiveTab, 
  isOpen, 
  setIsOpen 
}) {
  const menuItems = [
    { id: 'dashboard', label: 'Dashboard', icon: LayoutDashboard },
    { id: 'fields', label: 'Fields', icon: Layers },
    { id: 'crops', label: 'Crops', icon: Sprout },
    { id: 'iot', label: 'IoT Devices', icon: Cpu },
    { id: 'weather', label: 'Weather', icon: CloudSun },
    { id: 'analytics', label: 'Analytics', icon: BarChart3 },
    { id: 'reports', label: 'Reports', icon: FileText },
    { id: 'tasks', label: 'Tasks', icon: CheckSquare },
    { id: 'settings', label: 'Settings', icon: Settings },
  ];

  return (
    <>
      {/* Mobile backdrop */}
      {isOpen && (
        <div 
          onClick={() => setIsOpen(false)}
          className="fixed inset-0 bg-black/50 z-40 lg:hidden backdrop-blur-xs transition-opacity"
        />
      )}

      {/* Sidebar container */}
      <aside
        className={`fixed top-0 left-0 bottom-0 z-50 w-64 bg-[#0d2818] text-white flex flex-col justify-between p-5 transition-transform duration-300 ease-in-out lg:translate-x-0 ${
          isOpen ? 'translate-x-0 shadow-2xl' : '-translate-x-full lg:translate-x-0'
        }`}
      >
        <div>
          {/* Logo & Brand Header */}
          <div className="flex items-center justify-between pb-6 pt-1 px-1">
            <div className="flex items-center gap-3 cursor-pointer" onClick={() => setActiveTab('dashboard')}>
              <div className="w-9 h-9 rounded-xl bg-emerald-500/20 border border-emerald-500/40 flex items-center justify-center shadow-inner">
                <Leaf className="w-5 h-5 text-emerald-400 fill-emerald-400" />
              </div>
              <span className="text-xl font-bold tracking-tight text-white font-['Outfit']">
                AgriSmart
              </span>
            </div>

            <button 
              onClick={() => setIsOpen(false)}
              className="lg:hidden text-slate-400 hover:text-white p-1"
            >
              <X className="w-5 h-5" />
            </button>
          </div>

          {/* Navigation Links */}
          <nav className="space-y-1.5 mt-2">
            {menuItems.map((item) => {
              const Icon = item.icon;
              const isActive = activeTab === item.id;

              return (
                <button
                  key={item.id}
                  onClick={() => {
                    setActiveTab(item.id);
                    setIsOpen(false);
                  }}
                  className={`w-full flex items-center gap-3 px-3.5 py-2.5 rounded-xl text-sm font-medium transition-all duration-150 text-left ${
                    isActive
                      ? 'bg-[#1e7e45] text-white font-semibold shadow-md shadow-emerald-950/40'
                      : 'text-emerald-100/70 hover:text-white hover:bg-emerald-900/40'
                  }`}
                >
                  <Icon className={`w-4 h-4 ${isActive ? 'text-white' : 'text-emerald-300/80'}`} />
                  <span>{item.label}</span>
                </button>
              );
            })}
          </nav>
        </div>

        {/* Promo Card: "Grow Smarter with Technology" */}
        <div className="mt-6 pt-4">
          <div 
            onClick={() => setActiveTab('crops')}
            className="group relative rounded-2xl overflow-hidden cursor-pointer shadow-lg border border-emerald-800/40 transition-transform duration-200 hover:scale-[1.02]"
          >
            {/* Background Sprout Image */}
            <div className="h-44 w-full bg-slate-900 overflow-hidden relative">
              <img 
                src="/sprout.jpg" 
                alt="Grow Smarter with Technology" 
                className="w-full h-full object-cover object-center group-hover:scale-105 transition-transform duration-500"
              />
              {/* Gradient Dark Overlay */}
              <div className="absolute inset-0 bg-gradient-to-t from-black/90 via-black/40 to-transparent" />
            </div>

            {/* Bottom Content & Round Arrow Button */}
            <div className="absolute bottom-0 inset-x-0 p-4 flex items-end justify-between">
              <div className="pr-2">
                <p className="text-white font-bold text-sm leading-snug drop-shadow-md">
                  Grow Smarter<br />with Technology
                </p>
              </div>

              <div className="w-8 h-8 rounded-full bg-white text-slate-900 flex items-center justify-center shrink-0 shadow-md group-hover:bg-emerald-400 group-hover:text-slate-950 transition-colors">
                <ArrowRight className="w-4 h-4" />
              </div>
            </div>
          </div>
        </div>
      </aside>
    </>
  );
}
