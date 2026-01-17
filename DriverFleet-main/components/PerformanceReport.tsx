
import React, { useMemo, useState, useEffect } from 'react';
import { DriverStats, Task } from '../types';
import { 
  BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, Cell,
  PieChart, Pie, Legend
} from 'recharts';
import { BarChart3, TrendingUp, Calendar, ChevronRight, Filter, RefreshCcw, CalendarCheck, CalendarRange, PieChart as PieChartIcon, SearchX } from 'lucide-react';

interface Props {
  stats: DriverStats[];
  tasks: Task[];
  selectedDate: string; // 全局选中的单日
  onDateChange?: (date: string) => void; // 回调更新全局日期
  onModeChange?: (isRangeMode: boolean) => void; // 通知父组件当前模式
}

const PerformanceReport: React.FC<Props> = ({ stats, tasks, selectedDate, onDateChange, onModeChange }) => {
  // 获取今日日期字符串
  const today = new Date().toISOString().split('T')[0];
  // 计算一周前的日期
  const lastWeek = new Date(Date.now() - 7 * 24 * 60 * 60 * 1000).toISOString().split('T')[0];

  // 状态：筛选模式 'SINGLE' (单日) 或 'RANGE' (区间)
  const [filterMode, setFilterMode] = useState<'SINGLE' | 'RANGE'>('SINGLE');
  // 状态：视图模式 'DRIVER' (人力) 或 'ASSET' (资产)
  const [viewMode, setViewMode] = useState<'DRIVER' | 'ASSET'>('DRIVER');
  
  // 状态：日期范围选择
  const [startDate, setStartDate] = useState(lastWeek);
  const [endDate, setEndDate] = useState(today);

  // 当模式变化时，通知父组件
  useEffect(() => {
    if (onModeChange) {
      onModeChange(filterMode === 'RANGE');
    }
  }, [filterMode, onModeChange]);

  // 通用过滤逻辑
  const filteredTasks = useMemo(() => {
    return tasks.filter(t => {
      const taskDate = t.date || t.startTime.split('T')[0];
      if (t.status === 'CANCELLED') return false;
      if (filterMode === 'SINGLE') {
        return taskDate === selectedDate;
      } else {
        return taskDate >= startDate && taskDate <= endDate;
      }
    });
  }, [tasks, filterMode, selectedDate, startDate, endDate]);

  // 1. 人力效能数据
  const driverReportData = useMemo(() => {
    return stats.map(driver => {
      // 仅在该过滤后的任务集合中统计该司机的数据
      const count = filteredTasks.filter(t => t.driverId === driver.driverId).length;
      return {
        name: driver.name,
        completedCount: count,
        efficiencyScore: driver.efficiencyScore
      };
    }).sort((a, b) => b.completedCount - a.completedCount);
  }, [stats, filteredTasks]);

  // 2. 资产战略数据 (车型分布)
  const assetTypeData = useMemo(() => {
    const map = new Map<string, number>();
    filteredTasks.forEach(t => {
      // 使用快照字段 vehicleType，如果没有(旧数据)则归为 'Unknown'
      const type = t.vehicleType || 'Unknown';
      map.set(type, (map.get(type) || 0) + 1);
    });
    
    // 转换为 Recharts 格式
    const data = Array.from(map.entries()).map(([name, value]) => ({ name, value }));
    return data.sort((a, b) => b.value - a.value);
  }, [filteredTasks]);

  const COLORS = ['#4F46E5', '#10B981', '#F59E0B', '#64748B']; // Indigo, Emerald, Amber, Slate

  const CustomTooltip = ({ active, payload, label }: any) => {
    if (active && payload && payload.length) {
      return (
        <div className="bg-white p-4 border border-slate-100 shadow-2xl rounded-2xl">
          <p className="font-black text-slate-800 mb-2 italic uppercase tracking-tight">{label || payload[0].name}</p>
          <div className="flex items-center gap-2">
            <div className="w-2.5 h-2.5 bg-indigo-600 rounded-full shadow-[0_0_8px_rgba(79,70,229,0.4)]"></div>
            <p className="text-indigo-600 text-xs font-black uppercase">
               数值: {payload[0].value}
            </p>
          </div>
        </div>
      );
    }
    return null;
  };

  const isSingle = filterMode === 'SINGLE';
  const isRange = filterMode === 'RANGE';
  const hasData = filteredTasks.length > 0;

  return (
    <div className="bg-white rounded-[48px] shadow-sm border border-slate-100 flex flex-col h-full overflow-hidden animate-in fade-in duration-700">
      
      {/* 顶部控制区 */}
      <div className="p-8 border-b border-slate-50 bg-white">
        <div className="flex justify-between items-center mb-6">
          <div className="flex items-center gap-4">
            <div className="w-12 h-12 bg-slate-900 rounded-2xl flex items-center justify-center shadow-xl">
              {viewMode === 'DRIVER' ? <BarChart3 className="w-6 h-6 text-emerald-400" /> : <PieChartIcon className="w-6 h-6 text-amber-400" />}
            </div>
            <div>
              <h2 className="text-xl font-black text-slate-800 italic uppercase tracking-tighter">
                {viewMode === 'DRIVER' ? '人力调度效能看板' : '资产战略分析中心'}
              </h2>
              <div className="flex items-center gap-2 mt-0.5">
                 <button 
                    onClick={() => setViewMode('DRIVER')}
                    className={`px-2 py-0.5 rounded text-[8px] font-black uppercase tracking-widest transition-all ${viewMode === 'DRIVER' ? 'bg-indigo-600 text-white' : 'bg-slate-100 text-slate-400 hover:bg-slate-200'}`}
                 >
                   人力视图
                 </button>
                 <button 
                    onClick={() => setViewMode('ASSET')}
                    className={`px-2 py-0.5 rounded text-[8px] font-black uppercase tracking-widest transition-all ${viewMode === 'ASSET' ? 'bg-amber-500 text-white' : 'bg-slate-100 text-slate-400 hover:bg-slate-200'}`}
                 >
                   资产视图
                 </button>
              </div>
            </div>
          </div>
          
          <div className="text-right">
             <div className="text-[10px] font-black text-slate-400 uppercase tracking-widest">
                当前统计范围
             </div>
             <div className="text-lg font-black text-slate-800 italic font-mono">
                {isSingle ? selectedDate : `${startDate} → ${endDate}`}
             </div>
          </div>
        </div>

        {/* 核心交互区域：双日期选择模块 */}
        <div className="flex gap-4 p-2 bg-slate-50 rounded-[32px] border border-slate-100">
           
           {/* 模块 A: 单日选择器 */}
           <div 
             onMouseEnter={() => setFilterMode('SINGLE')}
             onClick={() => setFilterMode('SINGLE')}
             className={`flex-1 p-4 rounded-[24px] border transition-all duration-300 cursor-pointer flex flex-col items-center justify-center gap-2 group ${
               isSingle 
                ? 'bg-slate-900 border-slate-800 shadow-2xl scale-[1.02] z-10' 
                : 'bg-white border-slate-100 opacity-60 blur-[1px] grayscale-[0.5] hover:opacity-100 hover:blur-0 hover:grayscale-0'
             }`}
           >
              <div className={`text-[9px] font-black uppercase tracking-[0.2em] mb-1 ${isSingle ? 'text-indigo-400' : 'text-slate-400'}`}>
                 <div className="flex items-center gap-2"><CalendarCheck className="w-3 h-3" /> 单日数据检视</div>
              </div>
              <div className={`relative px-4 py-2 rounded-xl flex items-center gap-3 border ${isSingle ? 'bg-white/10 border-white/10' : 'bg-slate-50 border-slate-100'}`}>
                 <input 
                   type="date" 
                   value={selectedDate} 
                   onChange={(e) => { 
                     if(onDateChange) onDateChange(e.target.value); 
                     setFilterMode('SINGLE'); 
                   }} 
                   className={`bg-transparent text-sm font-black outline-none uppercase cursor-pointer ${isSingle ? 'text-white' : 'text-slate-700'}`}
                 />
              </div>
           </div>

           {/* 模块 B: 区间选择器 */}
           <div 
             onMouseEnter={() => setFilterMode('RANGE')}
             onClick={() => setFilterMode('RANGE')}
             className={`flex-1 p-4 rounded-[24px] border transition-all duration-300 cursor-pointer flex flex-col items-center justify-center gap-2 group ${
               isRange 
                ? 'bg-slate-900 border-slate-800 shadow-2xl scale-[1.02] z-10' 
                : 'bg-white border-slate-100 opacity-60 blur-[1px] grayscale-[0.5] hover:opacity-100 hover:blur-0 hover:grayscale-0'
             }`}
           >
              <div className={`text-[9px] font-black uppercase tracking-[0.2em] mb-1 ${isRange ? 'text-amber-400' : 'text-slate-400'}`}>
                 <div className="flex items-center gap-2"><CalendarRange className="w-3 h-3" /> 战略周期分析</div>
              </div>
              <div className={`relative px-4 py-2 rounded-xl flex items-center gap-2 border ${isRange ? 'bg-white/10 border-white/10' : 'bg-slate-50 border-slate-100'}`}>
                 <input 
                   type="date" 
                   value={startDate} 
                   onChange={(e) => { setStartDate(e.target.value); setFilterMode('RANGE'); }} 
                   className={`bg-transparent text-[10px] font-black outline-none uppercase cursor-pointer w-24 ${isRange ? 'text-white' : 'text-slate-700'}`}
                 />
                 <span className={isRange ? 'text-slate-500' : 'text-slate-300'}>-</span>
                 <input 
                   type="date" 
                   value={endDate} 
                   onChange={(e) => { setEndDate(e.target.value); setFilterMode('RANGE'); }} 
                   className={`bg-transparent text-[10px] font-black outline-none uppercase cursor-pointer w-24 ${isRange ? 'text-white' : 'text-slate-700'}`}
                 />
              </div>
           </div>

        </div>
      </div>

      <div className="flex-1 p-10 flex flex-col gap-10 overflow-hidden bg-slate-50/20">
        
        {!hasData ? (
           <div className="h-full flex flex-col items-center justify-center opacity-40">
              <SearchX className="w-16 h-16 text-slate-400 mb-4" />
              <p className="text-sm font-black text-slate-500 uppercase tracking-widest">该周期内暂无任务数据</p>
              <p className="text-[10px] text-slate-400 mt-2">请尝试切换日期范围或创建新任务</p>
           </div>
        ) : (
           <>
              {viewMode === 'DRIVER' ? (
                /* ============ DRIVER VIEW ============ */
                <>
                  <div className="flex-[1.2] min-h-[350px] bg-white rounded-[40px] p-8 border border-slate-100 shadow-sm relative overflow-hidden group">
                     <div className="absolute top-6 right-8 text-[9px] font-black text-slate-300 uppercase tracking-widest group-hover:text-indigo-400 transition-colors">
                       {filterMode === 'SINGLE' ? selectedDate : `${startDate} - ${endDate}`} 效能对比图
                     </div>
                     <ResponsiveContainer width="100%" height="100%">
                      <BarChart data={driverReportData} margin={{ top: 20, right: 10, left: 0, bottom: 0 }}>
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
                          {driverReportData.map((entry, index) => (
                            <Cell key={`cell-${index}`} fill={index < 3 ? '#4F46E5' : '#CBD5E1'} />
                          ))}
                        </Bar>
                      </BarChart>
                    </ResponsiveContainer>
                  </div>

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
                        {driverReportData.slice(0, 10).map((data, idx) => (
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
                </>
              ) : (
                /* ============ ASSET VIEW ============ */
                <div className="flex flex-col md:flex-row gap-8 h-full">
                  {/* 左侧：饼图分析 */}
                  <div className="flex-1 bg-white rounded-[40px] p-8 border border-slate-100 shadow-sm flex flex-col items-center justify-center relative">
                     <h3 className="absolute top-6 left-8 text-sm font-black text-slate-800 uppercase italic">车型需求占比</h3>
                     {assetTypeData.length > 0 ? (
                       <ResponsiveContainer width="100%" height={300}>
                         <PieChart>
                           <Pie
                             data={assetTypeData}
                             cx="50%"
                             cy="50%"
                             innerRadius={60}
                             outerRadius={100}
                             fill="#8884d8"
                             paddingAngle={5}
                             dataKey="value"
                           >
                             {assetTypeData.map((entry, index) => (
                               <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                             ))}
                           </Pie>
                           <Tooltip content={<CustomTooltip />} />
                           <Legend 
                              verticalAlign="bottom" 
                              height={36} 
                              iconType="circle"
                              formatter={(value, entry: any) => <span className="text-[10px] font-black uppercase text-slate-500 ml-1">{value} ({entry.payload.value})</span>}
                           />
                         </PieChart>
                       </ResponsiveContainer>
                     ) : (
                       <div className="text-slate-300 font-black uppercase text-xs">暂无数据</div>
                     )}
                  </div>

                  {/* 右侧：采购建议/决策辅助 */}
                  <div className="flex-1 space-y-4">
                     <div className="bg-slate-900 text-white p-8 rounded-[40px] shadow-xl">
                        <h3 className="text-xl font-black italic uppercase mb-4">决策辅助建议</h3>
                        <p className="text-xs text-slate-400 leading-relaxed mb-6">
                          基于当前选定周期内的任务快照分析。高频使用的车型代表市场真实需求，建议作为明年采购或租赁的重点。
                        </p>
                        
                        <div className="space-y-4">
                           {assetTypeData.slice(0, 3).map((item, index) => (
                             <div key={item.name} className="flex items-center justify-between p-4 bg-white/10 rounded-2xl border border-white/5">
                                <div className="flex items-center gap-3">
                                   <div className="w-8 h-8 rounded-xl bg-white/10 flex items-center justify-center font-black text-xs">
                                     {index + 1}
                                   </div>
                                   <div>
                                      <div className="text-xs font-black uppercase">{item.name}</div>
                                      <div className="text-[9px] text-slate-400 font-bold uppercase tracking-wider">Top Demand</div>
                                   </div>
                                </div>
                                <div className="text-right">
                                   <div className="text-lg font-black">{item.value} 单</div>
                                   <div className="text-[9px] text-emerald-400 font-black uppercase">需重点保障</div>
                                </div>
                             </div>
                           ))}
                        </div>
                     </div>
                  </div>
                </div>
              )}
           </>
        )}

      </div>
      
      <div className="px-10 py-4 bg-white border-t border-slate-100 flex justify-between items-center">
        <div className="flex items-center gap-3">
          <div className="flex -space-x-2">
             {[1,2,3].map(i => <div key={i} className="w-5 h-5 rounded-full border-2 border-white bg-slate-200" />)}
          </div>
          <span className="text-[9px] font-black text-slate-400 uppercase tracking-widest">
            {filterMode === 'SINGLE' ? `当前单日 (${selectedDate})` : `当前区间 (${startDate} - ${endDate})`} 已记录 {filteredTasks.length} 次有效指派
          </span>
        </div>
        <div className="text-[9px] font-black text-indigo-300 uppercase tracking-[0.3em] italic">
          MULTI-DIMENSION STRATEGY V6.0
        </div>
      </div>
    </div>
  );
};

export default PerformanceReport;
