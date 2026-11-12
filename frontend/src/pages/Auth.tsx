import { useState } from 'react';
import { useLocation, useNavigate } from 'react-router-dom';
import { toast } from 'sonner';
import { Toaster } from '@/components/ui/sonner';
import { Check, Package, Bike, LogIn } from 'lucide-react';
import OmniflowBadge from '@/components/custom/OmniflowBadge';
import { useAuth } from '@/contexts/AuthContext';
import { ROLE_LABELS, UserRole } from '../../../shared/types/users';

type Mode = 'login' | 'register';

const roleCards: { value: UserRole; title: string; desc: string; icon: JSX.Element }[] = [
  {
    value: 'requester',
    title: '需求方',
    desc: '发布跑腿需求，填好取送地点和报酬，等同学接单。',
    icon: <Package size={18} />,
  },
  {
    value: 'runner',
    title: '跑腿员',
    desc: '在任务大厅接单，顺路帮同学带一件，完成拿报酬。',
    icon: <Bike size={18} />,
  },
];

export default function Auth() {
  const navigate = useNavigate();
  const location = useLocation();
  const { login } = useAuth();
  const [mode, setMode] = useState<Mode>(
    location.search.includes('mode=register') ? 'register' : 'login',
  );
  const [role, setRole] = useState<UserRole>('requester');
  const [studentId, setStudentId] = useState('');
  const [name, setName] = useState('');
  const [password, setPassword] = useState('');
  const [submitting, setSubmitting] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!studentId || !password || (mode === 'register' && !name)) {
      toast.error('请填写完整信息');
      return;
    }
    setSubmitting(true);
    try {
      const url = mode === 'login' ? '/api/auth/login' : '/api/auth/register';
      const body =
        mode === 'login'
          ? { studentId, password }
          : { studentId, name, password, role };
      const res = await fetch(url, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(body),
      });
      const json = await res.json();
      if (json.success) {
        login(json.data);
        toast.success(
          mode === 'login'
            ? `欢迎回来，${json.data.user.name}`
            : `注册成功，${ROLE_LABELS[json.data.user.role as UserRole]}账号`,
        );
        navigate('/');
      } else {
        toast.error(json.error || '操作失败');
      }
    } catch {
      toast.error('网络错误，请重试');
    } finally {
      setSubmitting(false);
    }
  };

  const fillDemo = (id: string, role: UserRole) => {
    setMode('login');
    setStudentId(id);
    setPassword('123456');
    setRole(role);
  };

  return (
    <div className="min-h-screen bg-[#F8FAFC] text-[#1E293B]">
      <Toaster />
      <div className="max-w-lg mx-auto px-4 py-12">
        <div className="flex items-center gap-2 mb-8 justify-center">
          <div className="w-9 h-9 bg-[#3B82F6] rounded-lg flex items-center justify-center text-white font-bold text-sm">
            跑
          </div>
          <span className="text-xl font-bold tracking-tight">校园跑腿通</span>
        </div>

        <div className="bg-white rounded-2xl border border-[#E2E8F0] shadow-sm p-6 sm:p-8">
          <div className="flex gap-2 mb-6 bg-[#F1F5F9] p-1 rounded-xl">
            {(['login', 'register'] as const).map((m) => (
              <button
                key={m}
                type="button"
                onClick={() => setMode(m)}
                className={`flex-1 py-2 rounded-lg text-sm font-semibold transition-all ${
                  mode === m ? 'bg-white text-[#1E293B] shadow-sm' : 'text-[#64748B]'
                }`}
              >
                {m === 'login' ? '登录' : '注册新账号'}
              </button>
            ))}
          </div>

          <form onSubmit={handleSubmit} className="space-y-5">
            {mode === 'register' && (
              <div>
                <label className="block text-sm font-semibold mb-2">选择账号类型</label>
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                  {roleCards.map((r) => (
                    <button
                      key={r.value}
                      type="button"
                      onClick={() => setRole(r.value)}
                      className={`text-left p-4 rounded-xl border transition-all ${
                        role === r.value
                          ? 'border-[#3B82F6] bg-blue-50/60 ring-1 ring-[#3B82F6]/30'
                          : 'border-[#E2E8F0] hover:border-[#94A3B8]'
                      }`}
                    >
                      <div className="flex items-center justify-between mb-1.5">
                        <span
                          className={`inline-flex items-center gap-1.5 font-bold text-sm ${
                            role === r.value ? 'text-[#3B82F6]' : 'text-[#1E293B]'
                          }`}
                        >
                          {r.icon}
                          {r.title}
                        </span>
                        {role === r.value && <Check size={16} className="text-[#3B82F6]" />}
                      </div>
                      <p className="text-xs text-[#64748B] leading-relaxed">{r.desc}</p>
                    </button>
                  ))}
                </div>
                <p className="text-[11px] text-[#94A3B8] mt-2">
                  账号类型决定你能做什么：需求方发单，跑腿员接单，注册后不可自行更改。
                </p>
              </div>
            )}

            <div>
              <label className="block text-sm font-semibold mb-2">
                学号 <span className="text-[#EF4444]">*</span>
              </label>
              <input
                type="text"
                value={studentId}
                onChange={(e) => setStudentId(e.target.value)}
                placeholder="例：20230101"
                className="w-full border border-[#E2E8F0] rounded-xl px-4 py-3 text-sm focus:outline-none focus:ring-2 focus:ring-[#3B82F6]/30 focus:border-[#3B82F6] transition"
              />
            </div>

            {mode === 'register' && (
              <div>
                <label className="block text-sm font-semibold mb-2">
                  昵称 <span className="text-[#EF4444]">*</span>
                </label>
                <input
                  type="text"
                  value={name}
                  onChange={(e) => setName(e.target.value)}
                  placeholder="其他同学看到的名字，例：李同学"
                  className="w-full border border-[#E2E8F0] rounded-xl px-4 py-3 text-sm focus:outline-none focus:ring-2 focus:ring-[#3B82F6]/30 focus:border-[#3B82F6] transition"
                />
              </div>
            )}

            <div>
              <label className="block text-sm font-semibold mb-2">
                密码 <span className="text-[#EF4444]">*</span>
              </label>
              <input
                type="password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                placeholder="6-32 位"
                className="w-full border border-[#E2E8F0] rounded-xl px-4 py-3 text-sm focus:outline-none focus:ring-2 focus:ring-[#3B82F6]/30 focus:border-[#3B82F6] transition"
              />
            </div>

            <button
              type="submit"
              disabled={submitting}
              className="w-full py-3.5 bg-[#3B82F6] text-white font-bold rounded-xl hover:bg-[#2563EB] transition-all active:scale-95 disabled:opacity-60 disabled:cursor-not-allowed inline-flex items-center justify-center gap-2"
            >
              <LogIn size={16} />
              {submitting ? '处理中…' : mode === 'login' ? '登录' : '注册并进入'}
            </button>
          </form>

          <div className="mt-6 pt-5 border-t border-[#E2E8F0]">
            <p className="text-xs font-semibold text-[#64748B] mb-3">课堂演示账号（点一下自动填入）</p>
            <div className="space-y-2">
              <button
                type="button"
                onClick={() => fillDemo('20230101', 'requester')}
                className="w-full flex items-center justify-between text-xs px-3 py-2 rounded-lg bg-[#F8FAFC] border border-[#E2E8F0] hover:border-[#3B82F6] transition"
              >
                <span className="font-medium">20230101 · 李同学</span>
                <span className="text-[#3B82F6] font-semibold">需求方</span>
              </button>
              <button
                type="button"
                onClick={() => fillDemo('20230102', 'runner')}
                className="w-full flex items-center justify-between text-xs px-3 py-2 rounded-lg bg-[#F8FAFC] border border-[#E2E8F0] hover:border-[#3B82F6] transition"
              >
                <span className="font-medium">20230102 · 王同学</span>
                <span className="text-[#22C55E] font-semibold">跑腿员</span>
              </button>
            </div>
            <p className="text-[10px] text-[#94A3B8] mt-2">密码均为 123456，可自行注册新的两种类型账号。</p>
          </div>
        </div>

        <button
          type="button"
          onClick={() => navigate('/')}
          className="mt-6 w-full text-center text-sm text-[#64748B] hover:text-[#3B82F6]"
        >
          先随便逛逛，不登录 →
        </button>
      </div>

      <OmniflowBadge />
    </div>
  );
}
