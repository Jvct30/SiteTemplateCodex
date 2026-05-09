"use client";

import { useEffect, useState } from "react";

interface Star {
  id: number;
  x: number;
  y: number;
  size: number;
  duration: number;
  delay: number;
}

const stars: Star[] = Array.from({ length: 64 }, (_, i) => {
  const xSeed = Math.sin(i * 12.9898) * 43758.5453;
  const ySeed = Math.sin(i * 78.233) * 24634.6345;
  const sizeSeed = Math.sin(i * 39.425) * 9658.234;

  return {
    id: i,
    x: Math.abs(xSeed % 100),
    y: Math.abs(ySeed % 100),
    size: Math.abs(sizeSeed % 1.8) + 0.8,
    duration: Math.abs((xSeed + ySeed) % 3) + 2.5,
    delay: Math.abs(sizeSeed % 2.5),
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
            transform: `translate(${mousePos.x * (star.size / 3)}px, ${mousePos.y * (star.size / 3)}px)`,
        }}
      />
      ))}
    </div>
  );
}
