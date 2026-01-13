
import React, { useMemo, useState, useEffect } from 'react';
import { DriverStats, Task } from '../types';
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, Cell } from 'recharts';
import { BarChart3, TrendingUp, Calendar, ChevronRight, Filter, RefreshCcw } from 'lucide-react';

interface Props {
  stats: DriverStats[];
  tasks: Task[];
  selectedDate: string; // 全局选中的单日
  onModeChange?: (isRangeMode: boolean) => void; // 通知父组件当前模式
}

const PerformanceReport: React.FC<Props> = ({ stats, tasks, selectedDate, onModeChange }) => {
  // 获取今日日期字符串
  const today = new Date().toISOString().split('T')[0];
  // 计算一周前的日期
  const lastWeek = new Date(Date.now() - 7 * 24 * 60 * 60 * 1000).toISOString().split('T')[0];

  // 状态：筛选模式 'SINGLE' (跟随全局) 或 'RANGE' (自定义区间)
  const [filterMode, setFilterMode] = useState<'SINGLE' | 'RANGE'>('SINGLE');
  
  // 状态：日期范围选择
  const [startDate, setStartDate] = useState(lastWeek);
  const [endDate, setEndDate] = useState(today);

  // 当全局日期变化时，自动重置为单日模式
  useEffect(() => {
    setFilterMode('SINGLE');
  }, [selectedDate]);

  // 当模式变化时，通知父组件（用于模糊顶部日期选择器）
  useEffect(() => {
    if (onModeChange) {
      onModeChange(filterMode === 'RANGE');
    }
  }, [filterMode, onModeChange]);

  // 切换到区间模式
  const handleRangeInteract = () => {
    setFilterMode('RANGE');
  };

  // 核心逻辑调整：根据模式和日期范围过滤任务，并计算完成单量
  const reportData = useMemo(() => {
    return stats.map(driver => {
      // 过滤出该司机在选定日期区间内、且非取消状态的任务
      const filteredTasks = tasks.filter(t => {
        const taskDate = t.date || t.startTime.split('T')[0];
        
        if (filterMode === 'SINGLE') {
          // 单日模式：严格匹配全局 selectedDate
          return (
            t.driverId === driver.driverId && 
            t.status !== 'CANCELLED' &&
            taskDate === selectedDate
          );
        } else {
          // 区间模式：匹配 startDate 到 endDate
          return (
            t.driverId === driver.driverId && 
            t.status !== 'CANCELLED' &&
            taskDate >= startDate &&
            taskDate <= endDate
          );
        }
      });
      
      const count = filteredTasks.length;
      
      return {
        name: driver.name,
        completedCount: count,
        efficiencyScore: driver.efficiencyScore
      };
    }).sort((a, b) => b.completedCount - a.completedCount);
  }, [stats, tasks, startDate, endDate, selectedDate, filterMode]);

  const CustomTooltip = ({ active, payload, label }: any) => {
    if (active && payload && payload.length) {
      return (
        <div className="bg-white p-4 border border-slate-100 shadow-2xl rounded-2xl">
          <p className="font-black text-slate-800 mb-2 italic uppercase tracking-tight">{label}</p>
          <div className="flex items-center gap-2">
            <div className="w-2.5 h-2.5 bg-indigo-600 rounded-full shadow-[0_0_8px_rgba(79,70,229,0.4)]"></div>
            <p className="text-indigo-600 text-xs font-black uppercase">
               {filterMode === 'SINGLE' ? '当日' : '区间'}调度数: {payload[0].value} 单
            </p>
          </div>
          <p className="text-slate-400 text-[8px] font-bold mt-2 uppercase tracking-[0.2em] border-t border-slate-50 pt-2">
            统计周期: {filterMode === 'SINGLE' ? selectedDate : `${startDate} 至 ${endDate}`}
          </p>
        </div>
      );
    }
    return null;
  };

  return (
    <div className="bg-white rounded-[48px] shadow-sm border border-slate-100 flex flex-col h-full overflow-hidden animate-in fade-in duration-700">
      <div className="p-8 border-b border-slate-50 flex flex-col lg:flex-row justify-between items-start lg:items-center gap-6 bg-white">
        <div className="flex items-center gap-4">
          <div className="w-12 h-12 bg-slate-900 rounded-2xl flex items-center justify-center shadow-xl">
            <BarChart3 className="w-6 h-6 text-emerald-400" />
          </div>
          <div>
            <h2 className="text-xl font-black text-slate-800 italic uppercase tracking-tighter">
              司机调度效能看板
            </h2>
            <div className="flex items-center gap-2 mt-0.5">
               <span className={`px-2 py-0.5 rounded text-[8px] font-black uppercase tracking-widest transition-all ${filterMode === 'SINGLE' ? 'bg-indigo-100 text-indigo-600' : 'bg-slate-100 text-slate-400'}`}>
                 {filterMode === 'SINGLE' ? '单日视图' : '聚合视图'}
               </span>
               <p className="text-[9px] font-black text-slate-400 uppercase tracking-widest">
                 任务指派即计入完成度
               </p>
            </div>
          </div>
        </div>

        {/* 日期选择器控制组 - 增加视觉模糊逻辑 */}
        <div 
          onClick={handleRangeInteract}
          className={`flex items-center gap-3 bg-slate-900 p-2.5 rounded-[24px] shadow-2xl border border-slate-800 transition-all duration-300 ${filterMode === 'SINGLE' ? 'opacity-60 blur-[1px] hover:opacity-100 hover:blur-0 cursor-pointer scale-95' : 'scale-100'}`}
        >
           <div className="flex items-center gap-3 px-3">
              <Filter className={`w-3.5 h-3.5 ${filterMode === 'RANGE' ? 'text-indigo-400' : 'text-slate-500'}`} />
              <span className={`text-[9px] font-black uppercase tracking-widest ${filterMode === 'RANGE' ? 'text-white' : 'text-slate-500'}`}>区间筛选</span>
           </div>
           <div className="flex items-center bg-white/5 rounded-xl border border-white/5 overflow-hidden">
             <input 
               type="date" 
               value={startDate} 
               onChange={(e) => { setStartDate(e.target.value); handleRangeInteract(); }}
               className="bg-transparent text-white text-[10px] font-black px-4 py-2 outline-none border-none uppercase hover:bg-white/10 transition-colors cursor-pointer"
             />
             <div className="w-px h-4 bg-white/10" />
             <input 
               type="date" 
               value={endDate} 
               onChange={(e) => { setEndDate(e.target.value); handleRangeInteract(); }}
               className="bg-transparent text-white text-[10px] font-black px-4 py-2 outline-none border-none uppercase hover:bg-white/10 transition-colors cursor-pointer"
             />
           </div>
           {filterMode === 'RANGE' && (
             <button 
               onClick={(e) => { e.stopPropagation(); setFilterMode('SINGLE'); }}
               className="p-2 hover:bg-white/10 rounded-full text-slate-400 hover:text-white transition-colors"
               title="重置回单日模式"
             >
                <RefreshCcw className="w-3 h-3" />
             </button>
           )}
        </div>
      </div>

      <div className="flex-1 p-10 flex flex-col gap-10 overflow-hidden bg-slate-50/20">
        {/* 核心柱状图 */}
        <div className="flex-[1.2] min-h-[350px] bg-white rounded-[40px] p-8 border border-slate-100 shadow-sm relative overflow-hidden group">
           <div className="absolute top-6 right-8 text-[9px] font-black text-slate-300 uppercase tracking-widest group-hover:text-indigo-400 transition-colors">
             {filterMode === 'SINGLE' ? selectedDate : `${startDate} - ${endDate}`} 效能对比图
           </div>
           <ResponsiveContainer width="100%" height="100%">
            <BarChart data={reportData} margin={{ top: 20, right: 10, left: 0, bottom: 0 }}>
              <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#f1f5f9" />
              <XAxis 
                dataKey="name" 
                tick={{ fontSize: 10, fontWeight: '900', fill: '#94a3b8' }} 
                axisLine={false} 
                tickLine={false} 
                dy={10}
              />
              <YAxis 
                tick={{ fontSize: 10, fontWeight: '900', fill: '#94a3b8' }} 
                axisLine={false} 
                tickLine={false} 
              />
              <Tooltip content={<CustomTooltip />} cursor={{fill: 'rgba(79, 70, 229, 0.03)'}} />
              <Bar dataKey="completedCount" radius={[12, 12, 0, 0]} barSize={40}>
                {reportData.map((entry, index) => (
                  <Cell key={`cell-${index}`} fill={index < 3 ? '#4F46E5' : '#CBD5E1'} />
                ))}
              </Bar>
            </BarChart>
          </ResponsiveContainer>
        </div>

        {/* 详细列表表格 */}
        <div className="flex-1 overflow-x-auto">
          <table className="w-full text-sm text-left text-slate-600">
            <thead className="text-[10px] text-slate-400 uppercase font-black tracking-widest bg-slate-50/50 border-b border-slate-100 sticky top-0">
              <tr>
                <th className="px-6 py-4">司机标识</th>
                <th className="px-6 py-4 text-center">{filterMode === 'SINGLE' ? '当日' : '区间'}调度数 (单)</th>
                <th className="px-6 py-4 text-center">任务饱和度参考</th>
                <th className="px-6 py-4 text-right">效率系数 SC</th>
              </tr>
            </thead>
            <tbody>
              {reportData.map((data, idx) => (
                <tr key={idx} className="border-b border-slate-50 hover:bg-white transition-all group">
                  <td className="px-6 py-5 font-black text-slate-800 italic uppercase tracking-tight group-hover:text-indigo-600">
                    {data.name}
                  </td>
                  <td className="px-6 py-5 text-center font-black text-indigo-600 text-lg">
                    {data.completedCount}
                  </td>
                  <td className="px-6 py-5">
                    <div className="flex items-center gap-4">
                      <div className="flex-1 h-1.5 bg-slate-100 rounded-full overflow-hidden">
                        <div 
                          className={`h-full bg-indigo-600 rounded-full transition-all duration-1000 ${data.completedCount > 0 ? 'opacity-100' : 'opacity-0'}`} 
                          style={{ width: `${Math.min(100, (data.completedCount / 15) * 100)}%` }}
                        ></div>
                      </div>
                      <span className="text-[10px] font-black text-slate-300 w-8">
                        {Math.min(100, Math.round((data.completedCount / 15) * 100))}%
                      </span>
                    </div>
                  </td>
                  <td className="px-6 py-5 text-right">
                    <span className={`px-3 py-1 rounded-lg text-[10px] font-black border transition-colors ${
                      data.efficiencyScore >= 90 
                        ? 'bg-emerald-50 text-emerald-600 border-emerald-100 group-hover:bg-emerald-600 group-hover:text-white' 
                        : 'bg-slate-50 text-slate-400 border-slate-100 group-hover:bg-slate-600 group-hover:text-white'
                    }`}>
                      {data.efficiencyScore}
                    </span>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
      
      <div className="px-10 py-4 bg-white border-t border-slate-100 flex justify-between items-center">
        <div className="flex items-center gap-3">
          <div className="flex -space-x-2">
             {[1,2,3].map(i => <div key={i} className="w-5 h-5 rounded-full border-2 border-white bg-slate-200" />)}
          </div>
          <span className="text-[9px] font-black text-slate-400 uppercase tracking-widest">
            {filterMode === 'SINGLE' ? `当前单日 (${selectedDate})` : `当前区间 (${startDate} - ${endDate})`} 已记录 {reportData.reduce((acc, curr) => acc + curr.completedCount, 0)} 次有效指派
          </span>
        </div>
        <div className="text-[9px] font-black text-indigo-300 uppercase tracking-[0.3em] italic">
          MULTI-WINDOW ANALYTICS V5.0
        </div>
      </div>
    </div>
  );
};

export default PerformanceReport;
