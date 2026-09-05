import React from "react";
import {
  ShieldAlert,
  MapPin,
  PhoneCall,
  User,
  BookOpen,
  Volume2,
  VolumeX,
  EyeOff,
  AlertTriangle,
  Siren
} from "lucide-react";
import { ActiveTab } from "../types";

interface HeaderProps {
  activeTab: ActiveTab;
  setActiveTab: (tab: ActiveTab) => void;
  sosActive: boolean;
  onTriggerFakeCall: () => void;
  onToggleCamouflage: () => void;
  sirenActive: boolean;
  onToggleSiren: () => void;
}

export const Header: React.FC<HeaderProps> = ({
  activeTab,
  setActiveTab,
  sosActive,
  onTriggerFakeCall,
  onToggleCamouflage,
  sirenActive,
  onToggleSiren,
}) => {
  return (
    <header className="sticky top-0 z-40 bg-slate-900/95 backdrop-blur-md border-b border-slate-800 shadow-xl">
      {/* Active SOS Warning Bar */}
      {sosActive && (
        <div className="bg-gradient-to-r from-red-600 via-rose-600 to-red-600 text-white px-4 py-2 font-bold text-sm sm:text-base flex items-center justify-between animate-pulse shadow-inner">
          <div className="flex items-center gap-2">
            <ShieldAlert className="w-5 h-5 animate-spin" />
            <span>EMERGENCY SOS ACTIVE — GPS TRACKING LIVE & CONTACTS NOTIFIED</span>
          </div>
          <button
            onClick={() => setActiveTab("sos")}
            className="text-xs bg-white text-red-700 px-3 py-1 rounded-full font-extrabold hover:bg-slate-100 transition shadow"
            id="header-view-sos-btn"
          >
            VIEW DASHBOARD
          </button>
        </div>
      )}

      {/* Main Top Navigation */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex items-center justify-between h-16">
          {/* Logo */}
          <div
            className="flex items-center gap-2.5 cursor-pointer select-none"
            onClick={() => setActiveTab("sos")}
            id="brand-logo"
          >
            <div className="relative">
              <div className="w-10 h-10 rounded-xl bg-gradient-to-tr from-red-600 to-rose-500 flex items-center justify-center shadow-lg shadow-red-500/20">
                <ShieldAlert className="w-6 h-6 text-white" />
              </div>
              <span className="absolute -top-1 -right-1 flex h-3 w-3">
                <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-emerald-400 opacity-75"></span>
                <span className="relative inline-flex rounded-full h-3 w-3 bg-emerald-500"></span>
              </span>
            </div>
            <div>
              <div className="flex items-center gap-1.5">
                <h1 className="font-black text-xl tracking-tight text-white font-display">
                  Safe<span className="text-red-500">Guard</span>
                </h1>
                <span className="bg-red-500/10 text-red-400 text-[10px] font-bold px-1.5 py-0.5 rounded border border-red-500/20">
                  REAL-TIME
                </span>
              </div>
              <p className="text-[11px] text-slate-400 font-medium">Women's Emergency Response</p>
            </div>
          </div>

          {/* Quick Action Utility Buttons */}
          <div className="flex items-center gap-2 sm:gap-3">
            {/* Loud Siren Quick Toggle */}
            <button
              onClick={onToggleSiren}
              title={sirenActive ? "Silence Siren" : "Loud Emergency Siren"}
              className={`flex items-center gap-1.5 text-xs font-bold px-3 py-2 rounded-xl transition border ${
                sirenActive
                  ? "bg-amber-500 text-slate-950 border-amber-400 animate-bounce shadow-lg shadow-amber-500/30"
                  : "bg-slate-800 text-slate-300 border-slate-700 hover:bg-slate-700 hover:text-white"
              }`}
              id="header-siren-btn"
            >
              <Siren className={`w-4 h-4 ${sirenActive ? "animate-spin" : "text-amber-400"}`} />
              <span className="hidden sm:inline">{sirenActive ? "SILENCE SIREN" : "SIREN"}</span>
            </button>

            {/* Fake Call Quick Button */}
            <button
              onClick={onTriggerFakeCall}
              title="Schedule Fake Incoming Call"
              className="flex items-center gap-1.5 text-xs font-bold px-3 py-2 rounded-xl bg-slate-800 text-slate-300 border border-slate-700 hover:bg-slate-700 hover:text-white transition"
              id="header-fakecall-btn"
            >
              <PhoneCall className="w-4 h-4 text-emerald-400" />
              <span className="hidden sm:inline">FAKE CALL</span>
            </button>

            {/* Discreet Camouflage Disguise Button */}
            <button
              onClick={onToggleCamouflage}
              title="Switch to Calculator Disguise Mode"
              className="flex items-center gap-1.5 text-xs font-bold px-3 py-2 rounded-xl bg-slate-800 text-slate-300 border border-slate-700 hover:bg-slate-700 hover:text-white transition"
              id="header-discreet-btn"
            >
              <EyeOff className="w-4 h-4 text-purple-400" />
              <span className="hidden sm:inline">DISCREET</span>
            </button>
          </div>
        </div>

        {/* Bottom Tab Bar */}
        <nav className="flex space-x-1 border-t border-slate-800/80 pt-1 pb-1 overflow-x-auto no-scrollbar">
          <button
            onClick={() => setActiveTab("sos")}
            className={`flex items-center gap-2 px-3.5 py-2 text-xs sm:text-sm font-bold rounded-lg transition whitespace-nowrap ${
              activeTab === "sos"
                ? "bg-red-600/15 text-red-400 border border-red-500/30"
                : "text-slate-400 hover:text-slate-200 hover:bg-slate-800/50"
            }`}
            id="tab-sos"
          >
            <ShieldAlert className={`w-4 h-4 ${activeTab === "sos" ? "text-red-400" : ""}`} />
            <span>SOS Response</span>
          </button>

          <button
            onClick={() => setActiveTab("map")}
            className={`flex items-center gap-2 px-3.5 py-2 text-xs sm:text-sm font-bold rounded-lg transition whitespace-nowrap ${
              activeTab === "map"
                ? "bg-red-600/15 text-red-400 border border-red-500/30"
                : "text-slate-400 hover:text-slate-200 hover:bg-slate-800/50"
            }`}
            id="tab-map"
          >
            <MapPin className={`w-4 h-4 ${activeTab === "map" ? "text-red-400" : ""}`} />
            <span>Safety Heatmap</span>
          </button>

          <button
            onClick={() => setActiveTab("fakecall")}
            className={`flex items-center gap-2 px-3.5 py-2 text-xs sm:text-sm font-bold rounded-lg transition whitespace-nowrap ${
              activeTab === "fakecall"
                ? "bg-red-600/15 text-red-400 border border-red-500/30"
                : "text-slate-400 hover:text-slate-200 hover:bg-slate-800/50"
            }`}
            id="tab-fakecall"
          >
            <PhoneCall className={`w-4 h-4 ${activeTab === "fakecall" ? "text-red-400" : ""}`} />
            <span>Fake Call Escape</span>
          </button>

          <button
            onClick={() => setActiveTab("profile")}
            className={`flex items-center gap-2 px-3.5 py-2 text-xs sm:text-sm font-bold rounded-lg transition whitespace-nowrap ${
              activeTab === "profile"
                ? "bg-red-600/15 text-red-400 border border-red-500/30"
                : "text-slate-400 hover:text-slate-200 hover:bg-slate-800/50"
            }`}
            id="tab-profile"
          >
            <User className={`w-4 h-4 ${activeTab === "profile" ? "text-red-400" : ""}`} />
            <span>Contacts & Profile</span>
          </button>

          <button
            onClick={() => setActiveTab("guide")}
            className={`flex items-center gap-2 px-3.5 py-2 text-xs sm:text-sm font-bold rounded-lg transition whitespace-nowrap ${
              activeTab === "guide"
                ? "bg-red-600/15 text-red-400 border border-red-500/30"
                : "text-slate-400 hover:text-slate-200 hover:bg-slate-800/50"
            }`}
            id="tab-guide"
          >
            <BookOpen className={`w-4 h-4 ${activeTab === "guide" ? "text-red-400" : ""}`} />
            <span>Guides & Siren</span>
          </button>
        </nav>
      </div>
    </header>
  );
};
