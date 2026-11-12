import { useState, useEffect } from 'react';
import { toast } from 'sonner';
import { Toaster } from '@/components/ui/sonner';
import Navbar from '@/components/custom/Navbar';
import OrderCard from '@/components/custom/OrderCard';
import OmniflowBadge from '@/components/custom/OmniflowBadge';
import { Order } from '../../../shared/types/orders';

export default function MyOrders() {
  const [orders, setOrders] = useState<Order[]>([]);
  const [loading, setLoading] = useState(true);
  const [tab, setTab] = useState<'published' | 'taking'>('published');

  const fetchOrders = async () => {
    try {
      const res = await fetch('/api/orders');
      const json = await res.json();
      if (json.success) setOrders(json.data.orders);
    } catch {
      toast.error('获取订单失败');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => { fetchOrders(); }, []);

  const handleComplete = async (id: string) => {
    try {
      const res = await fetch(`/api/orders/${id}/complete`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
      });
      const json = await res.json();
      if (json.success) {
        toast.success('订单已标记完成！');
        fetchOrders();
      } else {
        toast.error(json.error || '操作失败');
      }
    } catch {
      toast.error('网络错误');
    }
  };

  // Simulate: published = publisherId === 'current-user', taking = takerId === 'current-user'
  const published = orders.filter((o) => o.publisherId === 'current-user');
  const taking = orders.filter((o) => o.takerId === 'current-user');
  const list = tab === 'published' ? published : taking;

  return (
    <div className="min-h-screen bg-[#F8FAFC] text-[#1E293B]">
      <Navbar />
      <Toaster />

      <main className="max-w-screen-xl mx-auto px-4 sm:px-6 lg:px-8 py-10">
        <h1 className="text-2xl font-bold mb-6">我的订单</h1>

        {/* Tabs */}
        <div className="flex gap-2 mb-8">
          {(['published', 'taking'] as const).map((t) => (
            <button
              key={t}
              onClick={() => setTab(t)}
              className={`px-5 py-2 rounded-full text-sm font-medium transition-all ${
                tab === t
                  ? 'bg-[#3B82F6] text-white'
                  : 'bg-white border border-[#E2E8F0] text-[#64748B] hover:bg-gray-50'
              }`}
            >
              {t === 'published' ? '我发布的' : '我接单的'}
            </button>
          ))}
        </div>

        {loading ? (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {[1, 2].map((i) => (
              <div key={i} className="bg-white rounded-xl border border-[#E2E8F0] p-5 animate-pulse h-52" />
            ))}
          </div>
        ) : list.length === 0 ? (
          <div className="text-center py-20 text-[#64748B]">
            <p className="text-lg">暂无{tab === 'published' ? '发布' : '接取'}的订单</p>
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {list.map((o) => (
              <div key={o.id} className="flex flex-col gap-2">
                <OrderCard order={o} isMine />
                {tab === 'taking' && o.status === 'delivering' && (
                  <button
                    onClick={() => handleComplete(o.id)}
                    className="w-full py-2.5 bg-[#22C55E] text-white font-bold rounded-xl hover:bg-[#16A34A] transition-all active:scale-95"
                  >
                    标记已完成
                  </button>
                )}
              </div>
            ))}
          </div>
        )}
      </main>

      <OmniflowBadge />
    </div>
  );
}
