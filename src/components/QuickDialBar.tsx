import React from "react";
import { Phone, Shield, HeartPulse, ShieldAlert, AlertCircle } from "lucide-react";

export const QuickDialBar: React.FC = () => {
  const hotlines = [
    { name: "National Emergency", number: "112", icon: AlertCircle, color: "from-red-600 to-rose-700", badge: "24/7 Priority" },
    { name: "Women Helpline", number: "1091", icon: Shield, color: "from-purple-600 to-pink-700", badge: "Toll Free" },
    { name: "Police Dispatch", number: "100", icon: ShieldAlert, color: "from-blue-600 to-indigo-700", badge: "Direct Line" },
    { name: "Medical Ambulance", number: "108", icon: HeartPulse, color: "from-emerald-600 to-teal-700", badge: "Emergency" },
  ];

  return (
    <div className="my-6">
      <div className="flex items-center justify-between mb-3">
        <h3 className="text-sm font-bold text-slate-300 uppercase tracking-wider flex items-center gap-2">
          <Phone className="w-4 h-4 text-red-400" />
          Direct Emergency Hotlines
        </h3>
        <span className="text-xs text-slate-400 font-mono">Tap to Call Instantly</span>
      </div>

      <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
        {hotlines.map((h, i) => {
          const Icon = h.icon;
          return (
            <a
              key={i}
              href={`tel:${h.number}`}
              className={`group relative overflow-hidden p-3.5 rounded-2xl bg-gradient-to-br ${h.color} text-white shadow-lg hover:brightness-110 active:scale-95 transition flex flex-col justify-between border border-white/10`}
              id={`quick-dial-${h.number}`}
            >
              <div className="flex items-center justify-between mb-2">
                <Icon className="w-5 h-5 text-white/90 group-hover:scale-110 transition" />
                <span className="text-[10px] font-extrabold bg-black/30 px-2 py-0.5 rounded-full backdrop-blur-sm">
                  {h.badge}
                </span>
              </div>

              <div>
                <div className="font-extrabold text-2xl tracking-tight leading-none mb-1 font-mono">
                  {h.number}
                </div>
                <div className="text-xs font-semibold text-white/90 truncate">
                  {h.name}
                </div>
              </div>
            </a>
          );
        })}
      </div>
    </div>
  );
};
