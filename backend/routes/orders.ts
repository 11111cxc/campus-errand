import { Router, Request, Response } from 'express';
import { randomUUID } from 'crypto';
const uuidv4 = () => randomUUID();
import { Order, CreateOrderRequest, TakeOrderRequest } from '../../shared/types/orders';
import { AuthedRequest, requireAuth, requireRole } from '../middleware/auth';

const router = Router();

// In-memory store (first version)
const orders: Order[] = [
  {
    id: uuidv4(),
    title: '韵达快递 - 2号宿舍楼',
    description: '帮取一个中等大小的包裹，在南门快递站，送到2号楼楼下即可。',
    category: 'express',
    reward: 5,
    fromLocation: '南门快递站',
    toLocation: '2号宿舍楼',
    publisherId: 'demo-1',
    publisherName: '李同学',
    status: 'open',
    createdAt: new Date(Date.now() - 30 * 60 * 1000).toISOString(),
    updatedAt: new Date(Date.now() - 30 * 60 * 1000).toISOString(),
  },
  {
    id: uuidv4(),
    title: '一食堂二楼 - 螺蛳粉',
    description: '想吃一食堂的螺蛳粉，加辣加臭，送到图书馆A区门口。',
    category: 'canteen',
    reward: 3.5,
    fromLocation: '一食堂二楼',
    toLocation: '图书馆A区',
    publisherId: 'demo-2',
    publisherName: '王同学',
    status: 'open',
    createdAt: new Date(Date.now() - 60 * 60 * 1000).toISOString(),
    updatedAt: new Date(Date.now() - 60 * 60 * 1000).toISOString(),
  },
  {
    id: uuidv4(),
    title: '顺丰快递 - 东区宿舍',
    description: '帮取顺丰快递一件，在东门驿站，送到东区5号楼门口。',
    category: 'express',
    reward: 6,
    fromLocation: '东门驿站',
    toLocation: '东区5号楼',
    publisherId: 'demo-3',
    publisherName: '陈同学',
    status: 'open',
    createdAt: new Date(Date.now() - 2 * 60 * 60 * 1000).toISOString(),
    updatedAt: new Date(Date.now() - 2 * 60 * 60 * 1000).toISOString(),
  },
];

const BANNED_KEYWORDS = ['烟', '酒', '违禁', '毒', '枪', '刀', '赌', '色情', '假币', '管制'];

function checkCompliance(text: string): boolean {
  return BANNED_KEYWORDS.some((kw) => text.includes(kw));
}

// GET /api/orders
router.get('/', (_req: Request, res: Response) => {
  const visible = orders.map((o) => {
    if (o.blocked) {
      return {
        id: o.id,
        title: '[已隐藏内容]',
        description: '该订单包含违禁内容，已自动拦截。',
        category: 'other' as const,
        reward: 0,
        fromLocation: '',
        toLocation: '',
        publisherId: '',
        publisherName: '',
        status: 'blocked' as const,
        createdAt: o.createdAt,
        updatedAt: o.updatedAt,
        blocked: true,
      };
    }
    return o;
  });
  res.json({ success: true, data: { orders: visible } });
});

// GET /api/orders/mine —— 当前登录用户的"我发布的 / 我接的"
router.get('/mine', requireAuth, (req: Request, res: Response) => {
  const user = (req as AuthedRequest).user;
  const published = orders.filter((o) => o.publisherId === user?.id);
  const taking = orders.filter((o) => o.takerId === user?.id);
  res.json({
    success: true,
    data: {
      published,
      taking,
      user: { id: user?.id, name: user?.name, role: user?.role },
    },
  });
});

// POST /api/orders
router.post('/', requireRole('requester'), (req: Request, res: Response) => {
  const body = req.body as CreateOrderRequest;
  const user = (req as AuthedRequest).user;
  if (!body.title || !body.description || !body.fromLocation || !body.toLocation || !body.reward) {
    return res.status(400).json({ success: false, error: '请填写完整订单信息' });
  }

  const isBlocked = checkCompliance(body.title + body.description);

  const order: Order = {
    id: uuidv4(),
    title: body.title,
    description: body.description,
    category: body.category || 'other',
    reward: Number(body.reward),
    fromLocation: body.fromLocation,
    toLocation: body.toLocation,
    publisherId: user?.id || 'current-user',
    publisherName: user?.name || body.publisherName || '我',
    status: isBlocked ? 'blocked' : 'open',
    blocked: isBlocked,
    createdAt: new Date().toISOString(),
    updatedAt: new Date().toISOString(),
  };

  orders.unshift(order);

  if (isBlocked) {
    // Return generic message, do not reveal reason
    return res.status(201).json({ success: true, data: { order: null }, message: '订单无法处理' });
  }

  res.status(201).json({ success: true, data: { order } });
});

// POST /api/orders/:id/take
router.post('/:id/take', requireRole('runner'), (req: Request, res: Response) => {
  const order = orders.find((o) => o.id === req.params.id);
  if (!order) return res.status(404).json({ success: false, error: '订单不存在' });
  if (order.status !== 'open') return res.status(400).json({ success: false, error: '订单已被接取' });

  const user = (req as AuthedRequest).user;
  if (order.blocked) return res.status(400).json({ success: false, error: '该订单已拦截，不可接取' });
  if (order.publisherId && order.publisherId === user?.id) {
    return res.status(400).json({ success: false, error: '不能接自己发布的订单' });
  }

  const body = req.body as TakeOrderRequest;
  order.takerId = user?.id || 'current-user';
  order.takerName = user?.name || body.takerName || '我';
  order.status = 'delivering';
  order.updatedAt = new Date().toISOString();

  res.json({ success: true, data: { order } });
});

// POST /api/orders/:id/complete
router.post('/:id/complete', requireAuth, (req: Request, res: Response) => {
  const order = orders.find((o) => o.id === req.params.id);
  if (!order) return res.status(404).json({ success: false, error: '订单不存在' });
  if (order.status !== 'delivering') return res.status(400).json({ success: false, error: '订单状态不正确' });

  const user = (req as AuthedRequest).user;
  if (order.takerId !== user?.id) {
    return res.status(403).json({ success: false, error: '只有接单人才能确认完成' });
  }

  order.status = 'completed';
  order.updatedAt = new Date().toISOString();

  res.json({ success: true, data: { order } });
});

export default router;
