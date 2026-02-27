import React, { useState, useEffect } from 'react';
import { collection, getDocs, query, orderBy } from 'firebase/firestore';
import { db } from '../../lib/firebase';
import { Card, Button, Input, cn } from '../../components/UI';
import { Search, Headphones, MessageSquare, Clock, CheckCircle2, AlertCircle, ChevronRight } from 'lucide-react';
import { Ticket } from '../../types';

export const AdminTickets: React.FC = () => {
  const [tickets, setTickets] = useState<Ticket[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchTickets();
  }, []);

  const fetchTickets = async () => {
    setLoading(true);
    try {
      const q = query(collection(db, 'tickets'), orderBy('createdAt', 'desc'));
      const querySnapshot = await getDocs(q);
      const ticketsData = querySnapshot.docs.map(doc => ({ id: doc.id, ...doc.data() } as Ticket));
      setTickets(ticketsData);
    } catch (error) {
      console.error('Error fetching tickets:', error);
    } finally {
      setLoading(false);
    }
  };

  const statusConfig = {
    open: { label: 'Aberto', color: 'text-red-500', bg: 'bg-red-50', icon: AlertCircle },
    in_progress: { label: 'Em Atendimento', color: 'text-blue-500', bg: 'bg-blue-50', icon: Clock },
    closed: { label: 'Fechado', color: 'text-emerald-500', bg: 'bg-emerald-50', icon: CheckCircle2 },
  };

  return (
    <div className="space-y-6">
      <header>
        <h1 className="text-2xl font-bold text-slate-900">Chamados de Suporte</h1>
        <p className="text-slate-500">Atenda as solicitações dos seus clientes</p>
      </header>

      <div className="grid gap-4 md:grid-cols-3">
        <Card className="p-4 bg-red-50 border-red-100">
          <p className="text-xs font-bold text-red-500 uppercase tracking-wider">Abertos</p>
          <p className="text-2xl font-bold text-red-700 mt-1">{tickets.filter(t => t.status === 'open').length}</p>
        </Card>
        <Card className="p-4 bg-blue-50 border-blue-100">
          <p className="text-xs font-bold text-blue-500 uppercase tracking-wider">Em Andamento</p>
          <p className="text-2xl font-bold text-blue-700 mt-1">{tickets.filter(t => t.status === 'in_progress').length}</p>
        </Card>
        <Card className="p-4 bg-emerald-50 border-emerald-100">
          <p className="text-xs font-bold text-emerald-500 uppercase tracking-wider">Resolvidos</p>
          <p className="text-2xl font-bold text-emerald-700 mt-1">{tickets.filter(t => t.status === 'closed').length}</p>
        </Card>
      </div>

      {loading ? (
        <div className="flex justify-center py-12">
          <div className="h-8 w-8 animate-spin rounded-full border-4 border-primary border-t-transparent" />
        </div>
      ) : (
        <div className="space-y-3">
          {tickets.map((ticket) => {
            const status = statusConfig[ticket.status as keyof typeof statusConfig] || statusConfig.open;
            return (
              <Card key={ticket.id} className="p-4 flex items-center justify-between hover:bg-slate-50 transition-colors cursor-pointer group">
                <div className="flex items-center gap-4">
                  <div className={cn('h-10 w-10 rounded-xl flex items-center justify-center', status.bg, status.color)}>
                    <status.icon className="h-5 w-5" />
                  </div>
                  <div>
                    <h3 className="font-bold text-slate-900">{ticket.assunto}</h3>
                    <p className="text-xs text-slate-500">Cliente ID: {ticket.userId} • {new Date(ticket.createdAt).toLocaleDateString()}</p>
                  </div>
                </div>
                <div className="flex items-center gap-4">
                  <span className={cn('px-2 py-1 rounded-full text-[10px] font-bold uppercase', status.bg, status.color)}>
                    {status.label}
                  </span>
                  <ChevronRight className="h-5 w-5 text-slate-300 group-hover:text-primary transition-colors" />
                </div>
              </Card>
            );
          })}
          {tickets.length === 0 && (
            <div className="text-center py-12 text-slate-500">Nenhum chamado registrado.</div>
          )}
        </div>
      )}
    </div>
  );
};
