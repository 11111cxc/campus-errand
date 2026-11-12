import { Clock, MapPin, Lock } from 'lucide-react';
import { Order } from '@shared/types/orders';

interface Props {
  order: Order;
  onTake?: (id: string) => void;
  isMine?: boolean;
}

const categoryLabel: Record<string, { label: string; color: string; bg: string }> = {
  express: { label: '代取快递', color: '#3B82F6', bg: '#EFF6FF' },
  canteen: { label: '代购食堂', color: '#F59E0B', bg: '#FFFBEB' },
  other: { label: '其他', color: '#64748B', bg: '#F1F5F9' },
};

const statusLabel: Record<string, string> = {
  open: '待接单',
  taken: '已接单',
  delivering: '配送中',
  completed: '已完成',
  blocked: '已拦截',
};

function timeAgo(iso: string) {
  const diff = Date.now() - new Date(iso).getTime();
  const mins = Math.floor(diff / 60000);
  if (mins < 60) return `${mins}分钟前`;
  const hrs = Math.floor(mins / 60);
  if (hrs < 24) return `${hrs}小时前`;
  return `${Math.floor(hrs / 24)}天前`;
}

export default function OrderCard({ order, onTake, isMine }: Props) {
  if (order.blocked) {
    return (
      <div className="bg-white rounded-xl border border-[#E2E8F0] p-5 opacity-60 relative overflow-hidden">
        <div className="absolute inset-0 bg-gray-50/70 flex items-center justify-center z-10">
          <div className="bg-white px-4 py-2 rounded-full shadow-sm border border-[#E2E8F0] flex items-center gap-2">
            <Lock size={14} className="text-[#64748B]" />
            <span className="text-xs font-medium text-[#64748B]">订单无法处理 (合规原因)</span>
          </div>
        </div>
        <div className="blur-sm select-none">
          <div className="flex justify-between items-start mb-4">
            <span className="px-2 py-1 bg-gray-100 text-gray-400 text-xs font-bold rounded">其他</span>
            <span className="text-gray-300 font-bold text-lg">¥ --</span>
          </div>
          <h4 className="font-bold mb-2 text-gray-300">[已隐藏内容]</h4>
          <p className="text-sm text-gray-200 mb-4">该订单包含违禁内容，已自动拦截。</p>
        </div>
      </div>
    );
  }

  const cat = categoryLabel[order.category] || categoryLabel.other;

  return (
    <div className="bg-white rounded-xl border border-[#E2E8F0] p-5 hover:shadow-md transition-all group flex flex-col">
      <div className="flex justify-between items-start mb-3">
        <span
          className="px-2 py-1 text-xs font-bold rounded"
          style={{ color: cat.color, background: cat.bg }}
        >
          {cat.label}
        </span>
        <span className="text-[#F59E0B] font-bold text-lg">¥ {order.reward.toFixed(2)}</span>
      </div>

      <h4 className="font-bold mb-2 group-hover:text-[#3B82F6] transition-colors text-[#1E293B]">
        {order.title}
      </h4>
      <p className="text-sm text-[#64748B] mb-4 line-clamp-2 flex-1">{order.description}</p>

      <div className="flex items-center gap-4 text-xs text-[#64748B] mb-4">
        <span className="flex items-center gap-1">
          <Clock size={12} /> {timeAgo(order.createdAt)}
        </span>
        <span className="flex items-center gap-1">
          <MapPin size={12} /> {order.fromLocation} → {order.toLocation}
        </span>
      </div>

      {isMine ? (
        <div
          className="w-full py-2 text-center text-sm font-bold rounded-lg"
          style={{
            background:
              order.status === 'completed'
                ? '#F0FDF4'
                : order.status === 'delivering'
                ? '#EFF6FF'
                : '#F8FAFC',
            color:
              order.status === 'completed'
                ? '#22C55E'
                : order.status === 'delivering'
                ? '#3B82F6'
                : '#64748B',
          }}
        >
          {statusLabel[order.status] || order.status}
        </div>
      ) : order.status === 'open' ? (
        <button
          onClick={() => onTake?.(order.id)}
          className="w-full py-2.5 bg-[#3B82F6]/10 text-[#3B82F6] font-bold rounded-lg group-hover:bg-[#3B82F6] group-hover:text-white transition-all"
        >
          立即接单
        </button>
      ) : (
        <div className="w-full py-2 text-center text-sm font-bold rounded-lg bg-gray-50 text-[#64748B]">
          {statusLabel[order.status]}
        </div>
      )}
    </div>
  );
}
