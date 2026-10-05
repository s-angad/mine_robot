import asyncio
import time
import math
from fastapi import FastAPI, WebSocket, WebSocketDisconnect
from fastapi.middleware.cors import CORSMiddleware
try:
    from app.schemas.telemetry import TelemetryData, Position3D, SensorReadings, ThermalDetection, HazardState
except ImportError:
    from backend.app.schemas.telemetry import TelemetryData, Position3D, SensorReadings, ThermalDetection, HazardState

app = FastAPI(
    title="AEGIS Mine Rescue Backend",
    description="FastAPI WebSocket & REST API engine for SIH 2026 Mine Rescue 3D Digital Twin MVP",
    version="1.0.0",
)

# Enable CORS for Next.js frontend
app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

# Shared In-Memory Telemetry State
current_telemetry = TelemetryData()

class ConnectionManager:
    def __init__(self):
        self.active_connections: list[WebSocket] = []

    async def connect(self, websocket: WebSocket):
        await websocket.accept()
        self.active_connections.append(websocket)

    def disconnect(self, websocket: WebSocket):
        if websocket in self.active_connections:
            self.active_connections.remove(websocket)

    async def broadcast(self, message: str):
        for connection in self.active_connections:
            try:
                await connection.send_text(message)
            except Exception:
                pass

manager = ConnectionManager()

@app.get("/")
def read_root():
    return {
        "system": "AEGIS-MR01 Mine Rescue Digital Twin API",
        "status": "ONLINE",
        "sih": "SIH 2026 Problem Statement 26039",
    }

@app.get("/api/telemetry")
def get_telemetry():
    current_telemetry.timestamp = time.time()
    return current_telemetry.model_dump()

@app.websocket("/ws/telemetry")
async def websocket_telemetry(websocket: WebSocket):
    await manager.connect(websocket)
    try:
        while True:
            # Generate 10 Hz simulated telemetry ticks
            current_telemetry.timestamp = time.time()
            
            # Broadcast telemetry JSON
            await websocket.send_text(current_telemetry.model_dump_json())
            await asyncio.sleep(0.1) # 10 Hz
    except WebSocketDisconnect:
        manager.disconnect(websocket)
    except Exception as e:
        manager.disconnect(websocket)
