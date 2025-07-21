import React from 'react';
import { Canvas } from '@react-three/fiber';
import { OrbitControls } from '@react-three/drei';
import Sun from './Sun';

const Scene = () => {
  return (
    <Canvas camera={{ position: [0, 20, 30], fov: 45 }}>
      <ambientLight intensity={0.5} />
      <pointLight position={[10, 10, 10]} />
      <Sun />
      <OrbitControls />
    </Canvas>
  );
};

export default Scene;
