import React from 'react';
import { Flame, LogOut } from 'lucide-react';

interface HeaderProps {
  userEmail?: string;
  operatorName?: string;
  onLogout?: () => void;
}

export const Header: React.FC<HeaderProps> = ({
  userEmail = 'ngwildner@senacrs.com.br',
  onLogout,
}) => {
  const initial = userEmail ? userEmail.charAt(0).toUpperCase() : 'N';

  const handleLogout = () => {
    if (onLogout) {
      onLogout();
    } else {
      if (window.confirm('Deseja realmente sair do sistema?')) {
        alert('Sessão encerrada com sucesso.');
      }
    }
  };

  return (
    <header className="navbar bg-base-100/90 backdrop-blur-md border-b border-base-300 sticky top-0 z-50 px-4 sm:px-6 lg:px-8 transition-all shadow-xs no-print">
      <div className="flex-1 flex items-center gap-3">
        <div className="avatar placeholder">
          <div className="bg-primary text-primary-content rounded-xl w-10 h-10 shadow-sm flex items-center justify-center">
            <Flame className="w-5 h-5 text-white" />
          </div>
        </div>
        <div>
          <h1 className="text-base sm:text-lg font-bold tracking-tight text-base-content leading-none">
            Controle de Estoque da Terreira
          </h1>
        </div>
      </div>

      <div className="flex-none">
        {/* User Profile Avatar Dropdown */}
        <div className="dropdown dropdown-end">
          <div
            tabIndex={0}
            role="button"
            className="w-9 h-9 rounded-full bg-gray-300 hover:bg-gray-400 text-gray-800 font-semibold text-sm flex items-center justify-center transition-colors cursor-pointer select-none shadow-xs"
            title={userEmail}
          >
            {initial}
          </div>

          <div
            tabIndex={0}
            className="dropdown-content z-50 menu p-3 shadow-xl bg-white rounded-xl w-60 border border-gray-200 mt-2 space-y-2 text-base-content"
          >
            {/* Email */}
            <div className="px-2 py-1 text-xs font-medium text-gray-700 truncate select-all">
              {userEmail}
            </div>

            {/* Divider */}
            <div className="h-px bg-gray-200 w-full"></div>

            {/* Sair */}
            <button
              type="button"
              onClick={handleLogout}
              className="w-full flex items-center gap-2 px-2 py-1.5 text-xs text-gray-700 hover:text-error hover:bg-gray-100 rounded-lg transition-colors font-medium text-left cursor-pointer"
            >
              <LogOut className="w-4 h-4 text-gray-600" />
              <span>Sair</span>
            </button>
          </div>
        </div>
      </div>
    </header>
  );
};