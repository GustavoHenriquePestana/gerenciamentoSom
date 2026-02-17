import React, { useState, useEffect } from 'react';
import { Layout } from './components/Layout';
import { Dashboard } from './pages/Dashboard';
import { Inventory } from './pages/Inventory';
import { Maintenance } from './pages/Maintenance';
import { User, Equipment, EquipmentStatus, AppNotification } from './types';
import { storageService } from './services/storage';
import { ShieldCheck, User as UserIcon, Loader2 } from 'lucide-react';

// Simple Login Component
const LoginScreen = ({ onLogin }: { onLogin: (role: 'admin' | 'user') => void }) => (
  <div className="min-h-screen bg-slate-100 flex items-center justify-center p-4">
    <div className="bg-white p-8 rounded-2xl shadow-xl max-w-md w-full text-center">
      <div className="w-16 h-16 bg-blue-600 rounded-full flex items-center justify-center mx-auto mb-6 shadow-lg shadow-blue-200">
        <ShieldCheck className="text-white" size={32} />
      </div>
      <h1 className="text-2xl font-bold text-slate-900 mb-2">SoundManager</h1>
      <p className="text-slate-500 mb-8">Selecione um perfil para entrar no sistema</p>
      
      <div className="space-y-3">
        <button 
          onClick={() => onLogin('admin')}
          className="w-full p-4 rounded-xl border border-slate-200 hover:border-blue-500 hover:bg-blue-50 flex items-center gap-4 transition-all group"
        >
          <div className="bg-purple-100 p-2 rounded-lg group-hover:bg-purple-200 transition-colors">
            <ShieldCheck className="text-purple-600" size={24} />
          </div>
          <div className="text-left">
            <p className="font-semibold text-slate-900">Administrador</p>
            <p className="text-xs text-slate-500">Acesso total ao sistema</p>
          </div>
        </button>

        <button 
          onClick={() => onLogin('user')}
          className="w-full p-4 rounded-xl border border-slate-200 hover:border-blue-500 hover:bg-blue-50 flex items-center gap-4 transition-all group"
        >
          <div className="bg-green-100 p-2 rounded-lg group-hover:bg-green-200 transition-colors">
            <UserIcon className="text-green-600" size={24} />
          </div>
          <div className="text-left">
            <p className="font-semibold text-slate-900">Membro da Equipe</p>
            <p className="text-xs text-slate-500">Operar e reportar problemas</p>
          </div>
        </button>
      </div>
      <p className="mt-8 text-xs text-slate-400">Simulação de Backend com LocalStorage</p>
    </div>
  </div>
);

// Reporting Modal
const ReportModal = ({ 
  isOpen, 
  onClose, 
  onSubmit 
}: { 
  isOpen: boolean; 
  onClose: () => void; 
  onSubmit: (desc: string) => void;
}) => {
  const [desc, setDesc] = useState('');

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
      <div className="bg-white rounded-xl shadow-xl max-w-sm w-full p-6">
        <h3 className="text-lg font-bold mb-2">Reportar Problema</h3>
        <p className="text-sm text-slate-500 mb-4">Descreva o defeito encontrado no equipamento.</p>
        <textarea 
          className="w-full border rounded-lg p-3 text-sm h-32 mb-4 focus:ring-2 focus:ring-red-500 focus:outline-none"
          placeholder="Ex: Cabo com chiado, Botão travado..."
          value={desc}
          onChange={e => setDesc(e.target.value)}
        />
        <div className="flex justify-end gap-2">
          <button onClick={onClose} className="px-4 py-2 text-slate-600 hover:bg-slate-100 rounded-lg text-sm">Cancelar</button>
          <button 
            disabled={!desc.trim()}
            onClick={() => { onSubmit(desc); setDesc(''); }} 
            className="px-4 py-2 bg-red-600 text-white rounded-lg text-sm hover:bg-red-700 disabled:opacity-50"
          >
            Reportar
          </button>
        </div>
      </div>
    </div>
  );
};

export default function App() {
  const [user, setUser] = useState<User | null>(null);
  const [currentView, setCurrentView] = useState('inventory');
  const [equipment, setEquipment] = useState<Equipment[]>([]);
  const [notifications, setNotifications] = useState<AppNotification[]>([]);
  const [loading, setLoading] = useState(false);
  
  // Modal states
  const [reportItem, setReportItem] = useState<Equipment | null>(null);

  const refreshData = async () => {
    // Only show loading on initial load to allow silent updates for notifications
    if (equipment.length === 0) setLoading(true);
    
    const data = await storageService.getAll();
    setEquipment(data);
    
    if (user) {
      const notifs = await storageService.getNotifications(user.id, user.role);
      setNotifications(notifs);
    }
    
    if (equipment.length === 0) setLoading(false);
  };

  useEffect(() => {
    if (user) {
      refreshData();
      // Poll for notifications every 5 seconds to simulate real-time
      const interval = setInterval(refreshData, 5000);
      return () => clearInterval(interval);
    }
  }, [user]);

  const handleLogin = (role: 'admin' | 'user') => {
    // Using distinct IDs to allow targeting notifications
    setUser({
      id: role === 'admin' ? 'admin-1' : 'user-1',
      name: role === 'admin' ? 'Pr. Carlos (Admin)' : 'João (Técnico)',
      role: role
    });
    setCurrentView(role === 'admin' ? 'dashboard' : 'inventory');
  };

  const handleReportIssue = async (description: string) => {
    if (reportItem && user) {
      await storageService.addLog(reportItem.id, {
        id: Date.now().toString(),
        date: new Date().toISOString(),
        description,
        reportedBy: user.name,
        reportedById: user.id
      });
      setReportItem(null);
      refreshData();
    }
  };

  const handleMarkRead = async (id: string) => {
    await storageService.markNotificationRead(id);
    if (user) {
       const notifs = await storageService.getNotifications(user.id, user.role);
       setNotifications(notifs);
    }
  };

  const handleMarkAllRead = async () => {
    if (user) {
      await storageService.markAllRead(user.id, user.role);
      const notifs = await storageService.getNotifications(user.id, user.role);
      setNotifications(notifs);
    }
  };

  // View Routing
  const renderView = () => {
    if (loading && equipment.length === 0) {
      return (
        <div className="h-full flex flex-col items-center justify-center text-slate-400">
          <Loader2 className="animate-spin mb-2" size={32} />
          <p>Carregando inventário...</p>
        </div>
      );
    }

    switch (currentView) {
      case 'dashboard':
        return <Dashboard equipment={equipment} />;
      case 'inventory':
        return (
          <Inventory 
            equipment={equipment} 
            userRole={user?.role || 'user'} 
            onRefresh={refreshData}
            onEdit={(item) => console.log('Edit', item)} // Implement full edit modal if needed
            onReport={(item) => setReportItem(item)}
          />
        );
      case 'maintenance':
        return (
          <Maintenance 
            equipment={equipment} 
            userRole={user?.role || 'user'} 
            onRefresh={refreshData} 
          />
        );
      default:
        return <Inventory equipment={equipment} userRole={user?.role || 'user'} onRefresh={refreshData} onEdit={() => {}} onReport={() => {}} />;
    }
  };

  if (!user) {
    return <LoginScreen onLogin={handleLogin} />;
  }

  return (
    <Layout 
      user={user} 
      currentView={currentView} 
      notifications={notifications}
      onNavigate={setCurrentView}
      onLogout={() => setUser(null)}
      onMarkRead={handleMarkRead}
      onMarkAllRead={handleMarkAllRead}
    >
      {renderView()}
      
      <ReportModal 
        isOpen={!!reportItem} 
        onClose={() => setReportItem(null)} 
        onSubmit={handleReportIssue} 
      />
    </Layout>
  );
}