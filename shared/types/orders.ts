export type OrderCategory = 'express' | 'canteen' | 'other';
export type OrderStatus = 'open' | 'taken' | 'delivering' | 'completed' | 'blocked';

export interface Order {
  id: string;
  title: string;
  description: string;
  category: OrderCategory;
  reward: number;
  fromLocation: string;
  toLocation: string;
  publisherId: string;
  publisherName: string;
  takerId?: string;
  takerName?: string;
  status: OrderStatus;
  createdAt: string;
  updatedAt: string;
  blocked?: boolean; // compliance blocked
}

export interface CreateOrderRequest {
  title: string;
  description: string;
  category: OrderCategory;
  reward: number;
  fromLocation: string;
  toLocation: string;
  publisherName: string;
}

export interface TakeOrderRequest {
  takerName: string;
}

export interface OrderListResponse {
  orders: Order[];
}

export interface UserCredit {
  userId: string;
  name: string;
  score: number;
  failCount: number;
  banned: boolean;
  completedCount: number;
}
