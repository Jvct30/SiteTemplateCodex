"use client";

import { Suspense, useState } from "react";
import { useAuth } from "@/providers/auth-provider";
import api, { getApiErrorMessage, getApiValidationErrors } from "@/lib/api";
import Link from "next/link";
import { useRouter, useSearchParams } from "next/navigation";
import toast from "react-hot-toast";
import { Eye, EyeOff } from "lucide-react";

type RegisterField =
  | "fullName"
  | "username"
  | "email"
  | "password"
  | "cpf"
  | "birthDate";

const backendFieldMap: Record<string, RegisterField> = {
  full_name: "fullName",
  username: "username",
  email: "email",
  password: "password",
  cpf: "cpf",
  birth_date: "birthDate",
};

const registerFieldLabels: Record<RegisterField, string> = {
  fullName: "Nome completo",
  username: "Username",
  email: "Email",
  password: "Senha",
  cpf: "CPF",
  birthDate: "Data de nascimento",
};

const onlyDigits = (value: string) => value.replace(/\D/g, "");

const formatCpf = (value: string) => {
  const digits = onlyDigits(value).slice(0, 11);
  if (digits.length <= 3) return digits;
  if (digits.length <= 6) return `${digits.slice(0, 3)}.${digits.slice(3)}`;
  if (digits.length <= 9) {
    return `${digits.slice(0, 3)}.${digits.slice(3, 6)}.${digits.slice(6)}`;
  }
  return `${digits.slice(0, 3)}.${digits.slice(3, 6)}.${digits.slice(6, 9)}-${digits.slice(9)}`;
};

const formatBirthDate = (value: string) => {
  const digits = onlyDigits(value).slice(0, 8);
  if (digits.length <= 2) return digits;
  if (digits.length <= 4) return `${digits.slice(0, 2)}/${digits.slice(2)}`;
  return `${digits.slice(0, 2)}/${digits.slice(2, 4)}/${digits.slice(4)}`;
};

const parseBirthDate = (value: string) => {
  const digits = onlyDigits(value);
  if (digits.length !== 8) return null;

  const day = Number(digits.slice(0, 2));
  const month = Number(digits.slice(2, 4));
  const year = Number(digits.slice(4, 8));
  const date = new Date(year, month - 1, day);

  if (
    date.getFullYear() !== year ||
    date.getMonth() !== month - 1 ||
    date.getDate() !== day
  ) {
    return null;
  }

  return `${digits.slice(4, 8)}-${digits.slice(2, 4)}-${digits.slice(0, 2)}`;
};

function LoginPageContent() {
  const { login } = useAuth();
  const router = useRouter();
  const searchParams = useSearchParams();
  const isLogin = searchParams.get("mode") !== "register";
  
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [showLoginPassword, setShowLoginPassword] = useState(false);
  const [showRegisterPassword, setShowRegisterPassword] = useState(false);
  const [registerErrors, setRegisterErrors] = useState<Partial<Record<RegisterField, string>>>({});
  
  // Login State
  const [username, setUsername] = useState("");
  const [password, setPassword] = useState("");
  
  // Register State
  const [fullName, setFullName] = useState("");
  const [email, setEmail] = useState("");
  const [cpf, setCpf] = useState("");
  const [birthDate, setBirthDate] = useState("");

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
    if (message.toLowerCase().includes("email")) {
      nextErrors.email = message;
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
    const parsedBirthDate = parseBirthDate(birthDate);
    const cpfDigits = onlyDigits(cpf);

    if (!parsedBirthDate || cpfDigits.length !== 11) {
      setRegisterErrors({
        ...(cpfDigits.length !== 11 ? { cpf: "Digite os 11 números do CPF" } : {}),
        ...(!parsedBirthDate ? { birthDate: "Digite a data completa no formato dd/mm/aaaa" } : {}),
      });
      toast.error("Revise os campos destacados.");
      return;
    }

    try {
      setIsSubmitting(true);
      setRegisterErrors({});
      await api.post("/auth/register", {
        full_name: fullName.trim(),
        username: username.trim(),
        email: email.trim().toLowerCase(),
        password,
        cpf: cpfDigits,
        birth_date: parsedBirthDate,
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
        {isLogin ? "Bem-vindo de volta" : "Criar conta"}
      </h1>
      <p className="mb-8 text-center text-sm text-lunart-white/55">
        {isLogin
          ? "Acesse sua conta para acompanhar pedidos e salvar suas peças favoritas."
          : "Complete seu cadastro; o endereço pode ser criado depois no perfil."}
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
            <div className="relative">
              <input
                type={showLoginPassword ? "text" : "password"}
                required
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                className="form-field pr-12"
              />
              <button
                type="button"
                onClick={() => setShowLoginPassword((value) => !value)}
                className="absolute right-2 top-1/2 -translate-y-1/2 rounded-md p-2 text-lunart-white/60 transition-colors hover:bg-lunart-white/10 hover:text-lunart-white"
                aria-label={showLoginPassword ? "Ocultar senha" : "Mostrar senha"}
              >
                {showLoginPassword ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
              </button>
            </div>
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
        <form onSubmit={handleRegister} className="flex flex-col gap-4">
          <div>
            <label className="block text-sm font-medium mb-1">Nome</label>
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
              <label className="block text-sm font-medium mb-1">Email</label>
              <input
                type="email"
                required
                value={email}
                onChange={e => { setEmail(e.target.value); clearRegisterError("email"); }}
                className={registerInputClass("email")}
              />
              {renderFieldError("email")}
            </div>
          </div>
          <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
            <div>
              <label className="block text-sm font-medium mb-1">Senha</label>
              <div className="relative">
                <input
                  type={showRegisterPassword ? "text" : "password"}
                  required
                  value={password}
                  onChange={e => { setPassword(e.target.value); clearRegisterError("password"); }}
                  className={`${registerInputClass("password")} pr-12`}
                />
                <button
                  type="button"
                  onClick={() => setShowRegisterPassword((value) => !value)}
                  className="absolute right-2 top-1/2 -translate-y-1/2 rounded-md p-2 text-lunart-white/60 transition-colors hover:bg-lunart-white/10 hover:text-lunart-white"
                  aria-label={showRegisterPassword ? "Ocultar senha" : "Mostrar senha"}
                >
                  {showRegisterPassword ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
                </button>
              </div>
              {renderFieldError("password")}
            </div>
            <div>
              <label className="block text-sm font-medium mb-1">CPF</label>
              <input
                type="text"
                inputMode="numeric"
                maxLength={14}
                required
                value={cpf}
                onChange={e => { setCpf(formatCpf(e.target.value)); clearRegisterError("cpf"); }}
                placeholder="000.000.000-00"
                className={registerInputClass("cpf")}
              />
              {renderFieldError("cpf")}
            </div>
          </div>
          <div>
            <label className="block text-sm font-medium mb-1">Data de nascimento</label>
            <input
              type="text"
              inputMode="numeric"
              maxLength={10}
              required
              value={birthDate}
              onChange={(e) => { setBirthDate(formatBirthDate(e.target.value)); clearRegisterError("birthDate"); }}
              placeholder="dd/mm/aaaa"
              className={registerInputClass("birthDate")}
            />
            {renderFieldError("birthDate")}
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
        <Link
          href={isLogin ? "/login?mode=register" : "/login"}
          className="font-medium text-lunart-pink-400 hover:text-lunart-pink-300"
        >
          {isLogin ? "Cadastre-se" : "Faça Login"}
        </Link>
      </div>
    </div>
  );
}

export default function LoginPage() {
  return (
    <Suspense fallback={<div className="mt-20 text-center">Carregando...</div>}>
      <LoginPageContent />
    </Suspense>
  );
}
