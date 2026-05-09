export function Footer() {
  return (
    <footer className="relative z-10 mt-auto w-full border-t border-lunart-white/10 bg-lunart-bg/80 py-8">
      <div className="mx-auto flex max-w-7xl flex-col gap-3 px-4 text-center sm:px-6 lg:px-8">
        <h2 className="font-display text-2xl font-bold text-transparent bg-clip-text bg-lunart-gradient">
          Lunart
        </h2>
        <p className="text-sm text-lunart-white/55">
          Peças autorais, presentes afetivos e encomendas feitas com cuidado.
        </p>
        <div className="text-xs text-lunart-white/35">
          &copy; {new Date().getFullYear()} Lunart E-commerce. Todos os direitos reservados.
        </div>
      </div>
    </footer>
  );
}
