export type HazardSeverity = "NORMAL" | "WARNING" | "CRITICAL";

export type HazardType =
  | "NONE"
  | "METHANE_LEAK"
  | "HIGH_TEMPERATURE"
  | "LOW_OXYGEN"
  | "COLLAPSED_TUNNEL"
  | "COMMUNICATION_LOSS";

export type RoverMode = "TELEOPERATION" | "ASSISTED" | "AUTONOMOUS_DEMO";

export type CameraMode = "TACTICAL_ORBIT" | "ROVER_RGB" | "ROVER_THERMAL";

export type ModularPayload = "RECON_SENSORS" | "MEDICAL_RESCUE_PACK" | "HAZMAT_SAMPLER";

export interface Position3D {
  x: number;
  y: number;
  z: number;
}

export interface BatteryStatus {
  level: number;       // overall percentage 0..100
  voltage: number;     // Volts (e.g. 12.6V)
  current: number;     // Amps (e.g. 1.8A)
  power: number;       // Watts
  batteryA: number;    // Primary Lithium Cell 0..100%
  batteryB: number;    // Redundant Backup Cell 0..100%
}

export interface SensorReadings {
  ch4: number;         // CD10 Methane % (normal ~0.35%)
  co: number;          // CD10 Carbon Monoxide ppm (normal ~8 ppm)
  co2: number;         // CD10 Carbon Dioxide ppm (normal ~700 ppm)
  o2: number;          // CD10 Oxygen % (normal ~20.8%)
  h2s: number;         // CD10 Hydrogen Sulfide ppm (normal 0 ppm)
  temperature: number; // CD10 °C (normal ~25°C)
  humidity: number;    // CD10 % (normal ~62%)
}

export interface ThermalDetection {
  humanDetected: boolean;
  confidence: number;   // 0..100 %
  distance: number;     // meters
  direction: number;    // degrees
  tempAnomaly: number;  // delta °C (e.g. +9.7°C)
  position?: Position3D;
}

export interface CommunicationState {
  signal: number;      // 0..100 %
  connected: boolean;
  qualityText: "EXCELLENT" | "DEGRADED" | "CRITICAL" | "LOST";
  wifiSignal: number;  // Wi-Fi 6 %
  fiveGSignal: number; // 5G Mesh %
  loraSignal: number;  // LoRaWAN %
}

export interface HazardState {
  type: HazardType;
  severity: HazardSeverity;
  description: string;
  location?: string;
}

export interface NavigationState {
  currentTunnel: string;
  nearestJunction: string;
  distanceTraveled: number; // meters
  heading: number;          // degrees (0..360)
  speed: number;            // m/s
}

export interface ComplianceState {
  explosionProof: boolean;
  standardText: string; // e.g. "IECEx / ATEX Zone 1 Certified"
}

export interface TelemetryData {
  roverId: string;
  timestamp: number;
  position: Position3D;
  heading: number;
  speed: number;
  battery: BatteryStatus;
  sensors: SensorReadings;
  thermal: ThermalDetection;
  communication: CommunicationState;
  hazard: HazardState;
  navigation: NavigationState;
  mode: RoverMode;
  compliance: ComplianceState;
  activePayload: ModularPayload;
}

export interface MissionEvent {
  id: string;
  timestamp: string;
  elapsedSec: number;
  title: string;
  description: string;
  type: "INFO" | "WARNING" | "CRITICAL" | "VICTIM" | "SYSTEM";
}
