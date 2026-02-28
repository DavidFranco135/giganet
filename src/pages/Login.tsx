import React, { useState, useRef, useEffect } from 'react';
import { signInWithEmailAndPassword, createUserWithEmailAndPassword } from 'firebase/auth';
import { auth, db } from '../lib/firebase';
import { doc, setDoc, getDoc } from 'firebase/firestore';
import { Button, Input, Card } from '../components/UI';
import { useNavigate } from 'react-router-dom';
import { Camera, Loader2, CheckCircle, User } from 'lucide-react';
import { uploadFileToImgBB, fileToBase64 } from '../lib/imgbbService';

// ── Avatar circular perfeito ──────────────────────────────────────
interface AvatarCircleProps {
  src: string;
  size: number;
  uploading: boolean;
  onClickCamera: () => void;
  placeholder?: React.ReactNode;
}

const AvatarCircle: React.FC<AvatarCircleProps> = ({
  src, size, uploading, onClickCamera, placeholder,
}) => (
  <div
    onClick={onClickCamera}
    style={{
      position:  'relative',
      width:     `${size}px`,
      height:    `${size}px`,
      flexShrink: 0,
      cursor:    uploading ? 'not-allowed' : 'pointer',
    }}
  >
    {/* ── Círculo principal ── */}
    <div style={{
      width:           '100%',
      height:          '100%',
      borderRadius:    '50%',           // ← círculo perfeito
      overflow:        'hidden',        // ← corta a imagem no círculo
      border:          '3px solid #e2e8f0',
      boxShadow:       '0 4px 16px rgba(0,0,0,0.12)',
      backgroundColor: '#f1f5f9',
      display:         'flex',
      alignItems:      'center',
      justifyContent:  'center',
    }}>
      {src ? (
        <img
          src={src}
          alt="Avatar"
          style={{
            width:          '100%',
            height:         '100%',
            objectFit:      'cover',    // ← preenche o círculo sem distorção
            objectPosition: 'center',
            display:        'block',
          }}
          referrerPolicy="no-referrer"
        />
      ) : (
        placeholder ?? (
          <User
            style={{ width: size * 0.42, height: size * 0.42, color: '#cbd5e1' }}
            strokeWidth={1.5}
          />
        )
      )}
    </div>

    {/* ── Badge câmera ── */}
    <div style={{
      position:        'absolute',
      bottom:          '2px',
      right:           '2px',
      width:           `${size * 0.29}px`,
      height:          `${size * 0.29}px`,
      borderRadius:    '50%',
      backgroundColor: '#004aad',
      border:          '2px solid white',
      display:         'flex',
      alignItems:      'center',
      justifyContent:  'center',
      boxShadow:       '0 2px 6px rgba(0,0,0,0.20)',
    }}>
      {uploading
        ? <Loader2 style={{ width: size * 0.15, height: size * 0.15, color: 'white', animation: 'spin 1s linear infinite' }} />
        : <Camera  style={{ width: size * 0.15, height: size * 0.15, color: 'white' }} />
      }
    </div>
  </div>
);

// ════════════════════════════════════════════════════════════════
export const LoginPage: React.FC = () => {
  const [isRegistering, setIsRegistering] = useState(false);
  const [email,    setEmail   ] = useState('');
  const [password, setPassword] = useState('');
  const [nome,     setNome    ] = useState('');
  const [cpf,      setCpf     ] = useState('');
  const [loading,  setLoading ] = useState(false);
  const [error,    setError   ] = useState('');
  const navigate = useNavigate();

  // ── Foto do novo usuário ──
  const avatarInputRef                        = useRef<HTMLInputElement>(null);
  const [avatarSrc,   setAvatarSrc  ]         = useState('');
  const [avatarUrl,   setAvatarUrl  ]         = useState('');
  const [uploading,   setUploading  ]         = useState(false);
  const [uploadState, setUploadState]         = useState<'idle' | 'ok' | 'error'>('idle');

  // ── Logo salvo pelo admin ──
  const [logoUrl, setLogoUrl] = useState('');
  useEffect(() => {
    getDoc(doc(db, 'adminSettings', 'profile'))
      .then(snap => { if (snap.exists()) { const d = snap.data(); if (d?.avatarUrl) setLogoUrl(d.avatarUrl); } })
      .catch(() => {});
  }, []);

  // ── Upload foto de perfil ──
  const handleAvatarChange = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    setUploading(true);
    setUploadState('idle');
    const b64 = await fileToBase64(file);
    setAvatarSrc(b64);                         // preview imediato
    try {
      const res = await uploadFileToImgBB(file, `avatar_${Date.now()}`);
      setAvatarUrl(res.url);
      setAvatarSrc(res.url);                   // URL permanente
      setUploadState('ok');
    } catch {
      setAvatarUrl('');
      setAvatarSrc('');
      setUploadState('error');
    } finally {
      setUploading(false);
      if (avatarInputRef.current) avatarInputRef.current.value = '';
    }
  };

  // ── Auth ──
  const handleAuth = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError('');
    try {
      if (isRegistering) {
        const cred    = await createUserWithEmailAndPassword(auth, email, password);
        const isAdmin = email === 'giganetadm@gmail.com';
        await setDoc(doc(db, 'users', cred.user.uid), {
          uid: cred.user.uid, nome, email, cpf,
          tipo: isAdmin ? 'admin' : 'client',
          statusConexao: 'offline',
          numeroCliente: Math.floor(100000 + Math.random() * 900000).toString(),
          telefone: '',
          fotoUrl: avatarUrl || null,
          endereco: { rua: '', numero: '', bairro: '', cidade: '', cep: '' },
        });
        navigate(isAdmin ? '/admin' : '/');
      } else {
        await signInWithEmailAndPassword(auth, email, password);
        navigate('/');
      }
    } catch (err: any) {
      if      (err.code === 'auth/email-already-in-use') setError('Este e-mail já está em uso.');
      else if (err.code === 'auth/weak-password')         setError('Senha deve ter pelo menos 6 caracteres.');
      else if (err.code === 'auth/invalid-credential')    setError('E-mail ou senha incorretos.');
      else                                                setError('Erro na autenticação. Verifique seus dados.');
    } finally {
      setLoading(false);
    }
  };

  const switchMode = () => {
    setIsRegistering(v => !v);
    setError('');
    setAvatarSrc('');
    setAvatarUrl('');
    setUploadState('idle');
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-slate-50 p-4">
      <Card className="w-full max-w-md">

        {/* ════ Logo / Identidade visual ════ */}
        <div className="flex flex-col items-center mb-6">

          {/* Círculo do logo — 88px, sem moldura extra */}
          <div style={{
            width:           '88px',
            height:          '88px',
            borderRadius:    '50%',
            overflow:        'hidden',
            backgroundColor: '#004aad',
            boxShadow:       '0 8px 24px rgba(0,74,173,0.28)',
            marginBottom:    '14px',
            flexShrink:      0,
          }}>
            {logoUrl ? (
              <img
                src={logoUrl}
                alt="GigaNet"
                style={{
                  width:          '100%',
                  height:         '100%',
                  objectFit:      'cover',     // ← ajuste automático, sem distorção
                  objectPosition: 'center',
                  display:        'block',
                }}
                referrerPolicy="no-referrer"
              />
            ) : (
              <div style={{ width: '100%', height: '100%', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                <span style={{ color: 'white', fontWeight: 800, fontSize: '40px', letterSpacing: '-1px' }}>G</span>
              </div>
            )}
          </div>

          <h1 className="text-2xl font-bold text-slate-900">GigaNet Telecom</h1>
          <p className="text-slate-500 text-sm mt-1">
            {isRegistering ? 'Crie sua conta de assinante' : 'Acesse sua central do assinante'}
          </p>
        </div>

        {/* ════ Foto de perfil — apenas no cadastro ════ */}
        {isRegistering && (
          <div className="flex flex-col items-center mb-6">
            <p style={{ fontSize: '13px', color: '#64748b', marginBottom: '14px', fontWeight: 500 }}>
              Foto de perfil <span style={{ color: '#94a3b8' }}>(opcional)</span>
            </p>

            <AvatarCircle
              src={avatarSrc}
              size={96}
              uploading={uploading}
              onClickCamera={() => !uploading && avatarInputRef.current?.click()}
            />

            <input
              ref={avatarInputRef}
              type="file"
              accept="image/jpeg,image/png,image/webp"
              style={{ display: 'none' }}
              onChange={handleAvatarChange}
            />

            {/* Status */}
            <div style={{ marginTop: '10px', height: '18px', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
              {uploading && (
                <p style={{ fontSize: '12px', color: '#004aad', fontWeight: 500 }}>Enviando imagem...</p>
              )}
              {!uploading && uploadState === 'ok' && (
                <p style={{ fontSize: '12px', color: '#16a34a', fontWeight: 600, display: 'flex', alignItems: 'center', gap: '5px' }}>
                  <CheckCircle style={{ width: '13px', height: '13px' }} /> Foto adicionada com sucesso!
                </p>
              )}
              {!uploading && uploadState === 'error' && (
                <p style={{ fontSize: '12px', color: '#dc2626' }}>Erro no upload — tente novamente</p>
              )}
              {!uploading && uploadState === 'idle' && (
                <p style={{ fontSize: '12px', color: '#94a3b8' }}>
                  {avatarSrc ? 'Toque novamente para trocar' : 'Toque no círculo para adicionar'}
                </p>
              )}
            </div>
          </div>
        )}

        {/* ════ Formulário ════ */}
        <form onSubmit={handleAuth} className="space-y-4">
          {isRegistering && (
            <>
              <Input label="Nome Completo" placeholder="Seu nome completo" value={nome}     onChange={e => setNome(e.target.value)}     required />
              <Input label="CPF"           placeholder="000.000.000-00"   value={cpf}      onChange={e => setCpf(e.target.value)}      required />
            </>
          )}

          <Input label="E-mail" type="email"    placeholder="seu@email.com" value={email}    onChange={e => setEmail(e.target.value)}    required />
          <Input label="Senha"  type="password" placeholder="••••••••"      value={password} onChange={e => setPassword(e.target.value)} required />

          {error && (
            <div className="p-3 bg-red-50 border border-red-200 rounded-xl">
              <p className="text-sm text-red-600 text-center">{error}</p>
            </div>
          )}

          <Button type="submit" className="w-full" isLoading={loading}>
            {isRegistering ? 'Criar Conta' : 'Entrar'}
          </Button>

          <div className="text-center space-y-2 pt-1">
            <button type="button" onClick={switchMode} className="text-sm text-primary hover:underline font-medium block w-full">
              {isRegistering ? 'Já tem conta? Entre aqui' : 'Não tem conta? Crie uma agora'}
            </button>
            {!isRegistering && (
              <button type="button" className="text-sm text-slate-400 hover:underline">
                Esqueceu sua senha?
              </button>
            )}
          </div>
        </form>
      </Card>
    </div>
  );
};
