'use client';

import React, { useRef } from 'react';
import { Canvas, useFrame, useThree } from '@react-three/fiber';
import { ScrollControls, useScroll, Text, Float, Environment } from '@react-three/drei';
import * as THREE from 'three';

// Tek bir teknoloji katmanı (Slab/Bıçak) bileşeni
function TechLayer({ position, color, title, subTitle, glowColor, ...props }: any) {
  return (
    <group position={position} {...props}>
      {/* Ana Gövde (Şeffaf füme cam hissi) */}
      <mesh receiveShadow castShadow>
        <boxGeometry args={[4, 0.15, 2.5]} />
        <meshPhysicalMaterial 
          color="#111" 
          roughness={0.1} 
          metalness={0.9} 
          transmission={0.5} 
          thickness={0.5}
          ior={1.5}
          clearcoat={1}
        />
      </mesh>

      {/* Parlayan Kenar Çizgileri (Neon efekti) */}
      <mesh position={[0, 0, 0]}>
        <boxGeometry args={[4.02, 0.17, 2.52]} />
        <meshBasicMaterial color={glowColor} wireframe={true} transparent opacity={0.3} />
      </mesh>

      {/* Katman Metinleri */}
      <Text
        position={[-1.8, 0.2, 1]}
        fontSize={0.2}
        color="white"
        font="https://fonts.gstatic.com/s/robotomono/v12/L0x5DF4xlVMF-BfR8bXMIjhLq38.woff"
        anchorX="left"
        anchorY="middle"
      >
        {title}
      </Text>
      <Text
        position={[-1.8, -0.2, 1]}
        fontSize={0.12}
        color="#aaa"
        font="https://fonts.gstatic.com/s/robotomono/v12/L0x5DF4xlVMF-BfR8bXMIjhLq38.woff"
        anchorX="left"
        anchorY="middle"
      >
        {subTitle}
      </Text>
    </group>
  );
}

// Animasyonlu 3D Sahnemizin Ana Mantığı
function Scene() {
  const scroll = useScroll(); // Scroll verisini al (0'dan 1'e)
  const groupRef = useRef<THREE.Group>(null);
  const { viewport } = useThree();

  // Her render karesinde (frame) çalışır
  useFrame((state, delta) => {
    // Scroll ofsetini al (0 ile 1 arası)
    const offset = scroll.offset; 
    
    // Grubu scroll'a göre hafifçe döndür (interaktif his)
    if (groupRef.current) {
      groupRef.current.rotation.y = THREE.MathUtils.lerp(groupRef.current.rotation.y, offset * Math.PI * 0.2, 0.1);
      groupRef.current.rotation.x = THREE.MathUtils.lerp(groupRef.current.rotation.x, Math.PI * 0.1, 0.1);
    }

    // --- PARÇALANMA MANTIĞI (The Explosion) ---
    // offset 0 iken hepsi üst üste, 1 iken tamamen ayrılmış.
    const separationFactor = offset * 4.5; // Ne kadar ayrılacaklarını belirle

    // Katman 1 (En Üst - API) -> Yukarı gider
    state.scene.getObjectByName('layer1')?.position.setY(1.5 + separationFactor * 1.2);
    
    // Katman 2 (Logic) -> Hafif Yukarı gider
    state.scene.getObjectByName('layer2')?.position.setY(0.5 + separationFactor * 0.4);
    
    // Katman 3 (Automation) -> Yerinde kalır veya hafif aşağı
    state.scene.getObjectByName('layer3')?.position.setY(-0.5 - separationFactor * 0.4);
    
    // Katman 4 (Core - SQL) -> Çok aşağı gider
    state.scene.getObjectByName('layer4')?.position.setY(-1.5 - separationFactor * 1.2);
  });

  return (
    <>
      {/* Işıklandırma */}
      <ambientLight intensity={0.2} />
      <pointLight position={[10, 10, 10]} intensity={1.5} castShadow />
      <spotLight position={[-10, -10, -10]} intensity={0.5} color="#00ffff" />
      <Environment preset="city" />

      {/* 3D Model Grubu */}
      <group ref={groupRef} rotation={[Math.PI * 0.1, 0, 0]}>
        
        {/* Katmanlar (Varsayılan pozisyonlar scroll ile değişecek) */}
        <TechLayer 
          name="layer1"
          position={[0, 1.5, 0]} 
          glowColor="#00ffff" 
          title="01 / API_INTEGRATION_LAYER"
          subTitle="SOAP, RESTful, JSON, XML"
        />
        <TechLayer 
          name="layer2"
          position={[0, 0.5, 0]} 
          glowColor="#ff00ff" 
          title="02 / APPLICATION_LOGIC_ENGINE"
          subTitle="C#, Python, .NET Core"
        />
        <TechLayer 
          name="layer3"
          position={[0, -0.5, 0]} 
          glowColor="#ffff00" 
          title="03 / AUTOMATION_&_RPA"
          subTitle="Selenium, Custom Engines, Task Sched."
        />
        <TechLayer 
          name="layer4"
          position={[0, -1.5, 0]} 
          glowColor="#ff4400" 
          title="04 / DATA_&_INFRASTRUCTURE"
          subTitle="SQL Server, Docker, Git"
        />
        
        {/* Merkez Mil (Parçalanmayı vurgulayan dikey çizgi) */}
        <mesh position={[0, 0, 0]}>
          <cylinderGeometry args={[0.02, 0.02, 8, 8]} />
          <meshBasicMaterial color="#333" transparent opacity={0.3} />
        </mesh>
      </group>
    </>
  );
}

// Nihai Dışa Aktarılan Bileşen (Canvas ve Scroll Kontrolleri)
export default function ExplodedStackView() {
  return (
    <div className="w-full h-full fixed inset-0 z-0 bg-[#020408]">
      <Canvas 
        shadows 
        camera={{ position: [0, 0, 10], fov: 35 }} 
        dpr={[1, 2]} // Performans için retina ekran desteği
      >
        {/* ScrollControls: 3D sahneyi scroll'a bağlar. pages={3} sayfanın uzunluğunu belirler. */}
        <ScrollControls pages={3} damping={0.2} infinite={false}>
          <Scene />
        </ScrollControls>
      </Canvas>
    </div>
  );
}