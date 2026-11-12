import { NextFunction, Request, Response } from 'express';
import jwt from 'jsonwebtoken';
import { UserRole } from '../../shared/types/users';

const FALLBACK_SECRET = 'campus-errand-dev-secret';
const SECRET = process.env.JWT_SECRET || FALLBACK_SECRET;
const EXPIRES_IN = '7d';

export interface TokenUser {
  id: string;
  studentId: string;
  name: string;
  role: UserRole;
}

export interface AuthedRequest extends Request {
  user?: TokenUser;
}

export function signToken(user: TokenUser): string {
  return jwt.sign(
    {
      sub: user.id,
      studentId: user.studentId,
      name: user.name,
      role: user.role,
    },
    SECRET,
    { expiresIn: EXPIRES_IN },
  );
}

function readToken(req: Request): TokenUser | null {
  const header = req.headers.authorization || '';
  if (!header.startsWith('Bearer ')) return null;
  const raw = header.slice(7).trim();
  if (!raw) return null;
  try {
    const payload = jwt.verify(raw, SECRET) as Record<string, unknown>;
    if (!payload || typeof payload.sub !== 'string') return null;
    return {
      id: payload.sub,
      studentId: String(payload.studentId || ''),
      name: String(payload.name || ''),
      role: payload.role === 'runner' ? 'runner' : 'requester',
    };
  } catch {
    return null;
  }
}

/** 有 token 就解析用户，没有也放行（用于兼容匿名读取大厅） */
export function optionalAuth(req: Request, _res: Response, next: NextFunction) {
  (req as AuthedRequest).user = readToken(req) || undefined;
  return next();
}

/** 必须登录 */
export function requireAuth(req: Request, res: Response, next: NextFunction) {
  const user = readToken(req);
  if (!user) {
    return res.status(401).json({ success: false, error: '请先登录后再操作' });
  }
  (req as AuthedRequest).user = user;
  return next();
}

/** 必须是指定角色 */
export function requireRole(role: UserRole) {
  return (req: Request, res: Response, next: NextFunction) => {
    const user = (req as AuthedRequest).user || readToken(req);
    if (!user) {
      return res.status(401).json({ success: false, error: '请先登录后再操作' });
    }
    if (user.role !== role) {
      return res.status(403).json({
        success: false,
        error: role === 'runner' ? '跑腿员账号才能接单' : '需求方账号才能发布订单',
      });
    }
    (req as AuthedRequest).user = user;
    return next();
  };
}

export function isSecretConfigured(): boolean {
  return Boolean(process.env.JWT_SECRET);
}

export { FALLBACK_SECRET };
