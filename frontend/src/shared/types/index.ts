// frontend/src/shared/types/index.ts

// Типы ролей пользователей (объединенная версия)
export type UserRole = 'employee' | 'master' | 'director' | 'admin';

// Типы статусов для WikiPage
export type WikiPageStatus = 'draft' | 'published' | 'archived';

// Типы для папок документов
export type DocumentFolderType = 'employee' | 'position';

export interface WikiPage {
  id: string;
  title: string;
  content: string;
  category: string;
  tags: string[];
  author: string;
  createdAt: Date | string;
  updatedAt: Date | string;
  status: WikiPageStatus;
}

export interface DocumentFolder {
  id: string;
  name: string;
  type: DocumentFolderType;
  documents: WikiPage[];
  icon: string;
  color: string;
  createdAt?: Date | string;
  updatedAt?: Date | string;
}

export interface Position {
  id: string;
  name: string;
  department: string;
  folders: DocumentFolder[];
  icon: string;
  color: string;
  createdAt?: Date | string;
  updatedAt?: Date | string;
}

export interface User {
  id: string;
  name: string;
  email: string;
  role: UserRole; // Используем объединенный UserRole
  avatar?: string;
  createdAt?: Date | string;
  updatedAt?: Date | string;
  lastLogin?: Date | string;
  phone?: string;
  position?: string;
  department?: string;
}

// Дополнительные типы для работы приложения
export interface AuthResponse {
  token: string;
  user: User;
  expiresIn: number;
}

export interface ApiError {
  message: string;
  statusCode: number;
  timestamp?: string;
  path?: string;
}
