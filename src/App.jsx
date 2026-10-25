import React, { lazy, Suspense, useState, useEffect } from 'react';
import Sidebar from './components/Sidebar';
import AgriHeader from './components/AgriHeader';
import AgriSmartDashboard from './components/AgriSmartDashboard';
import SettingsView from './components/SettingsView';
import AuthModal from './components/AuthModal';
import MobileAppView from './components/MobileAppView';
import { subscribeToAuth, logoutUser } from './services/firebaseAuth';
import { PRESET_FIELDS } from './data/fieldsData';
import { fetchNasaPowerData } from './data/nasaDataService';
import { apiUrl } from './services/apiBase';

const SatelliteMap = lazy(() => import('./components/SatelliteMap'));
const FieldTwin3D = lazy(() => import('./components/FieldTwin3D'));
const ClimateRiskDashboard = lazy(() => import('./components/ClimateRiskDashboard'));
const CropRotationSimulator = lazy(() => import('./components/CropRotationSimulator'));
const SoilWaterHealth = lazy(() => import('./components/SoilWaterHealth'));
const ScenarioLab = lazy(() => import('./components/ScenarioLab'));
const AIAssistant = lazy(() => import('./components/AIAssistant'));
const ProfitVsResilience = lazy(() => import('./components/ProfitVsResilience'));
const NasaChallengeDossier = lazy(() => import('./components/NasaChallengeDossier'));
const GitSyncModal = lazy(() => import('./components/GitSyncModal'));
const CropAdvisoryEngine = lazy(() => import('./components/CropAdvisoryEngine'));

const TRACKED_LOCATIONS_STORAGE_KEY = 'squadx-tracked-locations';
const MAX_SAVED_TRACKED_LOCATIONS = 10;

function createTrackedField(location) {
  const fieldTemplate = PRESET_FIELDS[0];
  return {
    ...fieldTemplate,
    id: location.id,
    name: location.name,
    location: location.location,
    regionName: 'GPS-tracked location',
    lat: location.lat,
    lon: location.lon,
    accuracy: location.accuracy ?? null,
    trackedAt: location.trackedAt,
    isGpsLocation: true,
    isDemoData: false,
    totalAreaAcres: null,
    elevationMeters: null,
    currentCrop: null,
    previousCrop: null,
    activeSeason: null,
    irrigationType: null,
    soilType: null,
    soilTexture: null,
    soilIndicators: Object.fromEntries(
      Object.entries(fieldTemplate.soilIndicators).map(([key, indicator]) => [
        key,
        { ...indicator, value: null, source: 'unavailable', label: 'Not measured', status: 'unknown' },
      ]),
    ),
    satelliteHealth: {
      ...fieldTemplate.satelliteHealth,
      currentNdvi: null,
      lastMonthNdvi: null,
      changePercent: null,
      vegetationStatus: 'Not measured',
      canopyCoveragePercent: null,
      stressZonesCount: null,
      stressNotes: 'Satellite vegetation data unavailable',
      historicalNdviTimeline: [],
    },
    plots: [],
    polygonBounds: [],
  };
}

function readTrackedLocations() {
  try {
    const stored = localStorage.getItem(TRACKED_LOCATIONS_STORAGE_KEY);
    if (!stored) return [];

    const parsed = JSON.parse(stored);
    if (!Array.isArray(parsed)) {
      throw new Error('Saved tracked locations must be a list');
    }

    return parsed
      .filter((item) =>
        item
        && typeof item.id === 'string'
        && typeof item.name === 'string'
        && typeof item.location === 'string'
        && Number.isFinite(item.lat)
        && Number.isFinite(item.lon),
      )
      .slice(0, MAX_SAVED_TRACKED_LOCATIONS);
  } catch (error) {
    console.warn('Unable to load saved tracked locations:', error);
    return [];
  }
}

export default function App() {
  const [currentLang, setCurrentLang] = useState('en');
  const [locationState, setLocationState] = useState(() => {
    const trackedLocations = readTrackedLocations();
    return {
      trackedLocations,
      activeField: trackedLocations[0] ? createTrackedField(trackedLocations[0]) : PRESET_FIELDS[0],
    };
  });
  const { trackedLocations, activeField } = locationState;
  const [activeTab, setActiveTab] = useState('dashboard');
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const [hasVisitedFieldTwin, setHasVisitedFieldTwin] = useState(false);
  const [audioEnabled, setAudioEnabled] = useState(true);
  const [isGitModalOpen, setIsGitModalOpen] = useState(false);
  const [isAuthModalOpen, setIsAuthModalOpen] = useState(false);
  const [isMobileAppOpen, setIsMobileAppOpen] = useState(false);
  const [currentUser, setCurrentUser] = useState(null);

  // Subscribe to Firebase Auth state
  useEffect(() => {
    const unsubscribe = subscribeToAuth((user) => {
      setCurrentUser(user);
    });
    return () => {
      if (typeof unsubscribe === 'function') unsubscribe();
    };
  }, []);

  // Automatically launch mobile companion view with GPS if on phone screen
  useEffect(() => {
    if (window.innerWidth < 640 && !sessionStorage.getItem('mobile_view_dismissed')) {
      setIsMobileAppOpen(true);
    }
  }, []);

  const [nasaData, setNasaData] = useState(null);
  const [isLoadingNasa, setIsLoadingNasa] = useState(false);
  const [satelliteFarmData, setSatelliteFarmData] = useState({
    fieldId: null,
    geometry: null,
    areaAcres: null,
    timeline: [],
    loading: false,
    error: ""
  });
  const [soilWaterData, setSoilWaterData] = useState({
    fieldId: null,
    requestKey: "",
    geometry: null,
    data: null,
    loading: false,
    error: ""
  });
  const [soilScreeningInputs, setSoilScreeningInputs] = useState({});

  const handleTabChange = (tab) => {
    let target = tab;
    if (tab === 'satellite') target = 'fields';
    if (tab === 'advisory') target = 'crops';
    if (tab === 'soilWater') target = 'iot';
    if (tab === 'climateRisk') target = 'weather';
    if (tab === 'rotation') target = 'tasks';
    if (tab === 'profit') target = 'analytics';
    if (tab === 'fieldTwin3D' || target === 'analytics') {
      setHasVisitedFieldTwin(true);
      target = 'analytics';
    }
    setActiveTab(target);
  };

  const updateSoilScreeningInput = (key, value) => {
    if (!activeField) return;
    setSoilScreeningInputs((current) => ({
      ...current,
      [activeField.id]: {
        ...current[activeField.id],
        [key]: value,
      },
    }));
  };

  const activeSoilGeometry = satelliteFarmData.fieldId === activeField?.id
    ? satelliteFarmData.geometry
    : null;
  const soilWaterRequestKey = !activeField
    ? ''
    : activeSoilGeometry
      ? `${activeField.id}|polygon|${JSON.stringify(activeSoilGeometry)}`
      : `${activeField.id}|point|${activeField.lat},${activeField.lon}`;
  const hasSoilWaterRequest = Boolean(activeSoilGeometry)
    || (Number.isFinite(activeField?.lat) && Number.isFinite(activeField?.lon));
  const soilWaterLoading = hasSoilWaterRequest
    && soilWaterData.requestKey !== soilWaterRequestKey;
  const currentSoilWaterData = { ...soilWaterData, loading: soilWaterLoading };

  useEffect(() => {
    const geometry = activeSoilGeometry;
    const hasCoordinates = Number.isFinite(activeField?.lat) && Number.isFinite(activeField?.lon);
    if (!activeField) return;
    if (!geometry && !hasCoordinates) return;

    const controller = new AbortController();

    async function loadSoilWater() {
      try {
        const response = await fetch(apiUrl('/api/soil-water'), {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify(geometry
            ? { geometry }
            : { latitude: activeField.lat, longitude: activeField.lon }),
          signal: controller.signal
        });
        const result = await response.json();
        if (!response.ok) throw new Error(result.detail || "Soil and water data unavailable");
        setSoilWaterData({
          fieldId: activeField.id,
          requestKey: soilWaterRequestKey,
          geometry,
          data: result,
          loading: false,
          error: ""
        });
      } catch (error) {
        if (error.name !== "AbortError") {
          setSoilWaterData({
            fieldId: activeField.id,
            requestKey: soilWaterRequestKey,
            geometry,
            data: null,
            loading: false,
            error: error.message
          });
        }
      }
    }

    loadSoilWater();
    return () => controller.abort();
  }, [activeField, activeSoilGeometry, soilWaterRequestKey]);

  // Load NASA data whenever the selected coordinates change
  useEffect(() => {
    if (!activeField) return;
    let isMounted = true;

    const loadNasa = async () => {
      setIsLoadingNasa(true);
      setNasaData(null);

      try {
        const data = await fetchNasaPowerData(
          activeField.lat,
          activeField.lon,
          90
        );

        if (isMounted) {
          setNasaData(data);
        }
      } catch (err) {
        console.error('NASA data load error:', err);
      } finally {
        if (isMounted) {
          setIsLoadingNasa(false);
        }
      }
    };

    loadNasa();

    return () => {
      isMounted = false;
    };
  }, [activeField]);

  const refreshNasaData = async () => {
    if (!activeField) return;
    setIsLoadingNasa(true);

    try {
      const data = await fetchNasaPowerData(
        activeField.lat,
        activeField.lon,
        90
      );

      setNasaData(data);
    } catch (err) {
      console.error('Failed to refresh NASA data:', err);
    } finally {
      setIsLoadingNasa(false);
    }
  };

  const handleLocationDetected = (coords) => {
    const info = coords.locationInfo || {};

    const locationParts = [
      info.place,
      info.district,
      info.state,
      info.country
    ].filter(Boolean);

    const locationName = locationParts.length
      ? [...new Set(locationParts)].join(', ')
      : 'GPS Location';

    const id = `tracked-${coords.latitude.toFixed(4)}-${coords.longitude.toFixed(4)}`;
    const trackedLocation = {
      id,
      name: locationName,
      location: locationName,
      lat: coords.latitude,
      lon: coords.longitude,
      accuracy: coords.accuracy ?? null,
      trackedAt: new Date().toISOString(),
    };
    const nextTrackedLocations = [
      trackedLocation,
      ...trackedLocations.filter((item) => item.id !== id),
    ].slice(0, MAX_SAVED_TRACKED_LOCATIONS);

    try {
      localStorage.setItem(TRACKED_LOCATIONS_STORAGE_KEY, JSON.stringify(nextTrackedLocations));
    } catch (error) {
      console.error('Unable to save tracked location history:', error);
    }

    setLocationState({
      trackedLocations: nextTrackedLocations,
      activeField: createTrackedField(trackedLocation),
    });
  };

  const availableFields = [
    ...trackedLocations.map(createTrackedField),
    ...PRESET_FIELDS,
  ];

  const handleActiveFieldChange = (field) => {
    setLocationState((current) => ({ ...current, activeField: field }));
  };

  return (
    <div className="min-h-screen bg-[#f8fafc] text-slate-900 flex flex-col lg:flex-row antialiased selection:bg-emerald-500 selection:text-white">
      
      {/* 1. Left AgriSmart Sidebar */}
      <Sidebar
        activeTab={activeTab}
        setActiveTab={handleTabChange}
        isOpen={sidebarOpen}
        setIsOpen={setSidebarOpen}
      />

      {/* 2. Main Application Workspace Area */}
      <div className="flex-1 flex flex-col min-w-0 lg:pl-64 transition-all duration-300">
        
        {/* Top Header Bar */}
        <AgriHeader
          onMenuToggle={() => setSidebarOpen(!sidebarOpen)}
          activeField={activeField}
          setActiveField={handleActiveFieldChange}
          presetFields={availableFields}
          currentLang={currentLang}
          setCurrentLang={setCurrentLang}
          audioEnabled={audioEnabled}
          setAudioEnabled={setAudioEnabled}
          onOpenGitSync={() => setIsGitModalOpen(true)}
          setActiveTab={handleTabChange}
          onOpenMobileApp={() => setIsMobileAppOpen(true)}
          currentUser={currentUser}
          onOpenAuthModal={() => setIsAuthModalOpen(true)}
          onLogout={async () => {
            await logoutUser();
            setCurrentUser(null);
          }}
        />

        {/* Content Viewport */}
        <main className="flex-1 p-4 sm:p-7 max-w-[1550px] w-full mx-auto">
          <Suspense fallback={
            <div className="flex items-center justify-center min-h-[400px]">
              <div className="text-center space-y-3">
                <div className="w-10 h-10 border-4 border-emerald-600 border-t-transparent rounded-full animate-spin mx-auto" />
                <p className="text-xs font-semibold text-slate-500">Loading live farm telemetry…</p>
              </div>
            </div>
          }>

            {/* A. AgriSmart Dashboard View (Matches reference UI) */}
            {activeTab === 'dashboard' && (
              <AgriSmartDashboard
                activeField={activeField}
                setActiveTab={handleTabChange}
                nasaData={nasaData}
                satelliteFarmData={satelliteFarmData}
                soilWaterData={currentSoilWaterData}
              />
            )}

            {/* B. Fields (Satellite Map & Geoman Drawing) */}
            {activeTab === 'fields' && (
              <div className="bg-white rounded-2xl p-5 border border-slate-200/80 shadow-xs">
                <div className="mb-4">
                  <h2 className="text-xl font-bold text-slate-900 font-['Outfit']">Fields & Satellite Remote Sensing</h2>
                  <p className="text-xs text-slate-500">Draw farm parcels, analyze NDVI vegetation index & view Landsat history</p>
                </div>
                <SatelliteMap
                  key={activeField.id}
                  activeField={activeField}
                  savedFarmData={satelliteFarmData}
                  onFarmDataChange={setSatelliteFarmData}
                  currentLang={currentLang}
                />
              </div>
            )}

            {/* C. Crops (Smart Crop Advisory Engine) */}
            {activeTab === 'crops' && (
              <div className="bg-white rounded-2xl p-5 border border-slate-200/80 shadow-xs">
                <CropAdvisoryEngine
                  activeField={activeField}
                  nasaData={nasaData}
                  soilWaterData={currentSoilWaterData}
                  currentLang={currentLang}
                  audioEnabled={audioEnabled}
                />
              </div>
            )}

            {/* D. IoT Devices (Soil & Water Telemetry) */}
            {activeTab === 'iot' && (
              <div className="bg-white rounded-2xl p-5 border border-slate-200/80 shadow-xs">
                <SoilWaterHealth
                  activeField={activeField}
                  soilWaterData={currentSoilWaterData}
                  soilScreeningInputs={soilScreeningInputs[activeField.id] || {}}
                  onSoilScreeningInputChange={updateSoilScreeningInput}
                />
              </div>
            )}

            {/* E. Weather (Climate Risk Dashboard) */}
            {activeTab === 'weather' && (
              <div className="bg-white rounded-2xl p-5 border border-slate-200/80 shadow-xs">
                <ClimateRiskDashboard
                  nasaData={nasaData}
                  onRefreshNasa={refreshNasaData}
                  isLoadingNasa={isLoadingNasa}
                  activeField={activeField}
                  currentLang={currentLang}
                />
              </div>
            )}

            {/* F. Analytics (3D Field Twin & Profit Modeling) */}
            {activeTab === 'analytics' && (
              <div className="space-y-6">
                <div className="bg-white rounded-2xl p-5 border border-slate-200/80 shadow-xs">
                  <div className="mb-4 flex items-center justify-between">
                    <div>
                      <h2 className="text-xl font-bold text-slate-900 font-['Outfit']">Field Twin 3D & Digital Twin Simulation</h2>
                      <p className="text-xs text-slate-500">Spatial elevation mesh, moisture gradients, and real-time solar simulation</p>
                    </div>
                  </div>
                  <FieldTwin3D
                    key={activeField.id}
                    activeField={activeField}
                    satelliteData={satelliteFarmData.fieldId === activeField.id ? satelliteFarmData : null}
                    soilWaterData={currentSoilWaterData.fieldId === activeField.id ? currentSoilWaterData.data : null}
                    nasaData={nasaData}
                    isActive={true}
                  />
                </div>

                <div className="bg-white rounded-2xl p-5 border border-slate-200/80 shadow-xs">
                  <ProfitVsResilience
                    activeField={activeField}
                    currentLang={currentLang}
                  />
                </div>
              </div>
            )}

            {/* G. Reports (NASA Dossier & Summary) */}
            {activeTab === 'reports' && (
              <div className="bg-white rounded-2xl p-5 border border-slate-200/80 shadow-xs">
                <NasaChallengeDossier
                  activeField={activeField}
                  nasaData={nasaData}
                  onOpenGitModal={() => setIsGitModalOpen(true)}
                />
              </div>
            )}

            {/* H. Tasks (Crop Rotation & Season Simulator) */}
            {activeTab === 'tasks' && (
              <div className="bg-white rounded-2xl p-5 border border-slate-200/80 shadow-xs">
                <CropRotationSimulator
                  activeField={activeField}
                  currentLang={currentLang}
                />
              </div>
            )}

            {/* I. Settings & Farm Preferences */}
            {activeTab === 'settings' && (
              <SettingsView
                currentLang={currentLang}
                setCurrentLang={setCurrentLang}
                audioEnabled={audioEnabled}
                setAudioEnabled={setAudioEnabled}
                activeField={activeField}
                setActiveField={handleActiveFieldChange}
                presetFields={availableFields}
                onOpenGitSync={() => setIsGitModalOpen(true)}
                onLocationDetected={handleLocationDetected}
                nasaStatus={
                  isLoadingNasa
                    ? 'Syncing NASA...'
                    : nasaData
                      ? 'NASA Data Loaded'
                      : 'NASA Data Active'
                }
              />
            )}

          </Suspense>
        </main>

        {/* Git Sync Modal */}
        {isGitModalOpen && (
          <Suspense fallback={null}>
            <GitSyncModal
              isOpen={isGitModalOpen}
              onClose={() => setIsGitModalOpen(false)}
              activeField={activeField}
              nasaData={nasaData}
            />
          </Suspense>
        )}

        {/* Clean Modern Footer */}
        <footer className="border-t border-slate-200/80 bg-white py-4 px-6 text-xs text-slate-500">
          <div className="max-w-[1550px] mx-auto flex flex-col sm:flex-row items-center justify-between gap-3">
            <div className="flex items-center gap-2">
              <span className="font-bold text-slate-800 font-['Outfit']">
                AgriSmart
              </span>
              <span>•</span>
              <span className="text-slate-500">
                AI & Earth Observation Agri-Intelligence
              </span>
            </div>

            <div className="flex items-center gap-4 text-slate-500">
              <button
                onClick={() => setIsGitModalOpen(true)}
                className="hover:text-emerald-600 transition-colors cursor-pointer"
              >
                Cloud & GitHub Sync
              </button>
              <span>•</span>
              <span>NASA POWER & Earthdata Integration</span>
            </div>
          </div>
        </footer>

      </div>

      {/* 3. Firebase Authentication Modal */}
      <AuthModal
        isOpen={isAuthModalOpen}
        onClose={() => setIsAuthModalOpen(false)}
        onAuthSuccess={(user) => setCurrentUser(user)}
      />

      {/* 4. Interconnected Mobile Companion App (Auto-GPS on Startup) */}
      <MobileAppView
        isOpen={isMobileAppOpen}
        onClose={() => {
          setIsMobileAppOpen(false);
          sessionStorage.setItem('mobile_view_dismissed', 'true');
        }}
        activeField={activeField}
        onLocationDetected={handleLocationDetected}
        nasaData={nasaData}
        currentUser={currentUser}
      />

    </div>
  );
}
