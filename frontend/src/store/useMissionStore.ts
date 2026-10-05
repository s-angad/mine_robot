import { create } from "zustand";
import {
  TelemetryData,
  CameraMode,
  RoverMode,
  MissionEvent,
  Position3D,
  HazardState,
  ModularPayload,
} from "@/types/telemetry";

export interface ControlInputs {
  forward: boolean;
  backward: boolean;
  left: boolean;
  right: boolean;
  emergencyStop: boolean;
}

export interface TargetWaypoint {
  x: number;
  z: number;
  name: string;
}

interface MissionStore {
  // Telemetry & Rover State
  telemetry: TelemetryData;
  cameraMode: CameraMode;
  roverMode: RoverMode;
  targetSpeed: number; // m/s
  controlInputs: ControlInputs;

  // Navigation & Target Waypoints
  targetWaypoint: TargetWaypoint | null;

  // Sonar & Life Detection Capabilities
  isSonarScanning: boolean;
  sonarScanned: boolean;
  rescuePayloadDeployed: boolean;

  // Demo Scenario State
  isDemoRunning: boolean;
  isDemoPaused: boolean;
  demoElapsedTime: number; // seconds

  // Event Log & Alerts
  events: MissionEvent[];
  activeAlerts: HazardState[];

  // Graph / Navigation
  activeRoute: string[];

  // Actions
  updateTelemetry: (partial: Partial<TelemetryData>) => void;
  setCameraMode: (mode: CameraMode) => void;
  setRoverMode: (mode: RoverMode) => void;
  setTargetSpeed: (speed: number) => void;
  setControlInput: (input: keyof ControlInputs, value: boolean) => void;
  triggerEmergencyStop: () => void;
  setTargetWaypoint: (waypoint: TargetWaypoint | null) => void;
  setActivePayload: (payload: ModularPayload) => void;
  
  // Rover Position mutation for local simulation
  updateRoverTransform: (pos: Position3D, heading: number, speed: number) => void;

  // Tactical Actions
  triggerSonarScan: () => void;
  deployRescuePayload: () => void;

  // Demo Controls
  startDemo: () => void;
  pauseDemo: () => void;
  resumeDemo: () => void;
  resetDemo: () => void;

  // Log & Alert Actions
  addEvent: (event: Omit<MissionEvent, "id">) => void;
  clearEvents: () => void;
}

const initialTelemetry: TelemetryData = {
  roverId: "AEGIS-MR01",
  timestamp: 0,
  position: { x: 0, y: 0.4, z: 0 },
  heading: 0,
  speed: 0,
  battery: {
    level: 100.0,
    voltage: 12.6,
    current: 1.4,
    power: 17.64,
    batteryA: 100.0,
    batteryB: 100.0,
  },
  sensors: {
    ch4: 0.35,
    co: 8.0,
    co2: 700.0,
    o2: 20.8,
    h2s: 0.0,
    temperature: 25.0,
    humidity: 62.0,
  },
  thermal: {
    humanDetected: false,
    confidence: 0,
    distance: 0,
    direction: 0,
    tempAnomaly: 0,
  },
  communication: {
    signal: 100,
    connected: true,
    qualityText: "EXCELLENT",
    wifiSignal: 100,
    fiveGSignal: 96,
    loraSignal: 98,
  },
  hazard: {
    type: "NONE",
    severity: "NORMAL",
    description: "All systems operational",
  },
  navigation: {
    currentTunnel: "ENTRANCE",
    nearestJunction: "JUNCTION_1",
    distanceTraveled: 0.0,
    heading: 0,
    speed: 0,
  },
  compliance: {
    explosionProof: true,
    standardText: "IECEx / ATEX Zone 1 Flameproof Certified",
  },
  mode: "TELEOPERATION",
  activePayload: "RECON_SENSORS",
};

export const useMissionStore = create<MissionStore>((set, get) => ({
  telemetry: initialTelemetry,
  cameraMode: "TACTICAL_ORBIT",
  roverMode: "TELEOPERATION",
  targetSpeed: 1.5,
  controlInputs: {
    forward: false,
    backward: false,
    left: false,
    right: false,
    emergencyStop: false,
  },

  targetWaypoint: null,
  isSonarScanning: false,
  sonarScanned: false,
  rescuePayloadDeployed: false,

  isDemoRunning: false,
  isDemoPaused: false,
  demoElapsedTime: 0,

  events: [
    {
      id: "evt-init",
      timestamp: "00:00:00 AM",
      elapsedSec: 0,
      title: "SIH PS 26218 Modular System Ready",
      description: "AEGIS-MR01 Modular Search & Rescue Robot online at Mine Entrance",
      type: "SYSTEM",
    },
  ],
  activeAlerts: [],
  activeRoute: ["ENTRANCE", "TUNNEL_A", "JUNCTION_1", "TUNNEL_B", "VICTIM_ZONE"],

  updateTelemetry: (partial) =>
    set((state) => ({
      telemetry: { ...state.telemetry, ...partial },
    })),

  setCameraMode: (mode) => set({ cameraMode: mode }),
  setRoverMode: (mode) =>
    set((state) => ({
      roverMode: mode,
      telemetry: { ...state.telemetry, mode },
    })),

  setTargetSpeed: (speed) => set({ targetSpeed: speed }),

  setActivePayload: (payload) => {
    set((state) => ({
      telemetry: { ...state.telemetry, activePayload: payload },
    }));

    const labelMap: Record<ModularPayload, string> = {
      RECON_SENSORS: "CD10 Gas Recon & 3D Sonar/LiDAR SLAM Module",
      MEDICAL_RESCUE_PACK: "Emergency Medical Supply Drop & Bio-Telemetry Pack",
      HAZMAT_SAMPLER: "Toxic Gas Sampler & Air Purifier Module",
    };

    get().addEvent({
      timestamp: new Date().toLocaleTimeString("en-US", { hour12: true }),
      elapsedSec: Math.round(get().demoElapsedTime),
      title: `Modular Payload Swapped: ${payload}`,
      description: `AEGIS-MR01 reconfigured with ${labelMap[payload]}.`,
      type: "SYSTEM",
    });
  },

  setControlInput: (input, value) =>
    set((state) => ({
      controlInputs: {
        ...state.controlInputs,
        [input]: value,
        ...(input === "forward" || input === "backward" || input === "left" || input === "right"
          ? { emergencyStop: false }
          : {}),
      },
    })),

  triggerEmergencyStop: () =>
    set((state) => ({
      targetWaypoint: null,
      controlInputs: {
        forward: false,
        backward: false,
        left: false,
        right: false,
        emergencyStop: true,
      },
      telemetry: {
        ...state.telemetry,
        speed: 0,
      },
    })),

  setTargetWaypoint: (waypoint) => set({ targetWaypoint: waypoint }),

  updateRoverTransform: (pos, heading, speed) =>
    set((state) => ({
      telemetry: {
        ...state.telemetry,
        position: pos,
        heading: heading,
        speed: speed,
        navigation: {
          ...state.telemetry.navigation,
          heading: heading,
          speed: speed,
        },
      },
    })),

  triggerSonarScan: () => {
    const state = get();
    if (state.isSonarScanning) return;
    set({ isSonarScanning: true, sonarScanned: true });

    state.addEvent({
      timestamp: new Date().toLocaleTimeString("en-US", { hour12: true }),
      elapsedSec: Math.round(state.demoElapsedTime),
      title: "Sonar Pulse Initiated",
      description: "3D Acoustic Wave pulse scanning mine shaft for human vital signals.",
      type: "SYSTEM",
    });

    setTimeout(() => {
      set({ isSonarScanning: false });
      const currentPos = get().telemetry.position;
      const distToVictim = Math.hypot(currentPos.x - 35, currentPos.z - (-72));
      if (distToVictim < 25) {
        set((s) => ({
          telemetry: {
            ...s.telemetry,
            thermal: {
              humanDetected: true,
              confidence: 96,
              distance: distToVictim,
              direction: 45,
              tempAnomaly: 9.7,
            },
          },
        }));

        get().addEvent({
          timestamp: new Date().toLocaleTimeString("en-US", { hour12: true }),
          elapsedSec: Math.round(get().demoElapsedTime),
          title: "Life Echo Signal Detected!",
          description: `Sonar sweep detected trapped miner at ${distToVictim.toFixed(1)}m in Tunnel C. Heart Rate: 72 BPM, SpO2: 98%.`,
          type: "VICTIM",
        });
      }
    }, 2800);
  },

  deployRescuePayload: () => {
    const state = get();
    if (state.rescuePayloadDeployed) return;
    set({ rescuePayloadDeployed: true });

    state.addEvent({
      timestamp: new Date().toLocaleTimeString("en-US", { hour12: true }),
      elapsedSec: Math.round(state.demoElapsedTime),
      title: "Rescue Payload Deployed",
      description: "Emergency Oxygen Cylinder & High-Frequency Comms Relay Capsule dropped at victim location.",
      type: "VICTIM",
    });
  },

  startDemo: () =>
    set({
      isDemoRunning: true,
      isDemoPaused: false,
      roverMode: "AUTONOMOUS_DEMO",
    }),

  pauseDemo: () => set({ isDemoPaused: true }),
  resumeDemo: () => set({ isDemoPaused: false }),
  resetDemo: () =>
    set({
      isDemoRunning: false,
      isDemoPaused: false,
      demoElapsedTime: 0,
      roverMode: "TELEOPERATION",
      targetWaypoint: null,
      isSonarScanning: false,
      sonarScanned: false,
      rescuePayloadDeployed: false,
      telemetry: initialTelemetry,
    }),

  addEvent: (event) =>
    set((state) => ({
      events: [
        {
          ...event,
          id: `evt-${Date.now()}-${Math.random().toString(36).substring(2, 7)}`,
        },
        ...state.events,
      ],
    })),

  clearEvents: () => set({ events: [] }),
}));
