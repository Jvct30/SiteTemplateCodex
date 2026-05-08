import confetti from "canvas-confetti";

export const triggerStars = (e: React.MouseEvent | null) => {
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
    colors: ['#fbbf24', '#fde68a', '#f59e0b'],
    shapes: ['star'],
    scalar: 1.2,
    ticks: 60,
    zIndex: 9999
  });
};
