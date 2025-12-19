
import React from 'react';
import { Database, CheckCircle2, XCircle, Clock, RefreshCcw, HardDrive } from 'lucide-react';
import { SyncLog } from '../types';

interface Props {
  logs: SyncLog[];
  isSyncing: boolean;
  onManualSync: () => void;
}

const SyncCenter: React.FC<Props> = ({ logs, isSyncing, onManualSync }) => {
  return (
    <div className="h-full flex flex-col gap-6 animate-in fade-in duration-500">
      <div className="flex justify-between items-center bg-white p-6 rounded-3xl border border-slate-100 shadow-sm">
        <div className="flex items-center gap-4">
          <div className="w-12 h-12 bg-indigo-50 rounded-2xl flex items-center justify-center text-indigo-600">
            <HardDrive className="w-6 h-6" />
          </div>
          <div>
            <h2 className="text-xl font-bold text-slate-800">Supabase 数据中心</h2>
            <p className="text-sm text-slate-500">管理后台备份与云端数据同步</p>
          </div>
        </div>
        <button 
          onClick={onManualSync}
          disabled={isSyncing}
          className={`
            flex items-center gap-2 px-6 py-3 rounded-2xl font-bold transition-all
            ${isSyncing ? 'bg-slate-100 text-slate-400 cursor-not-allowed' : 'bg-indigo-600 text-white hover:bg-indigo-700 shadow-lg shadow-indigo-200'}
          `}
        >
          <RefreshCcw className={`w-4 h-4 ${isSyncing ? 'animate-spin' : ''}`} />
          立即同步当前数据
        </button>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <div className="bg-emerald-50 p-6 rounded-3xl border border-emerald-100">
          <p className="text-emerald-600 text-xs font-bold uppercase tracking-widest mb-1">健康状态</p>
          <h3 className="text-2xl font-black text-emerald-800">已连接</h3>
          <p className="text-emerald-600/70 text-sm mt-2">API 响应正常: 24ms</p>
        </div>
        <div className="bg-indigo-50 p-6 rounded-3xl border border-indigo-100">
          <p className="text-indigo-600 text-xs font-bold uppercase tracking-widest mb-1">本月备份</p>
          <h3 className="text-2xl font-black text-indigo-800">28 / 31 天</h3>
          <p className="text-indigo-600/70 text-sm mt-2">覆盖率 92.4%</p>
        </div>
        <div className="bg-slate-800 p-6 rounded-3xl border border-slate-700 shadow-xl">
          <p className="text-slate-400 text-xs font-bold uppercase tracking-widest mb-1">云端存储</p>
          <h3 className="text-2xl font-black text-white">1.2 GB</h3>
          <div className="w-full bg-slate-700 h-1.5 rounded-full mt-3 overflow-hidden">
             <div className="bg-indigo-400 h-full w-1/4"></div>
          </div>
        </div>
      </div>

      <div className="flex-1 bg-white rounded-3xl border border-slate-100 shadow-sm overflow-hidden flex flex-col">
        <div className="p-5 border-b border-slate-50 bg-slate-50/50 flex justify-between items-center">
           <h3 className="font-bold text-slate-800 flex items-center gap-2">
             <Database className="w-4 h-4 text-indigo-500" />
             同步历史日志
           </h3>
        </div>
        
        <div className="flex-1 overflow-y-auto custom-scrollbar p-4">
           {logs.length === 0 ? (
             <div className="h-full flex flex-col items-center justify-center text-slate-400 opacity-50">
                <Clock className="w-12 h-12 mb-2" />
                <p>暂无同步记录</p>
             </div>
           ) : (
             <div className="space-y-3">
               {logs.map(log => (
                 <div key={log.id} className="flex items-center justify-between p-4 rounded-2xl border border-slate-50 hover:bg-slate-50 transition-colors">
                    <div className="flex items-center gap-4">
                       {log.status === 'SUCCESS' ? 
                         <div className="w-10 h-10 bg-emerald-100 rounded-full flex items-center justify-center text-emerald-600"><CheckCircle2 className="w-5 h-5" /></div> :
                         <div className="w-10 h-10 bg-rose-100 rounded-full flex items-center justify-center text-rose-600"><XCircle className="w-5 h-5" /></div>
                       }
                       <div>
                          <p className="font-bold text-slate-700">数据备份: {log.date}</p>
                          <p className="text-xs text-slate-400">{log.timestamp} · {log.details}</p>
                       </div>
                    </div>
                    <span className={`text-[10px] font-black px-2 py-1 rounded-lg ${log.status === 'SUCCESS' ? 'bg-emerald-50 text-emerald-600' : 'bg-rose-50 text-rose-600'}`}>
                       {log.status === 'SUCCESS' ? '已入库' : '失败'}
                    </span>
                 </div>
               ))}
             </div>
           )}
        </div>
      </div>
    </div>
  );
};

export default SyncCenter;