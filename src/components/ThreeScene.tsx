'use client';

import { useRef, useMemo, Suspense } from 'react';
import { Canvas, useFrame } from '@react-three/fiber';
import * as THREE from 'three';

function Particles() {
  const COUNT = 1800;
  const ref = useRef<THREE.Points>(null);

  const geo = useMemo(() => {
    const positions = new Float32Array(COUNT * 3);
    const colors = new Float32Array(COUNT * 3);
    const palette = [
      new THREE.Color('#00f5ff'),
      new THREE.Color('#9d00ff'),
      new THREE.Color('#ff0070'),
      new THREE.Color('#00ff41'),
    ];
    for (let i = 0; i < COUNT; i++) {
      positions[i * 3]     = (Math.random() - 0.5) * 28;
      positions[i * 3 + 1] = (Math.random() - 0.5) * 18;
      positions[i * 3 + 2] = (Math.random() - 0.5) * 12 - 4;
      const c = palette[Math.floor(Math.random() * 4)];
      colors[i * 3]     = c.r;
      colors[i * 3 + 1] = c.g;
      colors[i * 3 + 2] = c.b;
    }
    const g = new THREE.BufferGeometry();
    g.setAttribute('position', new THREE.BufferAttribute(positions, 3));
    g.setAttribute('color', new THREE.BufferAttribute(colors, 3));
    return g;
  }, []);

  useFrame(({ clock }) => {
    if (!ref.current) return;
    ref.current.rotation.y = clock.getElapsedTime() * 0.012;
    ref.current.rotation.x = Math.sin(clock.getElapsedTime() * 0.007) * 0.08;
  });

  return (
    <points ref={ref} geometry={geo}>
      <pointsMaterial
        size={0.022}
        vertexColors
        transparent
        opacity={0.85}
        sizeAttenuation
        depthWrite={false}
      />
    </points>
  );
}

function WireIco({ position, scale, speed, color }: {
  position: [number, number, number];
  scale: number;
  speed: number;
  color: string;
}) {
  const ref = useRef<THREE.Mesh>(null);
  useFrame(({ clock, mouse }) => {
    if (!ref.current) return;
    const t = clock.getElapsedTime();
    ref.current.rotation.x = t * speed * 0.7 + mouse.y * 0.4;
    ref.current.rotation.y = t * speed + mouse.x * 0.4;
  });
  return (
    <mesh ref={ref} position={position} scale={scale}>
      <icosahedronGeometry args={[1, 2]} />
      <meshBasicMaterial color={color} wireframe transparent opacity={0.12} />
    </mesh>
  );
}

function FloatingTorus() {
  const ref = useRef<THREE.Mesh>(null);
  useFrame(({ clock, mouse }) => {
    if (!ref.current) return;
    ref.current.rotation.z = clock.getElapsedTime() * 0.06;
    ref.current.rotation.x = 1.1 + mouse.y * 0.15;
    ref.current.rotation.y = mouse.x * 0.2;
  });
  return (
    <mesh ref={ref} position={[0, 0, -8]}>
      <torusGeometry args={[5, 0.015, 2, 150]} />
      <meshBasicMaterial color="#00f5ff" transparent opacity={0.08} />
    </mesh>
  );
}

function SecondTorus() {
  const ref = useRef<THREE.Mesh>(null);
  useFrame(({ clock, mouse }) => {
    if (!ref.current) return;
    ref.current.rotation.z = -clock.getElapsedTime() * 0.04;
    ref.current.rotation.x = 0.4 + mouse.y * 0.1;
    ref.current.rotation.y = clock.getElapsedTime() * 0.03;
  });
  return (
    <mesh ref={ref} position={[0, 0, -9]}>
      <torusGeometry args={[6.5, 0.012, 2, 150]} />
      <meshBasicMaterial color="#9d00ff" transparent opacity={0.06} />
    </mesh>
  );
}

export default function ThreeScene() {
  return (
    <div className="fixed inset-0 z-0 pointer-events-none">
      <Canvas
        camera={{ position: [0, 0, 10], fov: 55 }}
        gl={{ alpha: true, antialias: true, powerPreference: 'high-performance' }}
        style={{ background: 'transparent' }}
        dpr={[1, 1.5]}
      >
        <Suspense fallback={null}>
          <Particles />
          <WireIco position={[5, 1, -3]} scale={2.8} speed={0.07} color="#00f5ff" />
          <WireIco position={[-5, -1, -2]} scale={1.8} speed={0.1} color="#9d00ff" />
          <WireIco position={[2, -3, -5]} scale={1.2} speed={0.05} color="#ff0070" />
          <FloatingTorus />
          <SecondTorus />
        </Suspense>
      </Canvas>
    </div>
  );
}
