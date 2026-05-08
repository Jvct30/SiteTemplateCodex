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

export function StarField() {
  const [stars, setStars] = useState<Star[]>([]);
  const [mousePos, setMousePos] = useState({ x: 0, y: 0 });

  useEffect(() => {
    const newStars = Array.from({ length: 50 }).map((_, i) => ({
      id: i,
      x: Math.random() * 100,
      y: Math.random() * 100,
      size: Math.random() * 2 + 1,
      duration: Math.random() * 3 + 2,
      delay: Math.random() * 2,
    }));
    setStars(newStars);

    const handleMouseMove = (e: MouseEvent) => {
      setMousePos({
        x: (e.clientX / window.innerWidth - 0.5) * 20, // max 20px translation
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
      <div 
        className="absolute top-20 right-20 w-32 h-32 rounded-full bg-lunart-moon/20 blur-3xl transition-transform duration-1000 ease-out" 
        style={{ transform: `translate(${mousePos.x * 2}px, ${mousePos.y * 2}px)` }}
      />
      <div 
        className="absolute bottom-20 left-10 w-48 h-48 rounded-full bg-lunart-purple-600/10 blur-3xl transition-transform duration-1000 ease-out" 
        style={{ transform: `translate(${mousePos.x * -1}px, ${mousePos.y * -1}px)` }}
      />
    </div>
  );
}
