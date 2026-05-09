"use client";

import { useCart } from "@/hooks/useCart";
import { useCheckout } from "@/hooks/useOrders";
import { Trash2 } from "lucide-react";
import Image from "next/image";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { useState } from "react";
import api, { getApiErrorMessage } from "@/lib/api";
import toast from "react-hot-toast";
import { formatMoney, toCurrencyNumber } from "@/lib/formatters";
import { useAddresses } from "@/hooks/useAddresses";

export default function CartPage() {
  const { cart, isLoading, updateQuantity, removeItem } = useCart();
  const { checkout, isPending } = useCheckout();
  const { addresses } = useAddresses();
  const router = useRouter();
  
  const [shippingMethod, setShippingMethod] = useState("mercado_envios");
  const [couponCode, setCouponCode] = useState("");
  const [shippingCost, setShippingCost] = useState(25.90);
  const [discountPercent, setDiscountPercent] = useState(0);
  const [selectedAddressId, setSelectedAddressId] = useState<number | null>(null);
  const defaultAddressId = addresses?.find((address) => address.is_default)?.id ?? addresses?.[0]?.id ?? null;
  const checkoutAddressId = selectedAddressId ?? defaultAddressId;

  const calculateShipping = async (method: string) => {
    setShippingMethod(method);
    try {
      const res = await api.post("/shipping/calculate", { method });
      setShippingCost(toCurrencyNumber(res.data.cost));
    } catch {
      toast.error("Não foi possível recalcular o frete.");
    }
  };

  const applyCoupon = async () => {
    if (!couponCode) return;
    try {
      const res = await api.post("/coupons/validate", { code: couponCode });
      if (res.data.valid) {
        setDiscountPercent(res.data.discount_percent);
        toast.success(res.data.message);
      } else {
        toast.error(res.data.message);
        setDiscountPercent(0);
      }
    } catch {
      toast.error("Erro ao validar cupom");
    }
  };

  const handleCheckout = async () => {
    try {
      const order = await checkout({ 
        shipping_method: shippingMethod, 
        coupon_code: couponCode || undefined,
        address_id: shippingMethod === "pickup" ? undefined : checkoutAddressId || undefined,
      });
      if (order.payment_link && typeof window !== "undefined") {
        const paymentTab = window.open(order.payment_link, "_blank", "noopener,noreferrer");
        if (!paymentTab) {
          toast.error("Permita pop-ups para abrir a página de pagamento em outra aba.");
        }
      }
      toast.success("Pedido criado! Você pode acompanhar tudo em Meus Pedidos.");
      router.push(`/profile/orders/${order.id}`);
    } catch (error) {
      toast.error(getApiErrorMessage(error, "Erro ao finalizar compra"));
    }
  };

  if (isLoading) {
    return <div className="text-center mt-20">Carregando constelações...</div>;
  }

  if (!cart || cart.items.length === 0) {
    return (
      <div className="text-center mt-20 glass p-12 max-w-lg mx-auto rounded-lg">
        <h2 className="text-3xl font-display font-bold mb-4">Carrinho Vazio</h2>
        <p className="text-lunart-white/60 mb-8">Parece que você ainda não escolheu nenhuma estrela para a sua coleção.</p>
        <Link href="/" className="soft-button bg-lunart-purple-600 px-8 py-3 text-white hover:bg-lunart-purple-500">
          Explorar Loja
        </Link>
      </div>
    );
  }

  const subtotal = toCurrencyNumber(cart.total);
  const shipping = toCurrencyNumber(shippingCost);
  const discount = (subtotal * toCurrencyNumber(discountPercent)) / 100;
  const total = Math.max(0, subtotal + shipping - discount);

  return (
    <div className="mx-auto grid w-full max-w-6xl grid-cols-1 gap-8 lg:grid-cols-3">
      <div className="lg:col-span-2 flex flex-col gap-4">
        <h1 className="text-3xl font-display font-bold mb-4">Seu Carrinho</h1>
        {cart.items.map((item) => (
          <div key={item.id} className="glass flex flex-col gap-4 rounded-lg p-4 sm:flex-row sm:items-center">
            <div className="relative h-24 w-24 shrink-0 overflow-hidden rounded-lg bg-lunart-surface-light">
              <Image src={item.product_image_url || "/Lunart-Header.jpg"} alt={item.product_name} fill className="object-cover" />
            </div>
            <div className="flex-1">
              <h3 className="font-semibold text-lg">
                {item.product_name} {item.variation && <span className="text-sm font-normal text-lunart-pink-400">({item.variation})</span>}
              </h3>
              <p className="text-lunart-pink-300 font-bold">{formatMoney(item.product_price)}</p>
            </div>
            <div className="flex w-fit items-center gap-3 rounded-lg bg-lunart-surface-light p-1">
              <button 
                onClick={() => updateQuantity({ itemId: item.id, quantity: Math.max(1, item.quantity - 1)})}
                className="w-8 h-8 flex items-center justify-center hover:bg-lunart-purple-600 rounded-md"
                aria-label={`Diminuir quantidade de ${item.product_name}`}
              >-</button>
              <span className="w-4 text-center">{item.quantity}</span>
              <button 
                onClick={() => updateQuantity({ itemId: item.id, quantity: item.quantity + 1})}
                className="w-8 h-8 flex items-center justify-center hover:bg-lunart-purple-600 rounded-md"
                aria-label={`Aumentar quantidade de ${item.product_name}`}
              >+</button>
            </div>
            <button 
              onClick={() => removeItem(item.id)}
              className="w-fit rounded-lg p-3 text-red-300 transition-colors hover:bg-red-500/20"
              aria-label={`Remover ${item.product_name} do carrinho`}
            >
              <Trash2 className="w-5 h-5" />
            </button>
          </div>

        ))}
      </div>

      <div className="glass h-fit rounded-lg p-6 lg:sticky lg:top-24">
        <h2 className="text-xl font-bold mb-6">Resumo da Compra</h2>
        
        <div className="space-y-4 mb-6">
          <div className="flex justify-between text-lunart-white/80">
            <span>Subtotal</span>
            <span>{formatMoney(subtotal)}</span>
          </div>
          
          <div className="pt-4 border-t border-lunart-white/10">
            <label className="block text-sm mb-2 text-lunart-white/80">Cálculo de Frete</label>
            <select 
              value={shippingMethod}
              onChange={(e) => calculateShipping(e.target.value)}
              className="form-field"
            >
              <option value="mercado_envios">Correios (Sedex / PAC)</option>
              <option value="pickup">Retirar na Loja (Chat para agendar)</option>
            </select>
          </div>
          
          <div className="flex justify-between text-lunart-white/80">
            <span>Frete</span>
            <span>{formatMoney(shipping)}</span>
          </div>

          {shippingMethod !== "pickup" && (
            <div className="pt-4 border-t border-lunart-white/10">
              <label className="block text-sm mb-2 text-lunart-white/80">Endereço de entrega</label>
              {addresses?.length ? (
                <select
                  value={checkoutAddressId ?? ""}
                  onChange={(e) => setSelectedAddressId(Number(e.target.value))}
                  className="form-field"
                >
                  {addresses.map((address) => (
                    <option key={address.id} value={address.id}>
                      {address.label} - {address.city}/{address.state}
                    </option>
                  ))}
                </select>
              ) : (
                <Link href="/profile" className="soft-button w-full bg-lunart-purple-600 text-white hover:bg-lunart-purple-500">
                  Criar endereço no perfil
                </Link>
              )}
            </div>
          )}

          <div className="pt-4 border-t border-lunart-white/10">
            <label className="block text-sm mb-2 text-lunart-white/80">Cupom de Desconto</label>
            <div className="flex gap-2">
              <input 
                type="text" 
                value={couponCode}
                onChange={e => setCouponCode(e.target.value)}
                placeholder="LUNART20"
                className="form-field flex-1 uppercase"
              />
              <button 
                onClick={applyCoupon}
                className="soft-button bg-lunart-purple-600 text-white hover:bg-lunart-purple-500"
              >
                Aplicar
              </button>
            </div>
          </div>

          {discount > 0 && (
            <div className="flex justify-between text-green-400">
              <span>Desconto</span>
              <span>- {formatMoney(discount)}</span>
            </div>
          )}
        </div>

        <div className="pt-4 border-t border-lunart-white/10 mb-8">
          <div className="flex justify-between items-center">
            <span className="font-bold">Total Final</span>
            <span className="text-2xl font-bold text-transparent bg-clip-text bg-hero-gradient">
              {formatMoney(total)}
            </span>
          </div>
        </div>

        <button 
          onClick={handleCheckout}
          disabled={isPending || (shippingMethod !== "pickup" && !checkoutAddressId)}
          className="soft-button w-full bg-lunart-pink-500 py-4 text-lg text-white hover:bg-lunart-pink-400"
        >
          {isPending ? "Processando..." : "Finalizar Compra"}
        </button>
      </div>

    </div>
  );
}
