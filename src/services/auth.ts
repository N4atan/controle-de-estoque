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

  // 1. Direct Operator Login (No password required for internal shared operators)
  async loginOperator(email: string, name: string): Promise<User> {
    const user: User = {
      id: `u-${Date.now()}`,
      email: email.trim().toLowerCase(),
      name: name.trim() || email.split('@')[0],
    };
    this.setCurrentUser(user);
    return user;
  },

  // 2. Official Supabase Auth Sign In (Email + Password)
  async signInWithSupabase(email: string, password: string, operatorName?: string): Promise<User> {
    const { data, error } = await supabase.auth.signInWithPassword({
      email: email.trim().toLowerCase(),
      password,
    });

    if (error) {
      // If user doesn't exist, try auto-signup on Supabase
      if (error.message.includes('Invalid login credentials')) {
        return this.signUpWithSupabase(email, password, operatorName || email.split('@')[0]);
      }
      throw new Error(error.message);
    }

    const sbUser = data.user;
    const name = sbUser?.user_metadata?.name || operatorName || email.split('@')[0];

    const user: User = {
      id: sbUser?.id || `u-${Date.now()}`,
      email: sbUser?.email || email,
      name,
    };

    this.setCurrentUser(user);
    return user;
  },

  // 3. Official Supabase Auth Sign Up
  async signUpWithSupabase(email: string, password: string, name: string): Promise<User> {
    const { data, error } = await supabase.auth.signUp({
      email: email.trim().toLowerCase(),
      password,
      options: {
        data: { name },
      },
    });

    if (error) throw new Error(error.message);

    const user: User = {
      id: data.user?.id || `u-${Date.now()}`,
      email: data.user?.email || email,
      name,
    };

    this.setCurrentUser(user);
    return user;
  }
};
