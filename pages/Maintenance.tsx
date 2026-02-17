import React from 'react';
import { Equipment, UserRole } from '../types';
import { CheckCircle2, Clock, MessageSquare, Wrench } from 'lucide-react';
import { storageService } from '../services/storage';

interface MaintenanceProps {
  equipment: Equipment[];
  userRole: UserRole;
  onRefresh: () => void;
}

export const Maintenance: React.FC<MaintenanceProps> = ({ equipment, userRole, onRefresh }) => {
  const maintenanceItems = equipment.filter(e => e.status === 'maintenance');

  const handleResolve = async (id: string) => {
    if (window.confirm('Confirmar que o equipamento foi reparado e está pronto para uso?')) {
      await storageService.resolveMaintenance(id);
      onRefresh();
    }
  };

  return (
    <div className="max-w-4xl mx-auto">
      <div className="mb-8">
        <h2 className="text-2xl font-bold text-slate-900 flex items-center gap-3">
          <Wrench className="text-red-500" />
          Área de Manutenção
        </h2>
        <p className="text-slate-500">Equipamentos marcados como defeituosos ou em reparo.</p>
      </div>

      <div className="space-y-4">
        {maintenanceItems.map(item => {
            const lastLog = item.logs.length > 0 ? item.logs[item.logs.length - 1] : null;

            return (
              <div key={item.id} className="bg-white rounded-xl shadow-sm border border-l-4 border-l-red-500 border-y-slate-100 border-r-slate-100 p-6 flex flex-col md:flex-row gap-6">
                <div className="flex-1">
                  <div className="flex items-center gap-2 mb-2">
                    <span className="text-xs font-bold px-2 py-1 bg-red-100 text-red-700 rounded uppercase">Precisa de Atenção</span>
                    <span className="text-xs text-slate-400">{item.category}</span>
                  </div>
                  <h3 className="text-xl font-bold text-slate-900">{item.name}</h3>
                  <p className="text-sm text-slate-500 mb-4">{item.brand}</p>
                  
                  {lastLog && (
                    <div className="bg-slate-50 p-4 rounded-lg border border-slate-200">
                        <div className="flex items-center gap-2 text-sm font-semibold text-slate-700 mb-1">
                            <MessageSquare size={16} />
                            Observação Recente
                        </div>
                        <p className="text-slate-600 text-sm italic">"{lastLog.description}"</p>
                        <div className="mt-2 flex items-center gap-2 text-xs text-slate-400">
                            <Clock size={12} />
                            <span>Reportado em {new Date(lastLog.date).toLocaleDateString()} por {lastLog.reportedBy}</span>
                        </div>
                    </div>
                  )}
                </div>

                <div className="flex flex-col justify-center items-end border-t md:border-t-0 md:border-l border-slate-100 pt-4 md:pt-0 md:pl-6 gap-3">
                    {userRole === 'admin' ? (
                        <button 
                            onClick={() => handleResolve(item.id)}
                            className="flex items-center gap-2 px-4 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700 shadow-sm transition-all w-full md:w-auto text-sm font-medium"
                        >
                            <CheckCircle2 size={18} />
                            Aprovar / Liberar
                        </button>
                    ) : (
                        <div className="text-center px-4 py-2 bg-slate-100 text-slate-500 rounded-lg text-sm w-full">
                            Aguardando Admin
                        </div>
                    )}
                </div>
              </div>
            );
        })}

        {maintenanceItems.length === 0 && (
            <div className="text-center py-16 bg-white rounded-xl border border-dashed border-slate-300">
                <CheckCircle2 className="mx-auto text-green-500 mb-4" size={48} />
                <h3 className="text-lg font-medium text-slate-900">Tudo Certo!</h3>
                <p className="text-slate-500">Não há equipamentos em manutenção no momento.</p>
            </div>
        )}
      </div>
    </div>
  );
};