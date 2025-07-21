import React from 'react';
import { Canvas } from '@react-three/fiber';
import { OrbitControls } from '@react-three/drei';
import SolarSystem from './SolarSystem';

const Scene = ({ todos, selectedCategory, onPlanetClick }) => {
  return (
    <Canvas 
      camera={{ position: [0, 30, 40], fov: 60 }}
      style={{ background: 'radial-gradient(ellipse at center, #1a1a2e 0%, #000000 100%)' }}
    >
      <ambientLight intensity={0.3} />
      <pointLight position={[0, 0, 0]} intensity={2} />
      <directionalLight position={[10, 10, 10]} intensity={0.5} />
      
      <SolarSystem 
        todos={todos || []}
        selectedCategory={selectedCategory}
        onPlanetClick={onPlanetClick}
      />
      
      <OrbitControls 
        enableZoom={true}
        enablePan={true}
        enableRotate={true}
        minDistance={15}
        maxDistance={100}
        autoRotate={false}
        autoRotateSpeed={0.1}
      />
      
      {/* 별들 배경 */}
      <mesh>
        <sphereGeometry args={[200, 32, 32]} />
        <meshBasicMaterial 
          color="#000011" 
          transparent 
          opacity={0.8} 
          side={1} // THREE.BackSide
        />
      </mesh>
    </Canvas>
  );
};

export default Scene;