import React, { useState, useRef } from 'react';
import { useAuth } from '../contexts/AuthContext';
import { Card, Button, Input, cn } from '../components/UI';
import {
  User, MapPin, Shield, Bell, ChevronRight,
  Camera, Loader2, CheckCircle, LogOut,
} from 'lucide-react';
import { auth, db } from '../lib/firebase';
import { doc, updateDoc } from 'firebase/firestore';
import { uploadFileToImgBB, fileToBase64, getAvatarUrl } from '../lib/imgbbService';

// ── Componente de avatar circular ────────────────────────────────
interface AvatarProps {
  src:        string;
  size:       number;
  uploading:  boolean;
  onClick:    () => void;
}

const Avatar: React.FC<AvatarProps> = ({ src, size, uploading, onClick }) => (
  <div
    onClick={onClick}
    title="Clique para trocar a foto"
    style={{
      position:  'relative',
      width:     `${size}px`,
      height:    `${size}px`,
      flexShrink: 0,
      cursor:    uploading ? 'not-allowed' : 'pointer',
    }}
  >
    {/* Círculo principal */}
    <div style={{
      width:           '100%',
      height:          '100%',
      borderRadius:    '50%',           // ← círculo perfeito
      overflow:        'hidden',        // ← foto cortada em círculo
      border:          '4px solid white',
      boxShadow:       '0 8px 24px rgba(0,0,0,0.14)',
      backgroundColor: '#e2e8f0',
      display:         'flex',
      alignItems:      'center',
      justifyContent:  'center',
    }}>
      {src ? (
        <img
          src={src}
          alt="Foto de perfil"
          style={{
            width:          '100%',
            height:         '100%',
            objectFit:      'cover',    // ← ajuste automático: preenche o círculo sem distorção
            objectPosition: 'center',
            display:        'block',
          }}
          referrerPolicy="no-referrer"
        />
      ) : (
        <User style={{ width: size * 0.42, height: size * 0.42, color: '#94a3b8' }} strokeWidth={1.5} />
      )}

      {/* Overlay escuro ao hover */}
      {!uploading && src && (
        <div style={{
          position:        'absolute',
          inset:           0,
          borderRadius:    '50%',
          backgroundColor: 'rgba(0,0,0,0)',
          transition:      'background-color 0.2s',
          display:         'flex',
          alignItems:      'center',
          justifyContent:  'center',
        }}
          className="hover:!bg-black/35"
        />
      )}
    </div>

    {/* Badge câmera */}
    <div style={{
      position:        'absolute',
      bottom:          '3px',
      right:           '3px',
      width:           `${size * 0.28}px`,
      height:          `${size * 0.28}px`,
      borderRadius:    '50%',
      backgroundColor: '#004aad',
      border:          '3px solid white',
      display:         'flex',
      alignItems:      'center',
      justifyContent:  'center',
      boxShadow:       '0 2px 8px rgba(0,0,0,0.20)',
    }}>
      {uploading
        ? <Loader2 style={{ width: size * 0.14, height: size * 0.14, color: 'white', animation: 'spin 1s linear infinite' }} />
        : <Camera  style={{ width: size * 0.14, height: size * 0.14, color: 'white' }} />
      }
    </div>
  </div>
);

// ════════════════════════════════════════════════════════════════
export const ProfilePage: React.FC = () => {
  const { user, profile } = useAuth();

  // ── Estado da foto ──
  const fileInputRef                    = useRef<HTMLInputElement>(null);
  const [avatarSrc,  setAvatarSrc  ]    = useState(profile?.fotoUrl ?? '');
  const [uploading,  setUploading  ]    = useState(false);
  const [saveStatus, setSaveStatus ]    = useState<'idle' | 'ok' | 'error'>('idle');

  // Sincroniza quando o perfil carrega pela primeira vez
  React.useEffect(() => {
    if (profile?.fotoUrl && !avatarSrc) setAvatarSrc(profile.fotoUrl);
  }, [profile?.fotoUrl]);

  // ── Upload da foto ──
  const handleFileChange = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file || !user) return;

    setUploading(true);
    setSaveStatus('idle');

    // Preview imediato
    const b64 = await fileToBase64(file);
    setAvatarSrc(b64);

    try {
      const res = await uploadFileToImgBB(file, `perfil_${user.uid}_${Date.now()}`);
      setAvatarSrc(res.url);
      await updateDoc(doc(db, 'users', user.uid), { fotoUrl: res.url });
      setSaveStatus('ok');
      setTimeout(() => setSaveStatus('idle'), 3000);
    } catch (err: any) {
      setAvatarSrc(profile?.fotoUrl ?? '');
      setSaveStatus('error');
    } finally {
      setUploading(false);
      if (fileInputRef.current) fileInputRef.current.value = '';
    }
  };

  const handleLogout = () => auth.signOut().catch(() => {});

  const sections = [
    {
      icon:  User,
      label: 'Dados Pessoais',
      value: profile?.nome || 'Não informado',
    },
    {
      icon:  MapPin,
      label: 'Endereço de Instalação',
      value: profile?.endereco?.rua
        ? `${profile.endereco.rua}, ${profile.endereco.numero}`
        : 'Não informado',
    },
    {
      icon:  Shield,
      label: 'Segurança',
      value: 'Alterar senha',
    },
    {
      icon:  Bell,
      label: 'Notificações',
      value: 'Configurar avisos',
    },
  ];

  // src final: foto custom → DiceBear como fallback
  const finalSrc = avatarSrc || getAvatarUrl(user?.uid ?? 'guest');

  return (
    <div className="space-y-6">

      {/* ════ Header com foto ════ */}
      <header className="flex flex-col items-center text-center py-6">

        <Avatar
          src={finalSrc}
          size={110}
          uploading={uploading}
          onClick={() => !uploading && fileInputRef.current?.click()}
        />

        <input
          ref={fileInputRef}
          type="file"
          accept="image/jpeg,image/png,image/webp"
          style={{ display: 'none' }}
          onChange={handleFileChange}
        />

        {/* Status do upload */}
        <div style={{ height: '20px', marginTop: '10px', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
          {uploading && (
            <p style={{ fontSize: '12px', color: '#004aad', fontWeight: 500 }}>Salvando foto...</p>
          )}
          {!uploading && saveStatus === 'ok' && (
            <p style={{ fontSize: '12px', color: '#16a34a', fontWeight: 600, display: 'flex', alignItems: 'center', gap: '5px' }}>
              <CheckCircle style={{ width: '13px', height: '13px' }} /> Foto atualizada!
            </p>
          )}
          {!uploading && saveStatus === 'error' && (
            <p style={{ fontSize: '12px', color: '#dc2626' }}>Erro ao salvar. Tente novamente.</p>
          )}
          {!uploading && saveStatus === 'idle' && (
            <p style={{ fontSize: '12px', color: '#94a3b8' }}>Toque na foto para alterar</p>
          )}
        </div>

        <h1 className="mt-3 text-2xl font-bold text-slate-900">{profile?.nome ?? '—'}</h1>
        <p className="text-slate-500 text-sm">{profile?.email}</p>

        {profile?.numeroCliente && (
          <span className="mt-2 inline-flex items-center gap-1.5 px-3 py-1 bg-primary/10 text-primary rounded-full text-xs font-semibold">
            Cliente #{profile.numeroCliente}
          </span>
        )}
      </header>

      {/* ════ Seções do perfil ════ */}
      <div className="space-y-3">
        {sections.map((s, i) => (
          <Card
            key={i}
            className="p-4 flex items-center justify-between hover:bg-slate-50 transition-colors cursor-pointer group"
          >
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

      {/* ════ Botão sair ════ */}
      <div className="pt-2">
        <Button
          onClick={handleLogout}
          variant="outline"
          className="w-full text-red-500 hover:bg-red-50 hover:border-red-200 gap-2"
        >
          <LogOut className="h-4 w-4" />
          Encerrar Sessão
        </Button>
      </div>

      <p className="text-center text-[10px] text-slate-400 uppercase tracking-widest pb-2">
        GigaNet Telecom v1.0.0
      </p>
    </div>
  );
};
