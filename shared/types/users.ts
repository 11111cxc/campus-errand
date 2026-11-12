export type UserRole = 'requester' | 'runner';

export const ROLE_LABELS: Record<UserRole, string> = {
  requester: '需求方',
  runner: '跑腿员',
};

export interface PublicUser {
  id: string;
  studentId: string;
  name: string;
  role: UserRole;
  creditScore: number;
  completedCount: number;
  createdAt: string;
}

export interface RegisterRequest {
  studentId: string;
  name: string;
  password: string;
  role: UserRole;
}

export interface LoginRequest {
  studentId: string;
  password: string;
}

export interface AuthPayload {
  token: string;
  user: PublicUser;
}
