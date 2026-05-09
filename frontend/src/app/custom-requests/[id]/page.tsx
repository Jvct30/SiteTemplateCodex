"use client";

import { useCustomRequestDetails } from "@/hooks/useCustomRequests";
import { useParams } from "next/navigation";
import { useState, useRef, useEffect } from "react";
import { Send } from "lucide-react";
import Link from "next/link";
import toast from "react-hot-toast";

export default function CustomRequestChat() {
  const params = useParams();
  const id = Number(params.id);
  const { request, isLoading, sendMessage } = useCustomRequestDetails(id);
  const [content, setContent] = useState("");
  const endRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    endRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [request?.messages]);

  if (isLoading) return <div className="text-center mt-20">Carregando...</div>;
  if (!request) return <div className="text-center mt-20">Pedido não encontrado.</div>;

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

  return (
    <div className="max-w-3xl mx-auto w-full h-[calc(100vh-160px)] flex flex-col">
      <Link href="/custom-requests" className="text-lunart-pink-400 hover:text-lunart-pink-300 mb-4 inline-block">
        ← Voltar
      </Link>
      
      <div className="glass rounded-t-lg border-b-0 p-4">
        <h1 className="text-xl font-bold">{request.subject}</h1>
        <div className="text-xs text-lunart-white/40">Status: {request.status}</div>
      </div>

      {/* Chat Area */}
      <div className="flex-1 glass border-y-0 overflow-y-auto p-6 flex flex-col gap-4 custom-scrollbar">
        {request.messages.map((msg) => {
          const isCustomer = msg.sender_role === "customer";
          return (
            <div key={msg.id} className={`flex ${isCustomer ? "justify-end" : "justify-start"}`}>
              <div className={`max-w-[80%] rounded-lg p-4 ${
                isCustomer 
                  ? "bg-lunart-purple-600 rounded-tr-sm" 
                  : "bg-lunart-surface-light border border-lunart-purple-500/30 rounded-tl-sm"
              }`}>
                <div className="text-xs text-lunart-white/40 mb-1">
                  {isCustomer ? "Você" : "Lunart Admin"} • {new Date(msg.created_at).toLocaleString('pt-BR')}
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
            placeholder="Digite sua mensagem..."
            className="form-field flex-1"
          />
          <button 
            type="submit"
            disabled={!content.trim()}
            className="flex h-12 w-12 items-center justify-center rounded-lg bg-lunart-pink-500 transition-colors hover:bg-lunart-pink-400 disabled:opacity-50"
            aria-label="Enviar mensagem"
          >
            <Send className="w-5 h-5" />
          </button>
        </form>
      </div>
    </div>
  );
}
