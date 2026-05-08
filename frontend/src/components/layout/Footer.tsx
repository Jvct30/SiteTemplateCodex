export function Footer() {
  return (
    <footer className="w-full glass mt-auto py-8">
      <div className="container mx-auto px-4 text-center">
        <h2 className="text-2xl font-display font-bold text-transparent bg-clip-text bg-lunart-gradient mb-2">
          Lunart
        </h2>
        <p className="text-sm text-lunart-white/60 max-w-md mx-auto mb-6">
          Artesanato com alma de estrela. Transformando ideias em peças únicas que brilham no seu dia a dia.
        </p>
        <div className="text-xs text-lunart-white/40">
          &copy; {new Date().getFullYear()} Lunart E-commerce. Todos os direitos reservados.
        </div>
      </div>
    </footer>
  );
}
