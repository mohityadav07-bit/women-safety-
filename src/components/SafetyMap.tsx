import React, { useEffect, useRef, useState } from "react";
import L from "leaflet";
import {
  MapPin,
  ShieldCheck,
  AlertTriangle,
  Building2,
  PlusCircle,
  Filter,
  CheckCircle,
  X,
  Star,
  Sun,
  Eye,
  Users
} from "lucide-react";
import { LocationPoint, PoliceStation, SafetyReport } from "../types";

interface SafetyMapProps {
  currentLocation: LocationPoint | null;
  safetyReports: SafetyReport[];
  policeStations: PoliceStation[];
  onAddReport: (report: Omit<SafetyReport, "id" | "createdAt">) => Promise<void>;
}

export const SafetyMap: React.FC<SafetyMapProps> = ({
  currentLocation,
  safetyReports,
  policeStations,
  onAddReport,
}) => {
  const mapContainerRef = useRef<HTMLDivElement>(null);
  const mapInstanceRef = useRef<L.Map | null>(null);
  const markersLayerRef = useRef<L.LayerGroup | null>(null);

  const [filterType, setFilterType] = useState<"ALL" | "SAFE" | "UNSAFE" | "POLICE">("ALL");
  const [showAddModal, setShowAddModal] = useState(false);
  const [selectedReport, setSelectedReport] = useState<SafetyReport | null>(null);

  // New report form state
  const [newTitle, setNewTitle] = useState("");
  const [newCategory, setNewCategory] = useState<SafetyReport["category"]>("LIGHTING");
  const [newType, setNewType] = useState<"SAFE" | "UNSAFE">("UNSAFE");
  const [newDescription, setNewDescription] = useState("");
  const [newRating, setNewRating] = useState(3);
  const [pickedLat, setPickedLat] = useState<number | null>(null);
  const [pickedLng, setPickedLng] = useState<number | null>(null);
  const [isSubmitting, setIsSubmitting] = useState(false);

  const centerLat = currentLocation?.lat || 37.7749;
  const centerLng = currentLocation?.lng || -122.4194;

  // Initialize Map
  useEffect(() => {
    if (!mapContainerRef.current) return;

    if (!mapInstanceRef.current) {
      const map = L.map(mapContainerRef.current, {
        center: [centerLat, centerLng],
        zoom: 14,
        zoomControl: false,
      });

      L.tileLayer("https://{s}.basemaps.cartocdn.com/rastertiles/voyager/{z}/{x}/{y}{r}.png", {
        attribution: '&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> & CartoDB',
        maxZoom: 19,
      }).addTo(map);

      L.control.zoom({ position: "bottomright" }).addTo(map);

      mapInstanceRef.current = map;
      markersLayerRef.current = L.layerGroup().addTo(map);

      // Click map to set pin for new report
      map.on("click", (e: L.LeafletMouseEvent) => {
        setPickedLat(e.latlng.lat);
        setPickedLng(e.latlng.lng);
      });
    }

    return () => {
      if (mapInstanceRef.current) {
        mapInstanceRef.current.remove();
        mapInstanceRef.current = null;
      }
    };
  }, []);

  // Update Markers when reports or filters change
  useEffect(() => {
    const map = mapInstanceRef.current;
    const layer = markersLayerRef.current;
    if (!map || !layer) return;

    layer.clearLayers();

    // 1. Current Location Marker
    if (currentLocation) {
      const userDiv = document.createElement("div");
      userDiv.className = "relative flex items-center justify-center w-8 h-8";
      userDiv.innerHTML = `
        <span class="animate-ping absolute inline-flex h-full w-full rounded-full bg-red-400 opacity-75"></span>
        <span class="relative inline-flex rounded-full h-5 w-5 bg-red-600 border-2 border-white shadow-lg"></span>
      `;

      const userIcon = L.divIcon({
        html: userDiv,
        className: "",
        iconSize: [32, 32],
        iconAnchor: [16, 16],
      });

      const userMarker = L.marker([currentLocation.lat, currentLocation.lng], { icon: userIcon });
      userMarker.bindTooltip("You Are Here", { permanent: false, direction: "top" });
      layer.addLayer(userMarker);
    }

    // 2. Safety Heatmap Reports
    if (filterType === "ALL" || filterType === "SAFE" || filterType === "UNSAFE") {
      safetyReports
        .filter((r) => (filterType === "ALL" ? true : r.type === filterType))
        .forEach((report) => {
          const isSafe = report.type === "SAFE";
          const el = document.createElement("div");
          el.className = `w-8 h-8 rounded-full flex items-center justify-center border-2 border-white shadow-md cursor-pointer transition transform hover:scale-125 ${
            isSafe ? "bg-emerald-500 text-white" : "bg-rose-600 text-white"
          }`;
          el.innerHTML = isSafe ? "✓" : "!";

          const icon = L.divIcon({
            html: el,
            className: "",
            iconSize: [32, 32],
            iconAnchor: [16, 16],
          });

          const marker = L.marker([report.lat, report.lng], { icon });
          marker.on("click", () => setSelectedReport(report));
          layer.addLayer(marker);
        });
    }

    // 3. Police Stations
    if (filterType === "ALL" || filterType === "POLICE") {
      policeStations.forEach((station) => {
        const el = document.createElement("div");
        el.className =
          "w-8 h-8 rounded-lg bg-blue-600 text-white flex items-center justify-center border-2 border-white shadow-md cursor-pointer font-bold text-xs";
        el.innerHTML = "👮";

        const icon = L.divIcon({
          html: el,
          className: "",
          iconSize: [32, 32],
          iconAnchor: [16, 16],
        });

        const marker = L.marker([station.lat, station.lng], { icon });
        marker.bindPopup(`
          <div style="font-family: sans-serif; font-size: 12px; color: #0f172a;">
            <strong>${station.name}</strong><br/>
            ${station.address}<br/>
            <a href="tel:${station.phone}" style="color: #2563eb; font-weight: bold;">Call: ${station.phone}</a>
          </div>
        `);
        layer.addLayer(marker);
      });
    }
  }, [currentLocation, safetyReports, policeStations, filterType]);

  const handleAddSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!newTitle.trim()) return;

    const lat = pickedLat || currentLocation?.lat || 37.7749;
    const lng = pickedLng || currentLocation?.lng || -122.4194;

    setIsSubmitting(true);
    await onAddReport({
      type: newType,
      category: newCategory,
      title: newTitle.trim(),
      description: newDescription.trim(),
      lat,
      lng,
      rating: newRating,
      author: "Community Member",
    });

    setIsSubmitting(false);
    setShowAddModal(false);
    setNewTitle("");
    setNewDescription("");
  };

  return (
    <div className="space-y-4">
      {/* Map Header & Controls */}
      <div className="bg-slate-900 border border-slate-800 rounded-2xl p-4 shadow-lg flex flex-col sm:flex-row items-center justify-between gap-3">
        <div className="flex items-center gap-2">
          <MapPin className="w-5 h-5 text-red-500" />
          <div>
            <h3 className="font-bold text-sm text-slate-100">Community Safety Heatmap</h3>
            <p className="text-xs text-slate-400">Real-time crowd-sourced safe & unsafe area reports</p>
          </div>
        </div>

        {/* Filter Pills & Add Button */}
        <div className="flex items-center gap-2 w-full sm:w-auto overflow-x-auto no-scrollbar">
          <button
            onClick={() => setFilterType("ALL")}
            className={`px-3 py-1.5 rounded-xl text-xs font-bold transition whitespace-nowrap ${
              filterType === "ALL"
                ? "bg-slate-700 text-white"
                : "bg-slate-800 text-slate-400 hover:text-slate-200"
            }`}
            id="filter-all-btn"
          >
            All Pins
          </button>
          <button
            onClick={() => setFilterType("SAFE")}
            className={`px-3 py-1.5 rounded-xl text-xs font-bold transition whitespace-nowrap flex items-center gap-1 ${
              filterType === "SAFE"
                ? "bg-emerald-600 text-white"
                : "bg-slate-800 text-emerald-400 hover:bg-slate-700"
            }`}
            id="filter-safe-btn"
          >
            <ShieldCheck className="w-3.5 h-3.5" />
            <span>Safe Havens</span>
          </button>
          <button
            onClick={() => setFilterType("UNSAFE")}
            className={`px-3 py-1.5 rounded-xl text-xs font-bold transition whitespace-nowrap flex items-center gap-1 ${
              filterType === "UNSAFE"
                ? "bg-rose-600 text-white"
                : "bg-slate-800 text-rose-400 hover:bg-slate-700"
            }`}
            id="filter-unsafe-btn"
          >
            <AlertTriangle className="w-3.5 h-3.5" />
            <span>Unsafe Zones</span>
          </button>
          <button
            onClick={() => setFilterType("POLICE")}
            className={`px-3 py-1.5 rounded-xl text-xs font-bold transition whitespace-nowrap flex items-center gap-1 ${
              filterType === "POLICE"
                ? "bg-blue-600 text-white"
                : "bg-slate-800 text-blue-400 hover:bg-slate-700"
            }`}
            id="filter-police-btn"
          >
            <Building2 className="w-3.5 h-3.5" />
            <span>Police</span>
          </button>

          <button
            onClick={() => {
              setPickedLat(currentLocation?.lat || 37.7749);
              setPickedLng(currentLocation?.lng || -122.4194);
              setShowAddModal(true);
            }}
            className="px-3.5 py-1.5 bg-red-600 hover:bg-red-500 text-white text-xs font-extrabold rounded-xl shadow-lg transition flex items-center gap-1 whitespace-nowrap ml-auto"
            id="open-add-report-modal-btn"
          >
            <PlusCircle className="w-4 h-4" />
            <span>Pin Report</span>
          </button>
        </div>
      </div>

      {/* Main Map Container */}
      <div className="relative w-full h-[480px] rounded-2xl overflow-hidden border border-slate-800 shadow-2xl bg-slate-950">
        <div ref={mapContainerRef} className="w-full h-full z-10" />

        {/* Selected Report Floating Bottom Sheet */}
        {selectedReport && (
          <div className="absolute bottom-4 left-4 right-4 z-30 bg-slate-900/95 border border-slate-800 backdrop-blur-md p-4 rounded-2xl shadow-2xl flex items-start justify-between">
            <div>
              <div className="flex items-center gap-2 mb-1">
                <span
                  className={`text-[10px] font-black uppercase px-2 py-0.5 rounded-md ${
                    selectedReport.type === "SAFE"
                      ? "bg-emerald-500/20 text-emerald-400 border border-emerald-500/30"
                      : "bg-rose-500/20 text-rose-400 border border-rose-500/30"
                  }`}
                >
                  {selectedReport.type} ZONE • {selectedReport.category}
                </span>
                <span className="text-[11px] text-slate-400">
                  {new Date(selectedReport.createdAt).toLocaleDateString()}
                </span>
              </div>
              <h4 className="font-extrabold text-sm text-slate-100">{selectedReport.title}</h4>
              <p className="text-xs text-slate-300 mt-1 max-w-xl">{selectedReport.description}</p>
            </div>
            <button
              onClick={() => setSelectedReport(null)}
              className="p-1 text-slate-400 hover:text-white"
              id="close-selected-report-btn"
            >
              <X className="w-5 h-5" />
            </button>
          </div>
        )}
      </div>

      {/* Add Safety Report Modal */}
      {showAddModal && (
        <div className="fixed inset-0 z-50 bg-slate-950/80 backdrop-blur-sm flex items-center justify-center p-4">
          <div className="bg-slate-900 border border-slate-800 w-full max-w-lg rounded-3xl p-6 shadow-2xl space-y-4 max-h-[90vh] overflow-y-auto">
            <div className="flex items-center justify-between border-b border-slate-800 pb-3">
              <h3 className="font-bold text-base text-slate-100 flex items-center gap-2">
                <PlusCircle className="w-5 h-5 text-red-500" />
                Report Location Safety
              </h3>
              <button
                onClick={() => setShowAddModal(false)}
                className="text-slate-400 hover:text-white"
                id="close-add-report-modal-btn"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <form onSubmit={handleAddSubmit} className="space-y-4 text-xs">
              {/* Type Switch */}
              <div>
                <label className="block text-slate-400 font-bold mb-1.5">Zone Classification</label>
                <div className="grid grid-cols-2 gap-2">
                  <button
                    type="button"
                    onClick={() => setNewType("SAFE")}
                    className={`p-3 rounded-xl border font-bold flex items-center justify-center gap-2 transition ${
                      newType === "SAFE"
                        ? "bg-emerald-600/20 text-emerald-300 border-emerald-500"
                        : "bg-slate-950 text-slate-400 border-slate-800"
                    }`}
                    id="type-safe-btn"
                  >
                    <ShieldCheck className="w-4 h-4 text-emerald-400" />
                    <span>SAFE ZONE / HAVEN</span>
                  </button>
                  <button
                    type="button"
                    onClick={() => setNewType("UNSAFE")}
                    className={`p-3 rounded-xl border font-bold flex items-center justify-center gap-2 transition ${
                      newType === "UNSAFE"
                        ? "bg-rose-600/20 text-rose-300 border-rose-500"
                        : "bg-slate-950 text-slate-400 border-slate-800"
                    }`}
                    id="type-unsafe-btn"
                  >
                    <AlertTriangle className="w-4 h-4 text-rose-400" />
                    <span>UNSAFE HAZARD</span>
                  </button>
                </div>
              </div>

              {/* Category */}
              <div>
                <label className="block text-slate-400 font-bold mb-1.5">Primary Factor</label>
                <select
                  value={newCategory}
                  onChange={(e) => setNewCategory(e.target.value as any)}
                  className="w-full bg-slate-950 border border-slate-800 rounded-xl px-3 py-2.5 text-slate-200 focus:outline-none focus:border-red-500"
                  id="report-category-select"
                >
                  <option value="LIGHTING">Street Lighting (Dark vs Illuminated)</option>
                  <option value="CROWD">Crowd Density / Pedestrian Presence</option>
                  <option value="POLICE_PATROL">Police Patrol / Security Guard Presence</option>
                  <option value="ISOLATED">Isolated / No Exit Alleyway</option>
                  <option value="HARASSMENT_INCIDENT">Prior Harassment Incident Reported</option>
                  <option value="SAFE_HAVEN">24/7 Open Shop / Gas Station / Safe Haven</option>
                </select>
              </div>

              {/* Title */}
              <div>
                <label className="block text-slate-400 font-bold mb-1.5">Report Title</label>
                <input
                  type="text"
                  placeholder="e.g., Unlit bus stop behind library"
                  value={newTitle}
                  onChange={(e) => setNewTitle(e.target.value)}
                  required
                  className="w-full bg-slate-950 border border-slate-800 rounded-xl px-3.5 py-2.5 text-slate-100 placeholder-slate-600 focus:outline-none focus:border-red-500"
                  id="report-title-input"
                />
              </div>

              {/* Description */}
              <div>
                <label className="block text-slate-400 font-bold mb-1.5">Description & Observations</label>
                <textarea
                  placeholder="Describe lighting conditions, CCTV availability, or safety notes..."
                  value={newDescription}
                  onChange={(e) => setNewDescription(e.target.value)}
                  rows={3}
                  className="w-full bg-slate-950 border border-slate-800 rounded-xl px-3.5 py-2.5 text-slate-100 placeholder-slate-600 focus:outline-none focus:border-red-500"
                  id="report-desc-input"
                />
              </div>

              {/* Location Coordinates picked */}
              <div className="bg-slate-950 p-3 rounded-xl border border-slate-800 text-[11px] text-slate-400">
                <span>Location Coordinates: </span>
                <strong className="text-slate-200">
                  {pickedLat?.toFixed(5)}, {pickedLng?.toFixed(5)}
                </strong>
                <span className="block text-[10px] text-slate-500 mt-0.5">
                  (Tap anywhere on map before opening modal to set precise location)
                </span>
              </div>

              {/* Submit */}
              <button
                type="submit"
                disabled={isSubmitting}
                className="w-full bg-red-600 hover:bg-red-500 text-white font-extrabold py-3 rounded-xl shadow-lg transition"
                id="submit-report-btn"
              >
                {isSubmitting ? "Pinning Report..." : "Publish Safety Report"}
              </button>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};
