export type UserRole = 'client' | 'admin';

export interface UserProfile {
  uid: string;
  nome: string;
  email: string;
  cpf: string;
  tipo: UserRole;
  planoId?: string;
  statusConexao: 'online' | 'offline' | 'blocked';
  numeroCliente: string;
  telefone: string;
  endereco: {
    rua: string;
    numero: string;
    bairro: string;
    cidade: string;
    cep: string;
  };
  asaasId?: string;
}

export interface Plan {
  id: string;
  nome: string;
  velocidade: string;
  valor: number;
  beneficios: string[];
  popular?: boolean;
}

export interface Invoice {
  id: string;
  userId: string;
  valor: number;
  vencimento: string;
  status: 'pending' | 'paid' | 'overdue';
  pixCode?: string;
  pixQrCode?: string;
  boletoUrl?: string;
  asaasId: string;
}

export interface Ticket {
  id: string;
  userId: string;
  assunto: string;
  status: 'open' | 'in_progress' | 'closed';
  createdAt: string;
  mensagens: {
    senderId: string;
    text: string;
    timestamp: string;
  }[];
}
