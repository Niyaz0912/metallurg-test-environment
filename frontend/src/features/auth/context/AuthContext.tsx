// src/features/auth/context/AuthContext.tsx
import { createContext } from 'react';

export interface User {
  id: string;
  role: string;
  department?: {
    id: number;
    name: string;
  };
}

export interface AuthContextType {
  user: User | null;
}

export const AuthContext = createContext<AuthContextType>({ user: null });