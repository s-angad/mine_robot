from pydantic import BaseModel, Field
from typing import Optional, List

class Position3D(BaseModel):
    x: float = 0.0
    y: float = 0.4
    z: float = 0.0

class BatteryStatus(BaseModel):
    level: float = 100.0
    voltage: float = 12.6
    current: float = 1.4
    power: float = 17.64

class SensorReadings(BaseModel):
    ch4: float = 0.35
    co: float = 8.0
    co2: float = 700.0
    o2: float = 20.8
    h2s: float = 0.0
    temperature: float = 25.0
    humidity: float = 62.0

class ThermalDetection(BaseModel):
    humanDetected: bool = False
    confidence: float = 0.0
    distance: float = 0.0
    direction: float = 0.0
    tempAnomaly: float = 0.0

class CommunicationState(BaseModel):
    signal: float = 100.0
    connected: bool = True
    qualityText: str = "EXCELLENT"

class HazardState(BaseModel):
    type: str = "NONE"
    severity: str = "NORMAL"
    description: str = "All systems operational"

class NavigationState(BaseModel):
    currentTunnel: str = "ENTRANCE"
    nearestJunction: str = "JUNCTION_1"
    distanceTraveled: float = 0.0
    heading: float = 0.0
    speed: float = 0.0

class TelemetryData(BaseModel):
    roverId: str = "AEGIS-MR01"
    timestamp: float = 0.0
    position: Position3D = Field(default_factory=Position3D)
    heading: float = 0.0
    speed: float = 0.0
    battery: BatteryStatus = Field(default_factory=BatteryStatus)
    sensors: SensorReadings = Field(default_factory=SensorReadings)
    thermal: ThermalDetection = Field(default_factory=ThermalDetection)
    communication: CommunicationState = Field(default_factory=CommunicationState)
    hazard: HazardState = Field(default_factory=HazardState)
    navigation: NavigationState = Field(default_factory=NavigationState)
    mode: str = "TELEOPERATION"
