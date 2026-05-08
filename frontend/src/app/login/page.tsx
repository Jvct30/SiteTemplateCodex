"use client";

import { useState } from "react";
import { useAuth } from "@/providers/auth-provider";
import api from "@/lib/api";
import { useRouter } from "next/navigation";
import DatePicker from "react-datepicker";
import "react-datepicker/dist/react-datepicker.css";
import { ptBR } from 'date-fns/locale/pt-BR';
import toast from "react-hot-toast";

export default function LoginPage() {
  const { login } = useAuth();
  const router = useRouter();
  
  const [isLogin, setIsLogin] = useState(true);
  const [isLogin, setIsLogin] = useState(true);
  
  // Login State
  const [username, setUsername] = useState("");
  const [password, setPassword] = useState("");
  
  // Register State
  const [fullName, setFullName] = useState("");
  const [cpf, setCpf] = useState("");
  const [birthDate, setBirthDate] = useState<Date | null>(null);
  const [street, setStreet] = useState("");
  const [number, setNumber] = useState("");
  const [complement, setComplement] = useState("");
  const [neighborhood, setNeighborhood] = useState("");
  const [city, setCity] = useState("");
  const [state, setState] = useState("");
  const [zip, setZip] = useState("");

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      const res = await api.post("/auth/login", { username, password });
      await login(res.data.access_token);
      toast.success("Login realizado com sucesso!");
      router.push("/");
    } catch (err: any) {
      toast.error(err.response?.data?.detail || "Erro ao realizar login");
    }
  };

  const handleRegister = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      await api.post("/auth/register", {
        full_name: fullName,
        username,
        password,
        cpf,
        birth_date: birthDate ? birthDate.toISOString().split("T")[0] : "",
        address_street: street,
        address_number: number,
        address_complement: complement || null,
        address_neighborhood: neighborhood,
        address_city: city,
        address_state: state,
        address_zip: zip
      });
      // After register, login
      const res = await api.post("/auth/login", { username, password });
      await login(res.data.access_token);
      toast.success("Cadastro realizado com sucesso!");
      router.push("/");
    } catch (err: any) {
      toast.error(err.response?.data?.detail || "Erro ao realizar cadastro");
    }
  };

  return (
    <div className="max-w-md w-full mx-auto mt-10 glass p-8 rounded-3xl animate-slide-up">
      <h1 className="text-3xl font-display font-bold text-center mb-6 text-transparent bg-clip-text bg-lunart-gradient">
        {isLogin ? "Bem-vindo de volta" : "Criar Conta Estelar"}
      </h1>

      {isLogin ? (
        <form onSubmit={handleLogin} className="flex flex-col gap-4">
          <div>
            <label className="block text-sm font-medium mb-1 text-lunart-white/80">Username</label>
            <input 
              type="text" 
              required
              value={username}
              onChange={(e) => setUsername(e.target.value)}
              className="w-full bg-lunart-surface-light border border-lunart-purple-500/30 rounded-xl px-4 py-2 focus:outline-none focus:border-lunart-pink-400"
            />
          </div>
          <div>
            <label className="block text-sm font-medium mb-1 text-lunart-white/80">Senha</label>
            <input 
              type="password" 
              required
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              className="w-full bg-lunart-surface-light border border-lunart-purple-500/30 rounded-xl px-4 py-2 focus:outline-none focus:border-lunart-pink-400"
            />
          </div>
          <button type="submit" className="mt-4 bg-lunart-purple-600 hover:bg-lunart-purple-500 py-3 rounded-xl font-bold transition-colors">
            Entrar
          </button>
        </form>
      ) : (
        <form onSubmit={handleRegister} className="flex flex-col gap-4 max-h-[60vh] overflow-y-auto px-2 custom-scrollbar">
          <div>
            <label className="block text-sm font-medium mb-1">Nome Completo</label>
            <input type="text" required value={fullName} onChange={e => setFullName(e.target.value)} className="w-full bg-lunart-surface-light border border-lunart-purple-500/30 rounded-xl px-4 py-2" />
          </div>
          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium mb-1">Username</label>
              <input type="text" required value={username} onChange={e => setUsername(e.target.value)} className="w-full bg-lunart-surface-light border border-lunart-purple-500/30 rounded-xl px-4 py-2" />
            </div>
            <div>
              <label className="block text-sm font-medium mb-1">Senha</label>
              <input type="password" required value={password} onChange={e => setPassword(e.target.value)} className="w-full bg-lunart-surface-light border border-lunart-purple-500/30 rounded-xl px-4 py-2" />
            </div>
          </div>
          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium mb-1">CPF</label>
              <input type="text" required value={cpf} onChange={e => setCpf(e.target.value)} placeholder="000.000.000-00" className="w-full bg-lunart-surface-light border border-lunart-purple-500/30 rounded-xl px-4 py-2" />
            </div>
            <div>
              <label className="block text-sm font-medium mb-1">Data Nascimento</label>
              <DatePicker 
                selected={birthDate} 
                onChange={(date) => setBirthDate(date)} 
                locale={ptBR}
                dateFormat="dd/MM/yyyy"
                placeholderText="dd/mm/aaaa"
                className="w-full bg-lunart-surface-light border border-lunart-purple-500/30 rounded-xl px-4 py-2 focus:outline-none focus:border-lunart-pink-400"
                wrapperClassName="w-full"
                required
              />
            </div>
          </div>
          
          <h3 className="font-semibold text-lunart-pink-300 mt-2">Endereço</h3>
          <div>
            <label className="block text-sm font-medium mb-1">Rua</label>
            <input type="text" required value={street} onChange={e => setStreet(e.target.value)} className="w-full bg-lunart-surface-light border border-lunart-purple-500/30 rounded-xl px-4 py-2" />
          </div>
          <div className="grid grid-cols-3 gap-4">
            <div className="col-span-1">
              <label className="block text-sm font-medium mb-1">Número</label>
              <input type="text" required value={number} onChange={e => setNumber(e.target.value)} className="w-full bg-lunart-surface-light border border-lunart-purple-500/30 rounded-xl px-4 py-2" />
            </div>
            <div className="col-span-2">
              <label className="block text-sm font-medium mb-1">Complemento</label>
              <input type="text" value={complement} onChange={e => setComplement(e.target.value)} className="w-full bg-lunart-surface-light border border-lunart-purple-500/30 rounded-xl px-4 py-2" />
            </div>
          </div>
          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium mb-1">Bairro</label>
              <input type="text" required value={neighborhood} onChange={e => setNeighborhood(e.target.value)} className="w-full bg-lunart-surface-light border border-lunart-purple-500/30 rounded-xl px-4 py-2" />
            </div>
            <div>
              <label className="block text-sm font-medium mb-1">Cidade</label>
              <input type="text" required value={city} onChange={e => setCity(e.target.value)} className="w-full bg-lunart-surface-light border border-lunart-purple-500/30 rounded-xl px-4 py-2" />
            </div>
          </div>
          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium mb-1">Estado (UF)</label>
              <input type="text" maxLength={2} required value={state} onChange={e => setState(e.target.value)} className="w-full bg-lunart-surface-light border border-lunart-purple-500/30 rounded-xl px-4 py-2 uppercase" />
            </div>
            <div>
              <label className="block text-sm font-medium mb-1">CEP</label>
              <input type="text" required value={zip} onChange={e => setZip(e.target.value)} className="w-full bg-lunart-surface-light border border-lunart-purple-500/30 rounded-xl px-4 py-2" />
            </div>
          </div>
          
          <button type="submit" className="mt-4 bg-lunart-purple-600 hover:bg-lunart-purple-500 py-3 rounded-xl font-bold transition-colors">
            Cadastrar
          </button>
        </form>
      )}

      <div className="mt-6 text-center text-sm text-lunart-white/60">
        {isLogin ? "Não possui uma conta?" : "Já possui uma conta?"}{" "}
        <button 
          onClick={() => setIsLogin(!isLogin)}
          className="text-lunart-pink-400 hover:text-lunart-pink-300 font-medium"
        >
          {isLogin ? "Cadastre-se" : "Faça Login"}
        </button>
      </div>
    </div>
  );
}
