import { Router, Request, Response } from 'express';
import { randomUUID, randomBytes, scryptSync, timingSafeEqual } from 'crypto';
import {
  LoginRequest,
  PublicUser,
  RegisterRequest,
  UserRole,
} from '../../shared/types/users';
import { requireAuth, signToken, AuthedRequest } from '../middleware/auth';

const router = Router();

interface StoredUser {
  id: string;
  studentId: string;
  name: string;
  role: UserRole;
  creditScore: number;
  completedCount: number;
  createdAt: string;
  passwordHash: string;
}

const users: StoredUser[] = [];

function hashPassword(password: string): string {
  const salt = randomBytes(16).toString('hex');
  const derived = scryptSync(password, salt, 32).toString('hex');
  return `${salt}:${derived}`;
}

function verifyPassword(password: string, stored: string): boolean {
  const [salt, hash] = stored.split(':');
  if (!salt || !hash) return false;
  const derived = scryptSync(password, salt, 32).toString('hex');
  const a = Buffer.from(hash, 'hex');
  const b = Buffer.from(derived, 'hex');
  if (a.length !== b.length) return false;
  return timingSafeEqual(a, b);
}

function toPublic(user: StoredUser): PublicUser {
  return {
    id: user.id,
    studentId: user.studentId,
    name: user.name,
    role: user.role,
    creditScore: user.creditScore,
    completedCount: user.completedCount,
    createdAt: user.createdAt,
  };
}

function createUser(input: {
  studentId: string;
  name: string;
  password: string;
  role: UserRole;
}): StoredUser {
  const user: StoredUser = {
    id: randomUUID(),
    studentId: input.studentId,
    name: input.name,
    role: input.role,
    creditScore: 98,
    completedCount: 0,
    createdAt: new Date().toISOString(),
    passwordHash: hashPassword(input.password),
  };
  users.push(user);
  return user;
}

// 预置两个不同类型的演示账号，方便课堂演示与验收
createUser({ studentId: '20230101', name: '李同学', password: '123456', role: 'requester' });
createUser({ studentId: '20230102', name: '王同学', password: '123456', role: 'runner' });

const STUDENT_ID_RE = /^[A-Za-z0-9]{6,12}$/;

// GET /api/auth/accounts —— 演示账号列表（只返回预置的两个）
router.get('/accounts', (_req: Request, res: Response) => {
  const demo = users
    .filter((u) => u.studentId === '20230101' || u.studentId === '20230102')
    .map((u) => ({ ...toPublic(u), password: '123456', demo: true }));
  res.json({ success: true, data: { accounts: demo } });
});

// POST /api/auth/register —— 注册，需选择账号类型
router.post('/register', (req: Request, res: Response) => {
  const body = req.body as RegisterRequest;
  const studentId = String(body?.studentId || '').trim();
  const name = String(body?.name || '').trim();
  const password = String(body?.password || '');
  const role = body?.role;

  if (!STUDENT_ID_RE.test(studentId)) {
    return res.status(400).json({ success: false, error: '学号需为 6-12 位字母或数字' });
  }
  if (name.length < 2 || name.length > 20) {
    return res.status(400).json({ success: false, error: '昵称需为 2-20 个字符' });
  }
  if (password.length < 6 || password.length > 32) {
    return res.status(400).json({ success: false, error: '密码需为 6-32 位' });
  }
  if (role !== 'requester' && role !== 'runner') {
    return res.status(400).json({ success: false, error: '请选择账号类型：需求方或跑腿员' });
  }
  if (users.some((u) => u.studentId === studentId)) {
    return res.status(409).json({ success: false, error: '该学号已注册，请直接登录' });
  }

  const user = createUser({ studentId, name, password, role });
  const token = signToken({ id: user.id, studentId: user.studentId, name: user.name, role: user.role });

  return res.status(201).json({
    success: true,
    data: { token, user: toPublic(user) },
    message: `注册成功，当前账号类型：${role === 'requester' ? '需求方' : '跑腿员'}`,
  });
});

// POST /api/auth/login
router.post('/login', (req: Request, res: Response) => {
  const body = req.body as LoginRequest;
  const studentId = String(body?.studentId || '').trim();
  const password = String(body?.password || '');

  if (!studentId || !password) {
    return res.status(400).json({ success: false, error: '请填写学号与密码' });
  }

  const user = users.find((u) => u.studentId === studentId);
  if (!user || !verifyPassword(password, user.passwordHash)) {
    return res.status(401).json({ success: false, error: '学号或密码不正确' });
  }

  const token = signToken({ id: user.id, studentId: user.studentId, name: user.name, role: user.role });
  return res.json({ success: true, data: { token, user: toPublic(user) } });
});

// GET /api/auth/me —— 前端启动时校验登录态
router.get('/me', requireAuth, (req: Request, res: Response) => {
  const tokenUser = (req as AuthedRequest).user;
  const user = users.find((u) => u.id === tokenUser?.id);
  if (!user) {
    return res.status(401).json({ success: false, error: '登录已失效，请重新登录' });
  }
  return res.json({ success: true, data: { user: toPublic(user) } });
});

// GET /api/auth/users —— 已注册账号统计（便于课堂演示"不同类型的账号"）
router.get('/users', (_req: Request, res: Response) => {
  const list = users.map((u) => ({
    ...toPublic(u),
    demo: u.studentId === '20230101' || u.studentId === '20230102',
  }));
  const byRole = {
    requester: list.filter((u) => u.role === 'requester').length,
    runner: list.filter((u) => u.role === 'runner').length,
  };
  res.json({ success: true, data: { users: list, total: list.length, byRole } });
});

export default router;
