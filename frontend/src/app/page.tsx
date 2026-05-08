"use client";

import Image from "next/image";
import Link from "next/link";
import { useProducts } from "@/hooks/useProducts";
import { useCart } from "@/hooks/useCart";
import { ShoppingCart } from "lucide-react";
import { useState } from "react";

export default function Home() {
  const { products, isLoading } = useProducts();
  const { addToCart } = useCart();
  const [addingId, setAddingId] = useState<number | null>(null);

  const handleAddToCart = async (e: React.MouseEvent, productId: number) => {
    e.preventDefault();
    try {
      setAddingId(productId);
      await addToCart({ productId, quantity: 1 });
    } catch (err) {
      console.error(err);
      alert("Erro ao adicionar ao carrinho ou precisa de login");
    } finally {
      setAddingId(null);
    }
  };

  return (
    <div className="flex flex-col gap-12">
      {/* Banner Section */}
      <section className="relative w-full h-[400px] rounded-2xl overflow-hidden glass animate-fade-in flex items-center justify-center text-center">
        <Image
          src="/Lunart-Header.jpg"
          alt="Lunart Artesanato"
          fill
          className="object-cover opacity-60 mix-blend-overlay"
          priority
        />
        <div className="relative z-10 px-4">
          <h1 className="text-5xl md:text-7xl font-display font-bold mb-4 drop-shadow-xl text-transparent bg-clip-text bg-lunart-gradient">
            Descubra o Infinito
          </h1>
          <p className="text-xl md:text-2xl text-lunart-white/90 drop-shadow-md">
            Artesanatos celestiais e exclusivos para a sua casa.
          </p>
        </div>
      </section>

      {/* Products Section */}
      <section>
        <h2 className="text-3xl font-display font-semibold mb-8 flex items-center gap-3">
          <span className="w-2 h-8 bg-lunart-purple-500 rounded-full inline-block"></span>
          Novidades Celestiais
        </h2>

        {isLoading ? (
          <div className="flex justify-center py-20">
            <div className="w-12 h-12 rounded-full border-4 border-lunart-purple-500 border-t-transparent animate-spin"></div>
          </div>
        ) : (
          <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-6">
            {products?.map((product) => (
              <Link 
                href={`/products/${product.id}`} 
                key={product.id}
                className="group glass rounded-2xl overflow-hidden hover:border-lunart-pink-400 transition-all hover:shadow-[0_0_20px_rgba(236,72,153,0.2)] animate-slide-up"
              >
                <div className="aspect-square relative overflow-hidden bg-lunart-surface-light">
                  {product.image_url ? (
                    <Image
                      src={product.image_url}
                      alt={product.name}
                      fill
                      className="object-cover group-hover:scale-105 transition-transform duration-500"
                    />
                  ) : (
                    <div className="w-full h-full flex items-center justify-center text-lunart-white/20">
                      Sem imagem
                    </div>
                  )}
                </div>
                <div className="p-4">
                  <h3 className="text-lg font-semibold truncate mb-1">{product.name}</h3>
                  <div className="flex items-center justify-between mt-4">
                    <span className="text-xl font-bold text-lunart-pink-300">
                      R$ {product.price.toFixed(2)}
                    </span>
                    <button 
                      onClick={(e) => handleAddToCart(e, product.id)}
                      disabled={addingId === product.id}
                      className="p-2 rounded-full bg-lunart-surface-light hover:bg-lunart-purple-600 transition-colors disabled:opacity-50"
                    >
                      <ShoppingCart className="w-5 h-5" />
                    </button>
                  </div>
                </div>
              </Link>
            ))}
          </div>
        )}
      </section>
    </div>
  );
}
