"use client";

import { useAuth } from "@/providers/auth-provider";
import { useOrder } from "@/hooks/useOrders";
import { formatMoney } from "@/lib/formatters";
import { ArrowLeft, CreditCard, MessageCircle, PackageCheck } from "lucide-react";
import Image from "next/image";
import Link from "next/link";
import { useParams, useRouter } from "next/navigation";
import { useEffect } from "react";

const statusLabels: Record<string, string> = {
  pending: "Aguardando pagamento",
  paid: "Pago",
  shipped: "Enviado",
  delivered: "Entregue",
  cancelled: "Cancelado",
};

const shippingLabels: Record<string, string> = {
  mercado_envios: "Correios (Sedex / PAC)",
  pickup: "Retirar na loja",
};

export default function OrderDetailsPage() {
  const params = useParams();
  const router = useRouter();
  const id = Number(params.id);
  const { isAuthenticated, isLoading: authLoading } = useAuth();
  const { order, isLoading } = useOrder(id);

  useEffect(() => {
    if (!authLoading && !isAuthenticated) {
      router.push("/login");
    }
  }, [authLoading, isAuthenticated, router]);

  if (authLoading || isLoading) {
    return <div className="mt-20 text-center">Carregando pedido...</div>;
  }

  if (!isAuthenticated || !order) {
    return <div className="mt-20 text-center">Pedido não encontrado.</div>;
  }

  const status = statusLabels[order.status] ?? order.status;
  const shipping = shippingLabels[order.shipping_method] ?? order.shipping_method;

  return (
    <div className="mx-auto flex w-full max-w-5xl flex-col gap-6">
      <Link href="/profile" className="inline-flex w-fit items-center gap-2 text-sm font-medium text-lunart-pink-300 hover:text-lunart-pink-200">
        <ArrowLeft className="h-4 w-4" />
        Voltar para Meus Pedidos
      </Link>

      <section className="glass rounded-lg p-6">
        <div className="flex flex-col gap-4 sm:flex-row sm:items-start sm:justify-between">
          <div>
            <div className="mb-2 flex items-center gap-2 text-lunart-pink-300">
              <PackageCheck className="h-5 w-5" />
              <span className="text-sm font-bold uppercase tracking-[0.14em]">Detalhes do pedido</span>
            </div>
            <h1 className="font-display text-3xl font-bold">Pedido #{order.id}</h1>
            <p className="mt-2 text-sm text-lunart-white/55">
              Criado em {new Date(order.created_at).toLocaleString("pt-BR")}
            </p>
          </div>
          <span className="w-fit rounded-full bg-lunart-white/10 px-4 py-2 text-xs font-bold uppercase text-lunart-pink-300">
            {status}
          </span>
        </div>
      </section>

      <div className="grid gap-6 lg:grid-cols-[1fr_340px]">
        <section className="glass rounded-lg p-6">
          <h2 className="mb-5 text-xl font-bold">Itens comprados</h2>
          <div className="flex flex-col gap-4">
            {order.items.map((item) => (
              <div key={item.id} className="flex gap-4 rounded-lg border border-lunart-white/10 bg-lunart-surface-light p-4">
                <div className="relative h-20 w-20 shrink-0 overflow-hidden rounded-lg bg-lunart-bg">
                  <Image
                    src={item.product_image_url || "/Lunart-Header.jpg"}
                    alt={item.product_name}
                    fill
                    className="object-cover"
                  />
                </div>
                <div className="min-w-0 flex-1">
                  <h3 className="font-semibold">{item.product_name}</h3>
                  {item.variation && (
                    <p className="text-sm text-lunart-pink-300">Variação: {item.variation}</p>
                  )}
                  <p className="mt-2 text-sm text-lunart-white/60">
                    {item.quantity} unidade(s) x {formatMoney(item.unit_price)}
                  </p>
                </div>
                <div className="text-right text-sm font-bold text-lunart-white">
                  {formatMoney(Number(item.unit_price) * item.quantity)}
                </div>
              </div>
            ))}
          </div>
        </section>

        <aside className="flex flex-col gap-6">
          <section className="glass rounded-lg p-6">
            <h2 className="mb-4 text-xl font-bold">Resumo</h2>
            <div className="space-y-3 text-sm">
              <div className="flex justify-between text-lunart-white/75">
                <span>Subtotal</span>
                <span>{formatMoney(order.subtotal)}</span>
              </div>
              <div className="flex justify-between text-lunart-white/75">
                <span>Frete</span>
                <span>{formatMoney(order.shipping_cost)}</span>
              </div>
              {Number(order.discount) > 0 && (
                <div className="flex justify-between text-green-400">
                  <span>Desconto</span>
                  <span>- {formatMoney(order.discount)}</span>
                </div>
              )}
              <div className="border-t border-lunart-white/10 pt-3">
                <div className="flex items-center justify-between">
                  <span className="font-bold">Total</span>
                  <span className="text-2xl font-bold text-transparent bg-clip-text bg-hero-gradient">
                    {formatMoney(order.total)}
                  </span>
                </div>
              </div>
              <div className="border-t border-lunart-white/10 pt-3 text-lunart-white/60">
                Entrega: {shipping}
              </div>
            </div>

            {order.payment_link && order.status === "pending" && (
              <a
                href={order.payment_link}
                target="_blank"
                rel="noopener noreferrer"
                className="soft-button mt-5 w-full gap-2 bg-green-600 text-white hover:bg-green-500"
              >
                <CreditCard className="h-4 w-4" />
                Pagar agora
              </a>
            )}
          </section>

          <section className="glass rounded-lg p-6">
            <h2 className="mb-3 flex items-center gap-2 text-xl font-bold">
              <MessageCircle className="h-5 w-5 text-lunart-pink-300" />
              Suporte
            </h2>
            <p className="mb-4 text-sm leading-6 text-lunart-white/60">
              Abra o chat deste pedido para confirmar endereço, combinar detalhes e falar com a administração.
            </p>
            {order.support_request_id ? (
              <Link
                href={`/custom-requests/${order.support_request_id}`}
                className="soft-button w-full bg-lunart-purple-600 text-white hover:bg-lunart-purple-500"
              >
                Clique aqui para suporte
              </Link>
            ) : (
              <div className="rounded-lg border border-lunart-white/10 bg-lunart-white/5 p-3 text-sm text-lunart-white/60">
                Chat de suporte ainda não disponível para este pedido antigo.
              </div>
            )}
          </section>
        </aside>
      </div>
    </div>
  );
}
