"use client";

import { useAuth } from "@/providers/auth-provider";
import { useCustomRequests } from "@/hooks/useCustomRequests";
import Link from "next/link";
import { useState } from "react";
import { Plus, MessageSquare } from "lucide-react";

export default function CustomRequestsPage() {
  const { isAuthenticated, isLoading: authLoading } = useAuth();
  const { requests, isLoading, createRequest } = useCustomRequests();
  const [isCreating, setIsCreating] = useState(false);
  const [subject, setSubject] = useState("");
  const [message, setMessage] = useState("");

  if (authLoading) return null;
  if (!isAuthenticated) {
    return <div className="text-center mt-20">Você precisa estar logado para ver seus pedidos sob encomenda. <Link href="/login" className="text-lunart-pink-400">Fazer login</Link></div>;
  }

  const handleCreate = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      await createRequest({ subject, message });
      setIsCreating(false);
      setSubject("");
      setMessage("");
    } catch (err) {
      alert("Erro ao criar pedido.");
    }
  };

  return (
    <div className="max-w-4xl mx-auto w-full">
      <div className="flex justify-between items-center mb-8">
        <h1 className="text-3xl font-display font-bold">Pedidos Sob Encomenda</h1>
        <button 
          onClick={() => setIsCreating(!isCreating)}
          className="flex items-center gap-2 bg-lunart-purple-600 hover:bg-lunart-purple-500 px-4 py-2 rounded-full font-medium transition-colors"
        >
          <Plus className="w-5 h-5" /> Novo Pedido
        </button>
      </div>

      {isCreating && (
        <form onSubmit={handleCreate} className="glass p-6 rounded-2xl mb-8 animate-slide-up">
          <h2 className="text-xl font-bold mb-4">Descreva sua ideia</h2>
          <div className="flex flex-col gap-4">
            <input 
              type="text" 
              required
              placeholder="Assunto (ex: Colar de Lua de Quartzo)"
              value={subject}
              onChange={e => setSubject(e.target.value)}
              className="w-full bg-lunart-surface-light border border-lunart-purple-500/30 rounded-xl px-4 py-3 focus:outline-none focus:border-lunart-pink-400"
            />
            <textarea 
              required
              placeholder="Descreva detalhadamente o que você deseja..."
              value={message}
              onChange={e => setMessage(e.target.value)}
              rows={4}
              className="w-full bg-lunart-surface-light border border-lunart-purple-500/30 rounded-xl px-4 py-3 focus:outline-none focus:border-lunart-pink-400"
            />
            <div className="flex justify-end gap-2">
              <button type="button" onClick={() => setIsCreating(false)} className="px-4 py-2 hover:bg-lunart-surface-light rounded-xl">Cancelar</button>
              <button type="submit" className="bg-lunart-pink-500 hover:bg-lunart-pink-400 px-6 py-2 rounded-xl font-bold transition-colors">Enviar Pedido</button>
            </div>
          </div>
        </form>
      )}

      {isLoading ? (
        <div className="text-center">Carregando...</div>
      ) : requests?.length === 0 ? (
        <div className="text-center text-lunart-white/60 py-12 glass rounded-2xl">
          Você ainda não fez nenhum pedido customizado.
        </div>
      ) : (
        <div className="grid grid-cols-1 gap-4">
          {requests?.map((req) => (
            <Link 
              href={`/custom-requests/${req.id}`} 
              key={req.id}
              className="glass p-5 rounded-2xl flex items-center justify-between hover:border-lunart-pink-400 transition-colors"
            >
              <div>
                <h3 className="font-bold text-lg">{req.subject}</h3>
                <span className="text-xs text-lunart-white/40">{new Date(req.created_at).toLocaleString('pt-BR')}</span>
              </div>
              <div className="flex items-center gap-4">
                <span className={`px-3 py-1 rounded-full text-xs font-bold ${
                  req.status === 'open' ? 'bg-blue-500/20 text-blue-300' :
                  req.status === 'answered' ? 'bg-green-500/20 text-green-300' :
                  'bg-lunart-surface-light'
                }`}>
                  {req.status.toUpperCase()}
                </span>
                <MessageSquare className="w-5 h-5 text-lunart-white/60" />
              </div>
            </Link>
          ))}
        </div>
      )}
    </div>
  );
}
