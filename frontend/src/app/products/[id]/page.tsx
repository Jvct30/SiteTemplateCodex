"use client";

import { useProduct } from "@/hooks/useProducts";
import { useCart } from "@/hooks/useCart";
import Image from "next/image";
import { useParams } from "next/navigation";
import { useState } from "react";
import toast from "react-hot-toast";
import { triggerCartPulse, triggerStars } from "@/lib/confetti";
import { ArrowLeft, ShoppingCart, Star } from "lucide-react";
import { getApiErrorMessage } from "@/lib/api";
import Link from "next/link";
import { formatMoney } from "@/lib/formatters";

export default function ProductDetails() {
  const params = useParams();
  const id = Number(params.id);
  const { product, isLoading, error } = useProduct(id);
  const { addToCart } = useCart();
  const [adding, setAdding] = useState(false);
  const [selectedVariation, setSelectedVariation] = useState<string>("");

  if (isLoading) {
    return <div className="flex justify-center mt-20"><div className="w-12 h-12 rounded-full border-4 border-lunart-purple-500 border-t-transparent animate-spin"></div></div>;
  }

  if (error || !product) {
    return <div className="text-center mt-20 text-xl">Produto não encontrado.</div>;
  }

  const variations = product.variations ?? [];
  const activeVariation =
    selectedVariation && variations.includes(selectedVariation)
      ? selectedVariation
      : variations[0] ?? "";

  const handleAddToCart = async (e: React.MouseEvent) => {
    try {
      setAdding(true);
      await addToCart({ 
        productId: product.id, 
        quantity: 1, 
        variation: activeVariation || undefined 
      });
      try {
        triggerStars(e);
      } catch {
        // Visual feedback should never turn a successful cart action into an error.
      }
      triggerCartPulse();
      toast.success("Item adicionado");
    } catch (error) {
      toast.error(getApiErrorMessage(error, "Faça login para adicionar ao carrinho."));
    } finally {
      setAdding(false);
    }
  };

  return (
    <div className="max-w-5xl mx-auto w-full mt-8">
      <Link href="/" className="mb-5 inline-flex items-center gap-2 text-sm font-medium text-lunart-white/65 transition-colors hover:text-lunart-pink-300">
        <ArrowLeft className="h-4 w-4" />
        Voltar para a loja
      </Link>

      <div className="grid grid-cols-1 gap-10 rounded-lg glass p-5 animate-slide-up md:grid-cols-2 md:p-8">
        <div className="relative aspect-square overflow-hidden rounded-lg border border-lunart-white/10 bg-lunart-surface-light">
          <Image
            src={product.image_url || "/Lunart-Header.jpg"}
            alt={product.name}
            fill
            className="object-cover"
          />
        </div>

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

          {variations.length > 0 && (
            <div className="mb-8">
              <span className="text-sm text-lunart-white/60 block mb-3">Escolha a Variação</span>
              <div className="flex flex-wrap gap-3">
                {variations.map((v) => (
                  <button
                    key={v}
                    onClick={() => setSelectedVariation(v)}
                    className={`rounded-lg border px-4 py-2 text-sm font-semibold transition-all ${
                      activeVariation === v 
                        ? "border-lunart-purple-400 bg-lunart-purple-600 text-white" 
                        : "bg-lunart-surface-light border-lunart-purple-500/20 text-lunart-white/70 hover:border-lunart-purple-400"
                    }`}
                  >
                    {v}
                  </button>
                ))}
              </div>
            </div>
          )}

          <div className="mt-auto">
            <div className="mb-6">
              <span className="text-sm text-lunart-white/60 block mb-1">Preço Final</span>
              <span className="text-5xl font-bold text-transparent bg-clip-text bg-hero-gradient">
                {formatMoney(product.price)}
              </span>
            </div>

            <div className="flex items-center gap-4">
              <button 
                onClick={handleAddToCart}
                disabled={adding || product.stock <= 0}
                className="soft-button flex-1 gap-2 bg-lunart-purple-600 py-4 text-lg text-white hover:bg-lunart-purple-500"
              >
                <ShoppingCart className="w-6 h-6" />
                {product.stock <= 0 ? "Esgotado" : adding ? "Adicionando..." : "Adicionar ao Carrinho"}
              </button>
            </div>
            <p className="text-center text-sm text-lunart-white/40 mt-4">
              Restam apenas {product.stock} unidades.
            </p>
          </div>
        </div>

      </div>
    </div>
  );
}
