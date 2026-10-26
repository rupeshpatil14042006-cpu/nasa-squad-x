import React, { useState } from 'react';
import { 
  CloudSun, 
  Thermometer, 
  CloudRain, 
  Sun, 
  Wind, 
  AlertTriangle, 
  ShieldAlert, 
  RefreshCw, 
  CheckCircle2, 
  TrendingUp, 
  Calendar,
  Flame,
  Droplets
} from 'lucide-react';

export default function ClimateRiskDashboard({ nasaData, onRefreshNasa, isLoadingNasa, activeField, currentLang }) {
  const [activeMetricTab, setActiveMetricTab] = useState('temp'); // 'temp' | 'rain' | 'radiation'

  const records = nasaData?.dailyRecords || [];
  const alerts = nasaData?.activeAlerts || [];
  const observedMaxTemperatures = records
    .map((record) => record.tMax)
    .filter(Number.isFinite);

  return (
    <div className="space-y-6">
      {/* 1. Header & Live NASA Status */}
      <div className="bg-white p-5 rounded-2xl border border-slate-200/90 shadow-sm flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <div className="flex items-center gap-2">
            <span className="p-2 rounded-xl bg-emerald-50 text-emerald-600 border border-emerald-200">
              <CloudSun className="w-5 h-5" />
            </span>
            <h2 className="text-lg font-bold text-slate-900 font-['Outfit']">
              Climate Risk Dashboard & Early Warnings
            </h2>
          </div>
          <p className="text-xs text-slate-500 mt-1 max-w-2xl">
            NASA POWER temperature/humidity and Open-Meteo historical precipitation for {activeField.name} ({activeField.location}).
          </p>
        </div>

        <div className="flex items-center gap-3">
          <div className="text-right text-xs">
            <span className="text-slate-400 block text-[11px]">Data Source:</span>
            <span className="text-emerald-700 font-bold">{nasaData?.source || "NASA POWER"}</span>
          </div>

          <button
            onClick={onRefreshNasa}
            disabled={isLoadingNasa}
            className="flex items-center gap-2 px-3.5 py-2 rounded-xl bg-emerald-600 hover:bg-emerald-700 text-xs font-semibold text-white shadow-sm transition-all disabled:opacity-50"
          >
            <RefreshCw className={`w-3.5 h-3.5 text-white ${isLoadingNasa ? 'animate-spin' : ''}`} />
            <span>{isLoadingNasa ? 'Fetching NASA...' : 'Sync NASA POWER'}</span>
          </button>
        </div>
      </div>

      {nasaData?.qualityWarnings?.map((warning) => (
        <p key={warning} role="status" className="rounded-lg border border-amber-300 bg-amber-50 px-4 py-3 text-xs text-amber-800 font-medium">
          {warning}
        </p>
      ))}

      {/* 2. Key Climate Health Metric Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        {/* Climate Risk Gauge */}
        <div className="bg-white p-4 rounded-xl border border-slate-200/90 shadow-sm flex items-center justify-between">
          <div>
            <p className="text-xs text-slate-500 font-medium">Field Climate Risk</p>
            <div className="flex items-baseline gap-2 mt-1">
              <span className={`text-2xl font-black font-['Outfit'] ${
                nasaData?.climateRiskLevel === 'Low' ? 'text-emerald-600' :
                nasaData?.climateRiskLevel === 'Moderate' ? 'text-amber-600' : 'text-rose-600'
              }`}>
                {nasaData?.climateRiskLevel ?? 'Unavailable'}
              </span>
              <span className="text-xs text-slate-500">({nasaData?.climateRiskScore ?? 'N/A'}/100)</span>
            </div>
            <p className="text-[11px] text-slate-500 mt-1">
              Rule-based score from available historical observations
            </p>
          </div>
          <div className={`p-3 rounded-xl border ${
            nasaData?.climateRiskLevel === 'Low' ? 'bg-emerald-50 border-emerald-200 text-emerald-600' :
            nasaData?.climateRiskLevel === 'Moderate' ? 'bg-amber-50 border-amber-200 text-amber-600' :
            'bg-rose-50 border-rose-200 text-rose-600'
          }`}>
            <ShieldAlert className="w-6 h-6" />
          </div>
        </div>

        {/* 90-Day Mean Temperature */}
        <div className="bg-white p-4 rounded-xl border border-slate-200/90 shadow-sm flex items-center justify-between">
          <div>
            <p className="text-xs text-slate-500 font-medium">90-Day Mean Temp</p>
            <div className="flex items-baseline gap-2 mt-1">
              <span className="text-2xl font-black text-amber-600 font-['Outfit']">
                {nasaData?.averageTempC != null ? `${nasaData.averageTempC}°C` : 'N/A'}
              </span>
            </div>
            <p className="text-[11px] text-slate-500 mt-1">
              Max Recorded: {observedMaxTemperatures.length ? `${Math.max(...observedMaxTemperatures)}°C` : 'N/A'}
            </p>
          </div>
          <div className="p-3 rounded-xl bg-amber-50 border border-amber-200 text-amber-600">
            <Thermometer className="w-6 h-6" />
          </div>
        </div>

        {/* Total Rainfall */}
        <div className="bg-white p-4 rounded-xl border border-slate-200/90 shadow-sm flex items-center justify-between">
          <div>
            <p className="text-xs text-slate-500 font-medium">Cumulative Rainfall</p>
            <div className="flex items-baseline gap-2 mt-1">
              <span className="text-2xl font-black text-cyan-700 font-['Outfit']">
                {nasaData?.totalPrecipitationMm != null ? `${nasaData.totalPrecipitationMm} mm` : 'N/A'}
              </span>
            </div>
            <p className="text-[11px] text-slate-500 mt-1">
              Open-Meteo daily precipitation
            </p>
          </div>
          <div className="p-3 rounded-xl bg-cyan-50 border border-cyan-200 text-cyan-600">
            <CloudRain className="w-6 h-6" />
          </div>
        </div>

        {/* Extreme Heat & Dry Spell */}
        <div className="bg-white p-4 rounded-xl border border-slate-200/90 shadow-sm flex items-center justify-between">
          <div>
            <p className="text-xs text-slate-500 font-medium">Heat & Dry Alert</p>
            <div className="flex items-baseline gap-2 mt-1">
              <span className="text-2xl font-black text-rose-600 font-['Outfit']">
                {nasaData?.longestDrySpellDays != null ? `${nasaData.longestDrySpellDays} Days` : 'N/A'}
              </span>
              <span className="text-xs text-slate-500">Dry Spell</span>
            </div>
            <p className="text-[11px] text-slate-500 mt-1">
              Extreme Heat Days (&gt;37°C): {nasaData?.extremeHeatDaysCount ?? 'N/A'}
            </p>
          </div>
          <div className="p-3 rounded-xl bg-rose-50 border border-rose-200 text-rose-600">
            <Flame className="w-6 h-6" />
          </div>
        </div>
      </div>

      {/* 3. Climate Early-Warning Active Alerts */}
      {alerts.length > 0 && (
        <div className="space-y-3">
          <h3 className="text-xs font-bold text-slate-700 uppercase tracking-wider flex items-center gap-2">
            <AlertTriangle className="w-4 h-4 text-amber-500" />
            Active Climate & Weather Advisories:
          </h3>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
            {alerts.map((alert, idx) => (
              <div 
                key={idx}
                className={`p-4 rounded-xl border flex items-start gap-3 ${
                  alert.severity === 'High' 
                    ? 'bg-rose-50 border-rose-200 text-rose-900' 
                    : 'bg-amber-50 border-amber-200 text-amber-900'
                }`}
              >
                <div className={`p-2 rounded-lg mt-0.5 ${
                  alert.severity === 'High' ? 'bg-rose-100 text-rose-600' : 'bg-amber-100 text-amber-600'
                }`}>
                  <AlertTriangle className="w-4 h-4" />
                </div>
                <div>
                  <div className="flex items-center gap-2">
                    <span className="font-bold text-sm text-slate-900">{alert.title}</span>
                    <span className="text-[10px] font-extrabold px-2 py-0.5 rounded uppercase tracking-wider bg-slate-200 text-slate-800">
                      {alert.severity} Severity
                    </span>
                  </div>
                  <p className="text-xs text-slate-600 mt-1 leading-relaxed">
                    {alert.desc}
                  </p>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* 4. Interactive 90-Day Time Series Chart */}
      <div className="bg-white p-5 rounded-2xl border border-slate-200/90 shadow-sm space-y-4">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 pb-3 border-b border-slate-100">
          <div>
            <h3 className="text-sm font-bold text-slate-900 font-['Outfit']">
              90-Day NASA POWER History (Daily Resolution)
            </h3>
            <p className="text-xs text-slate-500">
              Interactive timeline of ground temperature, precipitation, and solar radiation
            </p>
          </div>

          <div className="flex items-center bg-slate-100 border border-slate-200 rounded-xl p-1">
            <button
              onClick={() => setActiveMetricTab('temp')}
              className={`px-3 py-1.5 rounded-lg text-xs font-semibold transition-all ${
                activeMetricTab === 'temp' ? 'bg-emerald-600 text-white font-bold shadow-xs' : 'text-slate-600 hover:text-slate-900'
              }`}
            >
              Temperature (°C)
            </button>
            <button
              onClick={() => setActiveMetricTab('rain')}
              className={`px-3 py-1.5 rounded-lg text-xs font-semibold transition-all ${
                activeMetricTab === 'rain' ? 'bg-emerald-600 text-white font-bold shadow-xs' : 'text-slate-600 hover:text-slate-900'
              }`}
            >
              Rainfall (mm)
            </button>
            <button
              onClick={() => setActiveMetricTab('radiation')}
              className={`px-3 py-1.5 rounded-lg text-xs font-semibold transition-all ${
                activeMetricTab === 'radiation' ? 'bg-emerald-600 text-white font-bold shadow-xs' : 'text-slate-600 hover:text-slate-900'
              }`}
            >
              Solar & Humidity
            </button>
          </div>
        </div>

        {/* Responsive Custom SVG / Bar Visualization */}
        <div className="h-64 w-full flex items-end gap-1.5 pt-8 pb-4 px-2 overflow-x-auto bg-slate-50 rounded-xl border border-slate-200">
          {records.map((rec, idx) => {
            let heightPercent = 20;
            let barColor = 'bg-amber-400';
            let displayVal = `${rec.tAvg}°C`;

            if (activeMetricTab === 'temp') {
              // Scale from 10 to 45 deg
              heightPercent = Math.max(10, Math.min(100, ((rec.tMax - 10) / 35) * 100));
              barColor = rec.tMax >= 37 ? 'bg-rose-500' : 'bg-emerald-500';
              displayVal = `Max: ${rec.tMax}°C, Min: ${rec.tMin}°C`;
            } else if (activeMetricTab === 'rain') {
              heightPercent = Math.max(5, Math.min(100, (rec.precipitationMm / 35) * 100));
              barColor = rec.precipitationMm > 10 ? 'bg-cyan-500' : rec.precipitationMm > 0 ? 'bg-cyan-600' : 'bg-slate-200';
              displayVal = `${rec.precipitationMm} mm`;
            } else {
              heightPercent = Math.max(10, Math.min(100, (rec.humidityPercent / 100) * 100));
              barColor = 'bg-lime-500';
              displayVal = `${rec.humidityPercent}% RH`;
            }

            return (
              <div 
                key={idx} 
                className="flex-1 min-w-[20px] flex flex-col items-center justify-end h-full group relative"
              >
                {/* Hover Tooltip */}
                <div className="absolute -top-12 hidden group-hover:flex flex-col items-center z-20 pointer-events-none">
                  <div className="bg-slate-900 border border-slate-700 text-[10px] text-white px-2 py-1 rounded shadow-lg whitespace-nowrap">
                    <b>{rec.label}</b>: {displayVal}
                  </div>
                  <div className="w-1.5 h-1.5 bg-slate-900 rotate-45 -mt-0.5 border-r border-b border-slate-700"></div>
                </div>

                {/* Vertical Bar */}
                <div 
                  className={`w-full rounded-t transition-all duration-300 ${barColor} group-hover:brightness-110`}
                  style={{ height: `${heightPercent}%` }}
                />

                {/* Date Label on every 4th item */}
                {idx % 4 === 0 && (
                  <span className="text-[9px] text-slate-500 mt-2 font-mono whitespace-nowrap">
                    {rec.label}
                  </span>
                )}
              </div>
            );
          })}
        </div>

        <div className="flex items-center justify-between text-xs text-slate-500 pt-2">
          <span>Historical 90-day window · ends 10 days before today</span>
          <div className="flex items-center gap-3">
            {activeMetricTab === 'temp' && (
              <>
                <span className="flex items-center gap-1"><span className="w-2.5 h-2.5 rounded bg-emerald-500"></span> Normal Temp</span>
                <span className="flex items-center gap-1"><span className="w-2.5 h-2.5 rounded bg-rose-500"></span> Heatwave (&gt;37°C)</span>
              </>
            )}
            {activeMetricTab === 'rain' && (
              <>
                <span className="flex items-center gap-1"><span className="w-2.5 h-2.5 rounded bg-slate-300"></span> Dry Day (&lt;1mm)</span>
                <span className="flex items-center gap-1"><span className="w-2.5 h-2.5 rounded bg-cyan-500"></span> Significant Rain</span>
              </>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
