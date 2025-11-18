import { createContext, useContext, useState, useEffect, ReactNode } from 'react';
import { useNavigate } from 'react-router-dom';
import { firebaseAuth, AuthUser } from '@/services/firebaseAuth';

interface AuthContextType {
  user: AuthUser | null;
  loading: boolean;
  login: (email: string, password: string) => Promise<void>;
  logout: () => void;
  isAuthenticated: boolean;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export const AuthProvider = ({ children }: { children: ReactNode }) => {
  const [user, setUser] = useState<AuthUser | null>(null);
  const [loading, setLoading] = useState(true);
  const navigate = useNavigate();

  useEffect(() => {
    // Listen to auth state changes
    const unsubscribe = firebaseAuth.onAuthStateChanged((authUser) => {
      setUser(authUser);
      setLoading(false);
    });

    return () => unsubscribe();
  }, []);

  const login = async (email: string, password: string) => {
    try {
      if (import.meta.env.DEV) {
        console.log('🔐 Attempting login for:', email);
      }
      
      const authUser = await firebaseAuth.login(email, password);
      
      if (import.meta.env.DEV) {
        console.log('✅ Login successful:', authUser.email);
      }
      
      setUser(authUser);
      setLoading(false);
      
      // Navigate to dashboard
      setTimeout(() => {
        if (import.meta.env.DEV) {
          console.log('🚀 Navigating to /admin/dashboard');
        }
        navigate('/admin/dashboard', { replace: true });
      }, 100);
    } catch (error: any) {
      setLoading(false);
      
      if (import.meta.env.DEV) {
        console.error('❌ Login failed:', error);
      }
      
      // Re-throw the error so the Login component can handle it
      throw error;
    }
  };

  const logout = async () => {
    try {
      await firebaseAuth.logout();
      setUser(null);
      navigate('/admin/login');
    } catch (error) {
      console.error('Logout error:', error);
      // Still clear user and navigate even if logout fails
      setUser(null);
      navigate('/admin/login');
    }
  };

  return (
    <AuthContext.Provider
      value={{
        user,
        loading,
        login,
        logout,
        isAuthenticated: !!user,
      }}
    >
      {children}
    </AuthContext.Provider>
  );
};

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (context === undefined) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
};
