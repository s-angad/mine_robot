"use client";

import React from "react";
import { Boxes, Radio, Stethoscope, Wind, CheckCircle2, PackageCheck } from "lucide-react";
import { useMissionStore } from "@/store/useMissionStore";
import { ModularPayload } from "@/types/telemetry";

export function PayloadPanel() {
  const activePayload = useMissionStore((state) => state.telemetry.activePayload);
  const setActivePayload = useMissionStore((state) => state.setActivePayload);

  const isSonarScanning = useMissionStore((state) => state.isSonarScanning);
  const triggerSonarScan = useMissionStore((state) => state.triggerSonarScan);
  const rescuePayloadDeployed = useMissionStore((state) => state.rescuePayloadDeployed);
  const deployRescuePayload = useMissionStore((state) => state.deployRescuePayload);

  // Payload specifications
  const payloadSpecs: Record<ModularPayload, { title: string; desc: string; capabilities: string[] }> = {
    RECON_SENSORS: {
      title: "RECON SENSOR ARRAY",
      desc: "CD10 Gas + Thermal + LiDAR SLAM",
      capabilities: [
        "Multi-gas atmospheric detection (CH₄, CO, CO₂, O₂, H₂S)",
        "FLIR Infrared thermal human detection (+9.7°C anomaly)",
        "3D Acoustic Sonar wave pulse mapping",
        "Topological graph SLAM mapping",
      ],
    },
    MEDICAL_RESCUE_PACK: {
      title: "EMERGENCY MEDICAL PACK",
      desc: "O₂ Supply + Bio-Telemetry Relay",
      capabilities: [
        "Emergency Oxygen Cylinder drop mechanism",
        "Non-invasive vital signs bio-telemetry monitor",
        "First aid & emergency thermal blanket container",
        "High-frequency comms relay capsule deployment",
      ],
    },
    HAZMAT_SAMPLER: {
      title: "HAZMAT CONTAINMENT MODULE",
      desc: "Gas Sampling + Air Neutralizer",
      capabilities: [
        "High-pressure atmospheric gas sampling canister",
        "HEPA & Activated Carbon toxic air filtration",
        "Chemical hazard identification sensor array",
        "Remote aerosol containment spray nozzle",
      ],
    },
  };

  const currentSpec = payloadSpecs[activePayload];

  return (
    <div className="bg-[#08111f] border border-slate-800/90 rounded-lg p-2.5 text-slate-100 font-mono text-xs select-none shadow-md flex flex-col gap-2">
      {/* Title Bar */}
      <div className="flex items-center justify-between pb-1.5 border-b border-slate-800/80">
        <span className="font-bold text-slate-300 flex items-center gap-1.5 uppercase tracking-wider text-[10.5px]">
          <Boxes className="w-3.5 h-3.5 text-yellow-400" /> MISSION PAYLOAD
        </span>
        <span className="text-[9px] font-bold text-cyan-400 border border-cyan-500/30 bg-cyan-950/60 px-1.5 py-0.5 rounded">
          MODULAR RECONFIGURABLE
        </span>
      </div>

      {/* Payload Selector Tabs */}
      <div className="grid grid-cols-3 gap-1 text-[10px]">
        <button
          onClick={() => setActivePayload("RECON_SENSORS")}
          className={`py-1.5 px-1 rounded font-bold transition-all border flex flex-col items-center gap-0.5 ${
            activePayload === "RECON_SENSORS"
              ? "bg-cyan-500 text-slate-950 border-cyan-300 shadow"
              : "bg-slate-950 text-slate-400 border-slate-800 hover:border-slate-700"
          }`}
        >
          <Radio className="w-3.5 h-3.5" />
          <span>RECON</span>
        </button>

        <button
          onClick={() => setActivePayload("MEDICAL_RESCUE_PACK")}
          className={`py-1.5 px-1 rounded font-bold transition-all border flex flex-col items-center gap-0.5 ${
            activePayload === "MEDICAL_RESCUE_PACK"
              ? "bg-pink-600 text-white border-pink-400 shadow"
              : "bg-slate-950 text-slate-400 border-slate-800 hover:border-slate-700"
          }`}
        >
          <Stethoscope className="w-3.5 h-3.5" />
          <span>MEDICAL</span>
        </button>

        <button
          onClick={() => setActivePayload("HAZMAT_SAMPLER")}
          className={`py-1.5 px-1 rounded font-bold transition-all border flex flex-col items-center gap-0.5 ${
            activePayload === "HAZMAT_SAMPLER"
              ? "bg-amber-600 text-slate-950 border-amber-400 shadow"
              : "bg-slate-950 text-slate-400 border-slate-800 hover:border-slate-700"
          }`}
        >
          <Wind className="w-3.5 h-3.5" />
          <span>HAZMAT</span>
        </button>
      </div>

      {/* Active Module Details & Capabilities */}
      <div className="bg-slate-950/80 p-2 rounded border border-slate-800 flex flex-col gap-1.5 text-[10.5px]">
        <div className="flex items-center justify-between border-b border-slate-800/80 pb-1">
          <span className="text-[9px] text-slate-400 uppercase">ACTIVE MODULE</span>
          <strong className="text-cyan-400 font-bold">{currentSpec.title}</strong>
        </div>

        <div className="space-y-1">
          <span className="text-[9px] text-slate-400 uppercase">CAPABILITIES</span>
          {currentSpec.capabilities.map((cap, idx) => (
            <div key={idx} className="flex items-start gap-1.5 text-[10px] text-slate-300 leading-tight">
              <CheckCircle2 className="w-3 h-3 text-cyan-400 shrink-0 mt-0.5" />
              <span>{cap}</span>
            </div>
          ))}
        </div>

        {/* Tactical Action Button */}
        <div className="pt-1">
          {activePayload === "RECON_SENSORS" && (
            <button
              onClick={triggerSonarScan}
              disabled={isSonarScanning}
              className={`w-full py-1.5 px-2 rounded font-bold text-xs flex items-center justify-center gap-1.5 transition-all shadow ${
                isSonarScanning
                  ? "bg-cyan-500 text-slate-950 border border-cyan-300 animate-pulse"
                  : "bg-slate-900 text-cyan-400 border border-cyan-500/40 hover:bg-cyan-950"
              }`}
            >
              <Radio className={`w-3.5 h-3.5 ${isSonarScanning ? "animate-spin" : ""}`} />
              <span>{isSonarScanning ? "SCANNING SONAR..." : "TRIGGER 3D SONAR SWEEP"}</span>
            </button>
          )}

          {activePayload === "MEDICAL_RESCUE_PACK" && (
            <button
              onClick={deployRescuePayload}
              disabled={rescuePayloadDeployed}
              className={`w-full py-1.5 px-2 rounded font-bold text-xs flex items-center justify-center gap-1.5 transition-all shadow ${
                rescuePayloadDeployed
                  ? "bg-emerald-950 border border-emerald-500 text-emerald-400"
                  : "bg-pink-600 hover:bg-pink-500 text-white border border-pink-400 shadow-pink-600/30"
              }`}
            >
              <PackageCheck className="w-3.5 h-3.5" />
              <span>{rescuePayloadDeployed ? "O2 & MED KIT DEPLOYED" : "DEPLOY MEDICAL RESCUE PACK"}</span>
            </button>
          )}

          {activePayload === "HAZMAT_SAMPLER" && (
            <button
              onClick={() => {
                useMissionStore.getState().addEvent({
                  timestamp: new Date().toLocaleTimeString("en-US", { hour12: true }),
                  elapsedSec: 0,
                  title: "Hazmat Gas Sample Sealed",
                  description: "High-pressure atmospheric gas sample collected in sealed canister.",
                  type: "SYSTEM",
                });
              }}
              className="w-full py-1.5 px-2 bg-slate-900 hover:bg-amber-950/60 text-amber-400 border border-amber-500/40 rounded font-bold text-xs flex items-center justify-center gap-1.5 transition-all shadow"
            >
              <Wind className="w-3.5 h-3.5 text-amber-400" />
              <span>COLLECT ATMOSPHERIC SAMPLE</span>
            </button>
          )}
        </div>
      </div>
    </div>
  );
}
