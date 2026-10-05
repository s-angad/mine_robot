"use client";

import React, { useMemo } from "react";
import * as THREE from "three";

interface TunnelProps {
  start: [number, number, number];
  end: [number, number, number];
  radius?: number;
  name: string;
  isHazard?: boolean;
  hazardType?: string;
}

export function TunnelSegment({
  start,
  end,
  radius = 3.5,
  name,
  isHazard = false,
  hazardType,
}: TunnelProps) {
  // Compute tunnel length, center, and rotation matrix
  const { position, rotation, length } = useMemo(() => {
    const pStart = new THREE.Vector3(...start);
    const pEnd = new THREE.Vector3(...end);
    const dir = new THREE.Vector3().subVectors(pEnd, pStart);
    const len = dir.length();
    const mid = new THREE.Vector3().addVectors(pStart, pEnd).multiplyScalar(0.5);

    // Compute rotation align with segment
    const orientation = new THREE.Matrix4();
    orientation.lookAt(pStart, pEnd, new THREE.Vector3(0, 1, 0));
    const rot = new THREE.Euler().setFromRotationMatrix(orientation);

    return { position: mid, rotation: rot, length: len };
  }, [start, end]);

  // Generate support arches along segment
  const supportBeams = useMemo(() => {
    const beams = [];
    const step = 6; // beam spacing in meters
    const count = Math.floor(length / step);
    const startVec = new THREE.Vector3(...start);
    const endVec = new THREE.Vector3(...end);
    const dir = new THREE.Vector3().subVectors(endVec, startVec).normalize();

    for (let i = 1; i <= count; i++) {
      const pos = new THREE.Vector3().addVectors(
        startVec,
        dir.clone().multiplyScalar(i * step)
      );
      beams.push(pos);
    }
    return beams;
  }, [start, end, length]);

  return (
    <group>
      {/* Outer Rock Tunnel Mesh (Inverted Cylinder / Custom Box with dark coal texture) */}
      <mesh position={position} rotation={rotation}>
        <boxGeometry args={[radius * 2, radius * 2, length]} />
        <meshStandardMaterial
          color={isHazard ? "#2a1515" : "#1a1e24"}
          roughness={0.9}
          metalness={0.2}
          side={THREE.BackSide}
        />
      </mesh>

      {/* Mine Floor */}
      <mesh position={[position.x, start[1] - radius + 0.1, position.z]} rotation={rotation}>
        <boxGeometry args={[radius * 1.8, 0.2, length]} />
        <meshStandardMaterial color="#2d2822" roughness={0.95} metalness={0.1} />
      </mesh>

      {/* Support Timber Arches & Mine Lights along tunnel */}
      {supportBeams.map((beamPos, idx) => (
        <group key={`beam-${name}-${idx}`} position={[beamPos.x, beamPos.y, beamPos.z]} rotation={rotation}>
          {/* Left Vertical Arch Post */}
          <mesh position={[-radius + 0.3, 0, 0]}>
            <boxGeometry args={[0.3, radius * 1.8, 0.3]} />
            <meshStandardMaterial color="#5c3a21" roughness={0.8} />
          </mesh>
          {/* Right Vertical Arch Post */}
          <mesh position={[radius - 0.3, 0, 0]}>
            <boxGeometry args={[0.3, radius * 1.8, 0.3]} />
            <meshStandardMaterial color="#5c3a21" roughness={0.8} />
          </mesh>
          {/* Overhead Horizontal Arch Beam */}
          <mesh position={[0, radius - 0.4, 0]}>
            <boxGeometry args={[radius * 2 - 0.4, 0.3, 0.3]} />
            <meshStandardMaterial color="#4a2e1a" roughness={0.8} />
          </mesh>

          {/* Overhead Mine Utilities: Pipes & Cables */}
          <mesh position={[-radius + 0.8, radius - 0.7, 0]} rotation={[Math.PI / 2, 0, 0]}>
            <cylinderGeometry args={[0.1, 0.1, 0.3, 8]} />
            <meshStandardMaterial color="#fbbf24" metalness={0.7} roughness={0.3} />
          </mesh>

          {/* Mine Hanging LED Lamp (Every 2nd arch) */}
          {idx % 2 === 0 && (
            <group position={[0, radius - 0.7, 0]}>
              <mesh>
                <boxGeometry args={[0.2, 0.3, 0.2]} />
                <meshStandardMaterial color="#fbbf24" emissive="#f59e0b" emissiveIntensity={1.5} />
              </mesh>
              <pointLight color="#fed7aa" intensity={4} distance={14} decay={2} />
            </group>
          )}
        </group>
      ))}

      {/* Hazard Zone Atmospheric Glow / Warning Mesh */}
      {isHazard && (
        <mesh position={position} rotation={rotation}>
          <boxGeometry args={[radius * 1.7, radius * 1.7, length * 0.9]} />
          <meshBasicMaterial
            color={hazardType === "METHANE" ? "#f59e0b" : "#ef4444"}
            transparent
            opacity={0.06}
          />
        </mesh>
      )}
    </group>
  );
}

export function TunnelNetwork() {
  return (
    <group>
      {/* Main Tunnel A: Entrance (0, 0, 0) to Junction 1 (0, 0, -40) */}
      <TunnelSegment
        start={[0, 1.8, 5]}
        end={[0, 1.8, -40]}
        name="TUNNEL_A"
      />

      {/* Junction 1 Chamber Box */}
      <mesh position={[0, 1.8, -40]}>
        <boxGeometry args={[10, 5, 10]} />
        <meshStandardMaterial color="#1a1e24" roughness={0.9} side={THREE.BackSide} />
      </mesh>

      {/* Tunnel B (Left Hazard Zone): Junction 1 (0, 0, -40) to Methane Zone (-35, 0, -40) */}
      <TunnelSegment
        start={[0, 1.8, -40]}
        end={[-35, 1.8, -40]}
        name="TUNNEL_B_HAZARD"
        isHazard={true}
        hazardType="METHANE"
      />

      {/* Tunnel C (Right Branch to Victim): Junction 1 (0, 0, -40) to Junction 2 (35, 0, -40) */}
      <TunnelSegment
        start={[0, 1.8, -40]}
        end={[35, 1.8, -40]}
        name="TUNNEL_C_ENTRY"
      />

      {/* Tunnel C Continuation (Down to Victim Zone): (35, 0, -40) to (35, 0, -75) */}
      <TunnelSegment
        start={[35, 1.8, -40]}
        end={[35, 1.8, -75]}
        name="TUNNEL_C_VICTIM"
      />

      {/* Dead-End & Collapsed Tunnel: Junction 1 (0, 0, -40) to (0, 0, -70) */}
      <TunnelSegment
        start={[0, 1.8, -40]}
        end={[0, 1.8, -70]}
        name="TUNNEL_DEADEND"
        isHazard={true}
        hazardType="COLLAPSE"
      />

      {/* Mine Floor Track Rails along Main Tunnel A */}
      <group position={[0, 0.25, -18]}>
        <mesh position={[-0.8, 0, 0]}>
          <boxGeometry args={[0.08, 0.08, 48]} />
          <meshStandardMaterial color="#94a3b8" metalness={0.9} roughness={0.2} />
        </mesh>
        <mesh position={[0.8, 0, 0]}>
          <boxGeometry args={[0.08, 0.08, 48]} />
          <meshStandardMaterial color="#94a3b8" metalness={0.9} roughness={0.2} />
        </mesh>
      </group>

      {/* Open Industrial Mine Entrance Portal Arch (No solid blocking wall) */}
      <group position={[0, 1.8, 5]}>
        {/* Left Portal Pillar */}
        <mesh position={[-3.8, 0, 0]}>
          <boxGeometry args={[0.8, 4.5, 0.8]} />
          <meshStandardMaterial color="#4a2e1a" roughness={0.8} />
        </mesh>
        {/* Right Portal Pillar */}
        <mesh position={[3.8, 0, 0]}>
          <boxGeometry args={[0.8, 4.5, 0.8]} />
          <meshStandardMaterial color="#4a2e1a" roughness={0.8} />
        </mesh>
        {/* Top Arch Beam */}
        <mesh position={[0, 2.2, 0]}>
          <boxGeometry args={[8.4, 0.8, 0.8]} />
          <meshStandardMaterial color="#3a1e0a" roughness={0.8} />
        </mesh>
        {/* Warning Sign Board */}
        <mesh position={[0, 2.8, 0.45]}>
          <boxGeometry args={[5, 0.6, 0.1]} />
          <meshStandardMaterial color="#991b1b" emissive="#7f1d1d" emissiveIntensity={0.5} />
        </mesh>
        {/* Entrance Spotlights */}
        <pointLight position={[0, 1.8, 2]} color="#fed7aa" intensity={12} distance={25} />
      </group>

      {/* Collapsed Tunnel Blockage Debris at (0, 1.8, -62) */}
      <group position={[0, 0.8, -62]}>
        <mesh position={[0, 0.5, 0]} rotation={[0.4, 0.2, 0]}>
          <dodecahedronGeometry args={[2.2, 1]} />
          <meshStandardMaterial color="#3f3b37" roughness={0.95} />
        </mesh>
        <mesh position={[-1.2, 0.8, 0.5]} rotation={[0.1, 0.6, 0.3]}>
          <dodecahedronGeometry args={[1.5, 0]} />
          <meshStandardMaterial color="#2d2926" roughness={0.95} />
        </mesh>
        <mesh position={[1.5, 0.4, -0.3]}>
          <dodecahedronGeometry args={[1.8, 1]} />
          <meshStandardMaterial color="#4a443f" roughness={0.95} />
        </mesh>
        {/* Collapse Danger Light */}
        <pointLight position={[0, 2, 0]} color="#ef4444" intensity={8} distance={10} />
      </group>
    </group>
  );
}
