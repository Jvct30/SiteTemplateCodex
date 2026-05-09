"use client";

import { useAuth } from "@/providers/auth-provider";
import { useState } from "react";
import api, { getApiErrorMessage } from "@/lib/api";
import toast from "react-hot-toast";
import { useProducts } from "@/hooks/useProducts";
import { useCustomRequests } from "@/hooks/useCustomRequests";
import { useQueryClient } from "@tanstack/react-query";
import { Megaphone, MessageSquare, PackagePlus, Trash2 } from "lucide-react";
import Link from "next/link";

export default function AdminPage() {
  const { user, isAuthenticated, isLoading } = useAuth();
  const { products } = useProducts();
  const { requests, isLoading: requestsLoading } = useCustomRequests();
  const queryClient = useQueryClient();
  const [activeTab, setActiveTab] = useState<"products" | "customRequests">("products");
  
  const [productName, setProductName] = useState("");
  const [productPrice, setProductPrice] = useState("");
  const [productStock, setProductStock] = useState("");
  const [productDesc, setProductDesc] = useState("");
  const [imageUrl, setImageUrl] = useState("");
  const [variations, setVariations] = useState("");
  
  const [uploading, setUploading] = useState(false);
  const [noticeText, setNoticeText] = useState("");

  const handleImageUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    try {
      setUploading(true);
      const formData = new FormData();
      formData.append("file", file);
      const res = await api.post("/admin/upload-image", formData, {
        headers: { "Content-Type": "multipart/form-data" }
      });
      setImageUrl(res.data.url);
      toast.success("Imagem enviada com sucesso!");
    } catch (error) {
      toast.error(getApiErrorMessage(error, "Erro ao enviar imagem."));
    } finally {
      setUploading(false);
    }
  };

  const handleSaveNotice = async () => {
    if (!noticeText.trim()) return toast.error("Digite um aviso!");
    try {
      await api.post("/admin/notice", { message: noticeText, is_active: true });
      toast.success("Aviso ativado com sucesso!");
      setNoticeText("");
    } catch (error) {
      toast.error(getApiErrorMessage(error, "Erro ao ativar aviso."));
    }
  };

  const handleRemoveNotice = async () => {
    try {
      await api.delete("/admin/notice");
      toast.success("Aviso removido!");
    } catch (error) {
      toast.error(getApiErrorMessage(error, "Erro ao remover aviso."));
    }
  };

  const handleDeleteProduct = async (id: number) => {
    if (!confirm("Tem certeza que deseja deletar este produto?")) return;
    try {
      await api.delete(`/admin/products/${id}`);
      toast.success("Produto removido com sucesso!");
      queryClient.invalidateQueries({ queryKey: ["products"] });
    } catch (error) {
      toast.error(getApiErrorMessage(error, "Erro ao remover produto."));
    }
  };

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
        image_url: imageUrl || null,
        variations: variations.trim()
          ? variations.split(",").map((v) => v.trim()).filter(Boolean)
          : null
      });
      toast.success("Produto criado com sucesso!");
      queryClient.invalidateQueries({ queryKey: ["products"] });
      setProductName("");
      setProductPrice("");
      setProductStock("");
      setProductDesc("");
      setImageUrl("");
      setVariations("");
    } catch (error) {
      toast.error(getApiErrorMessage(error, "Erro ao criar produto."));
    }
  };

  return (
    <div className="max-w-4xl mx-auto w-full">
      <h1 className="text-3xl font-display font-bold mb-8 text-lunart-star">Painel Administrativo</h1>

      <div className="mb-8 flex flex-wrap gap-2">
        <button
          type="button"
          onClick={() => setActiveTab("products")}
          className={`soft-button ${activeTab === "products" ? "bg-lunart-purple-600 text-white" : "bg-lunart-surface-light text-lunart-white/70 hover:text-white"}`}
        >
          Produtos
        </button>
        <button
          type="button"
          onClick={() => setActiveTab("customRequests")}
          className={`soft-button gap-2 ${activeTab === "customRequests" ? "bg-lunart-purple-600 text-white" : "bg-lunart-surface-light text-lunart-white/70 hover:text-white"}`}
        >
          <MessageSquare className="h-4 w-4" />
          Ver pedidos sob encomenda
        </button>
      </div>

      {activeTab === "products" ? (
        <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
        
        <div className="glass rounded-lg p-6">
          <h2 className="mb-4 flex items-center gap-2 text-xl font-bold">
            <PackagePlus className="h-5 w-5 text-lunart-pink-300" />
            Adicionar Produto
          </h2>
          <form onSubmit={handleCreateProduct} className="flex flex-col gap-4">
            <div>
              <label className="block text-xs mb-1">Nome</label>
              <input type="text" required value={productName} onChange={e=>setProductName(e.target.value)} className="form-field" />
            </div>
            <div className="flex gap-4">
              <div className="flex-1">
                <label className="block text-xs mb-1">Preço</label>
                <input type="number" step="0.01" min="0" required value={productPrice} onChange={e=>setProductPrice(e.target.value)} className="form-field" />
              </div>
              <div className="flex-1">
                <label className="block text-xs mb-1">Estoque</label>
                <input type="number" min="0" required value={productStock} onChange={e=>setProductStock(e.target.value)} className="form-field" />
              </div>
            </div>
            <div>
              <label className="block text-xs mb-1">Upload de Imagem</label>
              <input type="file" accept="image/*" onChange={handleImageUpload} disabled={uploading} className="form-field file:mr-4 file:rounded-full file:border-0 file:bg-lunart-purple-600 file:px-3 file:py-1 file:text-xs file:font-semibold file:text-white hover:file:bg-lunart-purple-500" />
              {uploading && <span className="text-xs text-lunart-pink-400 mt-1 block">Enviando...</span>}
              {imageUrl && <span className="text-xs text-green-400 mt-1 block">Imagem enviada com sucesso!</span>}
            </div>
            <div>
              <label className="block text-xs mb-1">Variações (Separadas por vírgula)</label>
              <input type="text" value={variations} onChange={e=>setVariations(e.target.value)} className="form-field" placeholder="Ex: Rosa, Azul, Pequeno, Grande" />
            </div>
            <div>
              <label className="block text-xs mb-1">Descrição</label>
              <textarea value={productDesc} onChange={e=>setProductDesc(e.target.value)} className="form-field" rows={3}></textarea>
            </div>
            <button type="submit" className="soft-button mt-2 bg-lunart-purple-600 text-white hover:bg-lunart-purple-500">Criar Produto</button>
          </form>
        </div>

        {/* Info Box */}
        <div className="flex flex-col gap-8">
          {/* Notice Box */}
          <div className="glass rounded-lg p-6">
            <h2 className="mb-4 flex items-center gap-2 text-xl font-bold">
              <Megaphone className="h-5 w-5 text-lunart-pink-300" />
              Aviso da Loja
            </h2>
            <div className="flex flex-col gap-3">
              <input type="text" value={noticeText} onChange={e=>setNoticeText(e.target.value)} className="form-field" placeholder="Ex: Estamos em promoção! Use o cupom ESTRELA" />
              <div className="flex gap-2">
                <button onClick={handleSaveNotice} className="soft-button flex-1 bg-lunart-purple-600 text-white hover:bg-lunart-purple-500">Ativar</button>
                <button onClick={handleRemoveNotice} className="soft-button flex-1 border border-red-500/50 bg-red-500/20 text-red-300 hover:bg-red-500/30">Remover</button>
              </div>
            </div>
          </div>

          <div className="glass max-h-[400px] overflow-y-auto rounded-lg p-6">
            <h2 className="text-xl font-bold mb-4">Gerenciar Produtos</h2>
            <div className="flex flex-col gap-2">
              {products?.map(p => (
                <div key={p.id} className="flex justify-between items-center bg-lunart-surface-light p-3 rounded-lg border border-lunart-white/5">
                  <div className="flex flex-col">
                    <span className="text-sm font-semibold">{p.name}</span>
                    <span className="text-xs text-lunart-pink-400">R$ {Number(p.price).toFixed(2)} | Estoque: {p.stock}</span>
                  </div>
                  <button onClick={() => handleDeleteProduct(p.id)} className="p-2 text-red-400 hover:bg-red-500/20 rounded-lg transition-colors">
                    <Trash2 className="w-4 h-4" />
                  </button>
                </div>
              ))}
              {!products?.length && <p className="text-sm text-lunart-white/60">Nenhum produto cadastrado.</p>}
            </div>
          </div>

        </div>

      </div>
      ) : (
        <div className="glass rounded-lg p-6">
          <h2 className="mb-4 flex items-center gap-2 text-xl font-bold">
            <MessageSquare className="h-5 w-5 text-lunart-pink-300" />
            Pedidos sob encomenda
          </h2>

          {requestsLoading ? (
            <p className="text-sm text-lunart-white/60">Carregando pedidos...</p>
          ) : requests?.length ? (
            <div className="flex flex-col gap-3">
              {requests.map((request) => (
                <Link
                  key={request.id}
                  href={`/custom-requests/${request.id}`}
                  className="rounded-lg border border-lunart-white/10 bg-lunart-surface-light p-4 transition-colors hover:border-lunart-pink-300"
                >
                  <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
                    <div>
                      <h3 className="font-semibold">{request.subject}</h3>
                      <p className="text-xs text-lunart-white/45">
                        Cliente #{request.user_id} • {new Date(request.created_at).toLocaleString("pt-BR")}
                      </p>
                    </div>
                    <span className="w-fit rounded-full bg-lunart-white/10 px-3 py-1 text-xs font-bold uppercase text-lunart-pink-300">
                      {request.status}
                    </span>
                  </div>
                </Link>
              ))}
            </div>
          ) : (
            <p className="text-sm text-lunart-white/60">Nenhum pedido sob encomenda encontrado.</p>
          )}
        </div>
      )}
    </div>
  );
}
