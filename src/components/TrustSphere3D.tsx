import React, { useEffect, useRef } from 'react';
import * as THREE from 'three';

interface TrustSphere3DProps {
  riskScore: number;
  riskLevel: 'LOW' | 'MEDIUM' | 'HIGH';
}

export const TrustSphere3D: React.FC<TrustSphere3DProps> = ({ riskScore, riskLevel }) => {
  const containerRef = useRef<HTMLDivElement>(null);
  
  // Keep refs for anim values to interpolate smoothly
  const targetColorRef = useRef<THREE.Color>(new THREE.Color('#00f2fe'));
  const currentColorRef = useRef<THREE.Color>(new THREE.Color('#00f2fe'));
  const rotationSpeedRef = useRef<number>(0.002);
  const targetRotationSpeedRef = useRef<number>(0.002);
  const scaleNoiseRef = useRef<number>(0);
  const mouseRef = useRef<{ x: number; y: number }>({ x: 0, y: 0 });

  useEffect(() => {
    if (!containerRef.current) return;

    // Dimensions
    const width = containerRef.current.clientWidth;
    const height = containerRef.current.clientHeight || 450;

    // Scene setup
    const scene = new THREE.Scene();
    
    // Camera
    const camera = new THREE.PerspectiveCamera(60, width / height, 0.1, 1000);
    camera.position.z = 250;

    // Renderer
    const renderer = new THREE.WebGLRenderer({ antialias: true, alpha: true });
    renderer.setSize(width, height);
    renderer.setPixelRatio(Math.min(window.devicePixelRatio, 2));
    containerRef.current.appendChild(renderer.domElement);

    // Particle Configuration
    const particleCount = 700;
    const geometry = new THREE.BufferGeometry();
    const positions = new Float32Array(particleCount * 3);
    const colors = new Float32Array(particleCount * 3);
    const initialPositions: {x: number; y: number; z: number; speed: number; phase: number}[] = [];

    // Distribute particles on a sphere surface using Fibonacci spiral
    const radius = 90;
    for (let i = 0; i < particleCount; i++) {
      // Golden ratio distribution
      const phi = Math.acos(1 - 2 * (i / particleCount));
      const theta = Math.sqrt(particleCount * Math.PI) * phi;

      const x = radius * Math.sin(phi) * Math.cos(theta);
      const y = radius * Math.sin(phi) * Math.sin(theta);
      const z = radius * Math.cos(phi);

      positions[i * 3] = x;
      positions[i * 3 + 1] = y;
      positions[i * 3 + 2] = z;

      initialPositions.push({
        x,
        y,
        z,
        speed: 0.1 + Math.random() * 0.4,
        phase: Math.random() * Math.PI * 2
      });

      // Default color (cyan)
      colors[i * 3] = 0.0;
      colors[i * 3 + 1] = 0.95;
      colors[i * 3 + 2] = 1.0;
    }

    geometry.setAttribute('position', new THREE.BufferAttribute(positions, 3));
    geometry.setAttribute('color', new THREE.BufferAttribute(colors, 3));

    // Particle Texture - custom canvas circle for glow
    const pCanvas = document.createElement('canvas');
    pCanvas.width = 32;
    pCanvas.height = 32;
    const pCtx = pCanvas.getContext('2d');
    if (pCtx) {
      const gradient = pCtx.createRadialGradient(16, 16, 0, 16, 16, 16);
      gradient.addColorStop(0, 'rgba(255,255,255,1)');
      gradient.addColorStop(0.2, 'rgba(255,255,255,0.8)');
      gradient.addColorStop(0.5, 'rgba(255,255,255,0.2)');
      gradient.addColorStop(1, 'rgba(255,255,255,0)');
      pCtx.fillStyle = gradient;
      pCtx.fillRect(0, 0, 32, 32);
    }
    const texture = new THREE.CanvasTexture(pCanvas);

    // Particle Material
    const material = new THREE.PointsMaterial({
      size: 5.0,
      map: texture,
      vertexColors: true,
      transparent: true,
      blending: THREE.AdditiveBlending,
      depthWrite: false,
    });

    const particleSystem = new THREE.Points(geometry, material);
    scene.add(particleSystem);

    // Dynamic Connections (Mesh Network)
    const lineMaterial = new THREE.LineBasicMaterial({
      transparent: true,
      blending: THREE.AdditiveBlending,
      depthWrite: false,
      linewidth: 1
    });

    const maxConnections = 280;
    const lineGeometry = new THREE.BufferGeometry();
    const linePositions = new Float32Array(maxConnections * 2 * 3);
    const lineColors = new Float32Array(maxConnections * 2 * 3);
    
    lineGeometry.setAttribute('position', new THREE.BufferAttribute(linePositions, 3));
    lineGeometry.setAttribute('color', new THREE.BufferAttribute(lineColors, 3));
    
    const lineSystem = new THREE.LineSegments(lineGeometry, lineMaterial);
    scene.add(lineSystem);

    // Mouse movement handler
    const onMouseMove = (event: MouseEvent) => {
      const rect = renderer.domElement.getBoundingClientRect();
      mouseRef.current.x = ((event.clientX - rect.left) / width) * 2 - 1;
      mouseRef.current.y = -((event.clientY - rect.top) / height) * 2 + 1;
    };
    window.addEventListener('mousemove', onMouseMove);

    // Resize handler
    const handleResize = () => {
      if (!containerRef.current) return;
      const w = containerRef.current.clientWidth;
      const h = containerRef.current.clientHeight || 450;
      camera.aspect = w / h;
      camera.updateProjectionMatrix();
      renderer.setSize(w, h);
    };
    window.addEventListener('resize', handleResize);

    // Animation variables
    let clock = new THREE.Clock();
    let animationFrameId: number;

    const animate = () => {
      animationFrameId = requestAnimationFrame(animate);
      const time = clock.getElapsedTime();

      // Smoothly transition colors depending on risk level
      currentColorRef.current.lerp(targetColorRef.current, 0.08);

      // Smoothly transition rotation speed
      rotationSpeedRef.current += (targetRotationSpeedRef.current - rotationSpeedRef.current) * 0.08;

      // Update particle positions and colors based on threat level
      const posAttr = geometry.getAttribute('position') as THREE.BufferAttribute;
      const colorAttr = geometry.getAttribute('color') as THREE.BufferAttribute;
      
      const posArray = posAttr.array as Float32Array;
      const colorArray = colorAttr.array as Float32Array;

      // Update particles
      let lineIndex = 0;
      const connectedPairs: [number, number][] = [];

      for (let i = 0; i < particleCount; i++) {
        const initial = initialPositions[i];
        
        // Dynamic oscillation based on risk
        let waveFactor = 1.0;
        if (riskLevel === 'LOW') {
          waveFactor = 1.0 + Math.sin(time * initial.speed + initial.phase) * 0.03;
        } else if (riskLevel === 'MEDIUM') {
          waveFactor = 1.0 + Math.sin(time * initial.speed * 2.5 + initial.phase) * 0.08;
        } else if (riskLevel === 'HIGH') {
          // Erratically expanding and contracting (pulsating heartbeat)
          const burst = Math.sin(time * 6.0) * 0.15 + (Math.random() - 0.5) * scaleNoiseRef.current;
          waveFactor = 1.0 + burst;
        }

        posArray[i * 3] = initial.x * waveFactor;
        posArray[i * 3 + 1] = initial.y * waveFactor;
        posArray[i * 3 + 2] = initial.z * waveFactor;

        // Animate color changes dynamically
        colorArray[i * 3] = currentColorRef.current.r;
        colorArray[i * 3 + 1] = currentColorRef.current.g;
        colorArray[i * 3 + 2] = currentColorRef.current.b;

        // Build potential connection list (limit search to near neighbors)
        if (lineIndex < maxConnections && i % 3 === 0 && riskLevel !== 'HIGH') {
          // Connect to next neighbor
          const nextIndex = (i + 5) % particleCount;
          connectedPairs.push([i, nextIndex]);
        } else if (lineIndex < maxConnections && riskLevel === 'HIGH' && i % 8 === 0) {
          // Fewer, more chaotic lines in high risk
          const randomNeighbor = Math.floor(Math.random() * particleCount);
          connectedPairs.push([i, randomNeighbor]);
        }
      }
      
      posAttr.needsUpdate = true;
      colorAttr.needsUpdate = true;

      // Update Connecting Lines
      const linePosAttr = lineGeometry.getAttribute('position') as THREE.BufferAttribute;
      const lineColorsAttr = lineGeometry.getAttribute('color') as THREE.BufferAttribute;
      const lpArray = linePosAttr.array as Float32Array;
      const lcArray = lineColorsAttr.array as Float32Array;

      let lineCount = 0;
      for (const pair of connectedPairs) {
        if (lineCount >= maxConnections) break;
        const p1 = pair[0];
        const p2 = pair[1];

        const x1 = posArray[p1 * 3];
        const y1 = posArray[p1 * 3 + 1];
        const z1 = posArray[p1 * 3 + 2];

        const x2 = posArray[p2 * 3];
        const y2 = posArray[p2 * 3 + 1];
        const z2 = posArray[p2 * 3 + 2];

        // Only draw connection if particles are relatively close
        const dist = Math.sqrt((x1 - x2) ** 2 + (y1 - y2) ** 2 + (z1 - z2) ** 2);
        const threshold = riskLevel === 'HIGH' ? 140 : 80;

        if (dist < threshold) {
          const lPos = lineCount * 2 * 3;
          
          lpArray[lPos] = x1;
          lpArray[lPos + 1] = y1;
          lpArray[lPos + 2] = z1;

          lpArray[lPos + 3] = x2;
          lpArray[lPos + 4] = y2;
          lpArray[lPos + 5] = z2;

          // Line opacity fades with distance
          const lineAlpha = (1.0 - dist / threshold) * (riskLevel === 'LOW' ? 0.35 : riskLevel === 'MEDIUM' ? 0.5 : 0.7);

          lcArray[lPos] = currentColorRef.current.r * lineAlpha;
          lcArray[lPos + 1] = currentColorRef.current.g * lineAlpha;
          lcArray[lPos + 2] = currentColorRef.current.b * lineAlpha;

          lcArray[lPos + 3] = currentColorRef.current.r * lineAlpha;
          lcArray[lPos + 4] = currentColorRef.current.g * lineAlpha;
          lcArray[lPos + 5] = currentColorRef.current.b * lineAlpha;

          lineCount++;
        }
      }

      linePosAttr.needsUpdate = true;
      lineColorsAttr.needsUpdate = true;
      lineGeometry.setDrawRange(0, lineCount * 2);

      // Rotate sphere
      particleSystem.rotation.y += rotationSpeedRef.current;
      particleSystem.rotation.x += rotationSpeedRef.current * 0.5;
      
      lineSystem.rotation.y = particleSystem.rotation.y;
      lineSystem.rotation.x = particleSystem.rotation.x;

      // Parallax interaction with mouse
      const targetCamX = mouseRef.current.x * 60;
      const targetCamY = mouseRef.current.y * 60;
      camera.position.x += (targetCamX - camera.position.x) * 0.05;
      camera.position.y += (targetCamY - camera.position.y) * 0.05;
      camera.lookAt(scene.position);

      renderer.render(scene, camera);
    };

    animate();

    // Cleanup
    return () => {
      window.removeEventListener('mousemove', onMouseMove);
      window.removeEventListener('resize', handleResize);
      cancelAnimationFrame(animationFrameId);
      
      if (containerRef.current && renderer.domElement) {
        containerRef.current.removeChild(renderer.domElement);
      }

      geometry.dispose();
      material.dispose();
      lineGeometry.dispose();
      lineMaterial.dispose();
      renderer.dispose();
    };
  }, [riskLevel]);

  // Handle prop updates dynamically via ref interpolation
  useEffect(() => {
    if (riskLevel === 'LOW') {
      targetColorRef.current.set('#00f2fe'); // Cyan
      targetRotationSpeedRef.current = 0.002;
      scaleNoiseRef.current = 0;
    } else if (riskLevel === 'MEDIUM') {
      targetColorRef.current.set('#f59e0b'); // Amber
      targetRotationSpeedRef.current = 0.006;
      scaleNoiseRef.current = 0.02;
    } else if (riskLevel === 'HIGH') {
      targetColorRef.current.set('#ef4444'); // Red
      targetRotationSpeedRef.current = 0.015;
      scaleNoiseRef.current = 0.08;
    }
  }, [riskLevel, riskScore]);

  return (
    <div style={{ position: 'relative', width: '100%', height: '100%' }}>
      {/* 3D WebGL Canvas Container */}
      <div ref={containerRef} style={{ width: '100%', height: '100%', minHeight: '380px' }} />
      
      {/* HUD Info overlay */}
      <div style={{
        position: 'absolute',
        bottom: '20px',
        left: '20px',
        pointerEvents: 'none',
        fontFamily: 'var(--font-mono)',
        fontSize: '12px',
        color: 'var(--text-muted)',
        background: 'rgba(3, 4, 8, 0.65)',
        padding: '8px 12px',
        borderRadius: '6px',
        border: '1px solid var(--border-color)',
        backdropFilter: 'blur(4px)',
        zIndex: 2
      }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: '8px', marginBottom: '4px' }}>
          <span className={`status-dot ${riskLevel === 'LOW' ? 'secure' : riskLevel === 'MEDIUM' ? 'warning' : 'danger'}`}></span>
          <span style={{ color: 'var(--text-main)', textTransform: 'uppercase', fontWeight: 600 }}>
            System Status: {riskLevel === 'LOW' ? 'Trust Secure' : riskLevel === 'MEDIUM' ? 'Elevated Risk' : 'Anomalous Threat'}
          </span>
        </div>
        <div>Active Nodes: 700 | Signal Fidelity: 99.8%</div>
        <div>Dynamic Risk Vector: {riskScore}%</div>
      </div>
    </div>
  );
};
