"use client";

import Image from "next/image";
import Link from "next/link";
import { useProducts } from "@/hooks/useProducts";
import { useCart } from "@/hooks/useCart";
import { ArrowRight, PackageSearch, ShoppingCart, Star } from "lucide-react";
import { useEffect, useState } from "react";
import toast from "react-hot-toast";
import api, { getApiErrorMessage } from "@/lib/api";
import { triggerCartPulse, triggerConfetti } from "@/lib/confetti";
import { formatMoney } from "@/lib/formatters";
import { useReviews } from "@/hooks/useReviews";

export default function Home() {
  const { products, isLoading } = useProducts();
  const { reviews } = useReviews();
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
      try {
        triggerConfetti(e);
      } catch {
        // Visual feedback should never turn a successful cart action into an error.
      }
      triggerCartPulse();
      toast.success("Item adicionado");
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
      <section className="relative min-h-[360px] overflow-hidden rounded-lg border border-template-white/10 bg-template-surface animate-fade-in sm:min-h-[430px]">
        <Image
          src="/template-hero.jpg"
          alt="Imagem padrão do template"
          fill
          className="object-cover"
          priority
        />
        <div className="absolute inset-0 bg-gradient-to-r from-template-bg via-template-bg/70 to-template-bg/10" />
        <div className="relative z-10 flex min-h-[360px] max-w-2xl flex-col justify-center px-6 py-12 sm:min-h-[430px] sm:px-10">
          <h1 className="font-display text-4xl font-bold leading-tight text-template-white sm:text-6xl">
            Template Store
          </h1>
          <p className="mt-4 max-w-xl text-base leading-7 text-template-white/72 sm:text-lg">
            Um template pronto para adaptar produtos, identidade visual, checkout e atendimento à sua próxima loja.
          </p>
          <div className="mt-8 flex flex-wrap gap-3">
            <Link href="#produtos" className="soft-button bg-template-white text-template-bg hover:bg-template-pink-300">
              Ver produtos
              <ArrowRight className="ml-2 h-4 w-4" />
            </Link>
            <Link href="/custom-requests" className="soft-button border border-template-white/15 bg-template-white/10 text-template-white hover:bg-template-white/15">
              Solicitar orçamento
            </Link>
          </div>
        </div>
      </section>

      {notice && (
        <section className="rounded-lg border border-template-pink-300/35 bg-template-pink-500/15 px-5 py-4 text-center shadow-lg animate-fade-in">
          <p className="text-sm font-bold uppercase tracking-[0.14em] text-template-pink-300">
            {notice}
          </p>
        </section>
      )}

      <section id="produtos" className="scroll-mt-24">
        <div className="mb-8 flex flex-col justify-between gap-4 sm:flex-row sm:items-end">
          <div>
            <p className="text-sm font-bold uppercase tracking-[0.18em] text-template-pink-300">
              Loja
            </p>
            <h2 className="mt-2 font-display text-3xl font-semibold">
              Produtos em destaque
            </h2>
          </div>
          <p className="max-w-xl text-sm leading-6 text-template-white/60">
            Substitua estes itens pelos produtos reais da sua marca e use o fluxo de compra como base inicial.
          </p>
        </div>

        {isLoading ? (
          <div className="flex justify-center py-20">
            <div className="w-12 h-12 rounded-full border-4 border-template-purple-500 border-t-transparent animate-spin"></div>
          </div>
        ) : products?.length === 0 ? (
          <div className="glass flex flex-col items-center rounded-lg px-6 py-16 text-center">
            <PackageSearch className="mb-4 h-10 w-10 text-template-pink-300" />
            <h3 className="text-xl font-bold">Nenhum produto disponível agora</h3>
            <p className="mt-2 max-w-md text-template-white/60">
              A vitrine está vazia. Cadastre produtos no painel administrativo ou use o fluxo de solicitação personalizada.
            </p>
            <Link href="/custom-requests" className="soft-button mt-6 bg-template-purple-600 text-white hover:bg-template-purple-500">
              Fazer encomenda
            </Link>
          </div>
        ) : (
          <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-6">
            {products?.map((product) => (
              <article
                key={product.id}
                className="group glass overflow-hidden rounded-lg transition-all hover:-translate-y-1 hover:border-template-pink-300/45"
              >
                <Link href={`/products/${product.id}`} className="block">
                  <div className="aspect-square relative overflow-hidden bg-template-surface-light">
                    <Image
                      src={product.image_urls?.[0] || product.image_url || "/template-hero.jpg"}
                      alt={product.name}
                      fill
                      className="object-cover transition-transform duration-500 group-hover:scale-105"
                    />
                    {product.stock <= 0 && (
                      <span className="absolute left-3 top-3 rounded-full bg-template-bg/85 px-3 py-1 text-xs font-bold uppercase tracking-wide text-template-white">
                        Esgotado
                      </span>
                    )}
                  </div>
                </Link>
                <div className="flex min-h-36 flex-col p-4">
                  <Link href={`/products/${product.id}`} className="block">
                    <h3 className="line-clamp-2 text-base font-semibold leading-6 transition-colors group-hover:text-template-pink-300">
                      {product.name}
                    </h3>
                  </Link>
                  <div className="flex items-center justify-between mt-4">
                    <span className="text-xl font-bold text-template-pink-300">
                      {formatMoney(product.price)}
                    </span>
                    <button 
                      onClick={(e) =>
                        handleAddToCart(e, product.id, product.variations?.[0])
                      }
                      disabled={addingId === product.id || product.stock <= 0}
                      className="rounded-lg bg-template-white/10 p-2 transition-colors hover:bg-template-purple-600 disabled:opacity-50"
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

      <section className="scroll-mt-24">
        <div className="mb-8 flex flex-col justify-between gap-4 sm:flex-row sm:items-end">
          <div>
            <p className="text-sm font-bold uppercase tracking-[0.18em] text-template-pink-300">
              Avaliações
            </p>
            <h2 className="mt-2 font-display text-3xl font-semibold">
              O que clientes estão dizendo
            </h2>
          </div>
          <p className="max-w-xl text-sm leading-6 text-template-white/60">
            Comentários de quem confirmou o recebimento do pedido.
          </p>
        </div>

        {reviews?.length ? (
          <div className="grid gap-4 md:grid-cols-3">
            {reviews.map((review) => (
              <article key={review.id} className="glass rounded-lg p-5">
                <div className="mb-4 flex items-center gap-3">
                  <div className="flex h-11 w-11 items-center justify-center rounded-full bg-template-purple-600 font-bold text-white">
                    {review.user_icon}
                  </div>
                  <div>
                    <div className="font-semibold">@{review.username}</div>
                    <div className="flex gap-0.5 text-template-pink-300">
                      {Array.from({ length: 5 }, (_, index) => (
                        <Star
                          key={index}
                          className={`h-3.5 w-3.5 ${index < review.rating ? "fill-template-pink-300" : "opacity-35"}`}
                        />
                      ))}
                    </div>
                  </div>
                </div>
                <p className="text-sm text-template-white/60">{review.ordered_items}</p>
                <p className="mt-3 text-sm leading-6 text-template-white/80">{review.comment}</p>
                {review.image_url && (
                  <div className="relative mt-4 aspect-video overflow-hidden rounded-lg bg-template-surface-light">
                    <Image src={review.image_url} alt={`Foto da avaliação de ${review.username}`} fill className="object-cover" />
                  </div>
                )}
              </article>
            ))}
          </div>
        ) : (
          <div className="glass rounded-lg p-8 text-center text-template-white/60">
            As primeiras avaliações aparecerão aqui depois que os pedidos forem recebidos.
          </div>
        )}
      </section>
    </div>
  );
}
