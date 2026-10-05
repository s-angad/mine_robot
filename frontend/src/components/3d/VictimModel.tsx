"use client";

import React, { useRef } from "react";
import { useFrame } from "@react-three/fiber";
import * as THREE from "three";
import { Html } from "@react-three/drei";
import { useMissionStore } from "@/store/useMissionStore";

export function VictimModel() {
  const meshGroupRef = useRef<THREE.Group>(null);
  const glowRef = useRef<THREE.Mesh>(null);
  const humanDetected = useMissionStore((state) => state.telemetry.thermal.humanDetected);

  // Position in Tunnel C Victim Zone
  const victimPos: [number, number, number] = [35, 0.4, -72];

  useFrame(({ clock }) => {
    if (glowRef.current) {
      const t = clock.getElapsedTime();
      const scale = 1 + Math.sin(t * 3) * 0.08;
      glowRef.current.scale.set(scale, scale, scale);
    }
  });

  return (
    <group ref={meshGroupRef} position={victimPos}>
      {/* Human Silhouette Figure (Crouched Miner) */}
      <group position={[0, 0.5, 0]}>
        {/* Head with Miner Helmet */}
        <mesh position={[0, 0.7, 0]}>
          <sphereGeometry args={[0.22, 16, 16]} />
          <meshStandardMaterial color="#f97316" roughness={0.6} />
        </mesh>
        {/* Headlamp */}
        <mesh position={[0, 0.75, -0.2]}>
          <boxGeometry args={[0.1, 0.08, 0.08]} />
          <meshStandardMaterial color="#fef08a" emissive="#fef08a" emissiveIntensity={0.8} />
        </mesh>
        {/* Torso */}
        <mesh position={[0, 0.35, 0]} rotation={[0.3, 0, 0]}>
          <boxGeometry args={[0.45, 0.6, 0.3]} />
          <meshStandardMaterial color="#c2410c" roughness={0.7} />
        </mesh>
        {/* Arms folded */}
        <mesh position={[0.25, 0.3, -0.1]} rotation={[0.4, -0.2, 0]}>
          <cylinderGeometry args={[0.08, 0.08, 0.4, 8]} />
          <meshStandardMaterial color="#9a3412" />
        </mesh>
        <mesh position={[-0.25, 0.3, -0.1]} rotation={[0.4, 0.2, 0]}>
          <cylinderGeometry args={[0.08, 0.08, 0.4, 8]} />
          <meshStandardMaterial color="#9a3412" />
        </mesh>
      </group>

      {/* Debris / Rock Pile near Victim */}
      <mesh position={[0.4, 0.3, 0.3]} rotation={[0.2, 0.5, 0.1]}>
        <dodecahedronGeometry args={[0.6, 0]} />
        <meshStandardMaterial color="#3f3b37" roughness={0.9} />
      </mesh>

      {/* Thermal Heat Signature Aura (Infrared Glow) */}
      <mesh ref={glowRef} position={[0, 0.6, 0]}>
        <sphereGeometry args={[0.9, 16, 16]} />
        <meshBasicMaterial color="#ec4899" transparent opacity={0.25} wireframe />
      </mesh>

      {/* Thermal Point Light (36.8°C Body Heat Signal) */}
      <pointLight position={[0, 0.8, 0]} color="#ec4899" intensity={6} distance={8} />

      {/* Compact Non-Scaling 3D Beacon Badge */}
      <Html position={[0, 1.5, 0]} center>
        <div className="bg-slate-950/95 border border-pink-500/80 px-2 py-0.5 rounded text-[10px] font-mono text-pink-300 font-bold whitespace-nowrap shadow-2xl flex items-center gap-1.5 backdrop-blur-md">
          <span className="w-1.5 h-1.5 rounded-full bg-pink-500 animate-ping" />
          {humanDetected ? "VICTIM DETECTED" : "THERMAL ANOMALY (+9.7°C)"}
        </div>
      </Html>
    </group>
  );
}
