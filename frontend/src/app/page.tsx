"use client";

import Image from "next/image";
import Link from "next/link";
import { useProducts } from "@/hooks/useProducts";
import { useCart } from "@/hooks/useCart";
import { ArrowRight, PackageSearch, ShoppingCart, Sparkles } from "lucide-react";
import { useEffect, useState } from "react";
import toast from "react-hot-toast";
import api, { getApiErrorMessage } from "@/lib/api";
import { triggerStars } from "@/lib/confetti";

export default function Home() {
  const { products, isLoading } = useProducts();
  const { addToCart } = useCart();
  const [addingId, setAddingId] = useState<number | null>(null);
  const [notice, setNotice] = useState<string | null>(null);

  useEffect(() => {
    const fetchNotice = async () => {
      try {
        const res = await api.get("/store/notice");
        if (res.data && res.data.is_active && res.data.message) {
          setNotice(res.data.message);
        }
      } catch {
        setNotice(null);
      }
    };
    fetchNotice();
  }, []);

  const handleAddToCart = async (
    e: React.MouseEvent,
    productId: number,
    variation?: string | null
  ) => {
    e.preventDefault();
    try {
      setAddingId(productId);
      await addToCart({ productId, quantity: 1, variation: variation || undefined });
      triggerStars(e);
      toast.success("Adicionado ao carrinho!");
    } catch (error) {
      toast.error(
        getApiErrorMessage(error, "Faça login para adicionar este produto ao carrinho.")
      );
    } finally {
      setAddingId(null);
    }
  };

  return (
    <div className="flex flex-col gap-12">
      <section className="relative min-h-[360px] overflow-hidden rounded-lg border border-lunart-white/10 bg-lunart-surface animate-fade-in sm:min-h-[430px]">
        <Image
          src="/Lunart-Header.jpg"
          alt="Lunart Artesanato"
          fill
          className="object-cover"
          priority
        />
        <div className="absolute inset-0 bg-gradient-to-r from-lunart-bg via-lunart-bg/70 to-lunart-bg/10" />
        <div className="relative z-10 flex min-h-[360px] max-w-2xl flex-col justify-center px-6 py-12 sm:min-h-[430px] sm:px-10">
          <span className="mb-4 inline-flex w-fit items-center gap-2 rounded-full border border-lunart-white/10 bg-lunart-white/10 px-3 py-1 text-xs font-bold uppercase tracking-[0.16em] text-lunart-pink-300">
            <Sparkles className="h-3.5 w-3.5" />
            Artesanato autoral
          </span>
          <h1 className="font-display text-4xl font-bold leading-tight text-lunart-white sm:text-6xl">
            Lunart
          </h1>
          <p className="mt-4 max-w-xl text-base leading-7 text-lunart-white/72 sm:text-lg">
            Peças feitas à mão para presentear, colecionar e transformar ideias em objetos com história.
          </p>
          <div className="mt-8 flex flex-wrap gap-3">
            <Link href="#produtos" className="soft-button bg-lunart-white text-lunart-bg hover:bg-lunart-pink-300">
              Ver produtos
              <ArrowRight className="ml-2 h-4 w-4" />
            </Link>
            <Link href="/custom-requests" className="soft-button border border-lunart-white/15 bg-lunart-white/10 text-lunart-white hover:bg-lunart-white/15">
              Encomendar peça
            </Link>
          </div>
        </div>
      </section>

      {notice && (
        <section className="rounded-lg border border-lunart-pink-300/35 bg-lunart-pink-500/15 px-5 py-4 text-center shadow-lg animate-fade-in">
          <p className="text-sm font-bold uppercase tracking-[0.14em] text-lunart-pink-300">
            {notice}
          </p>
        </section>
      )}

      <section id="produtos" className="scroll-mt-24">
        <div className="mb-8 flex flex-col justify-between gap-4 sm:flex-row sm:items-end">
          <div>
            <p className="text-sm font-bold uppercase tracking-[0.18em] text-lunart-pink-300">
              Loja
            </p>
            <h2 className="mt-2 font-display text-3xl font-semibold">
              Produtos em destaque
            </h2>
          </div>
          <p className="max-w-xl text-sm leading-6 text-lunart-white/60">
            Seleção atual de peças disponíveis para compra imediata. Para cores, tamanhos ou ideias específicas, use pedidos sob encomenda.
          </p>
        </div>

        {isLoading ? (
          <div className="flex justify-center py-20">
            <div className="w-12 h-12 rounded-full border-4 border-lunart-purple-500 border-t-transparent animate-spin"></div>
          </div>
        ) : products?.length === 0 ? (
          <div className="glass flex flex-col items-center rounded-lg px-6 py-16 text-center">
            <PackageSearch className="mb-4 h-10 w-10 text-lunart-pink-300" />
            <h3 className="text-xl font-bold">Nenhum produto disponível agora</h3>
            <p className="mt-2 max-w-md text-lunart-white/60">
              A vitrine está sendo atualizada. Enquanto isso, você pode solicitar uma peça personalizada.
            </p>
            <Link href="/custom-requests" className="soft-button mt-6 bg-lunart-purple-600 text-white hover:bg-lunart-purple-500">
              Fazer encomenda
            </Link>
          </div>
        ) : (
          <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-6">
            {products?.map((product) => (
              <article
                key={product.id}
                className="group glass overflow-hidden rounded-lg transition-all hover:-translate-y-1 hover:border-lunart-pink-300/45"
              >
                <Link href={`/products/${product.id}`} className="block">
                  <div className="aspect-square relative overflow-hidden bg-lunart-surface-light">
                    <Image
                      src={product.image_url || "/Lunart-Header.jpg"}
                      alt={product.name}
                      fill
                      className="object-cover transition-transform duration-500 group-hover:scale-105"
                    />
                    {product.stock <= 0 && (
                      <span className="absolute left-3 top-3 rounded-full bg-lunart-bg/85 px-3 py-1 text-xs font-bold uppercase tracking-wide text-lunart-white">
                        Esgotado
                      </span>
                    )}
                  </div>
                </Link>
                <div className="flex min-h-36 flex-col p-4">
                  <Link href={`/products/${product.id}`} className="block">
                    <h3 className="line-clamp-2 text-base font-semibold leading-6 transition-colors group-hover:text-lunart-pink-300">
                      {product.name}
                    </h3>
                  </Link>
                  <div className="flex items-center justify-between mt-4">
                    <span className="text-xl font-bold text-lunart-pink-300">
                      R$ {Number(product.price).toFixed(2)}
                    </span>
                    <button 
                      onClick={(e) =>
                        handleAddToCart(e, product.id, product.variations?.[0])
                      }
                      disabled={addingId === product.id || product.stock <= 0}
                      className="rounded-lg bg-lunart-white/10 p-2 transition-colors hover:bg-lunart-purple-600 disabled:opacity-50"
                      aria-label={`Adicionar ${product.name} ao carrinho`}
                    >
                      <ShoppingCart className="w-5 h-5" />
                    </button>
                  </div>
                </div>
              </article>
            ))}
          </div>
        )}
      </section>
    </div>
  );
}
