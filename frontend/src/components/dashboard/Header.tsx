"use client";

import React from "react";
import {
  ShieldAlert,
  Radio,
  Battery,
  Play,
  Pause,
  RotateCcw,
  Activity,
  AlertTriangle,
} from "lucide-react";
import { useMissionStore } from "@/store/useMissionStore";

export function Header() {
  const telemetry = useMissionStore((state) => state.telemetry);
  const cameraMode = useMissionStore((state) => state.cameraMode);
  const setCameraMode = useMissionStore((state) => state.setCameraMode);
  const isDemoRunning = useMissionStore((state) => state.isDemoRunning);
  const isDemoPaused = useMissionStore((state) => state.isDemoPaused);
  const startDemo = useMissionStore((state) => state.startDemo);
  const pauseDemo = useMissionStore((state) => state.pauseDemo);
  const resumeDemo = useMissionStore((state) => state.resumeDemo);
  const resetDemo = useMissionStore((state) => state.resetDemo);

  const isConnected = telemetry.communication.connected;
  const signal = telemetry.communication.signal;
  const battery = telemetry.battery.level;
  const hazard = telemetry.hazard;

  return (
    <header className="h-14 bg-[#08111f] border-b border-slate-800/90 px-4 flex items-center justify-between text-slate-100 select-none shadow-md z-20 font-mono">
      {/* Left: Branding & Subtitle */}
      <div className="flex items-center gap-3">
        <div className="p-1.5 bg-cyan-500/10 border border-cyan-500/30 rounded-md text-cyan-400">
          <ShieldAlert className="w-5 h-5" />
        </div>
        <div>
          <div className="flex items-center gap-2">
            <h1 className="font-bold text-sm tracking-wider uppercase text-slate-100">
              AEGIS RESCUE ROBOTICS
            </h1>
            <span className="text-[10px] text-slate-400 font-semibold border-l border-slate-700 pl-2">
              AEGIS-MR01 MODULAR SEARCH & RESCUE UGV
            </span>
          </div>
          <div className="text-[9.5px] text-slate-400">
            SIH PS 26218 • AUTONOMOUS EMERGENCY RECONNAISSANCE
          </div>
        </div>
      </div>

      {/* Center: Mission & Status */}
      <div className="hidden lg:flex items-center gap-4 text-xs">
        <div className="flex items-center gap-1.5">
          <span className="text-slate-400">MISSION:</span>
          <strong className="text-slate-200">UNDERGROUND SEARCH & RESCUE</strong>
        </div>
        <span>•</span>
        <div className="flex items-center gap-1.5">
          <span className="text-slate-400">STATUS:</span>
          <span
            className={`flex items-center gap-1 font-bold ${
              hazard.severity === "CRITICAL"
                ? "text-red-400"
                : hazard.severity === "WARNING"
                ? "text-amber-400"
                : "text-emerald-400"
            }`}
          >
            <span
              className={`w-2 h-2 rounded-full ${
                hazard.severity === "CRITICAL"
                  ? "bg-red-500 animate-ping"
                  : hazard.severity === "WARNING"
                  ? "bg-amber-400 animate-pulse"
                  : "bg-emerald-400 animate-ping"
              }`}
            />
            {hazard.type === "NONE" ? "NOMINAL" : hazard.type.replace("_", " ")}
          </span>
        </div>
      </div>

      {/* Right: Telemetry Quick Readout & Camera Controls */}
      <div className="flex items-center gap-3">
        {/* Link & Battery Status */}
        <div className="flex items-center gap-3 border-r border-slate-800 pr-3 text-xs">
          <div className="flex items-center gap-1 text-[11px]">
            <Radio className={`w-3.5 h-3.5 ${isConnected ? "text-emerald-400" : "text-red-500"}`} />
            <span className="text-slate-400">LINK:</span>
            <strong className={isConnected ? "text-emerald-400" : "text-red-400"}>
              {signal}%
            </strong>
          </div>
          <div className="flex items-center gap-1 text-[11px]">
            <Battery className="w-3.5 h-3.5 text-yellow-400" />
            <span className="text-slate-400">BATTERY:</span>
            <strong className="text-yellow-400">{battery.toFixed(0)}%</strong>
          </div>
        </div>

        {/* Camera Mode Selector */}
        <div className="flex items-center bg-slate-950 p-0.5 rounded border border-slate-800 text-xs">
          <button
            onClick={() => setCameraMode("TACTICAL_ORBIT")}
            className={`px-2 py-0.5 rounded text-[10px] font-bold transition-colors ${
              cameraMode === "TACTICAL_ORBIT"
                ? "bg-cyan-500 text-slate-950"
                : "text-slate-400 hover:text-slate-200"
            }`}
          >
            TACTICAL
          </button>
          <button
            onClick={() => setCameraMode("ROVER_RGB")}
            className={`px-2 py-0.5 rounded text-[10px] font-bold transition-colors ${
              cameraMode === "ROVER_RGB"
                ? "bg-cyan-500 text-slate-950"
                : "text-slate-400 hover:text-slate-200"
            }`}
          >
            RGB
          </button>
          <button
            onClick={() => setCameraMode("ROVER_THERMAL")}
            className={`px-2 py-0.5 rounded text-[10px] font-bold transition-colors ${
              cameraMode === "ROVER_THERMAL"
                ? "bg-pink-600 text-white"
                : "text-slate-400 hover:text-slate-200"
            }`}
          >
            THERMAL
          </button>
        </div>

        {/* Demo Controls (Visually secondary) */}
        <div className="flex items-center gap-1">
          {!isDemoRunning ? (
            <button
              onClick={startDemo}
              className="px-2.5 py-0.5 bg-emerald-600 hover:bg-emerald-500 text-slate-950 font-bold text-[10px] rounded flex items-center gap-1 transition-colors"
            >
              <Play className="w-3 h-3 fill-current" /> DEMO
            </button>
          ) : (
            <>
              {isDemoPaused ? (
                <button
                  onClick={resumeDemo}
                  className="px-2 py-0.5 bg-emerald-600 text-slate-950 font-bold text-[10px] rounded flex items-center gap-1"
                >
                  <Play className="w-3 h-3 fill-current" /> RESUME
                </button>
              ) : (
                <button
                  onClick={pauseDemo}
                  className="px-2 py-0.5 bg-amber-600 text-slate-950 font-bold text-[10px] rounded flex items-center gap-1"
                >
                  <Pause className="w-3 h-3 fill-current" /> PAUSE
                </button>
              )}
              <button
                onClick={resetDemo}
                className="p-1 bg-slate-800 hover:bg-slate-700 text-slate-400 hover:text-slate-200 rounded"
                title="Reset Demo"
              >
                <RotateCcw className="w-3 h-3" />
              </button>
            </>
          )}
        </div>
      </div>
    </header>
  );
}
