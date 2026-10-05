"use client";

import React from "react";
import { Activity, ShieldAlert, MapPin, UserCheck, AlertTriangle } from "lucide-react";
import { useMissionStore } from "@/store/useMissionStore";

export function MissionStatusPanel() {
  const telemetry = useMissionStore((state) => state.telemetry);
  const isDemoRunning = useMissionStore((state) => state.isDemoRunning);

  const { navigation, hazard, thermal } = telemetry;

  // Dynamic Threat Level helper
  let threatLevel = "NOMINAL";
  let threatColor = "text-emerald-400 bg-emerald-950/60 border-emerald-500/30";
  if (hazard.severity === "CRITICAL" || telemetry.sensors.ch4 >= 1.5) {
    threatLevel = "CRITICAL HAZARD";
    threatColor = "text-red-400 bg-red-950/80 border-red-500/50 animate-pulse";
  } else if (hazard.severity === "WARNING" || telemetry.sensors.ch4 >= 0.8) {
    threatLevel = "ELEVATED";
    threatColor = "text-amber-400 bg-amber-950/80 border-amber-500/50";
  }

  return (
    <div className="bg-[#08111f] border border-slate-800/90 rounded-lg p-2.5 text-slate-100 font-mono text-xs select-none shadow-md flex flex-col gap-2">
      {/* Title Bar */}
      <div className="flex items-center justify-between pb-1.5 border-b border-slate-800/80">
        <span className="font-bold text-slate-300 flex items-center gap-1.5 uppercase tracking-wider text-[10.5px]">
          <Activity className="w-3.5 h-3.5 text-cyan-400" /> MISSION STATUS
        </span>
        <span className="text-[9px] text-slate-400">SIH PS 26218</span>
      </div>

      {/* Mission Key Attributes List */}
      <div className="grid grid-cols-2 gap-1.5 text-[10.5px]">
        {/* Mission Type */}
        <div className="bg-slate-950/80 p-1.5 rounded border border-slate-800/80">
          <div className="text-[9px] text-slate-400">MISSION</div>
          <div className="font-bold text-slate-200 truncate">UNDERGROUND RECON</div>
        </div>

        {/* Current Objective */}
        <div className="bg-slate-950/80 p-1.5 rounded border border-slate-800/80">
          <div className="text-[9px] text-slate-400">CURRENT OBJECTIVE</div>
          <div className="font-bold text-cyan-400 truncate">
            {thermal.humanDetected ? "LOCATE & RESCUE" : "ATMOSPHERIC SCOUT"}
          </div>
        </div>

        {/* Rover State */}
        <div className="bg-slate-950/80 p-1.5 rounded border border-slate-800/80">
          <div className="text-[9px] text-slate-400">ROVER STATE</div>
          <div className="font-bold text-emerald-400 flex items-center gap-1">
            <span className="w-1.5 h-1.5 rounded-full bg-emerald-400 animate-ping" />
            {isDemoRunning ? "AUTONOMOUS DEMO" : "ACTIVE TELEOP"}
          </div>
        </div>

        {/* Current Location */}
        <div className="bg-slate-950/80 p-1.5 rounded border border-slate-800/80">
          <div className="text-[9px] text-slate-400">LOCATION</div>
          <div className="font-bold text-slate-200 truncate flex items-center gap-1">
            <MapPin className="w-3 h-3 text-cyan-400 shrink-0" />
            <span>{navigation.currentTunnel}</span>
          </div>
        </div>

        {/* Threat Level */}
        <div className={`p-1.5 rounded border ${threatColor} col-span-1`}>
          <div className="text-[9px] opacity-80">THREAT LEVEL</div>
          <div className="font-bold truncate">{threatLevel}</div>
        </div>

        {/* Victim Status */}
        <div
          className={`p-1.5 rounded border ${
            thermal.humanDetected
              ? "bg-pink-950/80 border-pink-500/50 text-pink-300 font-bold"
              : "bg-slate-950/80 border-slate-800 text-slate-400"
          }`}
        >
          <div className="text-[9px] opacity-80">VICTIM STATUS</div>
          <div className="truncate flex items-center gap-1">
            <UserCheck className="w-3 h-3" />
            <span>{thermal.humanDetected ? "DETECTED (72 BPM)" : "NOT DETECTED"}</span>
          </div>
        </div>
      </div>
    </div>
  );
}
