import React, { useRef, useMemo } from 'react';
import { useFrame } from '@react-three/fiber';
import * as THREE from 'three';

/**
 * AI-powered Planet component
 * Represents medium-level todos orbiting around suns
 * - Orbital motion around sun
 * - Size based on priority
 * - Color based on category
 * - Rotation speed based on deadline
 */
const AIPlanet = ({ 
  todoData,
  sunPosition = [0, 0, 0],
  orbitRadius = 8,
  orbitSpeed = 0.01,
  initialAngle = 0,
  onClick,
  isSelected = false 
}) => {
  const meshRef = useRef();
  const groupRef = useRef();
  const orbitAngle = useRef(initialAngle);

  // Calculate visual properties from AI classification
  const visualProps = useMemo(() => {
    const vp = todoData.visualProperties;
    
    // Planet size (0.5 - 1.5 range)
    const size = 0.5 + (vp.sizeMultiplier - 0.7) * 2;
    
    // Category-based colors
    const categoryColors = {
      'work': '#4a90e2',      // Blue
      'personal': '#7ed321',   // Green
      'education': '#9013fe',  // Purple
      'finance': '#f5a623',    // Orange
      'home': '#bd10e0',       // Pink
      'health': '#50e3c2'      // Teal
    };
    
    const color = categoryColors[todoData.category] || '#888888';
    
    return {
      size,
      color,
      rotationSpeed: vp.rotationSpeed,
      brightness: vp.brightness,
      urgencyColor: vp.urgencyColor
    };
  }, [todoData]);

  // Animation loop
  useFrame((state, delta) => {
    if (groupRef.current && meshRef.current) {
      // Orbital motion around sun
      orbitAngle.current += orbitSpeed * (1 + visualProps.rotationSpeed * 50);
      
      const x = sunPosition[0] + Math.cos(orbitAngle.current) * orbitRadius;
      const z = sunPosition[2] + Math.sin(orbitAngle.current) * orbitRadius;
      const y = sunPosition[1] + Math.sin(orbitAngle.current * 0.5) * 2; // Slight vertical oscillation
      
      groupRef.current.position.set(x, y, z);
      
      // Planet rotation
      meshRef.current.rotation.y += visualProps.rotationSpeed;
      meshRef.current.rotation.x += visualProps.rotationSpeed * 0.3;
      
      // Urgent planets "wobble" more
      if (visualProps.rotationSpeed > 0.01) {
        meshRef.current.rotation.z = Math.sin(state.clock.elapsedTime * 10) * 0.2;
      }
    }
  });

  // Planet material with category coloring
  const planetMaterial = useMemo(() => new THREE.MeshStandardMaterial({
    color: visualProps.color,
    emissive: todoData.priority === 'high' ? visualProps.urgencyColor : '#000000',
    emissiveIntensity: todoData.priority === 'high' ? 0.3 : 0,
    roughness: 0.7,
    metalness: 0.3
  }), [visualProps.color, visualProps.urgencyColor, todoData.priority]);

  // Orbit trail material
  const orbitMaterial = useMemo(() => new THREE.LineBasicMaterial({
    color: visualProps.color,
    transparent: true,
    opacity: 0.3
  }), [visualProps.color]);

  // Create orbit path
  const orbitGeometry = useMemo(() => {
    const points = [];
    for (let i = 0; i <= 64; i++) {
      const angle = (i / 64) * Math.PI * 2;
      points.push(new THREE.Vector3(
        sunPosition[0] + Math.cos(angle) * orbitRadius,
        sunPosition[1],
        sunPosition[2] + Math.sin(angle) * orbitRadius
      ));
    }
    return new THREE.BufferGeometry().setFromPoints(points);
  }, [sunPosition, orbitRadius]);

  return (
    <group>
      {/* Orbit trail */}
      <line geometry={orbitGeometry} material={orbitMaterial} />
      
      {/* Planet group */}
      <group ref={groupRef}>
        <mesh 
          ref={meshRef}
          material={planetMaterial}
          onClick={(e) => {
            e.stopPropagation();
            onClick?.(todoData);
          }}
          onPointerOver={(e) => {
            e.stopPropagation();
            document.body.style.cursor = 'pointer';
          }}
          onPointerOut={() => {
            document.body.style.cursor = 'default';
          }}
        >
          <sphereGeometry args={[visualProps.size, 16, 16]} />
        </mesh>

        {/* Selection indicator */}
        {isSelected && (
          <mesh>
            <ringGeometry args={[visualProps.size * 1.3, visualProps.size * 1.5, 16]} />
            <meshBasicMaterial 
              color="#00aaff" 
              transparent 
              opacity={0.8}
              side={THREE.DoubleSide}
            />
          </mesh>
        )}

        {/* Priority indicator rings */}
        {todoData.priority === 'high' && (
          <>
            <mesh rotation={[Math.PI / 2, 0, 0]}>
              <ringGeometry args={[visualProps.size * 1.1, visualProps.size * 1.2, 16]} />
              <meshBasicMaterial 
                color={visualProps.urgencyColor} 
                transparent 
                opacity={0.6}
                side={THREE.DoubleSide}
              />
            </mesh>
            <mesh rotation={[Math.PI / 4, Math.PI / 4, 0]}>
              <ringGeometry args={[visualProps.size * 1.1, visualProps.size * 1.2, 16]} />
              <meshBasicMaterial 
                color={visualProps.urgencyColor} 
                transparent 
                opacity={0.4}
                side={THREE.DoubleSide}
              />
            </mesh>
          </>
        )}

        {/* Todo text label (visible when close) */}
        <group position={[0, visualProps.size + 0.5, 0]}>
          <mesh>
            <planeGeometry args={[Math.min(todoData.text.length * 0.1, 3), 0.3]} />
            <meshBasicMaterial 
              color="#000000" 
              transparent 
              opacity={0.6} 
            />
          </mesh>
        </group>
      </group>
    </group>
  );
};

export default AIPlanet;