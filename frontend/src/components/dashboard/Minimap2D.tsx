"use client";

import React, { useState } from "react";
import { Compass, ZoomIn, ZoomOut, RotateCcw, Navigation } from "lucide-react";
import { useMissionStore, TargetWaypoint } from "@/store/useMissionStore";

const MINE_WAYPOINTS: (TargetWaypoint & { label: string; color: string; subLabel: string })[] = [
  { name: "ENTRANCE", label: "MINE ENTRANCE", subLabel: "(0m, 5m)", x: 0, z: 5, color: "#38bdf8" },
  { name: "JUNCTION_1", label: "JUNCTION 1", subLabel: "(0m, -40m)", x: 0, z: -40, color: "#facc15" },
  { name: "TUNNEL_B", label: "CH4 LEAK", subLabel: "HAZARD Z2", x: -30, z: -40, color: "#f59e0b" },
  { name: "TUNNEL_C_ENTRY", label: "TUNNEL C", subLabel: "BRANCH", x: 35, z: -40, color: "#38bdf8" },
  { name: "VICTIM_ZONE", label: "VICTIM ZONE", subLabel: "LIFE DETECTED", x: 35, z: -72, color: "#ec4899" },
  { name: "COLLAPSE_ZONE", label: "BLOCKED", subLabel: "DEBRIS", x: 0, z: -60, color: "#ef4444" },
];

export function Minimap2D() {
  const telemetry = useMissionStore((state) => state.telemetry);
  const targetWaypoint = useMissionStore((state) => state.targetWaypoint);
  const setTargetWaypoint = useMissionStore((state) => state.setTargetWaypoint);
  const addEvent = useMissionStore((state) => state.addEvent);

  const [zoomLevel, setZoomLevel] = useState<number>(1.0);

  const { x, z } = telemetry.position;
  const heading = telemetry.heading;

  // Optimized Projection: Maps 3D Mine Coordinates (X: -42..42, Z: +10..-80) to SVG ViewBox (0..240, 0..210)
  const baseMapX = (xVal: number) => 120 + (xVal / 42) * 88;
  const baseMapZ = (zVal: number) => 35 + ((5 - zVal) / 83) * 140;

  const rover2DX = baseMapX(x);
  const rover2DZ = baseMapZ(z);

  const handleZoomIn = () => setZoomLevel((prev) => Math.min(2.5, prev + 0.3));
  const handleZoomOut = () => setZoomLevel((prev) => Math.max(0.8, prev - 0.3));
  const handleResetZoom = () => setZoomLevel(1.0);

  const handleSelectWaypoint = (wp: typeof MINE_WAYPOINTS[0]) => {
    setTargetWaypoint({ x: wp.x, z: wp.z, name: wp.name });
    addEvent({
      timestamp: new Date().toLocaleTimeString("en-US", { hour12: true }),
      elapsedSec: 0,
      title: `Autopilot Target Set: ${wp.label}`,
      description: `AEGIS-MR01 steering to target waypoint coordinates (${wp.x.toFixed(1)}, ${wp.z.toFixed(1)}).`,
      type: "SYSTEM",
    });
  };

  const transformStyle = {
    transform: `scale(${zoomLevel})`,
    transformOrigin: "120px 105px",
    transition: "transform 0.2s cubic-bezier(0.4, 0, 0.2, 1)",
  };

  return (
    <div className="bg-[#08111f] border border-slate-800/90 rounded-lg p-2.5 text-slate-100 font-mono text-xs select-none shadow-md flex flex-col gap-2">
      {/* Header & Map Zoom Toolbar */}
      <div className="flex items-center justify-between pb-1.5 border-b border-slate-800/80">
        <span className="font-bold text-slate-300 flex items-center gap-1.5 uppercase tracking-wider text-[10.5px]">
          <Compass className="w-3.5 h-3.5 text-cyan-400" /> TACTICAL MAP • TUNNEL NETWORK
        </span>

        {/* Zoom Controls */}
        <div className="flex items-center gap-1 bg-slate-950 border border-slate-800 px-1 py-0.5 rounded shadow-sm">
          <button
            onClick={handleZoomIn}
            className="px-1 hover:bg-slate-800 text-slate-300 hover:text-cyan-400 rounded transition-colors"
            title="Zoom In"
          >
            <ZoomIn className="w-3 h-3" />
          </button>
          <button
            onClick={handleZoomOut}
            className="px-1 hover:bg-slate-800 text-slate-300 hover:text-cyan-400 rounded transition-colors"
            title="Zoom Out"
          >
            <ZoomOut className="w-3 h-3" />
          </button>
          <button
            onClick={handleResetZoom}
            className="px-1 hover:bg-slate-800 text-slate-300 hover:text-cyan-400 rounded transition-colors"
            title="Reset Zoom"
          >
            <RotateCcw className="w-3 h-3" />
          </button>
          <span className="text-[9px] font-bold text-cyan-400 pl-1 border-l border-slate-800">
            {zoomLevel.toFixed(1)}x
          </span>
        </div>
      </div>

      {/* SVG Viewport */}
      <div className="relative w-full h-48 bg-slate-950 rounded border border-slate-800/90 overflow-hidden flex flex-col justify-between">
        <svg className="w-full h-full" viewBox="0 0 240 210">
          <g style={transformStyle}>
            {/* Grid Lines */}
            <defs>
              <pattern id="tactical-grid-pattern" width="20" height="20" patternUnits="userSpaceOnUse">
                <path d="M 20 0 L 0 0 0 20" fill="none" stroke="#1e293b" strokeWidth="0.6" />
              </pattern>
            </defs>
            <rect width="240" height="210" fill="url(#tactical-grid-pattern)" />

            {/* Mine Tunnel Corridors */}
            <line x1={baseMapX(0)} y1={baseMapZ(5)} x2={baseMapX(0)} y2={baseMapZ(-40)} stroke="#1e293b" strokeWidth="12" strokeLinecap="round" />
            <line x1={baseMapX(0)} y1={baseMapZ(5)} x2={baseMapX(0)} y2={baseMapZ(-40)} stroke="#38bdf8" strokeWidth="3" strokeOpacity="0.8" />

            <line x1={baseMapX(0)} y1={baseMapZ(-40)} x2={baseMapX(-30)} y2={baseMapZ(-40)} stroke="#451a03" strokeWidth="10" strokeDasharray="3 3" />
            <line x1={baseMapX(0)} y1={baseMapZ(-40)} x2={baseMapX(-30)} y2={baseMapZ(-40)} stroke="#f59e0b" strokeWidth="2.5" />

            <line x1={baseMapX(0)} y1={baseMapZ(-40)} x2={baseMapX(35)} y2={baseMapZ(-40)} stroke="#1e293b" strokeWidth="10" />
            <line x1={baseMapX(0)} y1={baseMapZ(-40)} x2={baseMapX(35)} y2={baseMapZ(-40)} stroke="#38bdf8" strokeWidth="2.5" />
            <line x1={baseMapX(35)} y1={baseMapZ(-40)} x2={baseMapX(35)} y2={baseMapZ(-72)} stroke="#831843" strokeWidth="10" />
            <line x1={baseMapX(35)} y1={baseMapZ(-40)} x2={baseMapX(35)} y2={baseMapZ(-72)} stroke="#ec4899" strokeWidth="2.5" />

            <line x1={baseMapX(0)} y1={baseMapZ(-40)} x2={baseMapX(0)} y2={baseMapZ(-60)} stroke="#450a0a" strokeWidth="8" strokeDasharray="2 2" />
            <line x1={baseMapX(0)} y1={baseMapZ(-40)} x2={baseMapX(0)} y2={baseMapZ(-60)} stroke="#ef4444" strokeWidth="2" strokeDasharray="2 2" />

            {/* Trajectory Line to Target */}
            {targetWaypoint && (
              <line
                x1={rover2DX}
                y1={rover2DZ}
                x2={baseMapX(targetWaypoint.x)}
                y2={baseMapZ(targetWaypoint.z)}
                stroke="#06b6d4"
                strokeWidth="2.5"
                strokeDasharray="4 3"
                className="animate-pulse"
              />
            )}

            {/* Target Reticle */}
            {targetWaypoint && (
              <g transform={`translate(${baseMapX(targetWaypoint.x)}, ${baseMapZ(targetWaypoint.z)})`}>
                <circle r="11" fill="none" stroke="#06b6d4" strokeWidth="2" className="animate-ping" opacity="0.8" />
                <circle r="7" fill="none" stroke="#06b6d4" strokeWidth="2" />
              </g>
            )}

            {/* Nodes */}
            {MINE_WAYPOINTS.map((wp) => {
              const nx = baseMapX(wp.x);
              const nz = baseMapZ(wp.z);
              const isSelected = targetWaypoint?.name === wp.name;

              let textAnchor: "start" | "end" = "start";
              let textDx = 11;
              if (wp.x > 20) {
                textAnchor = "end";
                textDx = -11;
              }

              return (
                <g
                  key={wp.name}
                  transform={`translate(${nx}, ${nz})`}
                  onClick={() => handleSelectWaypoint(wp)}
                  className="cursor-pointer group"
                >
                  <circle
                    r={isSelected ? "9" : "7"}
                    fill={wp.color}
                    stroke="#020617"
                    strokeWidth="2"
                    className="transition-all group-hover:scale-125"
                  />
                  <text
                    x={textDx}
                    y="-2"
                    fill="#f8fafc"
                    fontSize="8.5"
                    fontWeight="bold"
                    fontFamily="monospace"
                    textAnchor={textAnchor}
                    className="select-none pointer-events-none group-hover:fill-cyan-400 drop-shadow-[0_1px_3px_rgba(0,0,0,0.9)]"
                  >
                    {wp.label}
                  </text>
                </g>
              );
            })}

            {/* Rover Marker */}
            <g transform={`translate(${rover2DX}, ${rover2DZ}) rotate(${heading})`}>
              <polygon points="0,-10 -7,8 7,8" fill="#facc15" stroke="#000" strokeWidth="1.5" />
            </g>
          </g>
        </svg>

        {/* Tactical Legend Bar */}
        <div className="bg-slate-900 border-t border-slate-800 px-2 py-1 flex items-center justify-between text-[9px] text-slate-300">
          <div className="flex items-center gap-2">
            <span>● ROVER</span>
            <span className="text-pink-400">● VICTIM</span>
            <span className="text-amber-400">▲ HAZARD</span>
            <span className="text-red-400">■ BLOCKAGE</span>
          </div>
          {targetWaypoint ? (
            <span className="text-cyan-400 font-bold flex items-center gap-1">
              <Navigation className="w-3 h-3 animate-spin" style={{ animationDuration: "3s" }} />
              {targetWaypoint.name}
            </span>
          ) : (
            <span className="text-slate-500">CLICK NODE FOR AUTOPILOT</span>
          )}
        </div>
      </div>
    </div>
  );
}
