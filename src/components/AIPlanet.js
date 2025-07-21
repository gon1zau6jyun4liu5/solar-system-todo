import React, { useRef, useMemo } from 'react';
import { useFrame } from '@react-three/fiber';
import { Text } from '@react-three/drei';
import * as THREE from 'three';

/**
 * Enhanced AI-powered Planet component v0.3.1
 * - Animation control support
 * - Progress percentage display
 * - Enhanced visual effects and interactions
 * - Improved orbit mechanics
 */
const AIPlanet = ({ 
  todoData,
  sunPosition = [0, 0, 0],
  orbitRadius = 8,
  orbitSpeed = 0.01,
  initialAngle = 0,
  onClick,
  isSelected = false,
  progressPercentage = null
}) => {
  const meshRef = useRef();
  const groupRef = useRef();
  const atmosphereRef = useRef();
  const orbitAngle = useRef(initialAngle);

  // Calculate visual properties from AI classification
  const visualProps = useMemo(() => {
    const vp = todoData.visualProperties;
    
    // Planet size (0.8 - 2.0 range)
    const size = 0.8 + (vp.sizeMultiplier - 0.7) * 2.4;
    
    // Category-based colors with completion status
    const categoryColors = {
      'work': todoData.completed ? '#2e5ea6' : '#4a90e2',
      'personal': todoData.completed ? '#5ca61f' : '#7ed321',
      'education': todoData.completed ? '#6009ca' : '#9013fe',
      'finance': todoData.completed ? '#b8841a' : '#f5a623',
      'home': todoData.completed ? '#8b0cb0' : '#bd10e0',
      'health': todoData.completed ? '#36b39c' : '#50e3c2'
    };
    
    const color = categoryColors[todoData.category] || '#888888';
    
    return {
      size,
      color,
      rotationSpeed: vp.rotationSpeed,
      brightness: vp.brightness,
      urgencyColor: vp.urgencyColor,
      completed: todoData.completed
    };
  }, [todoData]);

  // Animation loop with orbit and rotation
  useFrame((state, delta) => {
    if (groupRef.current && meshRef.current) {
      // Orbital motion around sun (only if orbitSpeed > 0)
      if (orbitSpeed > 0) {
        orbitAngle.current += orbitSpeed * (1 + visualProps.rotationSpeed * 50);
        
        const x = sunPosition[0] + Math.cos(orbitAngle.current) * orbitRadius;
        const z = sunPosition[2] + Math.sin(orbitAngle.current) * orbitRadius;
        const y = sunPosition[1] + Math.sin(orbitAngle.current * 0.3) * 1.5; // Slight vertical oscillation
        
        groupRef.current.position.set(x, y, z);
      }
      
      // Planet rotation (always happens, even when orbit is stopped)
      meshRef.current.rotation.y += visualProps.rotationSpeed;
      meshRef.current.rotation.x += visualProps.rotationSpeed * 0.2;
      
      // Urgent planets "wobble" more
      if (visualProps.rotationSpeed > 0.01) {
        meshRef.current.rotation.z = Math.sin(state.clock.elapsedTime * 8) * 0.15;
      }

      // Atmosphere animation
      if (atmosphereRef.current) {
        atmosphereRef.current.rotation.y += visualProps.rotationSpeed * 0.5;
      }
    }
  });

  // Planet material with enhanced properties
  const planetMaterial = useMemo(() => new THREE.MeshStandardMaterial({
    color: visualProps.color,
    emissive: todoData.priority === 'high' ? visualProps.urgencyColor : '#000000',
    emissiveIntensity: todoData.priority === 'high' ? 0.3 : 0,
    roughness: visualProps.completed ? 0.3 : 0.7,
    metalness: visualProps.completed ? 0.6 : 0.3,
    transparent: visualProps.completed,
    opacity: visualProps.completed ? 0.8 : 1.0
  }), [visualProps, todoData.priority, todoData.completed]);

  // Atmosphere material
  const atmosphereMaterial = useMemo(() => new THREE.MeshBasicMaterial({
    color: visualProps.color,
    transparent: true,
    opacity: 0.2,
    side: THREE.BackSide
  }), [visualProps.color]);

  // Orbit trail material
  const orbitMaterial = useMemo(() => new THREE.LineBasicMaterial({
    color: visualProps.color,
    transparent: true,
    opacity: todoData.completed ? 0.1 : 0.3
  }), [visualProps.color, todoData.completed]);

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

  // Progress display color
  const progressColor = progressPercentage !== null ? 
    (progressPercentage > 50 ? '#44ff44' : 
     progressPercentage > 25 ? '#ffaa00' : '#ff4444') : '#ffffff';

  return (
    <group>
      {/* Orbit trail */}
      <line geometry={orbitGeometry} material={orbitMaterial} />
      
      {/* Planet group */}
      <group ref={groupRef}>
        {/* Atmosphere effect */}
        <mesh 
          ref={atmosphereRef}
          material={atmosphereMaterial}
          scale={1.3}
        >
          <sphereGeometry args={[visualProps.size, 16, 16]} />
        </mesh>

        {/* Main planet body */}
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
          <sphereGeometry args={[visualProps.size, 20, 20]} />
        </mesh>

        {/* Selection indicator */}
        {isSelected && (
          <mesh>
            <ringGeometry args={[visualProps.size * 1.4, visualProps.size * 1.6, 16]} />
            <meshBasicMaterial 
              color="#00aaff" 
              transparent 
              opacity={0.8}
              side={THREE.DoubleSide}
            />
          </mesh>
        )}

        {/* Completion indicator */}
        {todoData.completed && (
          <mesh>
            <ringGeometry args={[visualProps.size * 1.1, visualProps.size * 1.2, 16]} />
            <meshBasicMaterial 
              color="#44ff44" 
              transparent 
              opacity={0.8}
              side={THREE.DoubleSide}
            />
          </mesh>
        )}

        {/* Priority indicator rings */}
        {todoData.priority === 'high' && !todoData.completed && (
          <>
            <mesh rotation={[Math.PI / 2, 0, 0]}>
              <ringGeometry args={[visualProps.size * 1.2, visualProps.size * 1.3, 16]} />
              <meshBasicMaterial 
                color={visualProps.urgencyColor} 
                transparent 
                opacity={0.6}
                side={THREE.DoubleSide}
              />
            </mesh>
            <mesh rotation={[Math.PI / 4, Math.PI / 4, 0]}>
              <ringGeometry args={[visualProps.size * 1.2, visualProps.size * 1.3, 16]} />
              <meshBasicMaterial 
                color={visualProps.urgencyColor} 
                transparent 
                opacity={0.4}
                side={THREE.DoubleSide}
              />
            </mesh>
          </>
        )}

        {/* Progress percentage display */}
        {progressPercentage !== null && (
          <group position={[0, visualProps.size + 1.0, 0]}>
            <Text
              fontSize={0.4}
              color={progressColor}
              anchorX="center"
              anchorY="middle"
              outlineColor="#000000"
              outlineWidth={0.1}
            >
              {Math.round(progressPercentage)}%
            </Text>
          </group>
        )}

        {/* Todo text label */}
        <group position={[0, visualProps.size + 1.8, 0]}>
          <Text
            fontSize={0.3}
            color="#ffffff"
            anchorX="center"
            anchorY="middle"
            outlineColor="#000000"
            outlineWidth={0.05}
            maxWidth={6}
          >
            {todoData.text.length > 30 ? 
              todoData.text.substring(0, 27) + '...' : 
              todoData.text}
          </Text>
        </group>

        {/* Priority and category indicators */}
        <group position={[0, -visualProps.size - 0.8, 0]}>
          <Text
            fontSize={0.25}
            color={visualProps.urgencyColor}
            anchorX="center"
            anchorY="middle"
            outlineColor="#000000"
            outlineWidth={0.05}
          >
            {todoData.priority.toUpperCase()} | {todoData.category.toUpperCase()}
          </Text>
        </group>

        {/* Surface features for visual interest */}
        {[...Array(Math.floor(visualProps.size * 3))].map((_, i) => (
          <mesh 
            key={i}
            position={[
              (Math.random() - 0.5) * visualProps.size * 0.8,
              (Math.random() - 0.5) * visualProps.size * 0.8,
              visualProps.size * 0.9
            ]}
            scale={0.1}
          >
            <sphereGeometry args={[0.1, 4, 4]} />
            <meshBasicMaterial 
              color={visualProps.color} 
              transparent 
              opacity={0.6}
            />
          </mesh>
        ))}
      </group>
    </group>
  );
};

export default AIPlanet;