"use client";

import Link from "next/link";
import { useAuth } from "@/providers/auth-provider";
import { ShoppingCart, User, LogOut } from "lucide-react";
import { useCart } from "@/hooks/useCart";

export function Header() {
  const { user, isAuthenticated, logout } = useAuth();
  const { cart } = useCart();

  const cartItemCount = cart?.items?.reduce((acc, item) => acc + item.quantity, 0) || 0;

  return (
    <header className="sticky top-0 z-50 w-full glass">
      <div className="container mx-auto px-4 h-16 flex items-center justify-between">
        <Link href="/" className="flex items-center gap-2">
          <span className="text-2xl font-display font-bold text-transparent bg-clip-text bg-lunart-gradient">
            Lunart
          </span>
        </Link>

        <nav className="hidden md:flex gap-6 items-center">
          <Link href="/" className="hover:text-lunart-pink-400 transition-colors">Produtos</Link>
          <Link href="/custom-requests" className="hover:text-lunart-pink-400 transition-colors">Sob Encomenda</Link>
          {user?.role === "admin" && (
            <Link href="/admin" className="text-lunart-star hover:text-lunart-moon transition-colors">Painel Admin</Link>
          )}
        </nav>

        <div className="flex items-center gap-4">
          <Link href="/cart" className="relative p-2 hover:bg-lunart-surface-light rounded-full transition-colors">
            <ShoppingCart className="w-5 h-5" />
            {cartItemCount > 0 && (
              <span className="absolute top-0 right-0 bg-lunart-pink-500 text-xs w-4 h-4 flex items-center justify-center rounded-full">
                {cartItemCount}
              </span>
            )}
          </Link>
          
          {isAuthenticated ? (
            <div className="flex items-center gap-2">
              <Link href="/profile" className="p-2 hover:bg-lunart-surface-light rounded-full transition-colors">
                <User className="w-5 h-5" />
              </Link>
              <button onClick={logout} className="p-2 hover:bg-lunart-surface-light rounded-full text-red-400 transition-colors">
                <LogOut className="w-5 h-5" />
              </button>
            </div>
          ) : (
            <Link href="/login" className="bg-lunart-purple-600 hover:bg-lunart-purple-500 px-4 py-2 rounded-full font-medium transition-colors">
              Entrar
            </Link>
          )}
        </div>
      </div>
    </header>
  );
}
