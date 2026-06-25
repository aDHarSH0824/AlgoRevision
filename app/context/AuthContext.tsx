"use client";

import React, { createContext, useContext, useState, useEffect } from "react";
import { useRouter, usePathname } from "next/navigation";
import { api } from "../services/api";

interface User {
  id: string;
  name: string;
  email: string;
  role: string;
}

interface AuthContextType {
  user: User | null;
  token: string | null;
  loading: boolean;
  login: (email: string, password: string) => Promise<void>;
  register: (name: string, email: string, password: string) => Promise<void>;
  googleLogin: (token: string) => Promise<void>;
  logout: () => void;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export function AuthProvider({ children }: { children: React.ReactNode }) {
  const [user, setUser] = useState<User | null>(null);
  const [token, setToken] = useState<string | null>(null);
  const [loading, setLoading] = useState(true);
  const router = useRouter();
  const pathname = usePathname();

  const logout = () => {
    localStorage.removeItem("auth_token");
    setToken(null);
    setUser(null);
    router.push("/");
  };

  useEffect(() => {
    async function loadUser() {
      const storedToken = typeof window !== "undefined" ? localStorage.getItem("auth_token") : null;
      if (storedToken) {
        setToken(storedToken);
        try {
          const res = await api.auth.getMe();
          if (res.status === "success" && res.data?.user) {
            setUser(res.data.user);
          } else {
            logout();
          }
        } catch (err) {
          console.error("Failed to load user info:", err);
          logout();
        }
      }
      setLoading(false);
    }
    loadUser();
  }, []);

  // Simple router guard based on Auth state
  useEffect(() => {
    if (loading) return;

    const publicPaths = ["/"];
    const isPublicPath = publicPaths.includes(pathname);

    if (!user && !isPublicPath) {
      router.push("/");
    } else if (user && isPublicPath) {
      router.push("/dashboard");
    }
  }, [user, pathname, loading, router]);

  const login = async (email: string, password: string) => {
    setLoading(true);
    try {
      const res = await api.auth.login({ email, password });
      if (res.status === "success" && res.data?.token) {
        localStorage.setItem("auth_token", res.data.token);
        setToken(res.data.token);
        setUser(res.data.user);
        router.push("/dashboard");
      }
    } finally {
      setLoading(false);
    }
  };

  const register = async (name: string, email: string, password: string) => {
    setLoading(true);
    try {
      const res = await api.auth.register({ name, email, password });
      if (res.status === "success" && res.data?.token) {
        localStorage.setItem("auth_token", res.data.token);
        setToken(res.data.token);
        setUser(res.data.user);
        router.push("/dashboard");
      }
    } finally {
      setLoading(false);
    }
  };

  const googleLogin = async (googleToken: string) => {
    setLoading(true);
    try {
      const res = await api.auth.googleLogin(googleToken);
      if (res.status === "success" && res.data?.token) {
        localStorage.setItem("auth_token", res.data.token);
        setToken(res.data.token);
        setUser(res.data.user);
        router.push("/dashboard");
      }
    } finally {
      setLoading(false);
    }
  };

  return (
    <AuthContext.Provider value={{ user, token, loading, login, register, googleLogin, logout }}>
      {children}
    </AuthContext.Provider>
  );
}

export function useAuth() {
  const context = useContext(AuthContext);
  if (context === undefined) {
    throw new Error("useAuth must be used within an AuthProvider");
  }
  return context;
}
