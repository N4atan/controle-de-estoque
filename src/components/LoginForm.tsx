import React, { useState } from 'react';
import { Mail, LogIn, KeyRound, User, Warehouse, UserPlus, AlertCircle, CheckCircle2 } from 'lucide-react';
import { authService, type User as UserType } from '../services/auth';

interface LoginFormProps {
  onLogin: (user: UserType) => void;
}

export const LoginForm: React.FC<LoginFormProps> = ({ onLogin }) => {
  const [isSignUp, setIsSignUp] = useState<boolean>(false);
  const [name, setName] = useState<string>('');
  const [email, setEmail] = useState<string>('');
  const [password, setPassword] = useState<string>('');
  const [isLoading, setIsLoading] = useState<boolean>(false);
  const [errorMsg, setErrorMsg] = useState<string | null>(null);
  const [successMsg, setSuccessMsg] = useState<string | null>(null);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setErrorMsg(null);
    setSuccessMsg(null);

    if (!email.trim() || !password.trim()) {
      setErrorMsg('Por favor, informe seu e-mail e senha.');
      return;
    }

    try {
      setIsLoading(true);

      if (isSignUp) {
        if (!name.trim()) {
          setErrorMsg('Por favor, informe seu nome de operador/responsável.');
          setIsLoading(false);
          return;
        }

        const user = await authService.signUpWithSupabase(email, password, name);
        setSuccessMsg('Cadastro realizado com sucesso!');
        onLogin(user);
      } else {
        const user = await authService.signInWithSupabase(email, password);
        onLogin(user);
      }
    } catch (err: any) {
      setErrorMsg(err.message || 'Erro ao autenticar com o Supabase.');
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/80 backdrop-blur-md animate-in fade-in duration-300">
      <div className="bg-base-100 border border-base-300 rounded-3xl shadow-2xl max-w-md w-full overflow-hidden">
        {/* Header Banner */}
        <div className="border-b border-base-300 px-6 py-7 text-center relative overflow-hidden bg-base-200/30">
          <div className="w-12 h-12 bg-primary/10 rounded-2xl mx-auto flex items-center justify-center mb-2 shadow-inner border border-primary/20">
            <Warehouse className="w-7 h-7 text-primary" />
          </div>
          <h2 className="text-xl font-extrabold tracking-tight text-base-content">
            Controle de Estoque da Terreira
          </h2>
          <p className="text-xs text-base-content/60 mt-1 font-medium">
            Autenticação segura via Supabase
          </p>
        </div>

        {/* Form Body */}
        <form onSubmit={handleSubmit} className="p-6 space-y-4">
          {errorMsg && (
            <div className="p-3 bg-rose-500/10 text-rose-600 rounded-xl text-xs font-medium border border-rose-500/20 flex items-start gap-2">
              <AlertCircle className="w-4 h-4 shrink-0 mt-0.5" />
              <span>{errorMsg}</span>
            </div>
          )}

          {successMsg && (
            <div className="p-3 bg-emerald-500/10 text-emerald-600 rounded-xl text-xs font-medium border border-emerald-500/20 flex items-start gap-2">
              <CheckCircle2 className="w-4 h-4 shrink-0 mt-0.5" />
              <span>{successMsg}</span>
            </div>
          )}

          {isSignUp && (
            <div className="space-y-1 animate-in fade-in duration-200">
              <label className="block text-xs font-semibold text-base-content/80">
                Nome do Operador / Responsável
              </label>
              <div className="relative">
                <User className="w-4 h-4 text-base-content/40 absolute left-3 top-1/2 -translate-y-1/2" />
                <input
                  type="text"
                  required={isSignUp}
                  placeholder="Ex: Maria Silva ou Ogã Carlos"
                  value={name}
                  onChange={(e) => setName(e.target.value)}
                  className="input input-bordered w-full pl-9 text-sm"
                />
              </div>
            </div>
          )}

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

          <div className="space-y-1">
            <label className="block text-xs font-semibold text-base-content/80">
              Senha
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

          <button
            type="submit"
            disabled={isLoading}
            className="btn btn-primary w-full gap-2 shadow-lg shadow-primary/20 text-white font-semibold mt-2"
          >
            {isLoading ? (
              <span className="loading loading-spinner loading-xs" />
            ) : isSignUp ? (
              <>
                <UserPlus className="w-4 h-4" />
                Cadastrar
              </>
            ) : (
              <>
                <LogIn className="w-4 h-4" />
                Entrar
              </>
            )}
          </button>

          {/* Toggle between Sign In and Sign Up */}
          <div className="pt-3 border-t border-base-200 text-center">
            <button
              type="button"
              onClick={() => {
                setIsSignUp(!isSignUp);
                setErrorMsg(null);
                setSuccessMsg(null);
              }}
              className="text-xs text-primary hover:underline font-medium cursor-pointer"
            >
              {isSignUp
                ? 'Já possui uma conta? Faça login aqui'
                : 'Não tem uma conta? Cadastre-se'}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};
