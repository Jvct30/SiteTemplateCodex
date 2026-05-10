"use client";

import { useAuth } from "@/providers/auth-provider";
import { useCustomRequests } from "@/hooks/useCustomRequests";
import Link from "next/link";
import { useState } from "react";
import { Plus, MessageSquare } from "lucide-react";
import toast from "react-hot-toast";
import { formatDateTime } from "@/lib/dates";

export default function CustomRequestsPage() {
  const { isAuthenticated, isLoading: authLoading } = useAuth();
  const { requests, isLoading, createRequest } = useCustomRequests();
  const [isCreating, setIsCreating] = useState(false);
  const [statusFilter, setStatusFilter] = useState<"open" | "closed" | "cancelled">("open");
  const [subject, setSubject] = useState("");
  const [message, setMessage] = useState("");

  if (authLoading) return null;
  if (!isAuthenticated) {
    return (
      <div className="mx-auto mt-20 max-w-lg rounded-lg glass p-8 text-center">
        <h1 className="mb-3 text-2xl font-bold">Entre para criar encomendas</h1>
        <p className="mb-6 text-template-white/60">
          Pedidos personalizados precisam de uma conta para manter o histórico do chat.
        </p>
        <Link href="/login" className="soft-button bg-template-purple-600 text-white hover:bg-template-purple-500">
          Fazer login
        </Link>
      </div>
    );
  }

  const handleCreate = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      await createRequest({ subject, message });
      setIsCreating(false);
      setSubject("");
      setMessage("");
      toast.success("Pedido criado com sucesso!");
    } catch {
      toast.error("Erro ao criar pedido.");
    }
  };

  const filteredRequests = requests?.filter((req) => {
    if (statusFilter === "closed") return req.status === "closed";
    if (statusFilter === "cancelled") return req.status === "cancelled";
    return !["closed", "cancelled"].includes(req.status);
  });

  return (
    <div className="max-w-4xl mx-auto w-full">
      <div className="mb-8 flex flex-col justify-between gap-4 sm:flex-row sm:items-center">
        <h1 className="text-3xl font-display font-bold">Pedidos Sob Encomenda</h1>
        <button 
          onClick={() => setIsCreating(!isCreating)}
          className="soft-button gap-2 bg-template-purple-600 text-white hover:bg-template-purple-500"
        >
          <Plus className="w-5 h-5" /> Novo Pedido
        </button>
      </div>

      <div className="mb-6 flex flex-wrap gap-2">
        {[
          { value: "open", label: "Abertos" },
          { value: "closed", label: "Finalizados" },
          { value: "cancelled", label: "Cancelados" },
        ].map((item) => (
          <button
            key={item.value}
            type="button"
            onClick={() => setStatusFilter(item.value as typeof statusFilter)}
            className={`soft-button ${
              statusFilter === item.value
                ? "bg-template-purple-600 text-white"
                : "bg-template-surface-light text-template-white/70 hover:text-white"
            }`}
          >
            {item.label}
          </button>
        ))}
      </div>

      {isCreating && (
        <form onSubmit={handleCreate} className="glass mb-8 rounded-lg p-6 animate-slide-up">
          <h2 className="text-xl font-bold mb-4">Descreva sua ideia</h2>
          <div className="flex flex-col gap-4">
            <input 
              type="text" 
              required
              placeholder="Assunto (ex: Colar de Lua de Quartzo)"
              value={subject}
              onChange={e => setSubject(e.target.value)}
              className="form-field"
            />
            <textarea 
              required
              placeholder="Descreva detalhadamente o que você deseja..."
              value={message}
              onChange={e => setMessage(e.target.value)}
              rows={4}
              className="form-field"
            />
            <div className="flex justify-end gap-2">
              <button type="button" onClick={() => setIsCreating(false)} className="soft-button hover:bg-template-surface-light">Cancelar</button>
              <button type="submit" className="soft-button bg-template-pink-500 text-white hover:bg-template-pink-400">Enviar Pedido</button>
            </div>
          </div>
        </form>
      )}

      {isLoading ? (
        <div className="text-center">Carregando...</div>
      ) : filteredRequests?.length === 0 ? (
        <div className="text-center text-template-white/60 py-12 glass rounded-lg">
          Nenhum pedido encontrado neste filtro.
        </div>
      ) : (
        <div className="grid grid-cols-1 gap-4">
          {filteredRequests?.map((req) => (
            <Link 
              href={`/custom-requests/${req.id}`} 
              key={req.id}
              className="glass flex flex-col gap-4 rounded-lg p-5 transition-colors hover:border-template-pink-400 sm:flex-row sm:items-center sm:justify-between"
            >
              <div>
                <h3 className="font-bold text-lg">{req.subject}</h3>
                <span className="text-xs text-template-white/40">{formatDateTime(req.created_at)}</span>
              </div>
              <div className="flex items-center gap-4">
                <span className={`px-3 py-1 rounded-full text-xs font-bold ${
                  req.status === 'open' ? 'bg-blue-500/20 text-blue-300' :
                  req.status === 'answered' ? 'bg-green-500/20 text-green-300' :
                  'bg-template-surface-light'
                }`}>
                  {req.status.toUpperCase()}
                </span>
                <MessageSquare className="w-5 h-5 text-template-white/60" />
              </div>
            </Link>
          ))}
        </div>
      )}
    </div>
  );
}
