"use client";

import { useAuth } from "@/providers/auth-provider";
import { useRouter } from "next/navigation";
import { useState } from "react";
import api from "@/lib/api";

export default function AdminPage() {
  const { user, isAuthenticated, isLoading } = useAuth();
  const router = useRouter();
  
  const [productName, setProductName] = useState("");
  const [productPrice, setProductPrice] = useState("");
  const [productStock, setProductStock] = useState("");
  const [productDesc, setProductDesc] = useState("");
  const [imageUrl, setImageUrl] = useState("");

  if (isLoading) return null;
  if (!isAuthenticated || user?.role !== "admin") {
    return <div className="text-center mt-20">Acesso negado. Apenas administradores.</div>;
  }

  const handleCreateProduct = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      await api.post("/admin/products", {
        name: productName,
        description: productDesc || null,
        price: parseFloat(productPrice),
        stock: parseInt(productStock, 10),
        image_url: imageUrl || null
      });
      alert("Produto criado com sucesso!");
      setProductName("");
      setProductPrice("");
      setProductStock("");
      setProductDesc("");
      setImageUrl("");
    } catch (err) {
      alert("Erro ao criar produto.");
    }
  };

  return (
    <div className="max-w-4xl mx-auto w-full">
      <h1 className="text-3xl font-display font-bold mb-8 text-lunart-star">Painel Administrativo</h1>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
        
        {/* Create Product Form */}
        <div className="glass p-6 rounded-3xl">
          <h2 className="text-xl font-bold mb-4">Adicionar Produto</h2>
          <form onSubmit={handleCreateProduct} className="flex flex-col gap-4">
            <div>
              <label className="block text-xs mb-1">Nome</label>
              <input type="text" required value={productName} onChange={e=>setProductName(e.target.value)} className="w-full bg-lunart-surface-light border border-lunart-purple-500/30 rounded-lg px-3 py-2 text-sm" />
            </div>
            <div className="flex gap-4">
              <div className="flex-1">
                <label className="block text-xs mb-1">Preço</label>
                <input type="number" step="0.01" required value={productPrice} onChange={e=>setProductPrice(e.target.value)} className="w-full bg-lunart-surface-light border border-lunart-purple-500/30 rounded-lg px-3 py-2 text-sm" />
              </div>
              <div className="flex-1">
                <label className="block text-xs mb-1">Estoque</label>
                <input type="number" required value={productStock} onChange={e=>setProductStock(e.target.value)} className="w-full bg-lunart-surface-light border border-lunart-purple-500/30 rounded-lg px-3 py-2 text-sm" />
              </div>
            </div>
            <div>
              <label className="block text-xs mb-1">URL da Imagem (Cloudinary)</label>
              <input type="url" value={imageUrl} onChange={e=>setImageUrl(e.target.value)} className="w-full bg-lunart-surface-light border border-lunart-purple-500/30 rounded-lg px-3 py-2 text-sm" placeholder="https://res.cloudinary.com/..." />
            </div>
            <div>
              <label className="block text-xs mb-1">Descrição</label>
              <textarea value={productDesc} onChange={e=>setProductDesc(e.target.value)} className="w-full bg-lunart-surface-light border border-lunart-purple-500/30 rounded-lg px-3 py-2 text-sm" rows={3}></textarea>
            </div>
            <button type="submit" className="bg-lunart-purple-600 hover:bg-lunart-purple-500 py-2 rounded-lg font-bold text-sm mt-2">Criar Produto</button>
          </form>
        </div>

        {/* Info Box */}
        <div className="flex flex-col gap-8">
          <div className="glass p-6 rounded-3xl">
            <h2 className="text-xl font-bold mb-4">Avisos</h2>
            <p className="text-sm text-lunart-white/60 mb-2">
              Para funcionalidades completas de gestão (Pedidos, Cupons, Chats, upload direto pro Cloudinary), expanda os endpoints do <code>admin_router.py</code> consumindo-os aqui.
            </p>
          </div>
        </div>

      </div>
    </div>
  );
}
