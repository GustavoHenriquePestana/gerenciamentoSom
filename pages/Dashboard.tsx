import React, { useMemo } from 'react';
import { Equipment } from '../types';
import { PieChart, Pie, Cell, ResponsiveContainer, Tooltip, BarChart, Bar, XAxis, YAxis, CartesianGrid } from 'recharts';
import { CheckCircle2, AlertTriangle, PlayCircle, HardDrive } from 'lucide-react';

interface DashboardProps {
  equipment: Equipment[];
}

const COLORS = ['#22c55e', '#ef4444', '#3b82f6']; // Available, Maintenance, In Use

const StatCard = ({ title, value, icon: Icon, color, bg }: any) => (
  <div className="bg-white p-6 rounded-xl shadow-sm border border-slate-100 flex items-center justify-between">
    <div>
      <p className="text-sm font-medium text-slate-500 mb-1">{title}</p>
      <h3 className="text-3xl font-bold text-slate-900">{value}</h3>
    </div>
    <div className={`p-3 rounded-lg ${bg} ${color}`}>
      <Icon size={24} />
    </div>
  </div>
);

export const Dashboard: React.FC<DashboardProps> = ({ equipment }) => {
  const stats = useMemo(() => {
    return {
      total: equipment.length,
      available: equipment.filter(e => e.status === 'available').length,
      inUse: equipment.filter(e => e.status === 'in_use').length,
      maintenance: equipment.filter(e => e.status === 'maintenance').length,
    };
  }, [equipment]);

  const pieData = [
    { name: 'Disponível', value: stats.available },
    { name: 'Manutenção', value: stats.maintenance },
    { name: 'Em Uso', value: stats.inUse },
  ];

  const categoryData = useMemo(() => {
    const cats: Record<string, number> = {};
    equipment.forEach(e => {
      cats[e.category] = (cats[e.category] || 0) + 1;
    });
    return Object.entries(cats).map(([name, count]) => ({ name, count }));
  }, [equipment]);

  return (
    <div className="space-y-6">
      <div className="mb-8">
        <h2 className="text-2xl font-bold text-slate-900">Painel de Controle</h2>
        <p className="text-slate-500">Visão geral do inventário e status dos equipamentos.</p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
        <StatCard 
          title="Total de Itens" 
          value={stats.total} 
          icon={HardDrive} 
          color="text-slate-600" 
          bg="bg-slate-100" 
        />
        <StatCard 
          title="Disponíveis" 
          value={stats.available} 
          icon={CheckCircle2} 
          color="text-green-600" 
          bg="bg-green-100" 
        />
        <StatCard 
          title="Em Uso" 
          value={stats.inUse} 
          icon={PlayCircle} 
          color="text-blue-600" 
          bg="bg-blue-100" 
        />
        <StatCard 
          title="Manutenção" 
          value={stats.maintenance} 
          icon={AlertTriangle} 
          color="text-red-600" 
          bg="bg-red-100" 
        />
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 mt-6">
        <div className="bg-white p-6 rounded-xl shadow-sm border border-slate-100 h-80">
          <h3 className="text-lg font-semibold mb-4 text-slate-800">Status Geral</h3>
          <ResponsiveContainer width="100%" height="100%">
            <PieChart>
              <Pie
                data={pieData}
                cx="50%"
                cy="50%"
                innerRadius={60}
                outerRadius={80}
                paddingAngle={5}
                dataKey="value"
              >
                {pieData.map((entry, index) => (
                  <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                ))}
              </Pie>
              <Tooltip />
            </PieChart>
          </ResponsiveContainer>
          <div className="flex justify-center gap-4 text-sm text-slate-600">
             <div className="flex items-center gap-1"><span className="w-3 h-3 bg-green-500 rounded-full"></span> Disp.</div>
             <div className="flex items-center gap-1"><span className="w-3 h-3 bg-red-500 rounded-full"></span> Manut.</div>
             <div className="flex items-center gap-1"><span className="w-3 h-3 bg-blue-500 rounded-full"></span> Em Uso</div>
          </div>
        </div>

        <div className="bg-white p-6 rounded-xl shadow-sm border border-slate-100 h-80">
          <h3 className="text-lg font-semibold mb-4 text-slate-800">Itens por Categoria</h3>
          <ResponsiveContainer width="100%" height="100%">
            <BarChart data={categoryData}>
              <CartesianGrid strokeDasharray="3 3" vertical={false} />
              <XAxis dataKey="name" tick={{fontSize: 10}} interval={0} angle={-15} textAnchor="end" />
              <YAxis />
              <Tooltip />
              <Bar dataKey="count" fill="#475569" radius={[4, 4, 0, 0]} />
            </BarChart>
          </ResponsiveContainer>
        </div>
      </div>
    </div>
  );
};