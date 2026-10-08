import { createClient } from '@supabase/supabase-js';

const supabaseUrl = import.meta.env.VITE_SUPABASE_URL || 'https://bhhwlujelzccrwcjxwjy.supabase.co';
const supabaseAnonKey = import.meta.env.VITE_SUPABASE_ANON_KEY || 'sb_publishable_ImTd7UQvnMmkNUFd5a6UTg_ognKmW-J';

export const supabase = createClient(supabaseUrl, supabaseAnonKey, {
  auth: {
    persistSession: true,
    autoRefreshToken: true,
  },
  realtime: {
    params: {
      eventsPerSecond: 10,
    },
  },
});

export interface SupabaseStatusResponse {
  connected: boolean;
  message: string;
  url?: string;
}

export async function checkSupabaseStatus(): Promise<SupabaseStatusResponse> {
  try {
    const { error } = await supabase.from('categories').select('count', { count: 'exact', head: true });
    if (error && error.code !== 'PGRST116') {
      // PGRST116 means table does not exist yet, which is okay before init
      if (error.message.includes('FetchError') || error.message.includes('Failed to fetch')) {
        return {
          connected: false,
          message: `Erro de rede ao conectar ao Supabase: ${error.message}`,
        };
      }
    }
    return {
      connected: true,
      message: 'Conectado com sucesso ao Supabase Realtime PostgreSQL!',
      url: supabaseUrl,
    };
  } catch (err: any) {
    return {
      connected: false,
      message: `Erro ao conectar ao Supabase: ${err?.message || String(err)}`,
    };
  }
}
