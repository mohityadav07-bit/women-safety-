import React, { useState, useEffect } from "react";
import {
  ShieldAlert,
  Radio,
  Clock,
  PhoneCall,
  MapPin,
  CheckCircle2,
  Share2,
  Navigation,
  Building2,
  HeartPulse,
  RefreshCw,
  AlertTriangle
} from "lucide-react";
import { Header } from "./components/Header";
import { QuickDialBar } from "./components/QuickDialBar";
import { SosSection } from "./components/SosSection";
import { SafetyMap } from "./components/SafetyMap";
import { FakeCallModal } from "./components/FakeCallModal";
import { CamouflageApp } from "./components/CamouflageApp";
import { ProfileContacts } from "./components/ProfileContacts";
import { SafetyGuide } from "./components/SafetyGuide";
import {
  ActiveTab,
  UserProfile,
  SosSession,
  LocationPoint,
  SafetyReport,
  PoliceStation
} from "./types";
import { startEmergencySiren, stopEmergencySiren } from "./utils/audio";

export default function App() {
  const [activeTab, setActiveTab] = useState<ActiveTab>("sos");
  const [isCamouflaged, setIsCamouflaged] = useState(false);
  const [showFakeCallModal, setShowFakeCallModal] = useState(false);
  const [sirenActive, setSirenActive] = useState(false);

  // Core Data
  const [userProfile, setUserProfile] = useState<UserProfile>({
    name: "Sarah Jenkins",
    phone: "+1 (555) 234-5678",
    bloodGroup: "O+",
    medicalNotes: "Asthma. Allergic to Penicillin.",
    address: "742 Evergreen Terrace, Springfield",
    emergencyPin: "1234",
    camouflageCode: "911=",
    contacts: [
      {
        id: "c1",
        name: "David Jenkins",
        relation: "Father",
        phone: "+1 (555) 987-6543",
        email: "david.j@example.com",
        notifySms: true,
        notifyCall: true,
      },
      {
        id: "c2",
        name: "Maya Lin",
        relation: "Sister / Roommate",
        phone: "+1 (555) 456-7890",
        email: "maya.lin@example.com",
        notifySms: true,
        notifyCall: true,
      },
      {
        id: "c3",
        name: "Campus Security Desk",
        relation: "Security",
        phone: "+1 (555) 111-2222",
        email: "security@university.edu",
        notifySms: true,
        notifyCall: false,
      },
    ],
  });

  const [sosSession, setSosSession] = useState<SosSession | null>(null);
  const [currentLocation, setCurrentLocation] = useState<LocationPoint | null>(null);
  const [locationError, setLocationError] = useState<string | null>(null);
  const [policeStations, setPoliceStations] = useState<PoliceStation[]>([]);
  const [safetyReports, setSafetyReports] = useState<SafetyReport[]>([]);

  // Public Live Tracking Mode (when URL has ?trackingId=...)
  const [trackingId, setTrackingId] = useState<string | null>(null);
  const [publicTrackData, setPublicTrackData] = useState<any | null>(null);
  const [publicTrackError, setPublicTrackError] = useState<string | null>(null);

  // Detect ?trackingId= in URL on mount
  useEffect(() => {
    const params = new URLSearchParams(window.location.search);
    const id = params.get("trackingId");
    if (id) {
      setTrackingId(id);
      fetchPublicTrack(id);
      const interval = setInterval(() => fetchPublicTrack(id), 10000);
      return () => clearInterval(interval);
    }
  }, []);

  const fetchPublicTrack = async (id: string) => {
    try {
      const res = await fetch(`/api/tracking/${id}`);
      if (!res.ok) {
        setPublicTrackError("Tracking link expired or invalid.");
        return;
      }
      const data = await res.json();
      setPublicTrackData(data);
    } catch (err) {
      setPublicTrackError("Unable to load live track telemetry.");
    }
  };

  // Initial Data Fetching from Backend
  useEffect(() => {
    if (trackingId) return;

    fetch("/api/profile")
      .then((res) => res.json())
      .then((data) => {
        if (data && data.contacts) setUserProfile(data);
      })
      .catch(() => {});

    fetch("/api/reports")
      .then((res) => res.json())
      .then((data) => {
        if (Array.isArray(data)) setSafetyReports(data);
      })
      .catch(() => {});

    // Acquire GPS Coordinates
    acquireGPS();
  }, [trackingId]);

  const acquireGPS = () => {
    if ("geolocation" in navigator) {
      navigator.geolocation.getCurrentPosition(
        (pos) => {
          const point: LocationPoint = {
            lat: pos.coords.latitude,
            lng: pos.coords.longitude,
            accuracy: pos.coords.accuracy,
            speed: pos.coords.speed,
            heading: pos.coords.heading,
            timestamp: pos.timestamp,
          };
          setCurrentLocation(point);
          setLocationError(null);
          fetchPoliceStations(pos.coords.latitude, pos.coords.longitude);
        },
        (err) => {
          console.warn("GPS Warning:", err.message);
          setLocationError("GPS location access disabled or unavailable.");
          // Fallback location
          const fallback: LocationPoint = {
            lat: 37.7749,
            lng: -122.4194,
            accuracy: 25,
            timestamp: Date.now(),
          };
          setCurrentLocation(fallback);
          fetchPoliceStations(37.7749, -122.4194);
        },
        { enableHighAccuracy: true, timeout: 10000, maximumAge: 0 }
      );
    } else {
      setLocationError("Geolocation API not supported in browser.");
    }
  };

  const fetchPoliceStations = (lat: number, lng: number) => {
    fetch(`/api/police-stations?lat=${lat}&lng=${lng}`)
      .then((res) => res.json())
      .then((data) => {
        if (Array.isArray(data)) setPoliceStations(data);
      })
      .catch(() => {});
  };

  // Watch position in background when active SOS
  useEffect(() => {
    if (!sosSession?.active) return;

    const watchId = navigator.geolocation.watchPosition(
      (pos) => {
        const point: LocationPoint = {
          lat: pos.coords.latitude,
          lng: pos.coords.longitude,
          accuracy: pos.coords.accuracy,
          speed: pos.coords.speed,
          heading: pos.coords.heading,
          timestamp: pos.timestamp,
        };
        setCurrentLocation(point);

        // Update server live tracking
        fetch("/api/sos/location", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ sosId: sosSession.sosId, location: point }),
        }).catch(() => {});
      },
      (err) => console.warn(err),
      { enableHighAccuracy: true, timeout: 15000, maximumAge: 5000 }
    );

    return () => navigator.geolocation.clearWatch(watchId);
  }, [sosSession]);

  // Trigger SOS Handler
  const handleTriggerSos = async (location: LocationPoint, message?: string) => {
    try {
      const res = await fetch("/api/sos/trigger", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          location,
          distressMessage: message,
        }),
      });

      const data = await res.json();
      if (data.session) {
        setSosSession(data.session);
        setActiveTab("sos");
      }
    } catch (err) {
      console.error("SOS Trigger Error:", err);
    }
  };

  // Cancel SOS Handler
  const handleCancelSos = async (pin: string) => {
    if (!sosSession) return { success: false, error: "No active SOS session" };

    try {
      const res = await fetch("/api/sos/cancel", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ sosId: sosSession.sosId, pin }),
      });

      const data = await res.json();
      if (data.success) {
        setSosSession(null);
        return { success: true };
      } else {
        return { success: false, error: data.error || "Invalid Security PIN" };
      }
    } catch (err) {
      return { success: false, error: "Network error deactivating SOS" };
    }
  };

  // Save Profile Handler
  const handleSaveProfile = async (profile: UserProfile) => {
    try {
      const res = await fetch("/api/profile", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(profile),
      });

      const data = await res.json();
      if (data.profile) {
        setUserProfile(data.profile);
      }
    } catch (err) {
      console.error("Profile save error:", err);
    }
  };

  // Add Community Report Handler
  const handleAddReport = async (report: Omit<SafetyReport, "id" | "createdAt">) => {
    try {
      const res = await fetch("/api/reports", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(report),
      });

      const data = await res.json();
      if (data.report) {
        setSafetyReports([data.report, ...safetyReports]);
      }
    } catch (err) {
      console.error("Report save error:", err);
    }
  };

  // Siren Toggle
  const handleToggleSiren = () => {
    if (sirenActive) {
      stopEmergencySiren();
      setSirenActive(false);
    } else {
      startEmergencySiren();
      setSirenActive(true);
    }
  };

  // IF PUBLIC TRACKING LINK OPENED
  if (trackingId) {
    return (
      <div className="min-h-screen bg-slate-950 text-slate-100 p-4 sm:p-8">
        <div className="max-w-3xl mx-auto space-y-6">
          <div className="bg-red-600 text-white p-4 rounded-2xl flex items-center justify-between shadow-xl animate-pulse">
            <div className="flex items-center gap-2 font-bold text-sm sm:text-base">
              <ShieldAlert className="w-6 h-6 animate-spin" />
              <span>EMERGENCY DISTRESS LIVE TELEMETRY</span>
            </div>
            <span className="text-xs bg-black/30 px-3 py-1 rounded-full font-mono">
              ID: {trackingId}
            </span>
          </div>

          {publicTrackError ? (
            <div className="bg-slate-900 border border-slate-800 p-8 rounded-3xl text-center space-y-3">
              <AlertTriangle className="w-12 h-12 text-rose-500 mx-auto" />
              <h3 className="font-extrabold text-lg text-slate-100">{publicTrackError}</h3>
              <p className="text-xs text-slate-400">
                This tracking link may have been safely deactivated by the user.
              </p>
            </div>
          ) : publicTrackData ? (
            <div className="space-y-6">
              {/* User Bio Card */}
              <div className="bg-slate-900 border border-slate-800 rounded-3xl p-6 shadow-xl space-y-4">
                <div className="flex items-center justify-between border-b border-slate-800 pb-3">
                  <div>
                    <h2 className="text-xl font-black text-white">{publicTrackData.user.name}</h2>
                    <p className="text-xs text-slate-400 font-mono">{publicTrackData.user.phone}</p>
                  </div>
                  <span
                    className={`px-3 py-1 rounded-full text-xs font-black uppercase tracking-wider ${
                      publicTrackData.active
                        ? "bg-red-500/20 text-red-400 border border-red-500/30 animate-pulse"
                        : "bg-slate-800 text-slate-400"
                    }`}
                  >
                    {publicTrackData.active ? "DISTRESS ACTIVE" : "SAFELY RESOLVED"}
                  </span>
                </div>

                <div className="grid grid-cols-2 gap-3 text-xs bg-slate-950 p-4 rounded-2xl border border-slate-800 font-mono">
                  <div>
                    <span className="text-slate-500 block text-[10px] uppercase font-sans">BLOOD GROUP</span>
                    <strong className="text-red-400 text-sm">{publicTrackData.user.bloodGroup}</strong>
                  </div>
                  <div>
                    <span className="text-slate-500 block text-[10px] uppercase font-sans font-bold">LAST GPS PING</span>
                    <strong className="text-slate-200">
                      {new Date(publicTrackData.lastUpdated).toLocaleTimeString()}
                    </strong>
                  </div>
                  <div className="col-span-2 pt-1 border-t border-slate-800/80">
                    <span className="text-slate-500 block text-[10px] uppercase font-sans">MEDICAL NOTES</span>
                    <span className="text-slate-300 font-sans">{publicTrackData.user.medicalNotes}</span>
                  </div>
                </div>
              </div>

              {/* Coordinates Map Telemetry */}
              <div className="bg-slate-900 border border-slate-800 rounded-3xl p-6 shadow-xl space-y-3">
                <h3 className="font-bold text-sm text-slate-200 flex items-center gap-2">
                  <MapPin className="w-5 h-5 text-red-400" />
                  Live GPS Position Telemetry
                </h3>

                <div className="bg-slate-950 p-4 rounded-2xl border border-slate-800 text-xs font-mono space-y-2">
                  <div className="flex justify-between">
                    <span className="text-slate-500">Latitude:</span>
                    <strong className="text-slate-100">{publicTrackData.currentLocation.lat.toFixed(6)}</strong>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-slate-500">Longitude:</span>
                    <strong className="text-slate-100">{publicTrackData.currentLocation.lng.toFixed(6)}</strong>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-slate-500">Accuracy Radius:</span>
                    <strong className="text-emerald-400">{Math.round(publicTrackData.currentLocation.accuracy)} meters</strong>
                  </div>
                </div>

                <a
                  href={`https://www.google.com/maps?q=${publicTrackData.currentLocation.lat},${publicTrackData.currentLocation.lng}`}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="w-full bg-red-600 hover:bg-red-500 text-white font-extrabold text-xs py-3 rounded-xl shadow-lg flex items-center justify-center gap-2 transition"
                >
                  <Navigation className="w-4 h-4" />
                  <span>Open Live Location on Google Maps</span>
                </a>
              </div>

              {/* Nearest Police Station */}
              {publicTrackData.nearestPoliceStation && (
                <div className="bg-slate-900 border border-slate-800 rounded-3xl p-6 shadow-xl space-y-3">
                  <h3 className="font-bold text-sm text-slate-200 flex items-center gap-2">
                    <Building2 className="w-5 h-5 text-blue-400" />
                    Nearest Police Station ({publicTrackData.nearestPoliceStation.distanceKm} km away)
                  </h3>

                  <div>
                    <h4 className="font-bold text-sm text-slate-100">{publicTrackData.nearestPoliceStation.name}</h4>
                    <p className="text-xs text-slate-400 mt-0.5">{publicTrackData.nearestPoliceStation.address}</p>
                  </div>

                  <a
                    href={`tel:${publicTrackData.nearestPoliceStation.phone}`}
                    className="w-full bg-blue-600 hover:bg-blue-500 text-white font-bold text-xs py-3 rounded-xl flex items-center justify-center gap-2 transition"
                  >
                    <PhoneCall className="w-4 h-4" />
                    <span>Call Station: {publicTrackData.nearestPoliceStation.phone}</span>
                  </a>
                </div>
              )}
            </div>
          ) : (
            <div className="text-center py-12 text-xs text-slate-400 animate-pulse">
              Fetching live distress tracking coordinates...
            </div>
          )}
        </div>
      </div>
    );
  }

  // IF CAMOUFLAGE / DISCREET MODE ACTIVE
  if (isCamouflaged) {
    return (
      <CamouflageApp
        onExitCamouflage={() => setIsCamouflaged(false)}
        onTriggerSosSecret={() => {
          const loc = currentLocation || { lat: 37.7749, lng: -122.4194, accuracy: 10, timestamp: Date.now() };
          handleTriggerSos(loc, "DISCREET CAMOUFLAGE SOS TRIGGERED");
        }}
        camouflageCode={userProfile.camouflageCode}
      />
    );
  }

  return (
    <div className="min-h-screen bg-slate-950 text-slate-100 flex flex-col font-sans">
      {/* Navigation Header */}
      <Header
        activeTab={activeTab}
        setActiveTab={setActiveTab}
        sosActive={!!sosSession?.active}
        onTriggerFakeCall={() => setShowFakeCallModal(true)}
        onToggleCamouflage={() => setIsCamouflaged(true)}
        sirenActive={sirenActive}
        onToggleSiren={handleToggleSiren}
      />

      {/* Main App Canvas */}
      <main className="flex-1 max-w-7xl w-full mx-auto px-4 sm:px-6 lg:px-8 py-6">
        {/* Always visible Direct Emergency Hotlines Bar */}
        <QuickDialBar />

        {/* Tab Content Views */}
        {activeTab === "sos" && (
          <SosSection
            userProfile={userProfile}
            sosSession={sosSession}
            onTriggerSos={handleTriggerSos}
            onCancelSos={handleCancelSos}
            currentLocation={currentLocation}
            locationError={locationError}
            onRefreshLocation={acquireGPS}
            policeStations={policeStations}
          />
        )}

        {activeTab === "map" && (
          <SafetyMap
            currentLocation={currentLocation}
            safetyReports={safetyReports}
            policeStations={policeStations}
            onAddReport={handleAddReport}
          />
        )}

        {activeTab === "fakecall" && (
          <div className="space-y-6">
            <div className="bg-slate-900 border border-slate-800 rounded-3xl p-6 text-center space-y-4">
              <div className="w-16 h-16 rounded-full bg-emerald-500/10 text-emerald-400 flex items-center justify-center mx-auto border border-emerald-500/20">
                <PhoneCall className="w-8 h-8" />
              </div>
              <h2 className="text-xl font-extrabold text-white font-display">Fake Call Situation Exit Tool</h2>
              <p className="text-xs text-slate-400 max-w-md mx-auto">
                Schedule a hyper-realistic incoming phone call to give you a natural, socially unquestionable excuse to exit unsafe or uncomfortable situations.
              </p>
              <button
                onClick={() => setShowFakeCallModal(true)}
                className="bg-emerald-600 hover:bg-emerald-500 text-white font-extrabold text-xs px-6 py-3 rounded-xl shadow-lg shadow-emerald-600/30 transition"
                id="open-fake-call-modal-btn"
              >
                Launch Call Simulator
              </button>
            </div>
          </div>
        )}

        {activeTab === "profile" && (
          <ProfileContacts userProfile={userProfile} onSaveProfile={handleSaveProfile} />
        )}

        {activeTab === "guide" && (
          <SafetyGuide sirenActive={sirenActive} onToggleSiren={handleToggleSiren} />
        )}
      </main>

      {/* Fake Call Overlay Modal */}
      <FakeCallModal isOpen={showFakeCallModal} onClose={() => setShowFakeCallModal(false)} />

      {/* Footer */}
      <footer className="bg-slate-900 border-t border-slate-800 py-6 text-center text-xs text-slate-500 space-y-1">
        <div className="font-bold text-slate-400">SafeGuard — Women's Safety & Emergency Response Engine</div>
        <p>Built for instant distress response, GPS live telemetry, and community safety.</p>
      </footer>
    </div>
  );
}
