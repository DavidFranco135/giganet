import React, { useState, useRef, useEffect } from 'react';
import { signInWithEmailAndPassword, createUserWithEmailAndPassword } from 'firebase/auth';
import { auth, db } from '../lib/firebase';
import { doc, setDoc, getDoc } from 'firebase/firestore';
import { Button, Input, Card } from '../components/UI';
import { useNavigate } from 'react-router-dom';
import { Camera, Loader2, CheckCircle } from 'lucide-react';
import { uploadFileToImgBB, fileToBase64 } from '../lib/imgbbService';

export const LoginPage: React.FC = () => {
  const [isRegistering, setIsRegistering] = useState(false);
  const [email,    setEmail   ] = useState('');
  const [password, setPassword] = useState('');
  const [nome,     setNome    ] = useState('');
  const [cpf,      setCpf     ] = useState('');
  const [loading,  setLoading ] = useState(false);
  const [error,    setError   ] = useState('');
  const navigate = useNavigate();

  // ── Foto de perfil no cadastro ──
  const fileInputRef                          = useRef<HTMLInputElement>(null);
  const [avatarPreview, setAvatarPreview]     = useState('');
  const [avatarUrl,     setAvatarUrl    ]     = useState('');
  const [uploadingAvatar, setUploadingAvatar] = useState(false);
  const [avatarStatus,  setAvatarStatus ]     = useState<'idle' | 'ok' | 'error'>('idle');

  // ── Logo do provedor salvo pelo admin ──
  const [logoUrl, setLogoUrl] = useState('');

  useEffect(() => {
    getDoc(doc(db, 'adminSettings', 'profile'))
      .then(snap => {
        if (snap.exists()) {
          const d = snap.data();
          if (d?.avatarUrl) setLogoUrl(d.avatarUrl);
        }
      })
      .catch(() => {});
  }, []);

  // ── Upload foto de perfil ──
  const handleAvatarChange = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    setUploadingAvatar(true);
    setAvatarStatus('idle');
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

  // ── Login / Cadastro ──
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
    setAvatarPreview('');
    setAvatarUrl('');
    setAvatarStatus('idle');
  };

  // ── Logo: sem moldura circular — imagem inteira ──
  const LogoBanner = () => {
    // Se não há logo personalizado, mostra bloco com letra G
    if (!logoUrl) {
      return (
        <div style={{
          width: '100%',
          height: '96px',
          borderRadius: '16px',
          backgroundColor: '#004aad',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          marginBottom: '20px',
          boxShadow: '0 8px 24px rgba(0,74,173,0.25)',
        }}>
          <span style={{ color: 'white', fontWeight: 800, fontSize: '48px', letterSpacing: '-2px' }}>G</span>
        </div>
      );
    }

    return (
      <div style={{
        width: '100%',
        height: '96px',
        borderRadius: '16px',
        overflow: 'hidden',
        marginBottom: '20px',
        boxShadow: '0 8px 24px rgba(0,0,0,0.12)',
        backgroundColor: '#f1f5f9',
      }}>
        <img
          src={logoUrl}
          alt="GigaNet Telecom"
          style={{
            width: '100%',
            height: '100%',
            objectFit: 'cover',       // ← ocupa tudo, sem moldura
            objectPosition: 'center',
            display: 'block',
          }}
          referrerPolicy="no-referrer"
        />
      </div>
    );
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-slate-50 p-4">
      <Card className="w-full max-w-md">

        {/* ── Logo / Banner do provedor ── */}
        <LogoBanner />

        {/* ── Título ── */}
        <div className="text-center mb-6">
          <h1 className="text-2xl font-bold text-slate-900">GigaNet Telecom</h1>
          <p className="text-slate-500 text-sm mt-1">
            {isRegistering ? 'Crie sua conta de assinante' : 'Acesse sua central do assinante'}
          </p>
        </div>

        {/* ── Foto de perfil — somente no cadastro ── */}
        {isRegistering && (
          <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', marginBottom: '24px' }}>
            <p style={{ fontSize: '13px', color: '#64748b', marginBottom: '12px', fontWeight: 500 }}>
              Foto de perfil <span style={{ color: '#94a3b8' }}>(opcional)</span>
            </p>

            <div
              onClick={() => !uploadingAvatar && fileInputRef.current?.click()}
              style={{
                position: 'relative',
                width: '96px',
                height: '96px',
                borderRadius: '50%',
                cursor: uploadingAvatar ? 'not-allowed' : 'pointer',
              }}
            >
              <div style={{
                width: '96px', height: '96px', borderRadius: '50%',
                overflow: 'hidden',
                border: '3px solid #e2e8f0',
                boxShadow: '0 4px 12px rgba(0,0,0,0.10)',
                backgroundColor: '#f1f5f9',
                display: 'flex', alignItems: 'center', justifyContent: 'center',
              }}>
                {avatarPreview ? (
                  <img src={avatarPreview} alt="Foto" style={{ width: '100%', height: '100%', objectFit: 'cover' }} />
                ) : (
                  <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', gap: '4px', color: '#94a3b8' }}>
                    <svg width="36" height="36" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5">
                      <path d="M20 21v-2a4 4 0 0 0-4-4H8a4 4 0 0 0-4 4v2"/>
                      <circle cx="12" cy="7" r="4"/>
                    </svg>
                    <span style={{ fontSize: '10px', fontWeight: 600, letterSpacing: '0.05em' }}>FOTO</span>
                  </div>
                )}
              </div>

              {/* Badge câmera */}
              <div style={{
                position: 'absolute', bottom: '2px', right: '2px',
                width: '28px', height: '28px', borderRadius: '50%',
                backgroundColor: '#004aad', border: '2px solid white',
                display: 'flex', alignItems: 'center', justifyContent: 'center',
                boxShadow: '0 2px 6px rgba(0,0,0,0.20)',
              }}>
                {uploadingAvatar
                  ? <Loader2 style={{ width: '14px', height: '14px', color: 'white', animation: 'spin 1s linear infinite' }} />
                  : <Camera style={{ width: '14px', height: '14px', color: 'white' }} />
                }
              </div>

              <input ref={fileInputRef} type="file" accept="image/jpeg,image/png,image/webp" style={{ display: 'none' }} onChange={handleAvatarChange} />
            </div>

            <div style={{ marginTop: '10px', height: '20px', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
              {uploadingAvatar && <p style={{ fontSize: '12px', color: '#004aad', fontWeight: 500 }}>Enviando imagem...</p>}
              {avatarStatus === 'ok'    && !uploadingAvatar && <p style={{ fontSize: '12px', color: '#16a34a', fontWeight: 600, display: 'flex', alignItems: 'center', gap: '5px' }}><CheckCircle style={{ width: '14px', height: '14px' }} /> Foto adicionada!</p>}
              {avatarStatus === 'error' && !uploadingAvatar && <p style={{ fontSize: '12px', color: '#dc2626' }}>Erro no upload. Tente novamente.</p>}
              {avatarStatus === 'idle'  && !uploadingAvatar && !avatarPreview && <p style={{ fontSize: '12px', color: '#94a3b8' }}>Toque no círculo para adicionar</p>}
              {avatarStatus === 'idle'  && !uploadingAvatar &&  avatarPreview && <p style={{ fontSize: '12px', color: '#94a3b8' }}>Toque novamente para trocar</p>}
            </div>
          </div>
        )}

        {/* ── Formulário ── */}
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
