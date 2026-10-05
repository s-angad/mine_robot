"use client";

import { useEffect, useRef } from "react";
import { useMissionStore } from "@/store/useMissionStore";
import { TelemetryData } from "@/types/telemetry";

export function useTelemetry() {
  const updateTelemetry = useMissionStore((state) => state.updateTelemetry);
  const addEvent = useMissionStore((state) => state.addEvent);
  const telemetry = useMissionStore((state) => state.telemetry);
  const isDemoRunning = useMissionStore((state) => state.isDemoRunning);
  const isDemoPaused = useMissionStore((state) => state.isDemoPaused);

  const wsRef = useRef<WebSocket | null>(null);
  const isConnectedRef = useRef<boolean>(false);
  const demoStepRef = useRef<number>(0);

  // 1. WebSocket Connection to Python FastAPI Backend (Deployed / Local)
  useEffect(() => {
    const defaultWsUrl = typeof window !== "undefined" && window.location.protocol === "https:"
      ? "wss://mine-robot.onrender.com/ws/telemetry"
      : "wss://mine-robot.onrender.com/ws/telemetry";

    const wsUrl = process.env.NEXT_PUBLIC_WS_URL || defaultWsUrl;
    let ws: WebSocket | null = null;
    let reconnectTimeout: NodeJS.Timeout | null = null;
    let isDisposed = false;

    const connect = () => {
      if (isDisposed) return;
      try {
        ws = new WebSocket(wsUrl);
        wsRef.current = ws;

        ws.onopen = () => {
          if (isDisposed) return;
          isConnectedRef.current = true;
          updateTelemetry({
            communication: { signal: 100, connected: true, qualityText: "EXCELLENT", wifiSignal: 100, fiveGSignal: 96, loraSignal: 98 },
          });
          addEvent({
            timestamp: new Date().toLocaleTimeString(),
            elapsedSec: 0,
            title: "WebSocket Telemetry Connected",
            description: "Live connection established with deployed FastAPI backend (mine-robot.onrender.com)",
            type: "SYSTEM",
          });
        };

        ws.onmessage = (event) => {
          if (isDisposed) return;
          try {
            const data: TelemetryData = JSON.parse(event.data);
            const currentPos = useMissionStore.getState().telemetry.position;
            // If backend sends default (0,0.4,0) position while rover has moved, preserve active teleoperated position
            if (
              data.position &&
              data.position.x === 0 &&
              data.position.z === 0 &&
              (currentPos.x !== 0 || currentPos.z !== 0)
            ) {
              delete (data as any).position;
              delete (data as any).heading;
              delete (data as any).speed;
            }
            updateTelemetry(data);
          } catch (e) {
            console.error("Failed to parse telemetry JSON", e);
          }
        };

        ws.onclose = () => {
          if (isDisposed) return;
          isConnectedRef.current = false;
          updateTelemetry({
            communication: { signal: 85, connected: false, qualityText: "DEGRADED", wifiSignal: 80, fiveGSignal: 70, loraSignal: 90 },
          });
          // Attempt auto-reconnect after 5 seconds if disconnected
          reconnectTimeout = setTimeout(connect, 5000);
        };

        ws.onerror = () => {
          if (isDisposed) return;
          isConnectedRef.current = false;
        };
      } catch (e) {
        console.log("Backend WS offline, using client simulation engine");
        if (!isDisposed) {
          reconnectTimeout = setTimeout(connect, 5000);
        }
      }
    };

    connect();

    return () => {
      isDisposed = true;
      if (reconnectTimeout) clearTimeout(reconnectTimeout);
      if (ws) {
        ws.onopen = null;
        ws.onmessage = null;
        ws.onclose = null;
        ws.onerror = null;
        ws.close();
      }
    };
  }, [updateTelemetry, addEvent]);

  // 2. Client-side Local Simulation & Demo Scenario Engine (Fallback / Standalone)
  useEffect(() => {
    const interval = setInterval(() => {
      const state = useMissionStore.getState();
      const pos = state.telemetry.position;

      // Calculate distance to environmental zones
      // Zone 2: Methane Leak in Tunnel B (-35, 0, -40)
      const distMethane = Math.hypot(pos.x - (-25), pos.z - (-40));
      // Zone 6: Victim Location in Tunnel C (35, 0, -72)
      const distVictim = Math.hypot(pos.x - 35, pos.z - (-72));

      // 1. Dynamic Gas & Environment Simulation based on location
      let ch4 = 0.35;
      let temp = 25.0;
      let o2 = 20.8;
      let hazardType: any = "NONE";
      let severity: any = "NORMAL";
      let description = "All systems operational";

      // If near Methane Leak
      if (distMethane < 25) {
        const factor = 1 - distMethane / 25;
        ch4 = 0.35 + factor * 3.2; // ramps up to 3.55%
        temp = 25.0 + factor * 7.0;
        if (ch4 >= 1.5) {
          hazardType = "METHANE_LEAK";
          severity = "CRITICAL";
          description = `CRITICAL METHANE LEAK DETECTED (${ch4.toFixed(2)}%)`;
        } else if (ch4 >= 0.8) {
          hazardType = "METHANE_LEAK";
          severity = "WARNING";
          description = `Elevated Methane Level (${ch4.toFixed(2)}%)`;
        }
      }

      // 2. Thermal Victim Detection Simulation
      let humanDetected = false;
      let confidence = 0;
      let distance = 0;
      let tempAnomaly = 0;

      if (distVictim < 15) {
        humanDetected = true;
        distance = distVictim;
        confidence = Math.min(99, Math.floor(100 - distVictim * 4));
        tempAnomaly = 9.7;

        if (!state.telemetry.thermal.humanDetected) {
          addEvent({
            timestamp: new Date().toLocaleTimeString(),
            elapsedSec: Math.floor(state.demoElapsedTime),
            title: "🚨 VICTIM DETECTED",
            description: `Thermal camera detected human heat signature at (35.0, 0.4, -72.0) with ${confidence}% confidence`,
            type: "VICTIM",
          });
        }
      }

      // 3. Battery Discharge Simulation
      const newBatteryLevel = Math.max(0, state.telemetry.battery.level - 0.005);

      // Update telemetry state
      updateTelemetry({
        sensors: {
          ...state.telemetry.sensors,
          ch4,
          temperature: temp,
          o2,
        },
        thermal: {
          humanDetected,
          confidence,
          distance,
          direction: 18,
          tempAnomaly,
          position: { x: 35, y: 0.4, z: -72 },
        },
        battery: {
          ...state.telemetry.battery,
          level: newBatteryLevel,
        },
        hazard: {
          type: hazardType,
          severity: severity,
          description: description,
        },
      });

      // 4. Autonomous Demo Scenario Player (SCENARIO_01)
      if (state.isDemoRunning && !state.isDemoPaused) {
        const speed = 2.0;
        let { x: dx, y: dy, z: dz } = state.telemetry.position;
        let heading = state.telemetry.heading;

        // Path waypoints for demo sequence: Entrance -> Tunnel A -> Junction 1 -> Tunnel C -> Victim
        const waypoints = [
          { x: 0, z: -35, heading: 0 },    // Waypoint 1: Down Tunnel A
          { x: 0, z: -40, heading: 90 },   // Waypoint 2: Junction 1 turning right
          { x: 35, z: -40, heading: 180 }, // Waypoint 3: Tunnel C turning down
          { x: 35, z: -70, heading: 180 }, // Waypoint 4: Reaching Victim Zone
        ];

        let target = waypoints[demoStepRef.current];
        if (target) {
          const distX = target.x - dx;
          const distZ = target.z - dz;
          const dist = Math.hypot(distX, distZ);

          if (dist < 1.0) {
            demoStepRef.current = Math.min(waypoints.length - 1, demoStepRef.current + 1);
          } else {
            const angle = (Math.atan2(distX, -distZ) * 180) / Math.PI;
            heading = (angle + 360) % 360;
            const rad = (heading * Math.PI) / 180;

            dx += Math.sin(rad) * speed * 0.1;
            dz -= Math.cos(rad) * speed * 0.1;

            useMissionStore.getState().updateRoverTransform({ x: dx, y: dy, z: dz }, heading, speed);
          }
        }
      }
    }, 100); // 10 Hz simulation loop

    return () => clearInterval(interval);
  }, [updateTelemetry, addEvent]);
}
