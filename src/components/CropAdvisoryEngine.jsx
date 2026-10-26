import React, { useState, useEffect, useMemo, useRef } from 'react';
import { 
  MapPin, 
  Compass, 
  CloudSun, 
  Layers, 
  RotateCw, 
  Cpu, 
  Sparkles, 
  TrendingUp, 
  DollarSign, 
  Store, 
  Droplets, 
  Leaf, 
  Volume2, 
  CheckCircle2, 
  AlertCircle, 
  Calendar, 
  BarChart3
} from 'lucide-react';
import { CROPS } from '../data/cropsData';
import { 
  SOIL_TYPES, 
  analyzeHistoricalWeather, 
  runAdvisoryAlgorithm 
} from '../data/advisoryEngine';
import { translations } from '../data/translations';
import {
  fetchMLPrediction,
  fetchMLPredictionOptions
} from '../services/mlPredictionApi';
import { fetchNasaPowerData } from '../data/nasaDataService';

const ML_CROP_NAMES = {
  maize: ['Maize (corn)', 'Maize'],
  soybean: ['Soya beans', 'Soybeans'],
  wheat: ['Wheat'],
  rice: ['Rice'],
  cotton: ['Seed cotton', 'Cotton'],
  chickpea: ['Chick peas, dry', 'Chick peas'],
  pigeonpea: ['Pigeon peas, dry', 'Pigeon peas'],
  mustard: ['Mustard seed'],
  moong: ['Beans, dry'],
  millets: ['Millet']
};

export default function CropAdvisoryEngine({ 
  activeField, 
  nasaData, 
  soilWaterData,
  currentLang = 'en',
  audioEnabled = true 
}) {
  const t = translations[currentLang] || translations.en;

  // Step state corresponding to user's handwritten flowchart:
  // 1: GPS Position -> 2: 2-3 Months Weather -> 3: Recent Crop & Soil -> 4: Algorithm & Recommendations
  const [currentStep, setCurrentStep] = useState(1);

  // Form & Geolocation State
  const [gpsCoords, setGpsCoords] = useState(() => ({
    lat: activeField?.lat ?? 19.8762,
    lon: activeField?.lon ?? 75.3433,
    locality: activeField?.location || "Chhatrapati Sambhajinagar, Maharashtra",
    isLiveGps: false,
    accuracyMeters: null
  }));
  const [isLocating, setIsLocating] = useState(false);
  const [gpsError, setGpsError] = useState(null);
  const [liveGpsWeather, setLiveGpsWeather] = useState(null);
  const gpsWeatherRequestRef = useRef(0);

  // User input context (flowchart: "asked about resent crop & 1 type soil")
  const [selectedSoilType, setSelectedSoilType] = useState('');
  const [selectedRecentCrop, setSelectedRecentCrop] = useState('');

  const [userComputedResult, setUserComputedResult] = useState(null);

  // Active view tab inside crop result cards: 'overview' | 'fertilizer' | 'pricing' | 'markets'
  const [activeCropTab, setActiveCropTab] = useState('overview');
  
  const [mlPredictions, setMlPredictions] = useState({});
  const [mlLoading, setMlLoading] = useState(false);
  const [mlError, setMlError] = useState('');

  // Sync with activeField when it changes
  useEffect(() => {
    gpsWeatherRequestRef.current += 1;
    setLiveGpsWeather(null);
    if (activeField) {
      setIsLocating(false);
      setGpsCoords({
        lat: activeField.lat,
        lon: activeField.lon,
        locality: activeField.location,
        isLiveGps: false,
        accuracyMeters: activeField.accuracy ?? null
      });
      setSelectedSoilType(activeField.isGpsLocation ? '' : 'black');
      setSelectedRecentCrop('');
      setUserComputedResult(null);
    }
  }, [activeField]);

  const activeWeatherData = gpsCoords.isLiveGps
    ? liveGpsWeather?.lat === gpsCoords.lat && liveGpsWeather?.lon === gpsCoords.lon
      ? liveGpsWeather.data
      : null
    : nasaData;
  const isLoadingGpsWeather = gpsCoords.isLiveGps &&
    liveGpsWeather?.lat === gpsCoords.lat &&
    liveGpsWeather?.lon === gpsCoords.lon &&
    liveGpsWeather.loading;
  const gpsWeatherError = gpsCoords.isLiveGps &&
    liveGpsWeather?.lat === gpsCoords.lat &&
    liveGpsWeather?.lon === gpsCoords.lon
      ? liveGpsWeather.error
      : "";

  // Analyze recent historical weather for context; recommendations do not use it to rank crops.
  const weatherAnalysis = useMemo(() => {
    return analyzeHistoricalWeather(activeWeatherData);
  }, [activeWeatherData]);
  const fieldSoilWaterData = soilWaterData?.fieldId === activeField.id
    ? soilWaterData
    : null;
  const boundarySoil = fieldSoilWaterData?.data?.soil?.properties;
  const hasBoundarySoil = Boolean(fieldSoilWaterData?.geometry && boundarySoil);
  const inputsComplete = Boolean(selectedSoilType && selectedRecentCrop);
  const showReferenceEconomics = activeField.isDemoData === true;

  // Handler for GPS detection
  const handleDetectLiveGps = async () => {
    if (!navigator.geolocation) {
      setGpsError("Geolocation is not supported by your current browser.");
      return;
    }
    setIsLocating(true);
    setGpsError(null);

    try {
      const position = await new Promise((resolve, reject) => {
        navigator.geolocation.getCurrentPosition(resolve, reject, {
          timeout: 10000,
          enableHighAccuracy: true
        });
      });
      const lat = position.coords.latitude;
      const lon = position.coords.longitude;
      const requestId = ++gpsWeatherRequestRef.current;

      setGpsCoords({
        lat,
        lon,
        locality: `Live Farm Position (${Math.abs(lat).toFixed(2)}°${lat >= 0 ? 'N' : 'S'}, ${Math.abs(lon).toFixed(2)}°${lon >= 0 ? 'E' : 'W'})`,
        isLiveGps: true,
        accuracyMeters: Math.round(position.coords.accuracy)
      });
      setUserComputedResult(null);
      setLiveGpsWeather({ lat, lon, data: null, loading: true, error: "" });

      try {
        const data = await fetchNasaPowerData(lat, lon, 90);
        if (gpsWeatherRequestRef.current === requestId) {
          setLiveGpsWeather({ lat, lon, data, loading: false, error: "" });
        }
      } catch (error) {
        if (gpsWeatherRequestRef.current === requestId) {
          setLiveGpsWeather({
            lat,
            lon,
            data: null,
            loading: false,
            error: error.message || "Historical weather unavailable for this GPS location."
          });
        }
      }
    } catch (error) {
      setGpsError(error.message || "Failed to acquire GPS location.");
    } finally {
      setIsLocating(false);
    }
  };

  // Run the rule-based comparison when the farmer requests it.
  const handleExecuteAlgorithm = () => {
    if (!inputsComplete) {
      setCurrentStep(3);
      return;
    }
    const results = runAdvisoryAlgorithm({
      lat: gpsCoords.lat,
      lon: gpsCoords.lon,
      soilTypeId: selectedSoilType,
      previousCropId: selectedRecentCrop,
      weatherAnalysis
    });
    setUserComputedResult(results);
    setCurrentStep(4);

    if (audioEnabled && 'speechSynthesis' in window) {
      window.speechSynthesis.cancel();
      const p1Name = results.p1.crop.name;
      const p2Name = results.p2.crop.name;
      let voiceText = `Rule-based advisory complete. Priority 1 option is ${p1Name}; the heuristic alternative is ${p2Name}. Verify recommendations locally.`;
      if (currentLang === 'mr') {
        voiceText = `नियमाधारित पीक सूचना तयार आहे. पहिला पर्याय ${results.p1.crop.nameMr} आणि पर्यायी पीक ${results.p2.crop.nameMr} आहे. स्थानिक कृषी माहितीनुसार निर्णय घ्या.`;
      } else if (currentLang === 'hi') {
        voiceText = `नियम आधारित फसल सुझाव तैयार हैं। पहला विकल्प ${results.p1.crop.nameHi} और वैकल्पिक फसल ${results.p2.crop.nameHi} है। स्थानीय कृषि जानकारी से निर्णय की पुष्टि करें।`;
      }
      const utterance = new SpeechSynthesisUtterance(voiceText);
      utterance.lang = currentLang === 'mr' ? 'mr-IN' : currentLang === 'hi' ? 'hi-IN' : 'en-US';
      utterance.rate = 0.95;
      window.speechSynthesis.speak(utterance);
    }
  };

  const advisoryResult = userComputedResult;

  useEffect(() => {
    if (!advisoryResult) return;

    let cancelled = false;

    async function loadPredictions() {
      setMlLoading(true);
      setMlError('');
      setMlPredictions({});

      try {
        const options = await fetchMLPredictionOptions();
        const availableCrops = options.crops || [];
        const selectedCrops = [
          advisoryResult.p1.crop,
          advisoryResult.p2.crop
        ];
        const errors = [];
        const results = await Promise.all(
          selectedCrops.map(async (crop) => {
            const cropName = ML_CROP_NAMES[crop.id]?.find(
              (name) => availableCrops.includes(name)
            );
            if (!cropName) return null;

            try {
              const prediction = await fetchMLPrediction({
                area: 'India',
                crop: cropName,
                year: 2023
              });
              return [crop.id, prediction];
            } catch (error) {
              errors.push(`${crop.name}: ${error.message}`);
              return null;
            }
          })
        );

        if (!cancelled) {
          setMlPredictions(Object.fromEntries(results.filter(Boolean)));
          setMlError(errors.join('; '));
        }
      } catch (error) {
        if (!cancelled) setMlError(error.message);
      } finally {
        if (!cancelled) setMlLoading(false);
      }
    }

    loadPredictions();
    return () => {
      cancelled = true;
    };
  }, [advisoryResult]);

  return (
    <div className="space-y-6">
      {advisoryResult && mlLoading && (
        <p className="text-xs text-emerald-700 bg-emerald-50 border border-emerald-200 rounded-xl p-2.5">
          Loading optional India-level historical yield comparisons for the selected crops...
        </p>
      )}

      {advisoryResult && mlError && (
        <p className="text-xs text-amber-800 bg-amber-50 border border-amber-200 rounded-xl p-2.5">
          Historical yield comparison unavailable: {mlError}
        </p>
      )}
    
      {/* 1. Header Banner with Flowchart Step Progress */}
      <div className="relative overflow-hidden rounded-3xl bg-gradient-to-br from-emerald-50 via-white to-lime-50/80 border border-emerald-200/90 p-6 shadow-sm">
        {/* Ambient subtle parrot green glow */}
        <div className="absolute -top-16 -right-16 w-64 h-64 bg-lime-300/25 rounded-full blur-3xl pointer-events-none" />
        <div className="absolute -bottom-16 -left-16 w-64 h-64 bg-emerald-400/20 rounded-full blur-3xl pointer-events-none" />

        <div className="relative z-10 flex flex-col md:flex-row md:items-center justify-between gap-4">
          <div className="space-y-2">
            <div className="flex items-center gap-2 flex-wrap">
              <span className="px-3 py-1 rounded-full text-[11px] font-extrabold uppercase tracking-wider bg-emerald-100 text-emerald-800 border border-emerald-300 flex items-center gap-1.5 shadow-2xs">
                <Sparkles className="w-3.5 h-3.5 text-emerald-600" />
                Rule-Based Agro-Advisory
              </span>
              <span className="text-xs text-slate-500 font-medium">
                Historical grid weather context • farmer-selected soil and crop • heuristic rules
              </span>
            </div>
            <h1 className="text-2xl sm:text-3xl font-extrabold text-slate-900 font-['Outfit'] flex items-center gap-3">
              {t.cropAdvisory}
              <span className="text-xs sm:text-sm font-semibold px-2.5 py-1 rounded-lg bg-lime-100 text-lime-800 border border-lime-300">
                Rule-Based Crop Comparison
              </span>
            </h1>
            <p className="text-xs sm:text-sm text-slate-600 max-w-3xl leading-relaxed">
              Weather is shown for context but does not affect crop ranking. This rule-based aid is not a validated yield, climate, or planting-season forecast. Verify fertilizer, costs, and market information locally.
            </p>
          </div>

          {/* Quick Voice Playback Control */}
          <div className="flex items-center gap-2 shrink-0">
            <button
              onClick={() => {
                if ('speechSynthesis' in window && advisoryResult) {
                  window.speechSynthesis.cancel();
                  const utterance = new SpeechSynthesisUtterance(
                    `Priority 1 crop is ${advisoryResult.p1.crop.name}. Priority 2 crop is ${advisoryResult.p2.crop.name}. Check fertilizer schedule and nearest mandis below.`
                  );
                  window.speechSynthesis.speak(utterance);
                }
              }}
              className="px-4 py-2 rounded-xl bg-white hover:bg-emerald-50 text-emerald-700 border border-emerald-300 text-xs font-bold flex items-center gap-2 transition-all shadow-xs hover:border-emerald-400 hover:shadow-sm"
            >
              <Volume2 className="w-4 h-4 text-emerald-600" />
              <span>Voice Summary</span>
            </button>
          </div>
        </div>

        {/* Handwritten Flowchart Step Pipeline Tracker */}
        <div className="mt-6 pt-5 border-t border-emerald-100/80 grid grid-cols-2 md:grid-cols-4 gap-3">
          {[
            { step: 1, title: "1. GPS Position", sub: gpsCoords.locality.split(',')[0], icon: MapPin },
            { step: 2, title: "2. Recent Weather", sub: `${weatherAnalysis.rainfallTotalMm ?? 'N/A'}mm grid estimate`, icon: CloudSun },
            { step: 3, title: "3. Soil & Recent Crop", sub: `${SOIL_TYPES[selectedSoilType]?.name.split(' ')[0] || 'Choose soil'} / ${CROPS[selectedRecentCrop]?.name.split(' ')[0] || 'Choose crop'}`, icon: Layers },
            { step: 4, title: "4. Crop Comparison", sub: "P-1, P-2 & market locations", icon: TrendingUp }
          ].map((item) => {
            const Icon = item.icon;
            const isDone = currentStep >= item.step;
            const isCurrent = currentStep === item.step;
            return (
              <button
                key={item.step}
                onClick={() => setCurrentStep(item.step)}
                className={`p-3 rounded-2xl text-left transition-all border ${
                  isCurrent
                    ? 'bg-white border-2 border-emerald-500 shadow-md shadow-emerald-600/10 ring-2 ring-emerald-500/20'
                    : isDone
                    ? 'bg-white border border-emerald-200/80 hover:border-emerald-300 shadow-2xs'
                    : 'bg-slate-50/80 border border-slate-200/80 hover:bg-white hover:border-slate-300 opacity-80 hover:opacity-100'
                }`}
              >
                <div className="flex items-center justify-between mb-1">
                  <div className="flex items-center gap-1.5">
                    <Icon className={`w-3.5 h-3.5 ${isCurrent ? 'text-emerald-600' : isDone ? 'text-emerald-600' : 'text-slate-400'}`} />
                    <span className={`text-xs font-bold ${isCurrent ? 'text-emerald-900' : isDone ? 'text-slate-800' : 'text-slate-600'}`}>
                      {item.title}
                    </span>
                  </div>
                  {isDone && <CheckCircle2 className="w-3.5 h-3.5 text-emerald-600" />}
                </div>
                <p className={`text-[11px] truncate ${isCurrent ? 'text-emerald-700 font-medium' : 'text-slate-500'}`}>{item.sub}</p>
              </button>
            );
          })}
        </div>
      </div>

      {/* 2. Interactive Input Panel: Step 1, 2, 3 Configuration Grid */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* STEP 1: GPS & Location Detection */}
        <div className={`bg-white p-5 rounded-2xl border transition-all shadow-xs ${currentStep === 1 ? 'border-emerald-500 ring-2 ring-emerald-500/20 shadow-sm' : 'border-slate-200 hover:border-emerald-200'}`}>
          <div className="flex items-center justify-between mb-4">
            <div className="flex items-center gap-2">
              <div className="p-2 rounded-xl bg-emerald-50 text-emerald-600 border border-emerald-200">
                <MapPin className="w-5 h-5" />
              </div>
              <div>
                <h3 className="text-sm font-bold text-slate-900 font-['Outfit']">1. GPS Location</h3>
                <p className="text-[11px] text-slate-500">Positioning Coordinates</p>
              </div>
            </div>
            {gpsCoords.isLiveGps && (
              <span className="px-2 py-0.5 rounded-full text-[10px] font-bold bg-emerald-100 text-emerald-800 border border-emerald-300">
                Live GPS
              </span>
            )}
          </div>

          <div className="space-y-3">
            <div className="p-3 rounded-xl bg-slate-50 border border-slate-200/80">
              <div className="text-[11px] text-slate-500 mb-1 flex items-center justify-between">
                <span>Coordinates:</span>
                <span className="text-emerald-700 font-mono font-bold">
                  {Math.abs(gpsCoords.lat).toFixed(4)}°{gpsCoords.lat >= 0 ? 'N' : 'S'}, {Math.abs(gpsCoords.lon).toFixed(4)}°{gpsCoords.lon >= 0 ? 'E' : 'W'}
                </span>
              </div>
              <div className="text-xs font-semibold text-slate-800 truncate">
                {gpsCoords.locality}
              </div>
            </div>

            <button
              onClick={handleDetectLiveGps}
              disabled={isLocating}
              className="w-full py-2.5 px-3 rounded-xl bg-gradient-to-r from-emerald-600 via-green-600 to-lime-500 hover:from-emerald-700 hover:to-lime-600 text-white text-xs font-bold flex items-center justify-center gap-2 transition-all shadow-md shadow-emerald-600/25 active:scale-[0.99] disabled:opacity-50"
            >
              <Compass className={`w-4 h-4 ${isLocating ? 'animate-spin' : ''}`} />
              <span>{isLocating ? 'Acquiring Satellite GPS...' : 'Detect My Live Farm GPS'}</span>
            </button>

            {gpsError && (
              <p className="text-[11px] text-rose-700 bg-rose-50 p-2.5 rounded-lg border border-rose-200">
                {gpsError}
              </p>
            )}
          </div>
        </div>

        {/* STEP 2: Recent historical weather analysis */}
        <div className={`bg-white p-5 rounded-2xl border transition-all shadow-xs ${currentStep === 2 ? 'border-emerald-500 ring-2 ring-emerald-500/20 shadow-sm' : 'border-slate-200 hover:border-emerald-200'}`}>
          <div className="flex items-center justify-between mb-4">
            <div className="flex items-center gap-2">
              <div className="p-2 rounded-xl bg-emerald-50 text-emerald-600 border border-emerald-200">
                <CloudSun className="w-5 h-5" />
              </div>
              <div>
                <h3 className="text-sm font-bold text-slate-900 font-['Outfit']">2. Recent Weather</h3>
                <p className="text-[11px] text-slate-500">NASA POWER + Open-Meteo gridded history</p>
              </div>
            </div>
            <div className="flex items-center gap-1 text-[11px] font-medium text-slate-600 bg-slate-100 px-2.5 py-1 rounded-lg border border-slate-200">
              <Calendar className="w-3 h-3 text-emerald-600" />
              <span>
                {weatherAnalysis.daysCount} days
                {weatherAnalysis.period?.end ? ` · through ${weatherAnalysis.period.end}` : ""}
              </span>
            </div>
          </div>

          <div className="space-y-3">
            <div className="grid grid-cols-2 gap-2">
              <div className="p-2.5 rounded-xl bg-emerald-50/60 border border-emerald-200/80 text-center">
                <span className="text-[10px] text-slate-500 uppercase font-bold tracking-wider">Rain Total ({weatherAnalysis.daysCount} days)</span>
                <div className="text-lg font-black text-emerald-700 mt-0.5 font-['Outfit']">
                  {weatherAnalysis.rainfallTotalMm ?? 'N/A'} <span className="text-xs font-normal text-slate-500">mm</span>
                </div>
              </div>

              <div className="p-2.5 rounded-xl bg-lime-50/60 border border-lime-200/80 text-center">
                <span className="text-[10px] text-slate-500 uppercase font-bold tracking-wider">Mean Temp</span>
                <div className="text-lg font-black text-emerald-700 mt-0.5 font-['Outfit']">
                  {weatherAnalysis.avgTempC ?? 'N/A'}° <span className="text-xs font-normal text-slate-500">C</span>
                </div>
              </div>
            </div>

            <div className="p-2.5 rounded-xl bg-slate-50 border border-slate-200/80 flex items-center justify-between text-xs">
              <span className="text-slate-600 font-medium">Subsoil Moisture Status:</span>
              <span className="font-bold text-slate-800">{weatherAnalysis.moistureStatus}</span>
            </div>

            <p className="text-[11px] text-slate-500 leading-tight">
              {weatherAnalysis.summaryText}
            </p>
            {gpsWeatherError && (
              <p role="alert" className="text-[11px] text-rose-700 bg-rose-50 p-2 rounded-lg border border-rose-200">
                Could not load weather for this GPS position: {gpsWeatherError}
              </p>
            )}
            {isLoadingGpsWeather && (
              <p role="status" className="text-[11px] text-emerald-700 bg-emerald-50 p-2 rounded-lg border border-emerald-200">
                Loading historical weather for the detected GPS position...
              </p>
            )}
            {activeWeatherData?.qualityWarnings?.map((warning) => (
              <p key={warning} role="status" className="text-[11px] text-amber-800 bg-amber-50 p-2 rounded-lg border border-amber-200">
                {warning}
              </p>
            ))}
          </div>
        </div>

        {/* STEP 3: Soil Type & Previous Crop Context Input */}
        <div className={`bg-white p-5 rounded-2xl border transition-all shadow-xs ${currentStep === 3 ? 'border-emerald-500 ring-2 ring-emerald-500/20 shadow-sm' : 'border-slate-200 hover:border-emerald-200'}`}>
          <div className="flex items-center justify-between mb-4">
            <div className="flex items-center gap-2">
              <div className="p-2 rounded-xl bg-emerald-50 text-emerald-600 border border-emerald-200">
                <Layers className="w-5 h-5" />
              </div>
              <div>
                <h3 className="text-sm font-bold text-slate-900 font-['Outfit']">3. Soil & Recent Crop</h3>
                <p className="text-[11px] text-slate-500">Confirm the soil class and previous crop</p>
              </div>
            </div>
          </div>

          <div className="space-y-3">
            {fieldSoilWaterData?.loading && (
              <p role="status" className="rounded-lg border border-emerald-200 bg-emerald-50 px-3 py-2 text-[11px] text-emerald-800">
                Loading soil context for the drawn boundary...
              </p>
            )}
            {hasBoundarySoil && (
              <div className="rounded-lg border border-emerald-200 bg-emerald-50/60 px-3 py-2 text-[11px] text-emerald-900">
                <p className="font-semibold">SoilGrids estimate, 0-5 cm (about 250 m grid)</p>
                <p>
                  pH {boundarySoil.ph?.value ?? "N/A"} · SOC {boundarySoil.organicCarbonPercent?.value ?? "N/A"}% · clay {boundarySoil.clayPercent?.value ?? "N/A"}%
                </p>
                <p className="mt-1 text-emerald-700">Use as regional context; select the soil class from farmer or lab knowledge.</p>
              </div>
            )}
            {/* Soil Type Selector (Brown, Black, Red/Rock as written in handwritten note) */}
            <div>
              <label className="text-[11px] font-bold text-slate-700 block mb-1.5">
                Select Soil Category:
              </label>
              <div className="grid grid-cols-3 gap-1.5">
                {Object.values(SOIL_TYPES).map((s) => {
                  const isSelected = selectedSoilType === s.id;
                  return (
                    <button
                      key={s.id}
                      onClick={() => {
                        setSelectedSoilType(s.id);
                        setUserComputedResult(null);
                      }}
                      className={`p-2 rounded-xl text-center border transition-all ${
                        isSelected
                          ? 'bg-emerald-50 border-2 border-emerald-500 text-emerald-900 shadow-xs font-bold ring-2 ring-emerald-500/15'
                          : 'bg-slate-50 border border-slate-200 text-slate-700 hover:bg-slate-100 hover:text-slate-900 font-medium'
                      }`}
                    >
                      <div className="text-[11px] capitalize truncate">
                        {s.id === 'black' ? '⚫ Black' : s.id === 'brown' ? '🟤 Brown' : '🔴 Red/Rock'}
                      </div>
                    </button>
                  );
                })}
              </div>
            </div>

            {/* Previous Crop Selector */}
            <div>
              <label className="text-[11px] font-bold text-slate-700 block mb-1.5">
                Previous / Recent Harvested Crop:
              </label>
              <select
                value={selectedRecentCrop}
                onChange={(e) => {
                  setSelectedRecentCrop(e.target.value);
                  setUserComputedResult(null);
                }}
                className="w-full bg-white border border-slate-200 rounded-xl px-3 py-2 text-xs text-slate-800 font-medium focus:outline-none focus:border-emerald-500 focus:ring-2 focus:ring-emerald-500/20 shadow-2xs"
              >
                <option value="" disabled>Select the crop you last harvested</option>
                {Object.values(CROPS)
                  .filter((c) => c.id !== 'cloverCover')
                  .map((crop) => (
                    <option key={crop.id} value={crop.id}>
                      {crop.name} ({crop.category})
                    </option>
                  ))}
              </select>
            </div>

            {/* Run Algorithm Button */}
            <button
              onClick={handleExecuteAlgorithm}
              disabled={!inputsComplete}
              className="w-full py-2.5 px-3 rounded-xl bg-gradient-to-r from-emerald-600 via-green-600 to-lime-500 hover:from-emerald-700 hover:to-lime-600 text-white text-xs font-extrabold flex items-center justify-center gap-2 transition-all shadow-lg shadow-emerald-600/25 active:scale-[0.99] disabled:opacity-50 disabled:shadow-none"
            >
              <Cpu className="w-4 h-4" />
              <span>{inputsComplete ? 'Compare rule-based options' : 'Select soil and previous crop'}</span>
            </button>
          </div>
        </div>
      </div>

      {/* 3. DUAL CROP RECOMMENDATION RESULTS: P-1 & P-2 */}
      {advisoryResult && (
        <div className="space-y-6">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
            <div>
              <h2 className="text-xl font-extrabold text-slate-900 font-['Outfit'] flex items-center gap-2">
                <Sparkles className="w-5 h-5 text-emerald-600" />
                Agro-Advisory Output: Dual Strategic Suggestions
              </h2>
              <p className="text-xs text-slate-500">
                Soil-and-rotation heuristic for {SOIL_TYPES[selectedSoilType]?.name} after {CROPS[selectedRecentCrop]?.name}; it does not use weather to rank crops and scores are not yield probabilities.
              </p>
            </div>

            {/* View Selector Tabs across cards */}
            <div className="flex items-center gap-1.5 p-1 bg-slate-100 rounded-xl border border-slate-200/90">
              {[
                { id: 'overview', label: 'Overview', icon: Leaf },
                { id: 'fertilizer', label: 'Fertilizer Guide', icon: Droplets },
                { id: 'pricing', label: 'Per-Acre Pricing', icon: DollarSign },
                { id: 'markets', label: 'Selling Mandis', icon: Store }
              ].map((tab) => {
                const TabIcon = tab.icon;
                const isActive = activeCropTab === tab.id;
                return (
                  <button
                    key={tab.id}
                    onClick={() => setActiveCropTab(tab.id)}
                    className={`flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-bold transition-all ${
                      isActive
                        ? 'bg-emerald-600 text-white shadow-xs'
                        : 'text-slate-600 hover:text-slate-900 hover:bg-white/60'
                    }`}
                  >
                    <TabIcon className="w-3.5 h-3.5" />
                    <span>{tab.label}</span>
                  </button>
                );
              })}
            </div>
          </div>

          {/* Cards Grid: P-1 and P-2 side-by-side */}
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            {/* P-1 CARD */}
            <StrategicCropCard
              profile={advisoryResult.p1}
              badgeLabel="P-1"
              badgeTitle="Top Soil-and-Rotation Score"
              badgeColor="emerald"
              activeTab={activeCropTab}
              currentLang={currentLang}
              showReferenceEconomics={showReferenceEconomics}
              mlPrediction={mlPredictions[advisoryResult.p1.crop.id]}
            />

            {/* P-2 CARD */}
            <StrategicCropCard
              profile={advisoryResult.p2}
              badgeLabel="P-2"
              badgeTitle="Resilience Heuristic Alternative"
              badgeColor="lime"
              activeTab={activeCropTab}
              currentLang={currentLang}
              showReferenceEconomics={showReferenceEconomics}
              mlPrediction={mlPredictions[advisoryResult.p2.crop.id]}
            />
          </div>

          <section className="bg-white rounded-3xl border border-slate-200 shadow-xs p-6 space-y-3">
            <div>
              <h3 className="text-sm font-bold text-slate-900 font-['Outfit']">
                Other crop options considered
              </h3>
              <p className="mt-1 text-[11px] text-slate-500">
                The advisory scores 10 cash-crop entries; the cover-crop entry is excluded. P-1 and P-2 are detailed above. These rule points only order this catalog and are not probabilities or validated agronomic suitability scores.
              </p>
            </div>
            <div className="overflow-x-auto">
              <table className="w-full min-w-[620px] text-left text-xs border-collapse">
                <thead>
                  <tr className="border-b border-slate-200 text-slate-600 bg-slate-50/80">
                    <th className="py-2.5 px-3 font-bold">Rank</th>
                    <th className="py-2.5 px-3 font-bold">Crop</th>
                    <th className="py-2.5 px-3 font-bold">Season in catalog</th>
                    <th className="py-2.5 px-3 font-bold">Rule points</th>
                    <th className="py-2.5 px-3 font-bold">Rotation rule note</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-100 text-slate-700">
                  {advisoryResult.rankedCrops.map((item) => {
                    const isPrimary = item.crop.id === advisoryResult.p1.crop.id;
                    const isAlternative = item.crop.id === advisoryResult.p2.crop.id;
                    return (
                      <tr key={item.crop.id} className="hover:bg-emerald-50/30 transition-colors">
                        <td className="py-2.5 px-3 font-bold text-slate-900">#{item.rank}</td>
                        <td className="py-2.5 px-3 font-semibold text-slate-900">
                          {currentLang === 'mr'
                            ? item.crop.nameMr
                            : currentLang === 'hi'
                              ? item.crop.nameHi
                              : item.crop.name}
                          {isPrimary && <span className="ml-2 text-emerald-800 bg-emerald-100 border border-emerald-300 font-bold px-1.5 py-0.5 rounded text-[10px]">P-1</span>}
                          {isAlternative && <span className="ml-2 text-lime-900 bg-lime-100 border border-lime-300 font-bold px-1.5 py-0.5 rounded text-[10px]">P-2</span>}
                        </td>
                        <td className="py-2.5 px-3">{item.crop.season.join(', ')}</td>
                        <td className="py-2.5 px-3 font-bold text-emerald-700">{item.totalScore}</td>
                        <td className="py-2.5 px-3 text-slate-500">{item.rotationNote}</td>
                      </tr>
                    );
                  })}
                </tbody>
              </table>
            </div>
            <p className="text-[11px] text-amber-800 bg-amber-50 p-2.5 rounded-xl border border-amber-200">
              Crop season, water demand, duration, and rotation notes are generalized catalog entries with no source or update date recorded in the app. They are not verified for this field; confirm them with local agricultural guidance.
            </p>
          </section>

          {/* 4. Cross-Comparison Summary Table */}
          <div className="bg-white p-6 rounded-3xl border border-slate-200 shadow-xs space-y-4">
            <h3 className="text-sm font-bold text-slate-900 font-['Outfit'] flex items-center gap-2">
              <BarChart3 className="w-4 h-4 text-emerald-600" />
              Strategic Trade-off Matrix: P-1 vs P-2 Decision Table
            </h3>

            <div className="overflow-x-auto">
              <table className="w-full text-left text-xs border-collapse">
                <thead>
                  <tr className="border-b border-slate-200 text-slate-600 bg-slate-50/80">
                    <th className="py-2.5 px-3 font-bold">Evaluation Metric</th>
                    <th className="py-2.5 px-3 text-emerald-700 font-bold">P-1: {advisoryResult.p1.crop.name}</th>
                    <th className="py-2.5 px-3 text-lime-800 font-bold">P-2: {advisoryResult.p2.crop.name}</th>
                    <th className="py-2.5 px-3 font-bold">Comparison Note</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-100 text-slate-700">
                  <tr className="hover:bg-emerald-50/30 transition-colors">
                    <td className="py-2.5 px-3 font-semibold text-slate-800">Rule points (not a probability)</td>
                    <td className="py-2.5 px-3 font-bold text-emerald-700">{advisoryResult.p1.totalScore}</td>
                    <td className="py-2.5 px-3 font-bold text-lime-800">{advisoryResult.p2.totalScore}</td>
                    <td className="py-2.5 px-3 text-slate-500">Unvalidated ordering points; weather and planting season are not scored</td>
                  </tr>
                  <tr className="hover:bg-emerald-50/30 transition-colors">
                    <td className="py-2.5 px-3 font-semibold text-slate-800">Catalog Water Demand</td>
                    <td className="py-2.5 px-3">{advisoryResult.p1.crop.waterDemandMm} mm ({advisoryResult.p1.crop.waterCategory})</td>
                    <td className="py-2.5 px-3">{advisoryResult.p2.crop.waterDemandMm} mm ({advisoryResult.p2.crop.waterCategory})</td>
                    <td className="py-2.5 px-3 text-slate-500">Crop reference values only; no irrigation or crop-stage model</td>
                  </tr>
                  <tr className="hover:bg-emerald-50/30 transition-colors">
                    <td className="py-2.5 px-3 font-semibold text-slate-800">Cultivation Cost per Acre</td>
                    <td className="py-2.5 px-3">{showReferenceEconomics ? `₹${advisoryResult.p1.economics.totalCost.toLocaleString()}` : "N/A"}</td>
                    <td className="py-2.5 px-3">{showReferenceEconomics ? `₹${advisoryResult.p2.economics.totalCost.toLocaleString()}` : "N/A"}</td>
                    <td className="py-2.5 px-3 text-slate-500">
                      {!showReferenceEconomics
                        ? "GPS-specific input costs are not connected"
                        : advisoryResult.p1.economics.totalCost > advisoryResult.p2.economics.totalCost
                        ? `P-2 is ₹${(advisoryResult.p1.economics.totalCost - advisoryResult.p2.economics.totalCost).toLocaleString()} lower under static demo assumptions`
                        : "Comparable capital requirements"}
                    </td>
                  </tr>
                  <tr className="hover:bg-emerald-50/30 transition-colors">
                    <td className="py-2.5 px-3 font-semibold text-slate-800">Illustrative Net Profit per Acre</td>
                    <td className="py-2.5 px-3 font-black text-emerald-700">{showReferenceEconomics ? `₹${advisoryResult.p1.economics.netProfit.toLocaleString()}` : "N/A"}</td>
                    <td className="py-2.5 px-3 font-black text-lime-800">{showReferenceEconomics ? `₹${advisoryResult.p2.economics.netProfit.toLocaleString()}` : "N/A"}</td>
                    <td className="py-2.5 px-3 text-emerald-700 font-semibold">
                      {!showReferenceEconomics
                        ? "Needs verified local costs, yields and prices"
                        : advisoryResult.p1.economics.netProfit >= advisoryResult.p2.economics.netProfit
                        ? `P-1 is +₹${(advisoryResult.p1.economics.netProfit - advisoryResult.p2.economics.netProfit).toLocaleString()} under static demo assumptions`
                        : `P-2 is +₹${(advisoryResult.p2.economics.netProfit - advisoryResult.p1.economics.netProfit).toLocaleString()} under static demo assumptions`}
                    </td>
                  </tr>
                  <tr className="hover:bg-emerald-50/30 transition-colors">
                    <td className="py-2.5 px-3 font-semibold text-slate-800">Nearest Mandi Reference Price</td>
                    <td className="py-2.5 px-3">
                      {!showReferenceEconomics
                        ? "N/A"
                        : advisoryResult.p1.nearbyMandis[0]?.cropQuote
                          ? `₹${advisoryResult.p1.nearbyMandis[0].cropQuote.modal} / Qtl (${advisoryResult.p1.nearbyMandis[0].name.split(' ')[0]})`
                          : "No reference quote"}
                    </td>
                    <td className="py-2.5 px-3">
                      {!showReferenceEconomics
                        ? "N/A"
                        : advisoryResult.p2.nearbyMandis[0]?.cropQuote
                          ? `₹${advisoryResult.p2.nearbyMandis[0].cropQuote.modal} / Qtl (${advisoryResult.p2.nearbyMandis[0].name.split(' ')[0]})`
                          : "No reference quote"}
                    </td>
                    <td className="py-2.5 px-3 text-slate-500">{showReferenceEconomics ? "Static, unverified reference prices; not live auction data" : "Live mandi prices are not connected"}</td>
                  </tr>
                </tbody>
              </table>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

// Subcomponent: Individual Strategic Crop Card (P-1 or P-2)
function StrategicCropCard({
  profile,
  badgeLabel,
  badgeTitle,
  badgeColor,
  activeTab,
  currentLang,
  showReferenceEconomics,
  mlPrediction
}) {
  const { crop, totalScore, resilienceScore, rotationNote, fertilizerSchedule, economics, nearbyMandis } = profile;

  const isEmerald = badgeColor === 'emerald';
  const accentBorder = isEmerald ? 'border-emerald-300 hover:border-emerald-500' : 'border-lime-300 hover:border-lime-500';
  const badgeBg = isEmerald ? 'bg-emerald-100 text-emerald-800 border-emerald-300' : 'bg-lime-100 text-lime-900 border-lime-300';

  return (
    <div className={`bg-white p-6 rounded-3xl border ${accentBorder} transition-all flex flex-col justify-between shadow-xs hover:shadow-md`}>
      <div className="space-y-4">
        {/* Card Header */}
        <div className="flex items-start justify-between gap-3">
          <div>
            <div className="flex items-center gap-2 mb-1.5">
              <span className={`px-2.5 py-0.5 rounded-full text-xs font-black uppercase tracking-wider border ${badgeBg}`}>
                {badgeLabel}
              </span>
              <span className="text-xs font-semibold text-slate-500">
                {badgeTitle}
              </span>
            </div>
            <h3 className="text-2xl font-black text-slate-900 font-['Outfit']">
              {currentLang === 'mr' ? crop.nameMr : currentLang === 'hi' ? crop.nameHi : crop.name}
            </h3>
            <p className="text-xs text-slate-500">
              {crop.category} • Duration: {crop.durationDays} Days • Root: {crop.rootDepth}
            </p>
          </div>

          <div className="text-right">
            <div className={`text-2xl font-black font-['Outfit'] ${isEmerald ? 'text-emerald-600' : 'text-emerald-700'}`}>
              {totalScore}<span className="text-xs font-normal text-slate-400"> pts</span>
            </div>
            <span className="text-[10px] text-slate-400 uppercase tracking-widest font-semibold">Unvalidated rule points</span>
          </div>
        </div>

        {/* Rotation Benefit Banner */}
        <div className="p-3 rounded-2xl bg-emerald-50/80 border border-emerald-200 text-xs text-slate-700 flex items-start gap-2.5">
          <RotateCw className="w-4 h-4 text-emerald-600 shrink-0 mt-0.5" />
          <p className="leading-relaxed">
            <b className="text-emerald-800">Rotation & Succession:</b> {rotationNote}
          </p>
        </div>

        {/* TAB 1: OVERVIEW */}
        {activeTab === 'overview' && (
          <div className="space-y-3 pt-2">
            <div className="grid grid-cols-2 gap-2 text-xs">
              <div className="p-3 rounded-xl bg-slate-50 border border-slate-200/80">
                <span className="text-slate-500 text-[11px] block">Catalog Water-Demand Estimate</span>
                <span className="text-sm font-bold text-slate-900 mt-1 block">
                  {crop.waterDemandMm} mm ({crop.waterCategory})
                </span>
              </div>
              <div className="p-3 rounded-xl bg-slate-50 border border-slate-200/80">
                <span className="text-slate-500 text-[11px] block">Resilience Heuristic Points</span>
                <span className="text-sm font-bold text-emerald-700 mt-1 block">
                  {resilienceScore}
                </span>
              </div>
            </div>

            <div className="p-3.5 rounded-xl bg-emerald-50/40 border border-emerald-100 space-y-1.5 text-xs">
              <div className="text-emerald-800 font-bold flex items-center gap-1.5">
                <CheckCircle2 className="w-3.5 h-3.5 text-emerald-600" />
                Agronomic Advantages:
              </div>
              <p className="text-slate-600 text-[11px] leading-relaxed">
                {crop.benefits}
              </p>
              <div className="text-amber-800 font-bold flex items-center gap-1.5 pt-1">
                <AlertCircle className="w-3.5 h-3.5 text-amber-600" />
                Risk Precautions:
              </div>
              <p className="text-slate-600 text-[11px] leading-relaxed">
                {crop.risks}
              </p>
            </div>
          </div>
        )}

        {/* TAB 2: FERTILIZER PROTOCOL ("Suggest crop <---> fertilizer") */}
        {activeTab === 'fertilizer' && (
          <div className="space-y-3 pt-2">
            <p className="rounded-xl border border-amber-200 bg-amber-50 p-3 text-[11px] text-amber-800">
              This advisory does not generate fertilizer prescriptions. Use a laboratory soil test and verified crop-specific local recommendations to choose a product, dose, and timing.
            </p>
            {fertilizerSchedule.legumeCreditNote && (
              <div className="p-2.5 rounded-xl bg-emerald-50 border border-emerald-200 text-[11px] text-emerald-800 flex items-center gap-2">
                <Sparkles className="w-4 h-4 text-emerald-600 shrink-0" />
                <span>{fertilizerSchedule.legumeCreditNote}</span>
              </div>
            )}
            <div className="space-y-2.5">
              {fertilizerSchedule.steps.map((step, idx) => (
                <div key={idx} className="p-3 rounded-xl bg-slate-50 border border-slate-200/80 space-y-1.5">
                  <div className="flex items-center justify-between text-xs font-bold text-slate-800">
                    <span className="text-emerald-700">
                      {currentLang === 'mr' ? step.phaseMr : currentLang === 'hi' ? step.phaseHi : step.phase}
                    </span>
                    <span className="text-[10px] font-mono px-2 py-0.5 rounded bg-slate-200/80 text-slate-700">
                      {step.timing}
                    </span>
                  </div>
                  <div className="space-y-1 pt-1">
                    {step.items.map((item, itemIdx) => (
                      <div key={itemIdx} className="text-[11px] flex items-start justify-between gap-2 border-t border-slate-200/60 pt-1">
                        <span className="text-slate-700 font-medium">{item.name}</span>
                        <span className="text-emerald-700 font-bold font-mono shrink-0">{item.quantity}</span>
                      </div>
                    ))}
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* TAB 3: PRICING & ECONOMICS ("prizing") */}
        {activeTab === 'pricing' && showReferenceEconomics && (
          <div className="space-y-3 pt-2">
            <p className="text-[11px] text-amber-800 bg-amber-50 p-2.5 rounded-xl border border-amber-200">
              Static reference economics for demo profiles only; not a current quote or farm-specific forecast.
            </p>
            <div className="grid grid-cols-3 gap-2 text-center text-xs">
              <div className="p-2.5 rounded-xl bg-slate-50 border border-slate-200/80">
                <span className="text-[10px] text-slate-500 uppercase font-semibold">Cost / Acre</span>
                <div className="text-sm font-bold text-slate-900 mt-1">
                  ₹{economics.totalCost.toLocaleString()}
                </div>
              </div>
              <div className="p-2.5 rounded-xl bg-slate-50 border border-slate-200/80">
                <span className="text-[10px] text-slate-500 uppercase font-semibold">Gross Revenue</span>
                <div className="text-sm font-bold text-slate-900 mt-1">
                  ₹{economics.grossRevenue.toLocaleString()}
                </div>
              </div>
              <div className="p-2.5 rounded-xl bg-emerald-50/70 border border-emerald-200/80">
                <span className="text-[10px] text-emerald-800 uppercase font-bold">Net Profit</span>
                <div className="text-sm font-black text-emerald-700 mt-1 font-['Outfit']">
                  ₹{economics.netProfit.toLocaleString()}
                </div>
              </div>
            </div>

            <div className="p-3 rounded-xl bg-slate-50 border border-slate-200/80 space-y-1.5 text-xs">
              <div className="text-slate-600 text-[11px] font-bold mb-1">Per-Acre Production Breakdown:</div>
              {economics.breakdown.map((b, i) => (
                <div key={i} className="flex items-center justify-between text-[11px] text-slate-700 py-0.5 border-b border-slate-200/60 last:border-none">
                  <span className="truncate pr-2">{b.item}</span>
                  <div className="flex items-center gap-2 shrink-0">
                    <span className="font-mono text-slate-900 font-semibold">₹{b.amount.toLocaleString()}</span>
                    <span className="text-[10px] text-slate-500 w-7 text-right">({b.pct})</span>
                  </div>
                </div>
              ))}
            </div>

            <div className="p-2.5 rounded-xl bg-emerald-50 border border-emerald-200 flex items-center justify-between text-xs text-slate-700">
              <span className="font-medium">Projected Return on Investment (ROI):</span>
              <span className="font-extrabold text-emerald-700 text-sm font-mono">+{economics.roiPercent}%</span>
            </div>
          </div>
        )}
        {activeTab === 'pricing' && !showReferenceEconomics && (
          <p className="rounded-xl border border-amber-200 bg-amber-50 p-3 text-xs text-amber-800">
            Per-acre cost and profit are unavailable for this GPS field. Enter verified local costs, yield history, and current crop prices to calculate them.
          </p>
        )}

        {/* TAB 4: SELLING MARKETS & MANDIS ("* market [selling market]") */}
        {activeTab === 'markets' && showReferenceEconomics && (
          <div className="space-y-3 pt-2">
            <p className="text-xs text-slate-500">
              Nearest reference mandi locations are ordered by approximate straight-line distance. Prices below are static, unverified examples—not live quotes.
            </p>

            <div className="space-y-2">
              {nearbyMandis.map((mandi, idx) => (
                <div key={idx} className="p-3 rounded-xl bg-slate-50 border border-slate-200/80 space-y-1.5">
                  <div className="flex items-center justify-between">
                    <div>
                      <div className="text-xs font-bold text-slate-800 flex items-center gap-1.5">
                        <Store className="w-3.5 h-3.5 text-emerald-600" />
                        {mandi.name}
                      </div>
                      <span className="text-[10px] text-slate-500">{mandi.district} • {mandi.tradingDays}</span>
                    </div>

                    <div className="text-right">
                      <span className="text-xs font-extrabold text-emerald-700 font-mono">
                        {mandi.distanceKm} km
                      </span>
                      <span className="text-[10px] text-slate-400 block">Straight-line distance</span>
                    </div>
                  </div>

                  {mandi.cropQuote ? (
                    <div className="pt-2 border-t border-slate-200/60 flex items-center justify-between text-xs">
                      <div>
                        <span className="text-[10px] text-slate-500 block">Static Modal Price</span>
                        <span className="text-sm font-black text-emerald-700 font-mono">
                          ₹{mandi.cropQuote.modal} <span className="text-[10px] font-normal text-slate-500">/ Qtl</span>
                        </span>
                      </div>

                      <div className="text-right">
                        <span className="text-[10px] text-slate-500 block">Estimated Net After Transport</span>
                        <span className="text-xs font-bold text-slate-800 font-mono">
                          ₹{mandi.netRealizationPerQuintal} / Qtl
                        </span>
                      </div>
                    </div>
                  ) : (
                    <p className="border-t border-slate-200/60 pt-2 text-[11px] text-slate-500">
                      No stored reference price for this crop at this mandi.
                    </p>
                  )}
                </div>
              ))}
            </div>
          </div>
        )}
        {activeTab === 'markets' && !showReferenceEconomics && (
          <p className="rounded-xl border border-amber-200 bg-amber-50 p-3 text-xs text-amber-800">
            Mandi locations are reference points only. Live market prices and arrivals are not connected, so no price is shown for this field.
          </p>
        )}
      </div>

      {mlPrediction && (
        <div className="mt-3 p-3 rounded-xl border border-emerald-200 bg-emerald-50/50 text-xs text-slate-700 space-y-1">
          <p className="font-bold text-emerald-800">
            India-Level FAOSTAT Historical Backtest
          </p>
          <p>
            Random Forest estimate: <b className="text-slate-900">{mlPrediction.ml_predicted_yield.toLocaleString()} kg/ha</b>
          </p>
          <p>
            Last-observed baseline estimate: <b className="text-slate-900">{mlPrediction.baseline_predicted_yield.toLocaleString()} kg/ha</b>
          </p>
          <p className="text-slate-500">
            {mlPrediction.area} • {mlPrediction.crop} • Historical {mlPrediction.year} backtest
          </p>
          {mlPrediction.observed_yield != null ? (
            <p className="text-slate-700">
              Recorded FAOSTAT yield: {mlPrediction.observed_yield.toLocaleString()} kg/ha.
              {" "}Absolute error: Random Forest {Math.abs(mlPrediction.ml_predicted_yield - mlPrediction.observed_yield).toLocaleString()} kg/ha;
              {" "}baseline {Math.abs(mlPrediction.baseline_predicted_yield - mlPrediction.observed_yield).toLocaleString()} kg/ha.
            </p>
          ) : (
            <p className="text-amber-800">
              Recorded FAOSTAT yield is not available in the bundled dataset; these estimates cannot be checked against an observed value here.
            </p>
          )}
          <p className="text-amber-800">
            Historical country-level comparison only; not a GPS/farm forecast and not used to rank the advisory crops.
          </p>
          {mlPrediction.aggregate_backtest ? (
            <p className="text-slate-500">
              Aggregate {mlPrediction.aggregate_backtest.forecast_years.join("–")} backtest
              {" "}({mlPrediction.aggregate_backtest.examples?.toLocaleString()} country/crop forecasts):
              {" "}Random Forest MAE {mlPrediction.aggregate_backtest.random_forest.mae_kg_ha.toLocaleString()} kg/ha;
              {" "}last-observed baseline MAE {mlPrediction.aggregate_backtest.last_observed_baseline.mae_kg_ha.toLocaleString()} kg/ha.
              {" "}Lower is better; these aggregate errors are not accuracy estimates for this crop or India specifically.
            </p>
          ) : (
            <p className="text-amber-800">
              Aggregate model evaluation metrics are unavailable; accuracy for this crop has not been verified.
            </p>
          )}
        </div>
      )}

      {/* Card Footer Quick Specs */}
      <div className="mt-4 pt-3 border-t border-slate-200 flex items-center justify-between text-xs text-slate-500">
        <span>
          2023 India-level historical model:
          <b className="text-slate-800 ml-1">
            {mlPrediction
              ? `${mlPrediction.ml_predicted_yield.toLocaleString()} kg/ha (not farm-specific)`
              : 'Comparison unavailable'}
          </b>
        </span>

        {showReferenceEconomics && (
          <span>Reference net margin: <b className="text-emerald-700 font-mono font-bold">₹{economics.netProfit.toLocaleString()}</b></span>
        )}
      </div>
    </div>
  );
}
