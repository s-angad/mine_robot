"use client";

import React, { useRef } from "react";
import { useFrame } from "@react-three/fiber";
import * as THREE from "three";
import { useMissionStore } from "@/store/useMissionStore";
import { Html, useGLTF } from "@react-three/drei";

// Mine Tunnel Collision Clamping Engine
function clampToMineBounds(x: number, z: number): { x: number; z: number } {
  let clampedX = x;
  let clampedZ = z;

  // Entrance Limit (Cannot exit past portal at Z = +4.5)
  clampedZ = Math.min(4.5, clampedZ);

  // Check if inside Junction 1 Box (-43.0 <= Z <= -37.0)
  const inJunction1 = clampedZ <= -37.0 && clampedZ >= -43.0;

  if (inJunction1) {
    // Inside Junction 1: Can turn Left into Tunnel B (X < 0) or Right into Tunnel C (X > 0)
    clampedX = Math.max(-33.5, Math.min(35.5, clampedX));
    clampedZ = Math.max(-43.0, Math.min(-37.0, clampedZ));
  } else if (clampedZ > -37.0) {
    // Main Tunnel A (-37.0 < Z <= +4.5): Clamped within tunnel width [-2.4, 2.4]
    clampedX = Math.max(-2.4, Math.min(2.4, clampedX));
  } else if (clampedZ < -43.0) {
    // Below Junction 1: Either Tunnel C Victim Zone (X near +35) or Dead-End Collapse (X near 0)
    if (clampedX > 20.0) {
      // Tunnel C Victim Shaft (X in [32.5, 37.5])
      clampedX = Math.max(32.5, Math.min(37.5, clampedX));
      clampedZ = Math.max(-74.0, clampedZ); // End of Tunnel C limit
    } else {
      // Dead-End Shaft (X in [-2.4, 2.4]) -> Stop before Collapsed Debris at Z = -62
      clampedX = Math.max(-2.4, Math.min(2.4, clampedX));
      clampedZ = Math.max(-60.5, clampedZ);
    }
  }

  // Branch Tunnels Width Clamping
  if (clampedX < -2.4) {
    // Tunnel B (Methane Hazard Zone)
    clampedX = Math.max(-33.5, clampedX);
    clampedZ = Math.max(-42.5, Math.min(-37.5, clampedZ));
  } else if (clampedX > 2.4 && clampedZ >= -43.0) {
    // Tunnel C Entry Branch
    clampedX = Math.min(35.5, clampedX);
    clampedZ = Math.max(-42.5, Math.min(-37.5, clampedZ));
  }

  return { x: clampedX, z: clampedZ };
}

// Custom GLB 3D Model Component loaded from /public/models/rover.glb
function CustomGLBModel() {
  const { scene } = useGLTF("/models/rover.glb");
  const clonedScene = React.useMemo(() => {
    const c = scene.clone();
    c.traverse((child) => {
      if ((child as THREE.Mesh).isMesh) {
        child.castShadow = true;
        child.receiveShadow = true;
      }
    });
    return c;
  }, [scene]);

  return (
    <group position={[0, 0.1, 0]} rotation={[0, -Math.PI / 2, 0]}>
      <primitive object={clonedScene} scale={1.2} />
    </group>
  );
}

export function Rover() {
  const groupRef = useRef<THREE.Group>(null);
  const bodyRef = useRef<THREE.Group>(null);
  const wheelsRef = useRef<(THREE.Mesh | null)[]>([]);
  const frontSteerGroupRef = useRef<(THREE.Group | null)[]>([]);

  const updateRoverTransform = useMissionStore((state) => state.updateRoverTransform);

  // Vehicle Physics & Dynamics State Refs
  const posRef = useRef<{ x: number; y: number; z: number }>({ x: 0, y: 0.4, z: 0 });
  const headingRef = useRef<number>(0);         // Yaw angle (deg)
  const velocityRef = useRef<number>(0);        // Forward/backward velocity (m/s)
  const steerAngleRef = useRef<number>(0);      // Front wheel steer angle (deg: -32 to +32)
  const wheelRotationRef = useRef<number>(0);   // Wheel axle spin angle (rad)
  const pitchRef = useRef<number>(0);           // Acceleration nose pitch (rad)
  const rollRef = useRef<number>(0);            // Cornering suspension roll (rad)
  const lastSyncTimeRef = useRef<number>(0);    // Throttle timestamp for Zustand store sync

  // Real Vehicle Physics Loop (60 FPS)
  useFrame(({ clock }, delta) => {
    if (!groupRef.current) return;

    const storeState = useMissionStore.getState();
    const isDemoRunning = storeState.isDemoRunning;
    const controlInputs = storeState.controlInputs;
    const maxSpeed = storeState.targetSpeed;
    const targetWaypoint = storeState.targetWaypoint;

    if (!isDemoRunning) {
      // 1. Throttle & Steering Input Processing
      let throttle = 0; // +1 forward, -1 reverse
      let steeringInput = 0; // -1 left, +1 right

      if (controlInputs.forward) throttle += 1;
      if (controlInputs.backward) throttle -= 1;
      if (controlInputs.left) steeringInput -= 1;
      if (controlInputs.right) steeringInput += 1;

      // Click-to-Travel Auto-Pilot Navigation Engine
      if (targetWaypoint && throttle === 0 && steeringInput === 0) {
        const dx = targetWaypoint.x - posRef.current.x;
        const dz = targetWaypoint.z - posRef.current.z;
        const dist = Math.hypot(dx, dz);

        if (dist < 1.2) {
          storeState.setTargetWaypoint(null);
          storeState.addEvent({
            timestamp: new Date().toLocaleTimeString("en-US", { hour12: true }),
            elapsedSec: 0,
            title: `Waypoint Reached: ${targetWaypoint.name}`,
            description: `AEGIS-MR01 arrived at target coordinates (${targetWaypoint.x.toFixed(1)}, ${targetWaypoint.z.toFixed(1)}).`,
            type: "SYSTEM",
          });
        } else {
          // Desired heading calculation
          const targetHeadingRad = Math.atan2(dx, -dz);
          let targetHeadingDeg = (targetHeadingRad * 180) / Math.PI;
          targetHeadingDeg = (targetHeadingDeg + 360) % 360;

          let diff = targetHeadingDeg - headingRef.current;
          while (diff < -180) diff += 360;
          while (diff > 180) diff -= 360;

          if (Math.abs(diff) > 8) {
            steeringInput = diff > 0 ? 1 : -1;
          }
          throttle = 1;
        }
      }

      // 2. Smooth Steering Wheel Kinematics (-32° to +32°)
      const maxSteerDeg = 32;
      const steerSpeed = 120; // deg/sec
      if (steeringInput !== 0) {
        steerAngleRef.current += steeringInput * steerSpeed * delta;
        steerAngleRef.current = THREE.MathUtils.clamp(steerAngleRef.current, -maxSteerDeg, maxSteerDeg);
      } else {
        // Auto-center steering wheel when released
        steerAngleRef.current *= Math.pow(0.05, delta);
      }

      // 3. Vehicle Velocity Acceleration & Friction Drag
      const accelRate = 4.5; // m/s^2
      const dragRate = 3.5;  // m/s^2
      const brakeRate = 12.0; // m/s^2 E-STOP

      if (controlInputs.emergencyStop) {
        // Emergency Brake
        if (velocityRef.current > 0) {
          velocityRef.current = Math.max(0, velocityRef.current - brakeRate * delta);
        } else {
          velocityRef.current = Math.min(0, velocityRef.current + brakeRate * delta);
        }
      } else if (throttle !== 0) {
        // Accelerating
        const targetVel = throttle * maxSpeed;
        if (throttle > 0) {
          velocityRef.current = Math.min(targetVel, velocityRef.current + accelRate * delta);
        } else {
          velocityRef.current = Math.max(targetVel, velocityRef.current - accelRate * delta);
        }
      } else {
        // Friction Drag Deceleration
        if (velocityRef.current > 0) {
          velocityRef.current = Math.max(0, velocityRef.current - dragRate * delta);
        } else if (velocityRef.current < 0) {
          velocityRef.current = Math.min(0, velocityRef.current + dragRate * delta);
        }
      }

      // 4. Turning Kinematics (Dual Mode: Dynamic Car Curves + Zero-Radius Stationary Pivot)
      const steerRad = (steerAngleRef.current * Math.PI) / 180;
      let yawRateDeg = 0;

      if (Math.abs(velocityRef.current) > 0.05) {
        // Dynamic vehicle curve turning when moving
        const wheelbase = 1.8; // meters
        const turnYawRateRad = (velocityRef.current / wheelbase) * Math.sin(steerRad);
        yawRateDeg = (turnYawRateRad * 180) / Math.PI;
      } else if (steeringInput !== 0) {
        // Zero-radius skid-steer pivot turning in place when stationary
        yawRateDeg = steeringInput * 65.0; // 65 deg/sec pivot
        wheelRotationRef.current += steeringInput * delta * 4;
      }

      headingRef.current += yawRateDeg * delta;
      headingRef.current = (headingRef.current + 360) % 360;

      // 5. Directional Vector Displacement
      const headingRad = (headingRef.current * Math.PI) / 180;
      const nextX = posRef.current.x + Math.sin(headingRad) * velocityRef.current * delta;
      const nextZ = posRef.current.z - Math.cos(headingRad) * velocityRef.current * delta;

      // 6. Mine Wall Collision Clamping
      const clampedPos = clampToMineBounds(nextX, nextZ);
      posRef.current.x = clampedPos.x;
      posRef.current.z = clampedPos.z;

      // 7. Suspension Body Pitch & Roll Dynamics
      const targetPitch = -throttle * 0.03 + (controlInputs.emergencyStop ? 0.06 : 0);
      pitchRef.current = THREE.MathUtils.lerp(pitchRef.current, targetPitch, 0.1);

      const targetRoll = -steerRad * (velocityRef.current / maxSpeed) * 0.08;
      rollRef.current = THREE.MathUtils.lerp(rollRef.current, targetRoll, 0.1);

      const wheelRadius = 0.35;
      wheelRotationRef.current += (velocityRef.current / wheelRadius) * delta;

      // Throttle Zustand store telemetry sync to ~12 Hz to prevent React re-render lagging
      const now = clock.getElapsedTime();
      if (now - lastSyncTimeRef.current > 0.08) {
        lastSyncTimeRef.current = now;
        storeState.updateRoverTransform(
          { x: posRef.current.x, y: posRef.current.y, z: posRef.current.z },
          headingRef.current,
          Math.abs(velocityRef.current)
        );
      }
    } else {
      // Demo Mode sync
      const storePos = storeState.telemetry.position;
      posRef.current = { x: storePos.x, y: storePos.y, z: storePos.z };
      headingRef.current = storeState.telemetry.heading;
      velocityRef.current = storeState.telemetry.speed;
      wheelRotationRef.current += (velocityRef.current / 0.35) * delta;
    }

    // 8. Apply Transformations & Body Lean to 3D Meshes
    const bounceY = 0.4 + Math.sin(clock.getElapsedTime() * 8) * 0.003 * Math.abs(velocityRef.current);
    groupRef.current.position.set(posRef.current.x, bounceY, posRef.current.z);
    groupRef.current.rotation.y = (headingRef.current * Math.PI) / 180;

    // Apply Pitch & Roll to Chassis Body
    if (bodyRef.current) {
      bodyRef.current.rotation.x = pitchRef.current;
      bodyRef.current.rotation.z = rollRef.current;
    }

    // Front Wheels Steering Angle Pivot
    frontSteerGroupRef.current.forEach((steerGroup) => {
      if (steerGroup) {
        steerGroup.rotation.y = (steerAngleRef.current * Math.PI) / 180;
      }
    });

    // All Wheels Axle Rotation
    wheelsRef.current.forEach((wheel) => {
      if (wheel) {
        wheel.rotation.x = wheelRotationRef.current;
      }
    });
  });

  return (
    <group ref={groupRef} position={[0, 0.4, 0]}>
      {/* Chassis Body Group (Applies Suspension Pitch & Roll Dynamics) */}
      <group ref={bodyRef}>
        {/* User-provided 3D GLB Model (loaded from /public/models/rover.glb) */}
        <React.Suspense
          fallback={
            <mesh position={[0, 0.35, 0]}>
              <boxGeometry args={[1.6, 0.5, 2.4]} />
              <meshStandardMaterial color="#eab308" metalness={0.8} roughness={0.3} />
            </mesh>
          }
        >
          <CustomGLBModel />
        </React.Suspense>

        {/* Dual High-Intensity LED Headlights (Spotlights) */}
        <group position={[0, 0.4, -1.0]}>
          <spotLight
            position={[0, 0, 0]}
            target-position={[0, -0.5, -15]}
            color="#fef08a"
            intensity={18}
            angle={Math.PI / 4}
            penumbra={0.4}
            distance={30}
          />
        </group>
      </group>

      {/* 3D Active Sonar Pulse Waves (Life Detection Pulse) */}
      <SonarPulseEffect />

      {/* Communication Antenna Flashing Beacon */}
      <group position={[0, 1.2, 0.6]}>
        <pointLight position={[0, 0, 0]} color="#ef4444" intensity={4} distance={6} />
      </group>

      {/* Tactical Rover 3D Badge */}
      <Html position={[0, 1.8, 0]} center>
        <div className="bg-slate-950/95 border border-cyan-500/80 px-2.5 py-1 rounded-md text-[10px] font-mono text-cyan-300 font-bold whitespace-nowrap shadow-2xl flex items-center gap-2 backdrop-blur-md">
          <span className="w-2 h-2 rounded-full bg-cyan-400 animate-ping" />
          AEGIS-MR01 [LIVE MODEL]
        </div>
      </Html>
    </group>
  );
}

// 3D Sonar Life Detection Acoustic Wave Rings Visualizer
function SonarPulseEffect() {
  const ring1Ref = useRef<THREE.Mesh>(null);
  const ring2Ref = useRef<THREE.Mesh>(null);
  const ring3Ref = useRef<THREE.Mesh>(null);

  const isSonarActive = useMissionStore(
    (state) => state.isSonarScanning || state.telemetry.thermal.humanDetected || state.isDemoRunning
  );

  useFrame(({ clock }) => {
    const elapsed = clock.getElapsedTime();
    const speed = isSonarActive ? 2.5 : 1.2;

    if (ring1Ref.current) {
      const t1 = (elapsed * speed) % 2;
      const s1 = 1 + t1 * 6;
      ring1Ref.current.scale.set(s1, 1, s1);
      (ring1Ref.current.material as THREE.MeshBasicMaterial).opacity = Math.max(0, 0.7 * (1 - t1 / 2));
    }

    if (ring2Ref.current) {
      const t2 = ((elapsed * speed) + 0.6) % 2;
      const s2 = 1 + t2 * 6;
      ring2Ref.current.scale.set(s2, 1, s2);
      (ring2Ref.current.material as THREE.MeshBasicMaterial).opacity = Math.max(0, 0.6 * (1 - t2 / 2));
    }

    if (ring3Ref.current) {
      const t3 = ((elapsed * speed) + 1.2) % 2;
      const s3 = 1 + t3 * 6;
      ring3Ref.current.scale.set(s3, 1, s3);
      (ring3Ref.current.material as THREE.MeshBasicMaterial).opacity = Math.max(0, 0.5 * (1 - t3 / 2));
    }
  });

  return (
    <group position={[0, 0.08, 0]}>
      <mesh ref={ring1Ref} rotation={[-Math.PI / 2, 0, 0]}>
        <ringGeometry args={[0.8, 1.0, 32]} />
        <meshBasicMaterial color="#06b6d4" transparent opacity={0.5} side={THREE.DoubleSide} />
      </mesh>
      <mesh ref={ring2Ref} rotation={[-Math.PI / 2, 0, 0]}>
        <ringGeometry args={[0.8, 1.0, 32]} />
        <meshBasicMaterial color="#38bdf8" transparent opacity={0.4} side={THREE.DoubleSide} />
      </mesh>
      <mesh ref={ring3Ref} rotation={[-Math.PI / 2, 0, 0]}>
        <ringGeometry args={[0.8, 1.0, 32]} />
        <meshBasicMaterial color="#a5f3fc" transparent opacity={0.3} side={THREE.DoubleSide} />
      </mesh>
    </group>
  );
}
