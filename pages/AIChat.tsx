
import React, { useState, useRef, useEffect } from 'react';
import { GoogleGenAI } from "@google/genai";
import { Send, Bot, User, Loader2, Sparkles, MessageCircle } from 'lucide-react';

const AIChat: React.FC = () => {
  const [messages, setMessages] = useState<{ role: 'user' | 'ai'; text: string }[]>([
    { role: 'ai', text: 'أهلاً بك في المساعد الرمضاني الذكي. كيف يمكنني مساعدتك اليوم في تساؤلاتك الدينية أو الفقهية؟' }
  ]);
  const [input, setInput] = useState('');
  const [loading, setLoading] = useState(false);
  const scrollRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    scrollRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages]);

  const sendMessage = async () => {
    if (!input.trim() || loading) return;

    const userText = input.trim();
    setInput('');
    setMessages(prev => [...prev, { role: 'user', text: userText }]);
    setLoading(true);

    try {
      const ai = new GoogleGenAI({ apiKey: process.env.API_KEY });
      const response = await ai.models.generateContent({
        model: 'gemini-3-pro-preview',
        contents: userText,
        config: {
          systemInstruction: "أنت عالم إسلامي رقمي ومساعد خبير في شؤون رمضان. وظيفتك الإجابة على أسئلة المستخدمين بدقة وموثوقية بناءً على القرآن الكريم والسنة النبوية بأسلوب لطيف ومحترم. إذا كان السؤال خارج نطاق الدين أو رمضان، حاول ربطه أو الاعتذار بلطف.",
          temperature: 0.7,
        },
      });

      const aiResponse = response.text || "عذراً، لم أتمكن من معالجة الطلب حالياً.";
      setMessages(prev => [...prev, { role: 'ai', text: aiResponse }]);
    } catch (error) {
      setMessages(prev => [...prev, { role: 'ai', text: 'حدث خطأ في الاتصال بالذكاء الاصطناعي. يرجى المحاولة لاحقاً.' }]);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="max-w-4xl mx-auto h-[calc(100vh-180px)] flex flex-col gap-4 animate-in fade-in duration-700">
      <div className="flex items-center gap-3 px-2">
        <div className="p-3 bg-[#d4af37]/20 rounded-2xl text-[#d4af37]">
          <MessageCircle size={24} />
        </div>
        <div>
          <h2 className="text-2xl font-bold text-white">المساعد الرمضاني الذكي</h2>
          <p className="text-xs text-gray-500">مدعوم بتقنية Gemini 3 Pro</p>
        </div>
      </div>

      <div className="flex-1 glass rounded-[2rem] overflow-hidden border border-white/10 flex flex-col">
        <div className="flex-1 overflow-y-auto p-4 md:p-6 space-y-6">
          {messages.map((msg, idx) => (
            <div key={idx} className={`flex ${msg.role === 'user' ? 'justify-start' : 'justify-end'}`}>
              <div className={`max-w-[85%] p-4 rounded-2xl flex gap-3 ${
                msg.role === 'user' 
                ? 'bg-white/5 border border-white/10 text-white rounded-tr-none' 
                : 'bg-[#d4af37]/10 border border-[#d4af37]/20 text-white rounded-tl-none'
              }`}>
                <div className={`mt-1 flex-shrink-0 w-8 h-8 rounded-full flex items-center justify-center ${msg.role === 'user' ? 'bg-blue-500/20 text-blue-400' : 'bg-[#d4af37]/20 text-[#d4af37]'}`}>
                  {msg.role === 'user' ? <User size={16} /> : <Bot size={16} />}
                </div>
                <div className="leading-relaxed text-sm md:text-base whitespace-pre-wrap">{msg.text}</div>
              </div>
            </div>
          ))}
          {loading && (
            <div className="flex justify-end">
              <div className="bg-[#d4af37]/5 border border-[#d4af37]/10 p-4 rounded-2xl rounded-tl-none flex items-center gap-2">
                <Loader2 className="animate-spin text-[#d4af37]" size={18} />
                <span className="text-gray-500 text-sm">يتم التفكير في الإجابة...</span>
              </div>
            </div>
          )}
          <div ref={scrollRef} />
        </div>

        <div className="p-4 bg-white/5 border-t border-white/10">
          <div className="relative">
            <input 
              type="text" 
              value={input}
              onChange={(e) => setInput(e.target.value)}
              onKeyPress={(e) => e.key === 'Enter' && sendMessage()}
              placeholder="اسأل عن أحكام الصيام، السنن، أو أي تساؤل ديني..."
              className="w-full bg-black/20 border border-white/10 rounded-2xl py-4 pr-4 pl-14 text-white outline-none focus:border-[#d4af37] transition-all"
            />
            <button 
              onClick={sendMessage}
              disabled={loading}
              className="absolute left-2 top-1/2 -translate-y-1/2 w-10 h-10 bg-[#d4af37] rounded-xl flex items-center justify-center text-[#050a18] shadow-lg active:scale-95 disabled:opacity-50 transition-all"
            >
              <Send size={18} />
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};

export default AIChat;
