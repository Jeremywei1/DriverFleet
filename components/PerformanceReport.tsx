
import React, { useMemo } from 'react';
import { DriverStats, Task } from '../types';
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, Cell } from 'recharts';
import { BarChart3, TrendingUp, Calendar } from 'lucide-react';

interface Props {
  stats: DriverStats[];
  tasks: Task[];
}

const PerformanceReport: React.FC<Props> = ({ stats, tasks }) => {
  // 核心逻辑调整：任务布置即为完成，计算每个司机的总指派单量（剔除已取消单量）
  const reportData = useMemo(() => {
    return stats.map(driver => {
      // 获取该司机所有非取消状态的任务
      const assignedTasks = tasks.filter(t => t.driverId === driver.driverId && t.status !== 'CANCELLED');
      const totalCount = assignedTasks.length;
      
      return {
        name: driver.name,
        completedCount: totalCount, // 此时完成单量直接等于创建/指派单量
        totalCount: totalCount,
        efficiencyScore: driver.efficiencyScore
      };
    }).sort((a, b) => b.completedCount - a.completedCount);
  }, [stats, tasks]);

  const CustomTooltip = ({ active, payload, label }: any) => {
    if (active && payload && payload.length) {
      return (
        <div className="bg-white p-4 border border-slate-100 shadow-2xl rounded-2xl">
          <p className="font-black text-slate-800 mb-2 italic uppercase tracking-tight">{label}</p>
          <div className="flex items-center gap-2">
            <div className="w-2 h-2 bg-indigo-500 rounded-full"></div>
            <p className="text-indigo-600 text-xs font-black uppercase">调度执行数: {payload[0].value} 单</p>
          </div>
          <p className="text-slate-400 text-[9px] font-bold mt-1 uppercase tracking-widest">指派即计入效能统计</p>
        </div>
      );
    }
    return null;
  };

  return (
    <div className="bg-white rounded-[48px] shadow-sm border border-slate-100 flex flex-col h-full overflow-hidden animate-in fade-in duration-700">
      <div className="p-8 border-b border-slate-50 flex justify-between items-center bg-white">
        <div className="flex items-center gap-4">
          <div className="w-12 h-12 bg-slate-900 rounded-2xl flex items-center justify-center shadow-xl">
            <BarChart3 className="w-6 h-6 text-emerald-400" />
          </div>
          <div>
            <h2 className="text-xl font-black text-slate-800 italic uppercase tracking-tighter">
              司机调度效能看板
            </h2>
            <p className="text-[9px] font-black text-slate-400 uppercase tracking-widest mt-0.5">
              任务指派即计入完成度 · 实时核算 D1
            </p>
          </div>
        </div>
        <div className="flex items-center gap-2 text-[10px] font-black text-slate-400 uppercase tracking-widest bg-slate-50 px-4 py-2 rounded-xl border border-slate-100">
           <Calendar className="w-4 h-4 text-indigo-500" />
           <span>统计窗口: {new Date().toLocaleDateString()}</span>
        </div>
      </div>

      <div className="flex-1 p-10 flex flex-col gap-10 overflow-hidden">
        {/* 核心柱状图 */}
        <div className="flex-[1.2] min-h-[350px] bg-slate-50/50 rounded-[40px] p-8 border border-slate-100 shadow-inner">
           <ResponsiveContainer width="100%" height="100%">
            <BarChart data={reportData} margin={{ top: 10, right: 10, left: 0, bottom: 0 }}>
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
              <Tooltip content={<CustomTooltip />} cursor={{fill: 'rgba(99, 102, 241, 0.04)'}} />
              <Bar dataKey="completedCount" radius={[12, 12, 0, 0]} barSize={48}>
                {reportData.map((entry, index) => (
                  <Cell key={`cell-${index}`} fill={index < 3 ? '#4F46E5' : '#E2E8F0'} />
                ))}
              </Bar>
            </BarChart>
          </ResponsiveContainer>
        </div>

        {/* 详细列表表格 */}
        <div className="flex-1 overflow-x-auto">
          <table className="w-full text-sm text-left text-slate-600">
            <thead className="text-[10px] text-slate-400 uppercase font-black tracking-widest bg-slate-50/80 border-b border-slate-100">
              <tr>
                <th className="px-6 py-4">司机标识</th>
                <th className="px-6 py-4 text-center">已调度执行 (单)</th>
                <th className="px-6 py-4 text-center">任务饱和度</th>
                <th className="px-6 py-4 text-right">效率 SC</th>
              </tr>
            </thead>
            <tbody>
              {reportData.map((data, idx) => (
                <tr key={idx} className="border-b border-slate-50 hover:bg-slate-50/80 transition-all group">
                  <td className="px-6 py-5 font-black text-slate-800 italic uppercase tracking-tight group-hover:text-indigo-600">
                    {data.name}
                  </td>
                  <td className="px-6 py-5 text-center font-black text-indigo-600 text-lg">
                    {data.completedCount}
                  </td>
                  <td className="px-6 py-5">
                    <div className="flex items-center gap-4">
                      <div className="flex-1 h-2 bg-slate-100 rounded-full overflow-hidden">
                        <div 
                          className="h-full bg-gradient-to-r from-indigo-500 to-emerald-400 rounded-full transition-all duration-1000" 
                          style={{ width: `${Math.min(100, (data.completedCount / 8) * 100)}%` }}
                        ></div>
                      </div>
                      <span className="text-[10px] font-black text-slate-400 w-8">
                        {Math.min(100, Math.round((data.completedCount / 8) * 100))}%
                      </span>
                    </div>
                  </td>
                  <td className="px-6 py-5 text-right">
                    <span className={`px-3 py-1 rounded-lg text-[10px] font-black border ${data.efficiencyScore >= 90 ? 'bg-emerald-50 text-emerald-600 border-emerald-100' : 'bg-slate-100 text-slate-400 border-slate-200'}`}>
                      {data.efficiencyScore}
                    </span>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
      
      <div className="px-10 py-4 bg-slate-50 border-t border-slate-100 flex justify-between items-center">
        <div className="flex items-center gap-2">
          <div className="w-2 h-2 bg-emerald-500 rounded-full animate-pulse"></div>
          <span className="text-[9px] font-black text-slate-400 uppercase tracking-widest">
            当前计算模型：调度即完成 (Assigned-as-Done)
          </span>
        </div>
        <div className="text-[9px] font-black text-slate-300 uppercase tracking-[0.2em]">
          DATA ANALYTICS ENGINE V4.0
        </div>
      </div>
    </div>
  );
};

export default PerformanceReport;
