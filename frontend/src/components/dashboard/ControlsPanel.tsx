"use client";

import React, { useEffect } from "react";
import {
  ArrowUp,
  ArrowDown,
  ArrowLeft,
  ArrowRight,
  Octagon,
  Sliders,
  Gamepad,
} from "lucide-react";
import { useMissionStore } from "@/store/useMissionStore";

export function ControlsPanel() {
  const controlInputs = useMissionStore((state) => state.controlInputs);
  const setControlInput = useMissionStore((state) => state.setControlInput);
  const targetSpeed = useMissionStore((state) => state.targetSpeed);
  const setTargetSpeed = useMissionStore((state) => state.setTargetSpeed);
  const triggerEmergencyStop = useMissionStore((state) => state.triggerEmergencyStop);

  // Keyboard Event Listeners (W, A, S, D, Space, Arrows)
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.repeat) return;
      const key = e.key.toLowerCase();

      if (key === "w" || e.key === "ArrowUp") setControlInput("forward", true);
      if (key === "s" || e.key === "ArrowDown") setControlInput("backward", true);
      if (key === "a" || e.key === "ArrowLeft") setControlInput("left", true);
      if (key === "d" || e.key === "ArrowRight") setControlInput("right", true);
      if (e.key === " ") {
        e.preventDefault();
        triggerEmergencyStop();
      }
    };

    const handleKeyUp = (e: KeyboardEvent) => {
      const key = e.key.toLowerCase();
      if (key === "w" || e.key === "ArrowUp") setControlInput("forward", false);
      if (key === "s" || e.key === "ArrowDown") setControlInput("backward", false);
      if (key === "a" || e.key === "ArrowLeft") setControlInput("left", false);
      if (key === "d" || e.key === "ArrowRight") setControlInput("right", false);
    };

    window.addEventListener("keydown", handleKeyDown);
    window.addEventListener("keyup", handleKeyUp);
    return () => {
      window.removeEventListener("keydown", handleKeyDown);
      window.removeEventListener("keyup", handleKeyUp);
    };
  }, [setControlInput, triggerEmergencyStop]);

  return (
    <div className="bg-[#08111f] border border-slate-800/90 rounded-lg p-2.5 text-slate-100 font-mono text-xs select-none shadow-md flex flex-col gap-2">
      {/* Title Bar */}
      <div className="flex items-center justify-between pb-1.5 border-b border-slate-800/80">
        <span className="font-bold text-slate-300 flex items-center gap-1.5 uppercase tracking-wider text-[10.5px]">
          <Gamepad className="w-3.5 h-3.5 text-cyan-400" /> ROVER CONTROL
        </span>
        <span className="text-[9px] text-cyan-400 font-bold border border-cyan-500/30 bg-cyan-950/60 px-1.5 py-0.5 rounded">
          CONTROL MODE: MANUAL
        </span>
      </div>

      {/* Directional D-Pad Control Grid */}
      <div className="flex justify-center">
        <div className="grid grid-cols-3 gap-1 w-36">
          <div />
          <button
            onMouseDown={() => setControlInput("forward", true)}
            onMouseUp={() => setControlInput("forward", false)}
            onTouchStart={() => setControlInput("forward", true)}
            onTouchEnd={() => setControlInput("forward", false)}
            className={`p-2.5 rounded border flex flex-col items-center justify-center font-bold text-xs transition-all active:scale-95 ${
              controlInputs.forward
                ? "bg-cyan-500 text-slate-950 border-cyan-300 shadow-md animate-pulse"
                : "bg-slate-950 text-slate-200 border-slate-800 hover:border-cyan-500/50 hover:bg-slate-900"
            }`}
          >
            <ArrowUp className="w-4 h-4" />
            <span className="text-[8.5px] mt-0.5 font-bold">FWD</span>
          </button>
          <div />

          <button
            onMouseDown={() => setControlInput("left", true)}
            onMouseUp={() => setControlInput("left", false)}
            onTouchStart={() => setControlInput("left", true)}
            onTouchEnd={() => setControlInput("left", false)}
            className={`p-2.5 rounded border flex flex-col items-center justify-center font-bold text-xs transition-all active:scale-95 ${
              controlInputs.left
                ? "bg-cyan-500 text-slate-950 border-cyan-300 shadow-md animate-pulse"
                : "bg-slate-950 text-slate-200 border-slate-800 hover:border-cyan-500/50 hover:bg-slate-900"
            }`}
          >
            <ArrowLeft className="w-4 h-4" />
            <span className="text-[8.5px] mt-0.5 font-bold">LEFT</span>
          </button>

          <button
            onClick={triggerEmergencyStop}
            className={`p-1.5 rounded border flex flex-col items-center justify-center font-bold text-[9px] transition-all active:scale-95 ${
              controlInputs.emergencyStop
                ? "bg-red-600 text-white border-red-400 shadow-md animate-bounce"
                : "bg-red-950/80 text-red-400 border-red-800 hover:bg-red-900"
            }`}
            title="Emergency Brake [SPACE]"
          >
            <Octagon className="w-3.5 h-3.5 fill-current text-red-400" />
            <span className="text-[8px] mt-0.5 text-red-300 font-bold">STOP</span>
          </button>

          <button
            onMouseDown={() => setControlInput("right", true)}
            onMouseUp={() => setControlInput("right", false)}
            onTouchStart={() => setControlInput("right", true)}
            onTouchEnd={() => setControlInput("right", false)}
            className={`p-2.5 rounded border flex flex-col items-center justify-center font-bold text-xs transition-all active:scale-95 ${
              controlInputs.right
                ? "bg-cyan-500 text-slate-950 border-cyan-300 shadow-md animate-pulse"
                : "bg-slate-950 text-slate-200 border-slate-800 hover:border-cyan-500/50 hover:bg-slate-900"
            }`}
          >
            <ArrowRight className="w-4 h-4" />
            <span className="text-[8.5px] mt-0.5 font-bold">RIGHT</span>
          </button>

          <div />
          <button
            onMouseDown={() => setControlInput("backward", true)}
            onMouseUp={() => setControlInput("backward", false)}
            onTouchStart={() => setControlInput("backward", true)}
            onTouchEnd={() => setControlInput("backward", false)}
            className={`p-2.5 rounded border flex flex-col items-center justify-center font-bold text-xs transition-all active:scale-95 ${
              controlInputs.backward
                ? "bg-cyan-500 text-slate-950 border-cyan-300 shadow-md animate-pulse"
                : "bg-slate-950 text-slate-200 border-slate-800 hover:border-cyan-500/50 hover:bg-slate-900"
            }`}
          >
            <ArrowDown className="w-4 h-4" />
            <span className="text-[8.5px] mt-0.5 font-bold">REV</span>
          </button>
          <div />
        </div>
      </div>

      {/* Speed Slider & Preset Chips */}
      <div className="bg-slate-950/80 p-2 rounded border border-slate-800 flex flex-col gap-1 text-[10px]">
        <div className="flex items-center justify-between">
          <span className="text-slate-400">SPEED LIMIT</span>
          <span className="font-bold text-cyan-400">{targetSpeed.toFixed(1)} m/s</span>
        </div>

        <input
          type="range"
          min="0.5"
          max="3.5"
          step="0.1"
          value={targetSpeed}
          onChange={(e) => setTargetSpeed(parseFloat(e.target.value))}
          className="w-full accent-cyan-400 h-1 bg-slate-800 rounded cursor-pointer"
        />

        <div className="grid grid-cols-3 gap-1 mt-0.5">
          {[
            { label: "CRAWL (1.0)", val: 1.0 },
            { label: "CRUISE (2.0)", val: 2.0 },
            { label: "TURBO (3.5)", val: 3.5 },
          ].map((chip) => (
            <button
              key={chip.val}
              onClick={() => setTargetSpeed(chip.val)}
              className={`py-0.5 rounded text-[8.5px] font-bold transition-all border ${
                Math.abs(targetSpeed - chip.val) < 0.1
                  ? "bg-cyan-500 text-slate-950 border-cyan-300"
                  : "bg-slate-900 text-slate-400 border-slate-800 hover:border-slate-700"
              }`}
            >
              {chip.label}
            </button>
          ))}
        </div>
      </div>
    </div>
  );
}
