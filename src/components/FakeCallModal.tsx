import React, { useState, useEffect } from "react";
import {
  Phone,
  PhoneOff,
  PhoneCall,
  Volume2,
  MicOff,
  Clock,
  User,
  Sparkles,
  X,
  Play,
  Grid
} from "lucide-react";
import { playPhoneRingtone, stopPhoneRingtone } from "../utils/audio";

interface FakeCallModalProps {
  isOpen: boolean;
  onClose: () => void;
}

export const FakeCallModal: React.FC<FakeCallModalProps> = ({ isOpen, onClose }) => {
  const [callerName, setCallerName] = useState("Dad");
  const [delaySeconds, setDelaySeconds] = useState(0);
  const [timerCountdown, setTimerCountdown] = useState<number | null>(null);

  // Call status: 'CONFIG' | 'RINGING' | 'ACTIVE'
  const [callState, setCallState] = useState<"CONFIG" | "RINGING" | "ACTIVE">("CONFIG");
  const [activeCallSeconds, setActiveCallSeconds] = useState(0);

  // Handle scheduled incoming call timer
  useEffect(() => {
    let timer: any = null;
    if (timerCountdown !== null && timerCountdown > 0) {
      timer = setTimeout(() => setTimerCountdown(timerCountdown - 1), 1000);
    } else if (timerCountdown === 0) {
      setTimerCountdown(null);
      startRinging();
    }
    return () => clearTimeout(timer);
  }, [timerCountdown]);

  // Handle active call duration timer
  useEffect(() => {
    let timer: any = null;
    if (callState === "ACTIVE") {
      timer = setInterval(() => setActiveCallSeconds((prev) => prev + 1), 1000);
    } else {
      setActiveCallSeconds(0);
    }
    return () => clearInterval(timer);
  }, [callState]);

  const scheduleCall = () => {
    if (delaySeconds === 0) {
      startRinging();
    } else {
      setTimerCountdown(delaySeconds);
    }
  };

  const startRinging = () => {
    setCallState("RINGING");
    playPhoneRingtone();
  };

  const answerCall = () => {
    stopPhoneRingtone();
    setCallState("ACTIVE");
  };

  const declineOrEndCall = () => {
    stopPhoneRingtone();
    setCallState("CONFIG");
    setTimerCountdown(null);
    onClose();
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 bg-slate-950 flex items-center justify-center p-0 sm:p-4">
      {/* CONFIGURATION SCREEN */}
      {callState === "CONFIG" && (
        <div className="bg-slate-900 border border-slate-800 w-full max-w-md rounded-3xl p-6 shadow-2xl space-y-5">
          <div className="flex items-center justify-between border-b border-slate-800 pb-3">
            <div className="flex items-center gap-2">
              <PhoneCall className="w-5 h-5 text-emerald-400" />
              <h3 className="font-extrabold text-base text-slate-100">Fake Call Situation Exit</h3>
            </div>
            <button onClick={onClose} className="p-1 text-slate-400 hover:text-white" id="fakecall-config-close">
              <X className="w-5 h-5" />
            </button>
          </div>

          {timerCountdown !== null ? (
            <div className="bg-slate-950 p-6 rounded-2xl border border-slate-800 text-center space-y-3">
              <Clock className="w-8 h-8 text-emerald-400 mx-auto animate-spin" />
              <div className="text-3xl font-black text-white font-mono">{timerCountdown}s</div>
              <p className="text-xs text-slate-400">Incoming fake call scheduled from <strong className="text-slate-200">{callerName}</strong>...</p>
              <button
                onClick={() => setTimerCountdown(null)}
                className="bg-slate-800 hover:bg-slate-700 text-slate-300 text-xs font-bold py-2 px-4 rounded-xl transition"
                id="fakecall-cancel-schedule"
              >
                Cancel Schedule
              </button>
            </div>
          ) : (
            <div className="space-y-4 text-xs">
              {/* Select Caller Preset */}
              <div>
                <label className="block text-slate-400 font-bold mb-2">Select Caller Persona</label>
                <div className="grid grid-cols-3 gap-2">
                  {["Dad", "Mom", "Police Desk", "Supervisor", "Doctor", "Roommate"].map((preset) => (
                    <button
                      key={preset}
                      type="button"
                      onClick={() => setCallerName(preset)}
                      className={`p-2.5 rounded-xl border font-bold transition text-center ${
                        callerName === preset
                          ? "bg-emerald-600/20 text-emerald-300 border-emerald-500"
                          : "bg-slate-950 text-slate-400 border-slate-800 hover:border-slate-700"
                      }`}
                      id={`caller-preset-${preset.toLowerCase().replace(/\s+/g, '-')}`}
                    >
                      {preset}
                    </button>
                  ))}
                </div>
              </div>

              {/* Custom Caller Name */}
              <div>
                <label className="block text-slate-400 font-bold mb-1">Custom Name / Number</label>
                <input
                  type="text"
                  value={callerName}
                  onChange={(e) => setCallerName(e.target.value)}
                  className="w-full bg-slate-950 border border-slate-800 rounded-xl px-3.5 py-2.5 text-slate-100 focus:outline-none focus:border-emerald-500"
                  id="custom-caller-input"
                />
              </div>

              {/* Delay Timer Selection */}
              <div>
                <label className="block text-slate-400 font-bold mb-2">Schedule Delay</label>
                <div className="grid grid-cols-4 gap-2">
                  {[
                    { label: "Instant", sec: 0 },
                    { label: "5 Sec", sec: 5 },
                    { label: "10 Sec", sec: 10 },
                    { label: "30 Sec", sec: 30 },
                  ].map((item) => (
                    <button
                      key={item.sec}
                      type="button"
                      onClick={() => setDelaySeconds(item.sec)}
                      className={`p-2 rounded-xl border font-bold transition text-center ${
                        delaySeconds === item.sec
                          ? "bg-emerald-600/20 text-emerald-300 border-emerald-500"
                          : "bg-slate-950 text-slate-400 border-slate-800"
                      }`}
                      id={`delay-sec-${item.sec}`}
                    >
                      {item.label}
                    </button>
                  ))}
                </div>
              </div>

              {/* Trigger Call */}
              <button
                onClick={scheduleCall}
                className="w-full bg-emerald-600 hover:bg-emerald-500 text-white font-extrabold py-3 rounded-xl shadow-lg shadow-emerald-600/20 transition flex items-center justify-center gap-2 text-sm mt-2"
                id="start-fake-call-btn"
              >
                <Play className="w-4 h-4 fill-white" />
                <span>{delaySeconds === 0 ? "Trigger Incoming Call Now" : `Schedule Call in ${delaySeconds}s`}</span>
              </button>
            </div>
          )}
        </div>
      )}

      {/* FULLSCREEN INCOMING RINGING CALL SCREEN */}
      {callState === "RINGING" && (
        <div className="fixed inset-0 z-50 bg-slate-950 text-white flex flex-col justify-between p-8 sm:p-12 animate-fadeIn">
          {/* Top Status */}
          <div className="text-center mt-12 space-y-3">
            <span className="text-xs uppercase font-extrabold text-emerald-400 tracking-widest bg-emerald-500/10 px-3 py-1 rounded-full border border-emerald-500/20">
              INCOMING MOBILE CALL
            </span>
            <h2 className="text-4xl font-black font-display tracking-tight text-white">{callerName}</h2>
            <p className="text-sm text-slate-400 font-mono">+1 (555) 019-2831</p>
          </div>

          {/* Avatar Graphic */}
          <div className="flex justify-center my-8">
            <div className="w-32 h-32 rounded-full bg-gradient-to-tr from-emerald-600 to-teal-400 p-1 shadow-2xl animate-pulse flex items-center justify-center">
              <div className="w-full h-full rounded-full bg-slate-900 flex items-center justify-center text-white">
                <User className="w-16 h-16 text-emerald-400" />
              </div>
            </div>
          </div>

          {/* Answer / Decline Touch Controls */}
          <div className="flex items-center justify-around max-w-sm mx-auto w-full mb-8">
            {/* Decline */}
            <button
              onClick={declineOrEndCall}
              className="flex flex-col items-center gap-2 group"
              id="decline-fake-call-btn"
            >
              <div className="w-20 h-20 rounded-full bg-rose-600 hover:bg-rose-500 text-white flex items-center justify-center shadow-2xl shadow-rose-600/50 group-active:scale-90 transition">
                <PhoneOff className="w-9 h-9" />
              </div>
              <span className="text-xs font-bold text-slate-400">Decline</span>
            </button>

            {/* Answer */}
            <button
              onClick={answerCall}
              className="flex flex-col items-center gap-2 group"
              id="answer-fake-call-btn"
            >
              <div className="w-20 h-20 rounded-full bg-emerald-500 hover:bg-emerald-400 text-white flex items-center justify-center shadow-2xl shadow-emerald-500/50 group-active:scale-90 transition animate-bounce">
                <Phone className="w-9 h-9" />
              </div>
              <span className="text-xs font-bold text-emerald-400">Accept</span>
            </button>
          </div>
        </div>
      )}

      {/* ACTIVE CALL SCREEN */}
      {callState === "ACTIVE" && (
        <div className="fixed inset-0 z-50 bg-slate-950 text-white flex flex-col justify-between p-8 sm:p-12">
          {/* Header info */}
          <div className="text-center mt-12 space-y-2">
            <h2 className="text-3xl font-black font-display text-white">{callerName}</h2>
            <div className="text-lg font-mono text-emerald-400 font-bold">
              {Math.floor(activeCallSeconds / 60)
                .toString()
                .padStart(2, "0")}
              :
              {(activeCallSeconds % 60).toString().padStart(2, "0")}
            </div>
          </div>

          {/* Simulated Dialogue Graphic */}
          <div className="my-auto text-center max-w-sm mx-auto bg-slate-900/80 p-6 rounded-3xl border border-slate-800 space-y-3">
            <div className="flex justify-center gap-1">
              {[12, 24, 18, 30, 16, 28, 10].map((h, i) => (
                <div
                  key={i}
                  className="w-1.5 bg-emerald-400 rounded-full animate-pulse"
                  style={{ height: `${h}px`, animationDelay: `${i * 0.15}s` }}
                />
              ))}
            </div>
            <p className="text-xs text-slate-300 italic">
              "Hey! Where are you right now? I'm waiting nearby to pick you up. Let me know as soon as you're outside."
            </p>
          </div>

          {/* Call Controls & End Button */}
          <div className="space-y-6 max-w-sm mx-auto w-full mb-8">
            <div className="grid grid-cols-3 gap-4 text-slate-400">
              <button className="flex flex-col items-center gap-1.5 p-3 rounded-2xl bg-slate-900 border border-slate-800">
                <MicOff className="w-5 h-5 text-slate-300" />
                <span className="text-[10px] font-bold">Mute</span>
              </button>
              <button className="flex flex-col items-center gap-1.5 p-3 rounded-2xl bg-slate-900 border border-slate-800">
                <Grid className="w-5 h-5 text-slate-300" />
                <span className="text-[10px] font-bold">Keypad</span>
              </button>
              <button className="flex flex-col items-center gap-1.5 p-3 rounded-2xl bg-slate-900 border border-slate-800">
                <Volume2 className="w-5 h-5 text-emerald-400" />
                <span className="text-[10px] font-bold">Speaker</span>
              </button>
            </div>

            <button
              onClick={declineOrEndCall}
              className="w-full bg-rose-600 hover:bg-rose-500 text-white font-extrabold py-4 rounded-full shadow-2xl shadow-rose-600/50 flex items-center justify-center gap-2 text-base"
              id="end-fake-call-btn"
            >
              <PhoneOff className="w-6 h-6" />
              <span>End Call</span>
            </button>
          </div>
        </div>
      )}
    </div>
  );
};
