import React, { useState, useEffect, useRef } from 'react';
import { useAuth } from '../contexts/AuthContext';
import { Card, Button, cn } from '../components/UI';
import {
  Wifi, WifiOff, AlertTriangle, Download, Copy,
  Headphones, FileText, X, CheckCircle, ChevronLeft, ChevronRight,
  ExternalLink, Router,
} from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import { motion, AnimatePresence } from 'motion/react';
import { collection, getDocs } from 'firebase/firestore';
import { db } from '../lib/firebase';
import { getAvatarUrl } from '../lib/imgbbService';
import type { Announcement, DeviceImage } from '../types';

// ── Modal Genérico ─────────────────────────────────────────────
const Modal: React.FC<{
  open: boolean; onClose: () => void; title: string; children: React.ReactNode;
}> = ({ open, onClose, title, children }) => (
  <AnimatePresence>
    {open && (
      <motion.div
        className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/40 backdrop-blur-sm"
        initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}
        onClick={onClose}
      >
        <motion.div
          className="bg-white rounded-2xl shadow-2xl w-full max-w-md p-6"
          initial={{ scale: 0.9, opacity: 0, y: 20 }}
          animate={{ scale: 1, opacity: 1, y: 0 }}
          exit={{ scale: 0.9, opacity: 0 }}
          onClick={e => e.stopPropagation()}
        >
          <div className="flex items-center justify-between mb-5">
            <h2 className="text-lg font-bold text-slate-900">{title}</h2>
            <button onClick={onClose} className="h-8 w-8 rounded-full bg-slate-100 flex items-center justify-center hover:bg-slate-200 transition-colors">
              <X className="h-4 w-4 text-slate-600" />
            </button>
          </div>
          {children}
        </motion.div>
      </motion.div>
    )}
  </AnimatePresence>
);

const PixModal: React.FC<{ open: boolean; onClose: () => void }> = ({ open, onClose }) => {
  const [copied, setCopied] = useState(false);
  const pixCode = '00020126360014BR.GOV.BCB.PIX0114+5511999999999520400005303986540599.905802BR5920GigaNet Telecom6009SAO PAULO62070503***6304ABCD';
  return (
    <Modal open={open} onClose={onClose} title="Pagar com PIX">
      <div className="space-y-5">
        <div className="text-center p-6 bg-slate-50 rounded-xl space-y-3">
          <p className="text-sm text-slate-500">Valor a pagar</p>
          <p className="text-4xl font-bold text-slate-900">R$ 99,90</p>
          <p className="text-xs text-slate-400">Vencimento: 10/03/2024</p>
        </div>
        <div className="flex justify-center">
          <img src="https://api.qrserver.com/v1/create-qr-code/?size=200x200&data=PIX_GIGANET_99.90" alt="QR Code PIX" className="h-48 w-48 rounded-xl border border-slate-200" />
        </div>
        <div className="p-3 bg-slate-100 rounded-xl text-[10px] text-slate-600 break-all font-mono leading-relaxed">{pixCode}</div>
        <Button onClick={() => { navigator.clipboard.writeText(pixCode); setCopied(true); setTimeout(() => setCopied(false), 2000); }}
          className={cn('w-full gap-2 transition-all', copied && 'bg-emerald-500')}>
          {copied ? <><CheckCircle className="h-4 w-4" /> Copiado!</> : <><Copy className="h-4 w-4" /> Copiar código PIX</>}
        </Button>
        <p className="text-center text-xs text-slate-400">Confirmado em até 30 segundos</p>
      </div>
    </Modal>
  );
};

const SegundaViaModal: React.FC<{ open: boolean; onClose: () => void }> = ({ open, onClose }) => (
  <Modal open={open} onClose={onClose} title="2ª Via de Fatura">
    <div className="space-y-4">
      {[
        { month: 'Março 2024', value: 'R$ 99,90', status: 'pending', statusLabel: 'Em aberto' },
        { month: 'Fevereiro 2024', value: 'R$ 99,90', status: 'paid', statusLabel: 'Pago' },
        { month: 'Janeiro 2024', value: 'R$ 99,90', status: 'paid', statusLabel: 'Pago' },
      ].map((inv, i) => (
        <div key={i} className="flex items-center justify-between p-4 bg-slate-50 rounded-xl">
          <div>
            <p className="font-semibold text-slate-900 text-sm">{inv.month}</p>
            <p className="text-xs text-slate-500">{inv.value}</p>
          </div>
          <div className="flex items-center gap-3">
            <span className={cn('text-[10px] font-bold uppercase px-2 py-1 rounded-full', inv.status === 'paid' ? 'bg-emerald-50 text-emerald-600' : 'bg-red-50 text-red-500')}>{inv.statusLabel}</span>
            <button className="h-8 w-8 rounded-lg bg-white border border-slate-200 flex items-center justify-center hover:bg-slate-100">
              <Download className="h-4 w-4 text-slate-500" />
            </button>
          </div>
        </div>
      ))}
    </div>
  </Modal>
);

const DesbloqueioModal: React.FC<{ open: boolean; onClose: () => void }> = ({ open, onClose }) => {
  const [sent, setSent] = useState(false);
  return (
    <Modal open={open} onClose={onClose} title="Solicitar Desbloqueio">
      {!sent ? (
        <div className="space-y-5">
          <div className="p-4 bg-amber-50 border border-amber-200 rounded-xl flex items-start gap-3">
            <AlertTriangle className="h-5 w-5 text-amber-500 flex-shrink-0 mt-0.5" />
            <div>
              <p className="text-sm font-semibold text-amber-800">Conexão Bloqueada</p>
              <p className="text-xs text-amber-700 mt-1">Solicite desbloqueio de confiança por até 48h enquanto regulariza o pagamento.</p>
            </div>
          </div>
          <Button className="w-full" onClick={() => setSent(true)}>Solicitar Desbloqueio Emergencial</Button>
        </div>
      ) : (
        <div className="text-center space-y-4 py-4">
          <div className="h-16 w-16 bg-emerald-50 rounded-full flex items-center justify-center mx-auto">
            <CheckCircle className="h-8 w-8 text-emerald-500" />
          </div>
          <h3 className="text-lg font-bold text-slate-900">Desbloqueio Solicitado!</h3>
          <p className="text-sm text-slate-500">Nossa equipe irá processar em até 10 minutos.</p>
          <Button className="w-full" onClick={onClose}>Fechar</Button>
        </div>
      )}
    </Modal>
  );
};

// ══════════════════════════════════════════════════════════════
//  CARROSSEL UNIVERSAL
//  - Botões laterais visíveis no hover
//  - Indicadores de posição
//  - Autoplay com pause no hover
// ══════════════════════════════════════════════════════════════
interface SlideItem {
  id: string;
  imageUrl: string;
  title: string;
  subtitle?: string;
  link?: string;
}

const Carousel: React.FC<{
  slides: SlideItem[];
  autoplay?: boolean;
  height?: string;
  showOverlay?: boolean;
}> = ({ slides, autoplay = true, height = 'h-48', showOverlay = true }) => {
  const [idx, setIdx] = useState(0);
  const [paused, setPaused] = useState(false);
  const intervalRef = useRef<ReturnType<typeof setInterval> | null>(null);

  useEffect(() => {
    if (!autoplay || slides.length < 2 || paused) return;
    intervalRef.current = setInterval(() => setIdx(i => (i + 1) % slides.length), 4500);
    return () => { if (intervalRef.current) clearInterval(intervalRef.current); };
  }, [autoplay, slides.length, paused]);

  const go = (dir: 1 | -1) => {
    setIdx(i => (i + dir + slides.length) % slides.length);
    if (intervalRef.current) clearInterval(intervalRef.current);
  };

  if (!slides.length) return null;
  const s = slides[idx];

  return (
    <div
      className={cn('relative rounded-2xl overflow-hidden shadow-sm group select-none', height)}
      onMouseEnter={() => setPaused(true)}
      onMouseLeave={() => setPaused(false)}
    >
      <AnimatePresence mode="wait">
        <motion.div
          key={s.id}
          className="absolute inset-0"
          initial={{ opacity: 0, x: 32 }}
          animate={{ opacity: 1, x: 0 }}
          exit={{ opacity: 0, x: -32 }}
          transition={{ duration: 0.32, ease: 'easeInOut' }}
        >
          <img
            src={s.imageUrl}
            alt={s.title}
            className="w-full h-full object-cover"
            referrerPolicy="no-referrer"
            onError={e => {
              (e.target as HTMLImageElement).src = 'https://placehold.co/800x300/004aad/white?text=' + encodeURIComponent(s.title);
            }}
          />
          {showOverlay && (
            <div className="absolute inset-0 bg-gradient-to-t from-black/65 via-black/10 to-transparent" />
          )}
        </motion.div>
      </AnimatePresence>

      {/* Texto */}
      {showOverlay && (
        <div className="absolute bottom-0 left-0 right-0 p-4 z-10 pointer-events-none">
          <AnimatePresence mode="wait">
            <motion.div
              key={s.id + '_t'}
              initial={{ opacity: 0, y: 8 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0 }}
              transition={{ delay: 0.15, duration: 0.25 }}
            >
              <p className="text-white font-bold leading-tight drop-shadow-sm">{s.title}</p>
              {s.subtitle && <p className="text-white/75 text-xs mt-0.5 drop-shadow-sm">{s.subtitle}</p>}
              {s.link && (
                <a
                  href={s.link}
                  target="_blank"
                  rel="noreferrer"
                  className="pointer-events-auto mt-1.5 inline-flex items-center gap-1 text-xs text-white/90 hover:text-white underline"
                >
                  Saiba mais <ExternalLink className="h-3 w-3" />
                </a>
              )}
            </motion.div>
          </AnimatePresence>
        </div>
      )}

      {/* Botões prev/next */}
      {slides.length > 1 && (
        <>
          <button
            onClick={() => go(-1)}
            className="absolute left-2 top-1/2 -translate-y-1/2 z-20 h-9 w-9 rounded-full bg-black/35 hover:bg-black/60 backdrop-blur-sm flex items-center justify-center text-white transition-all duration-200 opacity-0 group-hover:opacity-100 active:scale-90"
          >
            <ChevronLeft className="h-5 w-5" />
          </button>
          <button
            onClick={() => go(1)}
            className="absolute right-2 top-1/2 -translate-y-1/2 z-20 h-9 w-9 rounded-full bg-black/35 hover:bg-black/60 backdrop-blur-sm flex items-center justify-center text-white transition-all duration-200 opacity-0 group-hover:opacity-100 active:scale-90"
          >
            <ChevronRight className="h-5 w-5" />
          </button>

          {/* Dots */}
          <div className="absolute bottom-3 right-4 z-20 flex gap-1.5 items-center">
            {slides.map((_, i) => (
              <button
                key={i}
                onClick={() => setIdx(i)}
                className={cn(
                  'rounded-full transition-all duration-300',
                  i === idx ? 'bg-white w-5 h-1.5' : 'bg-white/50 w-1.5 h-1.5'
                )}
              />
            ))}
          </div>
        </>
      )}
    </div>
  );
};

// ── Slide de Anúncios (busca sem índice composto) ──────────────
const AnnouncementSlider: React.FC = () => {
  const [slides, setSlides] = useState<SlideItem[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    getDocs(collection(db, 'announcements'))
      .then(snap => {
        const all = snap.docs.map(d => ({ id: d.id, ...(d.data() as Announcement) }));
        // filtra ativos e ordena por "ordem" — sem índice composto
        const active = all
          .filter(a => a.ativo !== false)
          .sort((a, b) => (a.ordem ?? 0) - (b.ordem ?? 0));
        setSlides(active.map(a => ({
          id: a.id,
          imageUrl: a.imagemUrl,
          title: a.titulo,
          subtitle: a.descricao,
          link: a.link,
        })));
      })
      .catch(err => console.warn('[AnnouncementSlider] erro:', err))
      .finally(() => setLoading(false));
  }, []);

  if (loading) {
    return <div className="h-48 rounded-2xl bg-slate-100 animate-pulse" />;
  }
  if (!slides.length) return null;

  return <Carousel slides={slides} autoplay height="h-48" showOverlay />;
};

// ── Slide de Dispositivos ──────────────────────────────────────
const DeviceSlider: React.FC = () => {
  const [slides, setSlides] = useState<SlideItem[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    getDocs(collection(db, 'deviceImages'))
      .then(snap => {
        const all = snap.docs.map(d => ({ id: d.id, ...(d.data() as DeviceImage) }));
        const active = all
          .filter(d => d.ativo !== false)
          .sort((a, b) => new Date(b.criadoEm).getTime() - new Date(a.criadoEm).getTime());
        setSlides(active.map(d => ({
          id: d.id,
          imageUrl: d.imagemUrl,
          title: d.nome,
          subtitle: d.descricao,
        })));
      })
      .catch(err => console.warn('[DeviceSlider] erro:', err))
      .finally(() => setLoading(false));
  }, []);

  if (loading || !slides.length) return null;

  return (
    <div className="space-y-3">
      <div className="flex items-center gap-2">
        <div className="h-6 w-6 rounded-lg bg-primary/10 flex items-center justify-center">
          <Router className="h-3.5 w-3.5 text-primary" />
        </div>
        <span className="text-sm font-bold text-slate-700 uppercase tracking-wider">
          Equipamentos Disponíveis
        </span>
      </div>
      <Carousel slides={slides} autoplay={false} height="h-44" showOverlay />
    </div>
  );
};

// ══════════════════════════════════════════════════════════════
//  PÁGINA PRINCIPAL
// ══════════════════════════════════════════════════════════════
export const ClientHome: React.FC = () => {
  const { profile } = useAuth();
  const navigate    = useNavigate();
  const [modal, setModal] = useState<'pix' | 'segunda_via' | 'desbloqueio' | null>(null);

  const statusConfig = {
    online:  { icon: Wifi,          color: 'text-emerald-500', bg: 'bg-emerald-50', label: 'Conectado' },
    offline: { icon: WifiOff,       color: 'text-red-500',     bg: 'bg-red-50',     label: 'Desconectado' },
    blocked: { icon: AlertTriangle, color: 'text-amber-500',   bg: 'bg-amber-50',   label: 'Bloqueado' },
  };
  const status = statusConfig[profile?.statusConexao ?? 'offline'];
  const avatar = getAvatarUrl(profile?.uid ?? '', profile?.fotoUrl);

  return (
    <div className="space-y-6">
      <PixModal         open={modal === 'pix'}          onClose={() => setModal(null)} />
      <SegundaViaModal  open={modal === 'segunda_via'}  onClose={() => setModal(null)} />
      <DesbloqueioModal open={modal === 'desbloqueio'}  onClose={() => setModal(null)} />

      {/* Header */}
      <header className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-slate-900">
            Olá, {profile?.nome?.split(' ')[0] ?? 'Cliente'}
          </h1>
          <p className="text-slate-500">Nº do cliente: {profile?.numeroCliente}</p>
        </div>
        <button
          onClick={() => navigate('/profile')}
          className="h-12 w-12 rounded-full bg-slate-200 overflow-hidden border-2 border-white shadow-md hover:ring-2 hover:ring-primary transition-all"
        >
          <img src={avatar} alt="Avatar" referrerPolicy="no-referrer" className="h-full w-full object-cover" />
        </button>
      </header>

      {/* SLIDE DE ANÚNCIOS */}
      <AnnouncementSlider />

      {/* Cards */}
      <div className="grid gap-6 md:grid-cols-2">
        <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }}>
          <Card className="h-full flex flex-col justify-between">
            <div className="flex items-center justify-between mb-4">
              <span className="text-sm font-medium text-slate-500 uppercase tracking-wider">Status da Conexão</span>
              <div className={cn('flex items-center gap-2 px-3 py-1 rounded-full text-xs font-bold uppercase', status.bg, status.color)}>
                <status.icon className="h-3 w-3" />{status.label}
              </div>
            </div>
            <div className="space-y-1">
              <p className="text-3xl font-bold text-slate-900">500MB</p>
              <p className="text-slate-500">Plano Giga Fibra</p>
            </div>
            <div className="mt-6 pt-6 border-t border-slate-100 flex items-center justify-between text-sm">
              <span className="text-slate-500">IP: 187.45.122.10</span>
              <button className="text-primary font-medium hover:underline" onClick={() => navigate('/profile')}>Ver detalhes</button>
            </div>
          </Card>
        </motion.div>

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
              <Button variant="accent" className="flex-1" onClick={() => setModal('pix')}>PAGAR AGORA</Button>
              <Button variant="outline" className="px-3" onClick={() => setModal('segunda_via')}>
                <Download className="h-5 w-5" />
              </Button>
            </div>
          </Card>
        </motion.div>
      </div>

      {/* Ações rápidas */}
      <div className="grid grid-cols-2 gap-4 md:grid-cols-4">
        {([
          { label: 'Gerar PIX',   icon: Copy,          color: 'bg-blue-500',    action: () => setModal('pix') },
          { label: '2ª Via',      icon: FileText,       color: 'bg-indigo-500',  action: () => setModal('segunda_via') },
          { label: 'Desbloqueio', icon: AlertTriangle,  color: 'bg-amber-500',   action: () => setModal('desbloqueio') },
          { label: 'Suporte',     icon: Headphones,     color: 'bg-emerald-500', action: () => navigate('/support') },
        ] as const).map((a, i) => (
          <button
            key={i}
            onClick={a.action}
            className="flex flex-col items-center gap-2 p-4 rounded-2xl bg-white border border-slate-100 shadow-sm hover:bg-slate-50 hover:shadow-md transition-all active:scale-95"
          >
            <div className={cn('h-10 w-10 rounded-xl flex items-center justify-center text-white', a.color)}>
              <a.icon className="h-5 w-5" />
            </div>
            <span className="text-xs font-medium text-slate-700">{a.label}</span>
          </button>
        ))}
      </div>

      {/* SLIDE DE DISPOSITIVOS */}
      <DeviceSlider />

      {/* Banner */}
      <Card className="bg-primary text-white overflow-hidden relative">
        <div className="relative z-10">
          <h3 className="text-xl font-bold mb-2">Indique e Ganhe!</h3>
          <p className="text-blue-200 mb-4 max-w-xs">Indique um amigo e ganhe 50% de desconto na sua próxima fatura.</p>
          <Button variant="secondary" size="sm">Saber mais</Button>
        </div>
        <div className="absolute right-[-20px] bottom-[-20px] opacity-10">
          <Wifi className="h-40 w-40" />
        </div>
      </Card>
    </div>
  );
};
