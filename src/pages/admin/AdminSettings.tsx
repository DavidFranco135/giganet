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

// ─── Aba: Integrações (IXC Soft) ─────────────────────────────────
const TabIntegracoes: React.FC = () => {
  const [ixcUrl, setIxcUrl]       = useState('');
  const [ixcToken, setIxcToken]   = useState('');
  const [showToken, setShowToken] = useState(false);
  const [testing, setTesting]     = useState(false);
  const [saved, setSaved]         = useState(false);
  const [testStatus, setTestStatus] = useState<'idle' | 'ok' | 'error'>('idle');
  const [testMsg, setTestMsg]     = useState('');

  // URL do webhook — em produção vem do domínio real
  const webhookUrl = `${window.location.origin}/api/webhooks/ixc`;

  const handleCopyWebhook = () => {
    navigator.clipboard.writeText(webhookUrl);
  };

  const handleTest = async () => {
    if (!ixcUrl || !ixcToken) {
      setTestStatus('error');
      setTestMsg('Preencha a URL e o Token antes de testar.');
      return;
    }
    setTesting(true);
    setTestStatus('idle');
    try {
      // Chama o endpoint do próprio servidor que testa a conexão com o IXC
      const res = await fetch('/api/ixc/test', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ ixcUrl, ixcToken }),
      });
      const data = await res.json();
      if (res.ok && data.ok) {
        setTestStatus('ok');
        setTestMsg(`Conectado! Versão IXC: ${data.version || 'detectada'}`);
      } else {
        setTestStatus('error');
        setTestMsg(data.error || 'Falha na conexão. Verifique a URL e o Token.');
      }
    } catch {
      setTestStatus('error');
      setTestMsg('Não foi possível alcançar o servidor IXC.');
    } finally {
      setTesting(false);
    }
  };

  const handleSave = () => {
    // Em produção: salvar no Firestore ou enviar para o servidor atualizar o .env
    setSaved(true);
    setTimeout(() => setSaved(false), 2500);
  };

  return (
    <div className="space-y-6">

      {/* Card principal IXC */}
      <Card className="space-y-5">
        {/* Header */}
        <div className="flex items-center gap-4">
          <div className="h-12 w-12 rounded-xl bg-blue-600 flex items-center justify-center shadow-md shadow-blue-200">
            <span className="text-white font-black text-lg">IX</span>
          </div>
          <div>
            <h3 className="font-bold text-slate-900 text-base">IXC Soft — ERP do Provedor</h3>
            <p className="text-xs text-slate-500">Sincroniza clientes, faturas, status de conexão e desbloqueios</p>
          </div>
          {testStatus === 'ok' && (
            <span className="ml-auto flex items-center gap-1.5 px-3 py-1 rounded-full bg-emerald-50 text-emerald-600 text-xs font-bold">
              <span className="h-2 w-2 rounded-full bg-emerald-500 animate-pulse" />
              Conectado
            </span>
          )}
        </div>

        <div className="h-px bg-slate-100" />

        {/* Campos */}
        <div className="space-y-4">
          <Input
            label="URL do Servidor IXC"
            placeholder="https://ixc.suaempresa.com.br"
            value={ixcUrl}
            onChange={e => setIxcUrl(e.target.value)}
          />
          <p className="text-xs text-slate-400 -mt-2">
            Endereço que você usa para acessar o IXC no navegador, sem barra no final.
          </p>

          <div className="relative">
            <Input
              label="Token de Acesso"
              type={showToken ? 'text' : 'password'}
              placeholder="Cole aqui o token gerado no IXC"
              value={ixcToken}
              onChange={e => setIxcToken(e.target.value)}
            />
            <button
              type="button"
              onClick={() => setShowToken(v => !v)}
              className="absolute right-3 top-8 text-xs text-slate-400 hover:text-primary transition-colors"
            >
              {showToken ? 'Ocultar' : 'Mostrar'}
            </button>
          </div>
          <p className="text-xs text-slate-400 -mt-2">
            No IXC: <span className="font-medium text-slate-600">Configurações → Usuários → [usuário api] → Token de acesso</span>
          </p>
        </div>

        {/* Resultado do teste */}
        {testStatus !== 'idle' && (
          <div className={cn(
            'flex items-center gap-3 p-3 rounded-xl text-sm font-medium',
            testStatus === 'ok'
              ? 'bg-emerald-50 text-emerald-700 border border-emerald-200'
              : 'bg-red-50 text-red-700 border border-red-200'
          )}>
            {testStatus === 'ok'
              ? <CheckCircle className="h-4 w-4 flex-shrink-0" />
              : <AlertCircle className="h-4 w-4 flex-shrink-0" />}
            {testMsg}
          </div>
        )}

        {/* Ações */}
        <div className="flex gap-3">
          <Button
            variant="outline"
            size="sm"
            onClick={handleTest}
            isLoading={testing}
            className="gap-2"
          >
            <Link className="h-4 w-4" />
            {testing ? 'Testando...' : 'Testar Conexão'}
          </Button>
          <Button onClick={handleSave} size="sm" className="gap-2 ml-auto">
            {saved
              ? <><CheckCircle className="h-4 w-4" /> Salvo!</>
              : <><Save className="h-4 w-4" /> Salvar</>}
          </Button>
        </div>
      </Card>

      {/* Card Webhook */}
      <Card className="space-y-4">
        <div className="flex items-center gap-3">
          <div className="h-10 w-10 rounded-xl bg-violet-50 flex items-center justify-center text-violet-600">
            <Link className="h-5 w-5" />
          </div>
          <div>
            <h3 className="font-bold text-slate-900">Webhook — Notificações Automáticas</h3>
            <p className="text-xs text-slate-500">O IXC avisa o app quando um cliente é bloqueado ou paga uma fatura</p>
          </div>
        </div>

        <div className="p-4 bg-slate-50 rounded-xl space-y-2">
          <p className="text-xs font-semibold text-slate-500 uppercase tracking-wider">URL para cadastrar no IXC</p>
          <div className="flex items-center gap-2">
            <code className="flex-1 text-xs text-slate-800 bg-white border border-slate-200 rounded-lg px-3 py-2 break-all">
              {webhookUrl}
            </code>
            <button
              onClick={handleCopyWebhook}
              className="h-9 w-9 flex-shrink-0 rounded-lg bg-white border border-slate-200 flex items-center justify-center hover:bg-slate-100 transition-colors"
              title="Copiar URL"
            >
              <CheckCircle className="h-4 w-4 text-slate-500" />
            </button>
          </div>
        </div>

        <div className="p-4 rounded-xl bg-blue-50 border border-blue-200 space-y-1">
          <p className="text-xs font-semibold text-blue-800">Como cadastrar no IXC:</p>
          <p className="text-xs text-blue-700">
            Acesse <span className="font-medium">Configurações → Integrações → Webhooks → Novo</span>, cole a URL acima e selecione os eventos: <span className="font-medium">Bloqueio financeiro, Desbloqueio, Pagamento recebido.</span>
          </p>
        </div>
      </Card>

      {/* Card o que é sincronizado */}
      <Card className="space-y-3">
        <h3 className="font-bold text-slate-900">O que é sincronizado com o IXC</h3>
        <div className="grid grid-cols-2 gap-3">
          {[
            { label: 'Status de Conexão', desc: 'Online / Offline / Bloqueado', ok: true },
            { label: 'Faturas', desc: 'Em aberto, pagas e atrasadas', ok: true },
            { label: 'PIX e Boleto', desc: 'Gerados direto pelo IXC', ok: true },
            { label: 'Desbloqueio de Confiança', desc: 'Solicitado pelo app', ok: true },
            { label: 'Dados do Contrato', desc: 'Plano e velocidade', ok: true },
            { label: 'Bloqueio Automático', desc: 'Via Webhook em tempo real', ok: true },
          ].map((item, i) => (
            <div key={i} className="flex items-start gap-2 p-3 rounded-xl bg-slate-50">
              <CheckCircle className="h-4 w-4 text-emerald-500 flex-shrink-0 mt-0.5" />
              <div>
                <p className="text-xs font-semibold text-slate-800">{item.label}</p>
                <p className="text-[10px] text-slate-500">{item.desc}</p>
              </div>
            </div>
          ))}
        </div>
      </Card>

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
