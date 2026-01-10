
import React, { useState, useEffect } from 'react';
import { Cloud, CheckCircle2, CloudOff, Loader2, ChevronUp, ChevronDown, ListRestart } from 'lucide-react';

interface SyncLog {
  status: 'pending' | 'success' | 'error';
  table: string;
  action: string;
  timestamp: string;
}

const SyncMonitor: React.FC = () => {
  const [logs, setLogs] = useState<SyncLog[]>([]);
  const [isOpen, setIsOpen] = useState(false);
  const [lastStatus, setLastStatus] = useState<'pending' | 'success' | 'error'>('success');

  useEffect(() => {
    const handleSyncEvent = (e: any) => {
      const newLog = e.detail as SyncLog;
      setLogs(prev => [newLog, ...prev].slice(0, 10));
      setLastStatus(newLog.status);
      
      if (newLog.status === 'error') setIsOpen(true);
    };

    window.addEventListener('sync-status-change', handleSyncEvent);
    return () => window.removeEventListener('sync-status-change', handleSyncEvent);
  }, []);

  return (
    <div className="fixed bottom-6 right-6 z-[9999] font-sans">
      <div className={`bg-slate-900/90 backdrop-blur-2xl border border-white/10 rounded-[32px] shadow-2xl transition-all duration-500 ease-in-out overflow-hidden ${isOpen ? 'w-80 h-96' : 'w-48 h-16'}`}>
        
        {/* Header / Bubble */}
        <div 
          onClick={() => setIsOpen(!isOpen)}
          className="h-16 flex items-center justify-between px-6 cursor-pointer hover:bg-white/5 transition-colors"
        >
          <div className="flex items-center gap-3">
            <div className="relative">
              {lastStatus === 'pending' ? (
                <Loader2 className="w-5 h-5 text-indigo-400 animate-spin" />
              ) : lastStatus === 'error' ? (
                <CloudOff className="w-5 h-5 text-rose-500" />
              ) : (
                <div className="flex items-center">
                  <Cloud className="w-5 h-5 text-emerald-400" />
                  <CheckCircle2 className="w-2.5 h-2.5 text-emerald-400 absolute -bottom-1 -right-1 bg-slate-900 rounded-full" />
                </div>
              )}
              {lastStatus === 'pending' && (
                <span className="absolute -top-1 -right-1 w-2 h-2 bg-indigo-500 rounded-full animate-ping"></span>
              )}
            </div>
            <span className="text-[10px] font-black text-white uppercase tracking-widest italic">
              {lastStatus === 'pending' ? '云端同步中' : 'D1 数据已入库'}
            </span>
          </div>
          {isOpen ? <ChevronDown className="w-4 h-4 text-slate-500" /> : <ChevronUp className="w-4 h-4 text-slate-500" />}
        </div>

        {/* Content Area */}
        <div className="px-6 pb-6 h-[calc(100%-4rem)] flex flex-col">
          <div className="flex items-center justify-between mb-4 pt-2">
            <h4 className="text-[9px] font-black text-slate-500 uppercase tracking-[0.2em]">数据持久化流水</h4>
            <button onClick={(e) => { e.stopPropagation(); setLogs([]); }} className="text-[9px] font-black text-indigo-400 hover:text-indigo-300 flex items-center gap-1">
              <ListRestart className="w-3 h-3" /> 清空记录
            </button>
          </div>
          
          <div className="flex-1 overflow-y-auto space-y-3 scrollbar-hide">
            {logs.length === 0 ? (
              <div className="h-full flex flex-col items-center justify-center opacity-20 py-10">
                <Cloud className="w-8 h-8 text-white mb-2" />
                <p className="text-[10px] text-white font-bold uppercase">无待处理任务</p>
              </div>
            ) : (
              logs.map((log, i) => (
                <div key={i} className={`p-3 rounded-2xl border ${log.status === 'error' ? 'bg-rose-500/10 border-rose-500/20' : 'bg-white/5 border-white/5'} transition-all`}>
                  <div className="flex justify-between items-start mb-1">
                    <span className={`text-[8px] font-black px-1.5 py-0.5 rounded uppercase ${
                      log.status === 'success' ? 'bg-emerald-500/20 text-emerald-400' : 
                      log.status === 'pending' ? 'bg-indigo-500/20 text-indigo-400' : 'bg-rose-500/20 text-rose-400'
                    }`}>
                      {log.status === 'success' ? 'SUCCESS' : log.status === 'pending' ? 'SYNCING' : 'FAILED'}
                    </span>
                    <span className="text-[8px] font-mono text-slate-600">{log.timestamp}</span>
                  </div>
                  <p className="text-[10px] font-bold text-slate-200 truncate">{log.action}</p>
                  <p className="text-[8px] text-slate-500 uppercase tracking-tighter mt-1">Table: {log.table}</p>
                </div>
              ))
            )}
          </div>
        </div>
      </div>
    </div>
  );
};

export default SyncMonitor;
