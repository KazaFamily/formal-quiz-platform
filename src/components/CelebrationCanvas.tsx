import { useEffect, useRef } from 'react';

interface Balloon {
  x: number;
  y: number;
  radiusX: number;
  radiusY: number;
  color: string;
  speedY: number;
  swaySpeed: number;
  swayAmplitute: number;
  swayOffset: number;
  stringLength: number;
}

interface Confetti {
  x: number;
  y: number;
  size: number;
  color: string;
  speedY: number;
  speedX: number;
  rotation: number;
  rotationSpeed: number;
  shape: 'circle' | 'square' | 'triangle';
}

const BALLOON_COLORS = [
  '#3B82F6', // Blue
  '#EF4444', // Red
  '#10B981', // Emerald
  '#F59E0B', // Amber
  '#8B5CF6', // Purple
  '#EC4899', // Pink
  '#06B6D4', // Cyan
];

const CONFETTI_COLORS = [
  '#FFD700', // Gold
  '#FF69B4', // Hot Pink
  '#00FFFF', // Cyan
  '#32CD32', // Lime Green
  '#FF4500', // Orange Red
  '#9370DB', // Medium Purple
];

export default function CelebrationCanvas() {
  const canvasRef = useRef<HTMLCanvasElement | null>(null);

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;

    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    let animationFrameId: number;
    let balloons: Balloon[] = [];
    let confettiList: Confetti[] = [];

    const resizeCanvas = () => {
      canvas.width = canvas.parentElement?.clientWidth || window.innerWidth;
      canvas.height = canvas.parentElement?.clientHeight || window.innerHeight;
    };

    resizeCanvas();
    window.addEventListener('resize', resizeCanvas);

    // Initialize Balloons
    const initBalloons = (count: number) => {
      balloons = [];
      for (let i = 0; i < count; i++) {
        // Space them across the bottom
        const x = Math.random() * canvas.width;
        const y = canvas.height + Math.random() * 300 + 100;
        const radiusX = 22 + Math.random() * 12;
        const radiusY = radiusX * 1.25;

        balloons.push({
          x,
          y,
          radiusX,
          radiusY,
          color: BALLOON_COLORS[Math.floor(Math.random() * BALLOON_COLORS.length)],
          speedY: 1.2 + Math.random() * 1.5,
          swaySpeed: 0.01 + Math.random() * 0.02,
          swayAmplitute: 15 + Math.random() * 20,
          swayOffset: Math.random() * Math.PI * 2,
          stringLength: 70 + Math.random() * 40,
        });
      }
    };

    // Initialize Confetti
    const initConfetti = (count: number) => {
      confettiList = [];
      for (let i = 0; i < count; i++) {
        confettiList.push({
          x: Math.random() * canvas.width,
          y: -50 - Math.random() * 200,
          size: 6 + Math.random() * 8,
          color: CONFETTI_COLORS[Math.floor(Math.random() * CONFETTI_COLORS.length)],
          speedY: 1.5 + Math.random() * 3,
          speedX: -1.5 + Math.random() * 3,
          rotation: Math.random() * 360,
          rotationSpeed: -2 + Math.random() * 4,
          shape: ['circle', 'square', 'triangle'][Math.floor(Math.random() * 3)] as 'circle' | 'square' | 'triangle',
        });
      }
    };

    // Initial setups
    initBalloons(15);
    initConfetti(80);

    const drawBalloon = (c: CanvasRenderingContext2D, b: Balloon, tick: number) => {
      c.save();

      // Horizontal sway using sine wave
      const currentX = b.x + Math.sin(tick * b.swaySpeed + b.swayOffset) * b.swayAmplitute;

      // Draw string with curve
      c.beginPath();
      c.moveTo(currentX, b.y + b.radiusY);
      c.bezierCurveTo(
        currentX - 10 * Math.sin(tick * 0.04), b.y + b.radiusY + 20,
        currentX + 10 * Math.sin(tick * 0.04), b.y + b.radiusY + 40,
        currentX, b.y + b.radiusY + b.stringLength
      );
      c.strokeStyle = 'rgba(255, 255, 255, 0.4)';
      c.lineWidth = 1.5;
      c.stroke();

      // Balloon body (oval)
      c.beginPath();
      c.ellipse(currentX, b.y, b.radiusX, b.radiusY, 0, 0, Math.PI * 2);
      c.fillStyle = b.color;
      c.fill();

      // Highlight/Shine (for premium depth)
      c.beginPath();
      c.ellipse(currentX - b.radiusX * 0.35, b.y - b.radiusY * 0.4, b.radiusX * 0.2, b.radiusY * 0.25, Math.PI / 4, 0, Math.PI * 2);
      c.fillStyle = 'rgba(255, 255, 255, 0.35)';
      c.fill();

      // Balloon knot (triangle at base)
      c.beginPath();
      c.moveTo(currentX, b.y + b.radiusY);
      c.lineTo(currentX - 6, b.y + b.radiusY + 8);
      c.lineTo(currentX + 6, b.y + b.radiusY + 8);
      c.closePath();
      c.fillStyle = b.color;
      c.fill();

      c.restore();
    };

    const drawConfetti = (c: CanvasRenderingContext2D, conf: Confetti) => {
      c.save();
      c.translate(conf.x, conf.y);
      c.rotate((conf.rotation * Math.PI) / 180);
      c.fillStyle = conf.color;

      if (conf.shape === 'square') {
        c.fillRect(-conf.size / 2, -conf.size / 2, conf.size, conf.size);
      } else if (conf.shape === 'circle') {
        c.beginPath();
        c.arc(0, 0, conf.size / 2, 0, Math.PI * 2);
        c.fill();
      } else {
        // Triangle
        c.beginPath();
        c.moveTo(0, -conf.size / 2);
        c.lineTo(conf.size / 2, conf.size / 2);
        c.lineTo(-conf.size / 2, conf.size / 2);
        c.closePath();
        c.fill();
      }

      c.restore();
    };

    let tick = 0;
    const animate = () => {
      tick++;
      ctx.clearRect(0, 0, canvas.width, canvas.height);

      // Render confettis
      for (let i = 0; i < confettiList.length; i++) {
        const conf = confettiList[i];
        conf.y += conf.speedY;
        conf.x += conf.speedX + Math.sin(tick * 0.02) * 0.2;
        conf.rotation += conf.rotationSpeed;

        // Reset if goes off limits of screen
        if (conf.y > canvas.height) {
          conf.y = -20;
          conf.x = Math.random() * canvas.width;
        }

        drawConfetti(ctx, conf);
      }

      // Render/update balloons
      let activeBalloons = 0;
      for (let i = 0; i < balloons.length; i++) {
        const b = balloons[i];
        b.y -= b.speedY;

        // Draw balloon
        drawBalloon(ctx, b, tick);

        // Keep counting active visible balloons
        if (b.y + b.radiusY + b.stringLength > -50) {
          activeBalloons++;
        }
      }

      // If all balloons exited the screen and a chunk of time has passed, re-trigger a small cluster to keep it charming
      if (activeBalloons === 0 && tick > 600) {
        initBalloons(5);
      }

      animationFrameId = requestAnimationFrame(animate);
    };

    animate();

    return () => {
      window.removeEventListener('resize', resizeCanvas);
      cancelAnimationFrame(animationFrameId);
    };
  }, []);

  return (
    <canvas
      id="celebration-canvas"
      ref={canvasRef}
      className="absolute inset-0 w-full h-full pointer-events-none z-10"
    />
  );
}
