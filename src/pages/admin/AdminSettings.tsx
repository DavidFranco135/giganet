import React, { useState } from 'react';
import { Card, Button, Input, cn } from '../../components/UI';
import { Shield, Bell, Globe, Database, Save, Key, Link, CheckCircle, AlertCircle } from 'lucide-react';

// ─── Aba: Geral ───────────────────────────────────────────────────
const TabGeral: React.FC = () => {
  const [saved, setSaved] = useState(false);
  const handleSave = () => { setSaved(true); setTimeout(() => setSaved(false), 2500); };

  return (
    <div className="space-y-6">
      <Card className="space-y-6">
        <h3 className="text-lg font-bold text-slate-900">Informações da Empresa</h3>
        <div className="grid gap-4 md:grid-cols-2">
          <Input label="Nome Fantasia" defaultValue="GigaNet Telecom" />
          <Input label="CNPJ" defaultValue="00.000.000/0001-00" />
          <Input label="E-mail de Contato" defaultValue="contato@giganet.com.br" />
          <Input label="Telefone/WhatsApp" defaultValue="(00) 00000-0000" />
          <Input label="Cidade" defaultValue="São Paulo" />
          <Input label="Estado" defaultValue="SP" />
        </div>
        <div className="pt-4 border-t border-slate-100 flex justify-end">
          <Button onClick={handleSave} className="gap-2">
            {saved ? <><CheckCircle className="h-4 w-4" /> Salvo!</> : <><Save className="h-4 w-4" /> Salvar Alterações</>}
          </Button>
        </div>
      </Card>

      <Card className="space-y-6">
        <h3 className="text-lg font-bold text-slate-900">Configurações de Faturamento</h3>
        <div className="space-y-3">
          {[
            { label: 'Multa por Atraso', desc: 'Percentual aplicado após o vencimento', defaultVal: '2', suffix: '%' },
            { label: 'Juros Mensais', desc: 'Percentual de juros ao mês', defaultVal: '1', suffix: '%' },
            { label: 'Dias de Carência', desc: 'Dias antes do bloqueio automático', defaultVal: '5', suffix: 'dias' },
          ].map((item, i) => (
            <div key={i} className="flex items-center justify-between p-4 rounded-xl bg-slate-50">
              <div>
                <p className="font-medium text-slate-900">{item.label}</p>
                <p className="text-xs text-slate-500">{item.desc}</p>
              </div>
              <div className="flex items-center gap-2">
                <input
                  type="number"
                  defaultValue={item.defaultVal}
                  className="w-16 rounded-lg border border-slate-200 px-2 py-1 text-center text-sm font-bold text-slate-900 focus:outline-none focus:border-primary"
                />
                <span className="text-sm text-slate-500">{item.suffix}</span>
              </div>
            </div>
          ))}
        </div>
        <div className="pt-4 border-t border-slate-100 flex justify-end">
          <Button onClick={handleSave} className="gap-2">
            <Save className="h-4 w-4" /> Salvar
          </Button>
        </div>
      </Card>
    </div>
  );
};

// ─── Aba: Segurança ───────────────────────────────────────────────
const TabSeguranca: React.FC = () => {
  const [show, setShow] = useState(false);
  return (
    <div className="space-y-6">
      <Card className="space-y-6">
        <h3 className="text-lg font-bold text-slate-900">Alterar Senha do Admin</h3>
        <div className="space-y-4">
          <Input label="Senha Atual" type={show ? 'text' : 'password'} placeholder="••••••••" />
          <Input label="Nova Senha" type={show ? 'text' : 'password'} placeholder="••••••••" />
          <Input label="Confirmar Nova Senha" type={show ? 'text' : 'password'} placeholder="••••••••" />
          <label className="flex items-center gap-2 text-sm text-slate-600 cursor-pointer">
            <input type="checkbox" className="rounded" onChange={(e) => setShow(e.target.checked)} />
            Mostrar senhas
          </label>
        </div>
        <div className="pt-4 border-t border-slate-100 flex justify-end">
          <Button className="gap-2"><Key className="h-4 w-4" /> Atualizar Senha</Button>
        </div>
      </Card>

      <Card className="space-y-4">
        <h3 className="text-lg font-bold text-slate-900">Sessões Ativas</h3>
        <p className="text-sm text-slate-500">Dispositivos com acesso ao painel administrativo</p>
        {[
          { device: 'Chrome — Windows 11', location: 'São Paulo, BR', time: 'Agora', active: true },
          { device: 'Safari — iPhone 15', location: 'São Paulo, BR', time: '2h atrás', active: false },
        ].map((s, i) => (
          <div key={i} className="flex items-center justify-between p-4 rounded-xl bg-slate-50">
            <div className="flex items-center gap-3">
              <div className={cn('h-2.5 w-2.5 rounded-full', s.active ? 'bg-emerald-500' : 'bg-slate-300')} />
              <div>
                <p className="font-medium text-sm text-slate-900">{s.device}</p>
                <p className="text-xs text-slate-500">{s.location} · {s.time}</p>
              </div>
            </div>
            {!s.active && <Button variant="ghost" size="sm" className="text-red-500 text-xs">Encerrar</Button>}
          </div>
        ))}
      </Card>
    </div>
  );
};

// ─── Aba: Notificações ────────────────────────────────────────────
const TabNotificacoes: React.FC = () => {
  const [toggles, setToggles] = useState({
    novoPagamento: true,
    atraso: true,
    novoChamado: true,
    clienteBloqueado: false,
    relatorioSemanal: true,
  });

  const toggle = (key: keyof typeof toggles) =>
    setToggles(prev => ({ ...prev, [key]: !prev[key] }));

  const items = [
    { key: 'novoPagamento', label: 'Novo Pagamento Recebido', desc: 'Alerta quando um pagamento PIX/boleto é confirmado' },
    { key: 'atraso', label: 'Fatura em Atraso', desc: 'Notifica quando um cliente está inadimplente' },
    { key: 'novoChamado', label: 'Novo Chamado de Suporte', desc: 'Alerta ao abrir um novo ticket' },
    { key: 'clienteBloqueado', label: 'Cliente Bloqueado', desc: 'Notifica bloqueio automático por inadimplência' },
    { key: 'relatorioSemanal', label: 'Relatório Semanal', desc: 'Resumo enviado toda segunda-feira por e-mail' },
  ] as const;

  return (
    <Card className="space-y-4">
      <h3 className="text-lg font-bold text-slate-900">Preferências de Notificação</h3>
      <p className="text-sm text-slate-500">Escolha quais alertas deseja receber</p>
      <div className="space-y-3 pt-2">
        {items.map((item) => (
          <div key={item.key} className="flex items-center justify-between p-4 rounded-xl bg-slate-50">
            <div>
              <p className="font-medium text-sm text-slate-900">{item.label}</p>
              <p className="text-xs text-slate-500">{item.desc}</p>
            </div>
            <button
              onClick={() => toggle(item.key)}
              className={cn(
                'relative inline-flex h-6 w-11 items-center rounded-full transition-colors focus:outline-none',
                toggles[item.key] ? 'bg-primary' : 'bg-slate-300'
              )}
            >
              <span className={cn(
                'inline-block h-4 w-4 transform rounded-full bg-white shadow transition-transform',
                toggles[item.key] ? 'translate-x-6' : 'translate-x-1'
              )} />
            </button>
          </div>
        ))}
      </div>
      <div className="pt-4 border-t border-slate-100 flex justify-end">
        <Button className="gap-2"><Save className="h-4 w-4" /> Salvar Preferências</Button>
      </div>
    </Card>
  );
};

// ─── Aba: Integrações ────────────────────────────────────────────
const TabIntegracoes: React.FC = () => {
  const [asaasKey, setAsaasKey] = useState('');
  const [mikrotikIp, setMikrotikIp] = useState('');
  const [mikrotikUser, setMikrotikUser] = useState('admin');
  const [mikrotikPass, setMikrotikPass] = useState('');
  const [testStatus, setTestStatus] = useState<Record<string, 'idle' | 'ok' | 'error'>>({
    asaas: 'idle', mikrotik: 'idle',
  });

  const testConnection = (service: string) => {
    setTestStatus(prev => ({ ...prev, [service]: 'idle' }));
    setTimeout(() => {
      // Simulação — em produção chamar o endpoint real
      setTestStatus(prev => ({ ...prev, [service]: asaasKey || mikrotikIp ? 'ok' : 'error' }));
    }, 1200);
  };

  return (
    <div className="space-y-6">
      {/* Asaas */}
      <Card className="space-y-5">
        <div className="flex items-center gap-3">
          <div className="h-10 w-10 rounded-xl bg-blue-50 flex items-center justify-center text-blue-600 font-bold text-lg">A</div>
          <div>
            <h3 className="font-bold text-slate-900">Asaas — Pagamentos</h3>
            <p className="text-xs text-slate-500">PIX, Boleto e Cartão automatizados</p>
          </div>
        </div>
        <Input
          label="API Key do Asaas"
          placeholder="$aact_xxxxxxxxxxxxxxxxxxxx"
          value={asaasKey}
          onChange={e => setAsaasKey(e.target.value)}
        />
        <Input label="Webhook URL (cole no painel Asaas)" defaultValue="https://SEU-DOMINIO.com/api/webhooks/asaas" readOnly />
        <div className="flex items-center gap-3">
          <Button variant="outline" size="sm" onClick={() => testConnection('asaas')} className="gap-2">
            <Link className="h-4 w-4" /> Testar Conexão
          </Button>
          {testStatus.asaas === 'ok' && <span className="flex items-center gap-1 text-emerald-600 text-sm font-medium"><CheckCircle className="h-4 w-4" /> Conectado</span>}
          {testStatus.asaas === 'error' && <span className="flex items-center gap-1 text-red-500 text-sm font-medium"><AlertCircle className="h-4 w-4" /> Falhou — verifique a chave</span>}
        </div>
      </Card>

      {/* Mikrotik */}
      <Card className="space-y-5">
        <div className="flex items-center gap-3">
          <div className="h-10 w-10 rounded-xl bg-orange-50 flex items-center justify-center text-orange-600 font-bold text-lg">M</div>
          <div>
            <h3 className="font-bold text-slate-900">Mikrotik / ERP — Status de Conexão</h3>
            <p className="text-xs text-slate-500">Consulta status online/offline/bloqueado do cliente</p>
          </div>
        </div>
        <div className="grid gap-4 md:grid-cols-2">
          <Input label="IP do Servidor / API" placeholder="192.168.0.1" value={mikrotikIp} onChange={e => setMikrotikIp(e.target.value)} />
          <Input label="Porta" placeholder="8728" defaultValue="8728" />
          <Input label="Usuário" placeholder="admin" value={mikrotikUser} onChange={e => setMikrotikUser(e.target.value)} />
          <Input label="Senha" type="password" placeholder="••••••••" value={mikrotikPass} onChange={e => setMikrotikPass(e.target.value)} />
        </div>
        <div className="flex items-center gap-3">
          <Button variant="outline" size="sm" onClick={() => testConnection('mikrotik')} className="gap-2">
            <Link className="h-4 w-4" /> Testar Conexão
          </Button>
          {testStatus.mikrotik === 'ok' && <span className="flex items-center gap-1 text-emerald-600 text-sm font-medium"><CheckCircle className="h-4 w-4" /> Conectado</span>}
          {testStatus.mikrotik === 'error' && <span className="flex items-center gap-1 text-red-500 text-sm font-medium"><AlertCircle className="h-4 w-4" /> Falhou — verifique o IP/usuário</span>}
        </div>
        <div className="p-4 rounded-xl bg-amber-50 border border-amber-200">
          <p className="text-xs text-amber-800 font-medium">⚠️ O servidor Mikrotik deve estar acessível pelo IP público ou via VPN. Veja o guia de integração na aba Integrações do README.</p>
        </div>
      </Card>

      <div className="flex justify-end">
        <Button className="gap-2"><Save className="h-4 w-4" /> Salvar Integrações</Button>
      </div>
    </div>
  );
};

// ─── Componente Principal ─────────────────────────────────────────
type Tab = 'geral' | 'seguranca' | 'notificacoes' | 'integracoes';

export const AdminSettings: React.FC = () => {
  const [activeTab, setActiveTab] = useState<Tab>('geral');

  const tabs: { id: Tab; icon: React.ElementType; label: string }[] = [
    { id: 'geral',        icon: Globe,    label: 'Geral' },
    { id: 'seguranca',    icon: Shield,   label: 'Segurança' },
    { id: 'notificacoes', icon: Bell,     label: 'Notificações' },
    { id: 'integracoes',  icon: Database, label: 'Integrações' },
  ];

  return (
    <div className="space-y-6">
      <header>
        <h1 className="text-2xl font-bold text-slate-900">Configurações do Sistema</h1>
        <p className="text-slate-500">Ajuste os parâmetros da GigaNet Telecom</p>
      </header>

      <div className="grid gap-6 md:grid-cols-3">
        {/* Menu lateral */}
        <div className="md:col-span-1 space-y-2">
          {tabs.map((tab) => (
            <button
              key={tab.id}
              onClick={() => setActiveTab(tab.id)}
              className={cn(
                'flex w-full items-center gap-3 rounded-xl px-4 py-3 text-sm font-medium transition-all text-left',
                activeTab === tab.id
                  ? 'bg-primary text-white shadow-md shadow-primary/20'
                  : 'bg-white text-slate-600 hover:bg-slate-50 border border-slate-100'
              )}
            >
              <tab.icon className="h-5 w-5 flex-shrink-0" />
              {tab.label}
            </button>
          ))}
        </div>

        {/* Conteúdo da aba */}
        <div className="md:col-span-2">
          {activeTab === 'geral'        && <TabGeral />}
          {activeTab === 'seguranca'    && <TabSeguranca />}
          {activeTab === 'notificacoes' && <TabNotificacoes />}
          {activeTab === 'integracoes'  && <TabIntegracoes />}
        </div>
      </div>
    </div>
  );
};
