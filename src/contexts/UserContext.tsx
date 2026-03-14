import React, { createContext, useContext, ReactNode } from 'react';
import { useAuth } from '@/contexts/AuthContext';
import { useUserProfile } from '@/hooks/useAuth';

export interface Account {
  id: string;
  type: string;
  organizationId: string;
  createdAt: string;
}

export interface UserProfile {
  user_id: string;
  email: string;
  firstName?: string;
  lastName?: string;
  phone?: string;
  location?: string;
  email_verified?: boolean;
  status?: string;
  createdAt?: string;
  accounts?: Account[];
}

interface UserContextType {
  profile: UserProfile | null;
  loading: boolean;
  error?: string;
  getAccountIdForOrg: (orgId: string) => string | null;
}

const UserContext = createContext<UserContextType | undefined>(undefined);

export function UserProvider({ children }: { children: ReactNode }) {
  const { user, loading: authLoading } = useAuth();
  const { data: profileData, isLoading: profileLoading, error: profileError } = useUserProfile({
    enabled: !!user && !authLoading,
  });

  const profile = profileData?.data || null;
  const loading = authLoading || profileLoading;
  const error = profileError ? (profileError as any).message : undefined;

  /**
   * Get account ID for a given organization ID
   * Used for sending x-account-id header when creating apps
   */
  const getAccountIdForOrg = (orgId: string): string | null => {
    if (!profile?.accounts) return null;
    const account = profile.accounts.find((acc: Account) => acc.organizationId === orgId);
    return account?.id || null;
  };

  return (
    <UserContext.Provider value={{ profile, loading, error, getAccountIdForOrg }}>
      {children}
    </UserContext.Provider>
  );
}

export function useUser() {
  const context = useContext(UserContext);
  if (!context) {
    throw new Error('useUser must be used within UserProvider');
  }
  return context;
}
