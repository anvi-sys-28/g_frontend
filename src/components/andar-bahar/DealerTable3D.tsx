'use client';

import React, { useEffect, useRef } from 'react';
import * as THREE from 'three';
import { Card, BetSide } from '@/lib/andar-bahar/andarBaharEngine';
import { useAndarBaharStore } from '@/lib/andar-bahar/useAndarBaharStore';
import { BarChart3 } from 'lucide-react';

/**
 * Creates the deep red velvet table felt texture with ANDAR and BAHAR mats
 */
function createTableFeltTexture(): THREE.CanvasTexture {
  const size = 512;
  const canvas = document.createElement('canvas');
  canvas.width = size;
  canvas.height = size;
  const ctx = canvas.getContext('2d')!;

  const cx = size / 2;
  const cy = size / 2;

  // 1. Deep red velvet background gradient
  const bgGrad = ctx.createRadialGradient(cx, cy, 30, cx, cy, size * 0.5);
  bgGrad.addColorStop(0, '#7a0c1a');
  bgGrad.addColorStop(0.6, '#4f0610');
  bgGrad.addColorStop(1, '#2d0309');
  ctx.fillStyle = bgGrad;
  ctx.fillRect(0, 0, size, size);

  // Subtle felt texture noise
  ctx.fillStyle = 'rgba(255, 255, 255, 0.025)';
  for (let i = 0; i < 1000; i++) {
    const rx = Math.random() * size;
    const ry = Math.random() * size;
    ctx.fillRect(rx, ry, 1.5, 1.5);
  }

  // Outer gold double ring
  ctx.beginPath();
  ctx.arc(cx, cy, size * 0.46, 0, Math.PI * 2);
  ctx.strokeStyle = '#d4af37';
  ctx.lineWidth = 4;
  ctx.stroke();

  ctx.beginPath();
  ctx.arc(cx, cy, size * 0.44, 0, Math.PI * 2);
  ctx.strokeStyle = 'rgba(212, 175, 55, 0.4)';
  ctx.lineWidth = 1.5;
  ctx.stroke();

  // Center Joker Card Placement Glow Ring
  ctx.beginPath();
  ctx.arc(cx, cy, 95, 0, Math.PI * 2);
  ctx.strokeStyle = '#f5d27a';
  ctx.lineWidth = 3;
  ctx.stroke();

  ctx.beginPath();
  ctx.arc(cx, cy, 105, 0, Math.PI * 2);
  ctx.strokeStyle = 'rgba(245, 210, 122, 0.3)';
  ctx.lineWidth = 1;
  ctx.stroke();

  // --- LEFT MAT: ANDAR ---
  const leftX = size * 0.26;
  const leftY = size * 0.5;
  const matW = 200;
  const matH = 260;

  ctx.save();
  ctx.translate(leftX, leftY);

  // Mat boundary with gold corner ornaments
  ctx.fillStyle = 'rgba(0, 0, 0, 0.35)';
  ctx.fillRect(-matW / 2, -matH / 2, matW, matH);
  ctx.strokeStyle = '#d4af37';
  ctx.lineWidth = 2.5;
  ctx.strokeRect(-matW / 2, -matH / 2, matW, matH);

  // Inner corner brackets
  const corner = 18;
  ctx.lineWidth = 1.5;
  ctx.beginPath();
  // Top-left
  ctx.moveTo(-matW / 2 + corner, -matH / 2 + 6);
  ctx.lineTo(-matW / 2 + 6, -matH / 2 + 6);
  ctx.lineTo(-matW / 2 + 6, -matH / 2 + corner);
  // Top-right
  ctx.moveTo(matW / 2 - corner, -matH / 2 + 6);
  ctx.lineTo(matW / 2 - 6, -matH / 2 + 6);
  ctx.lineTo(matW / 2 - 6, -matH / 2 + corner);
  // Bottom-left
  ctx.moveTo(-matW / 2 + corner, matH / 2 - 6);
  ctx.lineTo(-matW / 2 + 6, matH / 2 - 6);
  ctx.lineTo(-matW / 2 + 6, matH / 2 - corner);
  // Bottom-right
  ctx.moveTo(matW / 2 - corner, matH / 2 - 6);
  ctx.lineTo(matW / 2 - 6, matH / 2 - 6);
  ctx.lineTo(matW / 2 - 6, matH / 2 - corner);
  ctx.stroke();

  // Spade Symbol (♠)
  ctx.fillStyle = '#f5d27a';
  ctx.font = 'bold 36px serif';
  ctx.textAlign = 'center';
  ctx.textBaseline = 'middle';
  ctx.fillText('♠', 0, -matH / 2 + 35);

  // ANDAR Title
  ctx.font = 'italic bold 28px "Cinzel", "Times New Roman", serif';
  ctx.fillStyle = '#f5d27a';
  ctx.shadowColor = 'rgba(0, 0, 0, 0.8)';
  ctx.shadowBlur = 6;
  ctx.fillText('ANDAR', 0, -matH / 2 + 75);
  ctx.restore();

  // --- RIGHT MAT: BAHAR ---
  const rightX = size * 0.74;
  const rightY = size * 0.5;

  ctx.save();
  ctx.translate(rightX, rightY);

  ctx.fillStyle = 'rgba(0, 0, 0, 0.35)';
  ctx.fillRect(-matW / 2, -matH / 2, matW, matH);
  ctx.strokeStyle = '#d4af37';
  ctx.lineWidth = 2.5;
  ctx.strokeRect(-matW / 2, -matH / 2, matW, matH);

  ctx.lineWidth = 1.5;
  ctx.beginPath();
  // Corners
  ctx.moveTo(-matW / 2 + corner, -matH / 2 + 6);
  ctx.lineTo(-matW / 2 + 6, -matH / 2 + 6);
  ctx.lineTo(-matW / 2 + 6, -matH / 2 + corner);
  ctx.moveTo(matW / 2 - corner, -matH / 2 + 6);
  ctx.lineTo(matW / 2 - 6, -matH / 2 + 6);
  ctx.lineTo(matW / 2 - 6, -matH / 2 + corner);
  ctx.moveTo(-matW / 2 + corner, matH / 2 - 6);
  ctx.lineTo(-matW / 2 + 6, matH / 2 - 6);
  ctx.lineTo(-matW / 2 + 6, matH / 2 - corner);
  ctx.moveTo(matW / 2 - corner, matH / 2 - 6);
  ctx.lineTo(matW / 2 - 6, matH / 2 - 6);
  ctx.lineTo(matW / 2 - 6, matH / 2 - corner);
  ctx.stroke();

  // Club Symbol (♣)
  ctx.fillStyle = '#f5d27a';
  ctx.font = 'bold 36px serif';
  ctx.textAlign = 'center';
  ctx.textBaseline = 'middle';
  ctx.fillText('♣', 0, -matH / 2 + 35);

  // BAHAR Title
  ctx.font = 'italic bold 28px "Cinzel", "Times New Roman", serif';
  ctx.fillStyle = '#f5d27a';
  ctx.shadowColor = 'rgba(0, 0, 0, 0.8)';
  ctx.shadowBlur = 6;
  ctx.fillText('BAHAR', 0, -matH / 2 + 75);
  ctx.restore();

  const texture = new THREE.CanvasTexture(canvas);
  texture.minFilter = THREE.LinearFilter;
  texture.magFilter = THREE.LinearFilter;
  return texture;
}

/**
 * Creates texture for a playing card
 */
function createCardTexture(card: Card | null, isJoker: boolean = false): THREE.CanvasTexture {
  const w = 256;
  const h = 360;
  const canvas = document.createElement('canvas');
  canvas.width = w;
  canvas.height = h;
  const ctx = canvas.getContext('2d')!;

  // Background
  ctx.fillStyle = '#fefefe';
  ctx.fillRect(0, 0, w, h);

  // Inner border
  ctx.strokeStyle = '#d4af37';
  ctx.lineWidth = 4;
  ctx.strokeRect(8, 8, w - 16, h - 16);

  if (isJoker || !card) {
    // Joker Card Face
    ctx.fillStyle = '#8a0a1a';
    ctx.fillRect(16, 16, w - 32, h - 32);

    ctx.strokeStyle = '#ffd700';
    ctx.lineWidth = 2;
    ctx.strokeRect(22, 22, w - 44, h - 44);

    ctx.fillStyle = '#ffd700';
    ctx.font = 'bold 24px serif';
    ctx.textAlign = 'center';
    ctx.textBaseline = 'middle';
    ctx.fillText('★ JOKER ★', w / 2, h / 2 - 30);

    ctx.font = 'bold 48px serif';
    ctx.fillText('👑', w / 2, h / 2 + 25);
  } else {
    // Standard Card Face
    const color = card.color === 'red' ? '#b91c1c' : '#171717';

    // Top-left Rank & Suit
    ctx.fillStyle = color;
    ctx.font = 'bold 36px "Cinzel", serif';
    ctx.textAlign = 'left';
    ctx.textBaseline = 'top';
    ctx.fillText(card.rank, 18, 18);

    ctx.font = '32px serif';
    ctx.fillText(card.suit, 18, 58);

    // Center Big Suit Symbol
    ctx.font = '84px serif';
    ctx.textAlign = 'center';
    ctx.textBaseline = 'middle';
    ctx.fillText(card.suit, w / 2, h / 2);

    // Bottom-right Inverted Rank & Suit
    ctx.save();
    ctx.translate(w - 18, h - 18);
    ctx.rotate(Math.PI);
    ctx.font = 'bold 36px "Cinzel", serif';
    ctx.textAlign = 'left';
    ctx.textBaseline = 'top';
    ctx.fillText(card.rank, 0, 0);
    ctx.font = '32px serif';
    ctx.fillText(card.suit, 0, 40);
    ctx.restore();
  }

  const tex = new THREE.CanvasTexture(canvas);
  tex.minFilter = THREE.LinearFilter;
  tex.magFilter = THREE.LinearFilter;
  return tex;
}

/**
 * Creates dark red patterned card back
 */
function createCardBackTexture(): THREE.CanvasTexture {
  const w = 256;
  const h = 360;
  const canvas = document.createElement('canvas');
  canvas.width = w;
  canvas.height = h;
  const ctx = canvas.getContext('2d')!;

  ctx.fillStyle = '#4a050d';
  ctx.fillRect(0, 0, w, h);

  ctx.strokeStyle = '#d4af37';
  ctx.lineWidth = 6;
  ctx.strokeRect(10, 10, w - 20, h - 20);

  // Diamond lattice pattern
  ctx.strokeStyle = 'rgba(212, 175, 55, 0.4)';
  ctx.lineWidth = 1.5;
  const step = 20;
  for (let x = -w; x < w * 2; x += step) {
    ctx.beginPath();
    ctx.moveTo(x, 0);
    ctx.lineTo(x + h, h);
    ctx.stroke();

    ctx.beginPath();
    ctx.moveTo(x, h);
    ctx.lineTo(x + h, 0);
    ctx.stroke();
  }

  const tex = new THREE.CanvasTexture(canvas);
  return tex;
}

export function DealerTable3D() {
  const containerRef = useRef<HTMLDivElement>(null);
  const gameState = useAndarBaharStore((s) => s.gameState);
  const openingCard = useAndarBaharStore((s) => s.openingCard);
  const andarCards = useAndarBaharStore((s) => s.andarCards);
  const baharCards = useAndarBaharStore((s) => s.baharCards);
  const roundResult = useAndarBaharStore((s) => s.roundResult);
  const toggleStats = useAndarBaharStore((s) => s.toggleStats);

  const stateRef = useRef({
    gameState,
    openingCard,
    andarCount: andarCards.length,
    baharCount: baharCards.length,
  });

  useEffect(() => {
    stateRef.current = {
      gameState,
      openingCard,
      andarCount: andarCards.length,
      baharCount: baharCards.length,
    };
  }, [gameState, openingCard, andarCards.length, baharCards.length]);

  useEffect(() => {
    const container = containerRef.current;
    if (!container) return;

    // --- THREE.JS SCENE SETUP ---
    const scene = new THREE.Scene();

    const camera = new THREE.PerspectiveCamera(
      40,
      container.clientWidth / container.clientHeight,
      0.1,
      60
    );
    camera.position.set(0, 5.8, 6.0);
    camera.lookAt(0, -0.4, 0);

    const isMobile = typeof window !== 'undefined' && window.innerWidth < 768;
    const renderer = new THREE.WebGLRenderer({
      antialias: typeof window !== 'undefined' ? window.devicePixelRatio < 2 : true,
      alpha: true,
      powerPreference: 'default',
      precision: isMobile ? 'mediump' : 'highp',
    });
    renderer.setSize(container.clientWidth, container.clientHeight);
    renderer.setPixelRatio(Math.min(window.devicePixelRatio || 1, isMobile ? 1.25 : 1.5));
    renderer.toneMapping = THREE.ACESFilmicToneMapping;
    renderer.toneMappingExposure = 1.18;
    container.appendChild(renderer.domElement);

    // --- LIGHTING ---
    const ambientLight = new THREE.AmbientLight(0xfff3e5, 1.25);
    scene.add(ambientLight);

    // Overhead warm chandelier light
    const overheadLight = new THREE.DirectionalLight(0xffdfa8, 2.8);
    overheadLight.position.set(0, 8, 3.5);
    scene.add(overheadLight);

    // Side gold accent rim light
    const rimLight = new THREE.DirectionalLight(0xd4af37, 1.6);
    rimLight.position.set(-4, 3, -2);
    scene.add(rimLight);

    // --- ATMOSPHERIC LUXURY CASINO BACKDROP (PROCEDURAL) ---
    const backdropGroup = new THREE.Group();
    scene.add(backdropGroup);

    // Glowing chandelier emissive spheres
    const chandelierMat = new THREE.MeshBasicMaterial({ color: 0xffe89e });
    for (let i = 0; i < 5; i++) {
      const bulb = new THREE.Mesh(new THREE.SphereGeometry(0.12, 12, 12), chandelierMat);
      bulb.position.set((i - 2) * 1.5, 4.2 + (i % 2) * 0.3, -3.2);
      backdropGroup.add(bulb);
    }

    // --- TABLE HIERARCHY ---
    const tableGroup = new THREE.Group();
    scene.add(tableGroup);

    // 1. Table Velvet Top with Texture
    const tableFeltTexture = createTableFeltTexture();
    const tableTopGeo = new THREE.CylinderGeometry(3.6, 3.6, 0.35, 48);
    const tableTopMat = new THREE.MeshStandardMaterial({
      map: tableFeltTexture,
      roughness: 0.5,
      metalness: 0.05,
    });
    const tableTopMesh = new THREE.Mesh(tableTopGeo, tableTopMat);
    tableTopMesh.position.y = -0.18;
    tableGroup.add(tableTopMesh);

    // 2. Thick Gold Torus Rim
    const goldMat = new THREE.MeshStandardMaterial({
      color: 0xdeb038,
      roughness: 0.18,
      metalness: 0.88,
    });
    const goldRimGeo = new THREE.TorusGeometry(3.65, 0.18, 16, 48);
    const goldRimMesh = new THREE.Mesh(goldRimGeo, goldMat);
    goldRimMesh.rotation.x = Math.PI / 2;
    goldRimMesh.position.y = -0.02;
    tableGroup.add(goldRimMesh);

    // 3. Ornate Gold Center Card Stand
    const standBaseGeo = new THREE.CylinderGeometry(0.55, 0.65, 0.08, 32);
    const standBase = new THREE.Mesh(standBaseGeo, goldMat);
    standBase.position.set(0, 0.02, 0);
    tableGroup.add(standBase);

    const standPillarGeo = new THREE.CylinderGeometry(0.12, 0.22, 0.25, 24);
    const standPillar = new THREE.Mesh(standPillarGeo, goldMat);
    standPillar.position.set(0, 0.16, 0);
    tableGroup.add(standPillar);

    // Center Opening Card Mesh
    const cardBackTex = createCardBackTexture();
    const jokerCardTex = createCardTexture(null, true);

    const cardGeo = new THREE.BoxGeometry(0.85, 0.015, 1.2);
    const cardMaterials = [
      new THREE.MeshStandardMaterial({ color: 0xffffff }), // right
      new THREE.MeshStandardMaterial({ color: 0xffffff }), // left
      new THREE.MeshStandardMaterial({ map: jokerCardTex, roughness: 0.25 }), // top (face)
      new THREE.MeshStandardMaterial({ map: cardBackTex, roughness: 0.4 }), // bottom (back)
      new THREE.MeshStandardMaterial({ color: 0xffffff }), // front
      new THREE.MeshStandardMaterial({ color: 0xffffff }), // back
    ];
    const centerCardMesh = new THREE.Mesh(cardGeo, cardMaterials);
    centerCardMesh.position.set(0, 0.32, 0);
    centerCardMesh.rotation.x = 0.2; // Slight angled tilt facing camera
    tableGroup.add(centerCardMesh);

    // 4. Card Shoe on Right
    const shoeGroup = new THREE.Group();
    shoeGroup.position.set(2.8, 0.25, -0.6);
    shoeGroup.rotation.y = -Math.PI / 4;
    tableGroup.add(shoeGroup);

    // Acrylic/wood shoe body
    const shoeBodyGeo = new THREE.BoxGeometry(0.95, 0.6, 1.6);
    const shoeBodyMat = new THREE.MeshStandardMaterial({
      color: 0x1f0c05,
      roughness: 0.3,
      metalness: 0.1,
    });
    const shoeBody = new THREE.Mesh(shoeBodyGeo, shoeBodyMat);
    shoeBody.rotation.x = -0.3;
    shoeGroup.add(shoeBody);

    // Angled front glass plate
    const glassMat = new THREE.MeshStandardMaterial({
      color: 0xd4af37,
      transparent: true,
      opacity: 0.65,
      roughness: 0.1,
      metalness: 0.8,
    });
    const shoeFrontGeo = new THREE.BoxGeometry(0.96, 0.55, 0.08);
    const shoeFront = new THREE.Mesh(shoeFrontGeo, glassMat);
    shoeFront.position.set(0, 0.2, 0.7);
    shoeFront.rotation.x = -0.3;
    shoeGroup.add(shoeFront);

    // 5. Chip Stacks at Left & Right
    const chipMatRed = new THREE.MeshStandardMaterial({ color: 0xb91c1c, roughness: 0.3 });
    const chipMatGold = new THREE.MeshStandardMaterial({ color: 0xdeb038, roughness: 0.2, metalness: 0.7 });
    const chipGeo = new THREE.CylinderGeometry(0.24, 0.24, 0.06, 24);

    // Left chips
    for (let c = 0; c < 5; c++) {
      const chip = new THREE.Mesh(chipGeo, c % 2 === 0 ? chipMatRed : chipMatGold);
      chip.position.set(-2.8, 0.03 + c * 0.06, -0.2);
      tableGroup.add(chip);
    }
    // Right chips
    for (let c = 0; c < 6; c++) {
      const chip = new THREE.Mesh(chipGeo, c % 2 === 0 ? chipMatGold : chipMatRed);
      chip.position.set(2.4, 0.03 + c * 0.06, 0.6);
      tableGroup.add(chip);
    }

    // 6. Flying Card for Dealing Animation
    const dealCardMesh = new THREE.Mesh(cardGeo, [
      new THREE.MeshStandardMaterial({ color: 0xffffff }),
      new THREE.MeshStandardMaterial({ color: 0xffffff }),
      new THREE.MeshStandardMaterial({ map: cardBackTex }),
      new THREE.MeshStandardMaterial({ map: cardBackTex }),
      new THREE.MeshStandardMaterial({ color: 0xffffff }),
      new THREE.MeshStandardMaterial({ color: 0xffffff }),
    ]);
    dealCardMesh.visible = false;
    scene.add(dealCardMesh);

    // Update center opening card texture when openingCard changes
    let lastRenderedCardId = '';
    let currentDynamicTex: THREE.CanvasTexture | null = null;

    // Card dealing flight physics
    let prevTotalCards = 0;
    let prevAndarCount = 0;
    let isCardFlicking = false;
    let flickStartTime = 0;
    const FLICK_DURATION = 180;
    const shoePos = new THREE.Vector3(2.6, 0.42, -0.45);
    const andarPos = new THREE.Vector3(-1.6, 0.12, 0.1);
    const baharPos = new THREE.Vector3(1.6, 0.12, 0.1);
    const startPos = shoePos.clone();
    const targetPos = andarPos.clone();

    // --- ANIMATION RAF LOOP ---
    let animationFrameId: number;
    let lastTime = performance.now();

    const animate = (currentTime: number) => {
      animationFrameId = requestAnimationFrame(animate);

      // Skip GPU computation if tab or app is backgrounded
      if (typeof document !== 'undefined' && document.hidden) return;

      const dt = Math.min((currentTime - lastTime) / 1000, 0.05);
      lastTime = currentTime;

      const { gameState, openingCard, andarCount, baharCount } = stateRef.current;

      // Update Center Opening Card
      if (openingCard && openingCard.id !== lastRenderedCardId) {
        lastRenderedCardId = openingCard.id;
        if (currentDynamicTex) currentDynamicTex.dispose();
        currentDynamicTex = createCardTexture(openingCard, false);
        cardMaterials[2].map = currentDynamicTex;
        cardMaterials[2].needsUpdate = true;
      } else if (!openingCard && lastRenderedCardId !== '') {
        lastRenderedCardId = '';
        if (currentDynamicTex) {
          currentDynamicTex.dispose();
          currentDynamicTex = null;
        }
        cardMaterials[2].map = jokerCardTex;
        cardMaterials[2].needsUpdate = true;
      }

      // 3D Card Flick Detection
      const currentTotal = andarCount + baharCount;
      if (currentTotal > prevTotalCards && gameState === 'dealing') {
        isCardFlicking = true;
        flickStartTime = currentTime;
        startPos.copy(shoePos);
        targetPos.copy(andarCount > prevAndarCount ? andarPos : baharPos);
        dealCardMesh.visible = true;
      }
      prevTotalCards = currentTotal;
      prevAndarCount = andarCount;

      if (isCardFlicking) {
        const elapsed = currentTime - flickStartTime;
        const progress = Math.min(elapsed / FLICK_DURATION, 1.0);
        const ease = 1 - Math.pow(1 - progress, 3);
        dealCardMesh.position.lerpVectors(startPos, targetPos, ease);
        dealCardMesh.position.y += Math.sin(progress * Math.PI) * 0.35;
        dealCardMesh.rotation.y = (1 - ease) * -0.6 + ease * 0.1;
        dealCardMesh.rotation.x = 0.2 * (1 - ease);

        if (progress >= 1.0) {
          isCardFlicking = false;
          dealCardMesh.visible = false;
        }
      } else if (gameState !== 'dealing') {
        dealCardMesh.visible = false;
        prevTotalCards = 0;
        prevAndarCount = 0;
      }

      // Gentle table breathing motion
      tableGroup.rotation.y = Math.sin(currentTime * 0.0004) * 0.03;

      renderer.render(scene, camera);
    };

    animationFrameId = requestAnimationFrame(animate);

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

    return () => {
      cancelAnimationFrame(animationFrameId);
      window.removeEventListener('resize', handleResize);
      renderer.dispose();
      tableFeltTexture.dispose();
      jokerCardTex.dispose();
      cardBackTex.dispose();
      if (currentDynamicTex) currentDynamicTex.dispose();
      if (container.contains(renderer.domElement)) {
        container.removeChild(renderer.domElement);
      }
    };
  }, []);

  const latestAndar = andarCards.slice(-4);
  const latestBahar = baharCards.slice(-4);

  return (
    <div className="relative w-full h-full overflow-hidden select-none">
      {/* 3D WebGL Canvas */}
      <div ref={containerRef} className="relative z-10 w-full h-full pointer-events-none" />

      {/* Floating Hero Stats Button (Top Right) */}
      <button
        type="button"
        onClick={() => toggleStats(true)}
        className="absolute top-3 right-3 z-20 w-8 h-8 rounded-xl bg-black/60 backdrop-blur-md border border-[#d4af37]/50 flex items-center justify-center text-[#f5d27a] hover:bg-[#d4af37]/20 active:scale-95 transition-all shadow-lg"
        title="Open Probability Stats Sheet"
      >
        <BarChart3 className="w-4 h-4" />
      </button>

      {/* Center Opening Card (Joker) Label */}
      <div className="absolute bottom-2 inset-x-0 z-20 flex justify-center pointer-events-none">
        <div className="px-3 py-1 rounded-full bg-black/80 backdrop-blur-md border border-[#d4af37]/60 text-xs font-serif shadow-lg flex items-center gap-1.5">
          <span className="text-[#f5d27a] font-black text-[10px] tracking-wider uppercase">Opening:</span>
          {openingCard ? (
            <span className={`font-black ${openingCard.color === 'red' ? 'text-red-400' : 'text-neutral-200'}`}>
              {openingCard.rank}{openingCard.suit}
            </span>
          ) : (
            <span className="text-[#f5d27a] font-bold text-[11px]">★ Joker in Stand ★</span>
          )}
        </div>
      </div>

      {/* Left Mat (Andar) Live Dealt Cards Stack */}
      {andarCards.length > 0 && (
        <div className="absolute left-3 top-12 z-20 flex flex-col items-center pointer-events-none space-y-1">
          <div className="px-2 py-0.5 rounded-full bg-red-950/80 border border-red-500/40 text-[9px] font-black text-red-300 uppercase tracking-wider shadow">
            Andar ({andarCards.length})
          </div>
          <div className="flex flex-col -space-y-4">
            {latestAndar.map((c, i) => {
              const isMatch =
                roundResult &&
                gameState === 'round_settled' &&
                roundResult.winningSide === 'ANDAR' &&
                i === latestAndar.length - 1;

              return (
                <div
                  key={`andar-${c.id}-${i}`}
                  className={`w-9 h-12 rounded-lg bg-white shadow-md border flex flex-col justify-between p-1 transition-all ${
                    isMatch
                      ? 'ring-2 ring-yellow-400 scale-110 shadow-[0_0_15px_rgba(250,204,21,0.8)]'
                      : 'border-neutral-300'
                  }`}
                >
                  <span
                    className={`text-[10px] font-black leading-none ${
                      c.color === 'red' ? 'text-red-600' : 'text-black'
                    }`}
                  >
                    {c.rank}
                  </span>
                  <span
                    className={`text-xs self-center leading-none ${
                      c.color === 'red' ? 'text-red-600' : 'text-black'
                    }`}
                  >
                    {c.suit}
                  </span>
                </div>
              );
            })}
          </div>
        </div>
      )}

      {/* Right Mat (Bahar) Live Dealt Cards Stack */}
      {baharCards.length > 0 && (
        <div className="absolute right-3 top-12 z-20 flex flex-col items-center pointer-events-none space-y-1">
          <div className="px-2 py-0.5 rounded-full bg-amber-950/80 border border-amber-500/40 text-[9px] font-black text-[#f5d27a] uppercase tracking-wider shadow">
            Bahar ({baharCards.length})
          </div>
          <div className="flex flex-col -space-y-4">
            {latestBahar.map((c, i) => {
              const isMatch =
                roundResult &&
                gameState === 'round_settled' &&
                roundResult.winningSide === 'BAHAR' &&
                i === latestBahar.length - 1;

              return (
                <div
                  key={`bahar-${c.id}-${i}`}
                  className={`w-9 h-12 rounded-lg bg-white shadow-md border flex flex-col justify-between p-1 transition-all ${
                    isMatch
                      ? 'ring-2 ring-yellow-400 scale-110 shadow-[0_0_15px_rgba(250,204,21,0.8)]'
                      : 'border-neutral-300'
                  }`}
                >
                  <span
                    className={`text-[10px] font-black leading-none ${
                      c.color === 'red' ? 'text-red-600' : 'text-black'
                    }`}
                  >
                    {c.rank}
                  </span>
                  <span
                    className={`text-xs self-center leading-none ${
                      c.color === 'red' ? 'text-red-600' : 'text-black'
                    }`}
                  >
                    {c.suit}
                  </span>
                </div>
              );
            })}
          </div>
        </div>
      )}
    </div>
  );
}
