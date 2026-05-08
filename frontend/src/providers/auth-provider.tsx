"use client";

import { createContext, useContext, useEffect, useState } from "react";
import { UserResponse } from "@/types";
import api from "@/lib/api";

interface AuthContextData {
  user: UserResponse | null;
  isAuthenticated: boolean;
  isLoading: boolean;
  login: (token: string) => Promise<void>;
  logout: () => void;
}

const AuthContext = createContext<AuthContextData>({} as AuthContextData);

export function AuthProvider({ children }: { children: React.ReactNode }) {
  const [user, setUser] = useState<UserResponse | null>(null);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    const loadUser = async () => {
      const token = localStorage.getItem("access_token");
      if (token) {
        try {
          const res = await api.get<UserResponse>("/users/me");
          setUser(res.data);
        } catch (error) {
          console.error("Failed to restore session", error);
          localStorage.removeItem("access_token");
        }
      }
      setIsLoading(false);
    };

    loadUser();
  }, []);

  const login = async (token: string) => {
    localStorage.setItem("access_token", token);
    const res = await api.get<UserResponse>("/users/me");
    setUser(res.data);
  };

  const logout = () => {
    localStorage.removeItem("access_token");
    setUser(null);
  };

  return (
    <AuthContext.Provider
      value={{
        user,
        isAuthenticated: !!user,
        isLoading,
        login,
        logout,
      }}
    >
      {children}
    </AuthContext.Provider>
  );
}

export function useAuth() {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error("useAuth must be used within an AuthProvider");
  }
  return context;
}
