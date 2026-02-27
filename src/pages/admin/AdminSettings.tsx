import React from 'react';
import { Card, Button, Input } from '../../components/UI';
import { Settings, Shield, Bell, Globe, Database, Save } from 'lucide-react';

export const AdminSettings: React.FC = () => {
  return (
    <div className="space-y-6">
      <header>
        <h1 className="text-2xl font-bold text-slate-900">Configurações do Sistema</h1>
        <p className="text-slate-500">Ajuste os parâmetros da GigaNet Telecom</p>
      </header>

      <div className="grid gap-6 md:grid-cols-3">
        <div className="md:col-span-1 space-y-4">
          {[
            { icon: Globe, label: 'Geral', active: true },
            { icon: Shield, label: 'Segurança', active: false },
            { icon: Bell, label: 'Notificações', active: false },
            { icon: Database, label: 'Integrações', active: false },
          ].map((item, i) => (
            <button
              key={i}
              className={cn(
                'flex w-full items-center gap-3 rounded-xl px-4 py-3 text-sm font-medium transition-colors',
                item.active ? 'bg-primary text-white shadow-md shadow-primary/20' : 'bg-white text-slate-600 hover:bg-slate-50'
              )}
            >
              <item.icon className="h-5 w-5" />
              {item.label}
            </button>
          ))}
        </div>

        <div className="md:col-span-2 space-y-6">
          <Card className="space-y-6">
            <h3 className="text-lg font-bold text-slate-900">Informações da Empresa</h3>
            <div className="grid gap-4 md:grid-cols-2">
              <Input label="Nome Fantasia" defaultValue="GigaNet Telecom" />
              <Input label="CNPJ" defaultValue="00.000.000/0001-00" />
              <Input label="E-mail de Contato" defaultValue="contato@giganet.com.br" />
              <Input label="Telefone/WhatsApp" defaultValue="(00) 00000-0000" />
            </div>
            <div className="pt-4 border-t border-slate-100 flex justify-end">
              <Button className="gap-2">
                <Save className="h-4 w-4" /> Salvar Alterações
              </Button>
            </div>
          </Card>

          <Card className="space-y-6">
            <h3 className="text-lg font-bold text-slate-900">Configurações de Faturamento</h3>
            <div className="space-y-4">
              <div className="flex items-center justify-between p-4 rounded-xl bg-slate-50">
                <div>
                  <p className="font-medium text-slate-900">Multa por Atraso</p>
                  <p className="text-xs text-slate-500">Percentual aplicado após o vencimento</p>
                </div>
                <div className="w-24">
                  <Input type="number" defaultValue="2" suffix="%" />
                </div>
              </div>
              <div className="flex items-center justify-between p-4 rounded-xl bg-slate-50">
                <div>
                  <p className="font-medium text-slate-900">Juros Mensais</p>
                  <p className="text-xs text-slate-500">Percentual de juros ao mês</p>
                </div>
                <div className="w-24">
                  <Input type="number" defaultValue="1" suffix="%" />
                </div>
              </div>
            </div>
          </Card>
        </div>
      </div>
    </div>
  );
};

import { cn } from '../../components/UI';
