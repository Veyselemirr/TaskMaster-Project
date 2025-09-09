import { Role, Permission } from '../enums/role.enum';

export interface JwtPayload {
  sub: number; // user id
  email: string;
  role: Role;
  permissions: Permission[];
  iat?: number;
  exp?: number;
}

export interface AuthUser {
  id: number;
  email: string;
  name: string | null;
  role: Role;
  permissions: Permission[];
}

export interface LoginResponse {
  accessToken: string;
  refreshToken: string;
  user: {
    id: number;
    email: string;
    name: string | null;
    role: Role;
  };
}

export interface RefreshTokenPayload {
  sub: number;
  tokenVersion: number;
  iat?: number;
  exp?: number;
}