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
  X,
  Volume2,
  VolumeX,
  Camera,
  Coins,
  QrCode,
  Blocks,
  TrendingUp,
  PhoneCall,
  Mic,
  MicOff,
  Stethoscope,
  Send,
  CloudRain,
  Sprout,
  Scan,
  Share2
} from 'lucide-react';
import { FEATURED_CROPS } from '../data/featuredCrops';
import CropCard from './CropCard';
import { agriBlockchain, DEMO_WALLETS } from '../services/blockchainService';

export default function MobileAppView({
  isOpen,
  onClose,
  activeField,
  onLocationDetected,
  nasaData,
  onSelectCrop,
  currentUser
}) {
  const [gpsStatus, setGpsStatus] = useState('detecting');
  const [gpsCoords, setGpsCoords] = useState(null);
  const [activeBottomNav, setActiveBottomNav] = useState('home'); // 'home' | 'scan' | 'crops' | 'blockchain' | 'voice'
  const [addedCrops, setAddedCrops] = useState([]);
  const [selectedLanguage, setSelectedLanguage] = useState('en'); // 'en' | 'hi' | 'mr'
  const [isSpeaking, setIsSpeaking] = useState(false);
  const [activeScanDisease, setActiveScanDisease] = useState(null);
  const [isScanning, setIsScanning] = useState(false);
  const [showQrModal, setShowQrModal] = useState(false);
  const [voiceQuery, setVoiceQuery] = useState('');
  const [voiceResponse, setVoiceResponse] = useState('');

  // Automatic GPS Trigger on startup
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
          console.warn("Mobile auto-GPS fallback:", error.message);
          setGpsStatus('active');
          setGpsCoords({
            latitude: activeField?.lat || 20.0112,
            longitude: activeField?.lon || 73.8124,
            accuracy: 6
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
  }, [activeField, onLocationDetected]);

  // Voice playback for farmer
  const speakAdvice = (text) => {
    if (!('speechSynthesis' in window)) return;
    window.speechSynthesis.cancel();
    const utterance = new SpeechSynthesisUtterance(text);
    if (selectedLanguage === 'mr') utterance.lang = 'mr-IN';
    else if (selectedLanguage === 'hi') utterance.lang = 'hi-IN';
    else utterance.lang = 'en-US';

    utterance.onstart = () => setIsSpeaking(true);
    utterance.onend = () => setIsSpeaking(false);
    utterance.onerror = () => setIsSpeaking(false);
    window.speechSynthesis.speak(utterance);
  };

  const handleSimulateLeafScan = (diseaseKey) => {
    setIsScanning(true);
    setActiveScanDisease(null);
    setTimeout(() => {
      setIsScanning(false);
      setActiveScanDisease(diseaseKey);
      const advice = diseaseKey === 'blight' 
        ? "Early Blight detected. Spray organic Trichoderma or Copper Oxychloride 2.5g/L immediately."
        : "Healthy leaf tissue confirmed. Nitrogen levels optimal.";
      speakAdvice(advice);
    }, 1200);
  };

  const handleVoiceAsk = (q) => {
    setVoiceQuery(q);
    let ans = "";
    if (selectedLanguage === 'mr') {
      ans = "आपल्या शेतातील ओलावा ६८% असून हवामान अनुकूल आहे. मका काढणीनंतर सोयाबीन किंवा हरभरा लावा, खताचा खर्च ३५% वाचेल.";
    } else if (selectedLanguage === 'hi') {
      ans = "खेत में नमी 68% इष्टतम है। अगले 24 घंटे में बारिश नहीं होगी, कीटनाशक छिड़काव के लिए यह उत्तम समय है।";
    } else {
      ans = "Field moisture is 68% (optimal). No heavy rain expected in 24 hours. Ideal window for fertilizer application.";
    }
    setVoiceResponse(ans);
    speakAdvice(ans);
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-[2000] flex items-center justify-center p-2 sm:p-4 bg-slate-950/85 backdrop-blur-md animate-in fade-in duration-200">
      
      {/* Mobile Device Mockup Frame */}
      <div className="relative w-full max-w-[420px] h-[870px] max-h-[96vh] bg-slate-900 rounded-[50px] p-3 shadow-2xl border-4 border-slate-700/80 flex flex-col justify-between overflow-hidden">
        
        {/* Top Dynamic Island Notch */}
        <div className="absolute top-4 left-1/2 -translate-x-1/2 w-32 h-5 bg-black rounded-full z-40 flex items-center justify-between px-3">
          <div className="w-2 h-2 rounded-full bg-slate-800" />
          <div className="w-2.5 h-2.5 rounded-full bg-slate-950 ring-1 ring-slate-800" />
        </div>

        {/* Close Button on Desktop Screen */}
        <button
          onClick={onClose}
          className="absolute top-5 right-5 z-40 w-8 h-8 rounded-full bg-black/50 text-white flex items-center justify-center hover:bg-black/80 transition-colors cursor-pointer"
          title="Exit Mobile View"
        >
          <X className="w-4 h-4" />
        </button>

        {/* Mobile Screen Body */}
        <div className="relative w-full h-full bg-[#f8fafc] rounded-[40px] overflow-hidden flex flex-col justify-between text-slate-800 select-none">
          
          {/* 1. Status Bar */}
          <div className="pt-3 px-6 pb-2 flex items-center justify-between text-[11px] font-semibold text-slate-800 z-30">
            <span>{new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}</span>
            <div className="flex items-center gap-2">
              <span className="text-[10px] font-bold text-emerald-700 bg-emerald-100 px-1.5 py-0.2 rounded-md">4G LTE</span>
              <Wifi className="w-3.5 h-3.5 text-slate-700" />
              <Battery className="w-4 h-4 text-emerald-600" />
            </div>
          </div>

          {/* 2. Top Farmer Header & Language Switcher */}
          <div className="px-4 py-2 border-b border-slate-200/80 bg-white/90 backdrop-blur-xs flex items-center justify-between z-20">
            <div className="flex items-center gap-2">
              <div className="w-8 h-8 rounded-xl bg-emerald-600 text-white flex items-center justify-center shadow-xs">
                <Sprout className="w-4 h-4" />
              </div>
              <div>
                <h3 className="font-extrabold text-sm text-slate-900 leading-tight font-['Outfit']">
                  AgriSmart Kisan App
                </h3>
                <p className="text-[10px] text-emerald-700 font-bold">Auto-GPS • Satellite Connected</p>
              </div>
            </div>

            {/* Language Selector (Farmer friendly) */}
            <div className="flex items-center gap-1 bg-slate-100 p-0.5 rounded-xl border border-slate-200">
              {[
                { code: 'en', label: 'EN' },
                { code: 'hi', label: 'हि' },
                { code: 'mr', label: 'म' }
              ].map(lang => (
                <button
                  key={lang.code}
                  onClick={() => {
                    setSelectedLanguage(lang.code);
                    const greet = lang.code === 'mr' ? 'नमस्कार शेतकरी मित्र!' : lang.code === 'hi' ? 'नमस्ते किसान भाई!' : 'Hello Farmer!';
                    speakAdvice(greet);
                  }}
                  className={`px-2 py-0.5 rounded-lg text-[10px] font-extrabold transition-all cursor-pointer ${
                    selectedLanguage === lang.code ? 'bg-emerald-600 text-white' : 'text-slate-600 hover:text-slate-900'
                  }`}
                >
                  {lang.label}
                </button>
              ))}
            </div>
          </div>

          {/* 3. Main Scrollable View Area */}
          <div className="flex-1 overflow-y-auto px-4 py-3 space-y-3.5 scrollbar-none pb-20">
            
            {/* VIEW 1: HOME (FARM TELEMETRY & MANDI) */}
            {activeBottomNav === 'home' && (
              <>
                {/* A. Live GPS & Precision Field Banner */}
                <div className="bg-gradient-to-r from-[#0d2818] to-[#164728] text-white p-3.5 rounded-2xl shadow-sm border border-emerald-800/50 flex items-center justify-between">
                  <div className="flex items-center gap-2.5">
                    <div className="relative flex items-center justify-center w-8 h-8 rounded-xl bg-emerald-500/20 text-emerald-400">
                      <Compass className="w-4 h-4 animate-spin-slow" />
                      <span className="absolute -top-0.5 -right-0.5 w-2.5 h-2.5 rounded-full bg-emerald-400 animate-ping" />
                    </div>
                    <div>
                      <div className="flex items-center gap-1.5">
                        <span className="text-xs font-bold text-white">Live Farm GPS</span>
                        <span className="text-[9px] px-1.5 py-0.2 rounded-full bg-emerald-400 text-emerald-950 font-extrabold">AUTO</span>
                      </div>
                      <p className="text-[10px] text-emerald-200/90 font-mono mt-0.5">
                        {gpsCoords ? `${gpsCoords.latitude.toFixed(4)}°N, ${gpsCoords.longitude.toFixed(4)}°E` : 'Locking satellite signal...'}
                      </p>
                    </div>
                  </div>

                  <div className="text-right">
                    <span className="text-[10px] text-emerald-300 font-medium block">Accuracy</span>
                    <span className="text-xs font-bold text-white">±{gpsCoords?.accuracy ? Math.round(gpsCoords.accuracy) : 5}m</span>
                  </div>
                </div>

                {/* B. Weather & 24h Spraying Recommendation */}
                <div className="bg-white rounded-2xl p-4 border border-slate-200/80 shadow-xs space-y-3">
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-3">
                      <div className="w-12 h-12 rounded-2xl bg-amber-50 text-amber-500 flex items-center justify-center shadow-inner">
                        <Sun className="w-7 h-7 fill-amber-400" />
                      </div>
                      <div>
                        <div className="flex items-baseline gap-1.5">
                          <span className="text-2xl font-black text-slate-900 leading-none">28°C</span>
                          <span className="text-xs font-semibold text-slate-500">Partly Sunny</span>
                        </div>
                        <p className="text-[11px] text-slate-400 mt-1 flex items-center gap-1 font-medium truncate max-w-[170px]">
                          <MapPin className="w-3 h-3 text-emerald-600 shrink-0" />
                          {activeField?.location || 'Jaffna Farm, Parcel A'}
                        </p>
                      </div>
                    </div>

                    <button
                      onClick={() => speakAdvice('Weather is 28 degrees celsius. Next 24 hours have clear sky, ideal for crop operations.')}
                      className="p-2 rounded-xl bg-emerald-50 text-emerald-700 hover:bg-emerald-100 transition-colors"
                      title="Audio Weather Report"
                    >
                      <Volume2 className="w-4 h-4" />
                    </button>
                  </div>

                  {/* Spraying Advice Alert */}
                  <div className="bg-emerald-50/90 rounded-xl p-2.5 border border-emerald-200 flex items-center justify-between text-xs">
                    <div className="flex items-center gap-2">
                      <CheckCircle2 className="w-4 h-4 text-emerald-600 shrink-0" />
                      <span className="text-[11px] font-bold text-emerald-900">
                        Spraying Condition: <b>EXCELLENT (Next 24h)</b>
                      </span>
                    </div>
                    <span className="text-[10px] text-emerald-700 font-semibold">&lt; 8 km/h wind</span>
                  </div>
                </div>

                {/* C. 4 Real-time Soil & Nutrient Sensor Meters */}
                <div className="grid grid-cols-2 gap-2.5">
                  <div className="bg-white p-3 rounded-2xl border border-slate-200/80 shadow-xs">
                    <div className="flex items-center justify-between">
                      <span className="text-[11px] font-semibold text-slate-500">Soil Moisture</span>
                      <Droplet className="w-4 h-4 text-blue-600 fill-blue-500/20" />
                    </div>
                    <p className="text-lg font-bold text-slate-900 mt-1">68%</p>
                    <div className="w-full bg-slate-100 h-1.5 rounded-full mt-1.5 overflow-hidden">
                      <div className="bg-blue-600 h-full rounded-full" style={{ width: '68%' }} />
                    </div>
                    <span className="text-[9px] text-emerald-600 font-bold block mt-1">Optimal Level</span>
                  </div>

                  <div className="bg-white p-3 rounded-2xl border border-slate-200/80 shadow-xs">
                    <div className="flex items-center justify-between">
                      <span className="text-[11px] font-semibold text-slate-500">Soil pH</span>
                      <Sprout className="w-4 h-4 text-emerald-600" />
                    </div>
                    <p className="text-lg font-bold text-slate-900 mt-1">6.5 pH</p>
                    <div className="w-full bg-slate-100 h-1.5 rounded-full mt-1.5 overflow-hidden">
                      <div className="bg-emerald-600 h-full rounded-full" style={{ width: '65%' }} />
                    </div>
                    <span className="text-[9px] text-emerald-600 font-bold block mt-1">Slightly Acidic (Good)</span>
                  </div>

                  <div className="bg-white p-3 rounded-2xl border border-slate-200/80 shadow-xs">
                    <div className="flex items-center justify-between">
                      <span className="text-[11px] font-semibold text-slate-500">Satellite NDVI</span>
                      <Layers className="w-4 h-4 text-teal-600" />
                    </div>
                    <p className="text-lg font-bold text-teal-700 mt-1">0.74</p>
                    <div className="w-full bg-slate-100 h-1.5 rounded-full mt-1.5 overflow-hidden">
                      <div className="bg-teal-600 h-full rounded-full" style={{ width: '74%' }} />
                    </div>
                    <span className="text-[9px] text-teal-700 font-bold block mt-1">Landsat-9 Healthy</span>
                  </div>

                  <div className="bg-white p-3 rounded-2xl border border-slate-200/80 shadow-xs">
                    <div className="flex items-center justify-between">
                      <span className="text-[11px] font-semibold text-slate-500">Soil Temp</span>
                      <Thermometer className="w-4 h-4 text-rose-500" />
                    </div>
                    <p className="text-lg font-bold text-slate-900 mt-1">26°C</p>
                    <div className="w-full bg-slate-100 h-1.5 rounded-full mt-1.5 overflow-hidden">
                      <div className="bg-rose-500 h-full rounded-full" style={{ width: '65%' }} />
                    </div>
                    <span className="text-[9px] text-slate-500 font-bold block mt-1">Normal Range</span>
                  </div>
                </div>

                {/* D. Live APMC Mandi Rates with Price Trends */}
                <div className="bg-white rounded-2xl p-4 border border-slate-200/80 shadow-xs space-y-2.5">
                  <div className="flex items-center justify-between">
                    <div>
                      <h4 className="font-extrabold text-xs text-slate-900 font-['Outfit'] flex items-center gap-1.5">
                        <TrendingUp className="w-4 h-4 text-emerald-600" />
                        <span>Live Mandi Market Rates</span>
                      </h4>
                      <p className="text-[10px] text-slate-400">Real-time agricultural market rates</p>
                    </div>
                    <span className="text-[10px] font-bold text-emerald-700 bg-emerald-50 px-2 py-0.5 rounded-full">
                      APMC Today
                    </span>
                  </div>

                  <div className="space-y-2 pt-1">
                    {[
                      { name: 'Strawberry', price: '$20.10/kg', trend: '+4.2%', up: true },
                      { name: 'Brocoly (Export)', price: '$25.10/kg', trend: '+6.1%', up: true },
                      { name: 'Cabbage', price: '$15.10/kg', trend: '+1.5%', up: true },
                      { name: 'Rice (Paddy)', price: '$8.40/kg', trend: 'Stable', up: true }
                    ].map((item, idx) => (
                      <div key={idx} className="flex items-center justify-between p-2 rounded-xl bg-slate-50 border border-slate-100 text-xs">
                        <span className="font-bold text-slate-800">{item.name}</span>
                        <div className="flex items-center gap-2">
                          <span className="font-extrabold text-slate-900">{item.price}</span>
                          <span className="text-[10px] font-bold text-emerald-700 bg-emerald-100 px-1.5 py-0.2 rounded-md">
                            {item.trend}
                          </span>
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              </>
            )}

            {/* VIEW 2: CROP DOCTOR & LEAF SCANNER */}
            {activeBottomNav === 'scan' && (
              <div className="space-y-4">
                <div className="bg-white rounded-2xl p-4 border border-slate-200 shadow-xs space-y-3">
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-2">
                      <div className="p-2 rounded-xl bg-emerald-50 text-emerald-600">
                        <Stethoscope className="w-5 h-5" />
                      </div>
                      <div>
                        <h4 className="font-extrabold text-sm text-slate-900 font-['Outfit']">
                          AI Crop Doctor & Leaf Scanner
                        </h4>
                        <p className="text-[10px] text-slate-400">Instant pest, fungal & nutrient diagnosis</p>
                      </div>
                    </div>
                  </div>

                  {/* Camera Viewfinder Simulation */}
                  <div className="relative h-48 bg-slate-900 rounded-2xl overflow-hidden border-2 border-emerald-500/40 flex flex-col items-center justify-center p-4 text-center">
                    <div className="absolute inset-0 bg-cover bg-center opacity-40" style={{ backgroundImage: "url('/sprout.jpg')" }} />
                    <div className="relative z-10 space-y-2">
                      <Scan className={`w-10 h-10 text-emerald-400 mx-auto ${isScanning ? 'animate-pulse' : ''}`} />
                      <p className="text-xs font-bold text-white">
                        {isScanning ? 'Analyzing leaf texture with Computer Vision...' : 'Point camera at infected leaf'}
                      </p>
                      <div className="flex gap-2 justify-center pt-2">
                        <button
                          onClick={() => handleSimulateLeafScan('blight')}
                          disabled={isScanning}
                          className="px-3 py-1.5 bg-emerald-600 hover:bg-emerald-500 text-white text-[11px] font-bold rounded-xl transition-all shadow-md cursor-pointer"
                        >
                          Scan Sample Leaf A
                        </button>
                        <button
                          onClick={() => handleSimulateLeafScan('healthy')}
                          disabled={isScanning}
                          className="px-3 py-1.5 bg-slate-800 hover:bg-slate-700 text-slate-200 text-[11px] font-bold rounded-xl border border-slate-700 cursor-pointer"
                        >
                          Scan Sample Leaf B
                        </button>
                      </div>
                    </div>
                  </div>

                  {/* Diagnosis Result Card */}
                  {activeScanDisease && (
                    <div className={`p-4 rounded-2xl border text-xs space-y-2 animate-in slide-in-from-top-2 ${
                      activeScanDisease === 'blight' 
                        ? 'bg-amber-50 border-amber-300 text-amber-950' 
                        : 'bg-emerald-50 border-emerald-300 text-emerald-950'
                    }`}>
                      <div className="flex items-center justify-between">
                        <span className="font-bold flex items-center gap-1.5">
                          {activeScanDisease === 'blight' ? <AlertTriangle className="w-4 h-4 text-amber-600" /> : <CheckCircle2 className="w-4 h-4 text-emerald-600" />}
                          {activeScanDisease === 'blight' ? 'Early Blight Detected (Alternaria solani)' : '100% Healthy Canopy'}
                        </span>
                        <span className="text-[10px] font-mono px-2 py-0.5 rounded-full bg-white font-bold">
                          94% Confidence
                        </span>
                      </div>
                      <p className="text-[11px] leading-relaxed">
                        {activeScanDisease === 'blight' 
                          ? 'Action Required: Remove infected lower foliage. Spray Organic Trichoderma viride or Copper Oxychloride 2.5g/L during early morning before 9 AM.' 
                          : 'Canopy chlorophyll density is optimal. No active fungal or pest pathogen detected.'}
                      </p>
                      <button
                        onClick={() => speakAdvice(activeScanDisease === 'blight' ? 'Early blight detected. Apply Copper Oxychloride 2.5 grams per liter early morning.' : 'Your crop canopy is completely healthy.')}
                        className="flex items-center gap-1.5 text-[11px] font-bold text-emerald-800 underline mt-1"
                      >
                        <Volume2 className="w-3.5 h-3.5" />
                        <span>Listen to Audio Treatment Guide</span>
                      </button>
                    </div>
                  )}
                </div>

                {/* Common Crop Disease Library */}
                <div className="bg-white rounded-2xl p-4 border border-slate-200/80 shadow-xs space-y-2">
                  <h4 className="font-extrabold text-xs text-slate-900 font-['Outfit']">Common Regional Diseases</h4>
                  <div className="space-y-1.5">
                    {[
                      { name: 'Rice Blast', remedy: 'Tricyclazole 75 WP @ 0.6g/L', severity: 'High' },
                      { name: 'Powdery Mildew', remedy: 'Wettable Sulfur @ 2g/L', severity: 'Medium' },
                      { name: 'Aphids / Thrips', remedy: 'Neem Oil 10,000 ppm @ 3ml/L', severity: 'Low' }
                    ].map((d, i) => (
                      <div key={i} className="p-2.5 rounded-xl bg-slate-50 border border-slate-100 flex items-center justify-between text-xs">
                        <div>
                          <p className="font-bold text-slate-800">{d.name}</p>
                          <p className="text-[10px] text-slate-500">{d.remedy}</p>
                        </div>
                        <span className="text-[10px] font-bold px-2 py-0.5 rounded-full bg-slate-200 text-slate-700">
                          {d.severity}
                        </span>
                      </div>
                    ))}
                  </div>
                </div>
              </div>
            )}

            {/* VIEW 3: CROPS & MARKET CATALOG */}
            {activeBottomNav === 'crops' && (
              <div className="space-y-3">
                <div className="flex items-center justify-between">
                  <div>
                    <h4 className="font-extrabold text-sm text-slate-900 font-['Outfit']">
                      Suggested Crops & Rotation
                    </h4>
                    <p className="text-[11px] text-slate-400">Matched to your GPS soil and weather</p>
                  </div>
                  <span className="text-[10px] font-bold px-2 py-0.5 rounded-full bg-emerald-100 text-emerald-800">
                    High Margin
                  </span>
                </div>

                <div className="grid grid-cols-2 gap-2.5">
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
                      onSelect={(selected) => {
                        if (addedCrops.includes(selected.id)) {
                          setAddedCrops(addedCrops.filter(id => id !== selected.id));
                        } else {
                          setAddedCrops([...addedCrops, selected.id]);
                        }
                        onSelectCrop?.(selected);
                      }}
                    />
                  ))}
                </div>
              </div>
            )}

            {/* VIEW 4: BLOCKCHAIN & DISASTER RELIEF */}
            {activeBottomNav === 'blockchain' && (
              <div className="space-y-4">
                {/* On-Chain Harvest Certificate Card */}
                <div className="bg-gradient-to-r from-[#0b2014] to-[#123821] text-white rounded-2xl p-4 shadow-sm border border-emerald-800/50 space-y-3">
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-2">
                      <Blocks className="w-5 h-5 text-emerald-400" />
                      <div>
                        <h4 className="font-bold text-xs text-white">Immutable Agro-Ledger</h4>
                        <p className="text-[10px] text-emerald-200/80">SHA-256 Merkle Provenance</p>
                      </div>
                    </div>
                    <span className="text-[9px] font-mono px-2 py-0.5 rounded-full bg-emerald-400/20 text-emerald-300 font-bold">
                      Block #{agriBlockchain.chain.length - 1}
                    </span>
                  </div>

                  <div className="bg-black/30 rounded-xl p-3 border border-emerald-700/30 text-xs space-y-1.5">
                    <div className="flex justify-between text-[11px]">
                      <span className="text-emerald-300/80">Batch ID:</span>
                      <span className="font-mono text-white">0x7a89f...fieldA</span>
                    </div>
                    <div className="flex justify-between text-[11px]">
                      <span className="text-emerald-300/80">Landsat NDVI:</span>
                      <span className="font-bold text-emerald-400">0.74 Verified</span>
                    </div>
                    <div className="flex justify-between text-[11px]">
                      <span className="text-emerald-300/80">Carbon Offsets:</span>
                      <span className="font-bold text-white">25 AGRI-CARBON</span>
                    </div>
                  </div>

                  <button
                    onClick={() => setShowQrModal(true)}
                    className="w-full flex items-center justify-center gap-2 py-2 bg-emerald-500 hover:bg-emerald-400 text-slate-950 text-xs font-bold rounded-xl transition-all shadow-md cursor-pointer"
                  >
                    <QrCode className="w-4 h-4" />
                    <span>View Provenance QR for Buyers</span>
                  </button>
                </div>

                {/* Parametric Climate Insurance Relief Card */}
                <div className="bg-white rounded-2xl p-4 border border-slate-200 shadow-xs space-y-3">
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-2">
                      <CloudRain className="w-5 h-5 text-blue-600" />
                      <div>
                        <h4 className="font-extrabold text-xs text-slate-900 font-['Outfit']">
                          Parametric Disaster Relief
                        </h4>
                        <p className="text-[10px] text-slate-400">Automated NASA Satellite Escrow</p>
                      </div>
                    </div>
                    <span className="text-[10px] font-bold text-blue-700 bg-blue-50 px-2 py-0.5 rounded-full">
                      $50k Pool
                    </span>
                  </div>

                  <div className="p-3 bg-slate-50 rounded-xl border border-slate-100 text-xs space-y-1">
                    <div className="flex justify-between text-slate-600">
                      <span>Drought Trigger:</span>
                      <span className="font-bold text-slate-900">&gt; 14 dry days</span>
                    </div>
                    <div className="flex justify-between text-slate-600">
                      <span>Current Status:</span>
                      <span className="font-bold text-emerald-600">Safe Operational Zone</span>
                    </div>
                    <div className="flex justify-between text-slate-600">
                      <span>Eligible Coverage:</span>
                      <span className="font-bold text-slate-900">$4,500 USDC</span>
                    </div>
                  </div>

                  <button
                    onClick={() => speakAdvice('Parametric climate insurance is active. Your farm is backed by a fifty thousand dollar decentralized escrow pool.')}
                    className="w-full py-2 bg-blue-50 text-blue-700 hover:bg-blue-100 text-xs font-bold rounded-xl border border-blue-200 transition-colors cursor-pointer"
                  >
                    Check Oracle Claim Status
                  </button>
                </div>
              </div>
            )}

            {/* VIEW 5: KISAN VOICE ADVISOR */}
            {activeBottomNav === 'voice' && (
              <div className="space-y-4">
                <div className="bg-white rounded-2xl p-4 border border-slate-200 shadow-xs space-y-3">
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-2">
                      <div className="p-2 rounded-xl bg-emerald-50 text-emerald-600">
                        <Mic className="w-5 h-5" />
                      </div>
                      <div>
                        <h4 className="font-extrabold text-sm text-slate-900 font-['Outfit']">
                          Kisan Voice Agronomist
                        </h4>
                        <p className="text-[10px] text-slate-400">One-tap speaking & audio answers</p>
                      </div>
                    </div>
                  </div>

                  {/* Big Voice Button for Farmers */}
                  <div className="text-center py-4 space-y-2">
                    <button
                      onClick={() => handleVoiceAsk('Weather and crop rotation summary')}
                      className={`w-20 h-20 rounded-full mx-auto flex items-center justify-center text-white shadow-xl transition-all cursor-pointer ${
                        isSpeaking ? 'bg-rose-500 animate-pulse' : 'bg-emerald-600 hover:bg-emerald-700'
                      }`}
                    >
                      {isSpeaking ? <Volume2 className="w-8 h-8" /> : <Mic className="w-8 h-8" />}
                    </button>
                    <p className="text-xs font-bold text-slate-800">
                      {isSpeaking ? 'Speaking advice out loud...' : 'Tap to Ask Farm Advice'}
                    </p>
                  </div>

                  {/* Quick Farmer Prompts */}
                  <div className="space-y-1.5 pt-2">
                    <p className="text-[11px] font-bold text-slate-400 uppercase">Quick Questions</p>
                    {[
                      "मका नंतर कोणतं पीक लावावं?",
                      "कीटकनाशक फवारणीची योग्य वेळ कोणती?",
                      "मातीची सुपीकता कशी सुधारावी?",
                      "What is today's best selling price?"
                    ].map((q, idx) => (
                      <button
                        key={idx}
                        onClick={() => handleVoiceAsk(q)}
                        className="w-full text-left p-2.5 rounded-xl bg-slate-50 hover:bg-emerald-50 text-xs font-medium text-slate-800 transition-colors border border-slate-100 cursor-pointer"
                      >
                        {q}
                      </button>
                    ))}
                  </div>

                  {voiceResponse && (
                    <div className="p-3 bg-emerald-50 border border-emerald-200 rounded-xl text-xs text-emerald-950 font-medium">
                      <p className="font-bold text-emerald-800 mb-1">AgriSmart Advice:</p>
                      <p>{voiceResponse}</p>
                    </div>
                  )}
                </div>

                {/* Kisan SOS Emergency Hotline */}
                <div className="bg-amber-50 rounded-2xl p-3.5 border border-amber-200 flex items-center justify-between">
                  <div className="flex items-center gap-2.5">
                    <div className="p-2 rounded-xl bg-amber-500 text-white">
                      <PhoneCall className="w-4 h-4" />
                    </div>
                    <div>
                      <p className="text-xs font-bold text-amber-950">Kisan Toll-Free Agronomist</p>
                      <p className="text-[10px] text-amber-800">1800-180-1551 (Govt Helpline)</p>
                    </div>
                  </div>
                  <a
                    href="tel:18001801551"
                    className="px-3 py-1.5 bg-amber-600 hover:bg-amber-700 text-white text-[11px] font-bold rounded-xl transition-all shadow-xs"
                  >
                    Call Now
                  </a>
                </div>
              </div>
            )}

          </div>

          {/* 4. Bottom 5-Icon Navigation Dock */}
          <div className="absolute bottom-0 inset-x-0 h-16 bg-white/95 backdrop-blur-md border-t border-slate-200/80 px-4 flex items-center justify-between z-30">
            {[
              { id: 'home', label: 'Farm', icon: Compass },
              { id: 'scan', label: 'Doctor', icon: Stethoscope },
              { id: 'crops', label: 'Crops', icon: Sprout },
              { id: 'blockchain', label: 'Web3', icon: Blocks },
              { id: 'voice', label: 'Kisan AI', icon: Mic }
            ].map((tab) => {
              const Icon = tab.icon;
              const isActive = activeBottomNav === tab.id;
              return (
                <button
                  key={tab.id}
                  onClick={() => setActiveBottomNav(tab.id)}
                  className={`flex flex-col items-center gap-1 transition-all cursor-pointer ${
                    isActive ? 'text-emerald-700 font-extrabold scale-105' : 'text-slate-400 hover:text-slate-700'
                  }`}
                >
                  <Icon className="w-4 h-4" />
                  <span className="text-[9px] tracking-tight">{tab.label}</span>
                </button>
              );
            })}
          </div>

        </div>

      </div>

      {/* QR Code Modal for Blockchain Certificate */}
      {showQrModal && (
        <div className="fixed inset-0 z-[2100] flex items-center justify-center p-4 bg-black/80 backdrop-blur-sm">
          <div className="bg-white rounded-3xl p-6 max-w-xs w-full text-center space-y-4 shadow-2xl">
            <h4 className="font-extrabold text-base text-slate-900 font-['Outfit']">
              On-Chain Harvest Certificate
            </h4>
            <div className="w-44 h-44 mx-auto bg-slate-900 rounded-2xl flex items-center justify-center p-3 text-white border-2 border-emerald-500">
              <QrCode className="w-32 h-32 text-emerald-400" />
            </div>
            <p className="text-[11px] text-slate-500">
              Verified by NASA Earth Observation & Landsat NDVI index (0.74). Scannable by organic/export buyers.
            </p>
            <button
              onClick={() => setShowQrModal(false)}
              className="w-full py-2 bg-slate-900 text-white rounded-xl text-xs font-bold"
            >
              Close
            </button>
          </div>
        </div>
      )}

    </div>
  );
}
