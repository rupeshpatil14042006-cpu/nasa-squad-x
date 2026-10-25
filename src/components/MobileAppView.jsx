import React, { useEffect, useState } from 'react';
import { 
  Navigation, 
  MapPin, 
  Sun, 
  Droplet, 
  Thermometer, 
  Compass, 
  RotateCcw, 
  ChevronRight, 
  Bell, 
  Layers, 
  Sparkles, 
  Heart, 
  Plus, 
  Check, 
  CheckCircle2, 
  AlertTriangle,
  Wifi,
  Battery,
  ShieldCheck,
  X
} from 'lucide-react';
import { FEATURED_CROPS } from '../data/featuredCrops';
import CropCard from './CropCard';

export default function MobileAppView({
  isOpen,
  onClose,
  activeField,
  onLocationDetected,
  nasaData,
  onSelectCrop,
  currentUser
}) {
  const [gpsStatus, setGpsStatus] = useState('detecting'); // 'detecting' | 'active' | 'error'
  const [gpsCoords, setGpsCoords] = useState(null);
  const [activeBottomNav, setActiveBottomNav] = useState('home');
  const [selectedCrop, setSelectedCrop] = useState(null);
  const [addedCrops, setAddedCrops] = useState([]);

  // AUTOMATIC GPS TRIGGER ON STARTUP
  useEffect(() => {
    let isMounted = true;
    setGpsStatus('detecting');

    if ('geolocation' in navigator) {
      navigator.geolocation.getCurrentPosition(
        async (position) => {
          if (!isMounted) return;
          const coords = {
            latitude: position.coords.latitude,
            longitude: position.coords.longitude,
            accuracy: position.coords.accuracy,
            altitude: position.coords.altitude
          };
          setGpsCoords(coords);
          setGpsStatus('active');

          // Pass auto-detected coordinates to parent app
          onLocationDetected?.({
            ...coords,
            locationInfo: {
              place: "Current Farm GPS",
              district: "Auto-detected Location",
              state: "",
              country: ""
            }
          });
        },
        (error) => {
          if (!isMounted) return;
          console.warn("Mobile auto-GPS request notice:", error.message);
          setGpsStatus('active'); // Still show active with current activeField
          setGpsCoords({
            latitude: activeField?.lat || 20.0112,
            longitude: activeField?.lon || 73.8124,
            accuracy: 8
          });
        },
        { enableHighAccuracy: true, timeout: 8000, maximumAge: 0 }
      );
    } else {
      setGpsStatus('error');
    }

    return () => {
      isMounted = false;
    };
  }, []);

  const handleCropAdd = (crop) => {
    if (addedCrops.includes(crop.id)) {
      setAddedCrops(addedCrops.filter(id => id !== crop.id));
    } else {
      setAddedCrops([...addedCrops, crop.id]);
    }
    onSelectCrop?.(crop);
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-[2000] flex items-center justify-center p-2 sm:p-4 bg-slate-950/80 backdrop-blur-md animate-in fade-in duration-200">
      
      {/* Mobile Device Mockup Container */}
      <div className="relative w-full max-w-[410px] h-[860px] max-h-[96vh] bg-slate-900 rounded-[48px] p-3 shadow-2xl border-4 border-slate-700/80 flex flex-col justify-between overflow-hidden">
        
        {/* Top Camera Island Notch */}
        <div className="absolute top-4 left-1/2 -translate-x-1/2 w-28 h-5 bg-black rounded-full z-40 flex items-center justify-between px-3">
          <div className="w-2 h-2 rounded-full bg-slate-800" />
          <div className="w-2.5 h-2.5 rounded-full bg-slate-950 ring-1 ring-slate-800" />
        </div>

        {/* Close Button on Desktop Screen */}
        <button
          onClick={onClose}
          className="absolute top-5 right-5 z-40 w-8 h-8 rounded-full bg-black/40 text-white flex items-center justify-center hover:bg-black/70 transition-colors"
          title="Exit Mobile View"
        >
          <X className="w-4 h-4" />
        </button>

        {/* Mobile Screen Body */}
        <div className="relative w-full h-full bg-[#f8fafc] rounded-[38px] overflow-hidden flex flex-col justify-between text-slate-800 select-none">
          
          {/* 1. Status Bar */}
          <div className="pt-3 px-6 pb-2 flex items-center justify-between text-[11px] font-semibold text-slate-800 z-30">
            <span>{new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}</span>
            <div className="flex items-center gap-2">
              <Wifi className="w-3.5 h-3.5 text-slate-700" />
              <Battery className="w-4 h-4 text-emerald-600" />
            </div>
          </div>

          {/* 2. Scrollable App Content */}
          <div className="flex-1 overflow-y-auto px-4 py-2 space-y-4 scrollbar-none pb-20">
            
            {/* Header: AgriSmart & User Profile */}
            <div className="flex items-center justify-between pt-1">
              <div className="flex items-center gap-2">
                <div className="w-8 h-8 rounded-xl bg-emerald-600 text-white flex items-center justify-center shadow-xs">
                  <Sparkles className="w-4 h-4" />
                </div>
                <div>
                  <h3 className="font-extrabold text-base text-slate-900 leading-tight font-['Outfit']">
                    AgriSmart Mobile
                  </h3>
                  <p className="text-[10px] text-emerald-600 font-semibold">Auto-GPS Sync</p>
                </div>
              </div>

              <div className="flex items-center gap-2">
                <div className="relative p-1.5 rounded-full bg-white border border-slate-200 text-slate-700 shadow-xs">
                  <Bell className="w-4 h-4" />
                  <span className="absolute top-1 right-1 w-2 h-2 rounded-full bg-rose-500" />
                </div>
                <img
                  src={currentUser?.photoURL || "/avatar.jpg"}
                  alt="Profile"
                  className="w-8 h-8 rounded-full object-cover ring-2 ring-emerald-500/30"
                />
              </div>
            </div>

            {/* 3. Automatic GPS Indicator Card */}
            <div className="bg-emerald-950 text-white p-3.5 rounded-2xl shadow-sm border border-emerald-800/50 flex items-center justify-between">
              <div className="flex items-center gap-2.5">
                <div className="relative flex items-center justify-center w-8 h-8 rounded-xl bg-emerald-500/20 text-emerald-400">
                  <Compass className="w-4 h-4 animate-spin-slow" />
                  <span className="absolute -top-0.5 -right-0.5 w-2.5 h-2.5 rounded-full bg-emerald-400 animate-ping" />
                </div>
                <div>
                  <div className="flex items-center gap-1.5">
                    <span className="text-xs font-bold text-white">Live GPS Connected</span>
                    <span className="text-[9px] px-1.5 py-0.2 rounded-full bg-emerald-500 text-emerald-950 font-extrabold">AUTO</span>
                  </div>
                  <p className="text-[10px] text-emerald-200/80 font-mono mt-0.5">
                    {gpsCoords ? `${gpsCoords.latitude.toFixed(4)}°N, ${gpsCoords.longitude.toFixed(4)}°E` : 'Locking satellite signal...'}
                  </p>
                </div>
              </div>

              <div className="text-right">
                <span className="text-[10px] text-emerald-300 font-medium block">Accuracy</span>
                <span className="text-xs font-bold text-white">±{gpsCoords?.accuracy ? Math.round(gpsCoords.accuracy) : 5}m</span>
              </div>
            </div>

            {/* 4. Weather & Field Quick Bar */}
            <div className="bg-white rounded-2xl p-4 border border-slate-200/70 shadow-xs flex items-center justify-between">
              <div className="flex items-center gap-3">
                <div className="w-11 h-11 rounded-2xl bg-amber-50 text-amber-500 flex items-center justify-center">
                  <Sun className="w-6 h-6 fill-amber-400" />
                </div>
                <div>
                  <div className="flex items-baseline gap-1">
                    <span className="text-2xl font-black text-slate-900 leading-none">28°C</span>
                    <span className="text-xs font-medium text-slate-500">Partly Cloudy</span>
                  </div>
                  <p className="text-[11px] text-slate-400 mt-1 flex items-center gap-1 font-medium truncate max-w-[170px]">
                    <MapPin className="w-3 h-3 text-emerald-600 shrink-0" />
                    {activeField?.name || 'Local Farm Plot'}
                  </p>
                </div>
              </div>

              <div className="border-l border-slate-100 pl-3 text-right">
                <div className="text-[10px] text-slate-400 font-medium">Moisture</div>
                <div className="text-sm font-bold text-blue-600 flex items-center justify-end gap-1">
                  <Droplet className="w-3.5 h-3.5 fill-blue-500" /> 68%
                </div>
              </div>
            </div>

            {/* 5. Crop Suggestions With Images Header */}
            <div className="pt-1">
              <div className="flex items-center justify-between mb-2.5">
                <div>
                  <h4 className="font-extrabold text-sm text-slate-900 font-['Outfit']">
                    Suggested Crops
                  </h4>
                  <p className="text-[11px] text-slate-400">Optimal for your GPS climate & soil</p>
                </div>
                <span className="text-[11px] font-bold text-emerald-600">
                  {FEATURED_CROPS.length} varieties
                </span>
              </div>

              {/* 2-Column Crop Cards with Real Studio Images */}
              <div className="grid grid-cols-2 gap-3">
                {FEATURED_CROPS.map((crop) => (
                  <CropCard
                    key={crop.id}
                    id={crop.id}
                    name={crop.name}
                    description={crop.description}
                    price={crop.price}
                    unit={crop.unit}
                    image={crop.image}
                    isFavorite={crop.isFavorite}
                    isAdded={addedCrops.includes(crop.id)}
                    onSelect={handleCropAdd}
                  />
                ))}
              </div>
            </div>

            {/* 6. Active Field Summary Card */}
            <div className="bg-white rounded-2xl p-4 border border-slate-200/70 shadow-xs space-y-3">
              <div className="flex items-center justify-between">
                <span className="text-xs font-bold text-slate-800">Current Field Status</span>
                <span className="text-[10px] font-semibold text-emerald-700 bg-emerald-50 px-2 py-0.5 rounded-full">
                  Healthy Growth
                </span>
              </div>
              <div className="grid grid-cols-3 gap-2 text-center pt-1">
                <div className="bg-slate-50 p-2 rounded-xl">
                  <span className="text-[10px] text-slate-400 block">Soil pH</span>
                  <span className="text-xs font-bold text-slate-800">6.5 (Opt)</span>
                </div>
                <div className="bg-slate-50 p-2 rounded-xl">
                  <span className="text-[10px] text-slate-400 block">NDVI Index</span>
                  <span className="text-xs font-bold text-emerald-600">0.72 Vigorous</span>
                </div>
                <div className="bg-slate-50 p-2 rounded-xl">
                  <span className="text-[10px] text-slate-400 block">Area</span>
                  <span className="text-xs font-bold text-slate-800">8.5 Acres</span>
                </div>
              </div>
            </div>

          </div>

          {/* 7. Bottom Mobile Navigation Dock */}
          <div className="absolute bottom-0 inset-x-0 h-16 bg-white/95 backdrop-blur-md border-t border-slate-200/80 px-6 flex items-center justify-between z-30">
            {[
              { id: 'home', label: 'Home', icon: Compass },
              { id: 'fields', label: 'Fields', icon: Layers },
              { id: 'crops', label: 'Crops', icon: Sparkles },
              { id: 'alerts', label: 'Alerts', icon: Bell }
            ].map((tab) => {
              const Icon = tab.icon;
              const isActive = activeBottomNav === tab.id;
              return (
                <button
                  key={tab.id}
                  onClick={() => setActiveBottomNav(tab.id)}
                  className={`flex flex-col items-center gap-1 transition-colors ${
                    isActive ? 'text-emerald-600 font-bold' : 'text-slate-400 hover:text-slate-600'
                  }`}
                >
                  <Icon className="w-4 h-4" />
                  <span className="text-[10px]">{tab.label}</span>
                </button>
              );
            })}
          </div>

        </div>

      </div>

    </div>
  );
}
