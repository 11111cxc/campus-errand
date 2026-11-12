import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { toast } from 'sonner';
import { Toaster } from '@/components/ui/sonner';
import Navbar from '@/components/custom/Navbar';
import OmniflowBadge from '@/components/custom/OmniflowBadge';
import { CreateOrderRequest, OrderCategory } from '../../../shared/types/orders';

const categories: { value: OrderCategory; label: string }[] = [
  { value: 'express', label: '代取快递' },
  { value: 'canteen', label: '代购食堂' },
  { value: 'other', label: '其他跑腿' },
];

export default function Publish() {
  const navigate = useNavigate();
  const [form, setForm] = useState<CreateOrderRequest>({
    title: '',
    description: '',
    category: 'express',
    reward: 5,
    fromLocation: '',
    toLocation: '',
    publisherName: '我',
  });
  const [submitting, setSubmitting] = useState(false);

  const set = (k: keyof CreateOrderRequest, v: string | number | OrderCategory) =>
    setForm((prev) => ({ ...prev, [k]: v }));

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!form.title || !form.description || !form.fromLocation || !form.toLocation) {
      toast.error('请填写所有必填项');
      return;
    }
    setSubmitting(true);
    try {
      const res = await fetch('/api/orders', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(form),
      });
      const json = await res.json();
      if (json.message === '订单无法处理') {
        toast.error('订单无法处理，请检查内容后重试。');
      } else if (json.success) {
        toast.success('订单发布成功！');
        navigate('/');
      } else {
        toast.error(json.error || '发布失败');
      }
    } catch {
      toast.error('网络错误，请重试');
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <div className="min-h-screen bg-[#F8FAFC] text-[#1E293B]">
      <Navbar />
      <Toaster />

      <main className="max-w-2xl mx-auto px-4 sm:px-6 py-10">
        <div className="mb-8">
          <h1 className="text-2xl font-bold mb-1">发布跑腿订单</h1>
          <p className="text-[#64748B] text-sm">填写订单信息，平台将自动进行内容合规检测。</p>
        </div>

        <form onSubmit={handleSubmit} className="bg-white rounded-2xl border border-[#E2E8F0] p-6 sm:p-8 shadow-sm space-y-6">
          {/* Category */}
          <div>
            <label className="block text-sm font-semibold mb-2">订单类型</label>
            <div className="flex gap-3 flex-wrap">
              {categories.map((c) => (
                <button
                  key={c.value}
                  type="button"
                  onClick={() => set('category', c.value)}
                  className={`px-4 py-2 rounded-full text-sm font-medium border transition-all ${
                    form.category === c.value
                      ? 'bg-[#3B82F6] text-white border-[#3B82F6]'
                      : 'bg-white text-[#64748B] border-[#E2E8F0] hover:border-[#3B82F6]'
                  }`}
                >
                  {c.label}
                </button>
              ))}
            </div>
          </div>

          {/* Title */}
          <div>
            <label className="block text-sm font-semibold mb-2">
              订单标题 <span className="text-[#EF4444]">*</span>
            </label>
            <input
              type="text"
              value={form.title}
              onChange={(e) => set('title', e.target.value)}
              placeholder="例：韵达快递 - 2号宿舍楼"
              className="w-full border border-[#E2E8F0] rounded-xl px-4 py-3 text-sm focus:outline-none focus:ring-2 focus:ring-[#3B82F6]/30 focus:border-[#3B82F6] transition"
            />
          </div>

          {/* Description */}
          <div>
            <label className="block text-sm font-semibold mb-2">
              订单详情 <span className="text-[#EF4444]">*</span>
            </label>
            <textarea
              value={form.description}
              onChange={(e) => set('description', e.target.value)}
              placeholder="请详细描述跑腿需求，包括物品特征、数量、特殊要求等…"
              rows={4}
              className="w-full border border-[#E2E8F0] rounded-xl px-4 py-3 text-sm focus:outline-none focus:ring-2 focus:ring-[#3B82F6]/30 focus:border-[#3B82F6] transition resize-none"
            />
          </div>

          {/* Locations */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-semibold mb-2">
                取件地点 <span className="text-[#EF4444]">*</span>
              </label>
              <input
                type="text"
                value={form.fromLocation}
                onChange={(e) => set('fromLocation', e.target.value)}
                placeholder="例：南门快递站"
                className="w-full border border-[#E2E8F0] rounded-xl px-4 py-3 text-sm focus:outline-none focus:ring-2 focus:ring-[#3B82F6]/30 focus:border-[#3B82F6] transition"
              />
            </div>
            <div>
              <label className="block text-sm font-semibold mb-2">
                送达地点 <span className="text-[#EF4444]">*</span>
              </label>
              <input
                type="text"
                value={form.toLocation}
                onChange={(e) => set('toLocation', e.target.value)}
                placeholder="例：2号宿舍楼楼下"
                className="w-full border border-[#E2E8F0] rounded-xl px-4 py-3 text-sm focus:outline-none focus:ring-2 focus:ring-[#3B82F6]/30 focus:border-[#3B82F6] transition"
              />
            </div>
          </div>

          {/* Reward */}
          <div>
            <label className="block text-sm font-semibold mb-2">跑腿报酬 (元)</label>
            <div className="flex items-center gap-3">
              {[3, 5, 8, 10, 15].map((v) => (
                <button
                  key={v}
                  type="button"
                  onClick={() => set('reward', v)}
                  className={`px-3 py-1.5 rounded-lg text-sm font-medium border transition-all ${
                    form.reward === v
                      ? 'bg-[#F59E0B] text-white border-[#F59E0B]'
                      : 'bg-white text-[#64748B] border-[#E2E8F0] hover:border-[#F59E0B]'
                  }`}
                >
                  ¥{v}
                </button>
              ))}
              <input
                type="number"
                min={1}
                max={100}
                value={form.reward}
                onChange={(e) => set('reward', Number(e.target.value))}
                className="w-20 border border-[#E2E8F0] rounded-xl px-3 py-1.5 text-sm focus:outline-none focus:ring-2 focus:ring-[#F59E0B]/30 focus:border-[#F59E0B] transition"
              />
            </div>
          </div>

          {/* Compliance notice */}
          <div className="bg-blue-50 border border-blue-100 rounded-xl p-4 text-xs text-[#64748B] flex gap-2">
            <span className="text-[#3B82F6] mt-0.5">ℹ️</span>
            <span>订单内容将经过平台合规检测。如内容不符合规定，订单将无法处理，且不会向任何第三方泄露内容。</span>
          </div>

          <button
            type="submit"
            disabled={submitting}
            className="w-full py-3.5 bg-[#3B82F6] text-white font-bold rounded-xl hover:bg-[#2563EB] transition-all active:scale-95 disabled:opacity-60 disabled:cursor-not-allowed"
          >
            {submitting ? '提交中…' : '发布订单'}
          </button>
        </form>
      </main>

      <OmniflowBadge />
    </div>
  );
}
