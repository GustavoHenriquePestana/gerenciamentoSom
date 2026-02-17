export type UserRole = 'admin' | 'user';

export type EquipmentStatus = 'available' | 'in_use' | 'maintenance';

export interface AppNotification {
  id: string;
  recipientRole?: UserRole; // If set, all users with this role see it
  recipientUserId?: string; // If set, only this specific user sees it
  message: string;
  type: 'alert' | 'success' | 'info';
  date: string;
  read: boolean;
  relatedEquipmentId?: string;
}

export interface MaintenanceLog {
  id: string;
  date: string;
  description: string;
  reportedBy: string; // Name
  reportedById: string; // ID for notification targeting
  resolvedAt?: string;
}

export interface Equipment {
  id: string;
  name: string;
  category: string;
  brand: string;
  status: EquipmentStatus;
  purchaseDate: string;
  logs: MaintenanceLog[];
}

export interface User {
  id: string;
  name: string;
  role: UserRole;
}

export const CATEGORIES = [
  "Microfones",
  "Mesas de Som",
  "Cabos",
  "Caixas de Som",
  "Instrumentos",
  "Amplificadores",
  "Acessórios"
];