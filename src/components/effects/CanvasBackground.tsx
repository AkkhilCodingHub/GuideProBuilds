"use client";

import { useRef, useMemo, useState, useEffect } from "react";
import { Canvas, useFrame } from "@react-three/fiber";
import { Points, PointMaterial } from "@react-three/drei";
import * as THREE from "three";
import { usePathname } from "next/navigation";

function generateParticles(count: number, radius: number) {
  const positions = new Float32Array(count * 3);
  for (let i = 0; i < count; i++) {
    const r = radius * Math.cbrt(Math.random());
    const theta = Math.random() * 2 * Math.PI;
    const phi = Math.acos(2 * Math.random() - 1);
    
    positions[i * 3] = r * Math.sin(phi) * Math.cos(theta);
    positions[i * 3 + 1] = r * Math.sin(phi) * Math.sin(theta);
    positions[i * 3 + 2] = r * Math.cos(phi);
  }
  return positions;
}

import { MeshDistortMaterial, Sphere } from "@react-three/drei";

function LusionBlob() {
  const ref = useRef<THREE.Mesh>(null);
  
  useFrame((state) => {
    if (!ref.current) return;
    ref.current.rotation.x = state.clock.getElapsedTime() * 0.1;
    ref.current.rotation.y = state.clock.getElapsedTime() * 0.15;
    
    const targetX = (state.pointer.x * Math.PI) / 10;
    const targetY = (state.pointer.y * Math.PI) / 10;
    ref.current.rotation.y += 0.05 * (targetX - ref.current.rotation.y);
    ref.current.rotation.x += 0.05 * (targetY - ref.current.rotation.x);
  });

  return (
    <Sphere ref={ref} args={[3.5, 64, 64]} position={[0, 0, -2]}>
      <MeshDistortMaterial
        color="#06b6d4"
        envMapIntensity={0.5}
        clearcoat={0.8}
        clearcoatRoughness={0}
        metalness={0.9}
        roughness={0.1}
        distort={0.4}
        speed={2}
        transparent
        opacity={0.3}
      />
    </Sphere>
  );
}

function ParticleField() {
  const ref = useRef<THREE.Points>(null);
  
  const sphere = useMemo(() => generateParticles(4000, 15), []);
  
  useFrame((state, delta) => {
    if (!ref.current) return;
    
    ref.current.rotation.x -= delta / 10;
    ref.current.rotation.y -= delta / 15;
    
    const targetX = (state.pointer.x * Math.PI) / 8;
    const targetY = (state.pointer.y * Math.PI) / 8;
    
    ref.current.rotation.y += 0.02 * (targetX - ref.current.rotation.y);
    ref.current.rotation.x += 0.02 * (targetY - ref.current.rotation.x);
  });

  return (
    <group rotation={[0, 0, Math.PI / 4]}>
      <Points ref={ref} positions={sphere} stride={3} frustumCulled={false}>
        <PointMaterial
          transparent
          color="#00ffff"
          size={0.03}
          sizeAttenuation={true}
          depthWrite={false}
          blending={THREE.AdditiveBlending}
          opacity={0.6}
        />
      </Points>
    </group>
  );
}

export function CanvasBackground() {
  const [mounted, setMounted] = useState(false);
  const pathname = usePathname();

  useEffect(() => {
    setMounted(true);
  }, []);

  if (!mounted) return null;

  return (
    <div className="fixed inset-0 z-[-1] bg-black pointer-events-none">
      <Canvas camera={{ position: [0, 0, 8], fov: 60 }}>
        <ambientLight intensity={0.5} />
        <directionalLight position={[10, 10, 5]} intensity={1} color="#06b6d4" />
        <directionalLight position={[-10, -10, -5]} intensity={0.5} color="#10b981" />
        <LusionBlob />
        <ParticleField />
        {}
        <fog attach="fog" args={["#000000", 5, 15]} />
      </Canvas>
    </div>
  );
}
