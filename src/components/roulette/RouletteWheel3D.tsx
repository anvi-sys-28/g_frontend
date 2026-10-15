'use client';

import React, { useEffect, useRef } from 'react';
import * as THREE from 'three';
import { EUROPEAN_NUMBERS, RED_NUMBERS, BLACK_NUMBERS } from '@/lib/roulette/rouletteEngine';
import { useRouletteStore } from '@/lib/roulette/useRouletteStore';
import { soundEffects } from '@/lib/roulette/soundEffects';

/**
 * Creates an optimized 1024x1024 circular texture for the 37 European pockets
 */
function createWheelTexture(): THREE.CanvasTexture {
  const size = 1024;
  const canvas = document.createElement('canvas');
  canvas.width = size;
  canvas.height = size;
  const ctx = canvas.getContext('2d')!;

  const cx = size / 2;
  const cy = size / 2;
  const rOuter = size * 0.485;
  const rInner = size * 0.355;
  const totalPockets = 37;
  const anglePerPocket = (Math.PI * 2) / totalPockets;

  // Background
  ctx.fillStyle = '#0f0b08';
  ctx.fillRect(0, 0, size, size);

  // Outer gold rim
  ctx.beginPath();
  ctx.arc(cx, cy, rOuter + 4, 0, Math.PI * 2);
  ctx.strokeStyle = '#D4AF37';
  ctx.lineWidth = 8;
  ctx.stroke();

  // Draw 37 pockets
  EUROPEAN_NUMBERS.forEach((num, index) => {
    const startAngle = index * anglePerPocket - anglePerPocket / 2 - Math.PI / 2;
    const endAngle = startAngle + anglePerPocket;

    // Pocket color
    let pocketColor = '#0b6623'; // Green for 0
    if (RED_NUMBERS.has(num)) pocketColor = '#b81414';
    if (BLACK_NUMBERS.has(num)) pocketColor = '#181818';

    // Sector path
    ctx.beginPath();
    ctx.moveTo(cx + Math.cos(startAngle) * rInner, cy + Math.sin(startAngle) * rInner);
    ctx.arc(cx, cy, rOuter, startAngle, endAngle);
    ctx.lineTo(cx + Math.cos(endAngle) * rInner, cy + Math.sin(endAngle) * rInner);
    ctx.arc(cx, cy, rInner, endAngle, startAngle, true);
    ctx.closePath();
    ctx.fillStyle = pocketColor;
    ctx.fill();

    // Pocket fret divider (gold line)
    ctx.beginPath();
    ctx.moveTo(cx + Math.cos(startAngle) * rInner, cy + Math.sin(startAngle) * rInner);
    ctx.lineTo(cx + Math.cos(startAngle) * (rOuter + 3), cy + Math.sin(startAngle) * (rOuter + 3));
    ctx.strokeStyle = '#f5d27a';
    ctx.lineWidth = 2.5;
    ctx.stroke();

    // Number text
    ctx.save();
    const midAngle = startAngle + anglePerPocket / 2;
    const textRadius = (rOuter + rInner) / 2;
    const tx = cx + Math.cos(midAngle) * textRadius;
    const ty = cy + Math.sin(midAngle) * textRadius;

    ctx.translate(tx, ty);
    ctx.rotate(midAngle + Math.PI / 2); // Facing radially outward

    ctx.fillStyle = '#FFFFFF';
    ctx.font = 'bold 26px sans-serif';
    ctx.textAlign = 'center';
    ctx.textBaseline = 'middle';
    ctx.shadowColor = 'rgba(0,0,0,0.9)';
    ctx.shadowBlur = 4;
    ctx.fillText(num.toString(), 0, 0);
    ctx.restore();
  });

  // Inner gold border
  ctx.beginPath();
  ctx.arc(cx, cy, rInner - 1, 0, Math.PI * 2);
  ctx.strokeStyle = '#D4AF37';
  ctx.lineWidth = 6;
  ctx.stroke();

  const texture = new THREE.CanvasTexture(canvas);
  texture.anisotropy = 8;
  texture.minFilter = THREE.LinearFilter;
  texture.magFilter = THREE.LinearFilter;
  return texture;
}

export function RouletteWheel3D() {
  const containerRef = useRef<HTMLDivElement>(null);
  const spinState = useRouletteStore((s) => s.spinState);
  const targetWinningPocketIndex = useRouletteStore((s) => s.targetWinningPocketIndex);
  const fastSpin = useRouletteStore((s) => s.fastSpin);
  const onSpinComplete = useRouletteStore((s) => s.onSpinComplete);

  const stateRef = useRef({
    spinState,
    targetPocketIndex: targetWinningPocketIndex,
    fastSpin,
    onSpinComplete,
  });

  useEffect(() => {
    stateRef.current = {
      spinState,
      targetPocketIndex: targetWinningPocketIndex,
      fastSpin,
      onSpinComplete,
    };
  }, [spinState, targetWinningPocketIndex, fastSpin, onSpinComplete]);

  useEffect(() => {
    const container = containerRef.current;
    if (!container) return;

    // --- THREE.JS SCENE SETUP ---
    const scene = new THREE.Scene();

    const camera = new THREE.PerspectiveCamera(
      42,
      container.clientWidth / container.clientHeight,
      0.1,
      50
    );
    const initialCamPos = new THREE.Vector3(0, 5.7, 6.1);
    const zoomedCamPos = new THREE.Vector3(0, 4.4, 4.7);
    camera.position.copy(initialCamPos);
    camera.lookAt(0, -0.35, 0);

    // High performance renderer with optimal pixel ratio (capped at 1.5)
    const renderer = new THREE.WebGLRenderer({
      antialias: true,
      alpha: true,
      powerPreference: 'high-performance',
      precision: 'highp',
    });
    renderer.setSize(container.clientWidth, container.clientHeight);
    renderer.setPixelRatio(Math.min(window.devicePixelRatio || 1, 1.5));
    renderer.toneMapping = THREE.ACESFilmicToneMapping;
    renderer.toneMappingExposure = 1.15;
    container.appendChild(renderer.domElement);

    // --- LIGHTING ---
    const ambientLight = new THREE.AmbientLight(0xfff3e0, 1.3);
    scene.add(ambientLight);

    // Warm overhead spotlight on spindle
    const spotLight = new THREE.DirectionalLight(0xffe2a0, 2.5);
    spotLight.position.set(0, 9, 4);
    scene.add(spotLight);

    // Gold rim accent light
    const rimLight = new THREE.DirectionalLight(0xd4af37, 1.8);
    rimLight.position.set(-4, 3, -2);
    scene.add(rimLight);

    // --- ROULETTE WHEEL HIERARCHY ---
    const wheelGroup = new THREE.Group();
    scene.add(wheelGroup);

    // Materials
    const mahoganyMat = new THREE.MeshStandardMaterial({
      color: 0x3d170a,
      roughness: 0.28,
      metalness: 0.08,
    });
    const goldMat = new THREE.MeshStandardMaterial({
      color: 0xdeb038,
      roughness: 0.16,
      metalness: 0.88,
    });
    const darkWoodMat = new THREE.MeshStandardMaterial({
      color: 0x1f0c05,
      roughness: 0.35,
      metalness: 0.05,
    });

    // 1. Static Outer Bowl & Rim (Mahogany & Gold)
    const bowlGroup = new THREE.Group();
    wheelGroup.add(bowlGroup);

    // Outer wood rim bevel
    const outerRimGeo = new THREE.TorusGeometry(3.6, 0.3, 16, 48);
    const outerRimMesh = new THREE.Mesh(outerRimGeo, mahoganyMat);
    outerRimMesh.rotation.x = Math.PI / 2;
    outerRimMesh.position.y = -0.05;
    bowlGroup.add(outerRimMesh);

    // Outer gold trim line
    const goldTrimGeo = new THREE.TorusGeometry(3.85, 0.04, 12, 48);
    const goldTrimMesh = new THREE.Mesh(goldTrimGeo, goldMat);
    goldTrimMesh.rotation.x = Math.PI / 2;
    bowlGroup.add(goldTrimMesh);

    // Inner gold ball track bevel
    const trackGoldGeo = new THREE.CylinderGeometry(3.4, 3.2, 0.32, 48, 1, true);
    const trackGoldMesh = new THREE.Mesh(trackGoldGeo, goldMat);
    trackGoldMesh.position.y = -0.15;
    bowlGroup.add(trackGoldMesh);

    // 8 Diamond deflectors (rhombus brass pins)
    const deflectorGeo = new THREE.OctahedronGeometry(0.08, 0);
    for (let i = 0; i < 8; i++) {
      const angle = (i * Math.PI * 2) / 8;
      const deflector = new THREE.Mesh(deflectorGeo, goldMat);
      deflector.position.set(Math.cos(angle) * 3.3, -0.05, Math.sin(angle) * 3.3);
      deflector.rotation.y = angle;
      bowlGroup.add(deflector);
    }

    // Soft contact shadow disc under the wheel
    const shadowGeo = new THREE.RingGeometry(1.5, 3.9, 32);
    const shadowMat = new THREE.MeshBasicMaterial({
      color: 0x000000,
      transparent: true,
      opacity: 0.45,
      side: THREE.DoubleSide,
    });
    const shadowMesh = new THREE.Mesh(shadowGeo, shadowMat);
    shadowMesh.rotation.x = -Math.PI / 2;
    shadowMesh.position.y = -0.38;
    wheelGroup.add(shadowMesh);

    // 2. Rotating Wheel Head (Wheel Rotor)
    const rotorGroup = new THREE.Group();
    wheelGroup.add(rotorGroup);

    // Number Pocket Ring with dynamic canvas texture
    const wheelTexture = createWheelTexture();
    const pocketRingGeo = new THREE.RingGeometry(1.6, 3.18, 48, 1);
    const pocketRingMat = new THREE.MeshStandardMaterial({
      map: wheelTexture,
      roughness: 0.35,
      metalness: 0.15,
      side: THREE.DoubleSide,
    });
    const pocketRingMesh = new THREE.Mesh(pocketRingGeo, pocketRingMat);
    pocketRingMesh.rotation.x = -Math.PI / 2;
    pocketRingMesh.position.y = -0.22;
    rotorGroup.add(pocketRingMesh);

    // Center Spoke Cone (sloping mahogany)
    const centerConeGeo = new THREE.ConeGeometry(1.6, 0.45, 36, 1, true);
    const centerConeMesh = new THREE.Mesh(centerConeGeo, darkWoodMat);
    centerConeMesh.position.y = -0.05;
    rotorGroup.add(centerConeMesh);

    // 8 Radial Gold Spokes on the cone
    for (let i = 0; i < 8; i++) {
      const angle = (i * Math.PI * 2) / 8;
      const spokeGeo = new THREE.BoxGeometry(0.04, 0.04, 1.55);
      const spoke = new THREE.Mesh(spokeGeo, goldMat);
      spoke.position.set(Math.cos(angle) * 0.8, -0.06, Math.sin(angle) * 0.8);
      spoke.rotation.y = -angle;
      spoke.rotation.x = -0.25;
      rotorGroup.add(spoke);
    }

    // 3. Central Solid Gold Spindle / Turret (Tiered Crown Finial)
    const spindleBaseGeo = new THREE.CylinderGeometry(0.38, 0.45, 0.28, 24);
    const spindleBase = new THREE.Mesh(spindleBaseGeo, goldMat);
    spindleBase.position.y = 0.22;
    rotorGroup.add(spindleBase);

    const spindleColGeo = new THREE.CylinderGeometry(0.18, 0.28, 0.52, 24);
    const spindleCol = new THREE.Mesh(spindleColGeo, goldMat);
    spindleCol.position.y = 0.55;
    rotorGroup.add(spindleCol);

    const spindleCrownGeo = new THREE.SphereGeometry(0.24, 18, 18);
    const spindleCrown = new THREE.Mesh(spindleCrownGeo, goldMat);
    spindleCrown.position.y = 0.9;
    rotorGroup.add(spindleCrown);

    const spindleTipGeo = new THREE.ConeGeometry(0.12, 0.35, 18);
    const spindleTip = new THREE.Mesh(spindleTipGeo, goldMat);
    spindleTip.position.y = 1.15;
    rotorGroup.add(spindleTip);

    // 4. The Ivory Ball
    const ballGeo = new THREE.SphereGeometry(0.075, 16, 16);
    const ballMat = new THREE.MeshStandardMaterial({
      color: 0xffffff,
      roughness: 0.12,
      metalness: 0.05,
    });
    const ballMesh = new THREE.Mesh(ballGeo, ballMat);
    scene.add(ballMesh);

    // --- CONTINUOUS PHYSICS & TRAJECTORY VARIABLES ---
    let currentWheelAngle = 0;
    let currentBallAngle = 0;
    let ballRadius = 2.38;
    let ballHeight = -0.2;

    // Spin trajectory variables
    let isSpinningActive = false;
    let spinStartTimestamp = 0;
    let spinDuration = 3.8;
    let wheelStartAngle = 0;
    let wheelTotalDelta = 0;
    let ballStartAngle = 0;
    let ballTotalTravel = 0;
    let lastBounceTime = 0;

    // Default ball parked in pocket 0
    const pocketAngleStep = (Math.PI * 2) / 37;
    currentBallAngle = targetWinningPocketIndex * pocketAngleStep - Math.PI / 2;
    ballMesh.position.set(
      Math.cos(currentBallAngle) * ballRadius,
      ballHeight,
      Math.sin(currentBallAngle) * ballRadius
    );

    // --- RESIZE LISTENER ---
    const handleResize = () => {
      if (!container) return;
      const w = container.clientWidth;
      const h = container.clientHeight;
      if (w <= 0 || h <= 0) return;
      camera.aspect = w / h;
      camera.updateProjectionMatrix();
      renderer.setSize(w, h);
    };
    window.addEventListener('resize', handleResize);

    // --- ANIMATION RAF LOOP (60-120 FPS) ---
    let animationFrameId: number;
    let lastTime = performance.now();
    let spinHasCompleted = false;

    const animate = (currentTime: number) => {
      animationFrameId = requestAnimationFrame(animate);

      const dt = Math.min((currentTime - lastTime) / 1000, 0.05);
      lastTime = currentTime;

      const { spinState, targetPocketIndex, fastSpin, onSpinComplete } = stateRef.current;
      const duration = fastSpin ? 1.8 : 3.8;

      if (spinState === 'spinning') {
        if (!isSpinningActive) {
          // --- LAUNCH NEW SPIN: SETUP DETERMINISTIC TRAJECTORY ---
          isSpinningActive = true;
          spinHasCompleted = false;
          spinStartTimestamp = currentTime;
          spinDuration = duration;
          wheelStartAngle = currentWheelAngle;

          // Wheel makes 2.5 full counter-clockwise turns
          wheelTotalDelta = -(Math.PI * 2 * (fastSpin ? 1.5 : 2.5));

          // Pocket local angle on wheel
          const targetLocalAngle = targetPocketIndex * pocketAngleStep - Math.PI / 2;
          // Target pocket final world position when spin ends
          const finalWheelAngle = wheelStartAngle + wheelTotalDelta;
          const targetFinalWorldAngle = finalWheelAngle + targetLocalAngle;

          // Ball initial launch angle (opposite direction)
          ballStartAngle = currentBallAngle;
          const fullRevolutions = fastSpin ? 3 : 6;
          // Calculate exact travel so ball arrives precisely at targetFinalWorldAngle
          let angleDiff = (targetFinalWorldAngle - ballStartAngle) % (Math.PI * 2);
          if (angleDiff < 0) angleDiff += Math.PI * 2;
          ballTotalTravel = Math.PI * 2 * fullRevolutions + angleDiff;
        }

        const elapsed = (currentTime - spinStartTimestamp) / 1000;
        const p = Math.min(elapsed / spinDuration, 1.0);

        if (p >= 1.0) {
          // --- PINPOINT SETTLEMENT IN WINNING POCKET (NO RE-ENTRY JITTER) ---
          const finalWheelAngle = wheelStartAngle + wheelTotalDelta;
          currentWheelAngle = finalWheelAngle;
          rotorGroup.rotation.y = currentWheelAngle;

          const targetLocalAngle = targetPocketIndex * pocketAngleStep - Math.PI / 2;
          currentBallAngle = finalWheelAngle + targetLocalAngle;
          ballRadius = 2.38;
          ballHeight = -0.20;

          ballMesh.position.set(
            Math.cos(currentBallAngle) * ballRadius,
            ballHeight,
            Math.sin(currentBallAngle) * ballRadius
          );

          camera.position.copy(zoomedCamPos);
          camera.lookAt(0, -0.35, 0);

          if (!spinHasCompleted) {
            spinHasCompleted = true;
            onSpinComplete();
          }
        } else {
          // Smooth cubic ease-out for wheel
          const wheelEase = 1 - Math.pow(1 - p, 3);
          currentWheelAngle = wheelStartAngle + wheelTotalDelta * wheelEase;
          rotorGroup.rotation.y = currentWheelAngle;

          // Smooth continuous deceleration for ball:
          // E(p) = 1 - (1 - p)^2.6
          // Derivative starts high and smoothly decelerates to 0 at p=1
          const ballEase = 1 - Math.pow(1 - p, 2.6);
          currentBallAngle = ballStartAngle + ballTotalTravel * ballEase;

          // Ball Radius and Height Phases:
          if (p < 0.60) {
            // Phase 1: High outer track orbit
            ballRadius = 3.32;
            ballHeight = 0.04;
          } else if (p < 0.84) {
            // Phase 2: Smooth spiral drop into pocket ring
            const u = (p - 0.60) / 0.24;
            const smooth = u * u * (3 - 2 * u); // smoothstep
            ballRadius = 3.32 - smooth * (3.32 - 2.38);
            ballHeight = 0.04 - smooth * (0.04 - (-0.20));

            if (currentTime - lastBounceTime > 180) {
              soundEffects.playBallBounceSound(0.5 * (1 - u));
              lastBounceTime = currentTime;
            }
          } else {
            // Phase 3: Settling micro-bounces inside the winning pocket bed
            ballRadius = 2.38;
            const v = (p - 0.84) / 0.16;
            const bounce = Math.abs(Math.sin(v * Math.PI * 3)) * Math.pow(1 - v, 1.8) * 0.07;
            ballHeight = -0.20 + bounce;

            if (v > 0.1 && currentTime - lastBounceTime > 120 && bounce > 0.01) {
              soundEffects.playBallBounceSound(bounce * 12);
              lastBounceTime = currentTime;
            }
          }

          // Update 3D ball position
          ballMesh.position.set(
            Math.cos(currentBallAngle) * ballRadius,
            ballHeight,
            Math.sin(currentBallAngle) * ballRadius
          );

          // Camera push-in effect
          const camProgress = Math.sin(p * Math.PI * 0.5);
          camera.position.lerpVectors(initialCamPos, zoomedCamPos, camProgress);
          camera.lookAt(0, -0.35, 0);
        }
      } else {
        // --- IDLE / SETTLED STATE: GENTLE CONTINUOUS WHEEL ROTATION ---
        isSpinningActive = false;
        spinHasCompleted = false;
        currentWheelAngle -= 0.15 * dt;
        rotorGroup.rotation.y = currentWheelAngle;

        // Ball stays locked in winning pocket
        const targetLocalAngle = targetPocketIndex * pocketAngleStep - Math.PI / 2;
        currentBallAngle = currentWheelAngle + targetLocalAngle;
        ballRadius = 2.38;
        ballHeight = -0.20;

        ballMesh.position.set(
          Math.cos(currentBallAngle) * ballRadius,
          ballHeight,
          Math.sin(currentBallAngle) * ballRadius
        );

        // Smooth camera ease back to initial vantage point
        camera.position.lerp(initialCamPos, 0.06);
        camera.lookAt(0, -0.35, 0);
      }

      renderer.render(scene, camera);
    };

    animationFrameId = requestAnimationFrame(animate);

    // Cleanup
    return () => {
      cancelAnimationFrame(animationFrameId);
      window.removeEventListener('resize', handleResize);
      renderer.dispose();
      wheelTexture.dispose();
      if (container.contains(renderer.domElement)) {
        container.removeChild(renderer.domElement);
      }
    };
  }, []);

  return (
    <div className="relative w-full h-full overflow-hidden select-none bg-transparent">
      {/* Three.js 60FPS Interactive 3D Canvas Container */}
      <div ref={containerRef} className="relative z-10 w-full h-full pointer-events-none" />
    </div>
  );
}
