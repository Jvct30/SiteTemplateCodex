"use client";

import { useCart } from "@/hooks/useCart";
import { useCheckout } from "@/hooks/useOrders";
import { Trash2 } from "lucide-react";
import Image from "next/image";
import Link from "next/link";
import { useState } from "react";
import api from "@/lib/api";
import toast from "react-hot-toast";

export default function CartPage() {
  const { cart, isLoading, updateQuantity, removeItem } = useCart();
  const { checkout, isPending } = useCheckout();
  
  const [shippingMethod, setShippingMethod] = useState("mercado_envios");
  const [couponCode, setCouponCode] = useState("");
  const [shippingCost, setShippingCost] = useState(25.90);
  const [discountPercent, setDiscountPercent] = useState(0);

  const calculateShipping = async (method: string) => {
    setShippingMethod(method);
    try {
      const res = await api.post("/shipping/calculate", { method });
      setShippingCost(res.data.cost);
    } catch (err) {
      console.error(err);
    }
  };

  const applyCoupon = async () => {
    if (!couponCode) return;
    try {
      const res = await api.post("/coupons/validate", { code: couponCode });
      if (res.data.valid) {
        setDiscountPercent(res.data.discount_percent);
        alert(res.data.message);
      } else {
        alert(res.data.message);
        setDiscountPercent(0);
      }
    } catch (err) {
      toast.error("Erro ao validar cupom");
    }
  };

  const handleCheckout = async () => {
    try {
      const order = await checkout({ 
        shipping_method: shippingMethod, 
        coupon_code: couponCode || undefined 
      });
      // Redirect to mock payment link
      if (shippingMethod === "pickup") {
        toast.success("Pedido gerado! Um chat foi criado na aba de Perfil para agendar a retirada.", { duration: 4000 });
        setTimeout(() => {
          if (order.payment_link) window.location.href = order.payment_link;
        }, 4000);
      } else {
        if (order.payment_link) {
          window.location.href = order.payment_link;
        }
      }
    } catch (err: any) {
      toast.error(err.response?.data?.detail || "Erro ao finalizar compra");
    }
  };

  if (isLoading) {
    return <div className="text-center mt-20">Carregando constelações...</div>;
  }

  if (!cart || cart.items.length === 0) {
    return (
      <div className="text-center mt-20 glass p-12 max-w-lg mx-auto rounded-3xl">
        <h2 className="text-3xl font-display font-bold mb-4">Carrinho Vazio</h2>
        <p className="text-lunart-white/60 mb-8">Parece que você ainda não escolheu nenhuma estrela para a sua coleção.</p>
        <Link href="/" className="bg-lunart-purple-600 px-8 py-3 rounded-xl font-bold hover:bg-lunart-purple-500 transition-colors">
          Explorar Loja
        </Link>
      </div>
    );
  }

  const subtotal = cart.total;
  const discount = (subtotal * discountPercent) / 100;
  const total = subtotal + shippingCost - discount;

  return (
    <div className="max-w-6xl mx-auto w-full grid grid-cols-1 lg:grid-cols-3 gap-8">
      
      {/* Items */}
      <div className="lg:col-span-2 flex flex-col gap-4">
        <h1 className="text-3xl font-display font-bold mb-4">Seu Carrinho</h1>
        {cart.items.map((item) => (
          <div key={item.id} className="glass p-4 rounded-2xl flex items-center gap-4">
            <div className="relative w-20 h-20 rounded-xl overflow-hidden bg-lunart-surface-light shrink-0">
              <Image src={item.product_image_url || "/Lunart-Header.jpg"} alt={item.product_name} fill className="object-cover" />
            </div>
            <div className="flex-1">
              <h3 className="font-semibold text-lg">
                {item.product_name} {item.variation && <span className="text-sm font-normal text-lunart-pink-400">({item.variation})</span>}
              </h3>
              <p className="text-lunart-pink-300 font-bold">R$ {Number(item.product_price).toFixed(2)}</p>
            </div>
            <div className="flex items-center gap-3 bg-lunart-surface-light rounded-lg p-1">
              <button 
                onClick={() => updateQuantity({ itemId: item.id, quantity: Math.max(1, item.quantity - 1)})}
                className="w-8 h-8 flex items-center justify-center hover:bg-lunart-purple-600 rounded-md"
              >-</button>
              <span className="w-4 text-center">{item.quantity}</span>
              <button 
                onClick={() => updateQuantity({ itemId: item.id, quantity: item.quantity + 1})}
                className="w-8 h-8 flex items-center justify-center hover:bg-lunart-purple-600 rounded-md"
              >+</button>
            </div>
            <button 
              onClick={() => removeItem(item.id)}
              className="p-3 text-red-400 hover:bg-red-500/20 rounded-xl transition-colors"
            >
              <Trash2 className="w-5 h-5" />
            </button>
          </div>
        ))}
      </div>

      {/* Resumo */}
      <div className="glass p-6 rounded-3xl h-fit sticky top-24">
        <h2 className="text-xl font-bold mb-6">Resumo da Compra</h2>
        
        <div className="space-y-4 mb-6">
          <div className="flex justify-between text-lunart-white/80">
            <span>Subtotal</span>
            <span>R$ {Number(subtotal).toFixed(2)}</span>
          </div>
          
          <div className="pt-4 border-t border-lunart-white/10">
            <label className="block text-sm mb-2 text-lunart-white/80">Cálculo de Frete</label>
            <select 
              value={shippingMethod}
              onChange={(e) => calculateShipping(e.target.value)}
              className="w-full bg-lunart-surface-light border border-lunart-purple-500/30 rounded-xl px-4 py-2 focus:outline-none focus:border-lunart-pink-400"
            >
              <option value="mercado_envios">Correios (Sedex / PAC)</option>
              <option value="pickup">Retirar na Loja (Chat para agendar)</option>
            </select>
          </div>
          
          <div className="flex justify-between text-lunart-white/80">
            <span>Frete</span>
            <span>R$ {Number(shippingCost).toFixed(2)}</span>
          </div>

          <div className="pt-4 border-t border-lunart-white/10">
            <label className="block text-sm mb-2 text-lunart-white/80">Cupom de Desconto</label>
            <div className="flex gap-2">
              <input 
                type="text" 
                value={couponCode}
                onChange={e => setCouponCode(e.target.value)}
                placeholder="LUNART20"
                className="flex-1 bg-lunart-surface-light border border-lunart-purple-500/30 rounded-xl px-4 py-2 focus:outline-none focus:border-lunart-pink-400 uppercase"
              />
              <button 
                onClick={applyCoupon}
                className="px-4 bg-lunart-purple-600 hover:bg-lunart-purple-500 rounded-xl font-medium"
              >
                Aplicar
              </button>
            </div>
          </div>

          {discount > 0 && (
            <div className="flex justify-between text-green-400">
              <span>Desconto</span>
              <span>- R$ {Number(discount).toFixed(2)}</span>
            </div>
          )}
        </div>

        <div className="pt-4 border-t border-lunart-white/10 mb-8">
          <div className="flex justify-between items-center">
            <span className="font-bold">Total Final</span>
            <span className="text-2xl font-bold text-transparent bg-clip-text bg-hero-gradient">
              R$ {Number(Math.max(0, total)).toFixed(2)}
            </span>
          </div>
        </div>

        <button 
          onClick={handleCheckout}
          disabled={isPending}
          className="w-full bg-lunart-pink-500 hover:bg-lunart-pink-400 py-4 rounded-xl font-bold text-lg transition-colors disabled:opacity-50"
        >
          {isPending ? "Processando..." : "Finalizar Compra"}
        </button>
      </div>

    </div>
  );
}
