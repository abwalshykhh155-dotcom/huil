
import React, { useState, useRef } from 'react';
import { SCRIPT_SECTIONS } from './constants';
import { ChatMessage } from './types';
import { mozaService } from './services/geminiService';
import MozaAvatar from './components/MozaAvatar';
import SectionCard from './components/SectionCard';

type Theme = 'banana' | 'space' | 'lab' | 'blueprint';

const App: React.FC = () => {
  const [messages, setMessages] = useState<ChatMessage[]>([]);
  const [input, setInput] = useState('');
  const [isTalking, setIsTalking] = useState(false);
  const [loadingMoza, setLoadingMoza] = useState(false);
  const [activeTab, setActiveTab] = useState<'script' | 'chat'>('script');
  const [currentTheme, setCurrentTheme] = useState<Theme>('banana');
  const [showThemePicker, setShowThemePicker] = useState(false);
  const [speakingText, setSpeakingText] = useState<string | null>(null);
  const audioContextRef = useRef<AudioContext | null>(null);

  const initAudio = () => {
    if (!audioContextRef.current) {
      audioContextRef.current = new (window.AudioContext || (window as any).webkitAudioContext)({ sampleRate: 24000 });
    }
  };

  const decodeAudioData = async (data: Uint8Array, ctx: AudioContext, sampleRate: number, numChannels: number): Promise<AudioBuffer> => {
    const dataInt16 = new Int16Array(data.buffer);
    const frameCount = dataInt16.length / numChannels;
    const buffer = ctx.createBuffer(numChannels, frameCount, sampleRate);

    for (let channel = 0; channel < numChannels; channel++) {
      const channelData = buffer.getChannelData(channel);
      for (let i = 0; i < frameCount; i++) {
        channelData[i] = dataInt16[i * numChannels + channel] / 32768.0;
      }
    }
    return buffer;
  };

  const handlePlayAudio = async (text: string) => {
    initAudio();
    const ctx = audioContextRef.current!;
    if (ctx.state === 'suspended') await ctx.resume();

    setIsTalking(true);
    setSpeakingText(text);
    
    const audioBytes = await mozaService.speakText(text);
    
    if (audioBytes) {
      const buffer = await decodeAudioData(audioBytes, ctx, 24000, 1);
      const source = ctx.createBufferSource();
      source.buffer = buffer;
      source.connect(ctx.destination);
      source.onended = () => {
        setIsTalking(false);
        setSpeakingText(null);
      };
      source.start();
    } else {
      setIsTalking(false);
      setSpeakingText(null);
      console.error("Audio generation failed");
    }
  };

  const handleAsk = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!input.trim()) return;

    const userMsg: ChatMessage = { role: 'user', text: input };
    setMessages(prev => [...prev, userMsg]);
    setInput('');
    setLoadingMoza(true);

    const mozaResponse = await mozaService.askMoza(input);
    const mozaMsg: ChatMessage = { role: 'model', text: mozaResponse };
    setMessages(prev => [...prev, mozaMsg]);
    setLoadingMoza(false);

    handlePlayAudio(mozaResponse);
  };

  const downloadFullScript = () => {
    const header = "تمت البرمجة بواسطة المهندس يوسف ابو ناصر (قناة جو كودنج)\n\n";
    const fullText = header + SCRIPT_SECTIONS.map(s => `--- ${s.title} (${s.timeRange}) ---\nالفقرة: ${s.content}\nإفيه: ${s.efeeh}\nاللقطات: ${s.visuals}\n\n`).join('\n');
    const blob = new Blob([fullText], { type: 'text/plain;charset=utf-8' });
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.href = url;
    link.download = 'moza_science_script.txt';
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    URL.revokeObjectURL(url);
  };

  const themes: Record<Theme, { bg: string, accent: string, text: string, name: string, icon: string }> = {
    banana: {
      bg: 'bg-[#fefce8]',
      accent: 'bg-yellow-400',
      text: 'text-black',
      name: 'موزة كلاسيك',
      icon: '🍌'
    },
    space: {
      bg: 'bg-[#0f172a] bg-[radial-gradient(circle_at_center,_var(--tw-gradient-stops))] from-slate-900 via-indigo-950 to-black',
      accent: 'bg-indigo-500',
      text: 'text-white',
      name: 'علوم الفضاء',
      icon: '🚀'
    },
    lab: {
      bg: 'bg-[#f0fdf4] bg-[linear-gradient(to_right,#80808012_1px,transparent_1px),linear-gradient(to_bottom,#80808012_1px,transparent_1px)] bg-[size:24px_24px]',
      accent: 'bg-emerald-500',
      text: 'text-emerald-900',
      name: 'المختبر الأخضر',
      icon: '🔬'
    },
    blueprint: {
      bg: 'bg-[#f0f9ff] bg-[radial-gradient(#cbd5e1_1px,transparent_1px)] [background-size:16px_16px]',
      accent: 'bg-sky-500',
      text: 'text-sky-900',
      name: 'مخطط هندسي',
      icon: '📐'
    }
  };

  return (
    <div className={`min-h-screen pb-20 transition-colors duration-500 ${themes[currentTheme].bg}`}>
      {/* Header */}
      <header className={`${themes[currentTheme].accent} border-b-4 border-black p-4 sticky top-0 z-50 transition-colors duration-500 shadow-lg`}>
        <div className="max-w-4xl mx-auto flex flex-col md:flex-row items-center justify-between gap-4">
          <div className="flex items-center gap-3">
            <MozaAvatar isTalking={isTalking} size="sm" />
            <div className="text-right text-black">
              <h1 className="text-2xl font-black italic tracking-tighter">موزة العلوم 🍌</h1>
              <p className="text-xs font-bold opacity-80">برمجة م. يوسف ابو ناصر (Go Coding)</p>
            </div>
          </div>
          
          <div className="flex items-center gap-2">
            <div className="relative">
              <button 
                onClick={() => setShowThemePicker(!showThemePicker)}
                className="p-2 bg-white border-2 border-black rounded-xl shadow-[2px_2px_0px_#000] hover:bg-gray-50 active:translate-x-[1px] active:translate-y-[1px] active:shadow-none transition-all flex items-center gap-2 font-bold text-sm text-black"
              >
                <span>{themes[currentTheme].icon}</span>
                <span className="hidden sm:inline">تغيير الثيم</span>
              </button>
              
              {showThemePicker && (
                <div className="absolute top-full left-0 mt-2 bg-white border-4 border-black rounded-2xl shadow-[8px_8px_0px_#000] p-3 w-48 z-50 animate-in fade-in zoom-in duration-200">
                  <p className="text-xs font-black mb-2 text-gray-400 uppercase tracking-widest text-center">اختر شكلك المفضل</p>
                  <div className="grid grid-cols-1 gap-2">
                    {(Object.keys(themes) as Theme[]).map((t) => (
                      <button
                        key={t}
                        onClick={() => { setCurrentTheme(t); setShowThemePicker(false); }}
                        className={`flex items-center justify-between p-2 rounded-xl border-2 transition-all ${currentTheme === t ? 'border-black bg-yellow-100' : 'border-transparent hover:bg-gray-100'}`}
                      >
                        <span className="text-sm font-bold text-black">{themes[t].name}</span>
                        <span>{themes[t].icon}</span>
                      </button>
                    ))}
                  </div>
                </div>
              )}
            </div>

            <nav className="flex gap-2">
              <button 
                onClick={() => setActiveTab('script')}
                className={`px-4 py-2 rounded-xl font-bold border-2 border-black transition-all shadow-[2px_2px_0px_#000] active:translate-x-[1px] active:translate-y-[1px] active:shadow-none ${activeTab === 'script' ? 'bg-black text-yellow-400' : 'bg-white text-black hover:bg-yellow-100'}`}
              >
                السكريبت 🎬
              </button>
              <button 
                onClick={() => setActiveTab('chat')}
                className={`px-4 py-2 rounded-xl font-bold border-2 border-black transition-all shadow-[2px_2px_0px_#000] active:translate-x-[1px] active:translate-y-[1px] active:shadow-none ${activeTab === 'chat' ? 'bg-black text-yellow-400' : 'bg-white text-black hover:bg-yellow-100'}`}
              >
                اسأل الموزة 💬
              </button>
            </nav>
          </div>
        </div>
      </header>

      <main className="max-w-4xl mx-auto p-4 md:p-8">
        {activeTab === 'script' ? (
          <div className="space-y-8 animate-in fade-in duration-500">
            <div className={`bg-white p-6 rounded-3xl comic-border flex flex-col md:flex-row md:items-center justify-between gap-4 transition-all duration-500 ${currentTheme === 'space' ? 'bg-opacity-90' : ''}`}>
              <div className="text-right text-black">
                <h2 className="text-2xl font-black mb-1 flex items-center gap-2">
                  سكريبت "العلوم بالموز" - 20 دقيقة كاملة
                </h2>
                <p className="text-gray-600 italic font-bold text-right">
                  من إعداد المهندس يوسف ابو ناصر.. اضغط "اسمع الموزة" واستمتع بالأداء.
                </p>
              </div>
              <button 
                onClick={downloadFullScript}
                className="bg-green-400 hover:bg-green-500 text-black px-6 py-3 rounded-2xl font-black border-2 border-black shadow-[4px_4px_0px_#000] active:translate-x-[2px] active:translate-y-[2px] active:shadow-none flex items-center justify-center gap-2 whitespace-nowrap"
              >
                <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M4 16v1a3 3 0 003 3h10a3 3 0 003-3v-1m-4-4l-4 4m0 0l-4-4m4 4V4"/></svg>
                تحميل السكريبت (TXT)
              </button>
            </div>

            <div className="grid grid-cols-1 gap-6">
              {SCRIPT_SECTIONS.map((section) => (
                <SectionCard 
                  key={section.id} 
                  section={section} 
                  onPlay={handlePlayAudio}
                  isActive={speakingText === section.content}
                />
              ))}
            </div>
          </div>
        ) : (
          <div className="flex flex-col h-[75vh] animate-in slide-in-from-bottom duration-500">
            <div className={`flex-1 overflow-y-auto mb-4 space-y-4 p-4 rounded-3xl border-2 border-black/20 shadow-inner transition-colors duration-500 ${currentTheme === 'space' ? 'bg-black/40' : 'bg-white/50'}`}>
              {messages.length === 0 && (
                <div className="text-center py-12 md:py-16">
                  <div className="flex justify-center mb-4">
                    <MozaAvatar size="lg" isTalking={isTalking} />
                  </div>
                  <h3 className={`text-2xl font-black mt-4 transition-colors ${themes[currentTheme].text}`}>عايز تعرف إيه يا حتة سكرة؟</h3>
                  <p className="text-gray-500 font-bold">اسألني أي حاجة وهرد عليك بذكاء المهندس يوسف ابو ناصر!</p>
                  <div className="mt-6 flex flex-wrap justify-center gap-2">
                    {['مين اللي عملك؟', 'ليه القهوة بتسهر؟', 'المغناطيس بيشتغل إزاي؟', 'كلمينا عن جو كودنج'].map(q => (
                      <button 
                        key={q} 
                        onClick={() => { setInput(q); }}
                        className="bg-white hover:bg-yellow-50 text-black border-2 border-black px-3 py-1 rounded-full text-sm font-bold transition-all shadow-[2px_2px_0px_#000] active:translate-x-[1px] active:translate-y-[1px] active:shadow-none"
                      >
                        {q}
                      </button>
                    ))}
                  </div>
                </div>
              )}
              {messages.map((msg, idx) => (
                <div key={idx} className={`flex ${msg.role === 'user' ? 'justify-end' : 'justify-start'}`}>
                  <div className={`relative max-w-[85%] p-4 rounded-3xl border-2 border-black transition-all duration-300 ${
                    msg.role === 'user' 
                      ? 'bg-black text-white rounded-tr-none' 
                      : `bg-yellow-200 text-black rounded-tl-none ${speakingText === msg.text ? 'ring-4 ring-yellow-400 scale-105 shadow-[0_0_20px_rgba(250,204,21,0.5)]' : 'shadow-[4px_4px_0px_rgba(0,0,0,0.1)]'}`
                  }`}>
                    {msg.role === 'model' && speakingText === msg.text && (
                      <div className="absolute -top-3 -right-3 bg-red-500 text-white p-1 rounded-full animate-bounce border-2 border-black">
                        <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M19 11a7 7 0 01-7 7m0 0a7 7 0 01-7-7m7 7v4m0 0H8m4 0h4m-4-8a3 3 0 01-3-3V5a3 3 0 116 0v6a3 3 0 01-3 3z"/></svg>
                      </div>
                    )}
                    <p className="text-lg font-bold leading-relaxed">{msg.text}</p>
                    {msg.role === 'model' && (
                      <button 
                        onClick={() => handlePlayAudio(msg.text)}
                        className={`mt-2 text-xs flex items-center gap-1 font-black underline hover:text-red-500 transition-colors ${speakingText === msg.text ? 'text-red-600' : ''}`}
                      >
                        <svg className="w-3 h-3" fill="currentColor" viewBox="0 0 24 24"><path d="M8 5v14l11-7z"/></svg>
                        {speakingText === msg.text ? 'بيتكلم الآن...' : 'إعادة الصوت'}
                      </button>
                    )}
                  </div>
                </div>
              ))}
              {loadingMoza && (
                <div className="flex justify-start">
                  <div className="bg-white p-4 rounded-2xl border-2 border-dashed border-black flex items-center gap-2 shadow-lg">
                    <div className="w-2 h-2 bg-black rounded-full animate-bounce"></div>
                    <div className="w-2 h-2 bg-black rounded-full animate-bounce [animation-delay:0.2s]"></div>
                    <div className="w-2 h-2 bg-black rounded-full animate-bounce [animation-delay:0.4s]"></div>
                    <span className="font-black text-sm text-black text-right">الموزة بتفكر في إفيه ليوسف...</span>
                  </div>
                </div>
              )}
            </div>

            <form onSubmit={handleAsk} className="flex gap-2 p-2 bg-white rounded-3xl comic-border shadow-xl">
              <input 
                type="text" 
                value={input}
                onChange={(e) => setInput(e.target.value)}
                placeholder="اسأل الموزة أي حاجة..."
                className="flex-1 px-4 py-3 outline-none font-bold text-lg bg-transparent text-right text-black"
                disabled={loadingMoza}
              />
              <button 
                type="submit"
                disabled={loadingMoza || !input.trim()}
                className={`${themes[currentTheme].accent} text-black px-4 md:px-8 py-3 rounded-2xl font-black border-2 border-black shadow-[2px_2px_0px_#000] transition-all active:shadow-none active:translate-x-[2px] active:translate-y-[2px] disabled:opacity-50 flex items-center gap-1 hover:brightness-110`}
              >
                <span className="hidden md:inline">اسأل</span> 🍌
              </button>
            </form>
          </div>
        )}
      </main>

      {/* Footer Info */}
      <footer className="fixed bottom-0 left-0 right-0 bg-black text-yellow-400 p-2 text-center text-[10px] font-bold z-40 border-t border-yellow-400/20">
        صنع بحب بواسطة م. يوسف ابو ناصر (Go Coding) - موزة العلوم {new Date().getFullYear()} 🍌✨
      </footer>
    </div>
  );
};

export default App;
