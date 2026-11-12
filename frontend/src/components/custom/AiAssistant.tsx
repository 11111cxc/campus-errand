import { useState, useRef, useEffect } from 'react';
import { MessageCircle, X, Send, Bot, User } from 'lucide-react';

interface Message {
  id: string;
  role: 'user' | 'assistant';
  content: string;
}

const SYSTEM_PROMPT = `你是「校园跑腿通」的智能助手小跑，专门帮助校园内的学生解答跑腿相关问题。
你可以帮助用户：
1. 了解如何发布和接取跑腿订单
2. 解释平台的信用分制度和规则
3. 解答关于违禁物品和合规要求的问题
4. 提供跑腿服务的建议和技巧
请用友好、简洁的中文回答，适合大学生使用。`;

export default function AiAssistant() {
  const [open, setOpen] = useState(false);
  const [messages, setMessages] = useState<Message[]>([
    { id: '0', role: 'assistant', content: '你好！我是小跑，校园跑腿通的智能助手 🎒 有什么可以帮你的吗？' },
  ]);
  const [input, setInput] = useState('');
  const [streaming, setStreaming] = useState(false);
  const bottomRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    bottomRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages]);

  const sendMessage = async () => {
    const text = input.trim();
    if (!text || streaming) return;
    setInput('');

    const userMsg: Message = { id: Date.now().toString(), role: 'user', content: text };
    const assistantId = (Date.now() + 1).toString();
    const assistantMsg: Message = { id: assistantId, role: 'assistant', content: '' };

    setMessages((prev) => [...prev, userMsg, assistantMsg]);
    setStreaming(true);

    try {
      const res = await fetch('/api/ai/chat', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ message: text, systemPrompt: SYSTEM_PROMPT }),
      });

      if (!res.ok || !res.body) throw new Error('请求失败');

      const reader = res.body.getReader();
      const decoder = new TextDecoder();
      let buffer = '';

      while (true) {
        const { done, value } = await reader.read();
        if (done) {
          buffer += decoder.decode();
          if (buffer.startsWith('data: ')) {
            const data = buffer.slice(6);
            if (data !== '[DONE]') {
              try {
                const parsed = JSON.parse(data);
                if (parsed.content) {
                  setMessages((prev) =>
                    prev.map((m) => m.id === assistantId ? { ...m, content: m.content + parsed.content } : m)
                  );
                }
              } catch { /* ignore */ }
            }
          }
          break;
        }
        buffer += decoder.decode(value, { stream: true });
        const lines = buffer.split('\n');
        buffer = lines.pop() || '';
        for (const line of lines) {
          if (line.startsWith('data: ')) {
            const data = line.slice(6);
            if (data === '[DONE]') break;
            try {
              const parsed = JSON.parse(data);
              if (parsed.content) {
                setMessages((prev) =>
                  prev.map((m) => m.id === assistantId ? { ...m, content: m.content + parsed.content } : m)
                );
              }
            } catch { /* ignore */ }
          }
        }
      }
    } catch {
      setMessages((prev) =>
        prev.map((m) => m.id === assistantId ? { ...m, content: '抱歉，出现了网络错误，请稍后重试。' } : m)
      );
    } finally {
      setStreaming(false);
    }
  };

  return (
    <>
      {/* Floating button */}
      <button
        onClick={() => setOpen(true)}
        className={`fixed bottom-20 right-4 z-40 w-14 h-14 bg-[#3B82F6] text-white rounded-full shadow-lg flex items-center justify-center hover:bg-[#2563EB] transition-all active:scale-95 ${
          open ? 'hidden' : ''
        }`}
        aria-label="打开AI助手"
      >
        <MessageCircle size={24} />
      </button>

      {/* Chat panel */}
      {open && (
        <div className="fixed bottom-4 right-4 z-50 w-[calc(100vw-2rem)] max-w-sm bg-white rounded-2xl shadow-2xl border border-[#E2E8F0] flex flex-col" style={{ height: '480px' }}>
          {/* Header */}
          <div className="flex items-center justify-between px-4 py-3 border-b border-[#E2E8F0] bg-[#3B82F6] rounded-t-2xl">
            <div className="flex items-center gap-2 text-white">
              <Bot size={18} />
              <span className="font-bold text-sm">小跑助手</span>
              <span className="text-[10px] bg-white/20 px-1.5 py-0.5 rounded-full">AI</span>
            </div>
            <button onClick={() => setOpen(false)} className="text-white/80 hover:text-white">
              <X size={18} />
            </button>
          </div>

          {/* Messages */}
          <div className="flex-1 overflow-y-auto px-4 py-3 space-y-3">
            {messages.map((m) => (
              <div key={m.id} className={`flex gap-2 ${ m.role === 'user' ? 'flex-row-reverse' : '' }`}>
                <div className={`w-7 h-7 rounded-full flex items-center justify-center flex-shrink-0 ${
                  m.role === 'assistant' ? 'bg-[#3B82F6] text-white' : 'bg-[#F59E0B] text-white'
                }`}>
                  {m.role === 'assistant' ? <Bot size={14} /> : <User size={14} />}
                </div>
                <div
                  className={`max-w-[75%] px-3 py-2 rounded-2xl text-sm leading-relaxed ${
                    m.role === 'assistant'
                      ? 'bg-[#F8FAFC] text-[#1E293B] rounded-tl-sm'
                      : 'bg-[#3B82F6] text-white rounded-tr-sm'
                  }`}
                >
                  {m.content || (
                    <span className="flex gap-1">
                      <span className="w-1.5 h-1.5 bg-current rounded-full animate-bounce" style={{ animationDelay: '0ms' }} />
                      <span className="w-1.5 h-1.5 bg-current rounded-full animate-bounce" style={{ animationDelay: '150ms' }} />
                      <span className="w-1.5 h-1.5 bg-current rounded-full animate-bounce" style={{ animationDelay: '300ms' }} />
                    </span>
                  )}
                </div>
              </div>
            ))}
            <div ref={bottomRef} />
          </div>

          {/* Input */}
          <div className="px-3 py-3 border-t border-[#E2E8F0] flex gap-2">
            <input
              type="text"
              value={input}
              onChange={(e) => setInput(e.target.value)}
              onKeyDown={(e) => e.key === 'Enter' && !e.shiftKey && sendMessage()}
              placeholder="问问小跑…"
              disabled={streaming}
              className="flex-1 border border-[#E2E8F0] rounded-xl px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-[#3B82F6]/30 focus:border-[#3B82F6] transition disabled:opacity-60"
            />
            <button
              onClick={sendMessage}
              disabled={streaming || !input.trim()}
              className="w-9 h-9 bg-[#3B82F6] text-white rounded-xl flex items-center justify-center hover:bg-[#2563EB] transition disabled:opacity-40"
            >
              <Send size={15} />
            </button>
          </div>
        </div>
      )}
    </>
  );
}
