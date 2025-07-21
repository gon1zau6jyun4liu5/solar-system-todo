import React, { useState } from 'react';
import { Canvas } from '@react-three/fiber';
import { OrbitControls, Stars } from '@react-three/drei';
import SolarSystem from './SolarSystem';

const Scene = ({ isAnimationPlaying }) => {
  return (
    <Canvas 
      camera={{ 
        position: [0, 30, 50], 
        fov: 60,
        far: 1000,
        near: 0.1
      }}
    >
      {/* 우주 배경 */}
      <Stars 
        radius={300} 
        depth={100} 
        count={2000} 
        factor={6} 
        saturation={0} 
        fade={true} 
        speed={0.5}
      />
      
      {/* 조명 설정 */}
      <ambientLight intensity={0.3} />
      <pointLight position={[0, 0, 0]} intensity={2} distance={100} />
      <pointLight position={[100, 20, 0]} intensity={1.5} distance={80} />
      <pointLight position={[-80, 15, 60]} intensity={1.2} distance={70} />
      
      {/* 주 태양계 (우리 태양계) */}
      <SolarSystem 
        position={[0, 0, 0]} 
        isAnimationPlaying={isAnimationPlaying}
        systemName="main"
      />
      
      {/* 쌍성계 */}
      <SolarSystem 
        position={[100, 0, 0]} 
        isAnimationPlaying={isAnimationPlaying}
        systemName="binary"
      />
      
      {/* 원거리 태양계 */}
      <SolarSystem 
        position={[-80, 10, 60]} 
        isAnimationPlaying={isAnimationPlaying}
        systemName="distant"
      />
      
      {/* 확장된 카메라 컨트롤 */}
      <OrbitControls
        enablePan={true}
        enableZoom={true}
        enableRotate={true}
        zoomSpeed={2}
        panSpeed={2}
        rotateSpeed={1}
        minDistance={5}
        maxDistance={300}
        minPolarAngle={0}
        maxPolarAngle={Math.PI}
        target={[0, 0, 0]}
      />
    </Canvas>
  );
};

export default Scene;