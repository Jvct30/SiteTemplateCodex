"use client";

import { useEffect, useState } from "react";

interface Star {
  id: number;
  x: string;
  y: string;
  size: string;
  parallax: number;
  duration: string;
  delay: string;
}

const stars: Star[] = Array.from({ length: 64 }, (_, i) => {
  const xSeed = Math.sin(i * 12.9898) * 43758.5453;
  const ySeed = Math.sin(i * 78.233) * 24634.6345;
  const sizeSeed = Math.sin(i * 39.425) * 9658.234;
  const size = Math.abs(sizeSeed % 1.8) + 0.8;

  return {
    id: i,
    x: Math.abs(xSeed % 100).toFixed(4),
    y: Math.abs(ySeed % 100).toFixed(4),
    size: size.toFixed(4),
    parallax: size / 3,
    duration: (Math.abs((xSeed + ySeed) % 3) + 2.5).toFixed(4),
    delay: Math.abs(sizeSeed % 2.5).toFixed(4),
  };
});

export function StarField() {
  const [mousePos, setMousePos] = useState({ x: 0, y: 0 });

  useEffect(() => {
    const handleMouseMove = (e: MouseEvent) => {
      setMousePos({
        x: (e.clientX / window.innerWidth - 0.5) * 16,
        y: (e.clientY / window.innerHeight - 0.5) * 20,
      });
    };

    window.addEventListener("mousemove", handleMouseMove);
    return () => window.removeEventListener("mousemove", handleMouseMove);
  }, []);

  return (
    <div className="fixed inset-0 z-0 pointer-events-none overflow-hidden">
      {stars.map((star) => (
        <div
          key={star.id}
          className="absolute rounded-full bg-lunart-star animate-twinkle transition-transform duration-700 ease-out"
          style={{
            left: `${star.x}%`,
            top: `${star.y}%`,
            width: `${star.size}px`,
            height: `${star.size}px`,
            animationDuration: `${star.duration}s`,
            animationDelay: `${star.delay}s`,
            transform: `translate(${(mousePos.x * star.parallax).toFixed(4)}px, ${(mousePos.y * star.parallax).toFixed(4)}px)`,
          }}
        />
      ))}
    </div>
  );
}
