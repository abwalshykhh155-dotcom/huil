
import React, { useState } from 'react';
import { ScriptSection } from '../types';

interface SectionCardProps {
  section: ScriptSection;
  onPlay?: (text: string) => void;
  isActive?: boolean;
}

const SectionCard: React.FC<SectionCardProps> = ({ section, onPlay, isActive }) => {
  const [copied, setCopied] = useState(false);

  const categoryColors = {
    space: 'bg-indigo-50 border-indigo-500',
    body: 'bg-red-50 border-red-500',
    energy: 'bg-orange-50 border-orange-500',
    physics: 'bg-blue-50 border-blue-500',
    meta: 'bg-yellow-50 border-yellow-500',
    tech: 'bg-purple-50 border-purple-500'
  };

  const handleCopy = () => {
    const text = `${section.title}\n${section.content}\nإفيه: ${section.efeeh}`;
    navigator.clipboard.writeText(text);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  return (
    <div className={`p-6 rounded-3xl border-4 transition-all duration-300 ${isActive ? 'scale-[1.02] ring-4 ring-yellow-400 shadow-xl' : 'shadow-[4px_4px_0px_#000]'} ${categoryColors[section.category]} comic-border relative group`}>
      <div className="flex justify-between items-start mb-4">
        <span className="bg-black text-white px-4 py-1 rounded-full text-xs font-black tracking-widest uppercase">
          {section.timeRange}
        </span>
        <div className="flex gap-2">
          <button 
            onClick={handleCopy}
            className="p-2 hover:bg-black/10 rounded-full transition-colors"
            title="نسخ الفقرة"
          >
            {copied ? (
              <span className="text-xs font-bold text-green-600">تم!</span>
            ) : (
              <svg className="w-5 h-5 text-black" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M8 5H6a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2v-1M8 5a2 2 0 002 2h2a2 2 0 002-2M8 5a2 2 0 012-2h2a2 2 0 012 2m0 0h2a2 2 0 012 2v3m2 4H10m0 0l3-3m-3 3l3 3"/></svg>
            )}
          </button>
          <h3 className="text-xl font-black text-black">{section.title}</h3>
        </div>
      </div>
      
      <p className="text-gray-900 text-lg leading-relaxed mb-6 font-bold text-right">
        {section.content}
      </p>

      <div className="bg-white/80 p-5 rounded-2xl border-2 border-dashed border-black/30 mb-6 relative overflow-hidden">
        <div className="absolute top-0 right-0 bg-pink-500 text-white px-2 py-0.5 text-[10px] font-black uppercase">إفيه</div>
        <p className="text-xl font-black text-pink-600 leading-tight text-right">“ {section.efeeh} ”</p>
      </div>

      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 pt-4 border-t border-black/10">
        <div className="flex flex-wrap gap-2 text-xs text-gray-600 font-bold bg-white/40 px-3 py-2 rounded-xl border border-black/5">
          <span className="text-black uppercase opacity-60">Visuals:</span> 
          {section.visuals}
        </div>
        <button 
          onClick={() => onPlay?.(section.content)}
          className="bg-black text-yellow-400 hover:bg-gray-800 px-6 py-3 rounded-2xl font-black border-2 border-black transition-all shadow-[2px_2px_0px_#000] active:shadow-none active:translate-x-[2px] active:translate-y-[2px] flex items-center justify-center gap-2 whitespace-nowrap"
        >
          <svg className="w-5 h-5" fill="currentColor" viewBox="0 0 24 24"><path d="M8 5v14l11-7z"/></svg>
          اسمع الموزة
        </button>
      </div>
    </div>
  );
};

export default SectionCard;
