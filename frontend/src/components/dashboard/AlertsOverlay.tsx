"use client";

import React, { useState } from "react";
import { AlertTriangle, UserCheck, Heart, X, Eye, LifeBuoy } from "lucide-react";
import { useMissionStore } from "@/store/useMissionStore";

export function AlertsOverlay() {
  const hazard = useMissionStore((state) => state.telemetry.hazard);
  const thermal = useMissionStore((state) => state.telemetry.thermal);
  const sonarScanned = useMissionStore((state) => state.sonarScanned);
  const triggerSonarScan = useMissionStore((state) => state.triggerSonarScan);
  const deployRescuePayload = useMissionStore((state) => state.deployRescuePayload);

  const [dismissed, setDismissed] = useState<boolean>(false);

  if (dismissed || (hazard.severity === "NORMAL" && !thermal.humanDetected && !sonarScanned)) return null;

  return (
    <div className="absolute top-20 left-1/2 -translate-x-1/2 z-30 flex flex-col gap-2 max-w-2xl w-full px-4 pointer-events-none select-none">
      {/* Victim Detection & Sonar Bio-Telemetry Banner (Magenta / Rose) */}
      {(thermal.humanDetected || sonarScanned) && (
        <div className="bg-[#0b0312]/95 border-2 border-rose-500 text-rose-100 p-3 rounded-xl shadow-[0_0_30px_rgba(244,63,94,0.4)] backdrop-blur-xl flex items-center justify-between pointer-events-auto">
          <div className="flex items-center gap-3">
            <div className="p-2.5 bg-rose-600 rounded-lg text-white shadow-lg animate-pulse">
              <UserCheck className="w-5 h-5 text-white" />
            </div>
            <div>
              <div className="font-bold font-mono text-xs tracking-wider text-white flex items-center gap-2">
                <span className="w-2 h-2 rounded-full bg-rose-500 animate-ping" />
                <Heart className="w-4 h-4 text-rose-400 fill-rose-400 animate-bounce" />
                LIFE SIGN DETECTED | TUNNEL C | DISTANCE: {thermal.distance > 0 ? thermal.distance.toFixed(1) : "2.8"}m
              </div>
              <div className="text-[11px] font-mono text-rose-200 mt-1 flex items-center gap-3">
                <span>HEART RATE: <strong className="text-white">72 BPM</strong></span>
                <span>SpO2: <strong className="text-white">98%</strong></span>
                <span>TEMP: <strong className="text-white">36.8°C</strong></span>
              </div>
            </div>
          </div>

          <div className="flex items-center gap-2">
            <button
              onClick={() => triggerSonarScan()}
              className="px-2.5 py-1 bg-rose-950/80 hover:bg-rose-900 border border-rose-500/60 rounded text-[10px] font-bold text-rose-200 flex items-center gap-1 transition-all"
            >
              <Eye className="w-3 h-3 text-rose-400" /> VIEW VICTIM
            </button>
            <button
              onClick={() => deployRescuePayload()}
              className="px-2.5 py-1 bg-rose-600 hover:bg-rose-500 text-white rounded text-[10px] font-bold shadow-md flex items-center gap-1 transition-all"
            >
              <LifeBuoy className="w-3 h-3" /> RESCUE ACTION
            </button>
            <button
              onClick={() => setDismissed(true)}
              className="p-1 hover:bg-rose-900/60 rounded text-rose-300 transition-colors ml-1"
              title="Dismiss Alert"
            >
              <X className="w-4 h-4" />
            </button>
          </div>
        </div>
      )}

      {/* Hazard Alert Banner (Amber / Yellow) */}
      {hazard.severity !== "NORMAL" && (
        <div
          className={`p-3 rounded-xl shadow-2xl border-2 backdrop-blur-xl flex items-center justify-between pointer-events-auto font-mono text-xs ${
            hazard.severity === "CRITICAL"
              ? "bg-[#110a03]/95 border-amber-500 text-amber-100 shadow-[0_0_25px_rgba(245,158,11,0.4)]"
              : "bg-slate-900/95 border-yellow-500 text-yellow-200"
          }`}
        >
          <div className="flex items-center gap-3">
            <div className="p-2 bg-amber-600 rounded-lg text-slate-950 font-bold">
              <AlertTriangle className="w-4 h-4 fill-current" />
            </div>
            <div>
              <div className="font-bold text-xs uppercase text-amber-300 flex items-center gap-1.5">
                <span>●</span> HAZARD ALERT: {hazard.type.replace("_", " ")}
              </div>
              <div className="text-[11px] opacity-90 mt-0.5">{hazard.description}</div>
            </div>
          </div>

          <button
            onClick={() => setDismissed(true)}
            className="p-1 hover:bg-amber-900/60 rounded text-amber-300 transition-colors ml-2"
            title="Dismiss Alert"
          >
            <X className="w-4 h-4" />
          </button>
        </div>
      )}
    </div>
  );
}
