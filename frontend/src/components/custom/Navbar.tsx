import { Link, useLocation, useNavigate } from 'react-router-dom';
import { Menu, X, LogOut } from 'lucide-react';
import { useState } from 'react';
import { useAuth } from '@/contexts/AuthContext';
import { ROLE_LABELS } from '@shared/types/users';

export default function Navbar() {
  const location = useLocation();
  const navigate = useNavigate();
  const { user, logout } = useAuth();
  const [open, setOpen] = useState(false);

  const links = [
    { to: '/', label: '任务大厅' },
    { to: '/publish', label: '发布订单' },
    { to: '/my-orders', label: '我的订单' },
  ];

  const roleStyle =
    user?.role === 'runner'
      ? 'text-[#16A34A] bg-[#22C55E]/10'
      : 'text-[#2563EB] bg-[#3B82F6]/10';

  return (
    <nav className="sticky top-0 z-50 bg-white/80 backdrop-blur-md border-b border-[#E2E8F0]">
      <div className="max-w-screen-xl mx-auto px-4 sm:px-6 lg:px-8 h-16 flex items-center justify-between">
        <Link to="/" className="flex items-center gap-2">
          <div className="w-8 h-8 bg-[#3B82F6] rounded-lg flex items-center justify-center text-white font-bold text-sm">跑</div>
          <span className="text-xl font-bold tracking-tight text-[#1E293B]">校园跑腿通</span>
        </Link>

        {/* Desktop nav */}
        <div className="hidden md:flex items-center gap-8">
          {links.map((l) => (
            <Link
              key={l.to}
              to={l.to}
              className={`font-medium transition-colors ${
                location.pathname === l.to
                  ? 'text-[#3B82F6]'
                  : 'text-[#64748B] hover:text-[#3B82F6]'
              }`}
            >
              {l.label}
            </Link>
          ))}
        </div>

        {/* Account area */}
        {user ? (
          <div className="hidden sm:flex items-center gap-3">
            <div className="flex flex-col items-end">
              <span className="text-sm font-medium text-[#1E293B]">{user.name}</span>
              <span className="flex items-center gap-1.5">
                <span className={`text-[10px] px-1.5 rounded ${roleStyle}`}>
                  {ROLE_LABELS[user.role]}
                </span>
                <span className="text-[10px] text-[#94A3B8]">学号 {user.studentId}</span>
              </span>
            </div>
            <button
              onClick={() => {
                logout();
                navigate('/');
              }}
              aria-label="退出登录"
              className="p-2 rounded-lg text-[#94A3B8] hover:text-[#EF4444] hover:bg-[#F8FAFC] transition"
            >
              <LogOut size={16} />
            </button>
          </div>
        ) : (
          <Link
            to="/auth"
            className="hidden sm:inline-flex items-center px-4 py-2 rounded-lg bg-[#3B82F6] text-white text-sm font-semibold hover:bg-[#2563EB] transition"
          >
            登录 / 注册
          </Link>
        )}

        {/* Mobile menu button */}
        <button
          className="md:hidden p-2 rounded-lg text-[#64748B] hover:bg-gray-100"
          onClick={() => setOpen(!open)}
          aria-label="菜单"
        >
          {open ? <X size={20} /> : <Menu size={20} />}
        </button>
      </div>

      {/* Mobile dropdown */}
      {open && (
        <div className="md:hidden bg-white border-t border-[#E2E8F0] px-4 py-3 flex flex-col gap-3">
          {links.map((l) => (
            <Link
              key={l.to}
              to={l.to}
              onClick={() => setOpen(false)}
              className={`font-medium py-1 transition-colors ${
                location.pathname === l.to ? 'text-[#3B82F6]' : 'text-[#64748B]'
              }`}
            >
              {l.label}
            </Link>
          ))}
          {user ? (
            <button
              onClick={() => {
                logout();
                setOpen(false);
                navigate('/');
              }}
              className="font-medium py-1 text-left text-[#EF4444]"
            >
              退出登录（{user.name} · {ROLE_LABELS[user.role]}）
            </button>
          ) : (
            <Link to="/auth" onClick={() => setOpen(false)} className="font-medium py-1 text-[#3B82F6]">
              登录 / 注册
            </Link>
          )}
        </div>
      )}
    </nav>
  );
}
