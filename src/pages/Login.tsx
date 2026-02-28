import React, { useState, useRef } from 'react';
import { signInWithEmailAndPassword, createUserWithEmailAndPassword } from 'firebase/auth';
import { auth, db } from '../lib/firebase';
import { doc, setDoc } from 'firebase/firestore';
import { Button, Input, Card } from '../components/UI';
import { useNavigate } from 'react-router-dom';
import { Camera, Loader2, CheckCircle, User } from 'lucide-react';
import { uploadFileToImgBB, fileToBase64 } from '../lib/imgbbService';

export const LoginPage: React.FC = () => {
  const [isRegistering, setIsRegistering] = useState(false);
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [nome, setNome] = useState('');
  const [cpf, setCpf] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const navigate = useNavigate();

  // Foto de perfil no cadastro
  const fileInputRef = useRef<HTMLInputElement>(null);
  const [avatarPreview, setAvatarPreview] = useState<string | null>(null);
  const [avatarUrl, setAvatarUrl] = useState<string>('');
  const [uploadingAvatar, setUploadingAvatar] = useState(false);
  const [avatarSuccess, setAvatarSuccess] = useState(false);

  const handleAvatarChange = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    setUploadingAvatar(true);
    setAvatarSuccess(false);

    // Preview imediato
    const b64 = await fileToBase64(file);
    setAvatarPreview(b64);

    try {
      const result = await uploadFileToImgBB(file, `avatar_novo_${Date.now()}`);
      setAvatarUrl(result.url);
      setAvatarPreview(result.url);
      setAvatarSuccess(true);
      setTimeout(() => setAvatarSuccess(false), 2500);
    } catch {
      // Falhou o upload — mantém o preview local mas sem URL definitiva
      setAvatarUrl('');
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
        const userCredential = await createUserWithEmailAndPassword(auth, email, password);
        const user = userCredential.user;

        const isAdmin = email === 'giganetadm@gmail.com';

        await setDoc(doc(db, 'users', user.uid), {
          uid: user.uid,
          nome,
          email,
          cpf,
          tipo: isAdmin ? 'admin' : 'client',
          statusConexao: 'offline',
          numeroCliente: Math.floor(100000 + Math.random() * 900000).toString(),
          telefone: '',
          fotoUrl: avatarUrl || null, // foto do ImgBB (ou null se não enviou)
          endereco: { rua: '', numero: '', bairro: '', cidade: '', cep: '' },
        });

        navigate(isAdmin ? '/admin' : '/');
      } else {
        await signInWithEmailAndPassword(auth, email, password);
        navigate('/');
      }
    } catch (err: any) {
      if (err.code === 'auth/email-already-in-use') {
        setError('Este e-mail já está em uso.');
      } else if (err.code === 'auth/weak-password') {
        setError('A senha deve ter pelo menos 6 caracteres.');
      } else if (err.code === 'auth/invalid-credential' || err.code === 'auth/wrong-password') {
        setError('E-mail ou senha incorretos.');
      } else {
        setError('Erro na autenticação. Verifique seus dados.');
      }
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-slate-50 p-4">
      <Card className="w-full max-w-md">

        {/* Logo */}
        <div className="text-center mb-8">
          <div className="inline-flex h-16 w-16 items-center justify-center rounded-full bg-primary text-white font-bold text-3xl mb-4 shadow-lg shadow-primary/20">
            G
          </div>
          <h1 className="text-2xl font-bold text-slate-900">GigaNet Telecom</h1>
          <p className="text-slate-500">
            {isRegistering ? 'Crie sua conta de assinante' : 'Acesse sua central do assinante'}
          </p>
        </div>

        <form onSubmit={handleAuth} className="space-y-4">

          {/* Campos extras no cadastro */}
          {isRegistering && (
            <>
              {/* Upload de foto de perfil */}
              <div className="flex flex-col items-center gap-3 py-2">
                <div className="relative">
                  <div className="h-20 w-20 rounded-full overflow-hidden bg-slate-100 border-4 border-white shadow-md">
                    {avatarPreview ? (
                      <img src={avatarPreview} alt="Avatar" className="h-full w-full object-cover" />
                    ) : (
                      <div className="h-full w-full flex items-center justify-center text-slate-400">
                        <User className="h-8 w-8" />
                      </div>
                    )}
                  </div>
                  <button
                    type="button"
                    onClick={() => fileInputRef.current?.click()}
                    disabled={uploadingAvatar}
                    className="absolute bottom-0 right-0 h-7 w-7 rounded-full bg-primary text-white flex items-center justify-center border-2 border-white shadow hover:bg-primary-dark transition-colors disabled:opacity-70"
                  >
                    {uploadingAvatar
                      ? <Loader2 className="h-3.5 w-3.5 animate-spin" />
                      : <Camera className="h-3.5 w-3.5" />
                    }
                  </button>
                  <input
                    ref={fileInputRef}
                    type="file"
                    accept="image/jpeg,image/png,image/webp"
                    className="hidden"
                    onChange={handleAvatarChange}
                  />
                </div>

                {uploadingAvatar && (
                  <p className="text-xs text-primary animate-pulse">Enviando foto...</p>
                )}
                {avatarSuccess && (
                  <p className="text-xs text-emerald-600 flex items-center gap-1">
                    <CheckCircle className="h-3 w-3" /> Foto carregada!
                  </p>
                )}
                {!avatarPreview && !uploadingAvatar && (
                  <p className="text-xs text-slate-400">Adicionar foto de perfil (opcional)</p>
                )}
              </div>

              <Input
                label="Nome Completo"
                placeholder="Seu nome"
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

          <Input
            label="E-mail"
            type="email"
            placeholder="seu@email.com"
            value={email}
            onChange={e => setEmail(e.target.value)}
            required
          />
          <Input
            label="Senha"
            type="password"
            placeholder="••••••••"
            value={password}
            onChange={e => setPassword(e.target.value)}
            required
          />

          {error && <p className="text-sm text-red-500 text-center">{error}</p>}

          <Button type="submit" className="w-full" isLoading={loading}>
            {isRegistering ? 'Criar Conta' : 'Entrar'}
          </Button>

          <div className="text-center space-y-2">
            <button
              type="button"
              onClick={() => {
                setIsRegistering(!isRegistering);
                setError('');
                setAvatarPreview(null);
                setAvatarUrl('');
              }}
              className="text-sm text-primary hover:underline block w-full"
            >
              {isRegistering ? 'Já tem uma conta? Entre aqui' : 'Não tem conta? Crie uma agora'}
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
