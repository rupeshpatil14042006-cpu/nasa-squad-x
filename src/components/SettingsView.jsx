import React from 'react';
import { 
  Globe2, 
  Volume2, 
  VolumeX, 
  GitBranch, 
  MapPin, 
  ShieldCheck, 
  Satellite, 
  Cpu, 
  CheckCircle2,
  RefreshCw
} from 'lucide-react';
import LocationTracker from './LocationTracker';
import { firebaseProjectInfo } from '../services/firebaseAuth';

export default function SettingsView({ 
  currentLang, 
  setCurrentLang, 
  audioEnabled, 
  setAudioEnabled, 
  activeField, 
  setActiveField, 
  presetFields, 
  onOpenGitSync,
  onLocationDetected,
  nasaStatus
}) {
  return (
    <div className="space-y-6 max-w-4xl mx-auto">
      <div>
        <h1 className="text-2xl font-bold text-slate-900 font-['Outfit']">Settings & Farm Preferences</h1>
        <p className="text-sm text-slate-500 mt-1">Configure language, audio advisory, field telemetry, and data sync</p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        
        {/* Language & Voice Advisory */}
        <div className="bg-white rounded-2xl p-6 border border-slate-200/80 shadow-xs space-y-5">
          <div className="flex items-center gap-3 pb-3 border-b border-slate-100">
            <div className="w-10 h-10 rounded-xl bg-emerald-50 text-emerald-600 flex items-center justify-center">
              <Globe2 className="w-5 h-5" />
            </div>
            <div>
              <h3 className="font-bold text-slate-900 text-sm">Localization & Language</h3>
              <p className="text-xs text-slate-500">Select language for advisories & UI</p>
            </div>
          </div>

          <div className="grid grid-cols-3 gap-2">
            {[
              { id: 'en', label: 'English', flag: '🇬🇧' },
              { id: 'mr', label: 'मराठी', flag: '🇮🇳' },
              { id: 'hi', label: 'हिन्दी', flag: '🇮🇳' }
            ].map(item => (
              <button
                key={item.id}
                onClick={() => setCurrentLang(item.id)}
                className={`p-3 rounded-xl border text-center transition-all ${
                  currentLang === item.id
                    ? 'border-emerald-500 bg-emerald-50 text-emerald-800 font-bold shadow-xs'
                    : 'border-slate-200 hover:border-slate-300 text-slate-700 bg-slate-50/50'
                }`}
              >
                <span className="text-base block">{item.flag}</span>
                <span className="text-xs mt-1 block">{item.label}</span>
              </button>
            ))}
          </div>

          <div className="pt-2">
            <div className="flex items-center justify-between p-3.5 rounded-xl bg-slate-50 border border-slate-200/80">
              <div className="flex items-center gap-3">
                {audioEnabled ? <Volume2 className="w-5 h-5 text-emerald-600" /> : <VolumeX className="w-5 h-5 text-slate-400" />}
                <div>
                  <p className="text-xs font-bold text-slate-800">Voice Audio Assistant</p>
                  <p className="text-[11px] text-slate-500">Read farm alerts & crop advice aloud</p>
                </div>
              </div>
              <button
                onClick={() => setAudioEnabled(!audioEnabled)}
                className={`relative inline-flex h-6 w-11 shrink-0 cursor-pointer rounded-full border-2 border-transparent transition-colors duration-200 ease-in-out focus:outline-none ${
                  audioEnabled ? 'bg-emerald-600' : 'bg-slate-300'
                }`}
              >
                <span
                  className={`pointer-events-none inline-block h-5 w-5 transform rounded-full bg-white shadow-sm ring-0 transition duration-200 ease-in-out ${
                    audioEnabled ? 'translate-x-5' : 'translate-x-0'
                  }`}
                />
              </button>
            </div>
          </div>
        </div>

        {/* Active Farm & GPS Location */}
        <div className="bg-white rounded-2xl p-6 border border-slate-200/80 shadow-xs space-y-5">
          <div className="flex items-center gap-3 pb-3 border-b border-slate-100">
            <div className="w-10 h-10 rounded-xl bg-blue-50 text-blue-600 flex items-center justify-center">
              <MapPin className="w-5 h-5" />
            </div>
            <div>
              <h3 className="font-bold text-slate-900 text-sm">Active Farm Location</h3>
              <p className="text-xs text-slate-500">Choose preset or detect via device GPS</p>
            </div>
          </div>

          <div>
            <label className="text-xs font-semibold text-slate-600 mb-1.5 block">Select Preset Farm Cluster</label>
            <select
              value={activeField?.id ?? ''}
              onChange={(e) => {
                const found = presetFields.find(f => f.id === e.target.value);
                if (found) setActiveField(found);
              }}
              className="w-full text-xs font-medium bg-slate-50 border border-slate-200 rounded-xl p-2.5 text-slate-800 focus:outline-none focus:ring-2 focus:ring-emerald-500/20"
            >
              {presetFields.map(f => (
                <option key={f.id} value={f.id}>{f.name} ({f.location})</option>
              ))}
            </select>
          </div>

          <div className="pt-2">
            <LocationTracker onLocationDetected={onLocationDetected} />
          </div>
        </div>

        {/* Telemetry & Satellite Data Sources */}
        <div className="bg-white rounded-2xl p-6 border border-slate-200/80 shadow-xs space-y-4">
          <div className="flex items-center gap-3 pb-3 border-b border-slate-100">
            <div className="w-10 h-10 rounded-xl bg-purple-50 text-purple-600 flex items-center justify-center">
              <Satellite className="w-5 h-5" />
            </div>
            <div>
              <h3 className="font-bold text-slate-900 text-sm">Earth Observation Feeds</h3>
              <p className="text-xs text-slate-500">NASA POWER, Landsat-8/9, SoilGrids</p>
            </div>
          </div>

          <div className="space-y-2.5">
            <div className="flex items-center justify-between p-3 rounded-xl bg-slate-50 border border-slate-100 text-xs">
              <div className="flex items-center gap-2">
                <CheckCircle2 className="w-4 h-4 text-emerald-500" />
                <span className="font-medium text-slate-800">NASA POWER Solar & Climate API</span>
              </div>
              <span className="text-[11px] font-semibold text-emerald-600 bg-emerald-50 px-2 py-0.5 rounded-full">
                {nasaStatus || 'Active'}
              </span>
            </div>

            <div className="flex items-center justify-between p-3 rounded-xl bg-slate-50 border border-slate-100 text-xs">
              <div className="flex items-center gap-2">
                <CheckCircle2 className="w-4 h-4 text-emerald-500" />
                <span className="font-medium text-slate-800">ISRIC SoilGrids 250m Resolution</span>
              </div>
              <span className="text-[11px] font-semibold text-emerald-600 bg-emerald-50 px-2 py-0.5 rounded-full">
                Connected
              </span>
            </div>

            <div className="flex items-center justify-between p-3 rounded-xl bg-slate-50 border border-slate-100 text-xs">
              <div className="flex items-center gap-2">
                <CheckCircle2 className="w-4 h-4 text-emerald-500" />
                <span className="font-medium text-slate-800">Landsat 8/9 & Sentinel-2 NDVI</span>
              </div>
              <span className="text-[11px] font-semibold text-emerald-600 bg-emerald-50 px-2 py-0.5 rounded-full">
                Connected
              </span>
            </div>

            <div className="flex items-center justify-between p-3 rounded-xl bg-emerald-50/70 border border-emerald-200 text-xs">
              <div className="flex items-center gap-2">
                <ShieldCheck className="w-4 h-4 text-emerald-600" />
                <div>
                  <span className="font-bold text-emerald-900 block">Firebase Cloud: {firebaseProjectInfo.projectName}</span>
                  <span className="text-[10px] text-emerald-700 font-mono">App ID: {firebaseProjectInfo.appId}</span>
                </div>
              </div>
              <span className="text-[11px] font-bold text-emerald-800 bg-emerald-100 px-2 py-0.5 rounded-full">
                Auto-Linked
              </span>
            </div>
          </div>
        </div>

        {/* GitHub Repository Sync */}
        <div className="bg-white rounded-2xl p-6 border border-slate-200/80 shadow-xs space-y-4">
          <div className="flex items-center gap-3 pb-3 border-b border-slate-100">
            <div className="w-10 h-10 rounded-xl bg-slate-100 text-slate-800 flex items-center justify-center">
              <GitBranch className="w-5 h-5" />
            </div>
            <div>
              <h3 className="font-bold text-slate-900 text-sm">Repository & Cloud Backup</h3>
              <p className="text-xs text-slate-500">Sync custom boundary data & ML models</p>
            </div>
          </div>

          <p className="text-xs text-slate-600 leading-relaxed">
            Synchronize your drawn parcel boundaries, local crop logs, and custom telemetry data to GitHub.
          </p>

          <button
            onClick={onOpenGitSync}
            className="w-full flex items-center justify-center gap-2 py-2.5 px-4 rounded-xl bg-emerald-600 hover:bg-emerald-700 text-white font-semibold text-xs shadow-sm transition-all"
          >
            <GitBranch className="w-4 h-4 text-white" />
            <span>Open GitHub Sync Modal</span>
          </button>
        </div>

      </div>
    </div>
  );
}
