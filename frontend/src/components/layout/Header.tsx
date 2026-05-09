"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { useAuth } from "@/providers/auth-provider";
import { LogOut, Menu, ShoppingCart, User, X } from "lucide-react";
import { useCart } from "@/hooks/useCart";
import { useState } from "react";

const navItems = [
  { href: "/", label: "Produtos" },
  { href: "/custom-requests", label: "Sob encomenda" },
];

export function Header() {
  const { user, isAuthenticated, logout } = useAuth();
  const { cart } = useCart();
  const pathname = usePathname();
  const [isMenuOpen, setIsMenuOpen] = useState(false);

  const cartItemCount = cart?.items?.reduce((acc, item) => acc + item.quantity, 0) || 0;
  const closeMenu = () => setIsMenuOpen(false);
  const navLinkClass = (href: string) =>
    `rounded-full px-3 py-2 text-sm font-medium transition-colors ${
      pathname === href
        ? "bg-lunart-white/10 text-lunart-white"
        : "text-lunart-white/70 hover:bg-lunart-white/10 hover:text-lunart-white"
    }`;

  return (
    <header className="sticky top-0 z-50 w-full border-b border-lunart-white/10 bg-lunart-bg/85 backdrop-blur-xl">
      <div className="container mx-auto flex h-16 items-center justify-between px-4">
        <Link href="/" className="flex items-center gap-2" onClick={closeMenu}>
          <span className="text-2xl font-display font-bold text-transparent bg-clip-text bg-lunart-gradient">
            Lunart
          </span>
        </Link>

        <nav className="hidden items-center gap-1 md:flex">
          {navItems.map((item) => (
            <Link key={item.href} href={item.href} className={navLinkClass(item.href)}>
              {item.label}
            </Link>
          ))}
          {user?.role === "admin" && (
            <Link href="/admin" className={navLinkClass("/admin")}>
              Admin
            </Link>
          )}
        </nav>

        <div className="flex items-center gap-2">
          <Link
            href="/cart"
            className="relative rounded-full p-2 transition-colors hover:bg-lunart-white/10"
            aria-label="Abrir carrinho"
            onClick={closeMenu}
          >
            <ShoppingCart className="w-5 h-5" />
            {cartItemCount > 0 && (
              <span className="absolute -right-1 -top-1 flex h-5 min-w-5 items-center justify-center rounded-full bg-lunart-pink-500 px-1 text-xs font-bold">
                {cartItemCount}
              </span>
            )}
          </Link>
          
          {isAuthenticated ? (
            <div className="hidden items-center gap-1 sm:flex">
              <Link
                href="/profile"
                className="rounded-full p-2 transition-colors hover:bg-lunart-white/10"
                aria-label="Abrir perfil"
              >
                <User className="w-5 h-5" />
              </Link>
              <button
                onClick={logout}
                className="rounded-full p-2 text-red-300 transition-colors hover:bg-red-500/15"
                aria-label="Sair da conta"
              >
                <LogOut className="w-5 h-5" />
              </button>
            </div>
          ) : (
            <Link
              href="/login"
              className="hidden rounded-full bg-lunart-white px-4 py-2 text-sm font-bold text-lunart-bg transition-colors hover:bg-lunart-pink-300 sm:inline-flex"
              onClick={closeMenu}
            >
              Entrar
            </Link>
          )}

          <button
            onClick={() => setIsMenuOpen((value) => !value)}
            className="rounded-full p-2 transition-colors hover:bg-lunart-white/10 md:hidden"
            aria-label={isMenuOpen ? "Fechar menu" : "Abrir menu"}
            aria-expanded={isMenuOpen}
          >
            {isMenuOpen ? <X className="h-5 w-5" /> : <Menu className="h-5 w-5" />}
          </button>
        </div>
      </div>

      {isMenuOpen && (
        <div className="border-t border-lunart-white/10 bg-lunart-bg/95 px-4 py-4 backdrop-blur-xl md:hidden">
          <nav className="container mx-auto flex flex-col gap-2">
            {navItems.map((item) => (
              <Link
                key={item.href}
                href={item.href}
                className={navLinkClass(item.href)}
                onClick={closeMenu}
              >
                {item.label}
              </Link>
            ))}
            {user?.role === "admin" && (
              <Link href="/admin" className={navLinkClass("/admin")} onClick={closeMenu}>
                Admin
              </Link>
            )}
            {isAuthenticated ? (
              <>
                <Link href="/profile" className={navLinkClass("/profile")} onClick={closeMenu}>
                  Perfil
                </Link>
                <button
                  onClick={() => {
                    logout();
                    closeMenu();
                  }}
                  className="rounded-full px-3 py-2 text-left text-sm font-medium text-red-300 transition-colors hover:bg-red-500/15"
                >
                  Sair
                </button>
              </>
            ) : (
              <Link href="/login" className={navLinkClass("/login")} onClick={closeMenu}>
                Entrar
              </Link>
            )}
          </nav>
        </div>
      )}
    </header>
  );
}
