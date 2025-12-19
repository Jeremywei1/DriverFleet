
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
    try {
      const result = await getFleetAnalysis(stats, tasks, schedules);
      setAnalysis(result);
    } catch (err) {
      setAnalysis("无法加载分析数据。");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    if (!analysis) {
       fetchAnalysis();
    }
  }, []);

  return (
    <div className="bg-gradient-to-br from-indigo-600 to-violet-600 rounded-2xl shadow-lg text-white p-6 relative overflow-hidden h-full">
      <div className="absolute top-0 right-0 -mr-16 -mt-16 w-32 h-32 rounded-full bg-white opacity-10 blur-xl"></div>
      
      <div className="relative z-10 flex flex-col h-full">
        <div className="flex justify-between items-center mb-4">
          <h2 className="text-xl font-bold flex items-center gap-2">
            <Sparkles className="w-5 h-5 text-yellow-300" />
            AI 智能洞察
          </h2>
          <button 
            onClick={fetchAnalysis}
            disabled={loading}
            className="p-2 hover:bg-white/10 rounded-full transition-colors disabled:opacity-50"
          >
            {loading ? <Loader2 className="w-4 h-4 animate-spin" /> : <RefreshCw className="w-4 h-4" />}
          </button>
        </div>

        <div className="bg-white/10 rounded-xl p-4 text-sm leading-relaxed flex-1 backdrop-blur-sm border border-white/10 shadow-inner overflow-y-auto custom-scrollbar">
          {loading ? (
             <div className="h-full flex flex-col items-center justify-center space-y-3 py-12">
               <Loader2 className="w-8 h-8 animate-spin text-indigo-200" />
               <p className="text-indigo-100 animate-pulse">AI 正在深度扫描运营数据...</p>
             </div>
          ) : (
            <div className="prose prose-invert prose-sm max-w-none">
              <ReactMarkdown>{analysis}</ReactMarkdown>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default AIInsight;
