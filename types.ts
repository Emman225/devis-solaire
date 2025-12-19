
// Domain Entities

export enum UserRole {
  ADMIN = 'ADMIN',
  AGENT = 'AGENT',
}

export interface User {
  id: string;
  name: string;
  email: string;
  role: UserRole;
  avatarUrl?: string;
  phone?: string;
  createdAt: string;
  updatedAt?: string;
}

export interface UserFormData {
  name: string;
  email: string;
  phone?: string;
  role: UserRole;
  password?: string;
  password_confirmation?: string;
}

export interface Equipment {
  id: string;
  type: string;
  name?: string;
  quantity: number;
  powerWatts: number;
  hoursPerDay: number;
}

export interface CollectionRequest {
  id: string;
  step: number;
  personalInfo: {
    name: string;
    firstName: string;
    email: string;
    phone: string;
  };
  consumptionProfile: 'INVOICE' | 'EQUIPMENT' | null;
  invoices: File[] | string[]; // URLs from API or Files from form
  equipmentList: Equipment[];
  installationType: 'ROOF' | 'GROUND' | null;
  roofType?: 'SHEET' | 'SLAB' | 'SLATE' | 'STEEL_TRAY' | 'TILES';
  location: string;
  additionalInfo?: string;
  status: 'PENDING' | 'PROCESSED' | 'REJECTED';
  submittedAt: string;
}

// Stats for Dashboard
export interface DashboardStats {
  totalCollections: number;
  generatedQuotes: number;
  conversionRate: number;
  activeUsers: number;
}

export interface SystemSettings {
  id: number;
  appName: string;
  primaryColor: string;
  secondaryColor: string;
  contactEmail: string;
  contactPhone: string;
  createdAt: string;
  updatedAt: string;
}

export interface ContactMessagePayload {
  name: string;
  email: string;
  subject: string;
  message: string;
}

export interface ContactMessage {
  id: string;
  name: string;
  email: string;
  subject: string;
  message: string;
  sentAt: string;
  isRead: boolean;
  status: string | null;
  createdAt: string;
  updatedAt: string;
}

export interface Project {
  id: number;
  title: string;
  category: string;
  image: string;
  capacity: string;
  location: string;
  date: string;
  description: string;
  createdAt: string;
  updatedAt: string;
}
