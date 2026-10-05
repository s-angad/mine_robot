"use client";

import React from "react";
import { Header } from "@/components/dashboard/Header";
import { MineCanvas } from "@/components/3d/MineCanvas";
import { MissionStatusPanel } from "@/components/dashboard/MissionStatusPanel";
import { TelemetryPanel } from "@/components/dashboard/TelemetryPanel";
import { EnvironmentPanel } from "@/components/dashboard/EnvironmentPanel";
import { PayloadPanel } from "@/components/dashboard/PayloadPanel";
import { BioTelemetryPanel } from "@/components/dashboard/BioTelemetryPanel";
import { ControlsPanel } from "@/components/dashboard/ControlsPanel";
import { MissionTimeline } from "@/components/dashboard/MissionTimeline";
import { Minimap2D } from "@/components/dashboard/Minimap2D";
import { AlertsOverlay } from "@/components/dashboard/AlertsOverlay";
import { useTelemetry } from "@/hooks/useTelemetry";

export default function DashboardPage() {
  // Initialize telemetry hook (WebSocket + Local Simulation Engine)
  useTelemetry();

  return (
    <div className="flex flex-col h-screen w-screen bg-[#030712] text-slate-100 overflow-hidden font-mono select-none">
      {/* Top Navigation Header */}
      <Header />

      {/* Immediate Alert Notification Overlay */}
      <AlertsOverlay />

      {/* Main Command Center Workspace Grid */}
      <main className="flex-1 grid grid-cols-1 lg:grid-cols-12 gap-2 p-2 overflow-hidden relative">
        {/* Left 3D Viewport Column (8 cols ~70% width on desktop) */}
        <div className="lg:col-span-8 flex flex-col h-full rounded-xl border border-cyan-950/70 bg-[#050811] overflow-hidden relative shadow-[0_0_35px_rgba(0,0,0,0.8)]">
          <div className="absolute top-2.5 left-2.5 z-10 bg-[#050811]/90 backdrop-blur-md px-3 py-1 rounded-lg border border-cyan-900/60 text-[10px] text-cyan-400 font-bold flex items-center gap-2 shadow-lg">
            <span className="w-2 h-2 rounded-full bg-emerald-400 animate-ping" />
            AEGIS 3D DIGITAL TWIN VIEWPORT [GLB ROVER LIVE]
          </div>

          <div className="w-full h-full relative">
            <MineCanvas />
          </div>

          {/* Bottom engineering credibility disclaimer */}
          <div className="bg-[#030712]/95 border-t border-slate-800/80 px-3 py-1.5 text-[10px] text-slate-500 flex justify-between items-center z-10 font-mono">
            <span>SIH 2026 Engineering MVP / Underground Mine Digital Twin</span>
            <span>Simulated telemetry for validation. Not a certified safety device.</span>
          </div>
        </div>

        {/* Right Command Center Sidebar Column (4 cols ~30% width on desktop) */}
        <div className="lg:col-span-4 flex flex-col gap-2 h-full overflow-y-auto pr-1 scrollbar-thin scrollbar-thumb-slate-800">
          {/* Mission Status Header Card */}
          <MissionStatusPanel />

          {/* 2D Autopilot Minimap & Teleoperation D-Pad Grid */}
          <div className="grid grid-cols-1 xl:grid-cols-2 gap-2">
            <Minimap2D />
            <ControlsPanel />
          </div>

          {/* Environmental Gas Telemetry */}
          <EnvironmentPanel />

          {/* Modular Payload Control & Bio-Telemetry Grid */}
          <div className="grid grid-cols-1 xl:grid-cols-2 gap-2">
            <PayloadPanel />
            <BioTelemetryPanel />
          </div>

          {/* System Telemetry & Power BMS */}
          <TelemetryPanel />

          {/* Mission Timeline & Report Exporter */}
          <div className="flex-1 min-h-[160px]">
            <MissionTimeline />
          </div>
        </div>
      </main>
    </div>
  );
}
