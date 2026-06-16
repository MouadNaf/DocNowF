import { useState, useRef, useEffect, useCallback } from 'react';
import { MessageSquare, X, Send, Stethoscope, MapPin, Calendar, Clock, User } from 'lucide-react';
import { usePreferencesStore } from '@/store/preferences.store';
import { t } from '@/lib/i18n';
import { cn } from '@/lib/utils/cn';
import api from '@/lib/api';

// ── Types ────────────────────────────────────────────────────────────────────

interface ChatMessage {
  id: string;
  type: 'user' | 'bot';
  text: string;
  responseType?: 'text' | 'doctors' | 'appointments';
  data?: any[];
}

interface ChatDoctorData {
  id: string;
  name: string;
  specialty: string;
  city: string;
  profile_picture: string;
  fee: string;
  hospital: string;
}

interface ChatAppointmentData {
  id: string;
  doctor_name: string;
  doctor_specialty: string;
  doctor_image: string;
  date: string;
  time: string;
  status: string;
  location: string;
}

// ── Component ────────────────────────────────────────────────────────────────

export function FloatingAssistant() {
  const { language } = usePreferencesStore();
  const [isOpen, setIsOpen] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [messages, setMessages] = useState<ChatMessage[]>([]);
  const [inputValue, setInputValue] = useState('');
  const messagesEndRef = useRef<HTMLDivElement>(null);
  const inputRef = useRef<HTMLInputElement>(null);

  const isRtl = language === 'ar';

  // Reset welcome message when language changes
  useEffect(() => {
    setMessages([
      { id: '1', type: 'bot', text: t(language, 'chatbotWelcome') },
    ]);
  }, [language]);

  useEffect(() => {
    if (messagesEndRef.current) {
      messagesEndRef.current.scrollIntoView({ behavior: 'smooth' });
    }
  }, [messages, isOpen]);

  // Focus input when chat opens
  useEffect(() => {
    if (isOpen && inputRef.current) {
      setTimeout(() => inputRef.current?.focus(), 300);
    }
  }, [isOpen]);

  const toggleChat = () => setIsOpen(!isOpen);

  const sendMessage = useCallback(async (text: string) => {
    const trimmed = text.trim();
    if (!trimmed || isLoading) return;

    // Add user message
    const userMsg: ChatMessage = {
      id: Date.now().toString(),
      type: 'user',
      text: trimmed,
    };
    setMessages(prev => [...prev, userMsg]);
    setInputValue('');
    setIsLoading(true);

    try {
      const response = await api.post('/chat', { message: trimmed });
      const data = response.data;

      const botMsg: ChatMessage = {
        id: (Date.now() + 1).toString(),
        type: 'bot',
        text: data.message || 'No response received.',
        responseType: data.type || 'text',
        data: data.data || [],
      };
      setMessages(prev => [...prev, botMsg]);
    } catch (error: any) {
      const errorMessage = error?.response?.data?.message 
        || 'Connection error. Please check your internet and try again.';
      const botMsg: ChatMessage = {
        id: (Date.now() + 1).toString(),
        type: 'bot',
        text: errorMessage,
      };
      setMessages(prev => [...prev, botMsg]);
    } finally {
      setIsLoading(false);
    }
  }, [isLoading]);

  const handleSuggestionClick = (suggestion: string) => {
    sendMessage(suggestion);
  };

  const suggestions = [
    t(language, 'chatbotSug1'),
    t(language, 'chatbotSug2'),
    t(language, 'chatbotSug3'),
  ];

  return (
    <div className="fixed bottom-6 right-6 z-[9999] flex flex-col items-end">
      {/* Chat Window */}
      <div
        className={cn(
          "mb-4 w-[380px] max-w-[calc(100vw-32px)] bg-white rounded-3xl shadow-2xl border border-gray-100 overflow-hidden flex flex-col transition-all duration-300 origin-bottom-right",
          isOpen
            ? "opacity-100 scale-100 translate-y-0"
            : "opacity-0 scale-95 translate-y-4 pointer-events-none"
        )}
        style={{ height: '520px', maxHeight: 'calc(100vh - 120px)' }}
        dir={isRtl ? 'rtl' : 'ltr'}
      >
        {/* ── Header ────────────────────────────────────────────── */}
        <div className="bg-gradient-to-r from-[#1D9E75] to-[#15805d] text-white px-5 py-4 flex items-center justify-between shrink-0">
          <div className="flex items-center gap-3">
            <div className="h-10 w-10 rounded-full bg-white/20 backdrop-blur-sm flex items-center justify-center ring-2 ring-white/30">
              <Stethoscope size={20} className="text-white" />
            </div>
            <div>
              <h3 className="font-bold text-[15px]">{t(language, 'chatbotTitle')}</h3>
              <div className="flex items-center gap-1.5 mt-0.5">
                <div className="h-2 w-2 rounded-full bg-green-300 animate-pulse" />
                <span className="text-xs text-white/80">{t(language, 'chatbotOnline')}</span>
              </div>
            </div>
          </div>
          <button
            onClick={toggleChat}
            className="h-8 w-8 rounded-full bg-white/10 hover:bg-white/25 flex items-center justify-center transition-colors"
          >
            <X size={18} />
          </button>
        </div>

        {/* ── Messages Area ──────────────────────────────────────── */}
        <div className="flex-1 overflow-y-auto p-4 bg-gradient-to-b from-slate-50 to-white flex flex-col gap-3 scroll-smooth">
          {messages.map((msg) => (
            <div key={msg.id}>
              {/* Text bubble */}
              <div
                className={cn(
                  "max-w-[85%] rounded-2xl px-4 py-3 text-sm leading-relaxed whitespace-pre-wrap",
                  msg.type === 'user'
                    ? "bg-[#1D9E75] text-white ml-auto rounded-br-md shadow-md shadow-emerald-100"
                    : "bg-white border border-gray-100 text-gray-800 mr-auto rounded-tl-md shadow-sm"
                )}
              >
                {msg.text}
              </div>

              {/* Doctor cards */}
              {msg.type === 'bot' && msg.responseType === 'doctors' && msg.data && msg.data.length > 0 && (
                <div className="mt-2 flex flex-col gap-2">
                  {msg.data.map((item: any, idx: number) => (
                    <DoctorCard key={idx} doctor={item} />
                  ))}
                </div>
              )}

              {/* Appointment cards */}
              {msg.type === 'bot' && msg.responseType === 'appointments' && msg.data && msg.data.length > 0 && (
                <div className="mt-2 flex flex-col gap-2">
                  {msg.data.map((item: any, idx: number) => (
                    <AppointmentCard key={idx} appointment={item} />
                  ))}
                </div>
              )}
            </div>
          ))}

          {/* Typing indicator */}
          {isLoading && <TypingIndicator />}

          {/* Suggestions (show only at start) */}
          {messages.length === 1 && !isLoading && (
            <div className="mt-3">
              <p className="text-xs text-center text-gray-400 mb-3 font-medium">
                {t(language, 'chatbotSuggestionsTitle')}
              </p>
              <div className="flex flex-wrap gap-2 justify-center">
                {suggestions.map((sug, idx) => (
                  <button
                    key={idx}
                    onClick={() => handleSuggestionClick(sug)}
                    className="text-xs text-[#1D9E75] bg-emerald-50 hover:bg-emerald-100 px-3.5 py-2 rounded-full transition-all duration-200 border border-emerald-100 hover:shadow-sm font-medium"
                  >
                    {sug}
                  </button>
                ))}
              </div>
            </div>
          )}

          <div ref={messagesEndRef} />
        </div>

        {/* ── Input Area ─────────────────────────────────────────── */}
        <div className="px-4 py-3 bg-white border-t border-gray-100 shrink-0">
          <div className="relative flex items-center">
            <input
              ref={inputRef}
              type="text"
              value={inputValue}
              onChange={(e) => setInputValue(e.target.value)}
              onKeyDown={(e) => e.key === 'Enter' && sendMessage(inputValue)}
              disabled={isLoading}
              placeholder={t(language, 'chatbotInputPlaceholder')}
              className={cn(
                "w-full bg-gray-50 border border-gray-200 rounded-full py-3 text-sm focus:outline-none focus:ring-2 focus:ring-[#1D9E75]/20 focus:border-[#1D9E75] transition-all disabled:opacity-50",
                isRtl ? "pr-4 pl-12" : "pl-4 pr-12"
              )}
            />
            <button
              onClick={() => sendMessage(inputValue)}
              disabled={isLoading || !inputValue.trim()}
              className={cn(
                "absolute h-9 w-9 rounded-full bg-[#1D9E75] hover:bg-[#15805d] disabled:bg-gray-300 text-white flex items-center justify-center transition-all duration-200",
                isRtl ? "left-1.5" : "right-1.5"
              )}
            >
              <Send size={16} className={isRtl ? "rotate-180" : ""} />
            </button>
          </div>
          <p className="text-[10px] text-center text-gray-400 mt-2">
            {t(language, 'chatbotDisclaimer')}
          </p>
        </div>
      </div>

      {/* ── Floating Action Button ────────────────────────────── */}
      <div className="relative group">
        {/* Tooltip */}
        <div className={cn(
          "absolute bottom-full mb-2 right-0 whitespace-nowrap bg-gray-900 text-white text-xs font-medium px-3 py-1.5 rounded-lg opacity-0 group-hover:opacity-100 transition-opacity duration-200 pointer-events-none",
          isOpen && "hidden"
        )}>
          {t(language, 'chatbotTitle')}
        </div>

        <button
          onClick={toggleChat}
          className={cn(
            "h-14 w-14 rounded-full text-white shadow-xl flex items-center justify-center transition-all duration-300",
            isOpen
              ? "bg-gray-400 hover:bg-gray-500 rotate-0 scale-90"
              : "bg-[#1D9E75] hover:bg-[#15805d] hover:scale-110 shadow-emerald-200/50"
          )}
        >
          {isOpen ? <X size={24} /> : <MessageSquare size={24} />}

          {/* Notification badge */}
          {!isOpen && (
            <span className="absolute -top-0.5 -right-0.5 flex h-3.5 w-3.5">
              <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-red-400 opacity-75" />
              <span className="relative inline-flex rounded-full h-3.5 w-3.5 bg-red-500 border-2 border-white" />
            </span>
          )}
        </button>
      </div>
    </div>
  );
}

// ── Doctor Card ──────────────────────────────────────────────────────────────

function DoctorCard({ doctor }: { doctor: ChatDoctorData }) {
  const avatarUrl = doctor.profile_picture
    ? doctor.profile_picture
    : `https://ui-avatars.com/api/?name=${encodeURIComponent(doctor.name)}&background=1D9E75&color=fff`;

  return (
    <div className="max-w-[85%] mr-auto bg-white border border-gray-100 rounded-2xl p-3 shadow-sm hover:shadow-md transition-shadow">
      <div className="flex items-center gap-3">
        <img
          src={avatarUrl}
          alt={doctor.name}
          className="h-11 w-11 rounded-full object-cover ring-2 ring-emerald-50"
          onError={(e) => {
            (e.target as HTMLImageElement).src = `https://ui-avatars.com/api/?name=${encodeURIComponent(doctor.name)}&background=1D9E75&color=fff`;
          }}
        />
        <div className="flex-1 min-w-0">
          <p className="text-sm font-bold text-gray-900 truncate">Dr. {doctor.name}</p>
          <p className="text-xs text-gray-500">{doctor.specialty}</p>
          {doctor.city && (
            <div className="flex items-center gap-1 mt-0.5">
              <MapPin size={10} className="text-gray-400" />
              <span className="text-[11px] text-gray-400">{doctor.city}</span>
            </div>
          )}
        </div>
        {doctor.fee && (
          <span className="text-xs font-bold text-[#1D9E75] bg-emerald-50 px-2 py-1 rounded-lg">
            {doctor.fee}
          </span>
        )}
      </div>
    </div>
  );
}

// ── Appointment Card ────────────────────────────────────────────────────────

function AppointmentCard({ appointment }: { appointment: ChatAppointmentData }) {
  const statusColor =
    appointment.status === 'confirmed'
      ? 'bg-green-50 text-green-600'
      : appointment.status === 'cancelled'
        ? 'bg-red-50 text-red-600'
        : 'bg-orange-50 text-orange-600';

  return (
    <div className="max-w-[85%] mr-auto bg-white border border-gray-100 rounded-2xl p-3 shadow-sm">
      <div className="flex items-center justify-between mb-2">
        <p className="text-sm font-bold text-gray-900">Dr. {appointment.doctor_name}</p>
        <span className={cn("text-[10px] font-semibold px-2 py-0.5 rounded-full", statusColor)}>
          {appointment.status}
        </span>
      </div>
      <p className="text-xs text-gray-500 mb-2">{appointment.doctor_specialty}</p>
      <div className="flex items-center gap-4 text-[11px] text-gray-400">
        <div className="flex items-center gap-1">
          <Calendar size={11} />
          <span>{appointment.date}</span>
        </div>
        <div className="flex items-center gap-1">
          <Clock size={11} />
          <span>{appointment.time}</span>
        </div>
      </div>
      {appointment.location && (
        <div className="flex items-center gap-1 mt-1 text-[11px] text-gray-400">
          <MapPin size={11} />
          <span>{appointment.location}</span>
        </div>
      )}
    </div>
  );
}

// ── Typing Indicator ────────────────────────────────────────────────────────

function TypingIndicator() {
  return (
    <div className="max-w-[85%] mr-auto bg-white border border-gray-100 rounded-2xl rounded-tl-md px-4 py-3 shadow-sm">
      <div className="flex items-center gap-1.5">
        {[0, 1, 2].map((i) => (
          <div
            key={i}
            className="h-2 w-2 rounded-full bg-[#1D9E75]/50 animate-bounce"
            style={{ animationDelay: `${i * 150}ms`, animationDuration: '0.8s' }}
          />
        ))}
      </div>
    </div>
  );
}
