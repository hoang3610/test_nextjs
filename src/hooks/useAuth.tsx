'use client';

import { useSession, signOut, signIn } from 'next-auth/react';
import { useRouter } from 'next/navigation';

interface User {
  name: string;
  role: 'admin' | 'user';
  email?: string;
  image?: string;
  id?: string;
}

interface AuthContextType {
  user: User | null;
  login: (data?: any) => void; // Kept for compatibility, but redirects to login
  logout: () => void;
  isLoading: boolean;
}

// Deprecated: No longer needed as we use SessionProvider
export const AuthProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  return <>{children}</>;
};

export const useAuth = (): AuthContextType => {
  const { data: session, status } = useSession();
  const router = useRouter();

  const user = session?.user ? (session.user as User) : null;
  const isLoading = status === 'loading';

  const login = () => {
    router.push('/login');
  };

  const logout = async () => {
    await signOut({ redirect: true, callbackUrl: '/' });
  };

  return { user, login, logout, isLoading };
};