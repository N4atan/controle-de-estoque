import React, { useState } from 'react';
import { Flame, User, Mail, LogIn, KeyRound, ShieldCheck, Zap } from 'lucide-react';
import { authService, type User as UserType } from '../services/auth';

interface LoginFormProps {
  onLogin: (user: UserType) => void;
}

export const LoginForm: React.FC<LoginFormProps> = ({ onLogin }) => {
  const [authMode, setAuthMode] = useState<'operator' | 'supabase'>('operator');
  const [name, setName] = useState<string>('');
  const [email, setEmail] = useState<string>('');
  const [password, setPassword] = useState<string>('');
  const [isLoading, setIsLoading] = useState<boolean>(false);
  const [errorMsg, setErrorMsg] = useState<string | null>(null);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setErrorMsg(null);

    if (authMode === 'operator') {
      if (!email.trim() || !name.trim()) {
        alert('Por favor, informe seu Nome e E-mail de Operador.');
        return;
      }
      const user = await authService.loginOperator(email, name);
      onLogin(user);
    } else {
      if (!email.trim() || !password.trim()) {
        alert('Por favor, informe E-mail e Senha.');
        return;
      }
      try {
        setIsLoading(true);
        const user = await authService.signInWithSupabase(email, password, name);
        onLogin(user);
      } catch (err: any) {
        setErrorMsg(err.message || 'Erro ao autenticar no Supabase Auth.');
      } finally {
        setIsLoading(false);
      }
    }
  };

  const handleQuickLogin = async (defaultName: string, defaultEmail: string) => {
    const user = await authService.loginOperator(defaultEmail, defaultName);
    onLogin(user);
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/80 backdrop-blur-md animate-in fade-in duration-300">
      <div className="bg-base-100 border border-base-300 rounded-3xl shadow-2xl max-w-md w-full overflow-hidden">
        {/* Header Banner - Dark Modern Theme */}
        <div className="bg-slate-900 border-b border-slate-800 px-6 py-7 text-white text-center relative overflow-hidden">
          <div className="w-12 h-12 bg-white/10 backdrop-blur-md rounded-2xl mx-auto flex items-center justify-center mb-2 shadow-inner border border-white/10">
            <Flame className="w-7 h-7 text-amber-400" />
          </div>
          <h2 className="text-xl font-extrabold tracking-tight">Controle de Estoque da Terreira</h2>
          <p className="text-xs opacity-70 mt-0.5">Acesso ao Sistema de Suprimentos</p>
        </div>

        {/* Auth Mode Toggle Tabs */}
        <div className="flex border-b border-base-200 bg-base-200/40 p-1">
          <button
            type="button"
            onClick={() => setAuthMode('operator')}
            className={`flex-1 py-2 text-xs font-semibold rounded-lg transition-all flex items-center justify-center gap-1.5 ${
              authMode === 'operator'
                ? 'bg-base-100 text-base-content shadow-xs'
                : 'text-base-content/60 hover:text-base-content'
            }`}
          >
            <User className="w-3.5 h-3.5" /> Acesso Rápido por Operador
          </button>
          <button
            type="button"
            onClick={() => setAuthMode('supabase')}
            className={`flex-1 py-2 text-xs font-semibold rounded-lg transition-all flex items-center justify-center gap-1.5 ${
              authMode === 'supabase'
                ? 'bg-base-100 text-base-content shadow-xs'
                : 'text-base-content/60 hover:text-base-content'
            }`}
          >
            <Zap className="w-3.5 h-3.5 text-emerald-500 fill-emerald-500" /> Supabase Auth (Senha)
          </button>
        </div>

        {/* Form Body */}
        <form onSubmit={handleSubmit} className="p-6 space-y-4">
          {errorMsg && (
            <div className="p-3 bg-rose-500/10 text-rose-600 rounded-xl text-xs font-medium border border-rose-500/20">
              {errorMsg}
            </div>
          )}

          <div className="space-y-1">
            <label className="block text-xs font-semibold text-base-content/80">
              Nome do Operador / Responsável
            </label>
            <div className="relative">
              <User className="w-4 h-4 text-base-content/40 absolute left-3 top-1/2 -translate-y-1/2" />
              <input
                type="text"
                required={authMode === 'operator'}
                placeholder="Ex: Maria Silva ou Ogã Carlos"
                value={name}
                onChange={(e) => setName(e.target.value)}
                className="input input-bordered w-full pl-9 text-sm"
              />
            </div>
          </div>

          <div className="space-y-1">
            <label className="block text-xs font-semibold text-base-content/80">
              E-mail
            </label>
            <div className="relative">
              <Mail className="w-4 h-4 text-base-content/40 absolute left-3 top-1/2 -translate-y-1/2" />
              <input
                type="email"
                required
                placeholder="operador@terreira.com"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                className="input input-bordered w-full pl-9 text-sm"
              />
            </div>
          </div>

          {authMode === 'supabase' && (
            <div className="space-y-1 animate-in fade-in duration-200">
              <label className="block text-xs font-semibold text-base-content/80">
                Senha no Supabase Auth
              </label>
              <div className="relative">
                <KeyRound className="w-4 h-4 text-base-content/40 absolute left-3 top-1/2 -translate-y-1/2" />
                <input
                  type="password"
                  required
                  placeholder="••••••••"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  className="input input-bordered w-full pl-9 text-sm"
                />
              </div>
            </div>
          )}

          <button
            type="submit"
            disabled={isLoading}
            className="btn btn-primary w-full gap-2 shadow-lg shadow-primary/20 text-white font-semibold"
          >
            {isLoading ? (
              <span className="loading loading-spinner loading-xs" />
            ) : (
              <>
                <LogIn className="w-4 h-4" />
                {authMode === 'supabase' ? 'Entrar com Supabase Auth' : 'Entrar no Sistema'}
              </>
            )}
          </button>

          {/* Quick Preset Accounts */}
          {authMode === 'operator' && (
            <div className="pt-3 border-t border-base-200 space-y-2 text-center">
              <span className="text-xs text-base-content/60 font-medium">Acesso Rápido</span>
              <div className="flex gap-2 justify-center">
                <button
                  type="button"
                  onClick={() => handleQuickLogin('Responsável Principal', 'responsavel@terreira.com')}
                  className="btn btn-xs btn-outline btn-neutral"
                >
                  Responsável Principal
                </button>
                <button
                  type="button"
                  onClick={() => handleQuickLogin('Zelador do Estoque', 'zelador@terreira.com')}
                  className="btn btn-xs btn-outline btn-neutral"
                >
                  Zelador do Estoque
                </button>
              </div>
            </div>
          )}
        </form>

        {/* Footer info */}
        <div className="bg-base-200/60 px-6 py-3 border-t border-base-200 flex items-center justify-center gap-1.5 text-xs text-base-content/60">
          <ShieldCheck className="w-4 h-4 text-emerald-500" />
          <span>Acesso Protegido com Registro de Operador</span>
        </div>
      </div>
    </div>
  );
};
