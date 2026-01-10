
import React, { useMemo } from 'react';
import { DriverStats, Task } from '../types';
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, Cell } from 'recharts';
import { BarChart3, TrendingUp, Calendar } from 'lucide-react';

interface Props {
  stats: DriverStats[];
  tasks: Task[];
}

const PerformanceReport: React.FC<Props> = ({ stats, tasks }) => {
  // 计算每个司机的实际任务数，确保与数据库一致
  const reportData = useMemo(() => {
    return stats.map(driver => {
      const actualCompleted = tasks.filter(t => t.driverId === driver.driverId && t.status === 'COMPLETED').length;
      const totalAssigned = tasks.filter(t => t.driverId === driver.driverId).length;
      return {
        name: driver.name,
        completedCount: actualCompleted,
        totalCount: totalAssigned,
        efficiencyScore: driver.efficiencyScore
      };
    }).sort((a, b) => b.completedCount - a.completedCount);
  }, [stats, tasks]);

  const CustomTooltip = ({ active, payload, label }: any) => {
    if (active && payload && payload.length) {
      return (
        <div className="bg-white p-3 border border-slate-100 shadow-xl rounded-lg">
          <p className="font-bold text-slate-800 mb-1">{label}</p>
          <p className="text-indigo-600 text-sm">已完成任务: {payload[0].value}</p>
          <p className="text-slate-400 text-xs">总指派: {payload[0].payload.totalCount}</p>
        </div>
      );
    }
    return null;
  };

  return (
    <div className="bg-white rounded-[48px] shadow-sm border border-slate-100 flex flex-col h-full overflow-hidden animate-in fade-in duration-700">
      <div className="p-8 border-b border-slate-50 flex justify-between items-center bg-white">
        <h2 className="text-xl font-black text-slate-800 flex items-center gap-3 italic uppercase">
          <div className="w-10 h-10 bg-indigo-50 rounded-2xl flex items-center justify-center">
            <BarChart3 className="w-5 h-5 text-indigo-600" />
          </div>
          车队运力效能看板
        </h2>
        <div className="flex items-center gap-2 text-[10px] font-black text-slate-400 uppercase tracking-widest bg-slate-50 px-4 py-2 rounded-xl border border-slate-100">
           <Calendar className="w-4 h-4 text-indigo-500" />
           <span>本月统计窗口 (D1 同步)</span>
        </div>
      </div>

      <div className="flex-1 p-10 flex flex-col gap-10 overflow-hidden">
        {/* 核心柱状图 */}
        <div className="flex-[1.2] min-h-[400px] bg-slate-50/50 rounded-[40px] p-6 border border-slate-100">
           <ResponsiveContainer width="100%" height="100%">
            <BarChart data={reportData} margin={{ top: 20, right: 30, left: 40, bottom: 20 }}>
              <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#e2e8f0" />
              <XAxis dataKey="name" tick={{ fontSize: 11, fontWeight: 'bold', fill: '#94a3b8' }} axisLine={false} tickLine={false} />
              <YAxis tick={{ fontSize: 11, fontWeight: 'bold', fill: '#94a3b8' }} axisLine={false} tickLine={false} />
              <Tooltip content={<CustomTooltip />} cursor={{fill: 'rgba(99, 102, 241, 0.05)'}} />
              <Bar dataKey="completedCount" radius={[10, 10, 0, 0]} barSize={40}>
                {reportData.map((entry, index) => (
                  <Cell key={`cell-${index}`} fill={index < 3 ? '#6366f1' : '#cbd5e1'} />
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
                <th className="px-6 py-4">司机姓名</th>
                <th className="px-6 py-4 text-center">累计完成 (单)</th>
                <th className="px-6 py-4 text-center">任务饱和度</th>
                <th className="px-6 py-4 text-right">效率得分</th>
              </tr>
            </thead>
            <tbody>
              {reportData.map((data, idx) => (
                <tr key={idx} className="border-b border-slate-50 hover:bg-slate-50/50 transition-colors">
                  <td className="px-6 py-5 font-black text-slate-800 italic">{data.name}</td>
                  <td className="px-6 py-5 text-center font-black text-indigo-600 text-lg">{data.completedCount}</td>
                  <td className="px-6 py-5">
                    <div className="flex items-center gap-3">
                      <div className="flex-1 h-2 bg-slate-100 rounded-full overflow-hidden">
                        <div className="h-full bg-indigo-500 rounded-full" style={{ width: `${Math.min(100, (data.completedCount / 10) * 100)}%` }}></div>
                      </div>
                      <span className="text-[10px] font-black text-slate-400">{(data.completedCount/10*100).toFixed(0)}%</span>
                    </div>
                  </td>
                  <td className="px-6 py-5 text-right">
                    <span className={`px-3 py-1 rounded-lg text-[10px] font-black border ${data.efficiencyScore >= 90 ? 'bg-emerald-50 text-emerald-600 border-emerald-100' : 'bg-slate-100 text-slate-400 border-slate-200'}`}>
                      {data.efficiencyScore} SC
                    </span>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
};

export default PerformanceReport;
