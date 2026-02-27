import React from 'react';
import { Card } from '../components/UI';
import { Users, CreditCard, Headphones, TrendingUp, ArrowUpRight, ArrowDownRight } from 'lucide-react';
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, LineChart, Line } from 'recharts';

const data = [
  { name: 'Jan', revenue: 45000, clients: 400 },
  { name: 'Fev', revenue: 52000, clients: 450 },
  { name: 'Mar', revenue: 48000, clients: 480 },
  { name: 'Abr', revenue: 61000, clients: 520 },
  { name: 'Mai', revenue: 59000, clients: 550 },
  { name: 'Jun', revenue: 68000, clients: 600 },
];

export const AdminDashboard: React.FC = () => {
  const stats = [
    { label: 'Total Clientes', value: '1,284', icon: Users, trend: '+12%', color: 'text-blue-600', bg: 'bg-blue-50' },
    { label: 'Receita Mensal', value: 'R$ 124k', icon: CreditCard, trend: '+8.4%', color: 'text-emerald-600', bg: 'bg-emerald-50' },
    { label: 'Inadimplência', value: '4.2%', icon: ArrowDownRight, trend: '-2%', color: 'text-red-600', bg: 'bg-red-50' },
    { label: 'Chamados Abertos', value: '18', icon: Headphones, trend: '-5', color: 'text-amber-600', bg: 'bg-amber-50' },
  ];

  return (
    <div className="space-y-8">
      <header className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-slate-900">Dashboard</h1>
          <p className="text-slate-500">Visão geral da GigaNet Telecom</p>
        </div>
        <div className="flex gap-3">
          <button className="px-4 py-2 bg-white border border-slate-200 rounded-xl text-sm font-medium hover:bg-slate-50 transition-colors">Exportar Relatório</button>
          <button className="px-4 py-2 bg-primary text-white rounded-xl text-sm font-medium hover:bg-primary-dark transition-colors">Novo Cliente</button>
        </div>
      </header>

      <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-4">
        {stats.map((stat, i) => (
          <Card key={i} className="p-6">
            <div className="flex items-center justify-between mb-4">
              <div className={cn('h-12 w-12 rounded-xl flex items-center justify-center', stat.bg, stat.color)}>
                <stat.icon className="h-6 w-6" />
              </div>
              <span className={cn('text-xs font-bold px-2 py-1 rounded-full', stat.trend.startsWith('+') ? 'bg-emerald-50 text-emerald-600' : 'bg-red-50 text-red-600')}>
                {stat.trend}
              </span>
            </div>
            <p className="text-sm font-medium text-slate-500">{stat.label}</p>
            <p className="text-2xl font-bold text-slate-900 mt-1">{stat.value}</p>
          </Card>
        ))}
      </div>

      <div className="grid gap-6 lg:grid-cols-2">
        <Card className="p-6">
          <h3 className="text-lg font-bold text-slate-900 mb-6">Crescimento de Receita</h3>
          <div className="h-[300px] w-full">
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={data}>
                <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#f1f5f9" />
                <XAxis dataKey="name" axisLine={false} tickLine={false} tick={{ fill: '#64748b', fontSize: 12 }} dy={10} />
                <YAxis axisLine={false} tickLine={false} tick={{ fill: '#64748b', fontSize: 12 }} />
                <Tooltip 
                  cursor={{ fill: '#f8fafc' }}
                  contentStyle={{ borderRadius: '12px', border: 'none', boxShadow: '0 10px 15px -3px rgb(0 0 0 / 0.1)' }}
                />
                <Bar dataKey="revenue" fill="#004aad" radius={[4, 4, 0, 0]} barSize={40} />
              </BarChart>
            </ResponsiveContainer>
          </div>
        </Card>

        <Card className="p-6">
          <h3 className="text-lg font-bold text-slate-900 mb-6">Novos Assinantes</h3>
          <div className="h-[300px] w-full">
            <ResponsiveContainer width="100%" height="100%">
              <LineChart data={data}>
                <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#f1f5f9" />
                <XAxis dataKey="name" axisLine={false} tickLine={false} tick={{ fill: '#64748b', fontSize: 12 }} dy={10} />
                <YAxis axisLine={false} tickLine={false} tick={{ fill: '#64748b', fontSize: 12 }} />
                <Tooltip 
                  contentStyle={{ borderRadius: '12px', border: 'none', boxShadow: '0 10px 15px -3px rgb(0 0 0 / 0.1)' }}
                />
                <Line type="monotone" dataKey="clients" stroke="#004aad" strokeWidth={3} dot={{ r: 4, fill: '#004aad', strokeWidth: 2, stroke: '#fff' }} activeDot={{ r: 6 }} />
              </LineChart>
            </ResponsiveContainer>
          </div>
        </Card>
      </div>

      <Card className="p-6">
        <div className="flex items-center justify-between mb-6">
          <h3 className="text-lg font-bold text-slate-900">Últimos Chamados</h3>
          <button className="text-sm text-primary font-medium hover:underline">Ver todos</button>
        </div>
        <div className="overflow-x-auto">
          <table className="w-full text-left">
            <thead>
              <tr className="border-b border-slate-100">
                <th className="pb-4 text-xs font-bold text-slate-400 uppercase tracking-wider">Cliente</th>
                <th className="pb-4 text-xs font-bold text-slate-400 uppercase tracking-wider">Assunto</th>
                <th className="pb-4 text-xs font-bold text-slate-400 uppercase tracking-wider">Data</th>
                <th className="pb-4 text-xs font-bold text-slate-400 uppercase tracking-wider">Status</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-50">
              {[
                { name: 'João Silva', subject: 'Lentidão na conexão', date: 'Hoje, 10:45', status: 'Aberto', color: 'text-amber-600', bg: 'bg-amber-50' },
                { name: 'Maria Oliveira', subject: 'Dúvida na fatura', date: 'Hoje, 09:12', status: 'Em andamento', color: 'text-blue-600', bg: 'bg-blue-50' },
                { name: 'Carlos Souza', subject: 'Mudança de endereço', date: 'Ontem, 16:30', status: 'Fechado', color: 'text-emerald-600', bg: 'bg-emerald-50' },
              ].map((ticket, i) => (
                <tr key={i} className="group hover:bg-slate-50 transition-colors">
                  <td className="py-4 font-medium text-slate-700">{ticket.name}</td>
                  <td className="py-4 text-slate-600">{ticket.subject}</td>
                  <td className="py-4 text-slate-500 text-sm">{ticket.date}</td>
                  <td className="py-4">
                    <span className={cn('px-2 py-1 rounded-full text-[10px] font-bold uppercase', ticket.bg, ticket.color)}>
                      {ticket.status}
                    </span>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </Card>
    </div>
  );
};

import { cn } from '../components/UI';
