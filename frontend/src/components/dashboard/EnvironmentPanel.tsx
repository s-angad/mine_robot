"use client";

import React from "react";
import { Wind, Thermometer, Flame, AlertCircle } from "lucide-react";
import { useMissionStore } from "@/store/useMissionStore";

export function EnvironmentPanel() {
  const sensors = useMissionStore((state) => state.telemetry.sensors);

  // Status helpers
  const getCh4Status = (ch4: number) => {
    if (ch4 >= 1.5) return { text: "CRITICAL", cls: "text-red-400 bg-red-950/80 border-red-500/50" };
    if (ch4 >= 0.8) return { text: "ELEVATED", cls: "text-amber-400 bg-amber-950/80 border-amber-500/50" };
    return { text: "NORMAL", cls: "text-emerald-400 bg-slate-950/80 border-slate-800" };
  };

  const getO2Status = (o2: number) => {
    if (o2 <= 18.0) return { text: "CRITICAL", cls: "text-red-400 bg-red-950/80 border-red-500/50" };
    if (o2 <= 19.5) return { text: "DEPLETED", cls: "text-amber-400 bg-amber-950/80 border-amber-500/50" };
    return { text: "NORMAL", cls: "text-emerald-400 bg-slate-950/80 border-slate-800" };
  };

  const ch4Info = getCh4Status(sensors.ch4);
  const o2Info = getO2Status(sensors.o2);

  return (
    <div className="bg-[#08111f] border border-slate-800/90 rounded-lg p-2.5 text-slate-100 font-mono text-xs select-none shadow-md flex flex-col gap-2">
      {/* Title Bar & Simulation Label */}
      <div className="flex items-center justify-between pb-1.5 border-b border-slate-800/80">
        <span className="font-bold text-slate-300 flex items-center gap-1.5 uppercase tracking-wider text-[10.5px]">
          <Wind className="w-3.5 h-3.5 text-cyan-400" /> ENVIRONMENTAL TELEMETRY
        </span>
        <span className="text-[9px] px-1.5 py-0.5 rounded bg-slate-900 text-slate-400 border border-slate-800">
          SIMULATED TELEMETRY
        </span>
      </div>

      {/* Sensor Grid */}
      <div className="grid grid-cols-2 gap-1.5 text-[10.5px]">
        {/* CH4 Methane */}
        <div className={`p-1.5 rounded border ${ch4Info.cls} flex justify-between items-center`}>
          <div>
            <div className="text-[9px] opacity-70">CH₄ (METHANE)</div>
            <div className="font-bold text-xs">{sensors.ch4.toFixed(2)} %</div>
          </div>
          <span className="text-[9px] font-bold px-1 rounded bg-black/40">{ch4Info.text}</span>
        </div>

        {/* O2 Oxygen */}
        <div className={`p-1.5 rounded border ${o2Info.cls} flex justify-between items-center`}>
          <div>
            <div className="text-[9px] opacity-70">O₂ (OXYGEN)</div>
            <div className="font-bold text-xs">{sensors.o2.toFixed(1)} %</div>
          </div>
          <span className="text-[9px] font-bold px-1 rounded bg-black/40">{o2Info.text}</span>
        </div>

        {/* Temperature */}
        <div className="bg-slate-950/80 p-1.5 rounded border border-slate-800 flex justify-between items-center">
          <div>
            <div className="text-[9px] text-slate-400">TEMP</div>
            <div className="font-bold text-slate-200">{sensors.temperature.toFixed(1)} °C</div>
          </div>
          <span className="text-[9px] text-emerald-400">NORMAL</span>
        </div>

        {/* Humidity */}
        <div className="bg-slate-950/80 p-1.5 rounded border border-slate-800 flex justify-between items-center">
          <div>
            <div className="text-[9px] text-slate-400">HUMIDITY</div>
            <div className="font-bold text-slate-200">{sensors.humidity.toFixed(0)} %</div>
          </div>
          <span className="text-[9px] text-emerald-400">NORMAL</span>
        </div>

        {/* CO Monoxide */}
        <div className="bg-slate-950/80 p-1.5 rounded border border-slate-800 flex justify-between items-center">
          <div>
            <div className="text-[9px] text-slate-400">CO (MONOXIDE)</div>
            <div className="font-bold text-slate-200">{sensors.co.toFixed(0)} PPM</div>
          </div>
          <span className="text-[9px] text-emerald-400">SAFE</span>
        </div>

        {/* CO2 Dioxide */}
        <div className="bg-slate-950/80 p-1.5 rounded border border-slate-800 flex justify-between items-center">
          <div>
            <div className="text-[9px] text-slate-400">CO₂ (DIOXIDE)</div>
            <div className="font-bold text-slate-200">{sensors.co2.toFixed(0)} PPM</div>
          </div>
          <span className="text-[9px] text-emerald-400">SAFE</span>
        </div>
      </div>
    </div>
  );
}
