'use client';

import React, { useEffect, useRef } from 'react';
import * as THREE from 'three';
import { EUROPEAN_NUMBERS, RED_NUMBERS, BLACK_NUMBERS } from '@/lib/roulette/rouletteEngine';
import { useRouletteStore } from '@/lib/roulette/useRouletteStore';
import { soundEffects } from '@/lib/roulette/soundEffects';

/**
 * Creates a high-resolution circular texture for the 37 European pockets
 */
function createWheelTexture(): THREE.CanvasTexture {
  const size = 2048;
  const canvas = document.createElement('canvas');
  canvas.width = size;
  canvas.height = size;
  const ctx = canvas.getContext('2d')!;

  const cx = size / 2;
  const cy = size / 2;
  const rOuter = size * 0.48;
  const rInner = size * 0.35;
  const totalPockets = 37;
  const anglePerPocket = (Math.PI * 2) / totalPockets;

  // Background
  ctx.fillStyle = '#110d0a';
  ctx.fillRect(0, 0, size, size);

  // Outer gold rim
  ctx.beginPath();
  ctx.arc(cx, cy, rOuter + 8, 0, Math.PI * 2);
  ctx.strokeStyle = '#D4AF37';
  ctx.lineWidth = 14;
  ctx.stroke();

  // Draw 37 pockets
  EUROPEAN_NUMBERS.forEach((num, index) => {
    const startAngle = index * anglePerPocket - anglePerPocket / 2 - Math.PI / 2;
    const endAngle = startAngle + anglePerPocket;

    // Determine pocket color
    let pocketColor = '#0b6623'; // Green for 0
    if (RED_NUMBERS.has(num)) pocketColor = '#b81414';
    if (BLACK_NUMBERS.has(num)) pocketColor = '#1a1a1a';

    // Pocket background
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
    ctx.lineTo(cx + Math.cos(startAngle) * (rOuter + 6), cy + Math.sin(startAngle) * (rOuter + 6));
    ctx.strokeStyle = '#f5d27a';
    ctx.lineWidth = 4;
    ctx.stroke();

    // Number text
    ctx.save();
    const midAngle = startAngle + anglePerPocket / 2;
    const textRadius = (rOuter + rInner) / 2;
    const tx = cx + Math.cos(midAngle) * textRadius;
    const ty = cy + Math.sin(midAngle) * textRadius;

    ctx.translate(tx, ty);
    ctx.rotate(midAngle + Math.PI / 2); // Rotate text radially facing outward

    ctx.fillStyle = '#FFFFFF';
    ctx.font = 'bold 44px sans-serif';
    ctx.textAlign = 'center';
    ctx.textBaseline = 'middle';
    ctx.shadowColor = 'rgba(0,0,0,0.8)';
    ctx.shadowBlur = 6;
    ctx.fillText(num.toString(), 0, 0);
    ctx.restore();
  });

  // Inner gold border
  ctx.beginPath();
  ctx.arc(cx, cy, rInner - 2, 0, Math.PI * 2);
  ctx.strokeStyle = '#D4AF37';
  ctx.lineWidth = 10;
  ctx.stroke();

  const texture = new THREE.CanvasTexture(canvas);
  texture.anisotropy = 16;
  return texture;
}

export function RouletteWheel3D() {
  const containerRef = useRef<HTMLDivElement>(null);
  const spinState = useRouletteStore((s) => s.spinState);
  const targetWinningPocketIndex = useRouletteStore((s) => s.targetWinningPocketIndex);
  const fastSpin = useRouletteStore((s) => s.fastSpin);
  const onSpinComplete = useRouletteStore((s) => s.onSpinComplete);

  // References for animation loop
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
    scene.fog = new THREE.FogExp2(0x0a0a0a, 0.035);

    const camera = new THREE.PerspectiveCamera(
      42,
      container.clientWidth / container.clientHeight,
      0.1,
      100
    );
    // Camera positioned at realistic angled live casino dealer view
    const initialCamPos = new THREE.Vector3(0, 5.8, 6.2);
    const zoomedCamPos = new THREE.Vector3(0, 4.3, 4.6);
    camera.position.copy(initialCamPos);
    camera.lookAt(0, -0.4, 0);

    const renderer = new THREE.WebGLRenderer({ antialias: true, alpha: true, powerPreference: 'high-performance' });
    renderer.setSize(container.clientWidth, container.clientHeight);
    renderer.setPixelRatio(Math.min(window.devicePixelRatio, 2));
    renderer.shadowMap.enabled = true;
    renderer.shadowMap.type = THREE.PCFSoftShadowMap;
    renderer.toneMapping = THREE.ACESFilmicToneMapping;
    renderer.toneMappingExposure = 1.15;
    container.appendChild(renderer.domElement);

    // --- LIGHTING ---
    const ambientLight = new THREE.AmbientLight(0xfff1db, 0.9);
    scene.add(ambientLight);

    // Warm overhead spotlight on spindle
    const spotLight = new THREE.SpotLight(0xffdf9e, 4.0, 20, Math.PI / 4, 0.4, 1.2);
    spotLight.position.set(0, 8, 3);
    spotLight.castShadow = true;
    spotLight.shadow.mapSize.width = 1024;
    spotLight.shadow.mapSize.height = 1024;
    spotLight.shadow.bias = -0.0005;
    scene.add(spotLight);

    // Gold rim accent light
    const rimLight = new THREE.DirectionalLight(0xe8b86d, 1.5);
    rimLight.position.set(-4, 3, -3);
    scene.add(rimLight);

    // --- ROULETTE WHEEL HIERARCHY ---
    const wheelGroup = new THREE.Group();
    scene.add(wheelGroup);

    // 1. Static Outer Bowl & Rim (Mahogany & Gold)
    const bowlGroup = new THREE.Group();
    scene.add(bowlGroup);

    // Polished Mahogany Outer Ring
    const mahoganyMat = new THREE.MeshStandardMaterial({
      color: 0x3d170a,
      roughness: 0.25,
      metalness: 0.1,
    });
    const goldMat = new THREE.MeshStandardMaterial({
      color: 0xe5b842,
      roughness: 0.18,
      metalness: 0.88,
    });
    const darkWoodMat = new THREE.MeshStandardMaterial({
      color: 0x1f0c05,
      roughness: 0.4,
      metalness: 0.05,
    });

    // Outer wood bevel
    const outerRimGeo = new THREE.TorusGeometry(3.6, 0.32, 24, 72);
    const outerRimMesh = new THREE.Mesh(outerRimGeo, mahoganyMat);
    outerRimMesh.rotation.x = Math.PI / 2;
    outerRimMesh.position.y = -0.05;
    outerRimMesh.castShadow = true;
    outerRimMesh.receiveShadow = true;
    bowlGroup.add(outerRimMesh);

    // Outer gold trim line
    const goldTrimGeo = new THREE.TorusGeometry(3.85, 0.05, 16, 72);
    const goldTrimMesh = new THREE.Mesh(goldTrimGeo, goldMat);
    goldTrimMesh.rotation.x = Math.PI / 2;
    bowlGroup.add(goldTrimMesh);

    // Inner gold ball track bevel
    const trackGoldGeo = new THREE.CylinderGeometry(3.4, 3.2, 0.35, 72, 1, true);
    const trackGoldMesh = new THREE.Mesh(trackGoldGeo, goldMat);
    trackGoldMesh.position.y = -0.15;
    bowlGroup.add(trackGoldMesh);

    // Diamond deflectors (rhombus brass pins)
    const deflectorGeo = new THREE.OctahedronGeometry(0.09, 0);
    for (let i = 0; i < 8; i++) {
      const angle = (i * Math.PI * 2) / 8;
      const deflector = new THREE.Mesh(deflectorGeo, goldMat);
      deflector.position.set(Math.cos(angle) * 3.3, -0.05, Math.sin(angle) * 3.3);
      deflector.rotation.y = angle;
      bowlGroup.add(deflector);
    }

    // 2. Rotating Wheel Head (Wheel Rotor)
    const rotorGroup = new THREE.Group();
    wheelGroup.add(rotorGroup);

    // Number Pocket Ring with dynamic canvas texture
    const wheelTexture = createWheelTexture();
    const pocketRingGeo = new THREE.RingGeometry(1.6, 3.18, 72, 1);
    const pocketRingMat = new THREE.MeshStandardMaterial({
      map: wheelTexture,
      roughness: 0.35,
      metalness: 0.2,
      side: THREE.DoubleSide,
    });
    const pocketRingMesh = new THREE.Mesh(pocketRingGeo, pocketRingMat);
    pocketRingMesh.rotation.x = -Math.PI / 2;
    pocketRingMesh.position.y = -0.22;
    pocketRingMesh.receiveShadow = true;
    rotorGroup.add(pocketRingMesh);

    // Center Spoke Cone (sloping mahogany)
    const centerConeGeo = new THREE.ConeGeometry(1.6, 0.45, 48, 1, true);
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

    // 3. Central Solid Gold Spindle / Turret (Towering Finial)
    const spindleBaseGeo = new THREE.CylinderGeometry(0.38, 0.45, 0.3, 32);
    const spindleBase = new THREE.Mesh(spindleBaseGeo, goldMat);
    spindleBase.position.y = 0.22;
    rotorGroup.add(spindleBase);

    const spindleColGeo = new THREE.CylinderGeometry(0.18, 0.28, 0.55, 32);
    const spindleCol = new THREE.Mesh(spindleColGeo, goldMat);
    spindleCol.position.y = 0.55;
    rotorGroup.add(spindleCol);

    const spindleCrownGeo = new THREE.SphereGeometry(0.24, 24, 24);
    const spindleCrown = new THREE.Mesh(spindleCrownGeo, goldMat);
    spindleCrown.position.y = 0.9;
    rotorGroup.add(spindleCrown);

    const spindleTipGeo = new THREE.ConeGeometry(0.12, 0.35, 24);
    const spindleTip = new THREE.Mesh(spindleTipGeo, goldMat);
    spindleTip.position.y = 1.15;
    rotorGroup.add(spindleTip);

    // 4. The Ivory Ball
    const ballGeo = new THREE.SphereGeometry(0.075, 24, 24);
    const ballMat = new THREE.MeshStandardMaterial({
      color: 0xffffff,
      roughness: 0.1,
      metalness: 0.05,
    });
    const ballMesh = new THREE.Mesh(ballGeo, ballMat);
    ballMesh.castShadow = true;
    scene.add(ballMesh);

    // Animation Physics Variables
    let wheelRotorAngle = 0;
    let ballAngle = 0;
    let ballRadius = 3.28;
    let ballHeight = 0.04;
    let spinProgress = 0;
    let spinActive = false;
    let spinStartTimestamp = 0;
    let lastBounceTime = 0;

    // Default ball parked in pocket 0
    ballMesh.position.set(Math.cos(0) * 2.35, -0.2, Math.sin(0) * 2.35);

    // --- RESIZE LISTENER ---
    const handleResize = () => {
      if (!container) return;
      const w = container.clientWidth;
      const h = container.clientHeight;
      camera.aspect = w / h;
      camera.updateProjectionMatrix();
      renderer.setSize(w, h);
    };
    window.addEventListener('resize', handleResize);

    // --- ANIMATION RAF LOOP ---
    let animationFrameId: number;
    let lastFrameTime = performance.now();

    const animate = (currentTime: number) => {
      animationFrameId = requestAnimationFrame(animate);

      const dt = Math.min((currentTime - lastFrameTime) / 1000, 0.1);
      lastFrameTime = currentTime;

      const currentSpinState = stateRef.current.spinState;
      const targetPocket = stateRef.current.targetPocketIndex;
      const isFast = stateRef.current.fastSpin;
      const spinDuration = isFast ? 2.8 : 6.0;

      if (currentSpinState === 'spinning') {
        if (!spinActive) {
          // Initialize new spin
          spinActive = true;
          spinStartTimestamp = currentTime;
          spinProgress = 0;
          ballRadius = 3.32;
        }

        const elapsed = (currentTime - spinStartTimestamp) / 1000;
        spinProgress = Math.min(elapsed / spinDuration, 1.0);

        // Smooth easing curves
        // Wheel accelerates and then gradually eases into slow rotation
        const wheelSpeed = (1 - spinProgress * 0.75) * 4.2;
        wheelRotorAngle -= wheelSpeed * dt;
        rotorGroup.rotation.y = wheelRotorAngle;

        // Ball orbits opposite direction (clockwise)
        // High initial orbit speed, decaying exponentially
        const ballSpeed = Math.pow(1 - spinProgress * 0.92, 1.8) * 16.0 + 1.2;
        ballAngle += ballSpeed * dt;

        // Ball drops from outer track to pocket ring as it slows down
        if (spinProgress < 0.6) {
          // High rim orbit
          ballRadius = 3.32;
          ballHeight = 0.04;
        } else if (spinProgress < 0.88) {
          // Spiraling down into pockets
          const spiralT = (spinProgress - 0.6) / 0.28;
          ballRadius = 3.32 - spiralT * (3.32 - 2.35);
          ballHeight = 0.04 - spiralT * 0.23;

          // Subtle clatter when ball hits deflectors
          if (currentTime - lastBounceTime > 220) {
            soundEffects.playBallBounceSound(0.6 * (1 - spiralT));
            lastBounceTime = currentTime;
          }
        } else {
          // Settling phase: lock ball to target pocket on rotating wheel
          const settleT = (spinProgress - 0.88) / 0.12;
          const pocketAngleStep = (Math.PI * 2) / 37;
          // Target pocket's exact current world angle on the rotating wheel
          const targetWorldAngle = wheelRotorAngle + targetPocket * pocketAngleStep - Math.PI / 2;

          // Interpolate ball angle to match target pocket
          ballAngle = THREE.MathUtils.lerp(ballAngle, targetWorldAngle, settleT * 0.35);
          ballRadius = 2.35;

          // Micro bounces
          const bounceCount = 4;
          const bounceIntensity = (1 - settleT) * 0.09;
          const bounce = Math.abs(Math.sin(settleT * Math.PI * bounceCount)) * bounceIntensity;
          ballHeight = -0.2 + bounce;

          if (settleT > 0.3 && currentTime - lastBounceTime > 140 && bounceIntensity > 0.015) {
            soundEffects.playBallBounceSound(bounceIntensity * 10);
            lastBounceTime = currentTime;
          }
        }

        ballMesh.position.set(
          Math.cos(ballAngle) * ballRadius,
          ballHeight,
          Math.sin(ballAngle) * ballRadius
        );

        // Camera push-in during spin
        camera.position.lerpVectors(initialCamPos, zoomedCamPos, Math.sin(spinProgress * Math.PI * 0.5));
        camera.lookAt(0, -0.3, 0);

        // Spin complete
        if (spinProgress >= 1.0) {
          spinActive = false;
          // Ball stays exactly locked in target pocket
          stateRef.current.onSpinComplete();
        }
      } else {
        // Idle state: slow, continuous, elegant wheel spin
        wheelRotorAngle -= 0.18 * dt;
        rotorGroup.rotation.y = wheelRotorAngle;

        // Ball rests locked in current target pocket
        const pocketAngleStep = (Math.PI * 2) / 37;
        const targetWorldAngle = wheelRotorAngle + targetPocket * pocketAngleStep - Math.PI / 2;
        ballMesh.position.set(
          Math.cos(targetWorldAngle) * 2.35,
          -0.2,
          Math.sin(targetWorldAngle) * 2.35
        );

        // Camera smoothly returns to initial vantage point
        camera.position.lerp(initialCamPos, 0.05);
        camera.lookAt(0, -0.4, 0);
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
    <div className="relative w-full h-full overflow-hidden select-none">
      {/* 1:1 Reference Luxury Dealer Casino Backdrop */}
      {/* eslint-disable-next-line @next/next/no-img-element */}
      <img
        src="/roulette-dealer.jpg"
        alt="Live Roulette VIP Table"
        className="absolute inset-0 w-full h-full object-cover object-top opacity-55 filter contrast-110 brightness-95"
      />

      {/* Atmospheric lighting gradients & bokeh glow */}
      <div className="absolute inset-0 bg-radial from-transparent via-[#0a0a0a]/40 to-[#0a0a0a] pointer-events-none" />
      <div className="absolute inset-x-0 bottom-0 h-28 bg-gradient-to-t from-[#0a0a0a] via-[#0a0a0a]/80 to-transparent pointer-events-none" />

      {/* Three.js 60FPS Interactive 3D Canvas Container */}
      <div ref={containerRef} className="relative z-10 w-full h-full pointer-events-none" />
    </div>
  );
}
