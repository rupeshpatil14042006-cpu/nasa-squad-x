
import { useState } from "react";

import {
  detectLocation,
  fetchNASAData,
  fetchLocationName
} from "../services/nasaApi";

export default function LocationTracker({ onLocationDetected }) {
  const [location, setLocation] = useState(null);
  const [locationInfo, setLocationInfo] = useState(null);
  const [climate, setClimate] = useState(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  async function handleDetectLocation() {
    setLoading(true);
    setError("");
    setClimate(null);
    setLocationInfo(null);

    try {
      // 1. Detect GPS coordinates
      const coords = await detectLocation();

      setLocation(coords);

      // 2. Fetch nearby place name
      let placeInfo = null;

      try {
        placeInfo = await fetchLocationName(
          coords.latitude,
          coords.longitude
        );

        setLocationInfo(placeInfo);
      } catch (geocodeError) {
        console.warn(
          "Unable to retrieve location name:",
          geocodeError
        );
      }

      // 3. Update active location in App.jsx
      onLocationDetected?.({
        ...coords,
        locationInfo: placeInfo
      });

      // 4. Fetch NASA climate observations
      const nasaResult = await fetchNASAData(
        coords.latitude,
        coords.longitude
      );

      setClimate(nasaResult);

    } catch (err) {
      console.error("Location tracking error:", err);

      setError(
        err.message || "Unable to detect location"
      );
    } finally {
      setLoading(false);
    }
  }

  const locationName = locationInfo
    ? [
        locationInfo.place,
        locationInfo.district,
        locationInfo.state,
        locationInfo.country
      ]
        .filter(Boolean)
        .filter((value, index, array) =>
          array.indexOf(value) === index
        )
        .join(", ")
    : "";

  return (
    <div className="rounded-xl border border-slate-200 bg-white p-5 text-slate-800 shadow-xs">

      <h2 className="mb-3 text-sm font-bold text-slate-900 font-['Outfit']">
        Global Location Tracking & NASA Climate Sync
      </h2>

      <button
        onClick={handleDetectLocation}
        disabled={loading}
        className="rounded-xl bg-emerald-600 px-4 py-2 text-xs font-bold text-white hover:bg-emerald-700 shadow-sm transition-all disabled:opacity-50"
      >
        {loading
          ? "Fetching location and NASA data..."
          : "Detect My Location"}
      </button>

      {location && (
        <div className="mt-4 space-y-1.5 text-xs text-slate-700 bg-slate-50 p-3 rounded-lg border border-slate-200">
          <p>
            <strong className="text-slate-900">Latitude:</strong>{" "}
            {location.latitude.toFixed(4)}
          </p>

          <p>
            <strong className="text-slate-900">Longitude:</strong>{" "}
            {location.longitude.toFixed(4)}
          </p>

          <p>
            <strong className="text-slate-900">Nearby Location:</strong>{" "}
            {locationName || "Location name unavailable"}
          </p>
        </div>
      )}

      {climate && (
        <div className="mt-4 rounded-xl bg-emerald-50/70 border border-emerald-200 p-4 text-xs text-slate-800 space-y-1">
          <h3 className="mb-2 font-bold text-emerald-800">
            NASA Environmental Data
          </h3>

          <p>
            <span className="text-slate-600">Temperature:</span>{" "}
            <b className="text-emerald-900">{climate.summary?.avg_temperature_c ?? "N/A"} °C</b>
          </p>

          <p>
            <span className="text-slate-600">Rainfall:</span>{" "}
            <b className="text-cyan-800">{climate.summary?.total_rainfall_mm ?? "N/A"} mm</b>
          </p>

          <p>
            <span className="text-slate-600">Humidity:</span>{" "}
            <b className="text-emerald-900">{climate.summary?.avg_humidity_percent ?? "N/A"}%</b>
          </p>

          <p className="mt-2 text-[11px] text-slate-500">
            Period: {climate.period?.start ?? "N/A"} to{" "}
            {climate.period?.end ?? "N/A"}
          </p>
          {climate.quality_warnings?.map((warning) => (
            <p key={warning} role="status" className="mt-2 text-xs text-amber-800 bg-amber-50 p-2 rounded border border-amber-200">
              {warning}
            </p>
          ))}
        </div>
      )}

      {error && (
        <p className="mt-3 text-xs text-rose-600 font-medium">
          {error}
        </p>
      )}

      <p className="mt-3 text-[11px] text-slate-400">
        Temperature and humidity: NASA POWER. Rainfall: Open-Meteo.
        Location names: © OpenStreetMap contributors.
      </p>
    </div>
  );
}
