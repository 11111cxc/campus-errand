import { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { ShieldCheck, Zap, Lock, ChevronRight } from 'lucide-react';
import { toast } from 'sonner';
import OmniflowBadge from '@/components/custom/OmniflowBadge';
import { Toaster } from '@/components/ui/sonner';
import Navbar from '@/components/custom/Navbar';
import OrderCard from '@/components/custom/OrderCard';
import { Order } from '../../../shared/types/orders';

type Category = 'all' | 'express' | 'canteen';

export default function Index() {
  const [orders, setOrders] = useState<Order[]>([]);
  const [loading, setLoading] = useState(true);
  const [category, setCategory] = useState<Category>('all');

  const fetchOrders = async () => {
    try {
      const res = await fetch('/api/orders');
      const json = await res.json();
      if (json.success) setOrders(json.data.orders);
    } catch {
      toast.error('获取订单失败，请刷新页面');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => { fetchOrders(); }, []);

  const handleTake = async (id: string) => {
    try {
      const res = await fetch(`/api/orders/${id}/take`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ takerName: '我' }),
      });
      const json = await res.json();
      if (json.success) {
        toast.success('接单成功！请尽快完成配送。');
        fetchOrders();
      } else {
        toast.error(json.error || '接单失败');
      }
    } catch {
      toast.error('网络错误，请重试');
    }
  };

  const filtered = orders.filter((o) => {
    if (o.blocked) return true;
    if (category === 'all') return true;
    return o.category === category;
  });

  const cats: { key: Category; label: string }[] = [
    { key: 'all', label: '全部' },
    { key: 'express', label: '代取快递' },
    { key: 'canteen', label: '代购食堂' },
  ];

  return (
    <div className="min-h-screen bg-[#F8FAFC] text-[#1E293B]">
      <Navbar />
      <Toaster />

      <main className="max-w-screen-xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Hero + Credit */}
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 mb-10">
          {/* Hero */}
          <div className="lg:col-span-2 bg-gradient-to-br from-[#3B82F6] to-[#1D4ED8] rounded-2xl p-8 text-white relative overflow-hidden shadow-lg">
            <div className="relative z-10">
              <h1 className="text-3xl font-bold mb-2">同学，今天需要帮忙吗？</h1>
              <p className="text-blue-100 mb-6 max-w-md">安全、快速、隐私保护。校园内的互助配送平台，让生活更简单。</p>
              <Link
                to="/publish"
                className="inline-flex items-center gap-2 bg-white text-[#3B82F6] px-6 py-3 rounded-xl font-bold hover:shadow-lg transition-all active:scale-95"
              >
                立即发布订单 <ChevronRight size={16} />
              </Link>
            </div>
            <div className="absolute right-[-20px] bottom-[-20px] opacity-10">
              <svg width="200" height="200" viewBox="0 0 24 24" fill="currentColor">
                <path d="M12 2L4.5 20.29L5.21 21L12 18L18.79 21L19.5 20.29L12 2Z" />
              </svg>
            </div>
          </div>

          {/* Credit overview */}
          <div className="bg-white rounded-2xl p-6 border border-[#E2E8F0] shadow-sm">
            <h3 className="font-bold mb-4 flex items-center gap-2">
              <span className="w-1.5 h-6 bg-[#F59E0B] rounded-full" />
              我的信用概览
            </h3>
            <div className="flex items-center justify-between mb-6">
              <div>
                <div className="text-4xl font-bold text-[#1E293B]">98</div>
                <div className="text-sm text-[#64748B]">信用等级：极好</div>
              </div>
              <div className="w-16 h-16 rounded-full border-4 border-[#22C55E] flex items-center justify-center">
                <ShieldCheck size={28} className="text-[#22C55E]" />
              </div>
            </div>
            <div className="space-y-2">
              <div className="flex justify-between text-sm">
                <span className="text-[#64748B]">配送失败次数</span>
                <span className="font-medium">0 / 3</span>
              </div>
              <div className="w-full bg-[#E2E8F0] h-2 rounded-full overflow-hidden">
                <div className="bg-[#EF4444] h-full w-0" />
              </div>
              <p className="text-[10px] text-[#64748B]">* 累积3次配送失败将自动封禁学号</p>
            </div>
          </div>
        </div>

        {/* Task Hall */}
        <div className="flex items-center justify-between mb-6">
          <h2 className="text-2xl font-bold">任务大厅</h2>
          <div className="flex gap-2 flex-wrap">
            {cats.map((c) => (
              <button
                key={c.key}
                onClick={() => setCategory(c.key)}
                className={`px-4 py-1.5 rounded-full text-sm font-medium transition-all ${
                  category === c.key
                    ? 'bg-[#3B82F6] text-white'
                    : 'bg-white border border-[#E2E8F0] text-[#64748B] hover:bg-gray-50'
                }`}
              >
                {c.label}
              </button>
            ))}
          </div>
        </div>

        {loading ? (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {[1, 2, 3].map((i) => (
              <div key={i} className="bg-white rounded-xl border border-[#E2E8F0] p-5 animate-pulse h-52" />
            ))}
          </div>
        ) : filtered.length === 0 ? (
          <div className="text-center py-20 text-[#64748B]">
            <p className="text-lg">暂无相关订单</p>
            <Link to="/publish" className="mt-4 inline-block text-[#3B82F6] font-medium hover:underline">
              去发布一个订单
            </Link>
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {filtered.map((o) => (
              <OrderCard key={o.id} order={o} onTake={handleTake} />
            ))}
          </div>
        )}

        {/* Features */}
        <section className="mt-16 grid grid-cols-1 md:grid-cols-3 gap-8 border-t border-[#E2E8F0] pt-12">
          {[
            {
              icon: <ShieldCheck size={24} />,
              bg: 'bg-blue-100',
              color: 'text-[#3B82F6]',
              title: '实名认证',
              desc: '仅限本校学生，通过学号与邮筱双重验证，确保社区纯净。',
            },
            {
              icon: <Zap size={24} />,
              bg: 'bg-green-100',
              color: 'text-[#10B981]',
              title: '信用约束',
              desc: '严格的信用分制度，累积3次配送失败将永久拉黑，保障服务质量。',
            },
            {
              icon: <Lock size={24} />,
              bg: 'bg-purple-100',
              color: 'text-purple-600',
              title: '隐私合规',
              desc: '智能检测违禁内容，违规订单静默删除，不向第三方泄露任何隐私。',
            },
          ].map((f) => (
            <div key={f.title} className="text-center">
              <div className={`w-12 h-12 ${f.bg} ${f.color} rounded-full flex items-center justify-center mx-auto mb-4`}>
                {f.icon}
              </div>
              <h5 className="font-bold mb-2">{f.title}</h5>
              <p className="text-sm text-[#64748B]">{f.desc}</p>
            </div>
          ))}
        </section>
      </main>

      <footer className="bg-white border-t border-[#E2E8F0] mt-20 py-10">
        <div className="max-w-screen-xl mx-auto px-4 text-center">
          <p className="text-[#64748B] text-sm">© 2026 校园跑腿通 - 让校园生活更美好</p>
          <div className="flex justify-center gap-6 mt-4">
            <a href="#" className="text-xs text-[#64748B] hover:text-[#3B82F6]">用户协议</a>
            <a href="#" className="text-xs text-[#64748B] hover:text-[#3B82F6]">隐私政策</a>
            <a href="#" className="text-xs text-[#64748B] hover:text-[#3B82F6]">申诉渠道</a>
          </div>
        </div>
      </footer>

      <OmniflowBadge />
    </div>
  );
}
