import React, { useState, useRef } from 'react';
import { useAuth } from '../contexts/AuthContext';
import { Card, Button } from '../components/UI';
import {
  User, MapPin, Shield, Bell, ChevronRight,
  Camera, Loader2, CheckCircle, LogOut,
} from 'lucide-react';
import { auth, db } from '../lib/firebase';
import { doc, updateDoc } from 'firebase/firestore';
import { uploadFileToImgBB, fileToBase64, getAvatarUrl } from '../lib/imgbbService';

// ─────────────────────────────────────────────────────────────────
// Círculo exato — foto ocupa 100% sem folga de cor
// ─────────────────────────────────────────────────────────────────
interface AvatarProps { src: string; size: number; loading: boolean; onClick: () => void; }

const Avatar: React.FC<AvatarProps> = ({ src, size, loading, onClick }) => {
  const cam = Math.round(size * 0.27);
  return (
    <div onClick={onClick} style={{ position: 'relative', width: `${size}px`, height: `${size}px`, cursor: loading ? 'not-allowed' : 'pointer', flexShrink: 0 }}>

      {/* Círculo: overflow hidden corta a foto exatamente no bordo */}
      <div style={{
        width:        `${size}px`,
        height:       `${size}px`,
        borderRadius: '50%',
        overflow:     'hidden',       // ← foto vai até a borda, sem folga
        boxShadow:    '0 6px 20px rgba(0,0,0,0.15)',
        // SEM border nem backgroundColor — sem anel colorido
      }}>
        {src ? (
          <img
            src={src}
            alt="Foto de perfil"
            style={{
              width:          '100%',
              height:         '100%',
              objectFit:      'cover',   // ← preenche o círculo inteiro
              objectPosition: 'center',
              display:        'block',
            }}
            referrerPolicy="no-referrer"
          />
        ) : (
          <div style={{ width: '100%', height: '100%', backgroundColor: '#e2e8f0', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
            <User style={{ width: size * 0.44, height: size * 0.44, color: '#94a3b8' }} strokeWidth={1.5} />
          </div>
        )}
      </div>

      {/* Badge câmera — outline não ocupa espaço do elemento pai */}
      <div style={{
        position:        'absolute',
        bottom:          0,
        right:           0,
        width:           `${cam}px`,
        height:          `${cam}px`,
        borderRadius:    '50%',
        backgroundColor: '#004aad',
        outline:         '3px solid white',
        display:         'flex',
        alignItems:      'center',
        justifyContent:  'center',
        boxShadow:       '0 2px 6px rgba(0,0,0,0.22)',
      }}>
        {loading
          ? <Loader2 style={{ width: cam * 0.52, height: cam * 0.52, color: 'white', animation: 'spin 1s linear infinite' }} />
          : <Camera  style={{ width: cam * 0.52, height: cam * 0.52, color: 'white' }} />
        }
      </div>
    </div>
  );
};

// ════════════════════════════════════════════════════════════════
export const ProfilePage: React.FC = () => {
  const { user, profile } = useAuth();

  const fileRef                           = useRef<HTMLInputElement>(null);
  const [avatarSrc,  setAvatarSrc  ]      = useState(profile?.fotoUrl ?? '');
  const [uploading,  setUploading  ]      = useState(false);
  const [status,     setStatus     ]      = useState<'idle'|'ok'|'error'>('idle');

  React.useEffect(() => {
    if (profile?.fotoUrl && !avatarSrc) setAvatarSrc(profile.fotoUrl);
  }, [profile?.fotoUrl]);

  const handleFile = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file || !user) return;
    setUploading(true); setStatus('idle');
    const b64 = await fileToBase64(file);
    setAvatarSrc(b64);
    try {
      const res = await uploadFileToImgBB(file, `perfil_${user.uid}_${Date.now()}`);
      setAvatarSrc(res.url);
      await updateDoc(doc(db, 'users', user.uid), { fotoUrl: res.url });
      setStatus('ok');
      setTimeout(() => setStatus('idle'), 3000);
    } catch {
      setAvatarSrc(profile?.fotoUrl ?? '');
      setStatus('error');
    } finally {
      setUploading(false);
      if (fileRef.current) fileRef.current.value = '';
    }
  };

  const finalSrc = avatarSrc || getAvatarUrl(user?.uid ?? 'guest');

  const sections = [
    { icon: User,   label: 'Dados Pessoais',           value: profile?.nome || 'Não informado' },
    { icon: MapPin, label: 'Endereço de Instalação',    value: profile?.endereco?.rua ? `${profile.endereco.rua}, ${profile.endereco.numero}` : 'Não informado' },
    { icon: Shield, label: 'Segurança',                 value: 'Alterar senha' },
    { icon: Bell,   label: 'Notificações',              value: 'Configurar avisos' },
  ];

  return (
    <div className="space-y-6">

      {/* ═══ Header ═══ */}
      <header className="flex flex-col items-center text-center py-6">

        <Avatar
          src={finalSrc}
          size={112}
          loading={uploading}
          onClick={() => !uploading && fileRef.current?.click()}
        />

        <input ref={fileRef} type="file" accept="image/jpeg,image/png,image/webp" style={{ display: 'none' }} onChange={handleFile} />

        {/* Status */}
        <div style={{ height: '20px', marginTop: '10px', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
          {uploading                       && <p style={{ fontSize: '12px', color: '#004aad', fontWeight: 500 }}>Salvando foto...</p>}
          {!uploading && status === 'ok'   && <p style={{ fontSize: '12px', color: '#16a34a', fontWeight: 600, display: 'flex', alignItems: 'center', gap: '5px' }}><CheckCircle style={{ width: 13, height: 13 }} /> Foto atualizada!</p>}
          {!uploading && status === 'error'&& <p style={{ fontSize: '12px', color: '#dc2626' }}>Erro ao salvar. Tente novamente.</p>}
          {!uploading && status === 'idle' && <p style={{ fontSize: '12px', color: '#94a3b8' }}>Toque na foto para alterar</p>}
        </div>

        <h1 className="mt-3 text-2xl font-bold text-slate-900">{profile?.nome ?? '—'}</h1>
        <p className="text-slate-500 text-sm">{profile?.email}</p>
        {profile?.numeroCliente && (
          <span className="mt-2 inline-flex items-center gap-1.5 px-3 py-1 bg-primary/10 text-primary rounded-full text-xs font-semibold">
            Cliente #{profile.numeroCliente}
          </span>
        )}
      </header>

      {/* ═══ Seções ═══ */}
      <div className="space-y-3">
        {sections.map((s, i) => (
          <Card key={i} className="p-4 flex items-center justify-between hover:bg-slate-50 transition-colors cursor-pointer group">
            <div className="flex items-center gap-4">
              <div className="h-10 w-10 rounded-xl bg-slate-100 flex items-center justify-center text-slate-500 group-hover:bg-primary/10 group-hover:text-primary transition-colors">
                <s.icon className="h-5 w-5" />
              </div>
              <div>
                <p className="text-xs font-medium text-slate-400 uppercase tracking-wider">{s.label}</p>
                <p className="font-semibold text-slate-700">{s.value}</p>
              </div>
            </div>
            <ChevronRight className="h-5 w-5 text-slate-300 group-hover:text-primary transition-colors" />
          </Card>
        ))}
      </div>

      {/* ═══ Sair ═══ */}
      <div className="pt-2">
        <Button onClick={() => auth.signOut()} variant="outline" className="w-full text-red-500 hover:bg-red-50 hover:border-red-200 gap-2">
          <LogOut className="h-4 w-4" /> Encerrar Sessão
        </Button>
      </div>

      <p className="text-center text-[10px] text-slate-400 uppercase tracking-widest pb-2">
        GigaNet Telecom v1.0.0
      </p>
    </div>
  );
};
