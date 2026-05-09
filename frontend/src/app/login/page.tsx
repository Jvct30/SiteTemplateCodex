"use client";

import { useState } from "react";
import { useAuth } from "@/providers/auth-provider";
import api, { getApiErrorMessage } from "@/lib/api";
import { useRouter } from "next/navigation";
import DatePicker from "react-datepicker";
import "react-datepicker/dist/react-datepicker.css";
import { ptBR } from "date-fns/locale/pt-BR";
import toast from "react-hot-toast";

export default function LoginPage() {
  const { login } = useAuth();
  const router = useRouter();
  
  const [isLogin, setIsLogin] = useState(true);
  const [isSubmitting, setIsSubmitting] = useState(false);
  
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
      setIsSubmitting(true);
      const res = await api.post("/auth/login", {
        username: username.trim(),
        password,
      });
      await login(res.data.access_token);
      toast.success("Login realizado com sucesso!");
      router.push("/");
    } catch (error) {
      toast.error(getApiErrorMessage(error, "Erro ao realizar login"));
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleRegister = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      setIsSubmitting(true);
      await api.post("/auth/register", {
        full_name: fullName.trim(),
        username: username.trim(),
        password,
        cpf: cpf.trim(),
        birth_date: birthDate ? birthDate.toISOString().split("T")[0] : "",
        address_street: street.trim(),
        address_number: number.trim(),
        address_complement: complement || null,
        address_neighborhood: neighborhood.trim(),
        address_city: city.trim(),
        address_state: state.trim().toUpperCase(),
        address_zip: zip.trim()
      });
      const res = await api.post("/auth/login", { username: username.trim(), password });
      await login(res.data.access_token);
      toast.success("Cadastro realizado com sucesso!");
      router.push("/");
    } catch (error) {
      toast.error(getApiErrorMessage(error, "Erro ao realizar cadastro"));
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="mx-auto mt-6 w-full max-w-2xl rounded-lg glass p-6 animate-slide-up sm:p-8">
      <h1 className="mb-2 text-center font-display text-3xl font-bold text-transparent bg-clip-text bg-lunart-gradient">
        {isLogin ? "Bem-vindo de volta" : "Criar Conta Estelar"}
      </h1>
      <p className="mb-8 text-center text-sm text-lunart-white/55">
        {isLogin
          ? "Acesse sua conta para acompanhar pedidos e salvar suas peças favoritas."
          : "Complete seus dados para comprar com frete e encomendas sem retrabalho."}
      </p>

      {isLogin ? (
        <form onSubmit={handleLogin} className="flex flex-col gap-4">
          <div>
            <label className="block text-sm font-medium mb-1 text-lunart-white/80">Username</label>
            <input 
              type="text" 
              required
              value={username}
              onChange={(e) => setUsername(e.target.value)}
              className="form-field"
            />
          </div>
          <div>
            <label className="block text-sm font-medium mb-1 text-lunart-white/80">Senha</label>
            <input 
              type="password" 
              required
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              className="form-field"
            />
          </div>
          <button
            type="submit"
            disabled={isSubmitting}
            className="soft-button mt-4 bg-lunart-purple-600 py-3 text-white hover:bg-lunart-purple-500"
          >
            {isSubmitting ? "Entrando..." : "Entrar"}
          </button>
        </form>
      ) : (
        <form onSubmit={handleRegister} className="flex max-h-[68vh] flex-col gap-4 overflow-y-auto px-1 custom-scrollbar">
          <div>
            <label className="block text-sm font-medium mb-1">Nome Completo</label>
            <input type="text" required value={fullName} onChange={e => setFullName(e.target.value)} className="form-field" />
          </div>
          <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
            <div>
              <label className="block text-sm font-medium mb-1">Username</label>
              <input type="text" required value={username} onChange={e => setUsername(e.target.value)} className="form-field" />
            </div>
            <div>
              <label className="block text-sm font-medium mb-1">Senha</label>
              <input type="password" required value={password} onChange={e => setPassword(e.target.value)} className="form-field" />
            </div>
          </div>
          <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
            <div>
              <label className="block text-sm font-medium mb-1">CPF</label>
              <input type="text" required value={cpf} onChange={e => setCpf(e.target.value)} placeholder="000.000.000-00" className="form-field" />
            </div>
            <div>
              <label className="block text-sm font-medium mb-1">Data Nascimento</label>
              <DatePicker 
                selected={birthDate} 
                onChange={(date: Date | null) => setBirthDate(date)} 
                locale={ptBR}
                dateFormat="dd/MM/yyyy"
                placeholderText="dd/mm/aaaa"
                className="form-field"
                wrapperClassName="w-full"
                required
              />
            </div>
          </div>
          
          <h3 className="font-semibold text-lunart-pink-300 mt-2">Endereço</h3>
          <div>
            <label className="block text-sm font-medium mb-1">Rua</label>
            <input type="text" required value={street} onChange={e => setStreet(e.target.value)} className="form-field" />
          </div>
          <div className="grid grid-cols-3 gap-4">
            <div className="col-span-1">
              <label className="block text-sm font-medium mb-1">Número</label>
              <input type="text" required value={number} onChange={e => setNumber(e.target.value)} className="form-field" />
            </div>
            <div className="col-span-2">
              <label className="block text-sm font-medium mb-1">Complemento</label>
              <input type="text" value={complement} onChange={e => setComplement(e.target.value)} className="form-field" />
            </div>
          </div>
          <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
            <div>
              <label className="block text-sm font-medium mb-1">Bairro</label>
              <input type="text" required value={neighborhood} onChange={e => setNeighborhood(e.target.value)} className="form-field" />
            </div>
            <div>
              <label className="block text-sm font-medium mb-1">Cidade</label>
              <input type="text" required value={city} onChange={e => setCity(e.target.value)} className="form-field" />
            </div>
          </div>
          <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
            <div>
              <label className="block text-sm font-medium mb-1">Estado (UF)</label>
              <input type="text" maxLength={2} required value={state} onChange={e => setState(e.target.value.toUpperCase())} className="form-field uppercase" />
            </div>
            <div>
              <label className="block text-sm font-medium mb-1">CEP</label>
              <input type="text" required value={zip} onChange={e => setZip(e.target.value)} className="form-field" />
            </div>
          </div>
          
          <button
            type="submit"
            disabled={isSubmitting}
            className="soft-button mt-4 bg-lunart-purple-600 py-3 text-white hover:bg-lunart-purple-500"
          >
            {isSubmitting ? "Cadastrando..." : "Cadastrar"}
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
