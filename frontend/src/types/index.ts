// Типы статусов для WikiPage
export type WikiPageStatus = 'draft' | 'published' | 'archived';

// Типы для папок документов
export type DocumentFolderType = 'employee' | 'position';

// Типы ролей пользователей
export type UserRole = 'admin' | 'editor' | 'viewer';

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
  role: UserRole;
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