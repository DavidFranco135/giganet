import React from 'react';
import { useAuth } from '../contexts/AuthContext';
import { Card, Button, Input } from '../components/UI';
import { User, MapPin, Shield, Bell, ChevronRight, Camera } from 'lucide-react';

export const ProfilePage: React.FC = () => {
  const { profile } = useAuth();

  const sections = [
    { icon: User, label: 'Dados Pessoais', value: profile?.nome },
    { icon: MapPin, label: 'Endereço de Instalação', value: `${profile?.endereco.rua}, ${profile?.endereco.numero}` },
    { icon: Shield, label: 'Segurança', value: 'Alterar senha' },
    { icon: Bell, label: 'Notificações', value: 'Configurar avisos' },
  ];

  return (
    <div className="space-y-6">
      <header className="flex flex-col items-center text-center py-4">
        <div className="relative">
          <div className="h-24 w-24 rounded-full border-4 border-white shadow-xl overflow-hidden bg-slate-200">
            <img src={`https://api.dicebear.com/7.x/avataaars/svg?seed=${profile?.uid}`} alt="Avatar" referrerPolicy="no-referrer" />
          </div>
          <button className="absolute bottom-0 right-0 h-8 w-8 rounded-full bg-primary text-white flex items-center justify-center border-2 border-white shadow-md">
            <Camera className="h-4 w-4" />
          </button>
        </div>
        <h1 className="mt-4 text-2xl font-bold text-slate-900">{profile?.nome}</h1>
        <p className="text-slate-500">{profile?.email}</p>
      </header>

      <div className="space-y-3">
        {sections.map((section, i) => (
          <Card key={i} className="p-4 flex items-center justify-between hover:bg-slate-50 transition-colors cursor-pointer group">
            <div className="flex items-center gap-4">
              <div className="h-10 w-10 rounded-xl bg-slate-100 flex items-center justify-center text-slate-500 group-hover:bg-primary/10 group-hover:text-primary transition-colors">
                <section.icon className="h-5 w-5" />
              </div>
              <div>
                <p className="text-xs font-medium text-slate-400 uppercase tracking-wider">{section.label}</p>
                <p className="font-semibold text-slate-700">{section.value}</p>
              </div>
            </div>
            <ChevronRight className="h-5 w-5 text-slate-300 group-hover:text-primary transition-colors" />
          </Card>
        ))}
      </div>

      <div className="pt-4">
        <Button variant="outline" className="w-full text-red-500 hover:bg-red-50 hover:border-red-200">
          Encerrar Sessão
        </Button>
      </div>
      
      <p className="text-center text-[10px] text-slate-400 uppercase tracking-widest">
        GigaNet Telecom v1.0.0
      </p>
    </div>
  );
};
