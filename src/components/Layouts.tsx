import React, { useState, useEffect } from 'react';
import { Link, useLocation } from 'react-router-dom';
import {
  Home, CreditCard, Headphones, User, LayoutDashboard,
  Users, FileText, Settings, LogOut, Wifi,
} from 'lucide-react';
import { useAuth }     from '../contexts/AuthContext';
import { auth, db }    from '../lib/firebase';
import { doc, getDoc } from 'firebase/firestore';
import { cn }          from '../components/UI';

// ── Hook: logo salvo pelo admin ─────────────────────────────────
function useAdminLogo() {
  const [logoUrl, setLogoUrl] = useState('');
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

// ── LogoBlock: retângulo arredondado SEM moldura circular ────────
// Mostra a imagem inteira (sem corte excessivo) ou a letra "G"
const LogoBlock: React.FC<{ height?: number }> = ({ height = 52 }) => {
  const logoUrl = useAdminLogo();

  const containerStyle: React.CSSProperties = {
    width:           '100%',
    height:          `${height}px`,
    borderRadius:    '12px',
    overflow:        'hidden',
    flexShrink:      0,
    backgroundColor: '#004aad',
    display:         'flex',
    alignItems:      'center',
    justifyContent:  'center',
    boxShadow:       '0 2px 10px rgba(0,74,173,0.18)',
  };

  if (logoUrl) {
    return (
      <div style={containerStyle}>
        <img
          src={logoUrl}
          alt="GigaNet"
          style={{
            width:          '100%',
            height:         '100%',
            objectFit:      'cover',      // ← preenche tudo, SEM moldura circular
            objectPosition: 'center',
            display:        'block',
          }}
          referrerPolicy="no-referrer"
        />
      </div>
    );
  }

  return (
    <div style={containerStyle}>
      <span style={{
        color:       'white',
        fontWeight:  800,
        fontSize:    `${height * 0.5}px`,
        letterSpacing: '-1px',
        userSelect:  'none',
      }}>
        G
      </span>
    </div>
  );
};

// ════════════════════════════════════════════════════════════════
//  LAYOUT DO CLIENTE
// ════════════════════════════════════════════════════════════════
export const ClientLayout: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const location    = useLocation();
  const { profile } = useAuth();

  const navItems = [
    { icon: Home,       label: 'Início',     path: '/' },
    { icon: Wifi,       label: 'Planos',     path: '/plans' },
    { icon: CreditCard, label: 'Financeiro', path: '/finance' },
    { icon: Headphones, label: 'Suporte',    path: '/support' },
    { icon: User,       label: 'Perfil',     path: '/profile' },
  ];

  const handleLogout = () => auth.signOut().catch(() => {});

  return (
    <div className="min-h-screen bg-slate-50 pb-20 md:pb-0 md:pl-64">

      {/* ── Sidebar desktop ── */}
      <aside className="fixed left-0 top-0 hidden h-full w-64 flex-col border-r border-slate-200 bg-white md:flex">

        {/* Logo — retângulo largo sem moldura circular */}
        <div className="px-5 pt-6 pb-4">
          <LogoBlock height={56} />
          <p className="mt-2 text-center text-xs font-bold text-slate-500 tracking-widest uppercase">
            GigaNet
          </p>
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
                  : 'text-slate-600 hover:bg-slate-50 hover:text-slate-900',
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
              location.pathname === item.path ? 'text-primary' : 'text-slate-400',
            )}
          >
            <item.icon className="h-5 w-5" />
            <span className="mt-0.5 text-[9px] font-medium uppercase tracking-wider">{item.label}</span>
          </Link>
        ))}
        <button
          onClick={handleLogout}
          className="flex flex-1 flex-col items-center justify-center py-2 text-slate-400 hover:text-red-500 transition-colors"
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

  const handleLogout = () => auth.signOut().catch(() => {});

  return (
    <div className="min-h-screen bg-slate-50 pl-64">
      <aside className="fixed left-0 top-0 flex h-full w-64 flex-col border-r border-slate-200 bg-white">

        {/* Logo */}
        <div className="px-5 pt-6 pb-4">
          <LogoBlock height={56} />
          <p className="mt-2 text-center text-xs font-bold text-slate-500 tracking-widest uppercase">
            Admin Panel
          </p>
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
                  : 'text-slate-600 hover:bg-slate-50 hover:text-slate-900',
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
