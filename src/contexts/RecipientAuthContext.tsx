import React, { createContext, useContext, useEffect, useState } from "react";

interface RecipientUser {
  email: string;
}

interface RecipientAuthContextType {
  recipient: RecipientUser | null;
  token: string | null;
  loading: boolean;
  setSession: (token: string, email: string) => void;
  signOut: () => void;
}

const RecipientAuthContext = createContext<
  RecipientAuthContextType | undefined
>(undefined);

export const useRecipientAuth = () => {
  const context = useContext(RecipientAuthContext);
  if (!context)
    throw new Error(
      "useRecipientAuth must be used within a RecipientAuthProvider",
    );
  return context;
};

/**
 * Auth context for the recipient mail portal - a fully separate identity
 * from AuthContext (business account owners). Reads/writes only `mail_*`
 * localStorage keys, never `notify_*`, and has no SSO handoff logic since
 * recipients log in directly with a password.
 */
export const RecipientAuthProvider: React.FC<{ children: React.ReactNode }> = ({
  children,
}) => {
  const [recipient, setRecipient] = useState<RecipientUser | null>(null);
  const [token, setToken] = useState<string | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const storedUser = localStorage.getItem("mail_user");
    const storedToken = localStorage.getItem("mail_token");

    if (storedUser && storedToken) {
      try {
        setRecipient(JSON.parse(storedUser));
        setToken(storedToken);
      } catch {
        localStorage.removeItem("mail_user");
        localStorage.removeItem("mail_token");
      }
    }

    setLoading(false);
  }, []);

  const setSession = (newToken: string, email: string) => {
    const user: RecipientUser = { email };
    localStorage.setItem("mail_token", newToken);
    localStorage.setItem("mail_user", JSON.stringify(user));
    setToken(newToken);
    setRecipient(user);
  };

  const signOut = () => {
    setRecipient(null);
    setToken(null);
    localStorage.removeItem("mail_user");
    localStorage.removeItem("mail_token");
    window.location.replace("/mail/login");
  };

  return (
    <RecipientAuthContext.Provider
      value={{ recipient, token, loading, setSession, signOut }}
    >
      {children}
    </RecipientAuthContext.Provider>
  );
};
