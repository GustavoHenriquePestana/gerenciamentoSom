import React, { useState } from 'react';
import { Equipment, UserRole, CATEGORIES, EquipmentStatus } from '../types';
import { Plus, Search, Filter, PenSquare, Trash2, AlertOctagon, AlertTriangle } from 'lucide-react';
import { storageService } from '../services/storage';

interface InventoryProps {
  equipment: Equipment[];
  userRole: UserRole;
  onRefresh: () => void;
  onEdit: (item: Equipment) => void;
  onReport: (item: Equipment) => void;
}

export const Inventory: React.FC<InventoryProps> = ({ equipment, userRole, onRefresh, onEdit, onReport }) => {
  const [search, setSearch] = useState('');
  const [filterCategory, setFilterCategory] = useState('Todos');
  const [isFormOpen, setIsFormOpen] = useState(false);
  const [submitting, setSubmitting] = useState(false);
  
  // Delete Confirmation State
  const [itemToDelete, setItemToDelete] = useState<string | null>(null);

  // Form State
  const [newItem, setNewItem] = useState<Partial<Equipment>>({
    name: '',
    brand: '',
    category: CATEGORIES[0],
    status: 'available',
    logs: []
  });

  const filteredEquipment = equipment.filter(item => {
    const matchesSearch = item.name.toLowerCase().includes(search.toLowerCase()) || 
                          item.brand.toLowerCase().includes(search.toLowerCase());
    const matchesCategory = filterCategory === 'Todos' || item.category === filterCategory;
    return matchesSearch && matchesCategory;
  });

  const handleStatusToggle = async (item: Equipment) => {
    if (item.status === 'maintenance') return; // Can't toggle if in maintenance
    const newStatus: EquipmentStatus = item.status === 'available' ? 'in_use' : 'available';
    await storageService.toggleStatus(item.id, newStatus);
    onRefresh();
  };

  const handleDeleteClick = (id: string) => {
    // Security check: Only admins can initiate deletion
    if (userRole !== 'admin') return;
    setItemToDelete(id);
  };

  const confirmDelete = async () => {
    // Security check: Only admins can confirm deletion
    if (itemToDelete && userRole === 'admin') {
      await storageService.delete(itemToDelete);
      setItemToDelete(null);
      onRefresh();
    }
  };

  const handleCreate = async (e: React.FormEvent) => {
    e.preventDefault();
    setSubmitting(true);
    const itemToSave: Equipment = {
      id: Date.now().toString(),
      name: newItem.name || 'Sem nome',
      brand: newItem.brand || 'Genérico',
      category: newItem.category || 'Outros',
      status: 'available',
      purchaseDate: new Date().toISOString().split('T')[0],
      logs: []
    };
    await storageService.save(itemToSave);
    setSubmitting(false);
    setIsFormOpen(false);
    setNewItem({ name: '', brand: '', category: CATEGORIES[0] }); // Reset
    onRefresh();
  };

  const getStatusBadge = (status: string) => {
    switch (status) {
      case 'available': return <span className="px-2 py-1 rounded-full text-xs font-semibold bg-green-100 text-green-700">Disponível</span>;
      case 'in_use': return <span className="px-2 py-1 rounded-full text-xs font-semibold bg-blue-100 text-blue-700">Em Uso</span>;
      case 'maintenance': return <span className="px-2 py-1 rounded-full text-xs font-semibold bg-red-100 text-red-700">Manutenção</span>;
      default: return null;
    }
  };

  return (
    <div>
      <div className="flex flex-col md:flex-row justify-between items-start md:items-center mb-6 gap-4">
        <div>
          <h2 className="text-2xl font-bold text-slate-900">Inventário</h2>
          <p className="text-slate-500">Gerencie todos os equipamentos da igreja.</p>
        </div>
        {userRole === 'admin' && (
          <button 
            onClick={() => setIsFormOpen(true)}
            className="flex items-center gap-2 bg-blue-600 text-white px-4 py-2 rounded-lg hover:bg-blue-700 transition-colors"
          >
            <Plus size={20} />
            Novo Equipamento
          </button>
        )}
      </div>

      {/* Filters */}
      <div className="bg-white p-4 rounded-lg shadow-sm border border-slate-200 mb-6 flex flex-col md:flex-row gap-4">
        <div className="flex-1 relative">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" size={20} />
          <input 
            type="text"
            placeholder="Buscar por nome ou marca..."
            className="w-full pl-10 pr-4 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
            value={search}
            onChange={(e) => setSearch(e.target.value)}
          />
        </div>
        <div className="relative">
            <Filter className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" size={20} />
            <select 
              className="pl-10 pr-8 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 appearance-none bg-white min-w-[200px]"
              value={filterCategory}
              onChange={(e) => setFilterCategory(e.target.value)}
            >
              <option value="Todos">Todas Categorias</option>
              {CATEGORIES.map(c => <option key={c} value={c}>{c}</option>)}
            </select>
        </div>
      </div>

      {/* Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-6">
        {filteredEquipment.map(item => (
          <div key={item.id} className="bg-white rounded-xl shadow-sm border border-slate-100 p-5 hover:shadow-md transition-shadow relative group">
            <div className="flex justify-between items-start mb-4">
              <div>
                <span className="text-xs text-slate-500 font-medium uppercase tracking-wider">{item.category}</span>
                <h3 className="text-lg font-bold text-slate-900 mt-1">{item.name}</h3>
                <p className="text-sm text-slate-600">{item.brand}</p>
              </div>
              {getStatusBadge(item.status)}
            </div>

            <div className="border-t pt-4 flex items-center justify-between">
              {item.status !== 'maintenance' ? (
                 <button 
                 onClick={() => handleStatusToggle(item)}
                 className={`text-sm font-medium flex items-center gap-1 ${item.status === 'available' ? 'text-blue-600 hover:text-blue-800' : 'text-green-600 hover:text-green-800'}`}
               >
                 {item.status === 'available' ? 'Marcar Em Uso' : 'Devolver'}
               </button>
              ) : (
                <span className="text-sm text-red-500 italic">Em reparo</span>
              )}

              <div className="flex items-center gap-2">
                {item.status !== 'maintenance' && (
                  <button 
                    title="Reportar problema"
                    onClick={() => onReport(item)}
                    className="p-2 text-slate-400 hover:text-red-500 hover:bg-red-50 rounded-full transition-colors"
                  >
                    <AlertOctagon size={18} />
                  </button>
                )}
                
                {userRole === 'admin' && (
                  <>
                    <button 
                       onClick={() => onEdit(item)}
                       className="p-2 text-slate-400 hover:text-blue-600 hover:bg-blue-50 rounded-full transition-colors"
                    >
                      <PenSquare size={18} />
                    </button>
                    <button 
                      onClick={() => handleDeleteClick(item.id)}
                      className="p-2 text-slate-400 hover:text-red-600 hover:bg-red-50 rounded-full transition-colors"
                    >
                      <Trash2 size={18} />
                    </button>
                  </>
                )}
              </div>
            </div>
          </div>
        ))}
      </div>

      {filteredEquipment.length === 0 && (
        <div className="text-center py-12 text-slate-400">
          <p>Nenhum equipamento encontrado.</p>
        </div>
      )}

      {/* Add Modal */}
      {isFormOpen && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-xl shadow-xl max-w-md w-full p-6">
            <h3 className="text-xl font-bold mb-4">Novo Equipamento</h3>
            <form onSubmit={handleCreate} className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-slate-700 mb-1">Nome</label>
                <input required type="text" className="w-full border rounded-lg p-2" 
                  value={newItem.name} onChange={e => setNewItem({...newItem, name: e.target.value})} />
              </div>
              <div>
                <label className="block text-sm font-medium text-slate-700 mb-1">Marca</label>
                <input required type="text" className="w-full border rounded-lg p-2" 
                  value={newItem.brand} onChange={e => setNewItem({...newItem, brand: e.target.value})} />
              </div>
              <div>
                <label className="block text-sm font-medium text-slate-700 mb-1">Categoria</label>
                <select className="w-full border rounded-lg p-2"
                  value={newItem.category} onChange={e => setNewItem({...newItem, category: e.target.value})}>
                  {CATEGORIES.map(c => <option key={c} value={c}>{c}</option>)}
                </select>
              </div>
              <div className="flex justify-end gap-3 mt-6">
                <button type="button" onClick={() => setIsFormOpen(false)} className="px-4 py-2 text-slate-600 hover:bg-slate-100 rounded-lg">Cancelar</button>
                <button disabled={submitting} type="submit" className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700">
                  {submitting ? 'Salvando...' : 'Salvar'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Delete Confirmation Modal */}
      {itemToDelete && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-xl shadow-xl max-w-sm w-full p-6 text-center">
            <div className="w-12 h-12 bg-red-100 rounded-full flex items-center justify-center mx-auto mb-4">
              <AlertTriangle className="text-red-600" size={24} />
            </div>
            <h3 className="text-lg font-bold text-slate-900 mb-2">Excluir Equipamento?</h3>
            <p className="text-sm text-slate-500 mb-6">
              Esta ação é restrita a administradores e não poderá ser desfeita. Tem certeza?
            </p>
            <div className="flex gap-3 justify-center">
              <button 
                onClick={() => setItemToDelete(null)}
                className="px-4 py-2 bg-white border border-slate-200 text-slate-700 rounded-lg hover:bg-slate-50 transition-colors"
              >
                Cancelar
              </button>
              <button 
                onClick={confirmDelete}
                className="px-4 py-2 bg-red-600 text-white rounded-lg hover:bg-red-700 transition-colors shadow-sm"
              >
                Sim, Excluir
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};