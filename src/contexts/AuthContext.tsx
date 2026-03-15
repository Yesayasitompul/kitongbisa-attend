import React, { createContext, useContext, useState, ReactNode } from "react";

export type UserRole = "pegawai" | "admin" | "pimpinan";

export interface User {
  id: string;
  name: string;
  email: string;
  role: UserRole;
  position: string;
  department: string;
  avatar?: string;
}

interface AuthContextType {
  user: User | null;
  login: (email: string, password: string) => boolean;
  logout: () => void;
  isAuthenticated: boolean;
}

const AuthContext = createContext<AuthContextType | null>(null);

const MOCK_USERS: Record<string, User & { password: string }> = {
  "pegawai@kitongbisa.org": {
    id: "1",
    name: "Andi Pratama",
    email: "pegawai@kitongbisa.org",
    password: "123456",
    role: "pegawai",
    position: "Staff Administrasi",
    department: "Administrasi",
  },
  "admin@kitongbisa.org": {
    id: "2",
    name: "Siti Rahayu",
    email: "admin@kitongbisa.org",
    password: "123456",
    role: "admin",
    position: "HR Manager",
    department: "Human Resources",
  },
  "pimpinan@kitongbisa.org": {
    id: "3",
    name: "Budi Santoso",
    email: "pimpinan@kitongbisa.org",
    password: "123456",
    role: "pimpinan",
    position: "Direktur",
    department: "Manajemen",
  },
};

export function AuthProvider({ children }: { children: ReactNode }) {
  const [user, setUser] = useState<User | null>(null);

  const login = (email: string, password: string): boolean => {
    const found = MOCK_USERS[email];
    if (found && found.password === password) {
      const { password: _, ...userData } = found;
      setUser(userData);
      return true;
    }
    return false;
  };

  const logout = () => setUser(null);

  return (
    <AuthContext.Provider value={{ user, login, logout, isAuthenticated: !!user }}>
      {children}
    </AuthContext.Provider>
  );
}

export function useAuth() {
  const ctx = useContext(AuthContext);
  if (!ctx) throw new Error("useAuth must be used within AuthProvider");
  return ctx;
}
