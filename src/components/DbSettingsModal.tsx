import React, { useState } from 'react';
import { Database, RefreshCw, CheckCircle, AlertTriangle, Zap } from 'lucide-react';
import type { SupabaseStatusResponse } from '../services/api';

interface DbSettingsModalProps {
  isOpen: boolean;
  onClose: () => void;
  dbStatus: SupabaseStatusResponse | null;
  onRefreshStatus: () => void;
  onInitDb: () => Promise<void>;
}

export const DbSettingsModal: React.FC<DbSettingsModalProps> = ({
  isOpen,
  onClose,
  dbStatus,
  onRefreshStatus,
  onInitDb,
}) => {
  const [isInitializing, setIsInitializing] = useState(false);
  const [initResult, setInitResult] = useState<string | null>(null);
  const [errorMsg, setErrorMsg] = useState<string | null>(null);

  if (!isOpen) return null;

  const handleInit = async () => {
    try {
      setIsInitializing(true);
      setInitResult(null);
      setErrorMsg(null);
      await onInitDb();
      setInitResult('Conexão e tabelas Supabase verificadas e ativas!');
    } catch (err: any) {
      setErrorMsg(err.message || 'Erro ao verificar banco de dados.');
    } finally {
      setIsInitializing(false);
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-xs animate-in fade-in duration-200">
      <div className="bg-base-100 border border-base-300 rounded-2xl shadow-2xl max-w-lg w-full overflow-hidden flex flex-col max-h-[90vh]">
        {/* Modal Header */}
        <div className="bg-base-200/80 px-6 py-4 border-b border-base-300 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="p-2 bg-emerald-500/10 text-emerald-500 rounded-xl">
              <Zap className="w-5 h-5 fill-emerald-500" />
            </div>
            <div>
              <h3 className="font-bold text-lg leading-tight">Supabase Realtime PostgreSQL</h3>
              <p className="text-xs text-base-content/70">Sincronização ao Vivo de Estoque</p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="btn btn-sm btn-circle btn-ghost text-base-content/70 hover:text-base-content"
          >
            ✕
          </button>
        </div>

        {/* Modal Body */}
        <div className="p-6 overflow-y-auto space-y-6 flex-1 text-sm">
          {/* Status Card */}
          <div
            className={`p-4 rounded-xl border flex items-start gap-3 ${
              dbStatus?.connected
                ? 'bg-emerald-500/10 border-emerald-500/30 text-emerald-700 dark:text-emerald-300'
                : 'bg-amber-500/10 border-amber-500/30 text-amber-700 dark:text-amber-300'
            }`}
          >
            {dbStatus?.connected ? (
              <CheckCircle className="w-5 h-5 text-emerald-500 shrink-0 mt-0.5" />
            ) : (
              <AlertTriangle className="w-5 h-5 text-amber-500 shrink-0 mt-0.5" />
            )}
            <div className="flex-1 space-y-1">
              <div className="flex items-center justify-between font-semibold">
                <span>{dbStatus?.connected ? '⚡ Supabase Realtime Ativo' : 'Status: Supabase Offline'}</span>
                <button
                  onClick={onRefreshStatus}
                  className="btn btn-xs btn-ghost gap-1 text-xs"
                  title="Testar Conexão Novamente"
                >
                  <RefreshCw className="w-3 h-3" /> Testar
                </button>
              </div>
              <p className="text-xs opacity-90">{dbStatus?.message || 'Verificando conexão com o Supabase...'}</p>
            </div>
          </div>

          {/* Quick Actions */}
          <div className="space-y-3">
            <h4 className="font-semibold text-xs uppercase tracking-wider text-base-content/70">Ações de Diagnóstico</h4>
            <button
              onClick={handleInit}
              disabled={isInitializing || !dbStatus?.connected}
              className="btn btn-outline btn-emerald w-full justify-between gap-2 border-emerald-500/40 hover:bg-emerald-500 hover:border-emerald-500 hover:text-white"
            >
              <span className="flex items-center gap-2">
                <Database className="w-4 h-4" />
                {isInitializing ? 'Verificando...' : 'Reverificar Conexão e Tabelas'}
              </span>
              {isInitializing && <span className="loading loading-spinner loading-xs" />}
            </button>

            {initResult && (
              <div className="p-3 bg-emerald-500/10 text-emerald-600 rounded-lg text-xs font-medium border border-emerald-500/20">
                {initResult}
              </div>
            )}
            {errorMsg && (
              <div className="p-3 bg-rose-500/10 text-rose-600 rounded-lg text-xs font-medium border border-rose-500/20">
                {errorMsg}
              </div>
            )}
          </div>

          {/* Setup Guide */}
          <div className="space-y-3 pt-2 border-t border-base-200">
            <h4 className="font-semibold text-xs uppercase tracking-wider text-base-content/70">Sincronização em Tempo Real</h4>
            <p className="text-xs text-base-content/80">
              O **Supabase Realtime** mantém a tela de todos os computadores, celulares e tablets da terreira **sincronizados instantaneamente**. Cada alteração de estoque é transmitida ao vivo via WebSockets.
            </p>
            <div className="p-3 bg-base-200/80 rounded-xl space-y-1 text-xs">
              <p className="font-semibold text-base-content">Projeto Supabase:</p>
              <p className="font-mono text-[11px] text-emerald-600 dark:text-emerald-400 break-all">{dbStatus?.url || 'bhhwlujelzccrwcjxwjy.supabase.co'}</p>
            </div>
          </div>
        </div>

        {/* Modal Footer */}
        <div className="bg-base-200/80 px-6 py-3 border-t border-base-300 flex justify-end">
          <button onClick={onClose} className="btn btn-sm btn-neutral">
            Fechar
          </button>
        </div>
      </div>
    </div>
  );
};
