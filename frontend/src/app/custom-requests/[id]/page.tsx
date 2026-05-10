"use client";

import { useCustomRequestDetails } from "@/hooks/useCustomRequests";
import { useParams } from "next/navigation";
import { useState, useRef, useEffect } from "react";
import { PackagePlus, Send, Trash2 } from "lucide-react";
import Link from "next/link";
import toast from "react-hot-toast";
import { useAuth } from "@/providers/auth-provider";
import { getApiErrorMessage } from "@/lib/api";
import { formatDateTime } from "@/lib/dates";

export default function CustomRequestChat() {
  const params = useParams();
  const id = Number(params.id);
  const { user } = useAuth();
  const {
    request,
    isLoading,
    sendMessage,
    cancelRequest,
    createQuote,
    isCreatingQuote,
  } = useCustomRequestDetails(id);
  const [content, setContent] = useState("");
  const [isQuoteOpen, setIsQuoteOpen] = useState(false);
  const [quoteName, setQuoteName] = useState("");
  const [quotePrice, setQuotePrice] = useState("");
  const [quoteDescription, setQuoteDescription] = useState("");
  const endRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    endRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [request?.messages]);

  if (isLoading) return <div className="text-center mt-20">Carregando...</div>;
  if (!request) return <div className="text-center mt-20">Pedido não encontrado.</div>;

  const isAdmin = user?.role === "admin";
  const isClosed = request.status === "closed" || request.status === "cancelled";

  const handleSend = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!content.trim()) return;
    try {
      await sendMessage(content);
      setContent("");
    } catch {
      toast.error("Erro ao enviar mensagem.");
    }
  };

  const handleCancel = async () => {
    if (!confirm("Cancelar este pedido sob encomenda?")) return;
    try {
      await cancelRequest();
      toast.success("Pedido cancelado.");
    } catch (error) {
      toast.error(getApiErrorMessage(error, "Erro ao cancelar pedido."));
    }
  };

  const handleCreateQuote = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      await createQuote({
        name: quoteName,
        description: quoteDescription,
        price: Number(quotePrice),
      });
      setQuoteName("");
      setQuotePrice("");
      setQuoteDescription("");
      setIsQuoteOpen(false);
      toast.success("Pedido criado para pagamento.");
    } catch (error) {
      toast.error(getApiErrorMessage(error, "Erro ao criar pedido."));
    }
  };

  return (
    <div className="max-w-3xl mx-auto w-full h-[calc(100vh-160px)] flex flex-col">
      <Link href={isAdmin ? "/admin" : "/custom-requests"} className="text-template-pink-400 hover:text-template-pink-300 mb-4 inline-block">
        ← Voltar
      </Link>
      
      <div className="glass rounded-t-lg border-b-0 p-4">
        <div className="flex flex-col gap-3 sm:flex-row sm:items-start sm:justify-between">
          <div>
            <h1 className="text-xl font-bold">{request.subject}</h1>
            <div className="text-xs text-template-white/40">Status: {request.status}</div>
          </div>
          <div className="flex flex-wrap gap-2">
            {request.quoted_product_id && !isAdmin && request.status !== "closed" && (
              <Link
                href={`/products/${request.quoted_product_id}`}
                className="soft-button bg-template-pink-500 text-white hover:bg-template-pink-400"
              >
                Ver pedido para pagar
              </Link>
            )}
            {isAdmin && !isClosed && (
              <button
                type="button"
                onClick={() => setIsQuoteOpen((value) => !value)}
                className="soft-button gap-2 bg-template-purple-600 text-white hover:bg-template-purple-500"
              >
                <PackagePlus className="h-4 w-4" />
                Criar pedido
              </button>
            )}
            {!isAdmin && !isClosed && (
              <button
                type="button"
                onClick={handleCancel}
                className="soft-button gap-2 border border-red-500/50 bg-red-500/15 text-red-300 hover:bg-red-500/25"
              >
                <Trash2 className="h-4 w-4" />
                Cancelar chat
              </button>
            )}
          </div>
        </div>
      </div>

      {isAdmin && isQuoteOpen && !isClosed && (
        <form onSubmit={handleCreateQuote} className="glass border-y-0 p-4">
          <div className="grid gap-3 sm:grid-cols-2">
            <input
              type="text"
              required
              value={quoteName}
              onChange={(e) => setQuoteName(e.target.value)}
              placeholder="Nome do pedido"
              className="form-field"
            />
            <input
              type="number"
              min="0"
              step="0.01"
              required
              value={quotePrice}
              onChange={(e) => setQuotePrice(e.target.value)}
              placeholder="Valor combinado"
              className="form-field"
            />
          </div>
          <textarea
            value={quoteDescription}
            onChange={(e) => setQuoteDescription(e.target.value)}
            placeholder="Descrição combinada com a cliente"
            className="form-field mt-3"
            rows={3}
          />
          <div className="mt-3 flex justify-end">
            <button
              type="submit"
              disabled={isCreatingQuote}
              className="soft-button bg-template-pink-500 text-white hover:bg-template-pink-400"
            >
              {isCreatingQuote ? "Criando..." : "Criar pedido para pagamento"}
            </button>
          </div>
        </form>
      )}

      {/* Chat Area */}
      <div className="flex-1 glass border-y-0 overflow-y-auto p-6 flex flex-col gap-4 custom-scrollbar">
        {request.messages.map((msg) => {
          const isCustomer = msg.sender_role === "customer";
          const isSystem = msg.sender_role === "system";
          const isMine = isAdmin ? msg.sender_role === "admin" : isCustomer;
          return (
            <div key={msg.id} className={`flex ${isMine ? "justify-end" : "justify-start"}`}>
              <div className={`max-w-[80%] rounded-lg p-4 ${
                isSystem
                  ? "mx-auto bg-template-white/10 text-center text-sm text-template-white/70"
                  : isMine 
                  ? "bg-template-purple-600 rounded-tr-sm"
                  : "bg-template-surface-light border border-template-purple-500/30 rounded-tl-sm"
              }`}>
                <div className="text-xs text-template-white/40 mb-1">
                  {isSystem ? "Sistema" : isCustomer ? "Cliente" : "Template Store Admin"} • {formatDateTime(msg.created_at)}
                </div>
                <div className="whitespace-pre-wrap">{msg.content}</div>
              </div>
            </div>
          );
        })}
        <div ref={endRef} />
      </div>

      {/* Input Area */}
      <div className="glass rounded-b-lg p-4">
        <form onSubmit={handleSend} className="flex gap-2">
          <input 
            type="text"
            value={content}
            onChange={e => setContent(e.target.value)}
            placeholder={isClosed ? "Chat fechado" : "Digite sua mensagem..."}
            disabled={isClosed}
            className="form-field flex-1"
          />
          <button 
            type="submit"
            disabled={!content.trim() || isClosed}
            className="flex h-12 w-12 items-center justify-center rounded-lg bg-template-pink-500 transition-colors hover:bg-template-pink-400 disabled:opacity-50"
            aria-label="Enviar mensagem"
          >
            <Send className="w-5 h-5" />
          </button>
        </form>
      </div>
    </div>
  );
}
