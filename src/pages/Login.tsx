import React, { useState } from 'react';
import { signInWithEmailAndPassword, createUserWithEmailAndPassword } from 'firebase/auth';
import { auth, db } from '../lib/firebase';
import { doc, setDoc, getDoc } from 'firebase/firestore';
import { Button, Input, Card } from '../components/UI';
import { useNavigate } from 'react-router-dom';
import { LOGO_BASE64 } from '../lib/logo';

export const LoginPage: React.FC = () => {
  const [isRegistering, setIsRegistering] = useState(false);
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [nome, setNome] = useState('');
  const [cpf, setCpf] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const navigate = useNavigate();

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
          endereco: { rua: '', numero: '', bairro: '', cidade: '', cep: '' }
        });

        navigate(isAdmin ? '/admin' : '/home', { replace: true });
      } else {
        const userCredential = await signInWithEmailAndPassword(auth, email, password);
        const user = userCredential.user;

        // Busca o perfil para saber o role e redirecionar corretamente
        const docSnap = await getDoc(doc(db, 'users', user.uid));
        if (docSnap.exists()) {
          const profile = docSnap.data();
          navigate(profile.tipo === 'admin' ? '/admin' : '/home', { replace: true });
        } else {
          navigate('/home', { replace: true });
        }
      }
    } catch (err: any) {
      console.error(err);
      if (err.code === 'auth/email-already-in-use') {
        setError('Este e-mail já está em uso.');
      } else if (err.code === 'auth/weak-password') {
        setError('A senha deve ter pelo menos 6 caracteres.');
      } else if (err.code === 'auth/invalid-credential' || err.code === 'auth/user-not-found' || err.code === 'auth/wrong-password') {
        setError('E-mail ou senha incorretos.');
      } else {
        setError('Erro na autenticação. Verifique seus dados.');
      }
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-slate-900 via-primary to-slate-900 p-4">
      <Card className="w-full max-w-md shadow-2xl">
        <div className="text-center mb-8">
          {/* Logo GigaNet */}
          <div className="flex justify-center mb-4">
            <img
              src={LOGO_BASE64}
              alt="GigaNet Telecom"
              className="h-28 w-28 rounded-full object-cover shadow-lg shadow-primary/30 border-4 border-white"
            />
          </div>
          <h1 className="text-2xl font-bold text-slate-900">GigaNet Telecom</h1>
          <p className="text-slate-500">
            {isRegistering ? 'Crie sua conta de assinante' : 'Acesse sua central do assinante'}
          </p>
        </div>

        <form onSubmit={handleAuth} className="space-y-4">
          {isRegistering && (
            <>
              <Input
                label="Nome Completo"
                placeholder="Seu nome"
                value={nome}
                onChange={(e) => setNome(e.target.value)}
                required
              />
              <Input
                label="CPF"
                placeholder="000.000.000-00"
                value={cpf}
                onChange={(e) => setCpf(e.target.value)}
                required
              />
            </>
          )}
          <Input
            label="E-mail"
            type="email"
            placeholder="seu@email.com"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            required
          />
          <Input
            label="Senha"
            type="password"
            placeholder="••••••••"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            required
          />

          {error && <p className="text-sm text-red-500 text-center bg-red-50 py-2 px-3 rounded-xl">{error}</p>}

          <Button type="submit" className="w-full" isLoading={loading}>
            {isRegistering ? 'Criar Conta' : 'Entrar'}
          </Button>

          <div className="text-center space-y-2">
            <button
              type="button"
              onClick={() => { setIsRegistering(!isRegistering); setError(''); }}
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
