import { useState, useEffect, useRef, useCallback } from 'react';
import {
  Sparkles, Send, Bot, RefreshCw, Heart, Calendar as CalendarIcon,
  Plus, Check, Moon, Sun, Utensils, Dumbbell, TrendingUp, Globe, Quote,
  Sunrise, Sunset, Database, Edit3, FileText, Printer, ShieldCheck, Users,
  Copy, Bell, LogOut,
} from 'lucide-react';
import { AreaChart, Area, XAxis, YAxis, Tooltip, ResponsiveContainer } from 'recharts';
import { supabase, SymptomLog } from '@/lib/supabase';
import { Language, translations, quotesData } from '@/lib/translations';

interface Props {
  userEmail: string;
  onLogout: () => void;
  lang: Language;
  setLang: (l: Language) => void;
}

interface ChatMessage {
  sender: 'ai' | 'user';
  text: string;
}

const cycleHistoryData = [
  { month: 'Nis', duration: 28 },
  { month: 'May', duration: 27 },
  { month: 'Haz', duration: 29 },
  { month: 'Tem', duration: 28 },
  { month: 'Ağu', duration: 28 },
  { month: 'Eyl', duration: 27 },
];

export default function AuraCycleApp({ userEmail, onLogout, lang, setLang }: Props) {
  const t = translations[lang];
  const [isDarkMode, setIsDarkMode] = useState(false);
  const cycleLength = 28;

  const [lastPeriodDate, setLastPeriodDate] = useState<string>(() => {
    const d = new Date();
    d.setDate(d.getDate() - 13);
    return d.toISOString().split('T')[0];
  });

  const [showDateModal, setShowDateModal] = useState(false);
  const [showReportModal, setShowReportModal] = useState(false);
  const [showPartnerModal, setShowPartnerModal] = useState(false);
  const [showCalendarModal, setShowCalendarModal] = useState(false);
  const [showNotifModal, setShowNotifModal] = useState(false);
  const [showSymptomModal, setShowSymptomModal] = useState(false);

  const [copiedCode, setCopiedCode] = useState(false);
  const [notifPeriod, setNotifPeriod] = useState(true);
  const [notifOvulation, setNotifOvulation] = useState(true);
  const [notifPill, setNotifPill] = useState(false);

  const [selectedSymptoms, setSelectedSymptoms] = useState<string[]>([]);
  const [painLevel, setPainLevel] = useState(2);
  const [symptomLogSuccess, setSymptomLogSuccess] = useState(false);
  const [symptomLogs, setSymptomLogs] = useState<SymptomLog[]>([]);

  const [isMorning, setIsMorning] = useState(true);
  const [currentQuote, setCurrentQuote] = useState('');

  const [inputMessage, setInputMessage] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [chatLog, setChatLog] = useState<ChatMessage[]>([{ sender: 'ai', text: t.aiGreeting }]);

  const chatEndRef = useRef<HTMLDivElement>(null);

  const getRandomQuote = useCallback((language: Language) => {
    const hours = new Date().getHours();
    const morning = hours >= 5 && hours < 17;
    setIsMorning(morning);
    const pool = morning ? quotesData[language].morning : quotesData[language].evening;
    const randomIndex = Math.floor(Math.random() * pool.length);
    setCurrentQuote(pool[randomIndex]);
  }, []);

  useEffect(() => {
    getRandomQuote(lang);
  }, [lang, getRandomQuote]);

  useEffect(() => {
    setChatLog([{ sender: 'ai', text: translations[lang].aiGreeting }]);
  }, [lang]);

  const { currentDayCalculated, daysUntilNext, phaseName } = (() => {
    const start = new Date(lastPeriodDate);
    const today = new Date();
    const diffTime = Math.abs(today.getTime() - start.getTime());
    const diffDays = Math.floor(diffTime / (1000 * 60 * 60 * 24)) + 1;
    const currentDay = ((diffDays - 1) % cycleLength) + 1;
    const daysUntil = cycleLength - currentDay;

    let phase: string;
    if (currentDay >= 1 && currentDay <= 5) phase = t.phases.menstrual;
    else if (currentDay >= 6 && currentDay <= 12) phase = t.phases.follicular;
    else if (currentDay >= 13 && currentDay <= 16) phase = t.phases.ovulation;
    else phase = t.phases.luteal;

    return { currentDayCalculated: currentDay, daysUntilNext: daysUntil, phaseName: phase };
  })();

  useEffect(() => {
    chatEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [chatLog, isLoading]);

  const fetchSymptoms = useCallback(async () => {
    const { data, error } = await supabase
      .from('symptoms')
      .select('*')
      .order('created_at', { ascending: false })
      .limit(30);

    if (!error && data) {
      setSymptomLogs(data as SymptomLog[]);
    }
  }, []);

  useEffect(() => {
    fetchSymptoms();
  }, [fetchSymptoms]);

  function toggleSymptom(symptom: string) {
    setSelectedSymptoms((prev) =>
      prev.includes(symptom) ? prev.filter((s) => s !== symptom) : [...prev, symptom]
    );
  }

  const askAI = useCallback(
    async (userText: string) => {
      if (!userText.trim()) return;

      const updatedLog: ChatMessage[] = [...chatLog, { sender: 'user', text: userText }];
      setChatLog(updatedLog);
      setInputMessage('');
      setIsLoading(true);

      const systemPrompt = `${t.aiPrompt} Kullanıcı Hesabı: ${userEmail}. Gün ${currentDayCalculated} (${phaseName}). Semptomlar: ${selectedSymptoms.length > 0 ? selectedSymptoms.join(', ') : 'Yok'}. Ağrı: ${painLevel}/5.`;

      const previousMessages = updatedLog.slice(-5).map((m) => ({
        role: m.sender === 'user' ? 'user' : 'assistant',
        content: m.text,
      }));

      try {
        const response = await fetch('https://text.pollinations.ai/', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            messages: [
              { role: 'system', content: systemPrompt },
              ...previousMessages,
              { role: 'user', content: userText },
            ],
            model: 'openai',
          }),
        });

        const replyText = await response.text();

        if (replyText) {
          setChatLog([...updatedLog, { sender: 'ai', text: replyText }]);
        } else {
          setChatLog([...updatedLog, { sender: 'ai', text: '...' }]);
        }
      } catch {
        setChatLog([...updatedLog, { sender: 'ai', text: '...' }]);
      } finally {
        setIsLoading(false);
      }
    },
    [chatLog, t.aiPrompt, t, userEmail, currentDayCalculated, phaseName, selectedSymptoms, painLevel]
  );

  async function handleSaveSymptoms() {
    const { error: insertError } = await supabase.from('symptoms').insert([
      {
        symptoms: selectedSymptoms,
        pain_level: painLevel,
        cycle_day: currentDayCalculated,
      },
    ]);

    if (insertError) {
      return;
    }

    setSymptomLogSuccess(true);
    fetchSymptoms();

    setTimeout(() => {
      setSymptomLogSuccess(false);
      setShowSymptomModal(false);
      setSelectedSymptoms([]);
      setPainLevel(2);
    }, 1200);

    if (selectedSymptoms.length > 0) {
      const autoMsg = `${t.feltSymptoms} ${selectedSymptoms.join(', ')}, ${t.painLevel} ${painLevel}/5.`;
      askAI(autoMsg);
    }
  }

  function copyPartnerCode() {
    const code = `AURA-${userEmail.substring(0, 5).toUpperCase()}`;
    navigator.clipboard.writeText(code);
    setCopiedCode(true);
    setTimeout(() => setCopiedCode(false), 2000);
  }

  const avgPain =
    symptomLogs.length > 0
      ? (symptomLogs.reduce((acc, s) => acc + s.pain_level, 0) / symptomLogs.length).toFixed(1)
      : '2.4';

  const allSymptoms = symptomLogs.flatMap((s) => s.symptoms);
  const symptomCountMap = new Map<string, number>();
  allSymptoms.forEach((s) => symptomCountMap.set(s, (symptomCountMap.get(s) || 0) + 1));
  const topSymptoms = Array.from(symptomCountMap.entries())
    .sort((a, b) => b[1] - a[1])
    .slice(0, 2)
    .map(([s]) => s)
    .join(' & ');

  return (
    <div
      className={`min-h-screen transition-colors duration-300 p-4 md:p-8 font-sans ${lang === 'ar' ? 'rtl' : 'ltr'} ${
        isDarkMode ? 'bg-slate-950 text-slate-100' : 'bg-rose-50/40 text-slate-800'
      }`}
      dir={lang === 'ar' ? 'rtl' : 'ltr'}
    >
      <div className="max-w-4xl mx-auto space-y-6">
        {/* Header */}
        <div
          className={`rounded-3xl p-6 border shadow-sm flex flex-wrap items-center justify-between gap-4 transition-colors ${
            isDarkMode ? 'bg-slate-900 border-slate-800' : 'bg-white border-rose-100'
          }`}
        >
          <div className="flex items-center gap-3">
            <div className="w-12 h-12 rounded-2xl bg-rose-500 text-white flex items-center justify-center font-bold text-xl shadow-md shadow-rose-200">
              <Heart className="w-6 h-6 fill-current" />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <h1 className="text-xl font-bold font-serif">AuraCycle</h1>
                <span className="text-[10px] bg-emerald-500/10 text-emerald-600 px-2 py-0.5 rounded-full font-bold flex items-center gap-1 border border-emerald-500/20">
                  <Database className="w-2.5 h-2.5" /> {userEmail}
                </span>
              </div>
              <p className={`text-xs ${isDarkMode ? 'text-slate-400' : 'text-slate-500'}`}>{t.subtitle}</p>
            </div>
          </div>

          <div className="flex items-center gap-3">
            <button
              onClick={onLogout}
              className={`p-2.5 rounded-2xl border transition text-rose-500 hover:bg-rose-50 ${
                isDarkMode ? 'border-slate-700 bg-slate-800' : 'border-slate-200 bg-slate-100'
              }`}
              title={t.logoutBtn}
            >
              <LogOut className="w-4 h-4" />
            </button>

            <button
              onClick={() => setShowNotifModal(true)}
              className={`p-2.5 rounded-2xl border transition relative ${
                isDarkMode ? 'bg-slate-800 border-slate-700 text-slate-300' : 'bg-slate-100 border-slate-200 text-slate-600'
              }`}
            >
              <Bell className="w-4 h-4" />
              <span className="absolute top-1 right-1 w-2 h-2 bg-rose-500 rounded-full animate-pulse-soft" />
            </button>

            <div className="flex items-center gap-1 bg-slate-100 p-1 rounded-2xl border border-slate-200">
              <Globe className="w-4 h-4 ml-1 mr-1 text-slate-500" />
              {(['tr', 'de', 'ar'] as Language[]).map((l) => (
                <button
                  key={l}
                  onClick={() => setLang(l)}
                  className={`px-2.5 py-1 rounded-xl text-xs font-bold uppercase transition ${
                    lang === l ? 'bg-rose-500 text-white shadow-sm' : 'text-slate-500'
                  }`}
                >
                  {l}
                </button>
              ))}
            </div>

            <button
              onClick={() => setIsDarkMode(!isDarkMode)}
              className={`p-2.5 rounded-2xl border transition ${
                isDarkMode ? 'bg-slate-800 border-slate-700 text-amber-400' : 'bg-slate-100 border-slate-200 text-slate-600'
              }`}
            >
              {isDarkMode ? <Sun className="w-4 h-4" /> : <Moon className="w-4 h-4" />}
            </button>
          </div>
        </div>

        {/* Moral Kartı */}
        <div
          className={`rounded-3xl p-5 border shadow-sm relative overflow-hidden transition-all ${
            isDarkMode
              ? 'bg-gradient-to-r from-slate-900 via-purple-950/40 to-slate-900 border-slate-800'
              : 'bg-gradient-to-r from-rose-100/80 via-pink-50 to-amber-50 border-rose-100'
          }`}
        >
          <div className="flex items-center justify-between gap-4">
            <div className="flex items-center gap-3">
              <div
                className={`p-3 rounded-2xl ${
                  isMorning ? 'bg-amber-500/20 text-amber-500' : 'bg-indigo-500/20 text-indigo-400'
                }`}
              >
                {isMorning ? <Sunrise className="w-6 h-6" /> : <Sunset className="w-6 h-6" />}
              </div>
              <div>
                <span className="text-[10px] uppercase font-bold tracking-wider text-rose-500 flex items-center gap-1">
                  <Quote className="w-3 h-3" />
                  {isMorning ? t.morningTitle : t.eveningTitle}
                </span>
                <p className={`text-xs md:text-sm font-semibold mt-0.5 italic ${isDarkMode ? 'text-slate-200' : 'text-slate-800'}`}>
                  &ldquo;{currentQuote}&rdquo;
                </p>
              </div>
            </div>

            <button
              onClick={() => getRandomQuote(lang)}
              className={`p-2 rounded-xl text-xs font-medium border transition shrink-0 ${
                isDarkMode ? 'bg-slate-800 border-slate-700 text-slate-300' : 'bg-white border-rose-200 text-slate-600 shadow-sm'
              }`}
            >
              <RefreshCw className="w-3.5 h-3.5 text-rose-500" />
            </button>
          </div>
        </div>

        {/* Grid */}
        <div className="grid md:grid-cols-3 gap-6">
          {/* Left Column */}
          <div className="space-y-6">
            {/* Cycle Progress */}
            <div
              className={`rounded-3xl p-6 border shadow-sm text-center ${
                isDarkMode ? 'bg-slate-900 border-slate-800' : 'bg-white border-rose-100'
              }`}
            >
              <h3 className="text-xs font-bold uppercase tracking-wider text-slate-400 mb-4">{t.cycleProgress}</h3>
              <div
                className={`relative w-36 h-36 mx-auto flex items-center justify-center rounded-full border-4 ${
                  isDarkMode ? 'border-slate-800 bg-slate-950/50' : 'border-rose-100 bg-rose-50/50'
                }`}
              >
                <div className="text-center">
                  <span className="text-3xl font-extrabold text-rose-500">{currentDayCalculated}</span>
                  <span className="text-xs text-slate-400 block">. {t.day}</span>
                </div>
              </div>
              <p className={`text-xs mt-4 font-medium ${isDarkMode ? 'text-slate-300' : 'text-slate-600'}`}>
                {t.nextPeriod}
                {daysUntilNext} {t.daysLater}
              </p>

              <button
                onClick={() => setShowSymptomModal(true)}
                className={`w-full mt-4 py-2.5 rounded-xl text-xs font-bold transition flex items-center justify-center gap-1.5 ${
                  isDarkMode ? 'bg-slate-800 text-rose-300 hover:bg-slate-700' : 'bg-rose-50 text-rose-600 hover:bg-rose-100'
                }`}
              >
                <Plus className="w-4 h-4" /> {t.addSymptom}
              </button>

              <div className="grid grid-cols-2 gap-2 mt-2">
                <button
                  onClick={() => setShowReportModal(true)}
                  className="py-2.5 bg-rose-500 hover:bg-rose-600 text-white rounded-xl text-[11px] font-bold transition flex items-center justify-center gap-1 shadow-sm shadow-rose-200"
                >
                  <FileText className="w-3.5 h-3.5" /> {t.reportBtn}
                </button>
                <button
                  onClick={() => setShowPartnerModal(true)}
                  className="py-2.5 bg-indigo-500 hover:bg-indigo-600 text-white rounded-xl text-[11px] font-bold transition flex items-center justify-center gap-1 shadow-sm shadow-indigo-200"
                >
                  <Users className="w-3.5 h-3.5" /> {t.partnerBtn}
                </button>
              </div>

              <button
                onClick={() => setShowCalendarModal(true)}
                className={`w-full mt-2 py-2 rounded-xl text-[11px] font-bold transition flex items-center justify-center gap-1 ${
                  isDarkMode ? 'bg-slate-800 text-slate-300' : 'bg-slate-100 text-slate-600'
                }`}
              >
                <CalendarIcon className="w-3.5 h-3.5 text-rose-500" /> {t.calendarTitle}
              </button>

              <button
                onClick={() => setShowDateModal(true)}
                className="w-full mt-1 py-1 text-[11px] text-slate-500 hover:text-rose-500 transition flex items-center justify-center gap-1"
              >
                <Edit3 className="w-3 h-3" /> {t.changeDateBtn}
              </button>
            </div>

            {/* Phase Guide */}
            <div
              className={`rounded-3xl p-6 border shadow-sm space-y-3 ${
                isDarkMode ? 'bg-slate-900 border-slate-800' : 'bg-white border-rose-100'
              }`}
            >
              <h3 className="text-xs font-bold uppercase tracking-wider text-slate-400">{t.phaseGuide}</h3>
              <p className={`text-sm font-semibold ${isDarkMode ? 'text-slate-200' : 'text-slate-700'}`}>{phaseName}</p>
              <div className={`flex items-start gap-2 text-xs ${isDarkMode ? 'text-slate-300' : 'text-slate-600'}`}>
                <Utensils className="w-4 h-4 text-rose-500 shrink-0 mt-0.5" />
                <span>{t.guideNutrition}</span>
              </div>
              <div className={`flex items-start gap-2 text-xs ${isDarkMode ? 'text-slate-300' : 'text-slate-600'}`}>
                <Dumbbell className="w-4 h-4 text-rose-500 shrink-0 mt-0.5" />
                <span>{t.guideFitness}</span>
              </div>
            </div>

            {/* Trend Chart */}
            <div
              className={`rounded-3xl p-6 border shadow-sm ${
                isDarkMode ? 'bg-slate-900 border-slate-800' : 'bg-white border-rose-100'
              }`}
            >
              <div className="flex items-center gap-2 mb-3">
                <TrendingUp className="w-4 h-4 text-rose-500" />
                <h3 className="text-xs font-bold uppercase tracking-wider text-slate-400">{t.trendTitle}</h3>
              </div>
              <div className="h-28 w-full">
                <ResponsiveContainer width="100%" height="100%">
                  <AreaChart data={cycleHistoryData}>
                    <XAxis dataKey="month" stroke={isDarkMode ? '#64748b' : '#94a3b8'} fontSize={10} />
                    <YAxis domain={[20, 35]} hide />
                    <Tooltip
                      contentStyle={{
                        background: isDarkMode ? '#1e293b' : '#fff',
                        borderRadius: '12px',
                        fontSize: '10px',
                        border: 'none',
                      }}
                    />
                    <Area type="monotone" dataKey="duration" stroke="#f43f5e" fill="#f43f5e" fillOpacity={0.2} />
                  </AreaChart>
                </ResponsiveContainer>
              </div>
            </div>
          </div>

          {/* AI Chat */}
          <div className="md:col-span-2">
            <div
              className={`rounded-3xl p-6 border shadow-lg h-full flex flex-col ${
                isDarkMode ? 'bg-slate-900 border-slate-800' : 'bg-white border-rose-100'
              }`}
            >
              <div
                className={`flex items-center justify-between pb-4 border-b mb-4 ${
                  isDarkMode ? 'border-slate-800' : 'border-rose-100'
                }`}
              >
                <div className="flex items-center gap-2">
                  <div className="w-8 h-8 rounded-full bg-rose-500 flex items-center justify-center text-white">
                    <Sparkles className="w-4 h-4" />
                  </div>
                  <div>
                    <h3 className="font-bold text-sm">{t.aiTitle}</h3>
                    <p className="text-[11px] text-slate-400">{t.aiSubtitle}</p>
                  </div>
                </div>
                <span className="text-[10px] bg-emerald-500/10 text-emerald-500 px-2.5 py-1 rounded-full font-semibold border border-emerald-500/20">
                  ● {t.aiActive}
                </span>
              </div>

              <div
                className={`rounded-2xl p-4 flex-1 min-h-[320px] max-h-[420px] overflow-y-auto space-y-3 mb-4 border scrollbar-hide ${
                  isDarkMode ? 'bg-slate-950/50 border-slate-800' : 'bg-rose-50/30 border-rose-50'
                }`}
              >
                {chatLog.map((msg, idx) => (
                  <div key={idx} className={`flex gap-2 ${msg.sender === 'user' ? 'justify-end' : 'justify-start'}`}>
                    {msg.sender === 'ai' && (
                      <div className="w-6 h-6 rounded-full bg-rose-100 text-rose-600 flex items-center justify-center text-xs font-bold mt-1 shrink-0">
                        <Bot className="w-3.5 h-3.5" />
                      </div>
                    )}
                    <div
                      className={`max-w-[80%] p-3.5 rounded-2xl text-xs leading-relaxed ${
                        msg.sender === 'user'
                          ? 'bg-rose-500 text-white rounded-br-none shadow-sm'
                          : isDarkMode
                            ? 'bg-slate-800 text-slate-200 border border-slate-700 rounded-bl-none'
                            : 'bg-white text-slate-700 border border-rose-100 shadow-sm rounded-bl-none'
                      }`}
                    >
                      {msg.text}
                    </div>
                  </div>
                ))}

                {isLoading && (
                  <div className="flex items-center gap-2 text-xs text-rose-400 italic">
                    <RefreshCw className="w-3.5 h-3.5 animate-spin" />
                    <span>Aura AI...</span>
                  </div>
                )}
                <div ref={chatEndRef} />
              </div>

              <form onSubmit={(e) => { e.preventDefault(); askAI(inputMessage); }} className="flex gap-2">
                <input
                  type="text"
                  value={inputMessage}
                  onChange={(e) => setInputMessage(e.target.value)}
                  placeholder={t.inputPlaceholder}
                  className={`flex-1 rounded-xl px-4 py-3 text-xs focus:outline-none focus:ring-2 focus:ring-rose-400 focus:border-transparent transition border ${
                    isDarkMode
                      ? 'bg-slate-950 border-slate-800 text-slate-100 placeholder-slate-500'
                      : 'bg-slate-50 border-slate-200 text-slate-800 placeholder-slate-400'
                  }`}
                />
                <button
                  type="submit"
                  disabled={isLoading}
                  className="bg-rose-500 hover:bg-rose-600 disabled:opacity-50 text-white px-5 py-3 rounded-xl text-xs font-medium transition flex items-center gap-1.5 shadow-sm shadow-rose-200 shrink-0"
                >
                  <Send className="w-3.5 h-3.5" />
                  <span>{t.send}</span>
                </button>
              </form>

              <p className="text-[10px] text-slate-400 text-center mt-3">{t.disclaimer}</p>
            </div>
          </div>
        </div>

        {/* Calendar Modal */}
        {showCalendarModal && (
          <Modal onClose={() => setShowCalendarModal(false)} isDarkMode={isDarkMode} lang={lang} title={t.calendarTitle} icon={<CalendarIcon className="w-5 h-5 text-rose-500" />}>
            <div className="grid grid-cols-7 gap-1.5 text-center text-xs">
              {['P', 'P', 'S', 'Ç', 'P', 'C', 'C'].map((d, i) => (
                <span key={i} className="font-bold text-slate-400 py-1">{d}</span>
              ))}
              {Array.from({ length: 31 }, (_, i) => {
                const dayNum = i + 1;
                let bgClass = isDarkMode ? 'bg-slate-800 text-slate-300' : 'bg-slate-50 text-slate-700';
                if (dayNum >= 1 && dayNum <= 5) bgClass = 'bg-rose-500 text-white font-bold';
                else if (dayNum >= 13 && dayNum <= 15) bgClass = 'bg-amber-400 text-amber-950 font-bold';
                else if (dayNum >= 11 && dayNum <= 17) bgClass = isDarkMode ? 'bg-rose-950/50 text-rose-300' : 'bg-rose-100 text-rose-600';
                return (
                  <div key={i} className={`p-2.5 rounded-xl flex items-center justify-center ${bgClass}`}>
                    {dayNum}
                  </div>
                );
              })}
            </div>
            <button onClick={() => setShowCalendarModal(false)} className="w-full bg-rose-500 text-white py-3 rounded-xl text-xs font-bold mt-4">
              {t.closeBtn}
            </button>
          </Modal>
        )}

        {/* Notifications Modal */}
        {showNotifModal && (
          <Modal onClose={() => setShowNotifModal(false)} isDarkMode={isDarkMode} lang={lang} title={t.notificationsTitle} icon={<Bell className="w-5 h-5 text-rose-500" />}>
            <div className="space-y-3">
              <NotifToggle label={t.notifPeriod} checked={notifPeriod} onChange={setNotifPeriod} isDarkMode={isDarkMode} />
              <NotifToggle label={t.notifOvulation} checked={notifOvulation} onChange={setNotifOvulation} isDarkMode={isDarkMode} />
              <NotifToggle label={t.notifPill} checked={notifPill} onChange={setNotifPill} isDarkMode={isDarkMode} />
            </div>
            <button onClick={() => setShowNotifModal(false)} className="w-full bg-rose-500 text-white py-3 rounded-xl text-xs font-bold mt-4">
              {t.saveDate}
            </button>
          </Modal>
        )}

        {/* Partner Modal */}
        {showPartnerModal && (
          <Modal onClose={() => setShowPartnerModal(false)} isDarkMode={isDarkMode} lang={lang} title={t.partnerModalTitle} icon={<Users className="w-5 h-5 text-white" />} iconBg="bg-indigo-500" subtitle={t.partnerSubtitle}>
            <div className="p-4 bg-white rounded-2xl border flex flex-col items-center justify-center gap-3 shadow-inner">
              <img
                src={`https://api.qrserver.com/v1/create-qr-code/?size=150x150&data=AURA-SYNC-${userEmail}`}
                alt="Partner QR Code"
                className="w-36 h-36 rounded-lg"
              />
              <span className="text-[11px] text-slate-500 text-center font-medium">{t.scanQrInstruction}</span>
              <span className="text-xs font-mono font-bold text-indigo-600 bg-indigo-50 px-3 py-1 rounded-full">
                AURA-{userEmail.substring(0, 6).toUpperCase()}
              </span>
            </div>
            <div className={`p-4 rounded-2xl border mt-4 ${isDarkMode ? 'bg-slate-950/80 border-slate-800' : 'bg-rose-50 border-rose-100'}`}>
              <p className="text-xs font-bold text-rose-500 mb-1">{t.partnerTipsTitle}</p>
              <p className={`text-xs leading-relaxed ${isDarkMode ? 'text-slate-300' : 'text-slate-600'}`}>{t.partnerTipsBody}</p>
            </div>
            <button
              onClick={copyPartnerCode}
              className="w-full flex items-center justify-center gap-1.5 text-xs bg-indigo-500 hover:bg-indigo-600 text-white py-3 rounded-xl font-bold transition shadow-sm mt-4"
            >
              {copiedCode ? <Check className="w-4 h-4" /> : <Copy className="w-4 h-4" />}
              <span>{copiedCode ? '✓' : t.copyCode}</span>
            </button>
          </Modal>
        )}

        {/* Report Modal */}
        {showReportModal && (
          <Modal onClose={() => setShowReportModal(false)} isDarkMode={isDarkMode} lang={lang} title={t.reportModalTitle} icon={<FileText className="w-5 h-5 text-white" />} iconBg="bg-rose-500" subtitle={t.reportSubtitle}>
            <div className="grid grid-cols-3 gap-3">
              <div className={`p-3 rounded-2xl border text-center ${isDarkMode ? 'bg-slate-950 border-slate-800' : 'bg-rose-50/50 border-rose-100'}`}>
                <span className="text-[10px] text-slate-400 block font-semibold">{t.reportAvgPain}</span>
                <span className="text-lg font-black text-rose-500">{avgPain} / 5</span>
              </div>
              <div className={`p-3 rounded-2xl border text-center ${isDarkMode ? 'bg-slate-950 border-slate-800' : 'bg-rose-50/50 border-rose-100'}`}>
                <span className="text-[10px] text-slate-400 block font-semibold">{t.reportTopSymptom}</span>
                <span className="text-xs font-bold text-slate-700 mt-1 block">{topSymptoms || '—'}</span>
              </div>
              <div className={`p-3 rounded-2xl border text-center ${isDarkMode ? 'bg-slate-950 border-slate-800' : 'bg-rose-50/50 border-rose-100'}`}>
                <span className="text-[10px] text-slate-400 block font-semibold">{t.reportCycleLen}</span>
                <span className="text-lg font-black text-emerald-500">28 {t.day}</span>
              </div>
            </div>
            <div className={`p-4 rounded-2xl border space-y-2 mt-4 ${isDarkMode ? 'bg-slate-950/80 border-slate-800' : 'bg-slate-50 border-slate-200'}`}>
              <div className="flex items-center gap-1.5 text-xs font-bold text-rose-500">
                <ShieldCheck className="w-4 h-4" />
                <span>{t.reportAiSummary}</span>
              </div>
              <p className={`text-xs leading-relaxed ${isDarkMode ? 'text-slate-300' : 'text-slate-600'}`}>
                {userEmail} — Döngünüz stabil seyretmektedir. {symptomLogs.length} kayıt mevcut.
              </p>
            </div>
            <button onClick={() => window.print()} className="w-full bg-slate-800 text-white py-3 rounded-xl text-xs font-bold flex items-center justify-center gap-2 mt-4">
              <Printer className="w-4 h-4" /> <span>{t.printReport}</span>
            </button>
          </Modal>
        )}

        {/* Date Modal */}
        {showDateModal && (
          <Modal onClose={() => setShowDateModal(false)} isDarkMode={isDarkMode} lang={lang} title={t.dateModalTitle} icon={<Edit3 className="w-5 h-5 text-rose-500" />}>
            <input
              type="date"
              value={lastPeriodDate}
              onChange={(e) => setLastPeriodDate(e.target.value)}
              className={`w-full p-3 rounded-xl border text-xs ${isDarkMode ? 'bg-slate-950 border-slate-800 text-white' : 'bg-slate-50 border-slate-200 text-slate-800'}`}
            />
            <button onClick={() => setShowDateModal(false)} className="w-full bg-rose-500 text-white py-3 rounded-xl text-xs font-bold mt-4">
              {t.saveDate}
            </button>
          </Modal>
        )}

        {/* Symptom Modal */}
        {showSymptomModal && (
          <Modal onClose={() => setShowSymptomModal(false)} isDarkMode={isDarkMode} lang={lang} title={t.modalTitle} icon={<Plus className="w-5 h-5 text-rose-500" />}>
            <div>
              <label className="text-xs font-semibold block mb-2">{t.feltSymptoms}</label>
              <div className="flex flex-wrap gap-2">
                {t.symptoms.map((symptom, i) => (
                  <button
                    key={i}
                    onClick={() => toggleSymptom(symptom)}
                    className={`px-3 py-1.5 rounded-xl text-xs font-medium border transition ${
                      selectedSymptoms.includes(symptom)
                        ? 'bg-rose-500 text-white border-rose-500'
                        : isDarkMode
                          ? 'bg-slate-800 text-slate-300 border-slate-700'
                          : 'bg-slate-50 text-slate-600 border-slate-200'
                    }`}
                  >
                    {symptom}
                  </button>
                ))}
              </div>
            </div>
            <div className="mt-4">
              <div className="flex justify-between text-xs mb-1">
                <span className="font-semibold">{t.painLevel}</span>
                <span className="font-bold text-rose-500">{painLevel} / 5</span>
              </div>
              <input
                type="range"
                min="0"
                max="5"
                value={painLevel}
                onChange={(e) => setPainLevel(Number(e.target.value))}
                className="w-full accent-rose-500"
              />
            </div>
            <button
              onClick={handleSaveSymptoms}
              disabled={symptomLogSuccess}
              className="w-full bg-rose-500 disabled:opacity-60 text-white py-3 rounded-xl text-xs font-bold flex items-center justify-center gap-2 shadow-md shadow-rose-200 mt-4"
            >
              {symptomLogSuccess ? (
                <>
                  <Check className="w-4 h-4" /> <span>{t.savedBtn}</span>
                </>
              ) : (
                <span>{t.saveBtn}</span>
              )}
            </button>
          </Modal>
        )}
      </div>
    </div>
  );
}

function Modal({
  children,
  onClose,
  isDarkMode,
  lang,
  title,
  icon,
  iconBg = '',
  subtitle,
}: {
  children: React.ReactNode;
  onClose: () => void;
  isDarkMode: boolean;
  lang: Language;
  title: string;
  icon: React.ReactNode;
  iconBg?: string;
  subtitle?: string;
}) {
  return (
    <div
      className="fixed inset-0 bg-slate-900/60 backdrop-blur-sm flex items-center justify-center p-4 z-50 animate-fade-in"
      dir={lang === 'ar' ? 'rtl' : 'ltr'}
      onClick={onClose}
    >
      <div
        className={`rounded-3xl p-6 max-w-md w-full border shadow-2xl space-y-4 max-h-[90vh] overflow-y-auto scrollbar-hide animate-slide-up ${
          isDarkMode ? 'bg-slate-900 border-slate-800 text-slate-100' : 'bg-white border-rose-100 text-slate-800'
        }`}
        onClick={(e) => e.stopPropagation()}
      >
        <div className="flex items-center justify-between border-b pb-3 border-rose-100">
          <div className="flex items-center gap-2">
            {iconBg ? (
              <div className={`p-2 rounded-xl ${iconBg}`}>{icon}</div>
            ) : (
              icon
            )}
            <div>
              <h3 className="font-bold text-sm">{title}</h3>
              {subtitle && <p className="text-[11px] text-slate-400">{subtitle}</p>}
            </div>
          </div>
          <button onClick={onClose} className="text-slate-400 text-xs font-bold hover:text-rose-500">
            ✕
          </button>
        </div>
        {children}
      </div>
    </div>
  );
}

function NotifToggle({
  label,
  checked,
  onChange,
  isDarkMode,
}: {
  label: string;
  checked: boolean;
  onChange: (v: boolean) => void;
  isDarkMode: boolean;
}) {
  return (
    <div className={`flex items-center justify-between p-3 rounded-2xl ${isDarkMode ? 'bg-slate-950' : 'bg-slate-50'}`}>
      <span className="text-xs font-semibold">{label}</span>
      <input
        type="checkbox"
        checked={checked}
        onChange={(e) => onChange(e.target.checked)}
        className="w-4 h-4 accent-rose-500"
      />
    </div>
  );
}
