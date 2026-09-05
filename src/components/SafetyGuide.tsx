import React, { useState } from "react";
import {
  Siren,
  PhoneCall,
  Shield,
  BookOpen,
  Volume2,
  Zap,
  Lightbulb,
  Scale,
  CheckCircle2,
  AlertTriangle,
  Info
} from "lucide-react";
import { startEmergencySiren, stopEmergencySiren } from "../utils/audio";

interface SafetyGuideProps {
  sirenActive: boolean;
  onToggleSiren: () => void;
}

export const SafetyGuide: React.FC<SafetyGuideProps> = ({ sirenActive, onToggleSiren }) => {
  const [strobeActive, setStrobeActive] = useState(false);

  const toggleStrobe = () => {
    setStrobeActive(!strobeActive);
  };

  const emergencyResources = [
    {
      title: "National Emergency Service",
      number: "112",
      description: "Single unified emergency number across India & international standards for Police, Fire, Ambulance.",
      category: "ALL EMERGENCIES",
      color: "from-red-600 to-rose-700",
    },
    {
      title: "Women's Helpline (Toll-Free)",
      number: "1091",
      description: "Dedicated 24/7 hotline for women in distress, harassment complaints, or immediate intervention.",
      category: "WOMEN SAFETY",
      color: "from-purple-600 to-pink-700",
    },
    {
      title: "Police Control Room",
      number: "100",
      description: "Direct dispatch to local precinct patrol officers and women cell patrol vehicles.",
      category: "POLICE DISPATCH",
      color: "from-blue-600 to-indigo-700",
    },
    {
      title: "Domestic Abuse Helpline",
      number: "181",
      description: "Confidential counseling, legal aid support, and safe shelter access for domestic violence victims.",
      category: "LEGAL & SHELTER",
      color: "from-emerald-600 to-teal-700",
    },
    {
      title: "Cyber Crime Helpline",
      number: "1930",
      description: "Report online stalking, non-consensual image distribution, harassment, and digital blackmail.",
      category: "CYBER CELL",
      color: "from-amber-600 to-orange-700",
    },
    {
      title: "National Commission for Women",
      number: "7827170170",
      description: "NCW 24/7 emergency WhatsApp & call helpline for legal intervention and protection.",
      category: "NATIONAL RIGHTS",
      color: "from-cyan-600 to-blue-700",
    },
  ];

  const safetyProtocols = [
    {
      title: "If You Suspect You Are Being Followed",
      steps: [
        "Change your direction or cross the street to confirm if the person alters course.",
        "Enter a well-lit 24/7 commercial store, restaurant, or gas station immediately.",
        "Press the SafeGuard Fake Call or SOS button to alert contacts & local dispatch.",
        "Avoid heading directly to your secluded home address; stay in populated areas.",
      ],
    },
    {
      title: "Rideshare & Public Transport Safety",
      steps: [
        "Verify license plate, driver face, and child-lock disengagement before getting in.",
        "Share your SafeGuard Live Tracking Link with family or roommates.",
        "Sit directly behind the driver or near the emergency exit door on buses.",
        "If driver off-routes, activate Fake Call or sound the loud Siren alarm.",
      ],
    },
    {
      title: "Digital Safety & Privacy",
      steps: [
        "Enable Discreet Camouflage Mode in SafeGuard when traveling in unknown areas.",
        "Set a 4-digit Security PIN to prevent unauthorized deactivation of SOS.",
        "Ensure high-accuracy GPS permissions are enabled for background streaming.",
      ],
    },
  ];

  return (
    <div className="space-y-6">
      {/* Strobe Light Full Screen Overlay */}
      {strobeActive && (
        <div
          onClick={toggleStrobe}
          className="fixed inset-0 z-50 bg-white animate-ping flex items-center justify-center cursor-pointer"
        >
          <div className="bg-red-600 text-white font-black text-2xl p-6 rounded-3xl shadow-2xl animate-bounce">
            FLASH STROBE SIGNAL ACTIVE — TAP ANYWHERE TO CLOSE
          </div>
        </div>
      )}

      {/* Distress Siren & Strobe Alarm Box */}
      <div className="bg-gradient-to-r from-slate-900 via-rose-950/40 to-slate-900 border border-slate-800 rounded-3xl p-6 shadow-2xl">
        <div className="flex flex-col sm:flex-row items-center justify-between gap-4">
          <div className="flex items-center gap-3 text-center sm:text-left">
            <div className="w-12 h-12 rounded-2xl bg-amber-500/10 border border-amber-500/20 text-amber-400 flex items-center justify-center">
              <Siren className={`w-6 h-6 ${sirenActive ? "animate-spin" : ""}`} />
            </div>
            <div>
              <h3 className="font-extrabold text-base text-slate-100">Distress Siren & Visual Strobe Signal</h3>
              <p className="text-xs text-slate-400">High-decibel audio alarm & flashing visual deterrent</p>
            </div>
          </div>

          <div className="flex items-center gap-3 w-full sm:w-auto">
            <button
              onClick={onToggleSiren}
              className={`flex-1 sm:flex-initial px-5 py-3 rounded-2xl font-extrabold text-xs shadow-lg transition flex items-center justify-center gap-2 ${
                sirenActive
                  ? "bg-amber-500 text-slate-950 hover:bg-amber-400 animate-bounce shadow-amber-500/30"
                  : "bg-red-600 hover:bg-red-500 text-white shadow-red-600/30"
              }`}
              id="guide-siren-toggle-btn"
            >
              <Volume2 className="w-4 h-4" />
              <span>{sirenActive ? "STOP SIREN ALARM" : "TRIGGER SIREN"}</span>
            </button>

            <button
              onClick={toggleStrobe}
              className="flex-1 sm:flex-initial bg-slate-800 hover:bg-slate-700 text-slate-200 border border-slate-700 px-4 py-3 rounded-2xl font-bold text-xs transition flex items-center justify-center gap-2"
              id="guide-strobe-btn"
            >
              <Zap className="w-4 h-4 text-amber-400" />
              <span>STROBE FLASH</span>
            </button>
          </div>
        </div>
      </div>

      {/* Emergency Hotlines Directory */}
      <div className="bg-slate-900 border border-slate-800 rounded-3xl p-6 shadow-xl">
        <div className="flex items-center justify-between border-b border-slate-800 pb-4 mb-4">
          <div className="flex items-center gap-2">
            <PhoneCall className="w-5 h-5 text-red-400" />
            <h3 className="font-extrabold text-base text-slate-100">National Emergency Directory</h3>
          </div>
          <span className="text-xs text-slate-400 font-mono">1-Tap Direct Dial</span>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          {emergencyResources.map((res, i) => (
            <div
              key={i}
              className="bg-slate-950 border border-slate-800/80 rounded-2xl p-4 flex flex-col justify-between hover:border-slate-700 transition"
            >
              <div>
                <div className="flex items-center justify-between mb-2">
                  <span className="text-[10px] font-extrabold bg-slate-800 text-slate-300 px-2 py-0.5 rounded uppercase tracking-wider">
                    {res.category}
                  </span>
                  <a
                    href={`tel:${res.number}`}
                    className="text-xs font-black bg-gradient-to-r from-red-600 to-rose-600 hover:from-red-500 hover:to-rose-500 text-white px-3 py-1 rounded-xl shadow transition"
                  >
                    CALL {res.number}
                  </a>
                </div>
                <h4 className="font-bold text-sm text-slate-100">{res.title}</h4>
                <p className="text-xs text-slate-400 mt-1 leading-relaxed">{res.description}</p>
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* Self-Defense & Emergency Action Guides */}
      <div className="bg-slate-900 border border-slate-800 rounded-3xl p-6 shadow-xl">
        <div className="flex items-center gap-2 border-b border-slate-800 pb-4 mb-4">
          <BookOpen className="w-5 h-5 text-red-400" />
          <h3 className="font-extrabold text-base text-slate-100">Action Protocols & Self-Defense Rules</h3>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          {safetyProtocols.map((proto, idx) => (
            <div key={idx} className="bg-slate-950 border border-slate-800 rounded-2xl p-4 space-y-3">
              <h4 className="font-bold text-sm text-red-400 flex items-center gap-1.5">
                <Shield className="w-4 h-4 shrink-0" />
                {proto.title}
              </h4>
              <ul className="space-y-2 text-xs text-slate-300">
                {proto.steps.map((step, sIdx) => (
                  <li key={sIdx} className="flex items-start gap-2">
                    <CheckCircle2 className="w-3.5 h-3.5 text-emerald-400 shrink-0 mt-0.5" />
                    <span>{step}</span>
                  </li>
                ))}
              </ul>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
};
