"use client";

import { useAuth } from "@/providers/auth-provider";
import { useOrders } from "@/hooks/useOrders";
import { useRouter } from "next/navigation";
import { CheckCircle, MapPin, Package, Plus, Trash2 } from "lucide-react";
import { useEffect, useState } from "react";
import { formatMoney } from "@/lib/formatters";
import Link from "next/link";
import { formatDate, formatDateTime } from "@/lib/dates";
import { useAddresses } from "@/hooks/useAddresses";
import toast from "react-hot-toast";

export default function ProfilePage() {
  const { user, isAuthenticated, isLoading: authLoading } = useAuth();
  const { orders, isLoading: ordersLoading } = useOrders();
  const { addresses, createAddress, setDefaultAddress, deleteAddress } = useAddresses();
  const router = useRouter();
  const [isAddressFormOpen, setIsAddressFormOpen] = useState(false);
  const [addressForm, setAddressForm] = useState({
    label: "Principal",
    street: "",
    number: "",
    complement: "",
    neighborhood: "",
    city: "",
    state: "",
    zip_code: "",
  });

  useEffect(() => {
    if (!authLoading && !isAuthenticated) {
      router.push("/login");
    }
  }, [authLoading, isAuthenticated, router]);

  if (authLoading) return null;
  if (!isAuthenticated || !user) {
    return null;
  }

  const updateAddressForm = (field: keyof typeof addressForm, value: string) => {
    setAddressForm((current) => ({ ...current, [field]: value }));
  };

  const handleCreateAddress = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      await createAddress({
        ...addressForm,
        state: addressForm.state.toUpperCase(),
        complement: addressForm.complement || null,
        zip_code: addressForm.zip_code.replace(/\D/g, ""),
      });
      setAddressForm({
        label: "Principal",
        street: "",
        number: "",
        complement: "",
        neighborhood: "",
        city: "",
        state: "",
        zip_code: "",
      });
      setIsAddressFormOpen(false);
      toast.success("Endereço criado.");
    } catch {
      toast.error("Erro ao criar endereço.");
    }
  };

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
            <span className="block text-lunart-white/40">Email</span>
            <p>{user.email || "Não informado"}</p>
          </div>
          <div>
            <span className="block text-lunart-white/40">Membro desde</span>
            <p>{formatDate(user.created_at)}</p>
          </div>
        </div>

        <div className="mt-6 border-t border-lunart-white/10 pt-5">
          <button
            type="button"
            onClick={() => setIsAddressFormOpen((value) => !value)}
            className="soft-button w-full gap-2 bg-lunart-purple-600 text-white hover:bg-lunart-purple-500"
          >
            <Plus className="h-4 w-4" />
            Criar endereço
          </button>
        </div>
      </div>

      {/* Main Content: Orders */}
      <div className="md:col-span-2">
        <h1 className="text-3xl font-display font-bold mb-6 flex items-center gap-3">
          <Package className="w-8 h-8 text-lunart-pink-400" />
          Meus Pedidos
        </h1>

        <section className="glass mb-8 rounded-lg p-6">
          <div className="mb-5 flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
            <h2 className="flex items-center gap-2 text-xl font-bold">
              <MapPin className="h-5 w-5 text-lunart-pink-300" />
              Meus Endereços
            </h2>
            <button
              type="button"
              onClick={() => setIsAddressFormOpen((value) => !value)}
              className="soft-button gap-2 bg-lunart-surface-light text-lunart-white hover:bg-lunart-white/10"
            >
              <Plus className="h-4 w-4" />
              Criar endereço
            </button>
          </div>

          {isAddressFormOpen && (
            <form onSubmit={handleCreateAddress} className="mb-5 grid gap-3 rounded-lg border border-lunart-white/10 bg-lunart-surface-light p-4 sm:grid-cols-2">
              <input required value={addressForm.label} onChange={(e) => updateAddressForm("label", e.target.value)} className="form-field" placeholder="Nome do endereço" />
              <input required value={addressForm.zip_code} onChange={(e) => updateAddressForm("zip_code", e.target.value)} className="form-field" placeholder="CEP" inputMode="numeric" />
              <input required value={addressForm.street} onChange={(e) => updateAddressForm("street", e.target.value)} className="form-field sm:col-span-2" placeholder="Rua" />
              <input required value={addressForm.number} onChange={(e) => updateAddressForm("number", e.target.value)} className="form-field" placeholder="Número" />
              <input value={addressForm.complement} onChange={(e) => updateAddressForm("complement", e.target.value)} className="form-field" placeholder="Complemento" />
              <input required value={addressForm.neighborhood} onChange={(e) => updateAddressForm("neighborhood", e.target.value)} className="form-field" placeholder="Bairro" />
              <input required value={addressForm.city} onChange={(e) => updateAddressForm("city", e.target.value)} className="form-field" placeholder="Cidade" />
              <input required maxLength={2} value={addressForm.state} onChange={(e) => updateAddressForm("state", e.target.value.toUpperCase())} className="form-field uppercase" placeholder="UF" />
              <button type="submit" className="soft-button bg-lunart-pink-500 text-white hover:bg-lunart-pink-400">
                Salvar endereço
              </button>
            </form>
          )}

          {addresses?.length ? (
            <div className="grid gap-3">
              {addresses.map((address) => (
                <div key={address.id} className="rounded-lg border border-lunart-white/10 bg-lunart-surface-light p-4">
                  <div className="flex flex-col gap-3 sm:flex-row sm:items-start sm:justify-between">
                    <div>
                      <div className="flex items-center gap-2 font-semibold">
                        {address.label}
                        {address.is_default && <span className="rounded-full bg-green-500/15 px-2 py-0.5 text-xs text-green-300">Principal</span>}
                      </div>
                      <p className="mt-1 text-sm text-lunart-white/60">{address.full_address}</p>
                    </div>
                    <div className="flex gap-2">
                      {!address.is_default && (
                        <button
                          type="button"
                          onClick={() => setDefaultAddress(address.id)}
                          className="rounded-lg p-2 text-green-300 transition-colors hover:bg-green-500/15"
                          aria-label="Definir como principal"
                        >
                          <CheckCircle className="h-4 w-4" />
                        </button>
                      )}
                      <button
                        type="button"
                        onClick={() => deleteAddress(address.id)}
                        className="rounded-lg p-2 text-red-300 transition-colors hover:bg-red-500/15"
                        aria-label="Remover endereço"
                      >
                        <Trash2 className="h-4 w-4" />
                      </button>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          ) : (
            <p className="rounded-lg border border-lunart-white/10 bg-lunart-white/5 p-4 text-sm text-lunart-white/60">
              Nenhum endereço cadastrado. Crie um endereço para finalizar compras com entrega.
            </p>
          )}
        </section>

        {ordersLoading ? (
          <div>Carregando...</div>
        ) : orders?.length === 0 ? (
          <div className="glass rounded-lg p-8 text-center">
            <p className="text-lunart-white/60">Você ainda não realizou nenhum pedido.</p>
          </div>
        ) : (
          <div className="space-y-6">
            {orders?.map(order => (
              <Link
                key={order.id}
                href={`/profile/orders/${order.id}`}
                className="glass block rounded-lg p-6 transition-colors hover:border-lunart-pink-300"
              >
                <div className="flex flex-wrap justify-between items-center mb-4 pb-4 border-b border-lunart-white/10">
                  <div>
                    <div className="font-bold">Pedido #{order.id}</div>
                    <div className="text-xs text-lunart-white/40">{formatDateTime(order.created_at)}</div>
                  </div>
                  <div className="flex gap-4 items-center">
                    <span className="text-xl font-bold text-transparent bg-clip-text bg-hero-gradient">
                      {formatMoney(order.total)}
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
                        <span>{item.product_name} {item.variation && <span className="text-lunart-pink-400">({item.variation})</span>}</span>
                      </div>
                      <span className="text-lunart-white/60">{formatMoney(item.unit_price)}</span>
                    </div>
                  ))}
                </div>
                <div className="mt-5 border-t border-lunart-white/10 pt-4 text-right text-sm font-semibold text-lunart-pink-300">
                  Ver detalhes e suporte
                </div>
              </Link>
            ))}
          </div>
        )}
      </div>

    </div>
  );
}
