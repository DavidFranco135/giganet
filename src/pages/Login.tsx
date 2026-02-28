import React, { useState, useRef, useEffect } from 'react';
import { signInWithEmailAndPassword, createUserWithEmailAndPassword } from 'firebase/auth';
import { auth, db } from '../lib/firebase';
import { doc, setDoc, getDoc } from 'firebase/firestore';
import { Button, Input, Card } from '../components/UI';
import { useNavigate } from 'react-router-dom';
import { Camera, Loader2, CheckCircle, User } from 'lucide-react';
import { uploadFileToImgBB, fileToBase64 } from '../lib/imgbbService';

// ─────────────────────────────────────────────────────────────────
// Círculo de avatar — foto ocupa 100% do círculo, sem folga de cor
// ─────────────────────────────────────────────────────────────────
interface AvatarCircleProps {
  src:      string;
  size:     number;
  loading:  boolean;
  onClick:  () => void;
}

const AvatarCircle: React.FC<AvatarCircleProps> = ({ src, size, loading, onClick }) => {
  const cam = Math.round(size * 0.28);          // tamanho do badge câmera

  return (
    <div
      onClick={onClick}
      style={{
        position: 'relative',
        width:    `${size}px`,
        height:   `${size}px`,
        cursor:   loading ? 'not-allowed' : 'pointer',
        flexShrink: 0,
      }}
    >
      {/* ── Círculo externo: só sombra, SEM borda colorida ── */}
      <div style={{
        width:        `${size}px`,
        height:       `${size}px`,
        borderRadius: '50%',
        overflow:     'hidden',            // ← foto cortada exatamente no círculo
        boxShadow:    '0 4px 18px rgba(0,0,0,0.16)',
        // SEM border, SEM backgroundColor que vaze — a foto preenche tudo
      }}>
        {src ? (
          <img
            src={src}
            alt="Avatar"
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
          // Placeholder: fundo neutro + ícone
          <div style={{
            width:           '100%',
            height:          '100%',
            backgroundColor: '#e2e8f0',
            display:         'flex',
            alignItems:      'center',
            justifyContent:  'center',
          }}>
            <User
              style={{ width: size * 0.44, height: size * 0.44, color: '#94a3b8' }}
              strokeWidth={1.5}
            />
          </div>
        )}
      </div>

      {/* ── Badge câmera ── */}
      <div style={{
        position:        'absolute',
        bottom:          0,
        right:           0,
        width:           `${cam}px`,
        height:          `${cam}px`,
        borderRadius:    '50%',
        backgroundColor: '#004aad',
        outline:         '3px solid white',   // outline não ocupa espaço do elemento
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
export const LoginPage: React.FC = () => {
  const [isRegistering, setIsRegistering] = useState(false);
  const [email,    setEmail   ] = useState('');
  const [password, setPassword] = useState('');
  const [nome,     setNome    ] = useState('');
  const [cpf,      setCpf     ] = useState('');
  const [loading,  setLoading ] = useState(false);
  const [error,    setError   ] = useState('');
  const navigate = useNavigate();

  const avatarInputRef                    = useRef<HTMLInputElement>(null);
  const [avatarSrc,   setAvatarSrc  ]     = useState('');
  const [avatarUrl,   setAvatarUrl  ]     = useState('');
  const [uploadingAv, setUploadingAv]     = useState(false);
  const [avStatus,    setAvStatus   ]     = useState<'idle'|'ok'|'error'>('idle');

  // Logo salvo pelo admin
  const [logoUrl, setLogoUrl] = useState('');
  useEffect(() => {
    getDoc(doc(db, 'adminSettings', 'profile'))
      .then(snap => { if (snap.exists() && snap.data()?.avatarUrl) setLogoUrl(snap.data().avatarUrl); })
      .catch(() => {});
  }, []);

  const handleAvatarChange = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    setUploadingAv(true); setAvStatus('idle');
    const b64 = await fileToBase64(file);
    setAvatarSrc(b64);
    try {
      const res = await uploadFileToImgBB(file, `avatar_${Date.now()}`);
      setAvatarUrl(res.url);
      setAvatarSrc(res.url);
      setAvStatus('ok');
    } catch {
      setAvatarUrl(''); setAvatarSrc(''); setAvStatus('error');
    } finally {
      setUploadingAv(false);
      if (avatarInputRef.current) avatarInputRef.current.value = '';
    }
  };

  const handleAuth = async (e: React.FormEvent) => {
    e.preventDefault(); setLoading(true); setError('');
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
    } finally { setLoading(false); }
  };

  const switchMode = () => {
    setIsRegistering(v => !v); setError('');
    setAvatarSrc(''); setAvatarUrl(''); setAvStatus('idle');
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-slate-50 p-4">
      <Card className="w-full max-w-md">

        {/* ═══ Logo ═══ */}
        <div className="flex flex-col items-center mb-6">
          {/* Círculo do logo — 88px, foto ocupa tudo */}
          <div style={{
            width:        '88px',
            height:       '88px',
            borderRadius: '50%',
            overflow:     'hidden',
            boxShadow:    '0 8px 24px rgba(0,74,173,0.22)',
            marginBottom: '14px',
            flexShrink:   0,
          }}>
            {logoUrl ? (
              <img
                src={logoUrl}
                alt="GigaNet"
                style={{ width: '100%', height: '100%', objectFit: 'cover', objectPosition: 'center', display: 'block' }}
                referrerPolicy="no-referrer"
              />
            ) : (
              <div style={{ width: '100%', height: '100%', backgroundColor: '#004aad', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                <span style={{ color: 'white', fontWeight: 800, fontSize: '40px' }}>G</span>
              </div>
            )}
          </div>
          <h1 className="text-2xl font-bold text-slate-900">GigaNet Telecom</h1>
          <p className="text-slate-500 text-sm mt-1">
            {isRegistering ? 'Crie sua conta de assinante' : 'Acesse sua central do assinante'}
          </p>
        </div>

        {/* ═══ Foto de perfil — só no cadastro ═══ */}
        {isRegistering && (
          <div className="flex flex-col items-center mb-6">
            <p style={{ fontSize: '13px', color: '#64748b', marginBottom: '14px', fontWeight: 500 }}>
              Foto de perfil <span style={{ color: '#94a3b8' }}>(opcional)</span>
            </p>

            <AvatarCircle
              src={avatarSrc}
              size={96}
              loading={uploadingAv}
              onClick={() => !uploadingAv && avatarInputRef.current?.click()}
            />

            <input
              ref={avatarInputRef}
              type="file"
              accept="image/jpeg,image/png,image/webp"
              style={{ display: 'none' }}
              onChange={handleAvatarChange}
            />

            <div style={{ height: '20px', marginTop: '10px', display: 'flex', alignItems: 'center' }}>
              {uploadingAv && <p style={{ fontSize: '12px', color: '#004aad', fontWeight: 500 }}>Enviando...</p>}
              {!uploadingAv && avStatus === 'ok'    && <p style={{ fontSize: '12px', color: '#16a34a', fontWeight: 600, display: 'flex', alignItems: 'center', gap: '5px' }}><CheckCircle style={{ width: 13, height: 13 }} /> Foto adicionada!</p>}
              {!uploadingAv && avStatus === 'error' && <p style={{ fontSize: '12px', color: '#dc2626' }}>Erro no upload. Tente novamente.</p>}
              {!uploadingAv && avStatus === 'idle'  && <p style={{ fontSize: '12px', color: '#94a3b8' }}>{avatarSrc ? 'Toque para trocar' : 'Toque no círculo para adicionar'}</p>}
            </div>
          </div>
        )}

        {/* ═══ Formulário ═══ */}
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
              <button type="button" className="text-sm text-slate-400 hover:underline">Esqueceu sua senha?</button>
            )}
          </div>
        </form>
      </Card>
    </div>
  );
};
