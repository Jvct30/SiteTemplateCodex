"use client";

import { useAuth } from "@/providers/auth-provider";
import { useState } from "react";
import api, { getApiErrorMessage } from "@/lib/api";
import toast from "react-hot-toast";
import { useProducts } from "@/hooks/useProducts";
import { useCustomRequests } from "@/hooks/useCustomRequests";
import { useStoreLinks } from "@/hooks/useStoreLinks";
import { useQuery, useQueryClient } from "@tanstack/react-query";
import { Link as LinkIcon, Megaphone, MessageSquare, PackageCheck, PackagePlus, Trash2, Truck } from "lucide-react";
import Link from "next/link";
import { InstagramIcon, ShopeeIcon, WhatsappIcon } from "@/components/ui/SocialIcons";
import { formatMoney } from "@/lib/formatters";
import { formatDateTime } from "@/lib/dates";
import { OrderResponse } from "@/types";

export default function AdminPage() {
  const { user, isAuthenticated, isLoading } = useAuth();
  const { products } = useProducts();
  const { requests, isLoading: requestsLoading } = useCustomRequests();
  const { links } = useStoreLinks();
  const { data: orders, isLoading: ordersLoading } = useQuery({
    queryKey: ["admin-orders"],
    queryFn: async () => {
      const res = await api.get<OrderResponse[]>("/admin/orders");
      return res.data;
    },
    enabled: isAuthenticated && user?.role === "admin",
  });
  const queryClient = useQueryClient();
  const [activeTab, setActiveTab] = useState<"products" | "customRequests" | "paidOrders" | "links">("products");
  
  const [productName, setProductName] = useState("");
  const [productPrice, setProductPrice] = useState("");
  const [productStock, setProductStock] = useState("");
  const [productDesc, setProductDesc] = useState("");
  const [imageUrls, setImageUrls] = useState<string[]>([]);
  const [variations, setVariations] = useState("");
  
  const [uploading, setUploading] = useState(false);
  const [noticeText, setNoticeText] = useState("");
  const [shippingOrderId, setShippingOrderId] = useState<number | null>(null);
  const paidOrders = orders?.filter((order) => ["paid", "shipped"].includes(order.status)) ?? [];

  const handleImageUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const files = Array.from(e.target.files ?? []);
    if (!files.length) return;
    try {
      setUploading(true);
      const uploadedUrls: string[] = [];
      for (const file of files) {
        const formData = new FormData();
        formData.append("file", file);
        const res = await api.post("/admin/upload-image", formData, {
          headers: { "Content-Type": "multipart/form-data" }
        });
        uploadedUrls.push(res.data.url);
      }
      setImageUrls((current) => [...current, ...uploadedUrls]);
      toast.success(files.length > 1 ? "Imagens enviadas com sucesso!" : "Imagem enviada com sucesso!");
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

  const handleSaveLinks = async (e: React.FormEvent) => {
    e.preventDefault();
    const formData = new FormData(e.currentTarget as HTMLFormElement);
    try {
      await api.put("/admin/links", {
        instagram_url: String(formData.get("instagram_url") || "").trim(),
        shopee_url: String(formData.get("shopee_url") || "").trim(),
        whatsapp_url: String(formData.get("whatsapp_url") || "").trim(),
      });
      queryClient.invalidateQueries({ queryKey: ["store-links"] });
      toast.success("Links atualizados com sucesso!");
    } catch (error) {
      toast.error(getApiErrorMessage(error, "Erro ao salvar links."));
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

  const handleMarkOrderShipped = async (orderId: number) => {
    try {
      setShippingOrderId(orderId);
      await api.put(`/admin/orders/${orderId}/status`, null, {
        params: { status: "shipped" },
      });
      toast.success("Pedido marcado como enviado.");
      queryClient.invalidateQueries({ queryKey: ["admin-orders"] });
      queryClient.invalidateQueries({ queryKey: ["orders"] });
      queryClient.invalidateQueries({ queryKey: ["custom-request"] });
    } catch (error) {
      toast.error(getApiErrorMessage(error, "Erro ao marcar pedido como enviado."));
    } finally {
      setShippingOrderId(null);
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
        image_url: imageUrls[0] || null,
        image_urls: imageUrls.length ? imageUrls : null,
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
      setImageUrls([]);
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
        <button
          type="button"
          onClick={() => setActiveTab("paidOrders")}
          className={`soft-button gap-2 ${activeTab === "paidOrders" ? "bg-lunart-purple-600 text-white" : "bg-lunart-surface-light text-lunart-white/70 hover:text-white"}`}
        >
          <PackageCheck className="h-4 w-4" />
          Pedidos pagos
        </button>
        <button
          type="button"
          onClick={() => setActiveTab("links")}
          className={`soft-button gap-2 ${activeTab === "links" ? "bg-lunart-purple-600 text-white" : "bg-lunart-surface-light text-lunart-white/70 hover:text-white"}`}
        >
          <LinkIcon className="h-4 w-4" />
          Links
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
              <input type="file" accept="image/*" multiple onChange={handleImageUpload} disabled={uploading} className="form-field file:mr-4 file:rounded-full file:border-0 file:bg-lunart-purple-600 file:px-3 file:py-1 file:text-xs file:font-semibold file:text-white hover:file:bg-lunart-purple-500" />
              {uploading && <span className="text-xs text-lunart-pink-400 mt-1 block">Enviando...</span>}
              {imageUrls.length > 0 && (
                <div className="mt-2 flex flex-col gap-1 text-xs text-green-400">
                  <span>{imageUrls.length > 1 ? "Imagens enviadas com sucesso!" : "Imagem enviada com sucesso!"}</span>
                  <span className="text-lunart-white/45">A ordem das fotos segue a ordem dos uploads.</span>
                </div>
              )}
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
              <input type="text" value={noticeText} onChange={e=>setNoticeText(e.target.value)} className="form-field" placeholder="Ex: Estamos em promoção! Use o cupom PROMO10" />
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
                    <span className="text-xs text-lunart-pink-400">{formatMoney(p.price)} | Estoque: {p.stock}</span>
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
      ) : activeTab === "customRequests" ? (
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
                        Cliente #{request.user_id} • {formatDateTime(request.created_at)}
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
      ) : activeTab === "paidOrders" ? (
        <div className="glass rounded-lg p-6">
          <h2 className="mb-4 flex items-center gap-2 text-xl font-bold">
            <PackageCheck className="h-5 w-5 text-lunart-pink-300" />
            Pedidos pagos para envio
          </h2>

          {ordersLoading ? (
            <p className="text-sm text-lunart-white/60">Carregando pedidos...</p>
          ) : paidOrders.length ? (
            <div className="flex flex-col gap-3">
              {paidOrders.map((order) => (
                  <div
                    key={order.id}
                    className="rounded-lg border border-lunart-white/10 bg-lunart-surface-light p-4 transition-colors hover:border-lunart-pink-300"
                  >
                    <div className="flex flex-col gap-3">
                      <div className="flex flex-col gap-2 sm:flex-row sm:items-center sm:justify-between">
                        <div>
                          <h3 className="font-semibold">Pedido #{order.id}</h3>
                          <p className="text-xs text-lunart-white/45">{formatDateTime(order.created_at)}</p>
                        </div>
                        <div className="flex flex-col gap-2 sm:items-end">
                          <span className="text-lg font-bold text-lunart-pink-300">{formatMoney(order.total)}</span>
                          <span className="w-fit rounded-full bg-lunart-white/10 px-3 py-1 text-xs font-bold uppercase text-lunart-pink-300">
                            {order.status === "shipped" ? "Enviado" : "Pago"}
                          </span>
                        </div>
                      </div>
                      <div className="text-sm text-lunart-white/65">
                        {order.shipping_address_text || "Retirada na loja"}
                      </div>
                      <div className="flex flex-col gap-2 sm:flex-row sm:items-center sm:justify-between">
                        <Link
                          href={order.support_request_id ? `/custom-requests/${order.support_request_id}` : `/profile/orders/${order.id}`}
                          className="text-sm font-medium text-lunart-pink-300 hover:text-lunart-pink-200"
                        >
                          {order.support_request_id ? "Abrir chat do pedido" : "Ver detalhes do pedido"}
                        </Link>
                        {order.status === "paid" && (
                          <button
                            type="button"
                            onClick={() => handleMarkOrderShipped(order.id)}
                            disabled={shippingOrderId === order.id}
                            className="soft-button gap-2 bg-lunart-purple-600 text-white hover:bg-lunart-purple-500"
                          >
                            <Truck className="h-4 w-4" />
                            {shippingOrderId === order.id ? "Marcando..." : "Marcar pedido como enviado"}
                          </button>
                        )}
                      </div>
                    </div>
                  </div>
                ))}
            </div>
          ) : (
            <p className="text-sm text-lunart-white/60">Nenhum pedido pago aguardando envio.</p>
          )}
        </div>
      ) : (
        <div className="glass rounded-lg p-6">
          <h2 className="mb-4 flex items-center gap-2 text-xl font-bold">
            <LinkIcon className="h-5 w-5 text-lunart-pink-300" />
            Links
          </h2>

          <form onSubmit={handleSaveLinks} className="flex flex-col gap-4">
            <div>
              <label className="mb-1 flex items-center gap-2 text-sm font-medium text-lunart-white/80">
                <InstagramIcon className="h-4 w-4 text-lunart-pink-300" />
                Instagram
              </label>
              <input
                type="url"
                name="instagram_url"
                key={`instagram-${links?.instagram_url ?? ""}`}
                defaultValue={links?.instagram_url ?? ""}
                className="form-field"
                placeholder="https://instagram.com/sua-loja"
              />
            </div>
            <div>
              <label className="mb-1 flex items-center gap-2 text-sm font-medium text-lunart-white/80">
                <ShopeeIcon className="h-4 w-4 text-lunart-pink-300" />
                Shopee
              </label>
              <input
                type="url"
                name="shopee_url"
                key={`shopee-${links?.shopee_url ?? ""}`}
                defaultValue={links?.shopee_url ?? ""}
                className="form-field"
                placeholder="https://shopee.com.br/sua-loja"
              />
            </div>
            <div>
              <label className="mb-1 flex items-center gap-2 text-sm font-medium text-lunart-white/80">
                <WhatsappIcon className="h-4 w-4 text-lunart-pink-300" />
                WhatsApp
              </label>
              <input
                type="url"
                name="whatsapp_url"
                key={`whatsapp-${links?.whatsapp_url ?? ""}`}
                defaultValue={links?.whatsapp_url ?? ""}
                className="form-field"
                placeholder="https://wa.me/5500000000000"
              />
            </div>
            <button type="submit" className="soft-button w-fit bg-lunart-purple-600 text-white hover:bg-lunart-purple-500">
              Salvar links
            </button>
          </form>
        </div>
      )}
    </div>
  );
}
