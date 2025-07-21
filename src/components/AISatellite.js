import React, { useRef, useMemo } from 'react';
import { useFrame } from '@react-three/fiber';
import { Text } from '@react-three/drei';
import * as THREE from 'three';

/**
 * Enhanced AI-powered Satellite component v0.3.1
 * - Animation control support
 * - Progress percentage display
 * - Enhanced visual effects and task completion status
 * - Improved orbit mechanics around planets
 */
const AISatellite = ({ 
  todoData,
  planetPosition = [0, 0, 0],
  orbitRadius = 2,
  orbitSpeed = 0.03,
  initialAngle = 0,
  onClick,
  isSelected = false,
  progressPercentage = null
}) => {
  const meshRef = useRef();
  const groupRef = useRef();
  const trailRef = useRef();
  const orbitAngle = useRef(initialAngle);

  // Calculate visual properties from AI classification
  const visualProps = useMemo(() => {
    const vp = todoData.visualProperties;
    
    // Satellite size (0.15 - 0.5 range) - smallest celestial body
    const size = 0.15 + (vp.sizeMultiplier - 0.7) * 0.7;
    
    // Completion status affects color and behavior
    const baseColor = todoData.completed ? '#4caf50' : '#ffffff';
    const urgencyTint = vp.daysUntilDeadline <= 1 ? '#ff0000' : 
                       vp.daysUntilDeadline <= 3 ? '#ff8800' : baseColor;
    
    return {
      size,
      color: todoData.completed ? baseColor : urgencyTint,
      rotationSpeed: vp.rotationSpeed * 3, // Satellites rotate fastest
      brightness: vp.brightness * 0.4, // Dimmest of all bodies
      completed: todoData.completed,
      urgencyLevel: vp.daysUntilDeadline
    };
  }, [todoData]);

  // Animation loop with complex orbital patterns
  useFrame((state, delta) => {
    if (groupRef.current && meshRef.current) {
      // Orbital motion around planet (only if orbitSpeed > 0)
      if (orbitSpeed > 0) {
        const speedMultiplier = visualProps.completed ? 0.3 : (1 + visualProps.rotationSpeed * 150);
        orbitAngle.current += orbitSpeed * speedMultiplier;
        
        const x = planetPosition[0] + Math.cos(orbitAngle.current) * orbitRadius;
        const z = planetPosition[2] + Math.sin(orbitAngle.current) * orbitRadius;
        // Figure-8 motion for visual interest
        const y = planetPosition[1] + Math.sin(orbitAngle.current * 2) * 0.7;
        
        groupRef.current.position.set(x, y, z);
      }
      
      // Very fast satellite rotation (always happens)
      meshRef.current.rotation.y += visualProps.rotationSpeed;
      meshRef.current.rotation.x += visualProps.rotationSpeed * 0.8;
      meshRef.current.rotation.z += visualProps.rotationSpeed * 0.4;
      
      // Urgent satellites vibrate
      if (visualProps.urgencyLevel <= 1 && !visualProps.completed) {
        const vibration = Math.sin(state.clock.elapsedTime * 40) * 0.03;
        meshRef.current.position.x += vibration;
        meshRef.current.position.z += vibration;
      }
      
      // Energy trail effect for active tasks
      if (trailRef.current && !visualProps.completed) {
        trailRef.current.rotation.y += orbitSpeed * 2;
        const pulse = 1 + Math.sin(state.clock.elapsedTime * 20) * 0.3;
        trailRef.current.scale.setScalar(pulse);
      }
    }
  });

  // Satellite material based on status and urgency
  const satelliteMaterial = useMemo(() => {
    if (visualProps.completed) {
      return new THREE.MeshStandardMaterial({
        color: visualProps.color,
        emissive: '#002200',
        emissiveIntensity: 0.6,
        roughness: 0.2,
        metalness: 0.9,
        transparent: true,
        opacity: 0.8
      });
    }
    
    return new THREE.MeshStandardMaterial({
      color: visualProps.color,
      emissive: visualProps.urgencyLevel <= 3 ? visualProps.color : '#000000',
      emissiveIntensity: visualProps.urgencyLevel <= 3 ? 0.5 : 0,
      roughness: 0.9,
      metalness: 0.1
    });
  }, [visualProps]);

  // Energy trail material for active satellites
  const trailMaterial = useMemo(() => new THREE.MeshBasicMaterial({
    color: visualProps.color,
    transparent: true,
    opacity: visualProps.completed ? 0.1 : 0.4,
    side: THREE.DoubleSide
  }), [visualProps.color, visualProps.completed]);

  // Orbit trail for active satellites only
  const orbitGeometry = useMemo(() => {
    if (visualProps.completed) return null;
    
    const points = [];
    for (let i = 0; i <= 24; i++) {
      const angle = (i / 24) * Math.PI * 2;
      points.push(new THREE.Vector3(
        planetPosition[0] + Math.cos(angle) * orbitRadius,
        planetPosition[1],
        planetPosition[2] + Math.sin(angle) * orbitRadius
      ));
    }
    return new THREE.BufferGeometry().setFromPoints(points);
  }, [planetPosition, orbitRadius, visualProps.completed]);

  // Progress display color
  const progressColor = progressPercentage !== null ? 
    (progressPercentage > 50 ? '#44ff44' : 
     progressPercentage > 25 ? '#ffaa00' : '#ff4444') : '#ffffff';

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
        {/* Energy trail effect */}
        {!visualProps.completed && (
          <mesh ref={trailRef} material={trailMaterial}>
            <ringGeometry args={[visualProps.size * 0.8, visualProps.size * 1.2, 8]} />
          </mesh>
        )}

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
          <sphereGeometry args={[visualProps.size, 12, 12]} />
        </mesh>

        {/* Completion indicator */}
        {visualProps.completed && (
          <group>
            {/* Check mark representation */}
            <mesh position={[0, 0, visualProps.size + 0.02]}>
              <ringGeometry args={[visualProps.size * 0.6, visualProps.size * 0.8, 8]} />
              <meshBasicMaterial color="#00ff00" transparent opacity={0.9} />
            </mesh>
            {/* Success glow */}
            <mesh>
              <sphereGeometry args={[visualProps.size * 1.4, 8, 8]} />
              <meshBasicMaterial 
                color="#44ff44" 
                transparent 
                opacity={0.2}
                side={THREE.BackSide}
              />
            </mesh>
          </group>
        )}

        {/* Selection indicator */}
        {isSelected && (
          <mesh>
            <ringGeometry args={[visualProps.size * 1.3, visualProps.size * 1.5, 8]} />
            <meshBasicMaterial 
              color="#00aaff" 
              transparent 
              opacity={0.9}
              side={THREE.DoubleSide}
            />
          </mesh>
        )}

        {/* Urgency warning indicators */}
        {visualProps.urgencyLevel <= 1 && !visualProps.completed && (
          <>
            <mesh rotation={[0, 0, Math.PI / 4]}>
              <ringGeometry args={[visualProps.size * 1.2, visualProps.size * 1.3, 4]} />
              <meshBasicMaterial color="#ff0000" transparent opacity={0.8} />
            </mesh>
            <mesh rotation={[0, 0, -Math.PI / 4]}>
              <ringGeometry args={[visualProps.size * 1.2, visualProps.size * 1.3, 4]} />
              <meshBasicMaterial color="#ff0000" transparent opacity={0.8} />
            </mesh>
          </>
        )}

        {/* Progress percentage display */}
        {progressPercentage !== null && (
          <group position={[0, visualProps.size + 0.6, 0]}>
            <Text
              fontSize={0.25}
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

        {/* Task text (very small, visible only when close) */}
        <group position={[0, visualProps.size + 1.0, 0]}>
          <Text
            fontSize={0.2}
            color="#ffffff"
            anchorX="center"
            anchorY="middle"
            outlineColor="#000000"
            outlineWidth={0.05}
            maxWidth={4}
          >
            {todoData.text.length > 20 ? 
              todoData.text.substring(0, 17) + '...' : 
              todoData.text}
          </Text>
        </group>

        {/* Status indicator */}
        <group position={[0, -visualProps.size - 0.5, 0]}>
          <Text
            fontSize={0.15}
            color={visualProps.urgencyLevel <= 2 ? '#ff4444' : '#cccccc'}
            anchorX="center"
            anchorY="middle"
            outlineColor="#000000"
            outlineWidth={0.03}
          >
            {visualProps.completed ? 'COMPLETE' : 
             visualProps.urgencyLevel <= 1 ? 'URGENT' :
             visualProps.urgencyLevel <= 3 ? 'SOON' : 'ACTIVE'}
          </Text>
        </group>

        {/* Satellite antenna/solar panel details */}
        {!visualProps.completed && (
          <>
            {/* Antenna */}
            <mesh position={[0, visualProps.size * 0.8, 0]}>
              <cylinderGeometry args={[0.01, 0.01, visualProps.size * 0.6]} />
              <meshBasicMaterial color="#888888" />
            </mesh>
            
            {/* Solar panels */}
            <mesh position={[visualProps.size * 0.8, 0, 0]} rotation={[0, 0, Math.PI / 2]}>
              <boxGeometry args={[visualProps.size * 0.3, visualProps.size * 0.1, visualProps.size * 0.6]} />
              <meshBasicMaterial color="#003366" transparent opacity={0.8} />
            </mesh>
            <mesh position={[-visualProps.size * 0.8, 0, 0]} rotation={[0, 0, Math.PI / 2]}>
              <boxGeometry args={[visualProps.size * 0.3, visualProps.size * 0.1, visualProps.size * 0.6]} />
              <meshBasicMaterial color="#003366" transparent opacity={0.8} />
            </mesh>
          </>
        )}

        {/* Thruster effects for urgent tasks */}
        {visualProps.urgencyLevel <= 2 && !visualProps.completed && (
          <>
            {[...Array(4)].map((_, i) => (
              <mesh 
                key={i} 
                rotation={[0, 0, (i * Math.PI * 2) / 4]}
                position={[visualProps.size * 0.7, 0, 0]}
              >
                <coneGeometry args={[0.05, visualProps.size * 0.3, 4]} />
                <meshBasicMaterial 
                  color="#ffaa00" 
                  transparent 
                  opacity={0.7}
                />
              </mesh>
            ))}
          </>
        )}
      </group>
    </group>
  );
};

export default AISatellite;