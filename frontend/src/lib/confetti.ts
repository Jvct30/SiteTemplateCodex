import confetti from "canvas-confetti";

export const triggerConfetti = (e: React.MouseEvent | null) => {
  let origin = { x: 0.5, y: 0.5 };
  
  if (e) {
    const rect = (e.currentTarget as HTMLElement).getBoundingClientRect();
    origin = {
      x: (rect.left + rect.width / 2) / window.innerWidth,
      y: (rect.top + rect.height / 2) / window.innerHeight,
    };
  }

  confetti({
    particleCount: 50,
    spread: 60,
    origin,
    colors: ["#38bdf8", "#818cf8", "#f472b6"],
    scalar: 1,
    ticks: 60,
    zIndex: 9999
  });
};

export const triggerCartPulse = () => {
  if (typeof window !== "undefined") {
    window.dispatchEvent(new Event("template:cart-pulse"));
  }
};
