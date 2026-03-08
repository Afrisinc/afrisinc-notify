import React, { createContext, useContext, useEffect, useState } from "react";
import { getRuntimeConfig } from "@/lib/config";
import { clearThemeCookie } from "@/lib/theme";

interface NotifyUser {
  id: string;
  email: string;
  firstName?: string;
  lastName?: string;
}

interface AuthContextType {
  user: NotifyUser | null;
  token: string | null;
  loading: boolean;
  signOut: () => void;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (!context) throw new Error("useAuth must be used within an AuthProvider");
  return context;
};

/**
 * Decode a JWT payload without a library.
 * Returns null if the token is malformed.
 */
function decodeJwtPayload(token: string): Record<string, unknown> | null {
  try {
    const payloadB64 = token.split(".")[1];
    const decoded = atob(payloadB64.replace(/-/g, "+").replace(/_/g, "/"));
    return JSON.parse(decoded);
  } catch {
    return null;
  }
}

export const AuthProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [user, setUser] = useState<NotifyUser | null>(null);
  const [token, setToken] = useState<string | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    // ── 1. Check for token handed back from auth-ui via ?_at= ──────────────────
    const urlParams = new URLSearchParams(window.location.search);
    const incomingToken = urlParams.get("_at");

    if (incomingToken) {
      const payload = decodeJwtPayload(incomingToken);
      if (payload) {
        const notifyUser: NotifyUser = {
          id: String(payload.user_id ?? payload.sub ?? payload.id ?? ""),
          email: String(payload.email ?? payload.username ?? ""),
          firstName: payload.firstName ? String(payload.firstName) : undefined,
          lastName: payload.lastName ? String(payload.lastName) : undefined,
        };

        setUser(notifyUser);
        setToken(incomingToken);
        localStorage.setItem("notify_user", JSON.stringify(notifyUser));
        localStorage.setItem("notify_token", incomingToken);

        // Strip _at from the URL so it doesn't appear in browser history
        urlParams.delete("_at");
        const cleanSearch = urlParams.toString();
        const cleanUrl = `${window.location.pathname}${cleanSearch ? "?" + cleanSearch : ""}`;
        window.history.replaceState({}, "", cleanUrl);
      }
      setLoading(false);
      return;
    }

    // ── 2. Rehydrate from localStorage ─────────────────────────────────────────
    const storedUser = localStorage.getItem("notify_user");
    const storedToken = localStorage.getItem("notify_token");

    if (storedUser && storedToken) {
      try {
        setUser(JSON.parse(storedUser));
        setToken(storedToken);
      } catch {
        localStorage.removeItem("notify_user");
        localStorage.removeItem("notify_token");
      }
    }

    setLoading(false);
  }, []);

  const signOut = () => {
    setUser(null);
    setToken(null);
    localStorage.removeItem("notify_user");
    localStorage.removeItem("notify_token");

    // Clear theme cookie on logout
    clearThemeCookie();

    // Redirect to auth-ui login
    try {
      const { authUiUrl } = getRuntimeConfig();
      const target = authUiUrl || window.location.origin;
      window.location.replace(`${target}/login`);
    } catch {
      window.location.replace("/login");
    }
  };

  return (
    <AuthContext.Provider value={{ user, token, loading, signOut }}>
      {children}
    </AuthContext.Provider>
  );
};
