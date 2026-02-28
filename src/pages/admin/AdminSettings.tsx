import React, { useState, useRef, useEffect } from 'react';
import { Card, Button, Input, cn } from '../../components/UI';
import {
  Shield, Bell, Globe, Database, Save, Key, Link,
  CheckCircle, AlertCircle, Image, Upload, Loader2,
  Trash2, Eye, EyeOff, Plus, Monitor,
} from 'lucide-react';
import {
  collection, addDoc, getDocs, updateDoc, deleteDoc, doc, orderBy, query,
} from 'firebase/firestore';
import { db } from '../../lib/firebase';
import { uploadFileToImgBB } from '../../lib/imgbbService';
import type { Announcement, DeviceImage, Plan } from '../../types';

// ─── Upload Zone ──────────────────────────────────────────────
interface UploadZoneProps {
  currentUrl?: string;
  onUploaded: (url: string) => void;
  label?: string;
  uploading: boolean;
  setUploading: (v: boolean) => void;
  uploadName?: string;
}

const UploadZone: React.FC<UploadZoneProps> = ({
  currentUrl, onUploaded, label, uploading, setUploading, uploadName,
}) => {
  const ref = useRef<HTMLInputElement>(null);
  const [error, setError] = useState('');

  const handleFile = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    setError('');
    setUploading(true);
    try {
      const result = await uploadFileToImgBB(file, uploadName || file.name);
      onUploaded(result.url);
    } catch (err: unknown) {
      setError(err instanceof Error ? err.message : 'Erro no upload');
    } finally {
      setUploading(false);
      if (ref.current) ref.current.value = '';
    }
  };

  return (
    <div className="space-y-2">
      {label && <p className="text-sm font-medium text-slate-700">{label}</p>}
      <div
        onClick={() => !uploading && ref.current?.click()}
        className={cn(
          'relative h-36 w-full rounded-xl border-2 border-dashed flex items-center justify-center cursor-pointer overflow-hidden transition-colors',
          currentUrl ? 'border-primary/30' : 'border-slate-200 hover:border-primary',
          uploading && 'opacity-60 cursor-not-allowed',
        )}
      >
        {currentUrl ? (
          <>
            <img src={currentUrl} alt="" className="h-full w-full object-cover" />
            <div className="absolute inset-0 bg-black/40 opacity-0 hover:opacity-100 transition-opacity flex items-center justify-center">
              <span className="text-white text-sm font-medium flex items-center gap-2">
                <Upload className="h-4 w-4" /> Trocar imagem
              </span>
            </div>
          </>
        ) : (
          <div className="text-center space-y-2 text-slate-400">
            {uploading
              ? <Loader2 className="h-8 w-8 mx-auto animate-spin text-primary" />
              : <Image className="h-8 w-8 mx-auto" />}
            <p className="text-xs">{uploading ? 'Enviando para ImgBB...' : 'Clique para selecionar'}</p>
            <p className="text-[10px] text-slate-300">JPEG, PNG, WebP — máx 32MB</p>
          </div>
        )}
      </div>
      {error && <p className="text-xs text-red-500">{error}</p>}
      <input ref={ref} type="file" accept="image/*" className="hidden" onChange={handleFile} />
    </div>
  );
};

// ─── Sub-aba: Dispositivos ────────────────────────────────────
const TabDispositivos: React.FC = () => {
  const [devices, setDevices]     = useState<DeviceImage[]>([]);
  const [loading, setLoading]     = useState(true);
  const [uploading, setUploading] = useState(false);
  const [newNome, setNewNome]     = useState('');
  const [newDesc, setNewDesc]     = useState('');
  const [newUrl, setNewUrl]       = useState('');
  const [saving, setSaving]       = useState(false);

  const load = async () => {
    setLoading(true);
    try {
      const snap = await getDocs(query(collection(db, 'deviceImages'), orderBy('criadoEm', 'desc')));
      setDevices(snap.docs.map(d => ({ id: d.id, ...d.data() } as DeviceImage)));
    } catch { /* coleção vazia */ }
    finally { setLoading(false); }
  };

  useEffect(() => { load(); }, []);

  const handleAdd = async () => {
    if (!newNome || !newUrl) return;
    setSaving(true);
    try {
      await addDoc(collection(db, 'deviceImages'), {
        nome: newNome, descricao: newDesc, imagemUrl: newUrl,
        ativo: true, criadoEm: new Date().toISOString(),
      });
      setNewNome(''); setNewDesc(''); setNewUrl('');
      await load();
    } finally { setSaving(false); }
  };

  const toggleAtivo = async (d: DeviceImage) => {
    await updateDoc(doc(db, 'deviceImages', d.id), { ativo: !d.ativo });
    setDevices(prev => prev.map(x => x.id === d.id ? { ...x, ativo: !x.ativo } : x));
  };

  const handleDelete = async (id: string) => {
    if (!confirm('Remover este dispositivo?')) return;
    await deleteDoc(doc(db, 'deviceImages', id));
    setDevices(prev => prev.filter(x => x.id !== id));
  };

  return (
    <div className="space-y-6">
      <Card className="space-y-4">
        <h3 className="font-bold text-slate-900 flex items-center gap-2">
          <Monitor className="h-5 w-5 text-primary" /> Adicionar Dispositivo / Equipamento
        </h3>
        <UploadZone
          label="Foto do dispositivo"
          currentUrl={newUrl}
          onUploaded={setNewUrl}
          uploading={uploading}
          setUploading={setUploading}
          uploadName="device"
        />
        <div className="grid gap-3 md:grid-cols-2">
          <Input label="Nome" placeholder="Ex: Roteador Wi-Fi 6 AX3000" value={newNome} onChange={e => setNewNome(e.target.value)} />
          <Input label="Descrição (opcional)" placeholder="Ex: Dual Band, 3000Mbps" value={newDesc} onChange={e => setNewDesc(e.target.value)} />
        </div>
        <div className="flex justify-end">
          <Button onClick={handleAdd} isLoading={saving} disabled={!newNome || !newUrl} className="gap-2">
            <Plus className="h-4 w-4" /> Adicionar
          </Button>
        </div>
      </Card>

      <Card className="space-y-4">
        <h3 className="font-bold text-slate-900">Dispositivos Cadastrados</h3>
        {loading ? (
          <div className="flex justify-center py-8"><Loader2 className="h-6 w-6 animate-spin text-primary" /></div>
        ) : devices.length === 0 ? (
          <p className="text-sm text-slate-400 text-center py-8">Nenhum dispositivo cadastrado ainda.</p>
        ) : (
          <div className="grid gap-3 md:grid-cols-2">
            {devices.map(d => (
              <div key={d.id} className={cn('flex gap-3 p-3 rounded-xl border', d.ativo ? 'border-slate-100' : 'border-slate-100 opacity-60')}>
                <img src={d.imagemUrl} alt={d.nome} className="h-16 w-16 rounded-lg object-cover flex-shrink-0 border border-slate-100" />
                <div className="flex-1 min-w-0">
                  <p className="font-semibold text-slate-800 text-sm truncate">{d.nome}</p>
                  {d.descricao && <p className="text-xs text-slate-400 truncate">{d.descricao}</p>}
                </div>
                <div className="flex flex-col gap-1">
                  <button onClick={() => toggleAtivo(d)} className="h-7 w-7 rounded-lg flex items-center justify-center hover:bg-slate-100 transition-colors">
                    {d.ativo ? <Eye className="h-4 w-4 text-emerald-500" /> : <EyeOff className="h-4 w-4 text-slate-400" />}
                  </button>
                  <button onClick={() => handleDelete(d.id)} className="h-7 w-7 rounded-lg flex items-center justify-center hover:bg-red-50 transition-colors">
                    <Trash2 className="h-4 w-4 text-red-400" />
                  </button>
                </div>
              </div>
            ))}
          </div>
        )}
      </Card>
    </div>
  );
};

// ─── Sub-aba: Planos ──────────────────────────────────────────
const TabPlanos: React.FC = () => {
  const [plans, setPlans]         = useState<Plan[]>([]);
  const [loading, setLoading]     = useState(true);
  const [uploadingId, setUploadingId] = useState<string | null>(null);

  const load = async () => {
    setLoading(true);
    try {
      const snap = await getDocs(collection(db, 'plans'));
      setPlans(snap.docs.map(d => ({ id: d.id, ...d.data() } as Plan)));
    } catch { }
    finally { setLoading(false); }
  };

  useEffect(() => { load(); }, []);

  const handleUploaded = async (planId: string, url: string) => {
    await updateDoc(doc(db, 'plans', planId), { imagemUrl: url });
    setPlans(prev => prev.map(p => p.id === planId ? { ...p, imagemUrl: url } : p));
  };

  return (
    <Card className="space-y-4">
      <h3 className="font-bold text-slate-900 flex items-center gap-2">
        <Image className="h-5 w-5 text-primary" /> Imagens dos Planos
      </h3>
      <p className="text-sm text-slate-500">Clique na imagem de cada plano para enviar ao ImgBB e salvar automaticamente.</p>
      {loading ? (
        <div className="flex justify-center py-8"><Loader2 className="h-6 w-6 animate-spin text-primary" /></div>
      ) : plans.length === 0 ? (
        <p className="text-sm text-slate-400 text-center py-8">Nenhum plano no Firestore.</p>
      ) : (
        <div className="grid gap-4 md:grid-cols-3">
          {plans.map(plan => (
            <div key={plan.id} className="space-y-2">
              <UploadZone
                label={plan.nome}
                currentUrl={plan.imagemUrl}
                onUploaded={url => handleUploaded(plan.id, url)}
                uploading={uploadingId === plan.id}
                setUploading={v => setUploadingId(v ? plan.id : null)}
                uploadName={`plano_${plan.id}`}
              />
              <p className="text-xs text-slate-500 text-center">
                {plan.velocidade} · R$ {Number(plan.valor).toFixed(2)}/mês
              </p>
            </div>
          ))}
        </div>
      )}
    </Card>
  );
};

// ─── Sub-aba: Anúncios ────────────────────────────────────────
const TabAnuncios: React.FC = () => {
  const [anuncios, setAnuncios]   = useState<Announcement[]>([]);
  const [loading, setLoading]     = useState(true);
  const [uploading, setUploading] = useState(false);
  const [saving, setSaving]       = useState(false);
  const [form, setForm]           = useState({ titulo: '', descricao: '', link: '', imagemUrl: '' });

  const load = async () => {
    setLoading(true);
    try {
      const snap = await getDocs(query(collection(db, 'announcements'), orderBy('ordem', 'asc')));
      setAnuncios(snap.docs.map(d => ({ id: d.id, ...d.data() } as Announcement)));
    } catch { }
    finally { setLoading(false); }
  };

  useEffect(() => { load(); }, []);

  const handleAdd = async () => {
    if (!form.titulo || !form.imagemUrl) return;
    setSaving(true);
    try {
      await addDoc(collection(db, 'announcements'), {
        ...form, ativo: true, ordem: anuncios.length,
        criadoEm: new Date().toISOString(),
      });
      setForm({ titulo: '', descricao: '', link: '', imagemUrl: '' });
      await load();
    } finally { setSaving(false); }
  };

  const toggleAtivo = async (a: Announcement) => {
    await updateDoc(doc(db, 'announcements', a.id), { ativo: !a.ativo });
    setAnuncios(prev => prev.map(x => x.id === a.id ? { ...x, ativo: !x.ativo } : x));
  };

  const handleDelete = async (id: string) => {
    if (!confirm('Remover este anúncio?')) return;
    await deleteDoc(doc(db, 'announcements', id));
    setAnuncios(prev => prev.filter(a => a.id !== id));
  };

  return (
    <div className="space-y-6">
      <Card className="space-y-4">
        <h3 className="font-bold text-slate-900 flex items-center gap-2">
          <Plus className="h-5 w-5 text-primary" /> Novo Anúncio / Banner
        </h3>
        <UploadZone
          label="Imagem do banner"
          currentUrl={form.imagemUrl}
          onUploaded={url => setForm(p => ({ ...p, imagemUrl: url }))}
          uploading={uploading}
          setUploading={setUploading}
          uploadName="banner"
        />
        <div className="grid gap-3 md:grid-cols-2">
          <Input
            label="Título"
            placeholder="Ex: Promoção de Julho!"
            value={form.titulo}
            onChange={e => setForm(p => ({ ...p, titulo: e.target.value }))}
          />
          <Input
            label="Link ao clicar (opcional)"
            placeholder="https://..."
            value={form.link}
            onChange={e => setForm(p => ({ ...p, link: e.target.value }))}
          />
          <div className="md:col-span-2">
            <Input
              label="Descrição (opcional)"
              placeholder="Texto de apoio"
              value={form.descricao}
              onChange={e => setForm(p => ({ ...p, descricao: e.target.value }))}
            />
          </div>
        </div>
        <div className="flex justify-end">
          <Button onClick={handleAdd} isLoading={saving} disabled={!form.titulo || !form.imagemUrl} className="gap-2">
            <Plus className="h-4 w-4" /> Publicar Anúncio
          </Button>
        </div>
      </Card>

      <Card className="space-y-4">
        <h3 className="font-bold text-slate-900">Anúncios Publicados</h3>
        {loading ? (
          <div className="flex justify-center py-8"><Loader2 className="h-6 w-6 animate-spin text-primary" /></div>
        ) : anuncios.length === 0 ? (
          <p className="text-sm text-slate-400 text-center py-8">Nenhum anúncio publicado. Crie o primeiro acima!</p>
        ) : (
          <div className="space-y-3">
            {anuncios.map(a => (
              <div key={a.id} className={cn('flex gap-4 p-3 rounded-xl border transition-all', a.ativo ? 'border-slate-100 bg-white' : 'border-slate-100 bg-slate-50 opacity-60')}>
                <img src={a.imagemUrl} alt={a.titulo} className="h-20 w-32 rounded-lg object-cover flex-shrink-0 border border-slate-100" />
                <div className="flex-1 min-w-0">
                  <p className="font-semibold text-slate-800">{a.titulo}</p>
                  {a.descricao && <p className="text-xs text-slate-400 mt-0.5">{a.descricao}</p>}
                  {a.link && (
                    <a href={a.link} target="_blank" rel="noreferrer" className="text-xs text-primary mt-1 inline-flex items-center gap-1 hover:underline">
                      <Link className="h-3 w-3" /> {a.link}
                    </a>
                  )}
                  <span className={cn('mt-2 inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-[10px] font-bold uppercase', a.ativo ? 'bg-emerald-50 text-emerald-600' : 'bg-slate-100 text-slate-500')}>
                    <span className={cn('h-1.5 w-1.5 rounded-full', a.ativo ? 'bg-emerald-500' : 'bg-slate-400')} />
                    {a.ativo ? 'Visível' : 'Oculto'}
                  </span>
                </div>
                <div className="flex flex-col gap-1 flex-shrink-0">
                  <button onClick={() => toggleAtivo(a)} className="h-8 w-8 rounded-lg flex items-center justify-center hover:bg-slate-100 transition-colors">
                    {a.ativo ? <Eye className="h-4 w-4 text-emerald-500" /> : <EyeOff className="h-4 w-4 text-slate-400" />}
                  </button>
                  <button onClick={() => handleDelete(a.id)} className="h-8 w-8 rounded-lg flex items-center justify-center hover:bg-red-50 transition-colors">
                    <Trash2 className="h-4 w-4 text-red-400" />
                  </button>
                </div>
              </div>
            ))}
          </div>
        )}
      </Card>
    </div>
  );
};

// ─── Aba Mídia (container) ────────────────────────────────────
type MidiaTab = 'anuncios' | 'planos' | 'dispositivos';

const TabMidia: React.FC = () => {
  const [sub, setSub] = useState<MidiaTab>('anuncios');
  const subTabs: { id: MidiaTab; label: string }[] = [
    { id: 'anuncios',     label: '📢 Anúncios' },
    { id: 'planos',       label: '📦 Planos' },
    { id: 'dispositivos', label: '📡 Dispositivos' },
  ];
  return (
    <div className="space-y-5">
      <div className="flex gap-2 flex-wrap">
        {subTabs.map(t => (
          <button
            key={t.id}
            onClick={() => setSub(t.id)}
            className={cn(
              'px-4 py-2 rounded-xl text-sm font-medium transition-all',
              sub === t.id
                ? 'bg-primary text-white shadow-md shadow-primary/20'
                : 'bg-white border border-slate-100 text-slate-600 hover:bg-slate-50'
            )}
          >
            {t.label}
          </button>
        ))}
      </div>
      {sub === 'anuncios'     && <TabAnuncios />}
      {sub === 'planos'       && <TabPlanos />}
      {sub === 'dispositivos' && <TabDispositivos />}
    </div>
  );
};

// ─── Aba Geral ────────────────────────────────────────────────
const TabGeral: React.FC = () => {
  const [saved, setSaved] = useState(false);
  const save = () => { setSaved(true); setTimeout(() => setSaved(false), 2500); };
  return (
    <div className="space-y-6">
      <Card className="space-y-6">
        <h3 className="text-lg font-bold text-slate-900">Informações da Empresa</h3>
        <div className="grid gap-4 md:grid-cols-2">
          <Input label="Nome Fantasia"      defaultValue="GigaNet Telecom" />
          <Input label="CNPJ"               defaultValue="00.000.000/0001-00" />
          <Input label="E-mail de Contato"  defaultValue="contato@giganet.com.br" />
          <Input label="Telefone/WhatsApp"  defaultValue="(00) 00000-0000" />
          <Input label="Cidade"             defaultValue="São Paulo" />
          <Input label="Estado"             defaultValue="SP" />
        </div>
        <div className="pt-4 border-t border-slate-100 flex justify-end">
          <Button onClick={save} className="gap-2">
            {saved ? <><CheckCircle className="h-4 w-4" /> Salvo!</> : <><Save className="h-4 w-4" /> Salvar</>}
          </Button>
        </div>
      </Card>
      <Card className="space-y-6">
        <h3 className="text-lg font-bold text-slate-900">Faturamento</h3>
        <div className="space-y-3">
          {([
            { label: 'Multa por Atraso', desc: 'Percentual após vencimento', defaultVal: '2', suffix: '%' },
            { label: 'Juros Mensais',    desc: 'Percentual ao mês',          defaultVal: '1', suffix: '%' },
            { label: 'Dias de Carência', desc: 'Antes do bloqueio',          defaultVal: '5', suffix: 'dias' },
          ] as const).map((item, i) => (
            <div key={i} className="flex items-center justify-between p-4 rounded-xl bg-slate-50">
              <div>
                <p className="font-medium text-slate-900">{item.label}</p>
                <p className="text-xs text-slate-500">{item.desc}</p>
              </div>
              <div className="flex items-center gap-2">
                <input type="number" defaultValue={item.defaultVal}
                  className="w-16 rounded-lg border border-slate-200 px-2 py-1 text-center text-sm font-bold focus:outline-none focus:border-primary" />
                <span className="text-sm text-slate-500">{item.suffix}</span>
              </div>
            </div>
          ))}
        </div>
        <div className="flex justify-end">
          <Button onClick={save} className="gap-2"><Save className="h-4 w-4" /> Salvar</Button>
        </div>
      </Card>
    </div>
  );
};

// ─── Aba Segurança ────────────────────────────────────────────
const TabSeguranca: React.FC = () => {
  const [show, setShow] = useState(false);
  return (
    <div className="space-y-6">
      <Card className="space-y-6">
        <h3 className="text-lg font-bold text-slate-900">Alterar Senha</h3>
        <div className="space-y-4">
          <Input label="Senha Atual"          type={show ? 'text' : 'password'} placeholder="••••••••" />
          <Input label="Nova Senha"           type={show ? 'text' : 'password'} placeholder="••••••••" />
          <Input label="Confirmar Nova Senha" type={show ? 'text' : 'password'} placeholder="••••••••" />
          <label className="flex items-center gap-2 text-sm text-slate-600 cursor-pointer">
            <input type="checkbox" onChange={e => setShow(e.target.checked)} /> Mostrar senhas
          </label>
        </div>
        <div className="flex justify-end">
          <Button className="gap-2"><Key className="h-4 w-4" /> Atualizar Senha</Button>
        </div>
      </Card>
      <Card className="space-y-4">
        <h3 className="text-lg font-bold text-slate-900">Sessões Ativas</h3>
        {[
          { device: 'Chrome — Windows 11', location: 'São Paulo, BR', time: 'Agora',    active: true },
          { device: 'Safari — iPhone 15',  location: 'São Paulo, BR', time: '2h atrás', active: false },
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

// ─── Aba Notificações ─────────────────────────────────────────
const TabNotificacoes: React.FC = () => {
  const [t, setT] = useState({ novoPagamento: true, atraso: true, novoChamado: true, clienteBloqueado: false, relatorioSemanal: true });
  const toggle = (k: keyof typeof t) => setT(p => ({ ...p, [k]: !p[k] }));
  const items = [
    { key: 'novoPagamento'   as const, label: 'Novo Pagamento Recebido', desc: 'Alerta quando PIX/boleto é confirmado' },
    { key: 'atraso'          as const, label: 'Fatura em Atraso',        desc: 'Notifica clientes inadimplentes' },
    { key: 'novoChamado'     as const, label: 'Novo Chamado de Suporte', desc: 'Alerta ao abrir ticket' },
    { key: 'clienteBloqueado'as const, label: 'Cliente Bloqueado',       desc: 'Bloqueio automático por inadimplência' },
    { key: 'relatorioSemanal'as const, label: 'Relatório Semanal',       desc: 'Resumo toda segunda-feira' },
  ];
  return (
    <Card className="space-y-4">
      <h3 className="text-lg font-bold text-slate-900">Preferências de Notificação</h3>
      <div className="space-y-3">
        {items.map(item => (
          <div key={item.key} className="flex items-center justify-between p-4 rounded-xl bg-slate-50">
            <div>
              <p className="font-medium text-sm text-slate-900">{item.label}</p>
              <p className="text-xs text-slate-500">{item.desc}</p>
            </div>
            <button onClick={() => toggle(item.key)} className={cn('relative inline-flex h-6 w-11 items-center rounded-full transition-colors', t[item.key] ? 'bg-primary' : 'bg-slate-300')}>
              <span className={cn('inline-block h-4 w-4 transform rounded-full bg-white shadow transition-transform', t[item.key] ? 'translate-x-6' : 'translate-x-1')} />
            </button>
          </div>
        ))}
      </div>
      <div className="flex justify-end">
        <Button className="gap-2"><Save className="h-4 w-4" /> Salvar</Button>
      </div>
    </Card>
  );
};

// ─── Aba Integrações ──────────────────────────────────────────
const TabIntegracoes: React.FC = () => {
  const [ixcUrl, setIxcUrl]         = useState('');
  const [ixcToken, setIxcToken]     = useState('');
  const [showToken, setShowToken]   = useState(false);
  const [testing, setTesting]       = useState(false);
  const [saved, setSaved]           = useState(false);
  const [status, setStatus]         = useState<'idle' | 'ok' | 'error'>('idle');
  const [msg, setMsg]               = useState('');
  const webhookUrl = typeof window !== 'undefined' ? `${window.location.origin}/api/webhooks/ixc` : '';

  const test = async () => {
    if (!ixcUrl || !ixcToken) { setStatus('error'); setMsg('Preencha URL e Token.'); return; }
    setTesting(true); setStatus('idle');
    try {
      const res  = await fetch('/api/ixc/test', { method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify({ ixcUrl, ixcToken }) });
      const data = await res.json();
      res.ok && data.ok ? (setStatus('ok'), setMsg(`Conectado! Versão: ${data.version || 'OK'}`)) : (setStatus('error'), setMsg(data.error || 'Falha.'));
    } catch { setStatus('error'); setMsg('Servidor inacessível.'); }
    finally  { setTesting(false); }
  };

  return (
    <div className="space-y-6">
      <Card className="space-y-5">
        <div className="flex items-center gap-4">
          <div className="h-12 w-12 rounded-xl bg-blue-600 flex items-center justify-center shadow-md">
            <span className="text-white font-black text-lg">IX</span>
          </div>
          <div>
            <h3 className="font-bold text-slate-900">IXC Soft — ERP do Provedor</h3>
            <p className="text-xs text-slate-500">Clientes, faturas, status e desbloqueios</p>
          </div>
          {status === 'ok' && (
            <span className="ml-auto flex items-center gap-1.5 px-3 py-1 rounded-full bg-emerald-50 text-emerald-600 text-xs font-bold">
              <span className="h-2 w-2 rounded-full bg-emerald-500 animate-pulse" /> Conectado
            </span>
          )}
        </div>
        <div className="h-px bg-slate-100" />
        <Input label="URL do Servidor IXC" placeholder="https://ixc.suaempresa.com.br" value={ixcUrl} onChange={e => setIxcUrl(e.target.value)} />
        <div className="relative">
          <Input label="Token de Acesso" type={showToken ? 'text' : 'password'} placeholder="Cole o token gerado no IXC" value={ixcToken} onChange={e => setIxcToken(e.target.value)} />
          <button type="button" onClick={() => setShowToken(v => !v)} className="absolute right-3 top-8 text-xs text-slate-400 hover:text-primary">{showToken ? 'Ocultar' : 'Mostrar'}</button>
        </div>
        {status !== 'idle' && (
          <div className={cn('flex items-center gap-3 p-3 rounded-xl text-sm font-medium', status === 'ok' ? 'bg-emerald-50 text-emerald-700 border border-emerald-200' : 'bg-red-50 text-red-700 border border-red-200')}>
            {status === 'ok' ? <CheckCircle className="h-4 w-4" /> : <AlertCircle className="h-4 w-4" />}
            {msg}
          </div>
        )}
        <div className="flex gap-3">
          <Button variant="outline" size="sm" onClick={test} isLoading={testing} className="gap-2">
            <Link className="h-4 w-4" /> {testing ? 'Testando...' : 'Testar Conexão'}
          </Button>
          <Button size="sm" className="gap-2 ml-auto" onClick={() => { setSaved(true); setTimeout(() => setSaved(false), 2500); }}>
            {saved ? <><CheckCircle className="h-4 w-4" /> Salvo!</> : <><Save className="h-4 w-4" /> Salvar</>}
          </Button>
        </div>
      </Card>

      <Card className="space-y-4">
        <div className="flex items-center gap-3">
          <div className="h-10 w-10 rounded-xl bg-violet-50 flex items-center justify-center text-violet-600">
            <Link className="h-5 w-5" />
          </div>
          <h3 className="font-bold text-slate-900">Webhook — Notificações Automáticas</h3>
        </div>
        <div className="p-4 bg-slate-50 rounded-xl space-y-2">
          <p className="text-xs font-semibold text-slate-500 uppercase tracking-wider">URL para cadastrar no IXC</p>
          <div className="flex items-center gap-2">
            <code className="flex-1 text-xs bg-white border border-slate-200 rounded-lg px-3 py-2 break-all">{webhookUrl}</code>
            <button onClick={() => navigator.clipboard.writeText(webhookUrl)} className="h-9 w-9 rounded-lg bg-white border border-slate-200 flex items-center justify-center hover:bg-slate-100 transition-colors">
              <CheckCircle className="h-4 w-4 text-slate-500" />
            </button>
          </div>
        </div>
        <div className="p-4 rounded-xl bg-blue-50 border border-blue-200">
          <p className="text-xs font-semibold text-blue-800">Como cadastrar:</p>
          <p className="text-xs text-blue-700 mt-1">IXC → <strong>Configurações → Integrações → Webhooks → Novo</strong> → cole a URL → eventos: Bloqueio, Desbloqueio, Pagamento.</p>
        </div>
      </Card>
    </div>
  );
};

// ═══════════════════════════════════════════════════════════════
// COMPONENTE PRINCIPAL
// ═══════════════════════════════════════════════════════════════
type Tab = 'geral' | 'midia' | 'seguranca' | 'notificacoes' | 'integracoes';

export const AdminSettings: React.FC = () => {
  const [activeTab, setActiveTab] = useState<Tab>('geral');

  const tabs: { id: Tab; icon: React.ElementType; label: string; badge?: string }[] = [
    { id: 'geral',        icon: Globe,    label: 'Geral' },
    { id: 'midia',        icon: Image,    label: 'Mídia',         badge: 'NOVO' },
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
        <div className="md:col-span-1 space-y-2">
          {tabs.map(tab => (
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
              {tab.badge && (
                <span className={cn(
                  'ml-auto text-[9px] font-black px-1.5 py-0.5 rounded-full uppercase tracking-wide',
                  activeTab === tab.id ? 'bg-white/20 text-white' : 'bg-primary/10 text-primary'
                )}>
                  {tab.badge}
                </span>
              )}
            </button>
          ))}
        </div>

        <div className="md:col-span-2">
          {activeTab === 'geral'        && <TabGeral />}
          {activeTab === 'midia'        && <TabMidia />}
          {activeTab === 'seguranca'    && <TabSeguranca />}
          {activeTab === 'notificacoes' && <TabNotificacoes />}
          {activeTab === 'integracoes'  && <TabIntegracoes />}
        </div>
      </div>
    </div>
  );
};
