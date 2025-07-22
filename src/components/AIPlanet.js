import React, { useRef, useMemo, forwardRef, useImperativeHandle } from 'react';
import { useFrame } from '@react-three/fiber';
import * as THREE from 'three';

/**
 * AI-powered Planet component with enhanced animation control
 * Represents medium-level todos orbiting around suns
 * - Orbital motion around sun
 * - Size based on priority
 * - Color based on category
 * - Rotation speed based on deadline
 * - Animation pause/play support
 * - Ref forwarding for camera tracking
 */
const AIPlanet = forwardRef(({ 
  todoData,
  sunPosition = [0, 0, 0],
  orbitRadius = 12,
  orbitSpeed = 0.008,
  initialAngle = 0,
  onClick,
  isSelected = false,
  isAnimationPlaying = true
}, ref) => {
  const meshRef = useRef();
  const groupRef = useRef();
  const trailRef = useRef();
  const orbitAngle = useRef(initialAngle);

  // Expose position methods for camera tracking
  useImperativeHandle(ref, () => ({
    getWorldPosition: (target) => {
      if (groupRef.current) {
        return groupRef.current.getWorldPosition(target);
      }
      return target.set(...sunPosition).add(new THREE.Vector3(orbitRadius, 0, 0));
    },
    position: sunPosition
  }));

  // Calculate visual properties from AI classification
  const visualProps = useMemo(() => {
    const vp = todoData.visualProperties;
    
    // Enhanced planet size (0.8 - 2.2 range for better visibility)
    const size = 0.8 + (vp.sizeMultiplier - 0.7) * 2.8;
    
    // Category-based colors with enhanced palette
    const categoryColors = {
      'work': '#4a90e2',      // Professional Blue
      'personal': '#7ed321',   // Life Green
      'education': '#9013fe',  // Knowledge Purple
      'finance': '#f5a623',    // Gold Orange
      'home': '#bd10e0',       // Home Pink
      'health': '#50e3c2'      // Health Teal
    };
    
    const color = categoryColors[todoData.category] || '#888888';
    
    return {
      size,
      color,
      rotationSpeed: vp.rotationSpeed,
      brightness: vp.brightness,
      urgencyColor: vp.urgencyColor,
      urgencyLevel: vp.daysUntilDeadline
    };
  }, [todoData]);

  // Animation loop with pause/play control
  useFrame((state, delta) => {
    if (!isAnimationPlaying) return;

    if (groupRef.current && meshRef.current) {
      // Enhanced orbital motion around sun
      const speedMultiplier = 1 + visualProps.rotationSpeed * 100;
      orbitAngle.current += orbitSpeed * speedMultiplier;
      
      const x = sunPosition[0] + Math.cos(orbitAngle.current) * orbitRadius;
      const z = sunPosition[2] + Math.sin(orbitAngle.current) * orbitRadius;
      // Add subtle vertical oscillation for more dynamic movement
      const y = sunPosition[1] + Math.sin(orbitAngle.current * 0.5) * 3;
      
      groupRef.current.position.set(x, y, z);
      
      // Enhanced planet rotation
      meshRef.current.rotation.y += visualProps.rotationSpeed;
      meshRef.current.rotation.x += visualProps.rotationSpeed * 0.4;
      
      // Urgent planets have more dramatic movements
      if (visualProps.urgencyLevel <= 3) {
        const urgencyIntensity = 1 - (visualProps.urgencyLevel / 3);
        meshRef.current.rotation.z = Math.sin(state.clock.elapsedTime * 8) * 0.3 * urgencyIntensity;
        
        // Add slight position jitter for very urgent tasks
        if (visualProps.urgencyLevel <= 1) {
          const jitter = Math.sin(state.clock.elapsedTime * 20) * 0.1;
          groupRef.current.position.x += jitter;
          groupRef.current.position.z += jitter;
        }
      }
    }
  });

  // Enhanced planet material with category coloring
  const planetMaterial = useMemo(() => new THREE.MeshStandardMaterial({
    color: visualProps.color,
    emissive: todoData.priority === 'high' ? visualProps.urgencyColor : '#000000',
    emissiveIntensity: todoData.priority === 'high' ? 0.4 : 0,
    roughness: 0.6,
    metalness: 0.4,
    transparent: todoData.completed,
    opacity: todoData.completed ? 0.6 : 1.0
  }), [visualProps.color, visualProps.urgencyColor, todoData.priority, todoData.completed]);

  // Enhanced orbit trail material
  const orbitMaterial = useMemo(() => new THREE.LineBasicMaterial({
    color: visualProps.color,
    transparent: true,
    opacity: isSelected ? 0.6 : 0.3,
    linewidth: isSelected ? 3 : 1
  }), [visualProps.color, isSelected]);

  // Create enhanced orbit path
  const orbitGeometry = useMemo(() => {
    const points = [];
    const segments = 128; // Higher resolution for smoother orbits
    for (let i = 0; i <= segments; i++) {
      const angle = (i / segments) * Math.PI * 2;
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
      {/* Enhanced orbit trail */}
      <line ref={trailRef} geometry={orbitGeometry} material={orbitMaterial} />
      
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
          castShadow
          receiveShadow
        >
          <sphereGeometry args={[visualProps.size, 32, 32]} />
        </mesh>

        {/* Enhanced selection indicator */}
        {isSelected && (
          <>
            <mesh>
              <ringGeometry args={[visualProps.size * 1.4, visualProps.size * 1.6, 32]} />
              <meshBasicMaterial 
                color="#00aaff" 
                transparent 
                opacity={0.9}
                side={THREE.DoubleSide}
              />
            </mesh>
            <mesh rotation={[Math.PI / 2, 0, 0]}>
              <ringGeometry args={[visualProps.size * 1.4, visualProps.size * 1.6, 32]} />
              <meshBasicMaterial 
                color="#00aaff" 
                transparent 
                opacity={0.7}
                side={THREE.DoubleSide}
              />
            </mesh>
          </>
        )}

        {/* Enhanced priority indicator rings */}
        {todoData.priority === 'high' && (
          <>
            <mesh rotation={[Math.PI / 2, 0, 0]}>
              <ringGeometry args={[visualProps.size * 1.15, visualProps.size * 1.25, 24]} />
              <meshBasicMaterial 
                color={visualProps.urgencyColor} 
                transparent 
                opacity={0.7}
                side={THREE.DoubleSide}
              />
            </mesh>
            <mesh rotation={[Math.PI / 4, Math.PI / 4, 0]}>
              <ringGeometry args={[visualProps.size * 1.15, visualProps.size * 1.25, 24]} />
              <meshBasicMaterial 
                color={visualProps.urgencyColor} 
                transparent 
                opacity={0.5}
                side={THREE.DoubleSide}
              />
            </mesh>
          </>
        )}

        {/* Completion indicator */}
        {todoData.completed && (
          <group>
            <mesh>
              <ringGeometry args={[visualProps.size * 0.8, visualProps.size * 0.9, 16]} />
              <meshBasicMaterial 
                color="#00ff00" 
                transparent 
                opacity={0.8}
                side={THREE.DoubleSide}
              />
            </mesh>
            {/* Check mark effect */}
            <mesh position={[0, 0, visualProps.size + 0.1]}>
              <sphereGeometry args={[visualProps.size * 0.3, 8, 8]} />
              <meshBasicMaterial 
                color="#00ff00" 
                transparent 
                opacity={0.6}
              />
            </mesh>
          </group>
        )}

        {/* Enhanced urgency indicators */}
        {visualProps.urgencyLevel <= 3 && !todoData.completed && (
          <group>
            {/* Pulsing warning rings */}
            <mesh rotation={[0, 0, Math.PI / 4]}>
              <ringGeometry args={[visualProps.size * 1.3, visualProps.size * 1.35, 8]} />
              <meshBasicMaterial 
                color={visualProps.urgencyColor} 
                transparent 
                opacity={0.8}
                side={THREE.DoubleSide}
              />
            </mesh>
            <mesh rotation={[0, 0, -Math.PI / 4]}>
              <ringGeometry args={[visualProps.size * 1.3, visualProps.size * 1.35, 8]} />
              <meshBasicMaterial 
                color={visualProps.urgencyColor} 
                transparent 
                opacity={0.6}
                side={THREE.DoubleSide}
              />
            </mesh>
          </group>
        )}

        {/* Enhanced todo text label */}
        <group position={[0, visualProps.size + 1, 0]}>
          <mesh>
            <planeGeometry args={[Math.min(todoData.text.length * 0.12, 4), 0.4]} />
            <meshBasicMaterial 
              color="#000000" 
              transparent 
              opacity={0.7} 
            />
          </mesh>
        </group>

        {/* Atmospheric glow for high priority tasks */}
        {todoData.priority === 'high' && (
          <mesh>
            <sphereGeometry args={[visualProps.size * 1.1, 16, 16]} />
            <meshBasicMaterial 
              color={visualProps.urgencyColor}
              transparent 
              opacity={0.2}
              side={THREE.BackSide}
            />
          </mesh>
        )}
      </group>
    </group>
  );
});

AIPlanet.displayName = 'AIPlanet';

export default AIPlanet;