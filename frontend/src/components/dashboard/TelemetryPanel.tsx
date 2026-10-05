"use client";

import React from "react";
import { Navigation, Gauge, Zap, Compass, Signal, Wifi, Radio } from "lucide-react";
import { useMissionStore } from "@/store/useMissionStore";

export function TelemetryPanel() {
  const telemetry = useMissionStore((state) => state.telemetry);
  const { position, heading, speed, battery, mode, communication } = telemetry;

  const batA = Math.round(battery.batteryA ?? 100);
  const batB = Math.round(battery.batteryB ?? 100);
  const wifi = communication.wifiSignal ?? 100;
  const fiveG = communication.fiveGSignal ?? 96;
  const lora = communication.loraSignal ?? 98;

  return (
    <div className="bg-[#050811]/90 backdrop-blur-xl border border-cyan-950/60 rounded-xl p-3 text-slate-200 font-mono text-xs select-none shadow-[0_0_20px_rgba(0,0,0,0.6)] flex flex-col gap-2.5">
      <div className="flex items-center justify-between pb-2 border-b border-slate-800/80">
        <span className="font-bold text-cyan-400 flex items-center gap-1.5 uppercase tracking-wider text-[11px]">
          <Navigation className="w-3.5 h-3.5 text-cyan-400" /> ROVER TELEMETRY & POWER
        </span>
        <div className="flex items-center gap-2">
          <span className="text-[9px] px-1.5 py-0.5 rounded bg-amber-500/10 text-amber-400 border border-amber-500/30 font-bold uppercase tracking-wider">
            SIMULATED TELEMETRY
          </span>
          <span className="text-[10px] px-1.5 py-0.5 rounded bg-cyan-500/10 text-cyan-400 border border-cyan-500/30 font-bold">
            {mode}
          </span>
        </div>
      </div>

      <div className="grid grid-cols-2 gap-2">
        {/* Position Vector */}
        <div className="bg-slate-900/90 p-2.5 rounded-lg border border-slate-800/80 flex flex-col justify-between">
          <div className="text-[10px] text-slate-400 mb-1 flex items-center justify-between">
            <span>COORDINATES (X, Y, Z)</span>
            <Compass className="w-3 h-3 text-cyan-400" />
          </div>
          <div className="text-sm font-bold text-cyan-400">
            {position.x.toFixed(1)}, {position.y.toFixed(1)}, {position.z.toFixed(1)}{" "}
            <span className="text-[10px] text-slate-400 font-normal">m</span>
          </div>
        </div>

        {/* Heading & Speed Gauge */}
        <div className="bg-slate-900/90 p-2.5 rounded-lg border border-slate-800/80 flex flex-col justify-between">
          <div className="text-[10px] text-slate-400 mb-1 flex items-center justify-between">
            <span>HEADING / SPEED</span>
            <Gauge className="w-3 h-3 text-cyan-400" />
          </div>
          <div className="text-sm font-bold text-cyan-400 flex items-center justify-between">
            <span>{heading.toFixed(0)}°</span>
            <span>
              {speed.toFixed(1)}{" "}
              <span className="text-[10px] text-slate-400 font-normal">m/s</span>
            </span>
          </div>
        </div>

        {/* Dual-Battery BMS Power System Meter */}
        <div className="bg-slate-900/90 p-2.5 rounded-lg border border-slate-800/80 flex flex-col justify-between col-span-2">
          <div className="text-[10px] text-slate-400 mb-1.5 flex items-center justify-between">
            <span className="flex items-center gap-1">
              <Zap className="w-3 h-3 text-emerald-400" /> DUAL-BATTERY BMS SYSTEM
            </span>
            <span className="text-[9px] text-emerald-400 font-bold">12.6V / 1.4A</span>
          </div>
          <div className="grid grid-cols-2 gap-2">
            <div>
              <div className="text-[10px] text-slate-300 flex justify-between mb-0.5">
                <span>BAT-A (MAIN):</span>
                <span className="font-bold text-emerald-400">{batA}%</span>
              </div>
              <div className="w-full h-1.5 bg-slate-950 rounded-full overflow-hidden border border-slate-800">
                <div className="h-full bg-emerald-500 rounded-full transition-all duration-300" style={{ width: `${batA}%` }} />
              </div>
            </div>
            <div>
              <div className="text-[10px] text-slate-300 flex justify-between mb-0.5">
                <span>BAT-B (BACKUP):</span>
                <span className="font-bold text-emerald-400">{batB}%</span>
              </div>
              <div className="w-full h-1.5 bg-slate-950 rounded-full overflow-hidden border border-slate-800">
                <div className="h-full bg-emerald-400 rounded-full transition-all duration-300" style={{ width: `${batB}%` }} />
              </div>
            </div>
          </div>
        </div>

        {/* Tri-Link Redundant Comms (Wi-Fi 6 + 5G + LoRaWAN) */}
        <div className="bg-slate-900/90 p-2.5 rounded-lg border border-slate-800/80 flex flex-col justify-between col-span-2">
          <div className="text-[10px] text-slate-400 mb-1.5 flex items-center justify-between">
            <span className="flex items-center gap-1">
              <Signal className="w-3 h-3 text-cyan-400 animate-pulse" /> TRI-LINK REDUNDANT COMMS
            </span>
            <span className="text-[9px] text-emerald-400 font-bold">ENCRYPTED MESH</span>
          </div>
          <div className="grid grid-cols-3 gap-1.5 text-[10px]">
            <div className="bg-slate-950/60 p-1.5 rounded border border-slate-800 flex flex-col gap-0.5">
              <div className="text-slate-400 text-[9px] flex items-center gap-1">
                <Wifi className="w-2.5 h-2.5 text-cyan-400" /> Wi-Fi 6
              </div>
              <div className="font-bold text-cyan-300 text-right">{wifi}%</div>
            </div>
            <div className="bg-slate-950/60 p-1.5 rounded border border-slate-800 flex flex-col gap-0.5">
              <div className="text-slate-400 text-[9px] flex items-center gap-1">
                <Signal className="w-2.5 h-2.5 text-cyan-400" /> 5G Mesh
              </div>
              <div className="font-bold text-cyan-300 text-right">{fiveG}%</div>
            </div>
            <div className="bg-slate-950/60 p-1.5 rounded border border-slate-800 flex flex-col gap-0.5">
              <div className="text-slate-400 text-[9px] flex items-center gap-1">
                <Radio className="w-2.5 h-2.5 text-cyan-400" /> LoRaWAN
              </div>
              <div className="font-bold text-cyan-300 text-right">{lora}%</div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
