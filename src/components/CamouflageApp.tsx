import React, { useState } from "react";
import { Eye, ShieldAlert, Lock, ArrowLeft } from "lucide-react";
import { LocationPoint } from "../types";

interface CamouflageAppProps {
  onExitCamouflage: () => void;
  onTriggerSosSecret: (location?: LocationPoint) => void;
  camouflageCode: string;
}

export const CamouflageApp: React.FC<CamouflageAppProps> = ({
  onExitCamouflage,
  onTriggerSosSecret,
  camouflageCode = "911=",
}) => {
  const [display, setDisplay] = useState("0");
  const [expression, setExpression] = useState("");
  const [secretFeedback, setSecretFeedback] = useState(false);

  const handleDigit = (digit: string) => {
    if (display === "0" || display === "Error") {
      setDisplay(digit);
    } else {
      setDisplay(display + digit);
    }
  };

  const handleOperator = (op: string) => {
    setExpression(display + " " + op + " ");
    setDisplay("0");
  };

  const handleClear = () => {
    setDisplay("0");
    setExpression("");
  };

  const handleEquals = () => {
    const fullExpr = expression + display + "=";

    // Check if secret code entered (e.g., 911= or display is 911)
    if (
      display === "911" ||
      fullExpr.replaceAll(" ", "").includes(camouflageCode) ||
      (display === camouflageCode.replace("=", ""))
    ) {
      setSecretFeedback(true);
      onTriggerSosSecret();
      setTimeout(() => {
        onExitCamouflage();
      }, 800);
      return;
    }

    try {
      // Evaluate standard calculator expression safely
      const cleanExpr = (expression + display).replaceAll("×", "*").replaceAll("÷", "/");
      // Basic math parser
      const result = Function(`"use strict"; return (${cleanExpr})`)();
      setDisplay(String(result));
      setExpression("");
    } catch (err) {
      setDisplay("Error");
    }
  };

  return (
    <div className="min-h-screen bg-slate-950 text-white flex flex-col items-center justify-center p-4">
      {/* Top Disguise Header */}
      <div className="w-full max-w-sm flex items-center justify-between mb-4 px-2">
        <div className="flex items-center gap-2">
          <div className="w-2.5 h-2.5 rounded-full bg-slate-600"></div>
          <span className="text-xs font-mono text-slate-500 font-bold uppercase tracking-widest">
            Standard Calc v2.4
          </span>
        </div>

        <button
          onClick={onExitCamouflage}
          className="text-slate-600 hover:text-slate-300 p-1 transition"
          title="Exit Disguise Mode"
          id="exit-discreet-mode-btn"
        >
          <ArrowLeft className="w-4 h-4" />
        </button>
      </div>

      {/* Calculator Body */}
      <div className="w-full max-w-sm bg-slate-900 border border-slate-800 rounded-3xl p-6 shadow-2xl space-y-5 relative overflow-hidden">
        {secretFeedback && (
          <div className="absolute inset-0 bg-red-600/90 z-20 flex flex-col items-center justify-center text-white font-bold animate-pulse">
            <ShieldAlert className="w-12 h-12 mb-2" />
            <span>DISCREET SOS TRIGGERED</span>
          </div>
        )}

        {/* Display Screen */}
        <div className="bg-slate-950 p-5 rounded-2xl border border-slate-800 text-right space-y-1">
          <div className="text-xs text-slate-500 font-mono h-4">{expression}</div>
          <div className="text-4xl font-extrabold font-mono text-slate-100 tracking-tight overflow-x-auto no-scrollbar">
            {display}
          </div>
        </div>

        {/* Button Grid */}
        <div className="grid grid-cols-4 gap-3">
          {/* Row 1 */}
          <button
            onClick={handleClear}
            className="p-4 rounded-2xl bg-rose-950/40 text-rose-400 font-extrabold text-lg border border-rose-900/40 active:scale-95 transition"
            id="calc-btn-ac"
          >
            AC
          </button>
          <button
            onClick={() => setDisplay(String(parseFloat(display) * -1))}
            className="p-4 rounded-2xl bg-slate-800 text-slate-300 font-bold text-lg border border-slate-700 active:scale-95 transition"
            id="calc-btn-pm"
          >
            ±
          </button>
          <button
            onClick={() => setDisplay(String(parseFloat(display) / 100))}
            className="p-4 rounded-2xl bg-slate-800 text-slate-300 font-bold text-lg border border-slate-700 active:scale-95 transition"
            id="calc-btn-pct"
          >
            %
          </button>
          <button
            onClick={() => handleOperator("÷")}
            className="p-4 rounded-2xl bg-amber-600 text-white font-extrabold text-xl active:scale-95 transition"
            id="calc-btn-div"
          >
            ÷
          </button>

          {/* Row 2 */}
          <button
            onClick={() => handleDigit("7")}
            className="p-4 rounded-2xl bg-slate-800/80 hover:bg-slate-700 text-white font-bold text-xl active:scale-95 transition"
            id="calc-btn-7"
          >
            7
          </button>
          <button
            onClick={() => handleDigit("8")}
            className="p-4 rounded-2xl bg-slate-800/80 hover:bg-slate-700 text-white font-bold text-xl active:scale-95 transition"
            id="calc-btn-8"
          >
            8
          </button>
          <button
            onClick={() => handleDigit("9")}
            className="p-4 rounded-2xl bg-slate-800/80 hover:bg-slate-700 text-white font-bold text-xl active:scale-95 transition"
            id="calc-btn-9"
          >
            9
          </button>
          <button
            onClick={() => handleOperator("×")}
            className="p-4 rounded-2xl bg-amber-600 text-white font-extrabold text-xl active:scale-95 transition"
            id="calc-btn-mul"
          >
            ×
          </button>

          {/* Row 3 */}
          <button
            onClick={() => handleDigit("4")}
            className="p-4 rounded-2xl bg-slate-800/80 hover:bg-slate-700 text-white font-bold text-xl active:scale-95 transition"
            id="calc-btn-4"
          >
            4
          </button>
          <button
            onClick={() => handleDigit("5")}
            className="p-4 rounded-2xl bg-slate-800/80 hover:bg-slate-700 text-white font-bold text-xl active:scale-95 transition"
            id="calc-btn-5"
          >
            5
          </button>
          <button
            onClick={() => handleDigit("6")}
            className="p-4 rounded-2xl bg-slate-800/80 hover:bg-slate-700 text-white font-bold text-xl active:scale-95 transition"
            id="calc-btn-6"
          >
            6
          </button>
          <button
            onClick={() => handleOperator("-")}
            className="p-4 rounded-2xl bg-amber-600 text-white font-extrabold text-xl active:scale-95 transition"
            id="calc-btn-sub"
          >
            -
          </button>

          {/* Row 4 */}
          <button
            onClick={() => handleDigit("1")}
            className="p-4 rounded-2xl bg-slate-800/80 hover:bg-slate-700 text-white font-bold text-xl active:scale-95 transition"
            id="calc-btn-1"
          >
            1
          </button>
          <button
            onClick={() => handleDigit("2")}
            className="p-4 rounded-2xl bg-slate-800/80 hover:bg-slate-700 text-white font-bold text-xl active:scale-95 transition"
            id="calc-btn-2"
          >
            2
          </button>
          <button
            onClick={() => handleDigit("3")}
            className="p-4 rounded-2xl bg-slate-800/80 hover:bg-slate-700 text-white font-bold text-xl active:scale-95 transition"
            id="calc-btn-3"
          >
            3
          </button>
          <button
            onClick={() => handleOperator("+")}
            className="p-4 rounded-2xl bg-amber-600 text-white font-extrabold text-xl active:scale-95 transition"
            id="calc-btn-add"
          >
            +
          </button>

          {/* Row 5 */}
          <button
            onClick={() => handleDigit("0")}
            className="col-span-2 p-4 rounded-2xl bg-slate-800/80 hover:bg-slate-700 text-white font-bold text-xl active:scale-95 transition text-left px-6"
            id="calc-btn-0"
          >
            0
          </button>
          <button
            onClick={() => (display.includes(".") ? null : handleDigit("."))}
            className="p-4 rounded-2xl bg-slate-800/80 hover:bg-slate-700 text-white font-bold text-xl active:scale-95 transition"
            id="calc-btn-dot"
          >
            .
          </button>
          <button
            onClick={handleEquals}
            className="p-4 rounded-2xl bg-emerald-600 text-white font-extrabold text-xl active:scale-95 transition shadow-lg shadow-emerald-600/30"
            id="calc-btn-equals"
          >
            =
          </button>
        </div>

        <div className="text-[10px] text-slate-600 text-center font-mono pt-2">
          Discreet Code: <span className="text-slate-400">Type 911 and press =</span>
        </div>
      </div>
    </div>
  );
};
