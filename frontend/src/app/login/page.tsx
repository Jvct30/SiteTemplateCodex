"use client";

import { useState } from "react";
import { useAuth } from "@/providers/auth-provider";
import api, { getApiErrorMessage, getApiValidationErrors } from "@/lib/api";
import { useRouter } from "next/navigation";
import DatePicker from "react-datepicker";
import "react-datepicker/dist/react-datepicker.css";
import { ptBR } from "date-fns/locale/pt-BR";
import toast from "react-hot-toast";

type RegisterField =
  | "fullName"
  | "username"
  | "password"
  | "cpf"
  | "birthDate"
  | "street"
  | "number"
  | "neighborhood"
  | "city"
  | "state"
  | "zip";

const backendFieldMap: Record<string, RegisterField> = {
  full_name: "fullName",
  username: "username",
  password: "password",
  cpf: "cpf",
  birth_date: "birthDate",
  address_street: "street",
  address_number: "number",
  address_neighborhood: "neighborhood",
  address_city: "city",
  address_state: "state",
  address_zip: "zip",
};

const registerFieldLabels: Record<RegisterField, string> = {
  fullName: "Nome completo",
  username: "Username",
  password: "Senha",
  cpf: "CPF",
  birthDate: "Data de nascimento",
  street: "Rua",
  number: "Número",
  neighborhood: "Bairro",
  city: "Cidade",
  state: "Estado",
  zip: "CEP",
};

export default function LoginPage() {
  const { login } = useAuth();
  const router = useRouter();
  
  const [isLogin, setIsLogin] = useState(true);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [registerErrors, setRegisterErrors] = useState<Partial<Record<RegisterField, string>>>({});
  
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

  const clearRegisterError = (field: RegisterField) => {
    setRegisterErrors((current) => {
      if (!current[field]) return current;
      const next = { ...current };
      delete next[field];
      return next;
    });
  };

  const registerInputClass = (field: RegisterField) =>
    registerErrors[field]
      ? "form-field border-red-400/80 bg-red-500/10"
      : "form-field";

  const renderFieldError = (field: RegisterField) =>
    registerErrors[field] ? (
      <p className="mt-1 text-xs font-medium text-red-300">{registerErrors[field]}</p>
    ) : null;

  const mapRegisterErrors = (error: unknown) => {
    const apiErrors = getApiValidationErrors(error);
    const nextErrors: Partial<Record<RegisterField, string>> = {};

    for (const [backendField, message] of Object.entries(apiErrors)) {
      const field = backendFieldMap[backendField];
      if (field) {
        nextErrors[field] = message;
      }
    }

    const message = getApiErrorMessage(error, "Erro ao realizar cadastro");
    if (message.toLowerCase().includes("username")) {
      nextErrors.username = message;
    }
    if (message.toLowerCase().includes("cpf")) {
      nextErrors.cpf = message;
    }

    return { message, nextErrors };
  };

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
      setRegisterErrors({});
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
      const { message, nextErrors } = mapRegisterErrors(error);
      setRegisterErrors(nextErrors);
      const firstErrorField = Object.keys(nextErrors)[0] as RegisterField | undefined;
      toast.error(
        firstErrorField
          ? `Revise o campo ${registerFieldLabels[firstErrorField]}.`
          : message
      );
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
            <input type="text" required value={fullName} onChange={e => { setFullName(e.target.value); clearRegisterError("fullName"); }} className={registerInputClass("fullName")} />
            {renderFieldError("fullName")}
          </div>
          <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
            <div>
              <label className="block text-sm font-medium mb-1">Username</label>
              <input type="text" required value={username} onChange={e => { setUsername(e.target.value); clearRegisterError("username"); }} className={registerInputClass("username")} />
              {renderFieldError("username")}
            </div>
            <div>
              <label className="block text-sm font-medium mb-1">Senha</label>
              <input type="password" required value={password} onChange={e => { setPassword(e.target.value); clearRegisterError("password"); }} className={registerInputClass("password")} />
              {renderFieldError("password")}
            </div>
          </div>
          <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
            <div>
              <label className="block text-sm font-medium mb-1">CPF</label>
              <input type="text" required value={cpf} onChange={e => { setCpf(e.target.value); clearRegisterError("cpf"); }} placeholder="000.000.000-00" className={registerInputClass("cpf")} />
              {renderFieldError("cpf")}
            </div>
            <div>
              <label className="block text-sm font-medium mb-1">Data Nascimento</label>
              <DatePicker 
                selected={birthDate} 
                onChange={(date: Date | null) => { setBirthDate(date); clearRegisterError("birthDate"); }} 
                locale={ptBR}
                dateFormat="dd/MM/yyyy"
                placeholderText="dd/mm/aaaa"
                className={registerInputClass("birthDate")}
                wrapperClassName="w-full"
                required
              />
              {renderFieldError("birthDate")}
            </div>
          </div>
          
          <h3 className="font-semibold text-lunart-pink-300 mt-2">Endereço</h3>
          <div>
            <label className="block text-sm font-medium mb-1">Rua</label>
            <input type="text" required value={street} onChange={e => { setStreet(e.target.value); clearRegisterError("street"); }} className={registerInputClass("street")} />
            {renderFieldError("street")}
          </div>
          <div className="grid grid-cols-3 gap-4">
            <div className="col-span-1">
              <label className="block text-sm font-medium mb-1">Número</label>
              <input type="text" required value={number} onChange={e => { setNumber(e.target.value); clearRegisterError("number"); }} className={registerInputClass("number")} />
              {renderFieldError("number")}
            </div>
            <div className="col-span-2">
              <label className="block text-sm font-medium mb-1">Complemento</label>
              <input type="text" value={complement} onChange={e => setComplement(e.target.value)} className="form-field" />
            </div>
          </div>
          <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
            <div>
              <label className="block text-sm font-medium mb-1">Bairro</label>
              <input type="text" required value={neighborhood} onChange={e => { setNeighborhood(e.target.value); clearRegisterError("neighborhood"); }} className={registerInputClass("neighborhood")} />
              {renderFieldError("neighborhood")}
            </div>
            <div>
              <label className="block text-sm font-medium mb-1">Cidade</label>
              <input type="text" required value={city} onChange={e => { setCity(e.target.value); clearRegisterError("city"); }} className={registerInputClass("city")} />
              {renderFieldError("city")}
            </div>
          </div>
          <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
            <div>
              <label className="block text-sm font-medium mb-1">Estado (UF)</label>
              <input type="text" maxLength={2} required value={state} onChange={e => { setState(e.target.value.toUpperCase()); clearRegisterError("state"); }} className={`${registerInputClass("state")} uppercase`} />
              {renderFieldError("state")}
            </div>
            <div>
              <label className="block text-sm font-medium mb-1">CEP</label>
              <input type="text" required value={zip} onChange={e => { setZip(e.target.value); clearRegisterError("zip"); }} className={registerInputClass("zip")} />
              {renderFieldError("zip")}
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
