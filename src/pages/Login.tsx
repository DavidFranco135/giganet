import React, { useState, useRef } from 'react';
import { signInWithEmailAndPassword, createUserWithEmailAndPassword } from 'firebase/auth';
import { auth, db } from '../lib/firebase';
import { doc, setDoc, getDoc } from 'firebase/firestore';
import { Button, Input, Card, cn } from '../components/UI';
import { useNavigate } from 'react-router-dom';
import { Camera, Loader2, CheckCircle, User } from 'lucide-react';
import { uploadFileToImgBB, fileToBase64 } from '../lib/imgbbService';

export const LoginPage: React.FC = () => {
  const [isRegistering, setIsRegistering] = useState(false);
  const [email, setEmail]       = useState('');
  const [password, setPassword] = useState('');
  const [nome, setNome]         = useState('');
  const [cpf, setCpf]           = useState('');
  const [loading, setLoading]   = useState(false);
  const [error, setError]       = useState('');
  const navigate = useNavigate();

  // Foto de perfil
  const fileInputRef              = useRef<HTMLInputElement>(null);
  const [avatarPreview, setAvatarPreview] = useState<string>('');
  const [avatarUrl, setAvatarUrl]         = useState<string>('');
  const [uploadingAvatar, setUploadingAvatar] = useState(false);
  const [avatarStatus, setAvatarStatus]       = useState<'idle' | 'ok' | 'error'>('idle');

  const [logoUrl, setLogoUrl] = useState<string>('');

  // Busca logo/avatar do admin para exibir no lugar do "G"
  useEffect(() => {
    getDoc(doc(db, 'adminSettings', 'profile'))
      .then(snap => {
        if (snap.exists()) {
          const data = snap.data();
          if (data?.avatarUrl) setLogoUrl(data.avatarUrl);
        }
      })
      .catch(() => {});
  }, []);
    const file = e.target.files?.[0];
    if (!file) return;
    setUploadingAvatar(true);
    setAvatarStatus('idle');

    // Preview imediato
    const b64 = await fileToBase64(file);
    setAvatarPreview(b64);

    try {
      const result = await uploadFileToImgBB(file, `avatar_${Date.now()}`);
      setAvatarUrl(result.url);
      setAvatarPreview(result.url);
      setAvatarStatus('ok');
    } catch {
      setAvatarUrl('');
      setAvatarStatus('error');
    } finally {
      setUploadingAvatar(false);
      if (fileInputRef.current) fileInputRef.current.value = '';
    }
  };

  const handleAuth = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError('');
    try {
      if (isRegistering) {
        const cred = await createUserWithEmailAndPassword(auth, email, password);
        const user = cred.user;
        const isAdmin = email === 'giganetadm@gmail.com';
        await setDoc(doc(db, 'users', user.uid), {
          uid: user.uid, nome, email, cpf,
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
      if      (err.code === 'auth/email-already-in-use')   setError('Este e-mail já está em uso.');
      else if (err.code === 'auth/weak-password')           setError('Senha deve ter pelo menos 6 caracteres.');
      else if (err.code === 'auth/invalid-credential')      setError('E-mail ou senha incorretos.');
      else                                                  setError('Erro na autenticação. Verifique seus dados.');
    } finally {
      setLoading(false);
    }
  };

  const switchMode = () => {
    setIsRegistering(v => !v);
    setError('');
    setAvatarPreview('');
    setAvatarUrl('');
    setAvatarStatus('idle');
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-slate-50 p-4">
      <Card className="w-full max-w-md">

        {/* ── Logo ── */}
        <div className="text-center mb-6">
          <div className="inline-flex h-16 w-16 items-center justify-center rounded-full bg-primary text-white font-bold text-3xl mb-3 shadow-lg shadow-primary/20 overflow-hidden">
            {logoUrl
              ? <img src={logoUrl} alt="GigaNet" style={{ width: '100%', height: '100%', objectFit: 'cover' }} referrerPolicy="no-referrer" />
              : 'G'
            }
          </div>
          <h1 className="text-2xl font-bold text-slate-900">GigaNet Telecom</h1>
          <p className="text-slate-500 text-sm mt-1">
            {isRegistering ? 'Crie sua conta de assinante' : 'Acesse sua central do assinante'}
          </p>
        </div>

        {/* ══════════════════════════════════════════════════════
            FOTO DE PERFIL — só aparece no modo CADASTRO
            Usa altura/largura fixas, sem classes JIT
        ══════════════════════════════════════════════════════ */}
        {isRegistering && (
          <div
            style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', marginBottom: '24px' }}
          >
            {/* Label acima */}
            <p style={{ fontSize: '13px', color: '#64748b', marginBottom: '12px', fontWeight: 500 }}>
              Foto de perfil <span style={{ color: '#94a3b8' }}>(opcional)</span>
            </p>

            {/* Círculo clicável — 96x96, sempre visível */}
            <div
              onClick={() => !uploadingAvatar && fileInputRef.current?.click()}
              style={{
                position: 'relative',
                width: '96px',
                height: '96px',
                borderRadius: '50%',
                cursor: uploadingAvatar ? 'not-allowed' : 'pointer',
                flexShrink: 0,
              }}
            >
              {/* Fundo / imagem */}
              <div style={{
                width: '96px',
                height: '96px',
                borderRadius: '50%',
                overflow: 'hidden',
                border: '3px solid #e2e8f0',
                boxShadow: '0 4px 12px rgba(0,0,0,0.10)',
                backgroundColor: '#f1f5f9',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
              }}>
                {avatarPreview ? (
                  <img
                    src={avatarPreview}
                    alt="Foto de perfil"
                    style={{ width: '100%', height: '100%', objectFit: 'cover' }}
                  />
                ) : (
                  /* Ícone de pessoa quando não há foto */
                  <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', gap: '4px', color: '#94a3b8' }}>
                    <svg width="36" height="36" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5">
                      <path d="M20 21v-2a4 4 0 0 0-4-4H8a4 4 0 0 0-4 4v2"/>
                      <circle cx="12" cy="7" r="4"/>
                    </svg>
                    <span style={{ fontSize: '10px', fontWeight: 600, letterSpacing: '0.05em' }}>FOTO</span>
                  </div>
                )}
              </div>

              {/* Botão câmera no canto inferior direito */}
              <div style={{
                position: 'absolute',
                bottom: '2px',
                right: '2px',
                width: '28px',
                height: '28px',
                borderRadius: '50%',
                backgroundColor: '#004aad',
                border: '2px solid white',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                boxShadow: '0 2px 6px rgba(0,0,0,0.20)',
              }}>
                {uploadingAvatar
                  ? <Loader2 style={{ width: '14px', height: '14px', color: 'white', animation: 'spin 1s linear infinite' }} />
                  : <Camera style={{ width: '14px', height: '14px', color: 'white' }} />
                }
              </div>

              {/* Input oculto */}
              <input
                ref={fileInputRef}
                type="file"
                accept="image/jpeg,image/png,image/webp"
                style={{ display: 'none' }}
                onChange={handleAvatarChange}
              />
            </div>

            {/* Feedback de status abaixo do círculo */}
            <div style={{ marginTop: '10px', height: '20px', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
              {uploadingAvatar && (
                <p style={{ fontSize: '12px', color: '#004aad', fontWeight: 500 }}>
                  Enviando imagem...
                </p>
              )}
              {avatarStatus === 'ok' && !uploadingAvatar && (
                <p style={{ fontSize: '12px', color: '#16a34a', fontWeight: 600, display: 'flex', alignItems: 'center', gap: '5px' }}>
                  <CheckCircle style={{ width: '14px', height: '14px' }} />
                  Foto adicionada!
                </p>
              )}
              {avatarStatus === 'error' && !uploadingAvatar && (
                <p style={{ fontSize: '12px', color: '#dc2626' }}>
                  Erro no upload. Tente novamente.
                </p>
              )}
              {avatarStatus === 'idle' && !uploadingAvatar && !avatarPreview && (
                <p style={{ fontSize: '12px', color: '#94a3b8' }}>
                  Toque no círculo para adicionar
                </p>
              )}
              {avatarStatus === 'idle' && !uploadingAvatar && avatarPreview && (
                <p style={{ fontSize: '12px', color: '#94a3b8' }}>
                  Toque novamente para trocar
                </p>
              )}
            </div>
          </div>
        )}

        {/* ── Formulário ── */}
        <form onSubmit={handleAuth} className="space-y-4">
          {isRegistering && (
            <>
              <Input
                label="Nome Completo"
                placeholder="Seu nome completo"
                value={nome}
                onChange={e => setNome(e.target.value)}
                required
              />
              <Input
                label="CPF"
                placeholder="000.000.000-00"
                value={cpf}
                onChange={e => setCpf(e.target.value)}
                required
              />
            </>
          )}

          <Input label="E-mail" type="email" placeholder="seu@email.com" value={email} onChange={e => setEmail(e.target.value)} required />
          <Input label="Senha"  type="password" placeholder="••••••••" value={password} onChange={e => setPassword(e.target.value)} required />

          {error && (
            <div className="p-3 bg-red-50 border border-red-200 rounded-xl">
              <p className="text-sm text-red-600 text-center">{error}</p>
            </div>
          )}

          <Button type="submit" className="w-full" isLoading={loading}>
            {isRegistering ? 'Criar Conta' : 'Entrar'}
          </Button>

          <div className="text-center space-y-2">
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
