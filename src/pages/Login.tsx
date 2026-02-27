import React, { useState } from 'react';
import { signInWithEmailAndPassword, createUserWithEmailAndPassword } from 'firebase/auth';
import { auth, db } from '../lib/firebase';
import { doc, setDoc } from 'firebase/firestore';
import { Button, Input, Card } from '../components/UI';
import { useNavigate } from 'react-router-dom';

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
        
        // Create user profile in Firestore
        await setDoc(doc(db, 'users', user.uid), {
          uid: user.uid,
          nome,
          email,
          cpf,
          tipo: email === 'giganetadm@gmail.com' ? 'admin' : 'client',
          statusConexao: 'offline',
          numeroCliente: Math.floor(100000 + Math.random() * 900000).toString(),
          telefone: '',
          endereco: { rua: '', numero: '', bairro: '', cidade: '', cep: '' }
        });
        
        navigate(email === 'giganetadm@gmail.com' ? '/admin' : '/');
      } else {
        await signInWithEmailAndPassword(auth, email, password);
        navigate('/');
      }
    } catch (err: any) {
      console.error(err);
      if (err.code === 'auth/email-already-in-use') {
        setError('Este e-mail já está em uso.');
      } else if (err.code === 'auth/weak-password') {
        setError('A senha deve ter pelo menos 6 caracteres.');
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
          
          {error && <p className="text-sm text-red-500 text-center">{error}</p>}

          <Button type="submit" className="w-full" isLoading={loading}>
            {isRegistering ? 'Criar Conta' : 'Entrar'}
          </Button>

          <div className="text-center space-y-2">
            <button 
              type="button" 
              onClick={() => setIsRegistering(!isRegistering)}
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
