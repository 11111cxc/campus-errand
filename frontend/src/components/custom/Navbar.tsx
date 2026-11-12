import { Link, useLocation } from 'react-router-dom';
import { Menu, X } from 'lucide-react';
import { useState } from 'react';

export default function Navbar() {
  const location = useLocation();
  const [open, setOpen] = useState(false);

  const links = [
    { to: '/', label: '任务大厅' },
    { to: '/publish', label: '发布订单' },
    { to: '/my-orders', label: '我的订单' },
  ];

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

        {/* Credit badge */}
        <div className="hidden sm:flex flex-col items-end">
          <span className="text-sm font-medium text-[#1E293B]">张同学</span>
          <span className="text-[10px] text-[#22C55E] bg-[#22C55E]/10 px-1.5 rounded">信用分: 98</span>
        </div>

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
        </div>
      )}
    </nav>
  );
}
