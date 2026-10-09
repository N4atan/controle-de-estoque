import React from 'react';
import { Flame, Database, UserCheck, RefreshCw, Zap, Warehouse } from 'lucide-react';
import type { SupabaseStatusResponse } from '../services/api';
import type { User as UserType } from '../services/auth';

interface HeaderProps {
  currentUser?: UserType | null;
  onLogout?: () => void;
  dbStatus?: SupabaseStatusResponse | null;
  onOpenDbSettings?: () => void;
}

export const Header: React.FC<HeaderProps> = ({
  currentUser,
  onLogout,
  dbStatus,
  onOpenDbSettings,
}) => {
  const displayEmail = currentUser?.email || 'operador@terreira.com';
  const displayName = currentUser?.name || 'Responsável';
  const initial = displayName.charAt(0).toUpperCase();

  const handleLogout = () => {
    if (onLogout) {
      onLogout();
    }
  };

  return (
    <header className="navbar bg-base-100/90 backdrop-blur-md border-b border-base-300 sticky top-0 z-50 px-4 sm:px-6 lg:px-8 transition-all shadow-xs no-print flex items-center justify-between">
      <div className="flex-1 flex items-center gap-3">
        <div className="avatar placeholder">
          <div className="bg-primary text-primary-content rounded-xl w-10 h-10 shadow-sm flex items-center justify-center">
            <Warehouse className="w-5 h-5 text-white" />
          </div>
        </div>
        <div>
          <h1 className="text-base sm:text-lg font-bold tracking-tight text-base-content leading-none">
            Controle de Estoque da Terreira
          </h1>
          
        </div>
      </div>

      <div className="flex items-center gap-3">
        

        {/* User Profile Avatar Dropdown */}
        <div className="dropdown dropdown-end">
          <div
            tabIndex={0}
            role="button"
            className="w-9 h-9 rounded-full bg-emerald-600 hover:bg-emerald-700 text-white font-bold text-sm flex items-center justify-center transition-colors cursor-pointer select-none shadow-md border-2 border-emerald-400/30"
            title={`${displayName} (${displayEmail})`}
          >
            {initial}
          </div>

          <div
            tabIndex={0}
            className="dropdown-content z-50 menu p-3 shadow-xl bg-white rounded-xl w-64 border border-gray-200 mt-2 space-y-2 text-base-content"
          >
            {/* User Details */}
            <div className="px-2 py-1">
              <p className="text-xs font-bold text-gray-900">{displayName}</p>
              <p className="text-[11px] text-gray-500 truncate">{displayEmail}</p>
            </div>

            {/* Divider */}
            <div className="h-px bg-gray-200 w-full"></div>

            {/* Banco de dados */}
            <button
              type="button"
              onClick={onOpenDbSettings}
              className="w-full flex items-center gap-2 px-2 py-1.5 text-xs text-gray-700 hover:bg-gray-100 rounded-lg transition-colors font-medium text-left cursor-pointer"
            >
              <Database className="w-4 h-4 text-emerald-600" />
              <span>Configurar Banco Supabase</span>
            </button>

            {/* Alternar Operador / Logout */}
            <button
              type="button"
              onClick={handleLogout}
              className="w-full flex items-center gap-2 px-2 py-1.5 text-xs text-gray-700 hover:text-error hover:bg-gray-100 rounded-lg transition-colors font-medium text-left cursor-pointer"
            >
              <RefreshCw className="w-4 h-4 text-gray-600" />
              <span>Alternar Operador / Sair</span>
            </button>
          </div>
        </div>
      </div>
    </header>
  );
};
