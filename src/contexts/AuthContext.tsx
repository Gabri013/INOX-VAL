/**
 * ============================================================================
 * AUTH CONTEXT
 * ============================================================================
 * 
 * Contexto de autenticação usando Firebase Auth.
 * 
 * Funcionalidades:
 * - Login com email/senha
 * - Logout
 * - Signup (registro)
 * - Reset de senha
 * - Persistência de sessão
 * - Estado do usuário em tempo real
 * 
 * ============================================================================
 */

import { createContext, useContext, useState, useEffect, ReactNode } from 'react';
import {
  signInWithEmailAndPassword,
  createUserWithEmailAndPassword,
  signOut,
  onAuthStateChanged,
  sendPasswordResetEmail,
  updateProfile,
  type User,
} from 'firebase/auth';
import { getFirebaseAuth, isFirebaseConfigured } from '@/lib/firebase';
import { toast } from 'sonner';

interface AuthContextData {
  user: User | null;
  loading: boolean;
  isAuthenticated: boolean;
  login: (email: string, password: string) => Promise<void>;
  signup: (email: string, password: string, nome: string) => Promise<void>;
  logout: () => Promise<void>;
  resetPassword: (email: string) => Promise<void>;
  hasPermission: (module: string) => boolean;
}

const AuthContext = createContext<AuthContextData>({} as AuthContextData);

export function useAuth() {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error('useAuth deve ser usado dentro de AuthProvider');
  }
  return context;
}

interface AuthProviderProps {
  children: ReactNode;
}

export function AuthProvider({ children }: AuthProviderProps) {
  const [user, setUser] = useState<User | null>(null);
  const [loading, setLoading] = useState(true);

  // Monitorar estado de autenticação
  useEffect(() => {
    // Se Firebase não estiver configurado, apenas marcar como não autenticado
    if (!isFirebaseConfigured()) {
      setLoading(false);
      return;
    }

    try {
      const auth = getFirebaseAuth();
      
      if (!auth) {
        setLoading(false);
        return;
      }

      const unsubscribe = onAuthStateChanged(auth, (currentUser) => {
        setUser(currentUser);
        setLoading(false);
      });

      return unsubscribe;
    } catch (error) {
      console.error('Erro ao inicializar autenticação:', error);
      setLoading(false);
    }
  }, []);

  // Login
  const login = async (email: string, password: string) => {
    if (!isFirebaseConfigured()) {
      toast.error('Firebase não configurado. Configure as variáveis de ambiente.');
      throw new Error('Firebase não configurado');
    }

    try {
      const auth = getFirebaseAuth();
      if (!auth) {
        throw new Error('Firebase Auth não disponível');
      }
      
      const result = await signInWithEmailAndPassword(auth, email, password);
      setUser(result.user);
      toast.success('Login realizado com sucesso!');
    } catch (error: any) {
      console.error('Erro ao fazer login:', error);
      
      // Mensagens de erro amigáveis
      let errorMessage = 'Erro ao fazer login';
      
      switch (error.code) {
        case 'auth/user-not-found':
          errorMessage = 'Usuário não encontrado';
          break;
        case 'auth/wrong-password':
          errorMessage = 'Senha incorreta';
          break;
        case 'auth/invalid-email':
          errorMessage = 'Email inválido';
          break;
        case 'auth/user-disabled':
          errorMessage = 'Usuário desativado';
          break;
        case 'auth/too-many-requests':
          errorMessage = 'Muitas tentativas. Tente novamente mais tarde';
          break;
        default:
          errorMessage = error.message || 'Erro ao fazer login';
      }
      
      toast.error(errorMessage);
      throw new Error(errorMessage);
    }
  };

  // Signup
  const signup = async (email: string, password: string, nome: string) => {
    try {
      const auth = getFirebaseAuth();
      const result = await createUserWithEmailAndPassword(auth, email, password);
      
      // Atualizar perfil com nome
      await updateProfile(result.user, { displayName: nome });
      
      setUser(result.user);
      toast.success('Conta criada com sucesso!');
    } catch (error: any) {
      console.error('Erro ao criar conta:', error);
      
      let errorMessage = 'Erro ao criar conta';
      
      switch (error.code) {
        case 'auth/email-already-in-use':
          errorMessage = 'Email já cadastrado';
          break;
        case 'auth/invalid-email':
          errorMessage = 'Email inválido';
          break;
        case 'auth/weak-password':
          errorMessage = 'Senha muito fraca (mínimo 6 caracteres)';
          break;
        case 'auth/operation-not-allowed':
          errorMessage = 'Cadastro não permitido';
          break;
        default:
          errorMessage = error.message || 'Erro ao criar conta';
      }
      
      toast.error(errorMessage);
      throw new Error(errorMessage);
    }
  };

  // Logout
  const logout = async () => {
    if (!isFirebaseConfigured()) {
      // Se Firebase não configurado, apenas limpar estado local
      setUser(null);
      return;
    }

    try {
      const auth = getFirebaseAuth();
      if (!auth) {
        setUser(null);
        return;
      }
      
      await signOut(auth);
      setUser(null);
      toast.success('Logout realizado com sucesso');
    } catch (error: any) {
      console.error('Erro ao fazer logout:', error);
      toast.error('Erro ao fazer logout');
      throw error;
    }
  };

  // Reset de senha
  const resetPassword = async (email: string) => {
    if (!isFirebaseConfigured()) {
      toast.error('Firebase não configurado. Configure as variáveis de ambiente.');
      throw new Error('Firebase não configurado');
    }

    try {
      const auth = getFirebaseAuth();
      if (!auth) {
        throw new Error('Firebase Auth não disponível');
      }
      
      await sendPasswordResetEmail(auth, email);
      toast.success('Email de recuperação enviado!');
    } catch (error: any) {
      console.error('Erro ao enviar email de recuperação:', error);
      
      let errorMessage = 'Erro ao enviar email';
      
      switch (error.code) {
        case 'auth/user-not-found':
          errorMessage = 'Usuário não encontrado';
          break;
        case 'auth/invalid-email':
          errorMessage = 'Email inválido';
          break;
        default:
          errorMessage = error.message || 'Erro ao enviar email';
      }
      
      toast.error(errorMessage);
      throw new Error(errorMessage);
    }
  };

  // Verificar permissão (placeholder para implementação futura)
  const hasPermission = (module: string) => {
    // Implementação futura para verificar permissões do usuário
    return true;
  };

  const value: AuthContextData = {
    user,
    loading,
    isAuthenticated: !!user,
    login,
    signup,
    logout,
    resetPassword,
    hasPermission,
  };

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
}