import React, { useState, useRef, useEffect } from 'react';
import { User, AppNotification } from '../types';
import { LayoutDashboard, Mic2, Wrench, LogOut, Menu, X, Bell, Check, Info, AlertTriangle } from 'lucide-react';

interface LayoutProps {
  children: React.ReactNode;
  user: User;
  currentView: string;
  notifications: AppNotification[];
  onNavigate: (view: string) => void;
  onLogout: () => void;
  onMarkRead: (id: string) => void;
  onMarkAllRead: () => void;
}

export const Layout: React.FC<LayoutProps> = ({ 
  children, 
  user, 
  currentView, 
  notifications,
  onNavigate, 
  onLogout,
  onMarkRead,
  onMarkAllRead
}) => {
  const [isSidebarOpen, setIsSidebarOpen] = React.useState(false);
  const [isNotifOpen, setIsNotifOpen] = useState(false);
  const notifRef = useRef<HTMLDivElement>(null);

  const unreadCount = notifications.filter(n => !n.read).length;

  // Close notification dropdown when clicking outside
  useEffect(() => {
    function handleClickOutside(event: MouseEvent) {
      if (notifRef.current && !notifRef.current.contains(event.target as Node)) {
        setIsNotifOpen(false);
      }
    }
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  const NavItem = ({ view, icon: Icon, label }: { view: string; icon: any; label: string }) => (
    <button
      onClick={() => {
        onNavigate(view);
        setIsSidebarOpen(false);
      }}
      className={`w-full flex items-center gap-3 px-4 py-3 text-sm font-medium transition-colors rounded-lg mb-1
        ${currentView === view 
          ? 'bg-blue-600 text-white shadow-md' 
          : 'text-slate-600 hover:bg-slate-100 hover:text-slate-900'}`}
    >
      <Icon size={20} />
      {label}
    </button>
  );

  return (
    <div className="min-h-screen bg-slate-50 flex flex-col md:flex-row">
      {/* Mobile Header */}
      <div className="md:hidden bg-white border-b p-4 flex justify-between items-center sticky top-0 z-20">
        <h1 className="font-bold text-lg text-slate-800">SoundManager</h1>
        <div className="flex items-center gap-4">
           {/* Mobile Notification Button */}
           <button onClick={() => setIsNotifOpen(!isNotifOpen)} className="relative text-slate-600">
             <Bell size={24} />
             {unreadCount > 0 && (
                <span className="absolute -top-1 -right-1 bg-red-500 text-white text-[10px] w-4 h-4 flex items-center justify-center rounded-full">
                  {unreadCount}
                </span>
              )}
           </button>
           <button onClick={() => setIsSidebarOpen(!isSidebarOpen)} className="p-2 text-slate-600">
            {isSidebarOpen ? <X /> : <Menu />}
          </button>
        </div>
      </div>

      {/* Sidebar */}
      <aside className={`
        fixed inset-y-0 left-0 z-30 w-64 bg-white border-r transform transition-transform duration-200 ease-in-out
        md:relative md:translate-x-0
        ${isSidebarOpen ? 'translate-x-0' : '-translate-x-full'}
      `}>
        <div className="p-6 border-b">
          <h1 className="text-xl font-bold text-blue-600 flex items-center gap-2">
            <Mic2 className="fill-blue-600 text-white" />
            SoundManager
          </h1>
          <div className="mt-4 flex items-center gap-3">
             {/* User Profile */}
            <div className="flex-1 flex items-center gap-2 px-2 py-2 bg-slate-50 rounded-md border overflow-hidden">
              <div className={`w-2 h-2 rounded-full flex-shrink-0 ${user.role === 'admin' ? 'bg-purple-500' : 'bg-green-500'}`} />
              <div className="overflow-hidden">
                <p className="text-sm font-semibold text-slate-900 truncate">{user.name}</p>
                <p className="text-xs text-slate-500 uppercase">{user.role === 'admin' ? 'Administrador' : 'Membro'}</p>
              </div>
            </div>

            {/* Desktop Notification Trigger */}
            <div className="hidden md:block relative" ref={notifRef}>
              <button 
                onClick={() => setIsNotifOpen(!isNotifOpen)}
                className="p-2 text-slate-500 hover:bg-slate-100 rounded-full relative transition-colors"
              >
                <Bell size={20} />
                {unreadCount > 0 && (
                  <span className="absolute top-1 right-1 bg-red-500 w-2.5 h-2.5 rounded-full border-2 border-white"></span>
                )}
              </button>

              {/* Notification Popover */}
              {isNotifOpen && (
                <div className="absolute left-full top-0 ml-2 w-80 bg-white rounded-xl shadow-xl border border-slate-200 overflow-hidden z-50">
                  <div className="p-3 border-b bg-slate-50 flex justify-between items-center">
                    <h3 className="font-semibold text-slate-700 text-sm">Notificações</h3>
                    {unreadCount > 0 && (
                      <button 
                        onClick={onMarkAllRead}
                        className="text-xs text-blue-600 hover:underline"
                      >
                        Marcar lidas
                      </button>
                    )}
                  </div>
                  <div className="max-h-80 overflow-y-auto">
                    {notifications.length === 0 ? (
                      <div className="p-6 text-center text-slate-400 text-sm">
                        Nenhuma notificação nova
                      </div>
                    ) : (
                      notifications.map(notif => (
                        <div 
                          key={notif.id}
                          onClick={() => onMarkRead(notif.id)}
                          className={`p-3 border-b last:border-0 cursor-pointer hover:bg-slate-50 transition-colors flex gap-3 ${!notif.read ? 'bg-blue-50/50' : ''}`}
                        >
                          <div className={`mt-1 flex-shrink-0 `}>
                             {notif.type === 'alert' && <AlertTriangle size={16} className="text-red-500" />}
                             {notif.type === 'success' && <Check size={16} className="text-green-500" />}
                             {notif.type === 'info' && <Info size={16} className="text-blue-500" />}
                          </div>
                          <div>
                            <p className={`text-sm ${!notif.read ? 'font-semibold text-slate-800' : 'text-slate-600'}`}>
                              {notif.message}
                            </p>
                            <p className="text-xs text-slate-400 mt-1">
                              {new Date(notif.date).toLocaleDateString()} {new Date(notif.date).toLocaleTimeString([], {hour: '2-digit', minute:'2-digit'})}
                            </p>
                          </div>
                        </div>
                      ))
                    )}
                  </div>
                </div>
              )}
            </div>
          </div>
        </div>

        <nav className="p-4 flex-1">
          {user.role === 'admin' && (
            <NavItem view="dashboard" icon={LayoutDashboard} label="Visão Geral" />
          )}
          <NavItem view="inventory" icon={Mic2} label="Equipamentos" />
          <NavItem view="maintenance" icon={Wrench} label="Manutenção" />
        </nav>

        <div className="p-4 border-t">
          <button
            onClick={onLogout}
            className="w-full flex items-center gap-3 px-4 py-3 text-sm font-medium text-red-600 hover:bg-red-50 rounded-lg transition-colors"
          >
            <LogOut size={20} />
            Sair
          </button>
        </div>
      </aside>

      {/* Main Content */}
      <main className="flex-1 overflow-y-auto h-[calc(100vh-64px)] md:h-screen relative">
        {/* Mobile Notification Panel Overlay */}
        {isNotifOpen && (
          <div className="md:hidden absolute inset-0 z-40 bg-white p-4 overflow-y-auto">
            <div className="flex justify-between items-center mb-4">
              <h2 className="text-lg font-bold">Notificações</h2>
              <button onClick={() => setIsNotifOpen(false)} className="p-2"><X /></button>
            </div>
             <div className="space-y-2">
                {notifications.length === 0 ? (
                  <p className="text-center text-slate-500 mt-10">Nenhuma notificação.</p>
                ) : (
                  notifications.map(notif => (
                    <div 
                      key={notif.id}
                      onClick={() => { onMarkRead(notif.id); setIsNotifOpen(false); }}
                      className={`p-4 rounded-lg border ${!notif.read ? 'bg-blue-50 border-blue-100' : 'bg-white border-slate-100'}`}
                    >
                      <div className="flex items-start gap-3">
                        {notif.type === 'alert' && <AlertTriangle size={18} className="text-red-500 mt-0.5" />}
                        {notif.type === 'success' && <Check size={18} className="text-green-500 mt-0.5" />}
                        {notif.type === 'info' && <Info size={18} className="text-blue-500 mt-0.5" />}
                        <div>
                          <p className="text-sm text-slate-900">{notif.message}</p>
                          <p className="text-xs text-slate-400 mt-1">
                            {new Date(notif.date).toLocaleDateString()}
                          </p>
                        </div>
                      </div>
                    </div>
                  ))
                )}
             </div>
          </div>
        )}

        <div className="p-6 md:p-8 max-w-7xl mx-auto">
          {children}
        </div>
      </main>

      {/* Overlay for mobile sidebar */}
      {isSidebarOpen && (
        <div 
          className="fixed inset-0 bg-black/50 z-20 md:hidden"
          onClick={() => setIsSidebarOpen(false)}
        />
      )}
    </div>
  );
};