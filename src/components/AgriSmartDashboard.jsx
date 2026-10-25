import React, { useEffect, useRef, useState } from 'react';
import L from 'leaflet';
import 'leaflet/dist/leaflet.css';
import { 
  Leaf, 
  Wheat, 
  Droplet, 
  Thermometer, 
  Maximize2, 
  Plus, 
  Minus, 
  RotateCcw, 
  Calendar, 
  ChevronDown, 
  AlertTriangle, 
  CheckCircle2, 
  ArrowRight, 
  MapPin,
  Sun,
  Cloud,
  CloudRain,
  CloudSun,
  Sparkles
} from 'lucide-react';
import CropCard from './CropCard';
import { FEATURED_CROPS } from '../data/featuredCrops';

export default function AgriSmartDashboard({ 
  activeField, 
  setActiveTab, 
  nasaData, 
  satelliteFarmData, 
  soilWaterData 
}) {
  const mapContainerRef = useRef(null);
  const mapInstanceRef = useRef(null);
  const [selectedDateRange, setSelectedDateRange] = useState('Sep 1, 2026 - Sep 30, 2026');
  const [showDatePicker, setShowDatePicker] = useState(false);
  const [activePolygon, setActivePolygon] = useState(null);
  const [cropNotice, setCropNotice] = useState(null);

  // Initialize interactive Leaflet Satellite Map with 3 parcels
  useEffect(() => {
    if (!mapContainerRef.current) return;

    // Center coordinates (farmland)
    const center = [9.6680, 80.0220];

    // If map already initialized, remove it
    if (mapInstanceRef.current) {
      mapInstanceRef.current.remove();
      mapInstanceRef.current = null;
    }

    const map = L.map(mapContainerRef.current, {
      center,
      zoom: 15,
      zoomControl: false,
      attributionControl: false
    });
    mapInstanceRef.current = map;

    // High-res Esri Satellite Imagery
    L.tileLayer('https://server.arcgisonline.com/ArcGIS/rest/services/World_Imagery/MapServer/tile/{z}/{y}/{x}', {
      maxZoom: 19,
      subdomains: ['server', 'services'],
    }).addTo(map);

    // Three contiguous field parcels matching AgriSmart UI
    const fieldAPolygon = [
      [9.6720, 80.0170],
      [9.6740, 80.0210],
      [9.6680, 80.0220],
      [9.6640, 80.0190],
      [9.6660, 80.0160]
    ];

    const fieldBPolygon = [
      [9.6740, 80.0210],
      [9.6725, 80.0265],
      [9.6685, 80.0255],
      [9.6680, 80.0220]
    ];

    const fieldCPolygon = [
      [9.6680, 80.0220],
      [9.6685, 80.0255],
      [9.6635, 80.0245],
      [9.6640, 80.0190]
    ];

    // Style and add Field A (Rice - Green / Healthy)
    const polyA = L.polygon(fieldAPolygon, {
      color: '#22c55e',
      weight: 3,
      fillColor: '#22c55e',
      fillOpacity: 0.38,
    }).addTo(map);
    polyA.on('click', () => setActivePolygon('Field A'));

    // Style and add Field B (Vegetables - Orange-Brown / Attention)
    const polyB = L.polygon(fieldBPolygon, {
      color: '#ea580c',
      weight: 3,
      fillColor: '#c2410c',
      fillOpacity: 0.38,
    }).addTo(map);
    polyB.on('click', () => setActivePolygon('Field B'));

    // Style and add Field C (Fruits - Amber-Yellow / Attention)
    const polyC = L.polygon(fieldCPolygon, {
      color: '#eab308',
      weight: 3,
      fillColor: '#ca8a04',
      fillOpacity: 0.38,
    }).addTo(map);
    polyC.on('click', () => setActivePolygon('Field C'));

    // Custom Label Markers
    const createFieldLabel = (title, crop) => L.divIcon({
      className: 'custom-field-label-pill',
      html: `
        <div style="text-align: center; color: white; text-shadow: 0 1px 4px rgba(0,0,0,0.9); font-family: Inter, sans-serif; pointer-events: none;">
          <div style="font-weight: 700; font-size: 13px; line-height: 1.2;">${title}</div>
          <div style="font-weight: 500; font-size: 11px; opacity: 0.95;">${crop}</div>
        </div>
      `,
      iconSize: [110, 36],
      iconAnchor: [55, 18]
    });

    L.marker([9.6688, 80.0190], { icon: createFieldLabel('Field A', 'Rice') }).addTo(map);
    L.marker([9.6708, 80.0238], { icon: createFieldLabel('Field B', 'Vegetables') }).addTo(map);
    L.marker([9.6660, 80.0228], { icon: createFieldLabel('Field C', 'Fruits') }).addTo(map);

    // Invalidate size on load
    setTimeout(() => {
      map.invalidateSize();
    }, 200);

    return () => {
      if (mapInstanceRef.current) {
        mapInstanceRef.current.remove();
        mapInstanceRef.current = null;
      }
    };
  }, []);

  const handleZoomIn = () => {
    if (mapInstanceRef.current) mapInstanceRef.current.zoomIn();
  };

  const handleZoomOut = () => {
    if (mapInstanceRef.current) mapInstanceRef.current.zoomOut();
  };

  const handleResetZoom = () => {
    if (mapInstanceRef.current) {
      mapInstanceRef.current.setView([9.6680, 80.0220], 15);
    }
  };

  return (
    <div className="space-y-6 max-w-7xl mx-auto">
      
      {/* 1. Dashboard Title & Date Selector */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl sm:text-3xl font-extrabold text-slate-900 font-['Outfit'] tracking-tight">
            Dashboard
          </h1>
          <p className="text-sm text-slate-500 font-normal mt-0.5">
            Live insights from your farm
          </p>
        </div>

        {/* Date Range Picker Pill */}
        <div className="relative">
          <button
            onClick={() => setShowDatePicker(!showDatePicker)}
            className="flex items-center gap-2 px-4 py-2 bg-white rounded-xl border border-slate-200/90 text-xs font-semibold text-slate-700 hover:border-slate-300 shadow-xs transition-all"
          >
            <Calendar className="w-3.5 h-3.5 text-slate-500" />
            <span>{selectedDateRange}</span>
            <ChevronDown className="w-3.5 h-3.5 text-slate-400" />
          </button>

          {showDatePicker && (
            <div className="absolute right-0 mt-2 w-56 bg-white rounded-xl shadow-xl border border-slate-200 p-2 z-30 space-y-1">
              {[
                'Sep 1, 2026 - Sep 30, 2026',
                'Aug 1, 2026 - Aug 31, 2026',
                'Current Season (Kharif)',
                'Last 30 Days',
                'Year to Date'
              ].map((range) => (
                <button
                  key={range}
                  onClick={() => {
                    setSelectedDateRange(range);
                    setShowDatePicker(false);
                  }}
                  className={`w-full text-left px-3 py-1.5 rounded-lg text-xs font-medium ${
                    selectedDateRange === range ? 'bg-emerald-50 text-emerald-700 font-semibold' : 'text-slate-600 hover:bg-slate-50'
                  }`}
                >
                  {range}
                </button>
              ))}
            </div>
          )}
        </div>
      </div>

      {/* 2. Top 4 KPI Metric Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        
        {/* Card 1: Total Fields */}
        <div className="bg-white rounded-2xl p-5 border border-slate-200/70 shadow-xs flex items-center gap-4 transition-all hover:shadow-md">
          <div className="w-12 h-12 rounded-2xl bg-emerald-50 text-emerald-600 flex items-center justify-center shrink-0">
            <Leaf className="w-6 h-6 fill-emerald-600/20" />
          </div>
          <div>
            <p className="text-xs font-medium text-slate-500">Total Fields</p>
            <p className="text-2xl font-bold text-slate-900 leading-tight">12</p>
            <p className="text-xs font-semibold text-emerald-600 mt-0.5">+2 this month</p>
          </div>
        </div>

        {/* Card 2: Active Crops */}
        <div className="bg-white rounded-2xl p-5 border border-slate-200/70 shadow-xs flex items-center gap-4 transition-all hover:shadow-md">
          <div className="w-12 h-12 rounded-2xl bg-amber-50 text-amber-600 flex items-center justify-center shrink-0">
            <Wheat className="w-6 h-6 fill-amber-600/20" />
          </div>
          <div>
            <p className="text-xs font-medium text-slate-500">Active Crops</p>
            <p className="text-2xl font-bold text-slate-900 leading-tight">5</p>
            <p className="text-xs font-medium text-slate-400 mt-0.5">Healthy growth</p>
          </div>
        </div>

        {/* Card 3: Soil Moisture */}
        <div className="bg-white rounded-2xl p-5 border border-slate-200/70 shadow-xs flex items-center gap-4 transition-all hover:shadow-md">
          <div className="w-12 h-12 rounded-2xl bg-blue-50 text-blue-600 flex items-center justify-center shrink-0">
            <Droplet className="w-6 h-6 fill-blue-600/20" />
          </div>
          <div>
            <p className="text-xs font-medium text-slate-500">Soil Moisture</p>
            <p className="text-2xl font-bold text-slate-900 leading-tight">68%</p>
            <p className="text-xs font-semibold text-blue-600 mt-0.5">Optimal level</p>
          </div>
        </div>

        {/* Card 4: Temperature */}
        <div className="bg-white rounded-2xl p-5 border border-slate-200/70 shadow-xs flex items-center gap-4 transition-all hover:shadow-md">
          <div className="w-12 h-12 rounded-2xl bg-rose-50 text-rose-500 flex items-center justify-center shrink-0">
            <Thermometer className="w-6 h-6" />
          </div>
          <div>
            <p className="text-xs font-medium text-slate-500">Temperature</p>
            <p className="text-2xl font-bold text-slate-900 leading-tight">28°C</p>
            <p className="text-xs font-medium text-slate-400 mt-0.5">Normal range</p>
          </div>
        </div>

      </div>

      {/* 3. Main 2-Column Grid */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 items-start">
        
        {/* Left Column (~62%): Field Overview Map & Soil Conditions */}
        <div className="lg:col-span-7 space-y-6">
          
          {/* Field Overview Card */}
          <div className="bg-white rounded-2xl p-5 border border-slate-200/70 shadow-xs">
            <div className="flex items-center justify-between mb-4">
              <h3 className="font-bold text-base text-slate-900">Field Overview</h3>
              <button
                onClick={() => setActiveTab('fields')}
                className="p-1.5 rounded-lg text-slate-400 hover:text-slate-700 hover:bg-slate-100 transition-colors"
                title="Full Screen / Satellite Map"
              >
                <Maximize2 className="w-4 h-4" />
              </button>
            </div>

            {/* Map Container */}
            <div className="relative rounded-2xl overflow-hidden h-[340px] border border-slate-200/60 shadow-inner bg-slate-950">
              <div ref={mapContainerRef} className="w-full h-full" />

              {/* Floating Map Zoom / Controls on Top Right */}
              <div className="absolute top-3 right-3 z-[1000] flex flex-col gap-1.5 bg-white/95 backdrop-blur-xs rounded-xl shadow-md border border-slate-200/80 p-1">
                <button
                  onClick={handleZoomIn}
                  className="w-7 h-7 flex items-center justify-center rounded-lg text-slate-700 hover:bg-slate-100 transition-colors"
                  title="Zoom In"
                >
                  <Plus className="w-4 h-4" />
                </button>
                <button
                  onClick={handleZoomOut}
                  className="w-7 h-7 flex items-center justify-center rounded-lg text-slate-700 hover:bg-slate-100 transition-colors"
                  title="Zoom Out"
                >
                  <Minus className="w-4 h-4" />
                </button>
                <button
                  onClick={handleResetZoom}
                  className="w-7 h-7 flex items-center justify-center rounded-lg text-slate-700 hover:bg-slate-100 transition-colors"
                  title="Reset View"
                >
                  <RotateCcw className="w-3.5 h-3.5" />
                </button>
              </div>

              {/* Bottom Legend */}
              <div className="absolute bottom-3 left-3 z-[1000] bg-white/95 backdrop-blur-xs rounded-xl px-3.5 py-1.5 shadow-md border border-slate-200/80 flex items-center gap-4 text-xs font-semibold text-slate-700">
                <div className="flex items-center gap-1.5">
                  <span className="w-2.5 h-2.5 rounded-full bg-emerald-500" />
                  <span>Healthy</span>
                </div>
                <div className="flex items-center gap-1.5">
                  <span className="w-2.5 h-2.5 rounded-full bg-amber-500" />
                  <span>Attention</span>
                </div>
                <div className="flex items-center gap-1.5">
                  <span className="w-2.5 h-2.5 rounded-full bg-rose-500" />
                  <span>Critical</span>
                </div>
              </div>
            </div>
          </div>

          {/* Soil Conditions Card */}
          <div className="bg-white rounded-2xl p-5 border border-slate-200/70 shadow-xs">
            <div className="flex items-center justify-between mb-4">
              <div>
                <h3 className="font-bold text-base text-slate-900">Soil Conditions</h3>
                <p className="text-xs text-slate-400 mt-0.5">Last updated: 10:30 AM</p>
              </div>
              <button
                onClick={() => setActiveTab('iot')}
                className="text-xs font-semibold text-emerald-600 hover:text-emerald-700 flex items-center gap-1 transition-colors"
              >
                <span>View Details</span>
                <ArrowRight className="w-3.5 h-3.5" />
              </button>
            </div>

            {/* 2x2 Grid of sensor meters */}
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              
              {/* Moisture */}
              <div className="bg-slate-50/80 rounded-2xl p-4 border border-slate-100">
                <div className="flex items-center gap-3">
                  <div className="w-10 h-10 rounded-full bg-blue-100/70 text-blue-600 flex items-center justify-center shrink-0">
                    <Droplet className="w-5 h-5 fill-blue-600/20" />
                  </div>
                  <div>
                    <p className="text-xs font-medium text-slate-500">Moisture</p>
                    <p className="text-lg font-bold text-slate-900">68%</p>
                  </div>
                </div>
                <div className="mt-3 w-full bg-slate-200/80 h-2 rounded-full overflow-hidden">
                  <div className="bg-teal-600 h-full rounded-full" style={{ width: '68%' }} />
                </div>
              </div>

              {/* pH Level */}
              <div className="bg-slate-50/80 rounded-2xl p-4 border border-slate-100">
                <div className="flex items-center gap-3">
                  <div className="w-10 h-10 rounded-full bg-emerald-100/70 text-emerald-600 flex items-center justify-center shrink-0">
                    <Leaf className="w-5 h-5 fill-emerald-600/20" />
                  </div>
                  <div>
                    <p className="text-xs font-medium text-slate-500">pH Level</p>
                    <p className="text-lg font-bold text-slate-900">6.5</p>
                  </div>
                </div>
                <div className="mt-3 w-full bg-slate-200/80 h-2 rounded-full overflow-hidden">
                  <div className="bg-emerald-600 h-full rounded-full" style={{ width: '65%' }} />
                </div>
              </div>

              {/* Temperature */}
              <div className="bg-slate-50/80 rounded-2xl p-4 border border-slate-100">
                <div className="flex items-center gap-3">
                  <div className="w-10 h-10 rounded-full bg-rose-100/70 text-rose-500 flex items-center justify-center shrink-0">
                    <Thermometer className="w-5 h-5" />
                  </div>
                  <div>
                    <p className="text-xs font-medium text-slate-500">Temperature</p>
                    <p className="text-lg font-bold text-slate-900">28°C</p>
                  </div>
                </div>
                <div className="mt-3 w-full bg-slate-200/80 h-2 rounded-full overflow-hidden">
                  <div className="bg-gradient-to-r from-amber-500 to-rose-500 h-full rounded-full" style={{ width: '70%' }} />
                </div>
              </div>

              {/* Nutrients */}
              <div className="bg-slate-50/80 rounded-2xl p-4 border border-slate-100">
                <div className="flex items-center gap-3">
                  <div className="w-10 h-10 rounded-full bg-emerald-100/70 text-emerald-600 flex items-center justify-center shrink-0">
                    <Wheat className="w-5 h-5 fill-emerald-600/20" />
                  </div>
                  <div>
                    <p className="text-xs font-medium text-slate-500">Nutrients</p>
                    <p className="text-lg font-bold text-slate-900">Good</p>
                  </div>
                </div>
                <div className="mt-3 w-full bg-slate-200/80 h-2 rounded-full overflow-hidden">
                  <div className="bg-emerald-600 h-full rounded-full" style={{ width: '85%' }} />
                </div>
              </div>

            </div>
          </div>

        </div>

        {/* Right Column (~38%): Weather Forecast & Recent Alerts */}
        <div className="lg:col-span-5 space-y-6">
          
          {/* Weather Forecast Card */}
          <div className="bg-white rounded-2xl p-5 border border-slate-200/70 shadow-xs">
            <div className="flex items-center justify-between mb-2">
              <h3 className="font-bold text-base text-slate-900">Weather Forecast</h3>
              <button
                onClick={() => setActiveTab('weather')}
                className="text-xs font-semibold text-emerald-600 hover:text-emerald-700 flex items-center gap-1 transition-colors"
              >
                <span>See More</span>
                <ArrowRight className="w-3.5 h-3.5" />
              </button>
            </div>

            {/* Location Line */}
            <div className="flex items-center gap-1 text-xs text-slate-400 font-medium mb-5">
              <MapPin className="w-3.5 h-3.5 text-slate-400" />
              <span>{activeField?.location || 'Jaffna, Sri Lanka'}</span>
            </div>

            {/* Current Weather Big Banner */}
            <div className="flex items-center gap-5 pb-6 border-b border-slate-100">
              {/* Colorful Sun behind Cloud SVG */}
              <div className="relative w-16 h-14 flex items-center justify-center shrink-0">
                {/* Sun */}
                <div className="absolute -top-1 left-1 w-10 h-10 rounded-full bg-gradient-to-tr from-amber-400 to-yellow-300 shadow-md shadow-amber-300/40" />
                {/* Cloud */}
                <div className="absolute -bottom-1 -right-1 w-12 h-9 bg-gradient-to-b from-sky-100 via-sky-200 to-slate-200 rounded-2xl shadow-sm" />
                <Cloud className="w-11 h-9 text-sky-200 fill-sky-100 drop-shadow-sm absolute bottom-0 right-0" />
              </div>

              <div>
                <p className="text-4xl font-extrabold text-slate-900 tracking-tight leading-none">
                  28°C
                </p>
                <p className="text-sm font-semibold text-slate-500 mt-1">
                  Partly Cloudy
                </p>
              </div>
            </div>

            {/* 5-Day Forecast Row */}
            <div className="grid grid-cols-5 gap-1 pt-5 text-center">
              
              {/* Tue */}
              <div className="space-y-2">
                <p className="text-xs font-medium text-slate-400">Tue</p>
                <div className="flex justify-center">
                  <Sun className="w-6 h-6 text-amber-500 fill-amber-400" />
                </div>
                <p className="text-xs font-bold text-slate-800">28°</p>
              </div>

              {/* Wed */}
              <div className="space-y-2">
                <p className="text-xs font-medium text-slate-400">Wed</p>
                <div className="flex justify-center">
                  <CloudRain className="w-6 h-6 text-sky-500 fill-sky-200" />
                </div>
                <p className="text-xs font-bold text-slate-800">27°</p>
              </div>

              {/* Thu */}
              <div className="space-y-2">
                <p className="text-xs font-medium text-slate-400">Thu</p>
                <div className="flex justify-center">
                  <Sun className="w-6 h-6 text-amber-500 fill-amber-400" />
                </div>
                <p className="text-xs font-bold text-slate-800">29°</p>
              </div>

              {/* Fri */}
              <div className="space-y-2">
                <p className="text-xs font-medium text-slate-400">Fri</p>
                <div className="flex justify-center">
                  <CloudRain className="w-6 h-6 text-blue-500 fill-blue-300" />
                </div>
                <p className="text-xs font-bold text-slate-800">28°</p>
              </div>

              {/* Sat */}
              <div className="space-y-2">
                <p className="text-xs font-medium text-slate-400">Sat</p>
                <div className="flex justify-center">
                  <Cloud className="w-6 h-6 text-slate-400 fill-slate-200" />
                </div>
                <p className="text-xs font-bold text-slate-800">27°</p>
              </div>

            </div>
          </div>

          {/* Recent Alerts Card */}
          <div className="bg-white rounded-2xl p-5 border border-slate-200/70 shadow-xs">
            <div className="flex items-center justify-between mb-4">
              <h3 className="font-bold text-base text-slate-900">Recent Alerts</h3>
              <button
                onClick={() => setActiveTab('weather')}
                className="text-xs font-semibold text-emerald-600 hover:text-emerald-700 flex items-center gap-1 transition-colors"
              >
                <span>View All</span>
                <ArrowRight className="w-3.5 h-3.5" />
              </button>
            </div>

            {/* Alert List */}
            <div className="space-y-3">
              
              {/* Alert 1 */}
              <div className="flex items-start gap-3.5 p-2 rounded-xl hover:bg-slate-50 transition-colors">
                <div className="p-2 rounded-xl bg-rose-50 text-rose-500 shrink-0">
                  <AlertTriangle className="w-4 h-4" />
                </div>
                <div>
                  <p className="text-xs font-bold text-slate-800 leading-snug">
                    Low soil moisture in Field B
                  </p>
                  <p className="text-[11px] font-medium text-slate-400 mt-0.5">
                    Today, 08:15 AM
                  </p>
                </div>
              </div>

              {/* Alert 2 */}
              <div className="flex items-start gap-3.5 p-2 rounded-xl hover:bg-slate-50 transition-colors">
                <div className="p-2 rounded-xl bg-amber-50 text-amber-500 shrink-0">
                  <AlertTriangle className="w-4 h-4" />
                </div>
                <div>
                  <p className="text-xs font-bold text-slate-800 leading-snug">
                    High temperature expected
                  </p>
                  <p className="text-[11px] font-medium text-slate-400 mt-0.5">
                    Tomorrow, 06:00 AM
                  </p>
                </div>
              </div>

              {/* Alert 3 */}
              <div className="flex items-start gap-3.5 p-2 rounded-xl hover:bg-slate-50 transition-colors">
                <div className="p-2 rounded-xl bg-emerald-50 text-emerald-600 shrink-0">
                  <CheckCircle2 className="w-4 h-4" />
                </div>
                <div>
                  <p className="text-xs font-bold text-slate-800 leading-snug">
                    Irrigation completed in Field A
                  </p>
                  <p className="text-[11px] font-medium text-slate-400 mt-0.5">
                    Today, 07:30 AM
                  </p>
                </div>
              </div>

            </div>
          </div>

        </div>

      </div>

      {/* Toast Notification when crop is selected/added */}
      {cropNotice && (
        <div className="p-3.5 bg-emerald-50 border border-emerald-200 rounded-2xl flex items-center justify-between text-xs font-semibold text-emerald-800 shadow-sm animate-in slide-in-from-top-2">
          <div className="flex items-center gap-2">
            <CheckCircle2 className="w-4 h-4 text-emerald-600" />
            <span>{cropNotice}</span>
          </div>
          <button
            onClick={() => setActiveTab('crops')}
            className="text-[11px] font-bold uppercase tracking-wider text-emerald-700 hover:text-emerald-900 underline"
          >
            Open Crop Advisory
          </button>
        </div>
      )}

      {/* 4. Suggested Crops with Images (Matching Reference UI) */}
      <div className="space-y-4 pt-2">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2">
          <div>
            <div className="flex items-center gap-2">
              <h3 className="text-xl font-bold text-slate-900 font-['Outfit']">
                Suggested Crops & Market Rates
              </h3>
              <span className="text-[10px] uppercase font-extrabold px-2 py-0.5 rounded-full bg-emerald-100 text-emerald-800 border border-emerald-200">
                AI Match
              </span>
            </div>
            <p className="text-xs text-slate-500 mt-0.5">
              High-yield agronomic suggestions suited for 28°C climate, 68% moisture, and current market demand
            </p>
          </div>

          <button
            onClick={() => setActiveTab('crops')}
            className="text-xs font-semibold text-emerald-600 hover:text-emerald-700 flex items-center gap-1 shrink-0 transition-colors"
          >
            <span>View All Crops</span>
            <ArrowRight className="w-3.5 h-3.5" />
          </button>
        </div>

        {/* 4 Cards in a row matching the user's reference mockup */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-5">
          {FEATURED_CROPS.slice(0, 4).map((crop) => (
            <CropCard
              key={crop.id}
              id={crop.id}
              name={crop.name}
              description={crop.description}
              price={crop.price}
              unit={crop.unit}
              image={crop.image}
              isFavorite={crop.isFavorite}
              onSelect={(selected) => {
                setCropNotice(`Added ${selected.name} (${selected.price}/${crop.unit}) to field rotation!`);
                setTimeout(() => setCropNotice(null), 5000);
              }}
            />
          ))}
        </div>
      </div>

    </div>
  );
}
