
import React, { useState, useEffect } from 'react';
import { Sparkles, RefreshCw, Loader2 } from 'lucide-react';
import { getFleetAnalysis } from '../services/geminiService';
import { DriverStats, Task, DriverSchedule } from '../types';
import ReactMarkdown from 'react-markdown';

interface Props {
  stats: DriverStats[];
  tasks: Task[];
  schedules: DriverSchedule[];
}

const AIInsight: React.FC<Props> = ({ stats, tasks, schedules }) => {
  const [analysis, setAnalysis] = useState<string>("");
  const [loading, setLoading] = useState(false);

  const fetchAnalysis = async () => {
    setLoading(true);
    const result = await getFleetAnalysis(stats, tasks, schedules);
    setAnalysis(result);
    setLoading(false);
  };

  useEffect(() => {
    if (!analysis) {
       fetchAnalysis();
    }
  }, []);

  return (
    <div className="bg-[#1E293B] rounded-[48px] shadow-2xl text-white p-10 relative overflow-hidden border border-slate-700/50">
      {/* 极简光晕装饰 */}
      <div className="absolute top-0 right-0 -mr-20 -mt-20 w-64 h-64 rounded-full bg-indigo-500/10 blur-[80px]"></div>
      <div className="absolute bottom-0 left-0 -ml-20 -mb-20 w-64 h-64 rounded-full bg-slate-500/10 blur-[80px]"></div>

      <div className="relative z-10">
        <div className="flex justify-between items-center mb-8">
          <h2 className="text-2xl font-black italic flex items-center gap-4 tracking-tighter uppercase">
            <div className="w-10 h-10 bg-indigo-500 rounded-2xl flex items-center justify-center shadow-lg">
              <Sparkles className="w-5 h-5 text-white" />
            </div>
            AI 智能洞察报告
          </h2>
          <button 
            onClick={fetchAnalysis}
            disabled={loading}
            className="w-12 h-12 bg-white/5 hover:bg-white/10 border border-white/10 rounded-2xl flex items-center justify-center transition-all disabled:opacity-50"
          >
            {loading ? <Loader2 className="w-5 h-5 animate-spin" /> : <RefreshCw className="w-5 h-5" />}
          </button>
        </div>

        <div className="bg-black/20 rounded-[32px] p-8 text-sm leading-relaxed min-h-[180px] border border-white/5 shadow-inner">
          {loading ? (
             <div className="h-full flex flex-col items-center justify-center space-y-4 py-12">
               <div className="w-12 h-12 border-4 border-indigo-500/30 border-t-indigo-500 rounded-full animate-spin"></div>
               <p className="text-slate-400 font-black uppercase tracking-widest text-[10px]">正在通过神经网络分析车队效能...</p>
             </div>
          ) : (
            <div className="prose prose-invert prose-sm max-w-none font-medium text-slate-300">
              <ReactMarkdown>{analysis}</ReactMarkdown>
            </div>
          )}
        </div>
        
        <div className="mt-8 flex justify-between items-center">
          <div className="flex items-center gap-2">
            <span className="w-1.5 h-1.5 rounded-full bg-emerald-400 animate-pulse"></span>
            <span className="text-[9px] font-black text-slate-500 uppercase tracking-[0.2em]">由 Gemini 3 Pro 驱动实时模型</span>
          </div>
          <span className="text-[9px] font-black text-slate-600 uppercase">数据最近更新: 刚刚</span>
        </div>
      </div>
    </div>
  );
};

export default AIInsight;
