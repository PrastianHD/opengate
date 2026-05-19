"use client";

import { useEffect, useRef } from "react";

export default function ParticleCanvas() {
  const canvasRef = useRef(null);
  const mouseRef = useRef({ x: -9999, y: -9999, active: false });

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext("2d");
    let animationId;
    let particles = [];

    const colors = ["#c1272d", "#e8a838", "#8b3a3f"];
    const MOUSE_RADIUS = 160;
    const REPEL_STRENGTH = 0.6;

    function resize() {
      canvas.width = window.innerWidth;
      canvas.height = window.innerHeight;
      const count = Math.min(80, Math.floor((canvas.width * canvas.height) / 22000));
      particles = Array.from({ length: count }, () => ({
        x: Math.random() * canvas.width,
        y: Math.random() * canvas.height,
        vx: (Math.random() - 0.5) * 0.3,
        vy: (Math.random() - 0.5) * 0.3,
        baseRadius: Math.random() * 1.6 + 0.5,
        radius: 0,
        color: colors[Math.floor(Math.random() * colors.length)],
        baseOpacity: Math.random() * 0.4 + 0.25,
        opacity: 0,
      }));
      particles.forEach((p) => {
        p.radius = p.baseRadius;
        p.opacity = p.baseOpacity;
      });
    }

    function handleMouseMove(e) {
      mouseRef.current.x = e.clientX;
      mouseRef.current.y = e.clientY;
      mouseRef.current.active = true;
    }

    function handleMouseLeave() {
      mouseRef.current.active = false;
      mouseRef.current.x = -9999;
      mouseRef.current.y = -9999;
    }

    function animate() {
      ctx.clearRect(0, 0, canvas.width, canvas.height);
      const mx = mouseRef.current.x;
      const my = mouseRef.current.y;
      const mouseActive = mouseRef.current.active;

      for (const p of particles) {
        p.x += p.vx;
        p.y += p.vy;

        if (mouseActive) {
          const dx = p.x - mx;
          const dy = p.y - my;
          const distSq = dx * dx + dy * dy;
          if (distSq < MOUSE_RADIUS * MOUSE_RADIUS && distSq > 0.1) {
            const dist = Math.sqrt(distSq);
            const force = (1 - dist / MOUSE_RADIUS) * REPEL_STRENGTH;
            p.vx += (dx / dist) * force;
            p.vy += (dy / dist) * force;
            p.radius = p.baseRadius * (1 + (1 - dist / MOUSE_RADIUS) * 1.5);
            p.opacity = Math.min(1, p.baseOpacity + (1 - dist / MOUSE_RADIUS) * 0.6);
          } else {
            p.radius += (p.baseRadius - p.radius) * 0.08;
            p.opacity += (p.baseOpacity - p.opacity) * 0.08;
          }
        } else {
          p.radius += (p.baseRadius - p.radius) * 0.08;
          p.opacity += (p.baseOpacity - p.opacity) * 0.08;
        }

        p.vx *= 0.96;
        p.vy *= 0.96;

        if (Math.abs(p.vx) < 0.05) p.vx += (Math.random() - 0.5) * 0.05;
        if (Math.abs(p.vy) < 0.05) p.vy += (Math.random() - 0.5) * 0.05;

        if (p.x < 0) p.x = canvas.width;
        if (p.x > canvas.width) p.x = 0;
        if (p.y < 0) p.y = canvas.height;
        if (p.y > canvas.height) p.y = 0;

        ctx.beginPath();
        ctx.arc(p.x, p.y, p.radius, 0, Math.PI * 2);
        ctx.fillStyle = p.color;
        ctx.globalAlpha = p.opacity;
        ctx.fill();
      }

      ctx.globalAlpha = 1;

      for (let i = 0; i < particles.length; i++) {
        for (let j = i + 1; j < particles.length; j++) {
          const a = particles[i];
          const b = particles[j];
          const dx = a.x - b.x;
          const dy = a.y - b.y;
          const distSq = dx * dx + dy * dy;
          if (distSq < 140 * 140) {
            const dist = Math.sqrt(distSq);
            let alpha = (1 - dist / 140) * 0.18;
            if (mouseActive) {
              const midX = (a.x + b.x) / 2;
              const midY = (a.y + b.y) / 2;
              const mdx = midX - mx;
              const mdy = midY - my;
              const mdist = Math.sqrt(mdx * mdx + mdy * mdy);
              if (mdist < MOUSE_RADIUS) {
                alpha += (1 - mdist / MOUSE_RADIUS) * 0.3;
              }
            }
            ctx.beginPath();
            ctx.moveTo(a.x, a.y);
            ctx.lineTo(b.x, b.y);
            ctx.strokeStyle = a.color;
            ctx.globalAlpha = alpha;
            ctx.lineWidth = 0.7;
            ctx.stroke();
          }
        }
      }

      ctx.globalAlpha = 1;
      animationId = requestAnimationFrame(animate);
    }

    resize();
    animate();
    window.addEventListener("resize", resize);
    window.addEventListener("mousemove", handleMouseMove);
    window.addEventListener("mouseleave", handleMouseLeave);

    return () => {
      cancelAnimationFrame(animationId);
      window.removeEventListener("resize", resize);
      window.removeEventListener("mousemove", handleMouseMove);
      window.removeEventListener("mouseleave", handleMouseLeave);
    };
  }, []);

  return <canvas ref={canvasRef} className="particle-canvas" aria-hidden="true" />;
}
