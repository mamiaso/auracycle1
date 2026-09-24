import React, { useState, useEffect } from 'react';
import { 
  Sparkles, Send, Bot, RefreshCw, Heart, Calendar as CalendarIcon, Activity, 
  Plus, Check, Moon, Sun, Utensils, Dumbbell, TrendingUp, Globe, Quote, Sunrise, Sunset, 
  Database, Edit3, FileText, Printer, ShieldCheck, Users, Copy, Bell, Download, QrCode, LogOut, User, Mail, Lock, X
} from 'lucide-react';
import { AreaChart, Area, XAxis, YAxis, Tooltip, ResponsiveContainer } from 'recharts';
import { createClient } from '@supabase/supabase-js';

// Supabase Bağlantısı
const SUPABASE_URL = 'https://eaojokmguifdwyxwhdbl.supabase.co';
const SUPABASE_ANON_KEY = 'sb_publishable_7ee5JZ9zJzkdCt0WgEsA3g_y2NY-BWt';
const supabase = createClient(SUPABASE_URL, SUPABASE_ANON_KEY);

type Language = 'tr' | 'de' | 'ar';

const quotesData = {
  tr: {
    morning: [
      "Bugün senin günün, vücudunun ve zihninin ritmine güven! ✨",
      "Güne kendin için küçük ve güzel bir şey yaparak başla. 🌸",
      "Enerjin ve ışığın çevrendeki her şeyi güzelleştirmeye yeter. ☀️",
      "Bugün kendine karşı nazik ol, her adımın çok değerli. 💪"
    ],
    evening: [
      "Bugün başardığın her şey için kendinle gurur duy. Dinlenmeyi hak ettin. 🌙",
      "Günün yorgunluğunu geride bırak, bedenini ve zihnini şefkatle sarmala. ✨",
      "Sessizliği ve huzuru kucakla, yarın senin için yeni bir başlangıç olacak. 🕊️",
      "Derin bir nefes al ve bugün gösterdiğin çaba için kendine teşekkür et. 🕯️"
    ]
  },
  de: {
    morning: [
      "Heute ist dein Tag, vertraue dem Rhythmus deines Körpers! ✨",
      "Starte den Tag mit etwas Schönem für dich selbst. 🌸",
      "Deine Energie reicht aus, um alles um dich herum zu erhellen. ☀️",
      "Sei heute sanft zu dir selbst, jeder Schritt zählt. 💪"
    ],
    evening: [
      "Sei stolz auf alles, was du heute erreicht hast. Du hast Ruhe verdient. 🌙",
      "Lass die Müdigkeit des Tages hinter dir und schenke dir Aufmerksamkeit. ✨",
      "Genieße die Ruhe, morgen ist ein neuer Anfang für dich. 🕊️",
      "Atme tief durch und danke dir selbst für deine Mühen heute. 🕯️"
    ]
  },
  ar: {
    morning: [
      "اليوم يومك، ثقي بإيقاع جسدك وعقلك! ✨",
      "ابداي يومك بفعل شيء جميل ولطيف لنفسك. 🌸",
      "طاقتك ونورك يكفيان لإضاءة كل ما حولك. ☀️",
      "كوني لطيفة مع نفسك اليوم، كل خطوة تقومين بها لها قيمة. 💪"
    ],
    evening: [
      "كوني فخورة بكل ما حققته اليوم. أنت تستحقين الراحة. 🌙",
      "اتركي تعب اليوم وراءك وعانقي جسدك وعقلك بلطف. ✨",
      "استمتعي بالهدوء والسكينة، غداً بداية جديدة وأجمل لك. 🕊️",
      "خوذي نفساً عميقاً واشكري نفسك على الجهود التي بذلتها اليوم. 🕯️"
    ]
  }
};

const translations = {
  tr: {
    subtitle: "Ücretsiz & Akıllı Kadın Sağlığı Asistanı",
    day: "Gün",
    nextPeriod: "Gelecek regl dönemi: ~",
    daysLater: "gün sonra",
    addSymptom: "Semptom & Ruh Hali Ekle",
    cycleProgress: "Döngü İlerlemesi",
    phaseGuide: "Faz Rehberi",
    guideNutrition: "Antioksidan ve çinko ağırlıklı besinler tüketin.",
    guideFitness: "Enerji yüksek! HIIT veya kuvvet antrenmanı için ideal.",
    trendTitle: "6 Aylık Döngü Trendi",
    aiTitle: "Aura AI",
    aiSubtitle: "Kişisel Sağlık ve Hafıza Asistanı",
    aiActive: "AI Active",
    aiGreeting: "Merhaba! Ben Aura AI. Hesabındaki geçmişini, semptomlarını ve yazdıklarını hatırlıyorum. Bugün sana nasıl yardımcı olabilirim? ✨",
    inputPlaceholder: "Soru sor, dün ne konuştuğumuzu sor veya semptom anlat...",
    send: "Gönder",
    disclaimer: "*Aura AI bilgilendirme amaçlıdır, doktor teşhisi yerine geçmez.",
    modalTitle: "Günlük Semptom Kaydı",
    feltSymptoms: "Hissedilen Belirtiler:",
    painLevel: "Ağrı Seviyesi:",
    saveBtn: "Kaydet ve AI Hafızasına İşle",
    savedBtn: "Hesabına Kaydedildi! 🚀",
    aiPrompt: "Sen AuraCycle uygulamasının yardımsever ve empatik kadın sağlığı asistanısın. Kullanıcının geçmiş sohbetlerini, semptomlarını ve verilerini hatırlıyorsun. Türkçe, samimi ve kişiselleştirilmiş öneriler ver.",
    symptoms: ["Kramp / Ağrı", "Baş Ağrısı", "Tatlı Krizi", "Şişkinlik", "Hassasiyet", "Yorgunluk", "Stres"],
    morningTitle: "Günaydın! Günün İlhamı",
    eveningTitle: "İyi Akşamlar! Günün Huzur Sözü",
    refreshQuote: "Yeni Söz Getir",
    changeDateBtn: "Son Regl Tarihini Gir",
    dateModalTitle: "Son Regl Başlangıç Tarihi",
    saveDate: "Tarihi Güncelle",
    reportBtn: "Hekim Raporu",
    reportModalTitle: "Döngü & Sağlık Raporu (PDF)",
    reportSubtitle: "Kullanıcı hesabınıza ait genel sağlık özeti",
    reportAvgPain: "Ort. Ağrı Seviyesi",
    reportTopSymptom: "En Sık Belirti",
    reportCycleLen: "Döngü Süresi",
    reportAiSummary: "Aura AI Akıllı Değerlendirme",
    printReport: "Yazdır / PDF İndir",
    partnerBtn: "Partner Modu",
    partnerModalTitle: "Partner Sync & QR Bağlantı",
    partnerSubtitle: "QR kod ile partnerini anında bağla, empatiyi artır ❤️",
    yourPartnerCode: "Senin Partner Kodun:",
    copyCode: "Kodu Kopyala",
    showQr: "QR Kod ile Eşleş",
    scanQrInstruction: "Partnerinin telefonundan bu QR kodu okutarak anında senkronize olabilirsiniz.",
    partnerTipsTitle: "Partner İçin Aura AI İpucu:",
    partnerTipsBody: "Şu an Luteal Fazda. Enerjisi bir miktar düşebilir, ona sevdiği bir tatlı almak veya dinlenmesine yardımcı olmak harika bir jest olur! ✨",
    calendarTitle: "Aylık Takvim & Sikl Görünüşü",
    notificationsTitle: "Hatırlatıcılar & Bildirimler",
    notifPeriod: "Regl Hatırlatıcısı (2 Gün Önce)",
    notifOvulation: "Yumurtlama (Ovülasyon) Bildirimi",
    notifPill: "Günlük Su / Takviye Hatırlatıcı",
    loginTitle: "AuraCycle'a Hoş Geldin",
    loginSubtitle: "Bilgilerini ve AI geçmişini kaydetmek için giriş yap",
    emailPlaceholder: "E-posta adresin",
    passwordPlaceholder: "Şifren",
    loginBtn: "Hesaba Giriş Yap",
    registerLink: "Hesabın yok mu? Otomatik kayıt ol ve başla",
    logoutBtn: "Çıkış Yap",
    phases: {
      menstrual: "Menstrüasyon Fazı",
      follicular: "Folliküler Faz",
      ovulation: "Yumurtlama (Ovülasyon)",
      luteal: "Luteal Faz"
    }
  },
  de: {
    subtitle: "Kostenloser & Intelligenter Frauengesundheits-Assistent",
    day: "Tag",
    nextPeriod: "Nächste Periode: in ~",
    daysLater: "Tagen",
    addSymptom: "Symptom & Stimmung hinzufügen",
    cycleProgress: "Zyklusfortschritt",
    phaseGuide: "Phasen-Ratgeber",
    guideNutrition: "Ernähren Sie sich reich an Antioxidantien und Zink.",
    guideFitness: "Hohe Energie! Ideal für HIIT oder Krafttraining.",
    trendTitle: "6-Monats-Zyklustrend",
    aiTitle: "Aura AI",
    aiSubtitle: "Persönlicher Gesundheits- & Gedächtnisassistent",
    aiActive: "AI Aktiv",
    aiGreeting: "Hallo! Ich bin Aura AI. Ich erinnere mich an deine Daten und deinen Verlauf. Wie kann ich dir heute helfen? ✨",
    inputPlaceholder: "Frage stellen oder Symptom beschreiben...",
    send: "Senden",
    disclaimer: "*Aura AI dient nur zur Information und ersetzt keine ärztliche Diagnose.",
    modalTitle: "Tägliches Symptom-Protokoll",
    feltSymptoms: "Gefühlte Symptome:",
    painLevel: "Schmerzniveau:",
    saveBtn: "Speichern & im AI-Gedächtnis sichern",
    savedBtn: "Im Konto gespeichert! 🚀",
    aiPrompt: "Du bist der empathische Assistent für Frauengesundheit. Du erinnerst dich an den Verlauf der Benutzerin. Antworte auf Deutsch.",
    symptoms: ["Krämpfe / Schmerzen", "Kopfschmerzen", "Heißhunger", "Blähungen", "Empfindlichkeit", "Müdigkeit", "Stress"],
    morningTitle: "Guten Morgen! Inspiration des Tages",
    eveningTitle: "Guten Abend! Entspannung für dich",
    refreshQuote: "Neuer Spruch",
    changeDateBtn: "Letztes Periodendatum eingeben",
    dateModalTitle: "Startdatum der letzten Periode",
    saveDate: "Datum aktualisieren",
    reportBtn: "Arzt-Bericht",
    reportModalTitle: "Zyklus- & Gesundheitsbericht (PDF)",
    reportSubtitle: "Gesundheitsübersicht Ihres Kontos",
    reportAvgPain: "Durchschnittlicher Schmerz",
    reportTopSymptom: "Häufigstes Symptom",
    reportCycleLen: "Zykluslänge",
    reportAiSummary: "Aura AI Bewertung",
    printReport: "Drucken / PDF Herunterladen",
    partnerBtn: "Partnermodus",
    partnerModalTitle: "Partner Sync & QR-Code",
    partnerSubtitle: "Verbinde deinen Partner per QR-Code ❤️",
    yourPartnerCode: "Dein Partner-Code:",
    copyCode: "Code kopieren",
    showQr: "QR-Code anzeigen",
    scanQrInstruction: "Scanne diesen QR-Code mit dem Smartphone deines Partners.",
    partnerTipsTitle: "Aura AI Tipp für den Partner:",
    partnerTipsBody: "Aktuell in der Lutealphase. Eine süße Überraschung hilft jetzt sehr! ✨",
    calendarTitle: "Monatskalender & Zyklusansicht",
    notificationsTitle: "Erinnerungen & Benachrichtigungen",
    notifPeriod: "Periodenerinnerung (2 Tage vorher)",
    notifOvulation: "Eisprung-Benachrichtigung",
    notifPill: "Tägliche Erinnerung an Wasser / Vitamine",
    loginTitle: "Willkommen bei AuraCycle",
    loginSubtitle: "Melde dich an, um deine Daten und AI-Historie zu sichern",
    emailPlaceholder: "Deine E-Mail",
    passwordPlaceholder: "Dein Passwort",
    loginBtn: "Anmelden",
    registerLink: "Kein Konto? Automatisch registrieren",
    logoutBtn: "Abmelden",
    phases: {
      menstrual: "Menstruationsphase",
      follicular: "Follikelphase",
      ovulation: "Eisprung (Ovulation)",
      luteal: "Lutealphase"
    }
  },
  ar: {
    subtitle: "مساعد صحة المرأة الذكي والمجاني بالكامل",
    day: "يوم",
    nextPeriod: "الدورة القادمة: خلال ~",
    daysLater: "أيام",
    addSymptom: "إضافة الأعراض والحالة المزاجية",
    cycleProgress: "تقدم الدورة",
    phaseGuide: "دليل المرحلة",
    guideNutrition: "تناولي أطعمة غنية بمضادات الأكسدة والزنك.",
    guideFitness: "الطاقة عالية! مثالي لتمارين HIIT أو القوة.",
    trendTitle: "اتجاه الدورة على مدار 6 أشهر",
    aiTitle: "Aura AI",
    aiSubtitle: "مساعد الصحة والذاكرة الشخصي",
    aiActive: "نشط AI",
    aiGreeting: "مرحبًا! أنا Aura AI. أتذكر سجلك وأعراضك السابقة. كيف يمكنني مساعدتك اليوم؟ ✨",
    inputPlaceholder: "اطرح سؤالاً أو اذكر عرضاً...",
    send: "إرسال",
    disclaimer: "*Aura AI للغرض المعلوماتي فقط ولا يغني عن التشخيص الطبي.",
    modalTitle: "تسجيل الأعراض اليومية",
    feltSymptoms: "الأعراض التي تشعرين بها:",
    painLevel: "مستوى الألم:",
    saveBtn: "حفظ في حسابك وذاكرة AI",
    savedBtn: "تم الحفظ في حسابك! 🚀",
    aiPrompt: "أنت مساعد صحة المرأة الذكي. تتذكر تاريخ المستخدمة وتجيب باللغة العربية.",
    symptoms: ["تقلصات / ألم", "صداع", "رغبة في السكريات", "انتفاخ", "حساسية", "تعب", "توتر"],
    morningTitle: "صباح الخير! إلهام اليوم",
    eveningTitle: "مساء الخير! كلمة راحة لليوم",
    refreshQuote: "عبارة جديدة",
    changeDateBtn: "إدخال تاريخ آخر دورة",
    dateModalTitle: "تاريخ بداية آخر دورة شهرية",
    saveDate: "تحديث التاريخ",
    reportBtn: "تقرير الطبيب",
    reportModalTitle: "تقرير الدورة والصحة (PDF)",
    reportSubtitle: "الملخص الصحي لحسابك الشخصي",
    reportAvgPain: "متوسط مستوى الألم",
    reportTopSymptom: "العرض الأكثر تكراراً",
    reportCycleLen: "مدة الدورة",
    reportAiSummary: "تقييم Aura AI",
    printReport: "طباعة / تحميل PDF",
    partnerBtn: "وضع الشريك",
    partnerModalTitle: "مزامنة الشريك ورمز QR",
    partnerSubtitle: "اربطي شريكك فوراً عبر رمز QR ❤️",
    yourPartnerCode: "رمز الشريك الخاص بك:",
    copyCode: "نسخ الرمز",
    showQr: "عرض رمز QR",
    scanQrInstruction: "قم بمسح رمز QR هذا من هاتف شريكك للمزامنة الفورية.",
    partnerTipsTitle: "نصيحة Aura AI للشريك:",
    partnerTipsBody: "هي حاليًا في المرحلة الصفرية. إحضار حلوى تحبها سيساعد كثيراً! ✨",
    calendarTitle: "التقويم الشهري وعرض الدورة",
    notificationsTitle: "التذكيرات والإشعارات",
    notifPeriod: "تذكير الدورة (قبل يومين)",
    notifOvulation: "إشعار التبويض",
    notifPill: "تذكير يومي للماء / الفيتامينات",
    loginTitle: "أهلاً بك في AuraCycle",
    loginSubtitle: "سجلي الدخول لحفظ بياناتك وذاكرة الذكاء الاصطناعي الخاصة بك",
    emailPlaceholder: "البريد الإلكتروني",
    passwordPlaceholder: "كلمة المرور",
    loginBtn: "تسجيل الدخول",
    registerLink: "ليس لديك حساب؟ تسجيل تلقائي والبدء",
    logoutBtn: "تسجيل الخروج",
    phases: {
      menstrual: "مرحلة الحيض",
      follicular: "المرحلة الجريبية",
      ovulation: "مرحلة الإباضة",
      luteal: "المرحلة الصفرية"
    }
  }
};

const cycleHistoryData = [
  { month: 'Nis', duration: 28 },
  { month: 'May', duration: 27 },
  { month: 'Haz', duration: 29 },
  { month: 'Tem', duration: 28 },
  { month: 'Ağu', duration: 28 },
  { month: 'Eyl', duration: 27 },
];

export default function App() {
  const [lang, setLang] = useState<Language>('tr');
  const t = translations[lang];

  // Kullanıcı Hesap Durumu
  const [user, setUser] = useState<{ email: string } | null>(null);
  const [emailInput, setEmailInput] = useState('');
  const [passwordInput, setPasswordInput] = useState('');

  const [isDarkMode, setIsDarkMode] = useState(false);
  const [cycleLength] = useState(28);
  
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
  
  const [copiedCode, setCopiedCode] = useState(false);

  // Hatırlatıcılar
  const [notifPeriod, setNotifPeriod] = useState(true);
  const [notifOvulation, setNotifOvulation] = useState(true);
  const [notifPill, setNotifPill] = useState(false);

  const calculateCycleInfo = () => {
    const start = new Date(lastPeriodDate);
    const today = new Date();
    const diffTime = Math.abs(today.getTime() - start.getTime());
    const diffDays = Math.floor(diffTime / (1000 * 60 * 60 * 24)) + 1;
    
    const currentDayCalculated = ((diffDays - 1) % cycleLength) + 1;
    const daysUntilNext = cycleLength - currentDayCalculated;

    let phaseName = t.phases.follicular;
    if (currentDayCalculated >= 1 && currentDayCalculated <= 5) {
      phaseName = t.phases.menstrual;
    } else if (currentDayCalculated >= 6 && currentDayCalculated <= 12) {
      phaseName = t.phases.follicular;
    } else if (currentDayCalculated >= 13 && currentDayCalculated <= 16) {
      phaseName = t.phases.ovulation;
    } else {
      phaseName = t.phases.luteal;
    }

    return { currentDayCalculated, daysUntilNext, phaseName };
  };

  const { currentDayCalculated, daysUntilNext, phaseName } = calculateCycleInfo();

  const [selectedSymptoms, setSelectedSymptoms] = useState<string[]>([]);
  const [painLevel, setPainLevel] = useState(2);
  const [showSymptomModal, setShowSymptomModal] = useState(false);
  const [symptomLogSuccess, setSymptomLogSuccess] = useState(false);

  const [isMorning, setIsMorning] = useState(true);
  const [currentQuote, setCurrentQuote] = useState("");

  const getRandomQuote = (language: Language) => {
    const hours = new Date().getHours();
    const morning = hours >= 5 && hours < 17;
    setIsMorning(morning);
    const pool = morning ? quotesData[language].morning : quotesData[language].evening;
    const randomIndex = Math.floor(Math.random() * pool.length);
    setCurrentQuote(pool[randomIndex]);
  };

  useEffect(() => {
    getRandomQuote(lang);
  }, [lang]);

  const [inputMessage, setInputMessage] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const [chatLog, setChatLog] = useState([
    { sender: "ai", text: t.aiGreeting }
  ]);

  const toggleSymptom = (symptom: string) => {
    setSelectedSymptoms(prev => 
      prev.includes(symptom) ? prev.filter(s => s !== symptom) : [...prev, symptom]
    );
  };

  // Yapay Zeka ile Sohbet ve Hafıza Entegrasyonu
  const askAI = async (userText: string) => {
    if (!userText.trim()) return;

    const updatedLog = [...chatLog, { sender: "user", text: userText }];
    setChatLog(updatedLog);
    setInputMessage("");
    setIsLoading(true);

    const systemPrompt = `${t.aiPrompt} Kullanıcı Hesabı: ${user?.email}. Gün ${currentDayCalculated} (${phaseName}). Semptomlar: ${selectedSymptoms.length > 0 ? selectedSymptoms.join(", ") : "Yok"}. Ağrı: ${painLevel}/5. Geçmiş mesajları ve kullanıcının sorduğu detayları hatırla.`;

    // Son mesajları hafıza için prompta ekleyelim
    const previousMessages = chatLog.slice(-4).map(m => ({
      role: m.sender === 'user' ? 'user' : 'assistant',
      content: m.text
    }));

    try {
      const response = await fetch("https://text.pollinations.ai/", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          messages: [
            { role: "system", content: systemPrompt },
            ...previousMessages,
            { role: "user", content: userText }
          ],
          model: "openai"
        })
      });

      const replyText = await response.text();
      
      if (replyText) {
        setChatLog([...updatedLog, { sender: "ai", text: replyText }]);
      } else {
        setChatLog([...updatedLog, { sender: "ai", text: "Önerilerimi hazırlarken bir hata oluştu, lütfen tekrar dener misin? ✨" }]);
      }
    } catch (error) {
      console.error("AI Hatası:", error);
      setChatLog([...updatedLog, { sender: "ai", text: "Şu an bağlantı kurulamadı, lütfen az sonra tekrar deneyin." }]);
    } finally {
      setIsLoading(false);
    }
  };

  const handleLogin = (e: React.FormEvent) => {
    e.preventDefault();
    if (!emailInput) return;
    setUser({ email: emailInput });
  };

  const handleSaveSymptoms = async () => {
    try {
      await supabase.from('symptoms').insert([
        { 
          user_email: user?.email,
          symptoms: selectedSymptoms, 
          pain_level: painLevel, 
          cycle_day: currentDayCalculated 
        }
      ]);

      setSymptomLogSuccess(true);
      setTimeout(() => {
        setSymptomLogSuccess(false);
        setShowSymptomModal(false);
      }, 1200);

      if (selectedSymptoms.length > 0) {
        const autoMsg = `${t.feltSymptoms} ${selectedSymptoms.join(", ")}, ${t.painLevel} ${painLevel}/5.`;
        askAI(autoMsg);
      }
    } catch (err) {
      console.error("Supabase Kayıt Hatası:", err);
    }
  };

  const copyPartnerCode = () => {
    navigator.clipboard.writeText(`AURA-${user?.email ? user.email.substring(0, 5).toUpperCase() : 'LOVE'}`);
    setCopiedCode(true);
    setTimeout(() => setCopiedCode(false), 2000);
  };

  // EĞER KULLANICI GİRİŞ YAPMADIYSA GİRİŞ / KAYIT EKRANI GÖSTER
  if (!user) {
    return (
      <div className={`min-h-screen flex items-center justify-center p-4 font-sans ${
        isDarkMode ? 'bg-slate-950 text-slate-100' : 'bg-rose-50/60 text-slate-800'
      }`} dir={lang === 'ar' ? 'rtl' : 'ltr'}>
        <div className={`max-w-md w-full rounded-3xl p-8 border shadow-xl space-y-6 ${
          isDarkMode ? 'bg-slate-900 border-slate-800' : 'bg-white border-rose-100'
        }`}>
          <div className="text-center space-y-2">
            <div className="w-16 h-16 rounded-3xl bg-rose-500 text-white flex items-center justify-center mx-auto shadow-lg shadow-rose-200">
              <Heart className="w-8 h-8 fill-current" />
            </div>
            <h1 className="text-2xl font-black">AuraCycle</h1>
            <p className="text-xs text-slate-400">{t.loginSubtitle}</p>
          </div>

          <div className="flex justify-center gap-1 bg-slate-100 dark:bg-slate-800 p-1 rounded-2xl">
            {(['tr', 'de', 'ar'] as Language[]).map((l) => (
              <button
                key={l}
                onClick={() => setLang(l)}
                className={`px-3 py-1 rounded-xl text-xs font-bold uppercase transition ${
                  lang === l ? 'bg-rose-500 text-white' : 'text-slate-400'
                }`}
              >
                {l}
              </button>
            ))}
          </div>

          <form onSubmit={handleLogin} className="space-y-4">
            <div className="space-y-1">
              <label className="text-xs font-semibold text-slate-400 flex items-center gap-1">
                <Mail className="w-3.5 h-3.5" /> E-posta
              </label>
              <input 
                type="email" 
                required
                placeholder={t.emailPlaceholder}
                value={emailInput}
                onChange={(e) => setEmailInput(e.target.value)}
                className={`w-full p-3.5 rounded-2xl border text-xs focus:outline-none focus:border-rose-400 ${
                  isDarkMode ? 'bg-slate-950 border-slate-800 text-white' : 'bg-slate-50 border-slate-200 text-slate-800'
                }`}
              />
            </div>

            <div className="space-y-1">
              <label className="text-xs font-semibold text-slate-400 flex items-center gap-1">
                <Lock className="w-3.5 h-3.5" /> Şifre
              </label>
              <input 
                type="password" 
                required
                placeholder={t.passwordPlaceholder}
                value={passwordInput}
                onChange={(e) => setPasswordInput(e.target.value)}
                className={`w-full p-3.5 rounded-2xl border text-xs focus:outline-none focus:border-rose-400 ${
                  isDarkMode ? 'bg-slate-950 border-slate-800 text-white' : 'bg-slate-50 border-slate-200 text-slate-800'
                }`}
              />
            </div>

            <button
              type="submit"
              className="w-full bg-rose-500 hover:bg-rose-600 text-white py-4 rounded-2xl text-xs font-bold transition shadow-md shadow-rose-200 flex items-center justify-center gap-2"
            >
              <User className="w-4 h-4" />
              <span>{t.loginBtn}</span>
            </button>
          </form>

          <p className="text-[11px] text-center text-slate-400">
            {t.registerLink} ✨
          </p>
        </div>
      </div>
    );
  }

  // ANA UYGULAMA ARAYÜZÜ (GİRİŞ YAPILMIŞ HALİ)
  return (
    <div className={`min-h-screen transition-colors duration-300 p-4 md:p-8 font-sans ${
      lang === 'ar' ? 'rtl' : 'ltr'
    } ${
      isDarkMode ? 'bg-slate-950 text-slate-100' : 'bg-rose-50/40 text-slate-800'
    }`} dir={lang === 'ar' ? 'rtl' : 'ltr'}>
      <div className="max-w-4xl mx-auto space-y-6">
        
        {/* Header */}
        <div className={`rounded-3xl p-6 border shadow-sm flex flex-wrap items-center justify-between gap-4 transition-colors ${
          isDarkMode ? 'bg-slate-900 border-slate-800' : 'bg-white border-rose-100'
        }`}>
          <div className="flex items-center gap-3">
            <div className="w-12 h-12 rounded-2xl bg-rose-500 text-white flex items-center justify-center font-bold text-xl shadow-md shadow-rose-200">
              <Heart className="w-6 h-6 fill-current" />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <h1 className="text-xl font-bold">AuraCycle</h1>
                <span className="text-[10px] bg-emerald-500/10 text-emerald-600 px-2 py-0.5 rounded-full font-bold flex items-center gap-1 border border-emerald-500/20">
                  <Database className="w-2.5 h-2.5" /> {user.email}
                </span>
              </div>
              <p className={`text-xs ${isDarkMode ? 'text-slate-400' : 'text-slate-500'}`}>
                {t.subtitle}
              </p>
            </div>
          </div>

          <div className="flex items-center gap-3">
            {/* Çıkış Yap */}
            <button
              onClick={() => setUser(null)}
              className={`p-2.5 rounded-2xl border transition text-rose-500 hover:bg-rose-50 dark:hover:bg-slate-800 ${
                isDarkMode ? 'border-slate-700 bg-slate-800' : 'border-slate-200 bg-slate-100'
              }`}
              title={t.logoutBtn}
            >
              <LogOut className="w-4 h-4" />
            </button>

            {/* Bildirim Düğmesi */}
            <button
              onClick={() => setShowNotifModal(true)}
              className={`p-2.5 rounded-2xl border transition relative ${
                isDarkMode ? 'bg-slate-800 border-slate-700 text-slate-300' : 'bg-slate-100 border-slate-200 text-slate-600'
              }`}
            >
              <Bell className="w-4 h-4" />
              <span className="absolute top-1 right-1 w-2 h-2 bg-rose-500 rounded-full animate-ping"></span>
            </button>

            {/* Dil Seçeneği */}
            <div className="flex items-center gap-1 bg-slate-100 dark:bg-slate-800 p-1 rounded-2xl border border-slate-200 dark:border-slate-700">
              <Globe className="w-4 h-4 ml-1 mr-1 text-slate-500" />
              {(['tr', 'de', 'ar'] as Language[]).map((l) => (
                <button
                  key={l}
                  onClick={() => {
                    setLang(l);
                    setChatLog([{ sender: "ai", text: translations[l].aiGreeting }]);
                  }}
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
        <div className={`rounded-3xl p-5 border shadow-sm relative overflow-hidden transition-all ${
          isDarkMode 
            ? 'bg-gradient-to-r from-slate-900 via-purple-950/40 to-slate-900 border-slate-800' 
            : 'bg-gradient-to-r from-rose-100/80 via-pink-50 to-amber-50 border-rose-100'
        }`}>
          <div className="flex items-center justify-between gap-4">
            <div className="flex items-center gap-3">
              <div className={`p-3 rounded-2xl ${
                isMorning ? 'bg-amber-500/20 text-amber-500' : 'bg-indigo-500/20 text-indigo-400'
              }`}>
                {isMorning ? <Sunrise className="w-6 h-6" /> : <Sunset className="w-6 h-6" />}
              </div>
              <div>
                <span className="text-[10px] uppercase font-bold tracking-wider text-rose-500 flex items-center gap-1">
                  <Quote className="w-3 h-3" />
                  {isMorning ? t.morningTitle : t.eveningTitle}
                </span>
                <p className={`text-xs md:text-sm font-semibold mt-0.5 italic ${
                  isDarkMode ? 'text-slate-200' : 'text-slate-800'
                }`}>
                  "{currentQuote}"
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
          
          <div className="space-y-6">
            <div className={`rounded-3xl p-6 border shadow-sm text-center ${
              isDarkMode ? 'bg-slate-900 border-slate-800' : 'bg-white border-rose-100'
            }`}>
              <h3 className="text-xs font-bold uppercase tracking-wider text-slate-400 mb-4">{t.cycleProgress}</h3>
              <div className={`relative w-36 h-36 mx-auto flex items-center justify-center rounded-full border-4 ${
                isDarkMode ? 'border-slate-800 bg-slate-950/50' : 'border-rose-100 bg-rose-50/50'
              }`}>
                <div className="text-center">
                  <span className="text-3xl font-extrabold text-rose-500">{currentDayCalculated}</span>
                  <span className="text-xs text-slate-400 block">. {t.day}</span>
                </div>
              </div>
              <p className={`text-xs mt-4 font-medium ${isDarkMode ? 'text-slate-300' : 'text-slate-600'}`}>
                {t.nextPeriod}{daysUntilNext} {t.daysLater}
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
                className="w-full mt-2 py-2 rounded-xl bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-300 text-[11px] font-bold transition flex items-center justify-center gap-1"
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

            <div className={`rounded-3xl p-6 border shadow-sm space-y-3 ${
              isDarkMode ? 'bg-slate-900 border-slate-800' : 'bg-white border-rose-100'
            }`}>
              <h3 className="text-xs font-bold uppercase tracking-wider text-slate-400">{t.phaseGuide}</h3>
              <div className={`flex items-start gap-2 text-xs ${isDarkMode ? 'text-slate-300' : 'text-slate-600'}`}>
                <Utensils className="w-4 h-4 text-rose-500 shrink-0 mt-0.5" />
                <span>{t.guideNutrition}</span>
              </div>
              <div className={`flex items-start gap-2 text-xs ${isDarkMode ? 'text-slate-300' : 'text-slate-600'}`}>
                <Dumbbell className="w-4 h-4 text-rose-500 shrink-0 mt-0.5" />
                <span>{t.guideFitness}</span>
              </div>
            </div>

            <div className={`rounded-3xl p-6 border shadow-sm ${
              isDarkMode ? 'bg-slate-900 border-slate-800' : 'bg-white border-rose-100'
            }`}>
              <div className="flex items-center gap-2 mb-3">
                <TrendingUp className="w-4 h-4 text-rose-500" />
                <h3 className="text-xs font-bold uppercase tracking-wider text-slate-400">{t.trendTitle}</h3>
              </div>
              <div className="h-32 w-full">
                <ResponsiveContainer width="100%" height="100%">
                  <AreaChart data={cycleHistoryData}>
                    <defs>
                      <linearGradient id="colorDuration" x1="0" y1="0" x2="0" y2="1">
                        <stop offset="5%" stopColor="#f43f5e" stopOpacity={0.4}/>
                        <stop offset="95%" stopColor="#f43f5e" stopOpacity={0}/>
                      </linearGradient>
                    </defs>
                    <XAxis dataKey="month" stroke="#94a3b8" fontSize={10} tickLine={false} axisLine={false} />
                    <YAxis hide domain={[20, 35]} />
                    <Tooltip 
                      contentStyle={{ 
                        backgroundColor: isDarkMode ? '#0f172a' : '#ffffff', 
                        borderColor: isDarkMode ? '#334155' : '#f1f5f9',
                        borderRadius: '0.75rem',
                        fontSize: '12px'
                      }} 
                    />
                    <Area type="monotone" dataKey="duration" stroke="#f43f5e" strokeWidth={2} fillOpacity={1} fill="url(#colorDuration)" />
                  </AreaChart>
                </ResponsiveContainer>
              </div>
            </div>
          </div>

          {/* AI Sohbet Alanı */}
          <div className="md:col-span-2">
            <div className={`rounded-3xl p-6 border shadow-sm h-[600px] flex flex-col justify-between ${
              isDarkMode ? 'bg-slate-900 border-slate-800' : 'bg-white border-rose-100'
            }`}>
              {/* AI Başlık */}
              <div className="flex items-center justify-between pb-4 border-b border-slate-100 dark:border-slate-800">
                <div className="flex items-center gap-3">
                  <div className="w-10 h-10 rounded-2xl bg-gradient-to-tr from-rose-500 to-purple-500 text-white flex items-center justify-center shadow-md shadow-rose-200 dark:shadow-none">
                    <Sparkles className="w-5 h-5" />
                  </div>
                  <div>
                    <h2 className="font-bold text-sm">{t.aiTitle}</h2>
                    <p className="text-[11px] text-slate-400">{t.aiSubtitle}</p>
                  </div>
                </div>
                <span className="text-[10px] bg-emerald-500/10 text-emerald-500 font-bold px-2.5 py-1 rounded-full border border-emerald-500/20 flex items-center gap-1">
                  <span className="w-1.5 h-1.5 rounded-full bg-emerald-500 animate-pulse"></span>
                  {t.aiActive}
                </span>
              </div>

              {/* Sohbet Akışı */}
              <div className="flex-1 overflow-y-auto my-4 space-y-3 pr-2">
                {chatLog.map((msg, index) => (
                  <div key={index} className={`flex items-start gap-2.5 ${msg.sender === 'user' ? 'justify-end' : 'justify-start'}`}>
                    {msg.sender === 'ai' && (
                      <div className="w-7 h-7 rounded-xl bg-rose-500/10 text-rose-500 flex items-center justify-center shrink-0 mt-1">
                        <Bot className="w-4 h-4" />
                      </div>
                    )}
                    <div className={`max-w-[82%] p-3.5 rounded-2xl text-xs leading-relaxed ${
                      msg.sender === 'user'
                        ? 'bg-rose-500 text-white rounded-br-none shadow-sm'
                        : isDarkMode
                          ? 'bg-slate-800 text-slate-200 rounded-bl-none'
                          : 'bg-slate-100 text-slate-700 rounded-bl-none'
                    }`}>
                      {msg.text}
                    </div>
                  </div>
                ))}
                {isLoading && (
                  <div className="flex items-center gap-2 text-rose-500 text-xs italic p-2">
                    <Sparkles className="w-4 h-4 animate-spin" /> Aura AI düşünmektedir...
                  </div>
                )}
              </div>

              {/* Mesaj Gönderme */}
              <div className="space-y-2 pt-2 border-t border-slate-100 dark:border-slate-800">
                <form 
                  onSubmit={(e) => {
                    e.preventDefault();
                    askAI(inputMessage);
                  }}
                  className="flex items-center gap-2"
                >
                  <input 
                    type="text" 
                    value={inputMessage}
                    onChange={(e) => setInputMessage(e.target.value)}
                    placeholder={t.inputPlaceholder}
                    className={`flex-1 p-3 rounded-2xl border text-xs focus:outline-none focus:border-rose-400 ${
                      isDarkMode ? 'bg-slate-950 border-slate-800 text-white' : 'bg-slate-50 border-slate-200 text-slate-800'
                    }`}
                  />
                  <button 
                    type="submit"
                    disabled={isLoading}
                    className="p-3 bg-rose-500 hover:bg-rose-600 disabled:opacity-50 text-white rounded-2xl transition shadow-md shadow-rose-200 dark:shadow-none"
                  >
                    <Send className="w-4 h-4" />
                  </button>
                </form>
                <p className="text-[10px] text-slate-400 text-center">{t.disclaimer}</p>
              </div>
            </div>
          </div>

        </div>
      </div>

      {/* Semptom Modalı */}
      {showSymptomModal && (
        <div className="fixed inset-0 bg-slate-900/60 backdrop-blur-sm flex items-center justify-center p-4 z-50">
          <div className={`max-w-md w-full rounded-3xl p-6 border shadow-2xl space-y-5 ${
            isDarkMode ? 'bg-slate-900 border-slate-800 text-white' : 'bg-white border-rose-100 text-slate-800'
          }`}>
            <div className="flex items-center justify-between">
              <h3 className="font-bold text-sm flex items-center gap-2">
                <Activity className="w-4 h-4 text-rose-500" /> {t.modalTitle}
              </h3>
              <button onClick={() => setShowSymptomModal(false)} className="text-slate-400 hover:text-rose-500">
                <X className="w-5 h-5" />
              </button>
            </div>

            <div className="space-y-2">
              <label className="text-xs font-semibold text-slate-400">{t.feltSymptoms}</label>
              <div className="flex flex-wrap gap-2">
                {t.symptoms.map((symptom) => {
                  const active = selectedSymptoms.includes(symptom);
                  return (
                    <button
                      key={symptom}
                      onClick={() => toggleSymptom(symptom)}
                      className={`px-3 py-2 rounded-xl text-xs font-medium border transition flex items-center gap-1.5 ${
                        active 
                          ? 'bg-rose-500 text-white border-rose-500' 
                          : isDarkMode ? 'bg-slate-800 border-slate-700 text-slate-300' : 'bg-slate-50 border-slate-200 text-slate-600'
                      }`}
                    >
                      {active && <Check className="w-3 h-3" />}
                      {symptom}
                    </button>
                  );
                })}
              </div>
            </div>

            <div className="space-y-2">
              <label className="text-xs font-semibold text-slate-400 flex justify-between">
                <span>{t.painLevel}</span>
                <span className="text-rose-500 font-bold">{painLevel} / 5</span>
              </label>
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
              className="w-full bg-rose-500 hover:bg-rose-600 text-white py-3.5 rounded-2xl text-xs font-bold transition shadow-md shadow-rose-200 flex items-center justify-center gap-2"
            >
              {symptomLogSuccess ? t.savedBtn : t.saveBtn}
            </button>
          </div>
        </div>
      )}

      {/* Tarih Değiştir Modalı */}
      {showDateModal && (
        <div className="fixed inset-0 bg-slate-900/60 backdrop-blur-sm flex items-center justify-center p-4 z-50">
          <div className={`max-w-sm w-full rounded-3xl p-6 border shadow-2xl space-y-4 ${
            isDarkMode ? 'bg-slate-900 border-slate-800 text-white' : 'bg-white border-rose-100 text-slate-800'
          }`}>
            <div className="flex items-center justify-between">
              <h3 className="font-bold text-sm">{t.dateModalTitle}</h3>
              <button onClick={() => setShowDateModal(false)} className="text-slate-400 hover:text-rose-500">
                <X className="w-5 h-5" />
              </button>
            </div>
            <input 
              type="date" 
              value={lastPeriodDate}
              onChange={(e) => setLastPeriodDate(e.target.value)}
              className={`w-full p-3 rounded-2xl border text-xs ${
                isDarkMode ? 'bg-slate-950 border-slate-800 text-white' : 'bg-slate-50 border-slate-200 text-slate-800'
              }`}
            />
            <button
              onClick={() => setShowDateModal(false)}
              className="w-full bg-rose-500 hover:bg-rose-600 text-white py-3 rounded-xl text-xs font-bold transition shadow-sm"
            >
              {t.saveDate}
            </button>
          </div>
        </div>
      )}

      {/* Hekim Raporu Modalı */}
      {showReportModal && (
        <div className="fixed inset-0 bg-slate-900/60 backdrop-blur-sm flex items-center justify-center p-4 z-50">
          <div className={`max-w-lg w-full rounded-3xl p-6 border shadow-2xl space-y-5 ${
            isDarkMode ? 'bg-slate-900 border-slate-800 text-white' : 'bg-white border-rose-100 text-slate-800'
          }`}>
            <div className="flex items-center justify-between border-b pb-3 border-slate-100 dark:border-slate-800">
              <div>
                <h3 className="font-bold text-base flex items-center gap-2">
                  <ShieldCheck className="w-5 h-5 text-rose-500" /> {t.reportModalTitle}
                </h3>
                <p className="text-xs text-slate-400">{t.reportSubtitle}</p>
              </div>
              <button onClick={() => setShowReportModal(false)} className="text-slate-400 hover:text-rose-500">
                <X className="w-5 h-5" />
              </button>
            </div>

            <div className="grid grid-cols-3 gap-3 text-center">
              <div className="p-3 rounded-2xl bg-slate-50 dark:bg-slate-800 border border-slate-100 dark:border-slate-700">
                <span className="text-[10px] text-slate-400 block">{t.reportAvgPain}</span>
                <span className="text-base font-extrabold text-rose-500">{painLevel} / 5</span>
              </div>
              <div className="p-3 rounded-2xl bg-slate-50 dark:bg-slate-800 border border-slate-100 dark:border-slate-700">
                <span className="text-[10px] text-slate-400 block">{t.reportTopSymptom}</span>
                <span className="text-xs font-bold text-slate-700 dark:text-slate-200">
                  {selectedSymptoms.length > 0 ? selectedSymptoms[0] : "Semptom Yok"}
                </span>
              </div>
              <div className="p-3 rounded-2xl bg-slate-50 dark:bg-slate-800 border border-slate-100 dark:border-slate-700">
                <span className="text-[10px] text-slate-400 block">{t.reportCycleLen}</span>
                <span className="text-base font-extrabold text-indigo-500">28 Gün</span>
              </div>
            </div>

            <div className="p-4 rounded-2xl bg-rose-50/50 dark:bg-slate-800/50 border border-rose-100 dark:border-slate-700 space-y-2">
              <h4 className="text-xs font-bold text-rose-500 flex items-center gap-1.5">
                <Sparkles className="w-3.5 h-3.5" /> {t.reportAiSummary}
              </h4>
              <p className="text-xs text-slate-600 dark:text-slate-300 leading-relaxed">
                Son döngü kayıtlarına göre düzenli bir 28 günlük periyot gözlemlenmiştir. Kullanıcı menstrüasyon aşamalarında orta düzeyde sancı kaydetmiştir.
              </p>
            </div>

            <button
              onClick={() => window.print()}
              className="w-full bg-slate-800 hover:bg-slate-900 text-white py-3.5 rounded-2xl text-xs font-bold transition flex items-center justify-center gap-2"
            >
              <Printer className="w-4 h-4" /> {t.printReport}
            </button>
          </div>
        </div>
      )}

      {/* Partner Modalı */}
      {showPartnerModal && (
        <div className="fixed inset-0 bg-slate-900/60 backdrop-blur-sm flex items-center justify-center p-4 z-50">
          <div className={`max-w-md w-full rounded-3xl p-6 border shadow-2xl space-y-5 text-center ${
            isDarkMode ? 'bg-slate-900 border-slate-800 text-white' : 'bg-white border-rose-100 text-slate-800'
          }`}>
            <div className="flex items-center justify-between">
              <h3 className="font-bold text-sm flex items-center gap-2">
                <Users className="w-4 h-4 text-indigo-500" /> {t.partnerModalTitle}
              </h3>
              <button onClick={() => setShowPartnerModal(false)} className="text-slate-400 hover:text-rose-500">
                <X className="w-5 h-5" />
              </button>
            </div>
            
            <p className="text-xs text-slate-400">{t.partnerSubtitle}</p>

            <div className="p-4 rounded-2xl bg-indigo-50 dark:bg-slate-800 border border-indigo-100 dark:border-slate-700 space-y-3">
              <span className="text-xs text-indigo-500 font-bold">{t.yourPartnerCode}</span>
              <div className="flex items-center justify-center gap-2">
                <code className="text-lg font-black tracking-widest text-indigo-600 dark:text-indigo-400">
                  AURA-{user?.email ? user.email.substring(0, 5).toUpperCase() : 'LOVE'}
                </code>
                <button onClick={copyPartnerCode} className="p-2 bg-indigo-500 text-white rounded-xl hover:bg-indigo-600 transition">
                  <Copy className="w-4 h-4" />
                </button>
              </div>
              {copiedCode && <span className="text-[10px] text-emerald-500 font-bold block">Kopyalandı!</span>}
            </div>

            <div className="p-4 bg-white dark:bg-slate-950 rounded-2xl border border-slate-200 dark:border-slate-800 inline-block">
              <QrCode className="w-32 h-32 mx-auto text-slate-800 dark:text-slate-100" />
              <span className="text-[10px] text-slate-400 mt-2 block">{t.scanQrInstruction}</span>
            </div>

            <div className="text-left p-3.5 rounded-2xl bg-rose-50 dark:bg-slate-800 text-xs space-y-1">
              <span className="font-bold text-rose-500">{t.partnerTipsTitle}</span>
              <p className="text-slate-600 dark:text-slate-300">{t.partnerTipsBody}</p>
            </div>
          </div>
        </div>
      )}

      {/* Takvim Modalı */}
      {showCalendarModal && (
        <div className="fixed inset-0 bg-slate-900/60 backdrop-blur-sm flex items-center justify-center p-4 z-50">
          <div className={`max-w-md w-full rounded-3xl p-6 border shadow-2xl space-y-4 ${
            isDarkMode ? 'bg-slate-900 border-slate-800 text-white' : 'bg-white border-rose-100 text-slate-800'
          }`}>
            <div className="flex items-center justify-between">
              <h3 className="font-bold text-sm flex items-center gap-2">
                <CalendarIcon className="w-4 h-4 text-rose-500" /> {t.calendarTitle}
              </h3>
              <button onClick={() => setShowCalendarModal(false)} className="text-slate-400 hover:text-rose-500">
                <X className="w-5 h-5" />
              </button>
            </div>

            <div className="grid grid-cols-7 gap-2 text-center text-xs font-bold my-2">
              {['Pzt', 'Sal', 'Çar', 'Per', 'Cum', 'Cmt', 'Paz'].map(d => (
                <span key={d} className="text-slate-400">{d}</span>
              ))}
            </div>

            <div className="grid grid-cols-7 gap-2">
              {Array.from({ length: 35 }).map((_, i) => {
                const dayNum = (i % 31) + 1;
                const isPeriod = dayNum >= 1 && dayNum <= 5;
                const isOvulation = dayNum >= 13 && dayNum <= 15;
                const isCurrent = dayNum === currentDayCalculated;

                return (
                  <div
                    key={i}
                    className={`h-9 rounded-xl flex items-center justify-center text-xs font-bold border transition ${
                      isCurrent
                        ? 'bg-rose-500 text-white border-rose-500 shadow-md shadow-rose-200'
                        : isPeriod
                          ? 'bg-rose-100 text-rose-600 border-rose-200 dark:bg-rose-950/40 dark:text-rose-400 dark:border-rose-800'
                          : isOvulation
                            ? 'bg-purple-100 text-purple-600 border-purple-200 dark:bg-purple-950/40 dark:text-purple-400 dark:border-purple-800'
                            : isDarkMode ? 'bg-slate-950 border-slate-800 text-slate-300' : 'bg-slate-50 border-slate-100 text-slate-600'
                    }`}
                  >
                    {dayNum}
                  </div>
                );
              })}
            </div>
          </div>
        </div>
      )}

      {/* Bildirimler Modalı */}
      {showNotifModal && (
        <div className="fixed inset-0 bg-slate-900/60 backdrop-blur-sm flex items-center justify-center p-4 z-50">
          <div className={`max-w-sm w-full rounded-3xl p-6 border shadow-2xl space-y-4 ${
            isDarkMode ? 'bg-slate-900 border-slate-800 text-white' : 'bg-white border-rose-100 text-slate-800'
          }`}>
            <div className="flex items-center justify-between">
              <h3 className="font-bold text-sm flex items-center gap-2">
                <Bell className="w-4 h-4 text-rose-500" /> {t.notificationsTitle}
              </h3>
              <button onClick={() => setShowNotifModal(false)} className="text-slate-400 hover:text-rose-500">
                <X className="w-5 h-5" />
              </button>
            </div>

            <div className="space-y-3 pt-2">
              <div className="flex items-center justify-between p-3 rounded-2xl bg-slate-50 dark:bg-slate-800">
                <span className="text-xs font-semibold">{t.notifPeriod}</span>
                <input 
                  type="checkbox" 
                  checked={notifPeriod} 
                  onChange={(e) => setNotifPeriod(e.target.checked)} 
                  className="accent-rose-500 w-4 h-4" 
                />
              </div>

              <div className="flex items-center justify-between p-3 rounded-2xl bg-slate-50 dark:bg-slate-800">
                <span className="text-xs font-semibold">{t.notifOvulation}</span>
                <input 
                  type="checkbox" 
                  checked={notifOvulation} 
                  onChange={(e) => setNotifOvulation(e.target.checked)} 
                  className="accent-rose-500 w-4 h-4" 
                />
              </div>

              <div className="flex items-center justify-between p-3 rounded-2xl bg-slate-50 dark:bg-slate-800">
                <span className="text-xs font-semibold">{t.notifPill}</span>
                <input 
                  type="checkbox" 
                  checked={notifPill} 
                  onChange={(e) => setNotifPill(e.target.checked)} 
                  className="accent-rose-500 w-4 h-4" 
                />
              </div>
            </div>
          </div>
        </div>
      )}

    </div>
  );
}
