import { supabase } from './supabase';

export interface User {
  id: string;
  name: string;
  email: string;
  role?: string;
}

const AUTH_KEY = 'terreira_estoque_user';

export const authService = {
  getCurrentUser(): User | null {
    try {
      const saved = localStorage.getItem(AUTH_KEY);
      if (saved) return JSON.parse(saved);
    } catch {
      // ignore
    }
    return null;
  },

  setCurrentUser(user: User): void {
    localStorage.setItem(AUTH_KEY, JSON.stringify(user));
  },

  async logout(): Promise<void> {
    try {
      await supabase.auth.signOut();
    } catch {
      // ignore
    }
    localStorage.removeItem(AUTH_KEY);
  },

  // Supabase Auth Sign In (Email + Password)
  async signInWithSupabase(email: string, password: string): Promise<User> {
    const { data, error } = await supabase.auth.signInWithPassword({
      email: email.trim().toLowerCase(),
      password,
    });

    if (error) {
      if (error.message.includes('Invalid login credentials')) {
        throw new Error('E-mail ou senha incorretos. Verifique suas credenciais ou crie uma conta.');
      }
      if (error.message.includes('Email not confirmed')) {
        throw new Error('E-mail ainda não confirmado. Verifique sua caixa de entrada.');
      }
      throw new Error(error.message);
    }

    const sbUser = data.user;
    const name = sbUser?.user_metadata?.name || sbUser?.email?.split('@')[0] || 'Operador';

    const user: User = {
      id: sbUser?.id || `u-${Date.now()}`,
      email: sbUser?.email || email,
      name,
    };

    this.setCurrentUser(user);
    return user;
  },

  // Supabase Auth Sign Up
  async signUpWithSupabase(email: string, password: string, name?: string): Promise<User> {
    const cleanEmail = email.trim().toLowerCase();
    const displayName = name?.trim() || cleanEmail.split('@')[0];

    const { data, error } = await supabase.auth.signUp({
      email: cleanEmail,
      password,
      options: {
        data: { name: displayName },
      },
    });

    if (error) throw new Error(error.message);

    const sbUser = data.user;
    const user: User = {
      id: sbUser?.id || `u-${Date.now()}`,
      email: sbUser?.email || cleanEmail,
      name: displayName,
    };

    this.setCurrentUser(user);
    return user;
  }
};
