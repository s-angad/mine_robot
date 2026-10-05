"use client";

import React, { useRef, useMemo } from "react";
import { Canvas, useFrame } from "@react-three/fiber";
import { OrbitControls } from "@react-three/drei";
import type { OrbitControls as OrbitControlsImpl } from "three-stdlib";
import * as THREE from "three";
import { useMissionStore } from "@/store/useMissionStore";
import { TunnelNetwork } from "./TunnelNetwork";
import { Rover } from "./Rover";
import { VictimModel } from "./VictimModel";

// Dynamic 3D Camera System following model smooth position & heading without lag or clipping
function DynamicCameraSystem() {
  const controlsRef = useRef<OrbitControlsImpl>(null);
  const cameraMode = useMissionStore((state) => state.cameraMode);
  const pos = useMissionStore((state) => state.telemetry.position);
  const heading = useMissionStore((state) => state.telemetry.heading);

  useFrame(({ camera }) => {
    const { x, y, z } = pos;
    const headingRad = (heading * Math.PI) / 180;

    if (cameraMode === "ROVER_RGB" || cameraMode === "ROVER_THERMAL") {
      // First-person perspective mounted on front bumper of 3D GLB model
      const camX = x + Math.sin(headingRad) * 0.8;
      const camY = y + 0.75;
      const camZ = z - Math.cos(headingRad) * 0.8;

      const targetX = x + Math.sin(headingRad) * 12.0;
      const targetY = y + 0.5;
      const targetZ = z - Math.cos(headingRad) * 12.0;

      camera.position.set(camX, camY, camZ);
      camera.lookAt(targetX, targetY, targetZ);
    } else if (cameraMode === "TACTICAL_ORBIT") {
      // 3rd Person Tactical Orbit Camera: Moves camera position & target alongside the rover
      const offsetDist = 6.0;
      const offsetHeight = 3.2;

      const targetCamX = x - Math.sin(headingRad) * offsetDist;
      const targetCamY = y + offsetHeight;
      const targetCamZ = z + Math.cos(headingRad) * offsetDist;

      const targetLookAt = new THREE.Vector3(x, y + 0.6, z);
      const desiredCamPos = new THREE.Vector3(targetCamX, targetCamY, targetCamZ);

      if (controlsRef.current) {
        // Lerp both target AND camera position smoothly to prevent camera getting left behind in darkness
        controlsRef.current.target.lerp(targetLookAt, 0.12);
        camera.position.lerp(desiredCamPos, 0.12);
        controlsRef.current.update();
      }
    }
  });

  return (
    <>
      {cameraMode === "TACTICAL_ORBIT" && (
        <OrbitControls
          ref={controlsRef}
          enableDamping
          dampingFactor={0.08}
          maxPolarAngle={Math.PI / 2 - 0.05} // Prevent camera clipping below mine floor
          minDistance={3.0}
          maxDistance={30}
        />
      )}
    </>
  );
}

// Floating Dust Particles in Mine Tunnels
function DustParticles({ count = 250 }) {
  const pointsRef = useRef<THREE.Points>(null);

  const particles = useMemo(() => {
    const positions = new Float32Array(count * 3);
    for (let i = 0; i < count; i++) {
      positions[i * 3] = (Math.random() - 0.5) * 80;
      positions[i * 3 + 1] = Math.random() * 4 + 0.2;
      positions[i * 3 + 2] = (Math.random() - 0.5) * 100;
    }
    return positions;
  }, [count]);

  useFrame((_, delta) => {
    if (pointsRef.current) {
      pointsRef.current.rotation.y += delta * 0.02;
    }
  });

  return (
    <points ref={pointsRef}>
      <bufferGeometry>
        <bufferAttribute
          attach="attributes-position"
          args={[particles, 3]}
        />
      </bufferGeometry>
      <pointsMaterial
        size={0.12}
        color="#fbbf24"
        transparent
        opacity={0.3}
        blending={THREE.AdditiveBlending}
      />
    </points>
  );
}

// Compact Telemetry Overlay for Viewport
function ViewportHUDOverlay() {
  const speed = useMissionStore((state) => state.telemetry.speed);
  const heading = useMissionStore((state) => state.telemetry.heading);
  const cameraMode = useMissionStore((state) => state.cameraMode);
  const zPos = useMissionStore((state) => state.telemetry.position.z);

  // Depth calculation based on Z coordinate displacement
  const depth = Math.round(-180 + zPos);

  return (
    <>
      {/* Top Left Title Subtitle Badge */}
      <div className="absolute top-2.5 left-2.5 z-10 bg-[#08111f]/90 backdrop-blur px-3 py-1 rounded border border-slate-800 text-[10px] font-mono text-cyan-400 font-bold flex items-center gap-2 shadow-md">
        <span className="w-2 h-2 rounded-full bg-cyan-400 animate-ping" />
        AEGIS-MR01 3D DIGITAL TWIN • LIVE SIMULATION
      </div>

      {/* Top Right Live Telemetry Overlay */}
      <div className="absolute top-2.5 right-2.5 z-10 bg-[#08111f]/90 backdrop-blur px-3 py-1.5 rounded border border-slate-800 text-[10px] font-mono text-slate-300 flex items-center gap-3 shadow-md">
        <div>
          <span className="text-slate-500">VELOCITY: </span>
          <strong className="text-cyan-400">{speed.toFixed(1)} m/s</strong>
        </div>
        <span>•</span>
        <div>
          <span className="text-slate-500">HEADING: </span>
          <strong className="text-yellow-400">{heading.toFixed(0).padStart(3, "0")}°</strong>
        </div>
        <span>•</span>
        <div>
          <span className="text-slate-500">DEPTH: </span>
          <strong className="text-slate-200">{depth} m</strong>
        </div>
        <span>•</span>
        <div>
          <span className="text-slate-500">MODE: </span>
          <strong className="text-emerald-400">{cameraMode}</strong>
        </div>
      </div>
    </>
  );
}

export function MineCanvas() {
  const cameraMode = useMissionStore((state) => state.cameraMode);

  return (
    <div className="relative w-full h-full bg-[#050811] overflow-hidden select-none">
      {/* Viewport HUD Overlays */}
      <ViewportHUDOverlay />

      {/* Thermal Overlay Filter Effect when in Thermal Mode */}
      {cameraMode === "ROVER_THERMAL" && (
        <div className="absolute inset-0 pointer-events-none z-10 mix-blend-color bg-gradient-to-b from-purple-950/40 via-pink-900/30 to-amber-950/40 border-4 border-pink-500/40" />
      )}

      <Canvas
        camera={{ position: [0, 5, 10], fov: 55 }}
        gl={{ antialias: true, powerPreference: "high-performance" }}
      >
        {/* Explicit 3D Dark Background Color */}
        <color attach="background" args={["#050811"]} />

        {/* Mine Atmospheric Fog matching dark background */}
        <fog attach="fog" args={["#050811", 5, cameraMode === "TACTICAL_ORBIT" ? 45 : 25]} />

        {/* Ambient & Directional Mine Shaft Lighting */}
        <ambientLight intensity={1.2} color="#cbd5e1" />
        <directionalLight position={[0, 20, 0]} intensity={1.0} color="#f8fafc" />

        {/* Smooth Dynamic Camera System */}
        <DynamicCameraSystem />

        {/* 3D Scene Objects */}
        <TunnelNetwork />
        <Rover />
        <VictimModel />
        <DustParticles />
      </Canvas>
    </div>
  );
}
