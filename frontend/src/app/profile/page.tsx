"use client";

import { useAuth } from "@/providers/auth-provider";
import { useOrders } from "@/hooks/useOrders";
import { useRouter } from "next/navigation";
import { Package } from "lucide-react";
import { useEffect } from "react";

export default function ProfilePage() {
  const { user, isAuthenticated, isLoading: authLoading } = useAuth();
  const { orders, isLoading: ordersLoading } = useOrders();
  const router = useRouter();

  useEffect(() => {
    if (!authLoading && !isAuthenticated) {
      router.push("/login");
    }
  }, [authLoading, isAuthenticated, router]);

  if (authLoading) return null;
  if (!isAuthenticated || !user) {
    return null;
  }

  return (
    <div className="max-w-5xl mx-auto w-full grid grid-cols-1 md:grid-cols-3 gap-8">
      
      {/* Sidebar: User Info */}
      <div className="glass h-fit rounded-lg p-6">
        <div className="w-24 h-24 bg-lunart-gradient rounded-full mx-auto mb-4 flex items-center justify-center text-3xl font-bold">
          {user.full_name.charAt(0)}
        </div>
        <h2 className="text-2xl font-bold text-center mb-1">{user.full_name}</h2>
        <p className="text-center text-lunart-white/60 mb-6">@{user.username}</p>

        <div className="space-y-4 text-sm">
          <div>
            <span className="block text-lunart-white/40">Endereço</span>
            <p>{user.address_street}, {user.address_number}</p>
            <p>{user.address_neighborhood} - {user.address_city}/{user.address_state}</p>
            <p>CEP: {user.address_zip}</p>
          </div>
          <div>
            <span className="block text-lunart-white/40">Membro desde</span>
            <p>{new Date(user.created_at).toLocaleDateString('pt-BR')}</p>
          </div>
        </div>
      </div>

      {/* Main Content: Orders */}
      <div className="md:col-span-2">
        <h1 className="text-3xl font-display font-bold mb-6 flex items-center gap-3">
          <Package className="w-8 h-8 text-lunart-pink-400" />
          Meus Pedidos
        </h1>

        {ordersLoading ? (
          <div>Carregando...</div>
        ) : orders?.length === 0 ? (
          <div className="glass rounded-lg p-8 text-center">
            <p className="text-lunart-white/60">Você ainda não realizou nenhum pedido.</p>
          </div>
        ) : (
          <div className="space-y-6">
            {orders?.map(order => (
          <div key={order.id} className="glass rounded-lg p-6">
                <div className="flex flex-wrap justify-between items-center mb-4 pb-4 border-b border-lunart-white/10">
                  <div>
                    <div className="font-bold">Pedido #{order.id}</div>
                    <div className="text-xs text-lunart-white/40">{new Date(order.created_at).toLocaleString('pt-BR')}</div>
                  </div>
                  <div className="flex gap-4 items-center">
                    <span className="text-xl font-bold text-transparent bg-clip-text bg-hero-gradient">
                      R$ {Number(order.total).toFixed(2)}
                    </span>
                    <span className="rounded-full bg-lunart-surface-light px-3 py-1 text-xs font-bold uppercase">
                      {order.status}
                    </span>
                  </div>
                </div>

                <div className="space-y-3">
                  {order.items.map(item => (
                    <div key={item.id} className="flex justify-between items-center text-sm">
                      <div className="flex items-center gap-2">
                        <span className="w-6 h-6 bg-lunart-purple-600 rounded flex items-center justify-center text-xs">
                          {item.quantity}x
                        </span>
                        <span>Produto #{item.product_id} {item.variation && <span className="text-lunart-pink-400">({item.variation})</span>}</span>
                      </div>
                      <span className="text-lunart-white/60">R$ {Number(item.unit_price).toFixed(2)}</span>
                    </div>
                  ))}
                </div>

                {order.payment_link && order.status === "pending" && (
                  <div className="mt-6 pt-4 border-t border-lunart-white/10 text-right">
                    <a 
                      href={order.payment_link}
                      target="_blank"
                      rel="noopener noreferrer"
                          className="soft-button bg-green-600 px-6 py-2 text-white hover:bg-green-500"
                    >
                      Pagar Agora (Mercado Pago)
                    </a>
                  </div>
                )}
              </div>
            ))}
          </div>
        )}
      </div>

    </div>
  );
}
