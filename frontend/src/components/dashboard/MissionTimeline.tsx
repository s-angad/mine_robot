"use client";

import React from "react";
import { History, Download, AlertTriangle, Info, UserCheck } from "lucide-react";
import { useMissionStore } from "@/store/useMissionStore";

export function MissionTimeline() {
  const events = useMissionStore((state) => state.events);
  const telemetry = useMissionStore((state) => state.telemetry);

  const exportJSON = () => {
    const dataStr = "data:text/json;charset=utf-8," + encodeURIComponent(JSON.stringify({ telemetry, events }, null, 2));
    const downloadAnchor = document.createElement("a");
    downloadAnchor.setAttribute("href", dataStr);
    downloadAnchor.setAttribute("download", `AEGIS_Mission_Report_${Date.now()}.json`);
    document.body.appendChild(downloadAnchor);
    downloadAnchor.click();
    downloadAnchor.remove();
  };

  const exportCSV = () => {
    let csvContent = "data:text/csv;charset=utf-8,Timestamp,ElapsedSec,Type,Title,Description\n";
    events.forEach((e) => {
      csvContent += `"${e.timestamp}",${e.elapsedSec},"${e.type}","${e.title}","${e.description}"\n`;
    });
    const encodedUri = encodeURI(csvContent);
    const link = document.createElement("a");
    link.setAttribute("href", encodedUri);
    link.setAttribute("download", `AEGIS_Mission_Log_${Date.now()}.csv`);
    document.body.appendChild(link);
    link.click();
    link.remove();
  };

  return (
    <div className="bg-[#050811]/90 backdrop-blur-xl border border-cyan-950/60 rounded-xl p-3 text-slate-200 font-mono text-xs select-none shadow-[0_0_20px_rgba(0,0,0,0.6)] flex flex-col h-full">
      <div className="flex items-center justify-between pb-2 border-b border-slate-800/80 mb-2">
        <span className="font-bold text-cyan-400 flex items-center gap-1.5 uppercase tracking-wider text-[11px]">
          <History className="w-3.5 h-3.5 text-cyan-400" /> MISSION AUDIT LOG & EVENTS
        </span>
        <div className="flex items-center gap-1.5">
          <button
            onClick={exportCSV}
            className="px-2 py-0.5 bg-slate-900 hover:bg-cyan-950 text-cyan-300 rounded text-[10px] flex items-center gap-1 border border-cyan-900/60 transition-colors font-bold"
            title="Export CSV Log"
          >
            <Download className="w-3 h-3" /> CSV
          </button>
          <button
            onClick={exportJSON}
            className="px-2 py-0.5 bg-slate-900 hover:bg-cyan-950 text-cyan-300 rounded text-[10px] flex items-center gap-1 border border-cyan-900/60 transition-colors font-bold"
            title="Export Full JSON Report"
          >
            <Download className="w-3 h-3" /> JSON
          </button>
        </div>
      </div>

      {/* Log Entries Container */}
      <div className="flex-1 overflow-y-auto max-h-40 pr-1 space-y-1.5 scrollbar-thin scrollbar-thumb-slate-800">
        {events.map((evt) => (
          <div
            key={evt.id}
            className="p-2 rounded-lg bg-slate-900/80 border border-slate-800/80 flex items-start gap-2 text-[11px] hover:border-slate-700 transition-colors"
          >
            <span className="text-[10px] text-slate-500 shrink-0 mt-0.5 font-bold" suppressHydrationWarning>
              {evt.timestamp}
            </span>
            <div className="flex-1">
              <div className="flex items-center gap-1.5">
                {evt.type === "CRITICAL" || evt.type === "WARNING" ? (
                  <AlertTriangle className="w-3.5 h-3.5 text-amber-400 shrink-0" />
                ) : evt.type === "VICTIM" ? (
                  <UserCheck className="w-3.5 h-3.5 text-rose-400 shrink-0" />
                ) : (
                  <Info className="w-3.5 h-3.5 text-cyan-400 shrink-0" />
                )}
                <span className="font-bold text-slate-200 text-[11px]">{evt.title}</span>
              </div>
              <p className="text-slate-400 text-[10px] mt-0.5 leading-relaxed">{evt.description}</p>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
