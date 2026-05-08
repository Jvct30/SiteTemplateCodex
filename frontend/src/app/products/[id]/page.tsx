"use client";

import { useProduct } from "@/hooks/useProducts";
import { useCart } from "@/hooks/useCart";
import Image from "next/image";
import { useParams } from "next/navigation";
import { useState, use } from "react";
import { ShoppingCart, Star } from "lucide-react";

export default function ProductDetails() {
  const params = useParams();
  const id = Number(params.id);
  const { product, isLoading, error } = useProduct(id);
  const { addToCart } = useCart();
  const [adding, setAdding] = useState(false);

  if (isLoading) {
    return <div className="flex justify-center mt-20"><div className="w-12 h-12 rounded-full border-4 border-lunart-purple-500 border-t-transparent animate-spin"></div></div>;
  }

  if (error || !product) {
    return <div className="text-center mt-20 text-xl">Produto não encontrado.</div>;
  }

  const handleAddToCart = async () => {
    try {
      setAdding(true);
      await addToCart({ productId: product.id, quantity: 1 });
      alert("Adicionado ao carrinho!");
    } catch (err) {
      alert("Faça login para adicionar ao carrinho.");
    } finally {
      setAdding(false);
    }
  };

  return (
    <div className="max-w-5xl mx-auto w-full mt-8">
      <div className="grid grid-cols-1 md:grid-cols-2 gap-12 glass p-8 rounded-3xl animate-slide-up">
        
        {/* Imagem */}
        <div className="relative aspect-square rounded-2xl overflow-hidden bg-lunart-surface-light border border-lunart-purple-500/20">
          <Image
            src={product.image_url || "/Lunart-Header.jpg"}
            alt={product.name}
            fill
            className="object-cover"
          />
        </div>

        {/* Detalhes */}
        <div className="flex flex-col">
          <div className="flex items-center gap-2 mb-2 text-lunart-star">
            <Star className="w-5 h-5 fill-lunart-star" />
            <Star className="w-5 h-5 fill-lunart-star" />
            <Star className="w-5 h-5 fill-lunart-star" />
            <Star className="w-5 h-5 fill-lunart-star" />
            <Star className="w-5 h-5 fill-lunart-star" />
          </div>
          
          <h1 className="text-4xl font-display font-bold mb-4">{product.name}</h1>
          <p className="text-lunart-white/80 text-lg mb-8 leading-relaxed">
            {product.description || "Esta é uma peça única, feita com muito amor e poeira estelar."}
          </p>

          <div className="mt-auto">
            <div className="mb-6">
              <span className="text-sm text-lunart-white/60 block mb-1">Preço Final</span>
              <span className="text-5xl font-bold text-transparent bg-clip-text bg-hero-gradient">
                R$ {Number(product.price).toFixed(2)}
              </span>
            </div>

            <div className="flex items-center gap-4">
              <button 
                onClick={handleAddToCart}
                disabled={adding || product.stock <= 0}
                className="flex-1 flex items-center justify-center gap-2 bg-lunart-purple-600 hover:bg-lunart-purple-500 py-4 rounded-xl font-bold text-lg transition-colors disabled:opacity-50"
              >
                <ShoppingCart className="w-6 h-6" />
                {product.stock <= 0 ? "Esgotado" : adding ? "Adicionando..." : "Adicionar ao Carrinho"}
              </button>
            </div>
            <p className="text-center text-sm text-lunart-white/40 mt-4">
              Restam apenas {product.stock} unidades desta constelação.
            </p>
          </div>
        </div>

      </div>
    </div>
  );
}
