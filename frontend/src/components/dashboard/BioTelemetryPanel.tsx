"use client";

import React from "react";
import { Heart, Activity, UserCheck } from "lucide-react";
import { useMissionStore } from "@/store/useMissionStore";

export function BioTelemetryPanel() {
  const thermal = useMissionStore((state) => state.telemetry.thermal);
  const sonarScanned = useMissionStore((state) => state.sonarScanned);

  const isDetected = thermal.humanDetected || sonarScanned;

  return (
    <div className="bg-[#08111f] border border-slate-800/90 rounded-lg p-2.5 text-slate-100 font-mono text-xs select-none shadow-md flex flex-col gap-2">
      {/* Title Bar */}
      <div className="flex items-center justify-between pb-1.5 border-b border-slate-800/80">
        <span className="font-bold text-slate-300 flex items-center gap-1.5 uppercase tracking-wider text-[10.5px]">
          <Heart className="w-3.5 h-3.5 text-pink-500 fill-pink-500" /> VICTIM BIOTELEMETRY
        </span>
        <span
          className={`text-[9px] px-1.5 py-0.5 rounded font-bold border ${
            isDetected
              ? "bg-pink-950/80 text-pink-400 border-pink-500/40 animate-pulse"
              : "bg-slate-950 text-slate-500 border-slate-800"
          }`}
        >
          {isDetected ? "● LIFE DETECTED" : "SEARCHING..."}
        </span>
      </div>

      {isDetected ? (
        <div className="flex flex-col gap-2">
          {/* Vital Readings */}
          <div className="grid grid-cols-3 gap-1.5 text-center text-[10.5px]">
            {/* Heart Rate */}
            <div className="bg-slate-950/80 p-1.5 rounded border border-slate-800 flex flex-col items-center">
              <div className="text-[9px] text-slate-400">HEART RATE</div>
              <div className="font-bold text-pink-400 text-xs mt-0.5">
                72 <span className="text-[9px] font-normal text-slate-400">BPM</span>
              </div>
            </div>

            {/* SpO2 */}
            <div className="bg-slate-950/80 p-1.5 rounded border border-slate-800 flex flex-col items-center">
              <div className="text-[9px] text-slate-400">SpO₂ (OXYGEN)</div>
              <div className="font-bold text-cyan-400 text-xs mt-0.5">
                98 <span className="text-[9px] font-normal text-slate-400">%</span>
              </div>
            </div>

            {/* Body Temp */}
            <div className="bg-slate-950/80 p-1.5 rounded border border-slate-800 flex flex-col items-center">
              <div className="text-[9px] text-slate-400">BODY TEMP</div>
              <div className="font-bold text-amber-400 text-xs mt-0.5">36.8 °C</div>
            </div>
          </div>

          {/* Animated ECG Waveform */}
          <div className="h-5 w-full bg-slate-950 rounded border border-slate-800/90 overflow-hidden flex items-center px-1">
            <svg className="w-full h-full" viewBox="0 0 200 30" preserveAspectRatio="none">
              <path
                d="M 0 15 L 40 15 L 45 10 L 50 22 L 55 5 L 60 25 L 65 15 L 120 15 L 125 10 L 130 22 L 135 5 L 140 25 L 145 15 L 200 15"
                fill="none"
                stroke="#ec4899"
                strokeWidth="1.5"
                className="animate-pulse"
              />
            </svg>
          </div>
        </div>
      ) : (
        <div className="bg-slate-950/60 p-3 rounded border border-slate-800 text-center text-slate-500 text-[10px]">
          NO ACTIVE LIFE ECHO DETECTED IN IMMEDIATE RANGE
        </div>
      )}
    </div>
  );
}
