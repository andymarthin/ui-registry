import { useEffect, useRef } from 'react';

export interface GlassSpheresCanvasProps {
  /** Optional additional classes for the canvas wrapper. */
  className?: string;
  /** Number of floating refractive spheres rendered on the canvas. */
  sphereCount?: number;
  /** Multiplier for specular and caustic glow intensity (0.5 - 1.5). */
  intensity?: number;
  /** Enable pointer parallax tracking. */
  interactive?: boolean;
}

interface SphereSpec {
  baseX: number;
  baseY: number;
  radiusRatio: number;
  depth: number;
  driftSpeedX: number;
  driftSpeedY: number;
  driftAmpX: number;
  driftAmpY: number;
  phase: number;
  tintPrimary: string;
  tintSecondary: string;
  causticColor: string;
  rimColor: string;
}

const DEFAULT_SPHERES: SphereSpec[] = [
  {
    baseX: 0.14,
    baseY: 0.18,
    radiusRatio: 0.145,
    depth: 1.0,
    driftSpeedX: 0.24,
    driftSpeedY: 0.19,
    driftAmpX: 22,
    driftAmpY: 18,
    phase: 0.4,
    tintPrimary: 'rgba(96, 165, 250, 0.34)',
    tintSecondary: 'rgba(56, 189, 248, 0.14)',
    causticColor: 'rgba(125, 211, 252, 0.36)',
    rimColor: 'rgba(191, 219, 254, 0.85)',
  },
  {
    baseX: 0.84,
    baseY: 0.24,
    radiusRatio: 0.175,
    depth: 0.85,
    driftSpeedX: 0.17,
    driftSpeedY: 0.22,
    driftAmpX: 26,
    driftAmpY: 20,
    phase: 1.9,
    tintPrimary: 'rgba(129, 140, 248, 0.32)',
    tintSecondary: 'rgba(192, 132, 252, 0.16)',
    causticColor: 'rgba(167, 139, 250, 0.32)',
    rimColor: 'rgba(224, 231, 255, 0.82)',
  },
  {
    baseX: 0.52,
    baseY: 0.12,
    radiusRatio: 0.068,
    depth: 0.45,
    driftSpeedX: 0.31,
    driftSpeedY: 0.26,
    driftAmpX: 16,
    driftAmpY: 14,
    phase: 3.1,
    tintPrimary: 'rgba(56, 189, 248, 0.28)',
    tintSecondary: 'rgba(96, 165, 250, 0.12)',
    causticColor: 'rgba(103, 232, 249, 0.3)',
    rimColor: 'rgba(186, 230, 253, 0.78)',
  },
  {
    baseX: 0.22,
    baseY: 0.62,
    radiusRatio: 0.095,
    depth: 0.62,
    driftSpeedX: 0.21,
    driftSpeedY: 0.25,
    driftAmpX: 18,
    driftAmpY: 22,
    phase: 4.2,
    tintPrimary: 'rgba(59, 130, 246, 0.28)',
    tintSecondary: 'rgba(147, 197, 253, 0.12)',
    causticColor: 'rgba(96, 165, 250, 0.32)',
    rimColor: 'rgba(219, 234, 254, 0.75)',
  },
  {
    baseX: 0.76,
    baseY: 0.68,
    radiusRatio: 0.128,
    depth: 0.92,
    driftSpeedX: 0.18,
    driftSpeedY: 0.15,
    driftAmpX: 24,
    driftAmpY: 16,
    phase: 5.3,
    tintPrimary: 'rgba(45, 212, 191, 0.24)',
    tintSecondary: 'rgba(96, 165, 250, 0.14)',
    causticColor: 'rgba(94, 234, 212, 0.28)',
    rimColor: 'rgba(204, 251, 241, 0.78)',
  },
  {
    baseX: 0.48,
    baseY: 0.86,
    radiusRatio: 0.082,
    depth: 0.38,
    driftSpeedX: 0.28,
    driftSpeedY: 0.2,
    driftAmpX: 14,
    driftAmpY: 14,
    phase: 2.5,
    tintPrimary: 'rgba(168, 85, 247, 0.24)',
    tintSecondary: 'rgba(96, 165, 250, 0.1)',
    causticColor: 'rgba(192, 132, 252, 0.28)',
    rimColor: 'rgba(233, 213, 255, 0.72)',
  },
  {
    baseX: 0.91,
    baseY: 0.52,
    radiusRatio: 0.055,
    depth: 0.32,
    driftSpeedX: 0.34,
    driftSpeedY: 0.29,
    driftAmpX: 12,
    driftAmpY: 16,
    phase: 0.9,
    tintPrimary: 'rgba(125, 211, 252, 0.26)',
    tintSecondary: 'rgba(59, 130, 246, 0.12)',
    causticColor: 'rgba(125, 211, 252, 0.28)',
    rimColor: 'rgba(224, 242, 254, 0.76)',
  },
];

function drawRefractiveSphere(
  ctx: CanvasRenderingContext2D,
  cx: number,
  cy: number,
  radius: number,
  spec: SphereSpec,
  intensity: number,
) {
  ctx.save();

  // Ambient caustic glow beneath the sphere
  const causticRadius = radius * 1.45;
  const causticGrad = ctx.createRadialGradient(
    cx + radius * 0.18,
    cy + radius * 0.42,
    radius * 0.1,
    cx + radius * 0.15,
    cy + radius * 0.38,
    causticRadius,
  );
  causticGrad.addColorStop(0, spec.causticColor);
  causticGrad.addColorStop(0.55, spec.tintSecondary);
  causticGrad.addColorStop(1, 'rgba(5, 6, 13, 0)');
  ctx.globalAlpha = 0.65 * intensity;
  ctx.fillStyle = causticGrad;
  ctx.beginPath();
  ctx.arc(
    cx + radius * 0.15,
    cy + radius * 0.38,
    causticRadius,
    0,
    Math.PI * 2,
  );
  ctx.fill();

  // Clip interior for glass refraction body
  ctx.globalAlpha = 1;
  ctx.beginPath();
  ctx.arc(cx, cy, radius, 0, Math.PI * 2);
  ctx.clip();

  // Dark cosmic glass core
  const coreGrad = ctx.createRadialGradient(
    cx - radius * 0.3,
    cy - radius * 0.32,
    radius * 0.08,
    cx + radius * 0.1,
    cy + radius * 0.15,
    radius * 1.12,
  );
  coreGrad.addColorStop(0, 'rgba(255, 255, 255, 0.14)');
  coreGrad.addColorStop(0.28, spec.tintSecondary);
  coreGrad.addColorStop(0.72, 'rgba(10, 15, 32, 0.76)');
  coreGrad.addColorStop(1, spec.tintPrimary);
  ctx.fillStyle = coreGrad;
  ctx.fillRect(cx - radius, cy - radius, radius * 2, radius * 2);

  // Internal caustic arc along lower-right hemisphere
  const internalCaustic = ctx.createRadialGradient(
    cx + radius * 0.32,
    cy + radius * 0.36,
    radius * 0.04,
    cx + radius * 0.25,
    cy + radius * 0.3,
    radius * 0.78,
  );
  internalCaustic.addColorStop(0, spec.causticColor);
  internalCaustic.addColorStop(0.5, spec.tintPrimary);
  internalCaustic.addColorStop(1, 'rgba(5, 6, 13, 0)');
  ctx.globalAlpha = 0.75 * intensity;
  ctx.fillStyle = internalCaustic;
  ctx.beginPath();
  ctx.arc(cx, cy, radius, 0, Math.PI * 2);
  ctx.fill();

  // Fresnel inner rim glow
  const fresnelGrad = ctx.createRadialGradient(
    cx,
    cy,
    radius * 0.66,
    cx,
    cy,
    radius,
  );
  fresnelGrad.addColorStop(0, 'rgba(255, 255, 255, 0)');
  fresnelGrad.addColorStop(0.76, spec.tintSecondary);
  fresnelGrad.addColorStop(0.95, spec.rimColor);
  fresnelGrad.addColorStop(1, 'rgba(255, 255, 255, 0.92)');
  ctx.globalAlpha = 0.42 * intensity;
  ctx.fillStyle = fresnelGrad;
  ctx.beginPath();
  ctx.arc(cx, cy, radius, 0, Math.PI * 2);
  ctx.fill();

  // Primary off-center specular highlight
  const specX = cx - radius * 0.36;
  const specY = cy - radius * 0.38;
  const specGrad = ctx.createRadialGradient(
    specX,
    specY,
    0,
    specX,
    specY,
    radius * 0.46,
  );
  specGrad.addColorStop(0, 'rgba(255, 255, 255, 0.94)');
  specGrad.addColorStop(0.22, 'rgba(224, 242, 254, 0.58)');
  specGrad.addColorStop(0.65, 'rgba(147, 197, 253, 0.14)');
  specGrad.addColorStop(1, 'rgba(255, 255, 255, 0)');
  ctx.globalAlpha = 0.9 * intensity;
  ctx.fillStyle = specGrad;
  ctx.beginPath();
  ctx.ellipse(
    specX,
    specY,
    radius * 0.38,
    radius * 0.24,
    -Math.PI / 5,
    0,
    Math.PI * 2,
  );
  ctx.fill();

  // Secondary crisp glint dot
  ctx.globalAlpha = 0.85 * intensity;
  ctx.fillStyle = 'rgba(255, 255, 255, 0.92)';
  ctx.beginPath();
  ctx.arc(
    cx - radius * 0.48,
    cy - radius * 0.22,
    Math.max(1.5, radius * 0.045),
    0,
    Math.PI * 2,
  );
  ctx.fill();

  // Subtle dark shadow crescent to accentuate volume
  ctx.globalAlpha = 0.38;
  ctx.strokeStyle = 'rgba(2, 4, 12, 0.8)';
  ctx.lineWidth = Math.max(1.5, radius * 0.06);
  ctx.beginPath();
  ctx.arc(cx, cy, radius * 0.97, 0.25, Math.PI * 0.85);
  ctx.stroke();

  ctx.restore();

  // Crisp outer fresnel hairline border
  ctx.save();
  const edgeGrad = ctx.createLinearGradient(
    cx - radius,
    cy - radius,
    cx + radius,
    cy + radius,
  );
  edgeGrad.addColorStop(0, 'rgba(255, 255, 255, 0.72)');
  edgeGrad.addColorStop(0.45, spec.rimColor);
  edgeGrad.addColorStop(1, 'rgba(96, 165, 250, 0.22)');
  ctx.globalAlpha = 0.68 * intensity;
  ctx.strokeStyle = edgeGrad;
  ctx.lineWidth = Math.max(1, radius * 0.018);
  ctx.beginPath();
  ctx.arc(cx, cy, radius - 0.5, 0, Math.PI * 2);
  ctx.stroke();
  ctx.restore();
}

export function GlassSpheresCanvas({
  className = '',
  sphereCount = 7,
  intensity = 1,
  interactive = true,
}: GlassSpheresCanvasProps) {
  const containerRef = useRef<HTMLDivElement | null>(null);
  const canvasRef = useRef<HTMLCanvasElement | null>(null);

  useEffect(() => {
    const container = containerRef.current;
    const canvas = canvasRef.current;
    if (!container || !canvas) return;

    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    const clampedIntensity = Math.min(1.5, Math.max(0.4, intensity));
    const spheres = DEFAULT_SPHERES.slice(
      0,
      Math.max(1, Math.min(DEFAULT_SPHERES.length, sphereCount)),
    );

    const motionQuery = window.matchMedia('(prefers-reduced-motion: reduce)');
    let prefersReducedMotion = motionQuery.matches;

    let width = container.clientWidth || window.innerWidth;
    let height = container.clientHeight || window.innerHeight;
    let dpr = Math.min(window.devicePixelRatio || 1, 2);

    const targetPointer = { x: 0, y: 0 };
    const currentPointer = { x: 0, y: 0 };

    const syncSize = () => {
      width = Math.max(1, container.clientWidth);
      height = Math.max(1, container.clientHeight);
      dpr = Math.min(window.devicePixelRatio || 1, 2);
      canvas.width = Math.round(width * dpr);
      canvas.height = Math.round(height * dpr);
      canvas.style.width = `${width}px`;
      canvas.style.height = `${height}px`;
    };

    const renderFrame = (elapsedSeconds: number) => {
      ctx.setTransform(dpr, 0, 0, dpr, 0, 0);

      // Cosmic midnight base
      ctx.fillStyle = '#05060D';
      ctx.fillRect(0, 0, width, height);

      // Soft deep-space atmospheric nebula pools
      const minDim = Math.min(width, height);
      const topGlow = ctx.createRadialGradient(
        width * 0.22,
        height * 0.14,
        0,
        width * 0.22,
        height * 0.14,
        Math.max(width, height) * 0.55,
      );
      topGlow.addColorStop(0, 'rgba(37, 99, 235, 0.16)');
      topGlow.addColorStop(0.5, 'rgba(30, 58, 138, 0.06)');
      topGlow.addColorStop(1, 'rgba(5, 6, 13, 0)');
      ctx.fillStyle = topGlow;
      ctx.fillRect(0, 0, width, height);

      const rightGlow = ctx.createRadialGradient(
        width * 0.82,
        height * 0.28,
        0,
        width * 0.82,
        height * 0.28,
        Math.max(width, height) * 0.52,
      );
      rightGlow.addColorStop(0, 'rgba(99, 102, 241, 0.14)');
      rightGlow.addColorStop(0.5, 'rgba(56, 189, 248, 0.05)');
      rightGlow.addColorStop(1, 'rgba(5, 6, 13, 0)');
      ctx.fillStyle = rightGlow;
      ctx.fillRect(0, 0, width, height);

      // Sort back-to-front by depth so foreground spheres overlap cleanly
      const sorted = spheres
        .slice()
        .sort((a, b) => a.depth - b.depth);

      for (const spec of sorted) {
        const motionFactor = prefersReducedMotion ? 0 : 1;
        const driftX =
          Math.sin(elapsedSeconds * spec.driftSpeedX + spec.phase) *
          spec.driftAmpX *
          motionFactor;
        const driftY =
          Math.cos(elapsedSeconds * spec.driftSpeedY + spec.phase * 1.3) *
          spec.driftAmpY *
          motionFactor;

        const parallaxX =
          currentPointer.x * spec.depth * 36 * (interactive ? motionFactor : 0);
        const parallaxY =
          currentPointer.y * spec.depth * 28 * (interactive ? motionFactor : 0);

        const cx = spec.baseX * width + driftX + parallaxX;
        const cy = spec.baseY * height + driftY + parallaxY;
        const radius = Math.max(22, Math.min(185, minDim * spec.radiusRatio));

        drawRefractiveSphere(ctx, cx, cy, radius, spec, clampedIntensity);
      }
    };

    syncSize();

    const resizeObserver = new ResizeObserver(() => {
      syncSize();
      if (prefersReducedMotion) {
        renderFrame(0);
      }
    });
    resizeObserver.observe(container);

    const handlePointerMove = (event: MouseEvent) => {
      if (!interactive || prefersReducedMotion) return;
      const rect = container.getBoundingClientRect();
      if (rect.width === 0 || rect.height === 0) return;
      const normX = ((event.clientX - rect.left) / rect.width - 0.5) * 2;
      const normY = ((event.clientY - rect.top) / rect.height - 0.5) * 2;
      targetPointer.x = Math.max(-1, Math.min(1, normX));
      targetPointer.y = Math.max(-1, Math.min(1, normY));
    };

    const handlePointerReset = () => {
      targetPointer.x = 0;
      targetPointer.y = 0;
    };

    if (interactive) {
      window.addEventListener('mousemove', handlePointerMove, { passive: true });
      window.addEventListener('mouseleave', handlePointerReset, {
        passive: true,
      });
    }

    let rafId = 0;
    let startTime = performance.now();

    const loop = (now: number) => {
      const elapsed = (now - startTime) / 1000;
      currentPointer.x += (targetPointer.x - currentPointer.x) * 0.06;
      currentPointer.y += (targetPointer.y - currentPointer.y) * 0.06;
      renderFrame(elapsed);
      rafId = window.requestAnimationFrame(loop);
    };

    const startOrRenderStatic = () => {
      window.cancelAnimationFrame(rafId);
      if (prefersReducedMotion) {
        currentPointer.x = 0;
        currentPointer.y = 0;
        renderFrame(0);
      } else {
        startTime = performance.now();
        rafId = window.requestAnimationFrame(loop);
      }
    };

    const handleMotionChange = (event: MediaQueryListEvent) => {
      prefersReducedMotion = event.matches;
      startOrRenderStatic();
    };

    motionQuery.addEventListener('change', handleMotionChange);
    startOrRenderStatic();

    return () => {
      window.cancelAnimationFrame(rafId);
      resizeObserver.disconnect();
      motionQuery.removeEventListener('change', handleMotionChange);
      if (interactive) {
        window.removeEventListener('mousemove', handlePointerMove);
        window.removeEventListener('mouseleave', handlePointerReset);
      }
    };
  }, [sphereCount, intensity, interactive]);

  return (
    <div
      ref={containerRef}
      aria-hidden="true"
      className={[
        'pointer-events-none absolute inset-0 overflow-hidden bg-[#05060D]',
        className,
      ]
        .filter(Boolean)
        .join(' ')}
    >
      <canvas ref={canvasRef} className="block h-full w-full" />
      <div
        className="absolute inset-0"
        style={{
          background:
            'radial-gradient(circle at 50% 0%, rgba(96, 165, 250, 0.08), transparent 55%), linear-gradient(180deg, rgba(5, 6, 13, 0.12) 0%, rgba(5, 6, 13, 0.55) 100%)',
        }}
      />
    </div>
  );
}
