import React, { useEffect, useRef } from 'react';
import './SpaceBackground.css';

export const SpaceBackground: React.FC = () => {
  const canvasRef = useRef<HTMLCanvasElement | null>(null);

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    let animationFrameId: number;
    let width = (canvas.width = window.innerWidth);
    let height = (canvas.height = window.innerHeight);

    const handleResize = () => {
      if (!canvas) return;
      width = canvas.width = window.innerWidth;
      height = canvas.height = window.innerHeight;
    };
    window.addEventListener('resize', handleResize);

    // 生成恒星数据
    const starCount = Math.floor((width * height) / 3000);
    const stars: Array<{
      x: number;
      y: number;
      radius: number;
      color: string;
      alpha: number;
      speed: number;
      twinkleSpeed: number;
    }> = [];

    const colors = ['#ffffff', '#8be9fd', '#bd93f9', '#ff79c6', '#50fa7b', '#00d2ff'];

    for (let i = 0; i < starCount; i++) {
      stars.push({
        x: Math.random() * width,
        y: Math.random() * height,
        radius: Math.random() * 1.5 + 0.3,
        color: colors[Math.floor(Math.random() * colors.length)],
        alpha: Math.random(),
        speed: Math.random() * 0.01 + 0.003,
        twinkleSpeed: Math.random() * 0.03 + 0.01,
      });
    }

    // 生成流星 (Shooting Stars)
    interface ShootingStar {
      x: number;
      y: number;
      len: number;
      speed: number;
      size: number;
      waitTime: number;
      active: boolean;
    }

    const shootingStars: ShootingStar[] = Array.from({ length: 3 }, () => ({
      x: Math.random() * width,
      y: Math.random() * (height / 2),
      len: Math.random() * 80 + 100,
      speed: Math.random() * 10 + 12,
      size: Math.random() * 1.5 + 0.5,
      waitTime: Math.random() * 100 + 50,
      active: false,
    }));

    const render = () => {
      ctx.clearRect(0, 0, width, height);

      // 1. 绘制微弱星空 background gradient
      const bgGrad = ctx.createLinearGradient(0, 0, 0, height);
      bgGrad.addColorStop(0, '#050510');
      bgGrad.addColorStop(0.5, '#0b0817');
      bgGrad.addColorStop(1, '#04030a');
      ctx.fillStyle = bgGrad;
      ctx.fillRect(0, 0, width, height);

      // 2. 绘制闪烁星星
      stars.forEach(star => {
        star.alpha += star.twinkleSpeed;
        if (star.alpha > 1 || star.alpha < 0.1) {
          star.twinkleSpeed = -star.twinkleSpeed;
        }

        ctx.save();
        ctx.globalAlpha = Math.abs(Math.sin(star.alpha));
        ctx.fillStyle = star.color;
        ctx.beginPath();
        ctx.arc(star.x, star.y, star.radius, 0, Math.PI * 2);
        ctx.fill();

        // 为大星星加微弱晕光
        if (star.radius > 1.2) {
          ctx.shadowBlur = 8;
          ctx.shadowColor = star.color;
        }
        ctx.restore();
      });

      // 3. 绘制流星效果
      shootingStars.forEach(star => {
        if (!star.active) {
          star.waitTime--;
          if (star.waitTime <= 0) {
            star.active = true;
            star.x = Math.random() * (width * 0.8) + width * 0.1;
            star.y = Math.random() * (height * 0.4);
            star.len = Math.random() * 90 + 80;
            star.speed = Math.random() * 10 + 12;
            star.waitTime = Math.random() * 300 + 150;
          }
        } else {
          star.x -= star.speed;
          star.y += star.speed * 0.6;

          const tailX = star.x + star.len;
          const tailY = star.y - star.len * 0.6;

          const grad = ctx.createLinearGradient(star.x, star.y, tailX, tailY);
          grad.addColorStop(0, 'rgba(255, 255, 255, 0.9)');
          grad.addColorStop(0.3, 'rgba(0, 210, 255, 0.5)');
          grad.addColorStop(1, 'rgba(0, 210, 255, 0)');

          ctx.save();
          ctx.beginPath();
          ctx.moveTo(star.x, star.y);
          ctx.lineTo(tailX, tailY);
          ctx.strokeStyle = grad;
          ctx.lineWidth = star.size;
          ctx.lineCap = 'round';
          ctx.stroke();
          ctx.restore();

          if (star.x < -100 || star.y > height + 100) {
            star.active = false;
          }
        }
      });

      animationFrameId = requestAnimationFrame(render);
    };

    render();

    return () => {
      window.removeEventListener('resize', handleResize);
      cancelAnimationFrame(animationFrameId);
    };
  }, []);

  return (
    <div className="space-bg-container">
      <canvas ref={canvasRef} className="space-canvas" />
      {/* 4. 星云与暗物质雾气特效层 */}
      <div className="nebula-cloud nebula-1" />
      <div className="nebula-cloud nebula-2" />
      <div className="nebula-cloud nebula-3" />
      <div className="cosmic-grid" />
    </div>
  );
};
