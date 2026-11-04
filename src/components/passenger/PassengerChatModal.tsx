import React, { useState, useRef, useEffect } from 'react';
import { useRidePlatform } from '../../context/RidePlatformContext';
import { Send, X, Phone, Shield, User } from 'lucide-react';

interface PassengerChatModalProps {
  isOpen: boolean;
  onClose: () => void;
}

export const PassengerChatModal: React.FC<PassengerChatModalProps> = ({ isOpen, onClose }) => {
  const { activeRide, messages, sendMessage } = useRidePlatform();
  const [inputText, setInputText] = useState('');
  const messagesEndRef = useRef<HTMLDivElement>(null);

  const quickReplies = [
    'أنا بانتظارك عند المدخل الرئيسي',
    'أنا عند البوابة رقم 2',
    'سأصل إلى موقعك خلال دقيقتين',
    'شكراً لك، أراك الآن',
  ];

  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages]);

  if (!isOpen || !activeRide) return null;

  const handleSend = (text: string) => {
    if (!text.trim()) return;
    sendMessage(text, 'passenger');
    setInputText('');
  };

  return (
    <div className="fixed inset-0 z-50 flex items-end sm:items-center justify-center bg-black/60 backdrop-blur-sm p-0 sm:p-4 animate-in fade-in">
      <div className="w-full max-w-lg bg-slate-900 border border-slate-800 rounded-t-3xl sm:rounded-3xl shadow-2xl flex flex-col h-[82vh] sm:h-[600px] overflow-hidden">
        {/* Header */}
        <div className="px-5 py-4 bg-slate-800/90 border-b border-slate-700/80 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="relative">
              {activeRide.driver?.avatar ? (
                <img
                  src={activeRide.driver.avatar}
                  alt={activeRide.driver.name}
                  className="w-11 h-11 rounded-full object-cover border-2 border-emerald-500"
                />
              ) : (
                <div className="w-11 h-11 rounded-full bg-slate-700 flex items-center justify-center">
                  <User className="w-5 h-5 text-slate-300" />
                </div>
              )}
              <span className="absolute bottom-0 right-0 w-3 h-3 bg-emerald-500 border-2 border-slate-900 rounded-full"></span>
            </div>
            <div>
              <h3 className="text-white font-bold text-sm sm:text-base flex items-center gap-2">
                {activeRide.driver?.name || 'الكابتن'}
                <span className="text-[11px] bg-emerald-500/10 text-emerald-400 px-2 py-0.5 rounded-full border border-emerald-500/20 font-normal">
                  سائق معتمد
                </span>
              </h3>
              <p className="text-xs text-slate-400">
                {activeRide.driver?.vehicle.make} {activeRide.driver?.vehicle.model} •{' '}
                {activeRide.driver?.vehicle.plateNumber}
              </p>
            </div>
          </div>
          <div className="flex items-center gap-2">
            <button
              onClick={() => alert(`جاري الاتصال المشفر بالكابتن: ${activeRide.driver?.phone || '055xxxxxxx'}`)}
              className="p-2.5 rounded-full bg-emerald-500/10 hover:bg-emerald-500/20 text-emerald-400 border border-emerald-500/30 transition-colors"
              title="اتصال هاتفي مقنّع"
            >
              <Phone className="w-4 h-4" />
            </button>
            <button
              onClick={onClose}
              className="p-2.5 rounded-full bg-slate-800 hover:bg-slate-700 text-slate-400 hover:text-white transition-colors"
            >
              <X className="w-5 h-5" />
            </button>
          </div>
        </div>

        {/* Safety banner */}
        <div className="bg-slate-950/60 px-4 py-2 text-[11px] text-slate-400 border-b border-slate-800/80 flex items-center justify-center gap-1.5">
          <Shield className="w-3.5 h-3.5 text-emerald-400" />
          <span>المحادثات مشفرة ومحمية لحفظ خصوصيتك وسلامتك</span>
        </div>

        {/* Messages list */}
        <div className="flex-1 overflow-y-auto p-4 space-y-3 bg-slate-900/50">
          {messages.length === 0 ? (
            <div className="text-center py-10 text-slate-500 text-sm">
              ابدأ المحادثة مع الكابتن لتحديد مكان الالتقاء بدقة
            </div>
          ) : (
            messages.map((msg) => {
              const isMe = msg.senderRole === 'passenger';
              return (
                <div key={msg.id} className={`flex flex-col ${isMe ? 'items-end' : 'items-start'}`}>
                  <div
                    className={`max-w-[80%] rounded-2xl px-4 py-2.5 text-sm shadow-md ${
                      isMe
                        ? 'bg-emerald-600 text-white rounded-br-none'
                        : 'bg-slate-800 text-slate-100 rounded-bl-none border border-slate-700'
                    }`}
                  >
                    <p className="leading-relaxed">{msg.text}</p>
                    <span
                      className={`text-[10px] block mt-1 text-left ${
                        isMe ? 'text-emerald-200' : 'text-slate-400'
                      }`}
                    >
                      {msg.timestamp}
                    </span>
                  </div>
                </div>
              );
            })
          )}
          <div ref={messagesEndRef} />
        </div>

        {/* Quick replies */}
        <div className="px-4 py-2 bg-slate-950 border-t border-slate-800 flex gap-2 overflow-x-auto no-scrollbar">
          {quickReplies.map((reply, i) => (
            <button
              key={i}
              onClick={() => handleSend(reply)}
              className="text-xs text-slate-300 bg-slate-800/80 hover:bg-slate-700 hover:text-white px-3 py-1.5 rounded-full whitespace-nowrap border border-slate-700/60 transition-colors"
            >
              {reply}
            </button>
          ))}
        </div>

        {/* Input box */}
        <div className="p-3 bg-slate-800/90 border-t border-slate-700">
          <form
            onSubmit={(e) => {
              e.preventDefault();
              handleSend(inputText);
            }}
            className="flex items-center gap-2"
          >
            <input
              type="text"
              value={inputText}
              onChange={(e) => setInputText(e.target.value)}
              placeholder="اكتب رسالة للكابتن..."
              className="flex-1 bg-slate-900 border border-slate-700 focus:border-emerald-500 rounded-full px-4 py-2.5 text-sm text-white placeholder-slate-500 outline-none transition-colors"
            />
            <button
              type="submit"
              disabled={!inputText.trim()}
              className="w-10 h-10 rounded-full bg-emerald-600 hover:bg-emerald-500 disabled:opacity-40 disabled:hover:bg-emerald-600 text-white flex items-center justify-center transition-all shadow-md shadow-emerald-600/30 shrink-0"
            >
              <Send className="w-4 h-4 rtl:rotate-180" />
            </button>
          </form>
        </div>
      </div>
    </div>
  );
};
