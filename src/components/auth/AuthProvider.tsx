"use client";

import {
  createContext,
  useCallback,
  useContext,
  useEffect,
  useMemo,
  useState,
} from "react";
import { usePathname } from "next/navigation";
import {
  fetchSession,
  getStoredToken,
  userFromToken,
  type SessionUser,
} from "@/lib/api";

type AuthContextValue = {
  user: SessionUser | null;
  loading: boolean;
  refresh: () => Promise<void>;
  setUser: (user: SessionUser | null) => void;
};

const AuthContext = createContext<AuthContextValue | null>(null);

export function AuthProvider({ children }: { children: React.ReactNode }) {
  const pathname = usePathname();
  const [user, setUser] = useState<SessionUser | null>(null);
  const [loading, setLoading] = useState(true);

  const refresh = useCallback(async () => {
    const token = getStoredToken();
    if (token) {
      const local = userFromToken(token);
      if (local) {
        setUser(local);
        setLoading(false);
      }
    }

    const session = await fetchSession();
    setUser(session);
    setLoading(false);
  }, []);

  useEffect(() => {
    void refresh();
    const onAuth = () => {
      void refresh();
    };
    window.addEventListener("aureon-auth", onAuth);
    window.addEventListener("storage", onAuth);
    window.addEventListener("focus", onAuth);
    return () => {
      window.removeEventListener("aureon-auth", onAuth);
      window.removeEventListener("storage", onAuth);
      window.removeEventListener("focus", onAuth);
    };
  }, [refresh]);

  useEffect(() => {
    void refresh();
  }, [pathname, refresh]);

  const value = useMemo(
    () => ({ user, loading, refresh, setUser }),
    [user, loading, refresh],
  );

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
}

export function useAuth() {
  const ctx = useContext(AuthContext);
  if (!ctx) {
    throw new Error("useAuth must be used within AuthProvider");
  }
  return ctx;
}
