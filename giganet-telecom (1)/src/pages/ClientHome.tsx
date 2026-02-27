import React from 'react';
import { Link } from 'react-router-dom';
import { useAuth } from '../contexts/AuthContext';
import { Card, Button, cn } from '../components/UI';
import { Wifi, WifiOff, AlertTriangle, CreditCard, ChevronRight, Download, Copy, Headphones, FileText, Zap, Shield } from 'lucide-react';
import { format } from 'date-fns';
import { ptBR } from 'date-fns/locale';
import { motion } from 'motion/react';

export const ClientHome: React.FC = () => {
  const { profile } = useAuth();

  const statusConfig = {
    online: { icon: Wifi, color: 'text-emerald-500', bg: 'bg-emerald-50', label: 'Conectado' },
    offline: { icon: WifiOff, color: 'text-red-500', bg: 'bg-red-50', label: 'Desconectado' },
    blocked: { icon: AlertTriangle, color: 'text-amber-500', bg: 'bg-amber-50', label: 'Bloqueado por inadimplência' },
  };

  const currentStatus = statusConfig[profile?.statusConexao || 'offline'];

  return (
    <div className="space-y-6">
      <header className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-slate-900">Olá, {profile?.nome?.split(' ')[0] || 'Cliente'}</h1>
          <p className="text-slate-500">Nº do cliente: {profile?.numeroCliente}</p>
        </div>
        <div className="h-12 w-12 rounded-full bg-slate-200 overflow-hidden">
          <img src={`https://api.dicebear.com/7.x/avataaars/svg?seed=${profile?.uid}`} alt="Avatar" referrerPolicy="no-referrer" />
        </div>
      </header>

      <div className="grid gap-6 md:grid-cols-2">
        {/* Connection Status Card */}
        <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }}>
          <Card className="h-full flex flex-col justify-between">
            <div className="flex items-center justify-between mb-4">
              <span className="text-sm font-medium text-slate-500 uppercase tracking-wider">Status da Conexão</span>
              <div className={cn('flex items-center gap-2 px-3 py-1 rounded-full text-xs font-bold uppercase', currentStatus.bg, currentStatus.color)}>
                <currentStatus.icon className="h-3 w-3" />
                {currentStatus.label}
              </div>
            </div>
            <div className="space-y-1">
              <p className="text-3xl font-bold text-slate-900">500MB</p>
              <p className="text-slate-500">Plano Giga Fibra</p>
            </div>
            <div className="mt-6 pt-6 border-t border-slate-100 flex items-center justify-between text-sm">
              <span className="text-slate-500">IP: 187.45.122.10</span>
              <button className="text-primary font-medium hover:underline">Ver detalhes</button>
            </div>
          </Card>
        </motion.div>

        {/* Invoice Card */}
        <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.1 }}>
          <Card className="h-full border-l-4 border-l-accent-red">
            <div className="flex items-center justify-between mb-4">
              <span className="text-sm font-medium text-slate-500 uppercase tracking-wider">Fatura Atual</span>
              <span className="px-3 py-1 rounded-full bg-red-50 text-accent-red text-xs font-bold uppercase">Em Aberto</span>
            </div>
            <div className="space-y-1">
              <p className="text-3xl font-bold text-slate-900">R$ 99,90</p>
              <p className="text-slate-500">Vencimento: 10 de Março</p>
            </div>
            <div className="mt-6 flex gap-3">
              <Button variant="accent" className="flex-1">PAGAR AGORA</Button>
              <Button variant="outline" className="px-3"><Download className="h-5 w-5" /></Button>
            </div>
          </Card>
        </motion.div>
      </div>

      {/* Plans Preview */}
      <div className="space-y-4">
        <div className="flex items-center justify-between">
          <h2 className="text-lg font-bold text-slate-900">Planos em Destaque</h2>
          <Link to="/plans" className="text-sm text-primary font-medium hover:underline">Ver todos</Link>
        </div>
        <div className="grid gap-4 md:grid-cols-3">
          {[
            { nome: '500MB Giga Fibra', valor: 99.90, icon: Zap },
            { nome: '800MB Giga Ultra', valor: 129.90, icon: Wifi, popular: true },
            { nome: '1 Giga Wi-Fi 6', valor: 199.90, icon: Shield },
          ].map((plan, i) => (
            <Card key={i} className={cn("p-4 flex flex-col justify-between border-2", plan.popular ? "border-primary/20 bg-primary/5" : "border-slate-100")}>
              <div>
                <div className="h-8 w-8 rounded-lg bg-white flex items-center justify-center text-primary shadow-sm mb-3">
                  <plan.icon className="h-4 w-4" />
                </div>
                <h4 className="font-bold text-slate-900 text-sm">{plan.nome}</h4>
                <p className="text-lg font-bold text-primary mt-1">R$ {plan.valor.toFixed(2)}</p>
              </div>
              <Link to="/plans" className="mt-4 text-xs font-bold text-primary uppercase tracking-wider hover:underline">Detalhes</Link>
            </Card>
          ))}
        </div>
      </div>

      {/* Quick Actions */}
      <div className="grid grid-cols-2 gap-4 md:grid-cols-4">
        {[
          { label: 'Gerar PIX', icon: Copy, color: 'bg-blue-500' },
          { label: '2ª Via', icon: FileText, color: 'bg-indigo-500' },
          { label: 'Desbloqueio', icon: AlertTriangle, color: 'bg-amber-500' },
          { label: 'Suporte', icon: Headphones, color: 'bg-emerald-500' },
        ].map((action, i) => (
          <button key={i} className="flex flex-col items-center gap-2 p-4 rounded-2xl bg-white border border-slate-100 shadow-sm hover:bg-slate-50 transition-colors">
            <div className={cn('h-10 w-10 rounded-xl flex items-center justify-center text-white', action.color)}>
              <action.icon className="h-5 w-5" />
            </div>
            <span className="text-xs font-medium text-slate-700">{action.label}</span>
          </button>
        ))}
      </div>

      {/* Offers / News */}
      <Card className="bg-primary text-white overflow-hidden relative">
        <div className="relative z-10">
          <h3 className="text-xl font-bold mb-2">Indique e Ganhe!</h3>
          <p className="text-primary-100 mb-4 max-w-xs">Indique um amigo e ganhe 50% de desconto na sua próxima fatura.</p>
          <Button variant="secondary" size="sm">Saber mais</Button>
        </div>
        <div className="absolute right-[-20px] bottom-[-20px] opacity-20">
          <Wifi className="h-40 w-40" />
        </div>
      </Card>
    </div>
  );
};
