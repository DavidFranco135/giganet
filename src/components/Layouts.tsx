import React, { useState, useEffect } from 'react';
import { Link, useLocation } from 'react-router-dom';
import {
  Home, CreditCard, Headphones, User, LayoutDashboard,
  Users, FileText, Settings, LogOut, Wifi,
} from 'lucide-react';
import { useAuth } from '../contexts/AuthContext';
import { auth, db } from '../lib/firebase';
import { doc, getDoc } from 'firebase/firestore';
import { cn } from '../components/UI';

// ── Hook: busca avatarUrl do admin no Firestore ──────────────────
function useAdminLogo() {
  const [logoUrl, setLogoUrl] = useState<string>('');
  useEffect(() => {
    getDoc(doc(db, 'adminSettings', 'profile'))
      .then(snap => {
        if (snap.exists()) {
          const d = snap.data();
          if (d?.avatarUrl) setLogoUrl(d.avatarUrl);
        }
      })
      .catch(() => {});
  }, []);
  return logoUrl;
}

// ── Logo circle: foto do admin ou letra "G" ──────────────────────
const LogoCircle: React.FC<{ size?: number }> = ({ size = 40 }) => {
  const logoUrl = useAdminLogo();
  return (
    <div style={{
      width: size, height: size, borderRadius: '50%',
      backgroundColor: '#004aad',
      overflow: 'hidden',
      display: 'flex', alignItems: 'center', justifyContent: 'center',
      flexShrink: 0,
    }}>
      {logoUrl
        ? <img src={logoUrl} alt="Logo" style={{ width: '100%', height: '100%', objectFit: 'cover' }} referrerPolicy="no-referrer" />
        : <span style={{ color: 'white', fontWeight: 700, fontSize: size * 0.45 }}>G</span>
      }
    </div>
  );
};

// ════════════════════════════════════════════════════════════════
//  LAYOUT DO CLIENTE
// ════════════════════════════════════════════════════════════════
export const ClientLayout: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const location  = useLocation();
  const { profile } = useAuth();

  const navItems = [
    { icon: Home,        label: 'Início',     path: '/' },
    { icon: Wifi,        label: 'Planos',     path: '/plans' },
    { icon: CreditCard,  label: 'Financeiro', path: '/finance' },
    { icon: Headphones,  label: 'Suporte',    path: '/support' },
    { icon: User,        label: 'Perfil',     path: '/profile' },
  ];

  const handleLogout = () => {
    auth.signOut().catch(() => {});
  };

  return (
    <div className="min-h-screen bg-slate-50 pb-20 md:pb-0 md:pl-64">

      {/* ── Sidebar desktop ── */}
      <aside className="fixed left-0 top-0 hidden h-full w-64 flex-col border-r border-slate-200 bg-white md:flex">
        <div className="p-6">
          <div className="flex items-center gap-2">
            <LogoCircle size={40} />
            <span className="text-xl font-bold text-primary">GigaNet</span>
          </div>
        </div>

        <nav className="flex-1 space-y-1 px-4">
          {navItems.map(item => (
            <Link
              key={item.path}
              to={item.path}
              className={cn(
                'flex items-center gap-3 rounded-xl px-4 py-3 text-sm font-medium transition-colors',
                location.pathname === item.path
                  ? 'bg-primary/10 text-primary'
                  : 'text-slate-600 hover:bg-slate-50 hover:text-slate-900'
              )}
            >
              <item.icon className="h-5 w-5" />
              {item.label}
            </Link>
          ))}
        </nav>

        <div className="p-4 border-t border-slate-100">
          <button
            onClick={handleLogout}
            className="flex w-full items-center gap-3 rounded-xl px-4 py-3 text-sm font-medium text-slate-600 hover:bg-red-50 hover:text-red-600 transition-colors"
          >
            <LogOut className="h-5 w-5" />
            Sair
          </button>
        </div>
      </aside>

      {/* ── Bottom Nav mobile ── */}
      <nav className="fixed bottom-0 left-0 z-50 flex w-full border-t border-slate-200 bg-white md:hidden">
        {navItems.map(item => (
          <Link
            key={item.path}
            to={item.path}
            className={cn(
              'flex flex-1 flex-col items-center justify-center py-2 transition-colors',
              location.pathname === item.path ? 'text-primary' : 'text-slate-400'
            )}
          >
            <item.icon className="h-5 w-5" />
            <span className="mt-0.5 text-[9px] font-medium uppercase tracking-wider">{item.label}</span>
          </Link>
        ))}

        {/* Botão Sair — mobile */}
        <button
          onClick={handleLogout}
          className="flex flex-1 flex-col items-center justify-center py-2 text-slate-400 hover:text-red-500 active:text-red-600 transition-colors"
        >
          <LogOut className="h-5 w-5" />
          <span className="mt-0.5 text-[9px] font-medium uppercase tracking-wider">Sair</span>
        </button>
      </nav>

      <main className="p-4 md:p-8 max-w-5xl mx-auto">
        {children}
      </main>
    </div>
  );
};

// ════════════════════════════════════════════════════════════════
//  LAYOUT DO ADMIN
// ════════════════════════════════════════════════════════════════
export const AdminLayout: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const location = useLocation();

  const navItems = [
    { icon: LayoutDashboard, label: 'Dashboard',     path: '/admin' },
    { icon: Users,           label: 'Clientes',      path: '/admin/clients' },
    { icon: FileText,        label: 'Faturas',       path: '/admin/invoices' },
    { icon: Headphones,      label: 'Chamados',      path: '/admin/tickets' },
    { icon: Home,            label: 'Planos',        path: '/admin/plans' },
    { icon: Settings,        label: 'Configurações', path: '/admin/settings' },
  ];

  const handleLogout = () => {
    auth.signOut().catch(() => {});
  };

  return (
    <div className="min-h-screen bg-slate-50 pl-64">
      <aside className="fixed left-0 top-0 flex h-full w-64 flex-col border-r border-slate-200 bg-white">
        <div className="p-6">
          <div className="flex items-center gap-2">
            <LogoCircle size={40} />
            <span className="text-xl font-bold text-primary">GigaNet Admin</span>
          </div>
        </div>

        <nav className="flex-1 space-y-1 px-4">
          {navItems.map(item => (
            <Link
              key={item.path}
              to={item.path}
              className={cn(
                'flex items-center gap-3 rounded-xl px-4 py-3 text-sm font-medium transition-colors',
                location.pathname === item.path
                  ? 'bg-primary/10 text-primary'
                  : 'text-slate-600 hover:bg-slate-50 hover:text-slate-900'
              )}
            >
              <item.icon className="h-5 w-5" />
              {item.label}
            </Link>
          ))}
        </nav>

        <div className="p-4 border-t border-slate-100">
          <button
            onClick={handleLogout}
            className="flex w-full items-center gap-3 rounded-xl px-4 py-3 text-sm font-medium text-slate-600 hover:bg-red-50 hover:text-red-600 transition-colors"
          >
            <LogOut className="h-5 w-5" />
            Sair
          </button>
        </div>
      </aside>

      <main className="p-8">
        {children}
      </main>
    </div>
  );
};
