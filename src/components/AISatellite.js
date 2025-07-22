import React, { useRef, useMemo, forwardRef, useImperativeHandle } from 'react';
import { useFrame } from '@react-three/fiber';
import * as THREE from 'three';

/**
 * AI-powered Satellite component with enhanced animation control
 * Represents small tasks orbiting around planets
 * - Orbital motion around parent planet
 * - Smallest size with high detail
 * - Fast rotation for urgent tasks
 * - Completion status visualization
 * - Animation pause/play support
 * - Ref forwarding for camera tracking
 */
const AISatellite = forwardRef(({ 
  todoData,
  planetPosition = [0, 0, 0],
  orbitRadius = 2,
  orbitSpeed = 0.025,
  initialAngle = 0,
  onClick,
  isSelected = false,
  isAnimationPlaying = true
}, ref) => {
  const meshRef = useRef();
  const groupRef = useRef();
  const glowRef = useRef();
  const orbitAngle = useRef(initialAngle);

  // Expose position methods for camera tracking
  useImperativeHandle(ref, () => ({
    getWorldPosition: (target) => {
      if (groupRef.current) {
        return groupRef.current.getWorldPosition(target);
      }
      return target.set(...planetPosition).add(new THREE.Vector3(orbitRadius, 0, 0));
    },
    position: planetPosition
  }));

  // Calculate visual properties from AI classification
  const visualProps = useMemo(() => {
    const vp = todoData.visualProperties;
    
    // Enhanced satellite size (0.15 - 0.6 range) - smallest celestial body
    const size = 0.15 + (vp.sizeMultiplier - 0.7) * 0.9;
    
    // Completion status affects color and appearance
    const baseColor = todoData.completed ? '#4caf50' : '#ffffff';
    const urgencyTint = vp.daysUntilDeadline <= 1 ? '#ff0000' : 
                       vp.daysUntilDeadline <= 3 ? '#ff8800' : baseColor;
    
    return {
      size,
      color: todoData.completed ? baseColor : urgencyTint,
      rotationSpeed: vp.rotationSpeed * 3, // Satellites rotate fastest
      brightness: vp.brightness * 0.6, // Dimmer than planets
      completed: todoData.completed,
      urgencyLevel: vp.daysUntilDeadline
    };
  }, [todoData]);

  // Enhanced animation loop with pause/play control
  useFrame((state, delta) => {
    if (!isAnimationPlaying) return;

    if (groupRef.current && meshRef.current) {
      // Enhanced orbital motion around planet
      const speedMultiplier = visualProps.completed ? 0.3 : (1 + visualProps.rotationSpeed * 200);
      orbitAngle.current += orbitSpeed * speedMultiplier;
      
      const x = planetPosition[0] + Math.cos(orbitAngle.current) * orbitRadius;
      const z = planetPosition[2] + Math.sin(orbitAngle.current) * orbitRadius;
      // Enhanced figure-8 motion for more dynamic movement
      const y = planetPosition[1] + Math.cos(orbitAngle.current * 2.5) * 0.8;
      
      groupRef.current.position.set(x, y, z);
      
      // Enhanced fast satellite rotation
      meshRef.current.rotation.y += visualProps.rotationSpeed;
      meshRef.current.rotation.x += visualProps.rotationSpeed * 0.8;
      meshRef.current.rotation.z += visualProps.rotationSpeed * 0.4;
      
      // Enhanced urgent satellites vibration
      if (visualProps.urgencyLevel <= 1 && !visualProps.completed) {
        const vibrationIntensity = 1 - (visualProps.urgencyLevel / 1);
        const vibration = Math.sin(state.clock.elapsedTime * 40) * 0.08 * vibrationIntensity;
        groupRef.current.position.x += vibration;
        groupRef.current.position.z += vibration;
        groupRef.current.position.y += vibration * 0.5;
      }
      
      // Enhanced glow effect for urgent items
      if (glowRef.current && visualProps.urgencyLevel <= 3 && !visualProps.completed) {
        const pulse = 1 + Math.sin(state.clock.elapsedTime * 18) * 0.6;
        glowRef.current.scale.setScalar(pulse);
      }
    }
  });

  // Enhanced satellite material based on status
  const satelliteMaterial = useMemo(() => {
    if (visualProps.completed) {
      return new THREE.MeshStandardMaterial({
        color: visualProps.color,
        emissive: '#004400',
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
      roughness: 0.7,
      metalness: 0.3,
      transparent: false,
      opacity: 1.0
    });
  }, [visualProps]);

  // Enhanced glow material for urgent items
  const glowMaterial = useMemo(() => new THREE.MeshBasicMaterial({
    color: visualProps.color,
    transparent: true,
    opacity: 0.5,
    side: THREE.BackSide
  }), [visualProps.color]);

  // Enhanced orbit trail for active satellites
  const orbitGeometry = useMemo(() => {
    if (visualProps.completed) return null; // No trail for completed tasks
    
    const points = [];
    const segments = 64; // Higher resolution
    for (let i = 0; i <= segments; i++) {
      const angle = (i / segments) * Math.PI * 2;
      points.push(new THREE.Vector3(
        planetPosition[0] + Math.cos(angle) * orbitRadius,
        planetPosition[1],
        planetPosition[2] + Math.sin(angle) * orbitRadius
      ));
    }
    return new THREE.BufferGeometry().setFromPoints(points);
  }, [planetPosition, orbitRadius, visualProps.completed]);

  // Enhanced orbit trail material
  const orbitMaterial = useMemo(() => new THREE.LineBasicMaterial({
    color: visualProps.color,
    transparent: true,
    opacity: isSelected ? 0.6 : 0.25,
    linewidth: isSelected ? 2 : 1
  }), [visualProps.color, isSelected]);

  return (
    <group>
      {/* Enhanced orbit trail for active satellites */}
      {orbitGeometry && !visualProps.completed && (
        <line geometry={orbitGeometry} material={orbitMaterial} />
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
          castShadow
          receiveShadow
        >
          <sphereGeometry args={[visualProps.size, 16, 16]} />
        </mesh>

        {/* Enhanced glow effect for urgent items */}
        {visualProps.urgencyLevel <= 3 && !visualProps.completed && (
          <mesh ref={glowRef} material={glowMaterial}>
            <sphereGeometry args={[visualProps.size * 1.4, 12, 12]} />
          </mesh>
        )}

        {/* Enhanced completion indicator */}
        {visualProps.completed && (
          <group>
            {/* Success glow */}
            <mesh>
              <sphereGeometry args={[visualProps.size * 1.3, 12, 12]} />
              <meshBasicMaterial 
                color="#00ff00" 
                transparent 
                opacity={0.4}
                side={THREE.BackSide}
              />
            </mesh>
            {/* Check mark representation */}
            <mesh position={[0, 0, visualProps.size + 0.05]}>
              <ringGeometry args={[visualProps.size * 0.6, visualProps.size * 0.8, 12]} />
              <meshBasicMaterial 
                color="#00ff00" 
                transparent 
                opacity={0.9}
                side={THREE.DoubleSide}
              />
            </mesh>
          </group>
        )}

        {/* Enhanced selection indicator */}
        {isSelected && (
          <>
            <mesh>
              <ringGeometry args={[visualProps.size * 1.3, visualProps.size * 1.5, 16]} />
              <meshBasicMaterial 
                color="#00aaff" 
                transparent 
                opacity={0.9}
                side={THREE.DoubleSide}
              />
            </mesh>
            <mesh rotation={[Math.PI / 2, 0, 0]}>
              <ringGeometry args={[visualProps.size * 1.3, visualProps.size * 1.5, 16]} />
              <meshBasicMaterial 
                color="#00aaff" 
                transparent 
                opacity={0.7}
                side={THREE.DoubleSide}
              />
            </mesh>
          </>
        )}

        {/* Enhanced urgency indicator */}
        {visualProps.urgencyLevel <= 1 && !visualProps.completed && (
          <>
            <mesh rotation={[0, 0, Math.PI / 4]}>
              <ringGeometry args={[visualProps.size * 1.2, visualProps.size * 1.25, 8]} />
              <meshBasicMaterial 
                color="#ff0000" 
                transparent 
                opacity={0.9}
                side={THREE.DoubleSide}
              />
            </mesh>
            <mesh rotation={[0, 0, -Math.PI / 4]}>
              <ringGeometry args={[visualProps.size * 1.2, visualProps.size * 1.25, 8]} />
              <meshBasicMaterial 
                color="#ff0000" 
                transparent 
                opacity={0.7}
                side={THREE.DoubleSide}
              />
            </mesh>
          </>
        )}

        {/* Enhanced task text (very small, visible only when close) */}
        <group position={[0, visualProps.size + 0.3, 0]}>
          <mesh>
            <planeGeometry args={[Math.min(todoData.text.length * 0.06, 1.5), 0.15]} />
            <meshBasicMaterial 
              color="#ffffff" 
              transparent 
              opacity={0.6} 
            />
          </mesh>
        </group>

        {/* Energy field for high priority incomplete tasks */}
        {todoData.priority === 'high' && !visualProps.completed && (
          <mesh>
            <sphereGeometry args={[visualProps.size * 1.15, 8, 8]} />
            <meshBasicMaterial 
              color={visualProps.color}
              transparent 
              opacity={0.3}
              side={THREE.BackSide}
            />
          </mesh>
        )}

        {/* Data stream effect for active satellites */}
        {!visualProps.completed && visualProps.urgencyLevel <= 5 && (
          <group>
            {Array.from({ length: 3 }, (_, i) => (
              <mesh 
                key={i} 
                position={[
                  Math.cos(i * Math.PI * 2 / 3) * visualProps.size * 2,
                  0,
                  Math.sin(i * Math.PI * 2 / 3) * visualProps.size * 2
                ]}
              >
                <sphereGeometry args={[0.02, 4, 4]} />
                <meshBasicMaterial 
                  color={visualProps.color}
                  transparent 
                  opacity={0.7}
                />
              </mesh>
            ))}
          </group>
        )}
      </group>
    </group>
  );
});

AISatellite.displayName = 'AISatellite';

export default AISatellite;