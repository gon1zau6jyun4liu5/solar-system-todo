import React, { useRef, useMemo } from 'react';
import { useFrame } from '@react-three/fiber';
import * as THREE from 'three';

/**
 * AI-powered Satellite component
 * Represents small tasks orbiting around planets
 * - Orbital motion around parent planet
 * - Smallest size with high detail
 * - Fast rotation for urgent tasks
 * - Completion status visualization
 */
const AISatellite = ({ 
  todoData,
  planetPosition = [0, 0, 0],
  orbitRadius = 2,
  orbitSpeed = 0.03,
  initialAngle = 0,
  onClick,
  isSelected = false 
}) => {
  const meshRef = useRef();
  const groupRef = useRef();
  const orbitAngle = useRef(initialAngle);
  const glowRef = useRef();

  // Calculate visual properties from AI classification
  const visualProps = useMemo(() => {
    const vp = todoData.visualProperties;
    
    // Satellite size (0.1 - 0.4 range) - smallest celestial body
    const size = 0.1 + (vp.sizeMultiplier - 0.7) * 0.6;
    
    // Completion status affects color
    const baseColor = todoData.completed ? '#4caf50' : '#ffffff';
    const urgencyTint = vp.daysUntilDeadline <= 1 ? '#ff0000' : 
                       vp.daysUntilDeadline <= 3 ? '#ff8800' : baseColor;
    
    return {
      size,
      color: todoData.completed ? baseColor : urgencyTint,
      rotationSpeed: vp.rotationSpeed * 2, // Satellites rotate faster
      brightness: vp.brightness * 0.5, // Dimmer than planets
      completed: todoData.completed,
      urgencyLevel: vp.daysUntilDeadline
    };
  }, [todoData]);

  // Animation loop
  useFrame((state, delta) => {
    if (groupRef.current && meshRef.current) {
      // Orbital motion around planet
      const speedMultiplier = visualProps.completed ? 0.5 : (1 + visualProps.rotationSpeed * 100);
      orbitAngle.current += orbitSpeed * speedMultiplier;
      
      const x = planetPosition[0] + Math.cos(orbitAngle.current) * orbitRadius;
      const z = planetPosition[2] + Math.sin(orbitAngle.current) * orbitRadius;
      const y = planetPosition[1] + Math.cos(orbitAngle.current * 2) * 0.5; // Figure-8 motion
      
      groupRef.current.position.set(x, y, z);
      
      // Fast satellite rotation
      meshRef.current.rotation.y += visualProps.rotationSpeed;
      meshRef.current.rotation.x += visualProps.rotationSpeed * 0.7;
      meshRef.current.rotation.z += visualProps.rotationSpeed * 0.3;
      
      // Urgent satellites vibrate
      if (visualProps.urgencyLevel <= 1 && !visualProps.completed) {
        const vibration = Math.sin(state.clock.elapsedTime * 30) * 0.05;
        groupRef.current.position.x += vibration;
        groupRef.current.position.z += vibration;
      }
      
      // Glow effect for urgent items
      if (glowRef.current && visualProps.urgencyLevel <= 3 && !visualProps.completed) {
        const pulse = 1 + Math.sin(state.clock.elapsedTime * 15) * 0.5;
        glowRef.current.scale.setScalar(pulse);
      }
    }
  });

  // Satellite material based on status
  const satelliteMaterial = useMemo(() => {
    if (visualProps.completed) {
      return new THREE.MeshStandardMaterial({
        color: visualProps.color,
        emissive: '#004400',
        emissiveIntensity: 0.5,
        roughness: 0.3,
        metalness: 0.8
      });
    }
    
    return new THREE.MeshStandardMaterial({
      color: visualProps.color,
      emissive: visualProps.urgencyLevel <= 3 ? visualProps.color : '#000000',
      emissiveIntensity: visualProps.urgencyLevel <= 3 ? 0.4 : 0,
      roughness: 0.8,
      metalness: 0.2
    });
  }, [visualProps]);

  // Glow material for urgent items
  const glowMaterial = useMemo(() => new THREE.MeshBasicMaterial({
    color: visualProps.color,
    transparent: true,
    opacity: 0.4,
    side: THREE.BackSide
  }), [visualProps.color]);

  // Orbit trail for active satellites
  const orbitGeometry = useMemo(() => {
    if (visualProps.completed) return null; // No trail for completed tasks
    
    const points = [];
    for (let i = 0; i <= 32; i++) {
      const angle = (i / 32) * Math.PI * 2;
      points.push(new THREE.Vector3(
        planetPosition[0] + Math.cos(angle) * orbitRadius,
        planetPosition[1],
        planetPosition[2] + Math.sin(angle) * orbitRadius
      ));
    }
    return new THREE.BufferGeometry().setFromPoints(points);
  }, [planetPosition, orbitRadius, visualProps.completed]);

  return (
    <group>
      {/* Orbit trail for active satellites */}
      {orbitGeometry && !visualProps.completed && (
        <line geometry={orbitGeometry}>
          <lineBasicMaterial 
            color={visualProps.color}
            transparent
            opacity={0.2}
          />
        </line>
      )}
      
      {/* Satellite group */}
      <group ref={groupRef}>
        {/* Main satellite body */}
        <mesh 
          ref={meshRef}
          material={satelliteMaterial}
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
          <sphereGeometry args={[visualProps.size, 8, 8]} />
        </mesh>

        {/* Glow effect for urgent items */}
        {visualProps.urgencyLevel <= 3 && !visualProps.completed && (
          <mesh ref={glowRef} material={glowMaterial}>
            <sphereGeometry args={[visualProps.size * 1.3, 8, 8]} />
          </mesh>
        )}

        {/* Completion indicator */}
        {visualProps.completed && (
          <group>
            {/* Check mark representation */}
            <mesh position={[0, 0, visualProps.size + 0.02]}>
              <ringGeometry args={[visualProps.size * 0.8, visualProps.size * 0.9, 8]} />
              <meshBasicMaterial color="#00ff00" transparent opacity={0.8} />
            </mesh>
          </group>
        )}

        {/* Selection indicator */}
        {isSelected && (
          <mesh>
            <ringGeometry args={[visualProps.size * 1.2, visualProps.size * 1.4, 8]} />
            <meshBasicMaterial 
              color="#00aaff" 
              transparent 
              opacity={0.9}
              side={THREE.DoubleSide}
            />
          </mesh>
        )}

        {/* Urgency indicator */}
        {visualProps.urgencyLevel <= 1 && !visualProps.completed && (
          <>
            <mesh rotation={[0, 0, Math.PI / 4]}>
              <ringGeometry args={[visualProps.size * 1.1, visualProps.size * 1.15, 4]} />
              <meshBasicMaterial color="#ff0000" transparent opacity={0.8} />
            </mesh>
            <mesh rotation={[0, 0, -Math.PI / 4]}>
              <ringGeometry args={[visualProps.size * 1.1, visualProps.size * 1.15, 4]} />
              <meshBasicMaterial color="#ff0000" transparent opacity={0.8} />
            </mesh>
          </>
        )}

        {/* Task text (very small, visible only when very close) */}
        <group position={[0, visualProps.size + 0.2, 0]}>
          <mesh>
            <planeGeometry args={[Math.min(todoData.text.length * 0.05, 1), 0.1]} />
            <meshBasicMaterial 
              color="#ffffff" 
              transparent 
              opacity={0.5} 
            />
          </mesh>
        </group>
      </group>
    </group>
  );
};

export default AISatellite;