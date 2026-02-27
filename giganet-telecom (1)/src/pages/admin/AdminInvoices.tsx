import React, { useState, useEffect } from 'react';
import { collection, getDocs, query, orderBy } from 'firebase/firestore';
import { db } from '../../lib/firebase';
import { Card, Button, Input, cn } from '../../components/UI';
import { Search, CreditCard, CheckCircle2, Clock, AlertCircle, Filter, Download, Plus } from 'lucide-react';
import { Invoice } from '../../types';

export const AdminInvoices: React.FC = () => {
  const [invoices, setInvoices] = useState<Invoice[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');

  useEffect(() => {
    fetchInvoices();
  }, []);

  const fetchInvoices = async () => {
    setLoading(true);
    try {
      const q = query(collection(db, 'invoices'), orderBy('vencimento', 'desc'));
      const querySnapshot = await getDocs(q);
      const invoicesData = querySnapshot.docs.map(doc => ({ id: doc.id, ...doc.data() } as Invoice));
      setInvoices(invoicesData);
    } catch (error) {
      console.error('Error fetching invoices:', error);
    } finally {
      setLoading(false);
    }
  };

  const statusIcons = {
    paid: { icon: CheckCircle2, color: 'text-emerald-500', bg: 'bg-emerald-50', label: 'Pago' },
    pending: { icon: Clock, color: 'text-amber-500', bg: 'bg-amber-50', label: 'Pendente' },
    overdue: { icon: AlertCircle, color: 'text-red-600', bg: 'bg-red-50', label: 'Atrasado' },
  };

  return (
    <div className="space-y-6">
      <header className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-slate-900">Faturas</h1>
          <p className="text-slate-500">Controle financeiro e recebimentos</p>
        </div>
        <Button className="gap-2">
          <Plus className="h-4 w-4" /> Gerar Fatura
        </Button>
      </header>

      <div className="flex flex-col md:flex-row gap-4">
        <div className="relative flex-1">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-5 w-5 text-slate-400" />
          <Input 
            placeholder="Buscar por cliente ou ID..." 
            className="pl-10"
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
          />
        </div>
        <Button variant="outline" className="gap-2">
          <Filter className="h-4 w-4" /> Filtrar
        </Button>
      </div>

      {loading ? (
        <div className="flex justify-center py-12">
          <div className="h-8 w-8 animate-spin rounded-full border-4 border-primary border-t-transparent" />
        </div>
      ) : (
        <Card className="p-0 overflow-hidden">
          <div className="overflow-x-auto">
            <table className="w-full text-left">
              <thead>
                <tr className="bg-slate-50 border-b border-slate-100">
                  <th className="p-4 text-xs font-bold text-slate-400 uppercase tracking-wider">ID</th>
                  <th className="p-4 text-xs font-bold text-slate-400 uppercase tracking-wider">Cliente</th>
                  <th className="p-4 text-xs font-bold text-slate-400 uppercase tracking-wider">Valor</th>
                  <th className="p-4 text-xs font-bold text-slate-400 uppercase tracking-wider">Vencimento</th>
                  <th className="p-4 text-xs font-bold text-slate-400 uppercase tracking-wider">Status</th>
                  <th className="p-4 text-xs font-bold text-slate-400 uppercase tracking-wider text-right">Ações</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-50">
                {invoices.map((invoice) => {
                  const status = statusIcons[invoice.status as keyof typeof statusIcons] || statusIcons.pending;
                  return (
                    <tr key={invoice.id} className="hover:bg-slate-50 transition-colors group">
                      <td className="p-4 text-sm font-mono text-slate-500">#{invoice.id.slice(0, 8)}</td>
                      <td className="p-4 font-medium text-slate-700">{invoice.userId}</td>
                      <td className="p-4 font-bold text-slate-900">R$ {invoice.valor.toFixed(2)}</td>
                      <td className="p-4 text-sm text-slate-600">{invoice.vencimento}</td>
                      <td className="p-4">
                        <span className={cn('px-2 py-1 rounded-full text-[10px] font-bold uppercase inline-flex items-center gap-1', status.bg, status.color)}>
                          <status.icon className="h-3 w-3" />
                          {status.label}
                        </span>
                      </td>
                      <td className="p-4 text-right">
                        <button className="p-2 text-slate-400 hover:text-primary transition-colors">
                          <Download className="h-4 w-4" />
                        </button>
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
          {invoices.length === 0 && (
            <div className="text-center py-12 text-slate-500">Nenhuma fatura encontrada.</div>
          )}
        </Card>
      )}
    </div>
  );
};
