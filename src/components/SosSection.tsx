import React, { useState, useEffect } from "react";
import {
  ShieldAlert,
  MapPin,
  CheckCircle2,
  Share2,
  Navigation,
  PhoneCall,
  Clock,
  Radio,
  Lock,
  Copy,
  AlertTriangle,
  Send,
  Building2,
  RefreshCw,
  XCircle,
  ExternalLink
} from "lucide-react";
import { UserProfile, SosSession, LocationPoint, PoliceStation } from "../types";
import { playBeep } from "../utils/audio";

interface SosSectionProps {
  userProfile: UserProfile;
  sosSession: SosSession | null;
  onTriggerSos: (location: LocationPoint, message?: string) => Promise<void>;
  onCancelSos: (pin: string) => Promise<{ success: boolean; error?: string }>;
  currentLocation: LocationPoint | null;
  locationError: string | null;
  onRefreshLocation: () => void;
  policeStations: PoliceStation[];
}

export const SosSection: React.FC<SosSectionProps> = ({
  userProfile,
  sosSession,
  onTriggerSos,
  onCancelSos,
  currentLocation,
  locationError,
  onRefreshLocation,
  policeStations,
}) => {
  const [countdown, setCountdown] = useState<number | null>(null);
  const [isPressing, setIsPressing] = useState(false);
  const [customMessage, setCustomMessage] = useState("");
  const [showCancelModal, setShowCancelModal] = useState(false);
  const [cancelPinInput, setCancelPinInput] = useState("");
  const [cancelError, setCancelError] = useState("");
  const [copiedLink, setCopiedLink] = useState(false);
  const [isTriggering, setIsTriggering] = useState(false);

  // Handle countdown timer for SOS trigger delay (3s safety abort)
  useEffect(() => {
    let timer: any = null;
    if (countdown !== null && countdown > 0) {
      playBeep(900 - countdown * 150, 0.2);
      timer = setTimeout(() => setCountdown(countdown - 1), 1000);
    } else if (countdown === 0) {
      setCountdown(null);
      executeSosTrigger();
    }
    return () => clearTimeout(timer);
  }, [countdown]);

  const initiateSosProcess = () => {
    if (sosSession?.active) return;
    playBeep(1200, 0.2);
    setCountdown(3);
  };

  const cancelCountdown = () => {
    setCountdown(null);
    playBeep(400, 0.1);
  };

  const executeSosTrigger = async () => {
    if (!currentLocation) {
      // Fallback location if permission blocked or pending
      const defaultLoc: LocationPoint = {
        lat: 37.7749,
        lng: -122.4194,
        accuracy: 15,
        timestamp: Date.now(),
      };
      setIsTriggering(true);
      await onTriggerSos(defaultLoc, customMessage);
      setIsTriggering(false);
    } else {
      setIsTriggering(true);
      await onTriggerSos(currentLocation, customMessage);
      setIsTriggering(false);
    }
  };

  const handleCancelSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setCancelError("");
    const res = await onCancelSos(cancelPinInput);
    if (res.success) {
      setShowCancelModal(false);
      setCancelPinInput("");
    } else {
      setCancelError(res.error || "Incorrect Security PIN");
    }
  };

  const copyTrackingLink = () => {
    if (!sosSession) return;
    const url = `${window.location.origin}?trackingId=${sosSession.sosId}`;
    navigator.clipboard.writeText(url);
    setCopiedLink(true);
    setTimeout(() => setCopiedLink(false), 3000);
  };

  const nearestPolice = policeStations.length > 0 ? policeStations[0] : null;

  return (
    <div className="space-y-6">
      {/* Top Hero Card with SOS Trigger */}
      <div className="relative overflow-hidden rounded-3xl bg-slate-900 border border-slate-800 p-6 sm:p-8 shadow-2xl">
        {/* Ambient Glow */}
        <div
          className={`absolute -top-24 -left-24 w-72 h-72 rounded-full blur-3xl transition-all duration-700 pointer-events-none ${
            sosSession?.active ? "bg-red-600/30 animate-pulse" : "bg-red-500/10"
          }`}
        />

        <div className="relative z-10 flex flex-col items-center text-center">
          {/* Status Label */}
          <div className="mb-4">
            {sosSession?.active ? (
              <span className="inline-flex items-center gap-2 bg-red-500/20 text-red-400 border border-red-500/40 px-4 py-1.5 rounded-full text-xs font-black tracking-wider uppercase animate-pulse">
                <Radio className="w-4 h-4 text-red-500 animate-spin" />
                DISTRESS ALARM ACTIVE — LIVE LOCATION BROADCASTING
              </span>
            ) : (
              <span className="inline-flex items-center gap-2 bg-emerald-500/10 text-emerald-400 border border-emerald-500/20 px-4 py-1.5 rounded-full text-xs font-bold tracking-wider uppercase">
                <CheckCircle2 className="w-4 h-4 text-emerald-400" />
                SYSTEM READY — TOUCH RED BUTTON IN EMERGENCY
              </span>
            )}
          </div>

          {/* Main SOS Button */}
          <div className="my-6 relative flex items-center justify-center">
            {/* Countdown Overlay Circle */}
            {countdown !== null && (
              <div className="absolute inset-0 rounded-full bg-red-600 animate-ping opacity-30 pointer-events-none" />
            )}

            <button
              onClick={sosSession?.active ? undefined : initiateSosProcess}
              disabled={isTriggering}
              className={`relative group w-48 h-48 sm:w-56 sm:h-56 rounded-full flex flex-col items-center justify-center text-white shadow-2xl transition-all duration-300 select-none ${
                sosSession?.active
                  ? "bg-gradient-to-br from-red-600 via-rose-600 to-red-700 shadow-red-600/50 ring-8 ring-red-500/30 animate-pulse"
                  : countdown !== null
                  ? "bg-amber-600 ring-8 ring-amber-500/40"
                  : "bg-gradient-to-tr from-red-700 via-red-600 to-rose-500 hover:from-red-600 hover:to-rose-400 active:scale-95 shadow-red-600/40 ring-4 ring-red-500/20"
              }`}
              id="sos-main-trigger-btn"
            >
              {countdown !== null ? (
                <div className="flex flex-col items-center">
                  <span className="text-5xl font-black font-mono animate-bounce">{countdown}</span>
                  <span className="text-xs uppercase font-extrabold tracking-widest mt-1 text-amber-200">
                    CANCEL IN {countdown}S
                  </span>
                </div>
              ) : sosSession?.active ? (
                <div className="flex flex-col items-center">
                  <ShieldAlert className="w-16 h-16 text-white mb-2 animate-bounce" />
                  <span className="text-3xl font-black font-display tracking-tight">SOS ACTIVE</span>
                  <span className="text-[11px] font-bold text-red-100 uppercase tracking-wider mt-1">
                    Help Dispatched
                  </span>
                </div>
              ) : (
                <div className="flex flex-col items-center">
                  <ShieldAlert className="w-14 h-14 sm:w-16 sm:h-16 text-white mb-1 group-hover:scale-110 transition duration-300" />
                  <span className="text-4xl sm:text-5xl font-black tracking-tight font-display">SOS</span>
                  <span className="text-[11px] font-bold text-red-100/90 tracking-widest uppercase mt-1">
                    PRESS FOR EMERGENCY
                  </span>
                </div>
              )}
            </button>
          </div>

          {/* Abort Countdown Button */}
          {countdown !== null && (
            <button
              onClick={cancelCountdown}
              className="mt-2 bg-slate-800 hover:bg-slate-700 text-slate-200 px-6 py-2.5 rounded-full text-xs font-bold border border-slate-700 flex items-center gap-2 shadow-lg transition"
              id="sos-cancel-countdown-btn"
            >
              <XCircle className="w-4 h-4 text-amber-400" />
              <span>CANCEL ACCIDENTAL TAP</span>
            </button>
          )}

          {/* Active SOS Action Controls */}
          {sosSession?.active && (
            <div className="mt-4 flex flex-wrap items-center justify-center gap-3 w-full max-w-md">
              <button
                onClick={copyTrackingLink}
                className="flex-1 bg-slate-800 hover:bg-slate-700 text-slate-100 border border-slate-700 font-bold text-xs py-3 px-4 rounded-xl flex items-center justify-center gap-2 transition"
                id="sos-share-link-btn"
              >
                {copiedLink ? (
                  <>
                    <CheckCircle2 className="w-4 h-4 text-emerald-400" />
                    <span>LINK COPIED!</span>
                  </>
                ) : (
                  <>
                    <Share2 className="w-4 h-4 text-red-400" />
                    <span>SHARE LIVE TRACK</span>
                  </>
                )}
              </button>

              <button
                onClick={() => setShowCancelModal(true)}
                className="flex-1 bg-slate-800 hover:bg-slate-700 text-rose-300 border border-rose-500/30 font-bold text-xs py-3 px-4 rounded-xl flex items-center justify-center gap-2 transition"
                id="sos-deactivate-btn"
              >
                <Lock className="w-4 h-4 text-rose-400" />
                <span>DEACTIVATE ALARM</span>
              </button>
            </div>
          )}

          {/* Optional Distress Note */}
          {!sosSession?.active && (
            <div className="w-full max-w-md mt-4">
              <input
                type="text"
                placeholder="Optional emergency note (e.g., 'In white sedan near park exit')"
                value={customMessage}
                onChange={(e) => setCustomMessage(e.target.value)}
                className="w-full bg-slate-800/80 border border-slate-700/80 rounded-xl px-4 py-2.5 text-xs text-slate-200 placeholder-slate-500 focus:outline-none focus:border-red-500 transition text-center"
                id="sos-custom-note-input"
              />
            </div>
          )}
        </div>
      </div>

      {/* GPS Location & Live Telemetry Card */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        {/* GPS Coordinates Box */}
        <div className="bg-slate-900 border border-slate-800 rounded-2xl p-5 shadow-lg relative overflow-hidden">
          <div className="flex items-center justify-between mb-3">
            <div className="flex items-center gap-2">
              <MapPin className="w-5 h-5 text-red-400" />
              <h3 className="font-bold text-sm text-slate-200">High-Precision GPS Location</h3>
            </div>
            <button
              onClick={onRefreshLocation}
              className="p-1.5 rounded-lg bg-slate-800 hover:bg-slate-700 text-slate-400 hover:text-white transition"
              title="Refresh GPS Location"
              id="refresh-gps-btn"
            >
              <RefreshCw className="w-4 h-4" />
            </button>
          </div>

          {locationError ? (
            <div className="bg-amber-500/10 border border-amber-500/20 p-3.5 rounded-xl text-xs text-amber-300 flex items-center gap-2">
              <AlertTriangle className="w-4 h-4 text-amber-400 shrink-0" />
              <span>{locationError} (Using Default Sector Coordinates)</span>
            </div>
          ) : currentLocation ? (
            <div className="space-y-3">
              <div className="grid grid-cols-2 gap-2 bg-slate-950/60 p-3 rounded-xl border border-slate-800 font-mono text-xs">
                <div>
                  <span className="text-slate-500 block text-[10px] uppercase font-sans">LATITUDE</span>
                  <span className="text-slate-200 font-bold">{currentLocation.lat.toFixed(6)}</span>
                </div>
                <div>
                  <span className="text-slate-500 block text-[10px] uppercase font-sans">LONGITUDE</span>
                  <span className="text-slate-200 font-bold">{currentLocation.lng.toFixed(6)}</span>
                </div>
              </div>

              <div className="flex items-center justify-between text-xs text-slate-400 px-1">
                <span className="flex items-center gap-1">
                  <span className="w-2 h-2 rounded-full bg-emerald-400"></span>
                  Accuracy: <strong className="text-slate-200">{Math.round(currentLocation.accuracy)} meters</strong>
                </span>
                <span className="flex items-center gap-1 text-[11px]">
                  <Clock className="w-3 h-3 text-slate-500" />
                  Updated {new Date(currentLocation.timestamp).toLocaleTimeString()}
                </span>
              </div>
            </div>
          ) : (
            <div className="flex items-center gap-2 text-xs text-slate-400 py-4 animate-pulse">
              <RefreshCw className="w-4 h-4 animate-spin text-red-400" />
              <span>Acquiring GPS satellite coordinates...</span>
            </div>
          )}
        </div>

        {/* Nearest Police Station Card */}
        <div className="bg-slate-900 border border-slate-800 rounded-2xl p-5 shadow-lg">
          <div className="flex items-center justify-between mb-3">
            <div className="flex items-center gap-2">
              <Building2 className="w-5 h-5 text-blue-400" />
              <h3 className="font-bold text-sm text-slate-200">Nearest Police Station</h3>
            </div>
            {nearestPolice && (
              <span className="text-xs font-bold bg-blue-500/20 text-blue-300 border border-blue-500/30 px-2.5 py-0.5 rounded-full">
                {nearestPolice.distanceKm} km away
              </span>
            )}
          </div>

          {nearestPolice ? (
            <div className="space-y-3">
              <div>
                <h4 className="font-bold text-sm text-slate-100">{nearestPolice.name}</h4>
                <p className="text-xs text-slate-400 mt-0.5">{nearestPolice.address}</p>
              </div>

              <div className="flex items-center gap-2 pt-1">
                <a
                  href={`tel:${nearestPolice.phone}`}
                  className="flex-1 bg-blue-600 hover:bg-blue-500 text-white text-xs font-bold py-2 px-3 rounded-xl flex items-center justify-center gap-1.5 transition shadow-md shadow-blue-600/20"
                  id="call-nearest-police-btn"
                >
                  <PhoneCall className="w-3.5 h-3.5" />
                  <span>Call Station</span>
                </a>

                <a
                  href={`https://www.google.com/maps/dir/?api=1&destination=${nearestPolice.lat},${nearestPolice.lng}`}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="flex-1 bg-slate-800 hover:bg-slate-700 text-slate-200 text-xs font-bold py-2 px-3 rounded-xl flex items-center justify-center gap-1.5 border border-slate-700 transition"
                  id="navigate-police-btn"
                >
                  <Navigation className="w-3.5 h-3.5 text-blue-400" />
                  <span>Navigate</span>
                </a>
              </div>
            </div>
          ) : (
            <p className="text-xs text-slate-500">Searching nearby emergency posts...</p>
          )}
        </div>
      </div>

      {/* Emergency Contacts Dispatch Status List */}
      <div className="bg-slate-900 border border-slate-800 rounded-2xl p-5 shadow-lg">
        <div className="flex items-center justify-between mb-4">
          <h3 className="font-bold text-sm text-slate-200 flex items-center gap-2">
            <Send className="w-4 h-4 text-red-400" />
            Configured Emergency Contacts ({userProfile.contacts.length}/3)
          </h3>
          <span className="text-xs text-slate-400">Auto SMS & Email Dispatch</span>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
          {userProfile.contacts.map((contact) => (
            <div
              key={contact.id}
              className="bg-slate-950/70 border border-slate-800 rounded-xl p-3.5 flex flex-col justify-between"
            >
              <div>
                <div className="flex items-center justify-between">
                  <span className="font-bold text-xs text-slate-200">{contact.name}</span>
                  <span className="text-[10px] bg-slate-800 text-slate-400 px-2 py-0.5 rounded font-medium">
                    {contact.relation}
                  </span>
                </div>
                <div className="text-xs text-slate-400 mt-1 font-mono">{contact.phone}</div>
              </div>

              <div className="mt-3 pt-2 border-t border-slate-800/80 flex items-center justify-between text-[11px]">
                <span className="text-slate-500">Dispatch Status</span>
                {sosSession?.active ? (
                  <span className="text-emerald-400 font-bold flex items-center gap-1">
                    <CheckCircle2 className="w-3 h-3" /> NOTIFIED
                  </span>
                ) : (
                  <span className="text-slate-400">STANDBY</span>
                )}
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* Deactivate PIN Modal */}
      {showCancelModal && (
        <div className="fixed inset-0 z-50 bg-slate-950/80 backdrop-blur-sm flex items-center justify-center p-4">
          <div className="bg-slate-900 border border-slate-800 w-full max-w-sm rounded-3xl p-6 shadow-2xl space-y-4">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-full bg-rose-500/20 flex items-center justify-center text-rose-400">
                <Lock className="w-5 h-5" />
              </div>
              <div>
                <h3 className="font-bold text-base text-slate-100">Deactivate Emergency SOS</h3>
                <p className="text-xs text-slate-400">Enter Security PIN to confirm safety</p>
              </div>
            </div>

            <form onSubmit={handleCancelSubmit} className="space-y-4">
              <div>
                <input
                  type="password"
                  placeholder="Enter Security PIN (Default: 1234)"
                  value={cancelPinInput}
                  onChange={(e) => setCancelPinInput(e.target.value)}
                  maxLength={6}
                  autoFocus
                  className="w-full bg-slate-950 border border-slate-800 rounded-xl px-4 py-3 text-center text-lg font-mono tracking-widest text-slate-100 placeholder-slate-600 focus:outline-none focus:border-red-500"
                  id="cancel-pin-input"
                />
                {cancelError && <p className="text-xs text-rose-400 font-semibold mt-1.5">{cancelError}</p>}
              </div>

              <div className="flex gap-2">
                <button
                  type="button"
                  onClick={() => setShowCancelModal(false)}
                  className="flex-1 bg-slate-800 hover:bg-slate-700 text-slate-300 font-bold text-xs py-3 rounded-xl transition"
                  id="modal-close-pin-btn"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="flex-1 bg-rose-600 hover:bg-rose-500 text-white font-bold text-xs py-3 rounded-xl shadow-lg transition"
                  id="modal-confirm-cancel-sos-btn"
                >
                  Verify & Deactivate
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};
