import React from 'react';
import { DriverStats } from '../types';
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, Cell } from 'recharts';
import { BarChart3, TrendingUp } from 'lucide-react';

interface Props {
  stats: DriverStats[];
}

const PerformanceReport: React.FC<Props> = ({ stats }) => {
  // Sort by efficiency for the chart
  const sortedStats = [...stats].sort((a, b) => b.completedOrders - a.completedOrders);

  const CustomTooltip = ({ active, payload, label }: any) => {
    if (active && payload && payload.length) {
      return (
        <div className="bg-white p-3 border border-slate-100 shadow-xl rounded-lg">
          <p className="font-bold text-slate-800 mb-1">{label}</p>
          <p className="text-indigo-600 text-sm">订单: {payload[0].value}</p>
          <p className="text-slate-500 text-xs">里程: {payload[0].payload.totalDistance} 公里</p>
          <p className="text-slate-500 text-xs">时长: {payload[0].payload.totalHours} 小时</p>
        </div>
      );
    }
    return null;
  };

  return (
    <div className="bg-white rounded-2xl shadow-sm border border-slate-100 flex flex-col h-full">
      <div className="p-4 border-b border-slate-100 flex justify-between items-center bg-slate-50">
        <h2 className="text-lg font-bold text-slate-800 flex items-center gap-2">
          <BarChart3 className="w-5 h-5 text-indigo-600" />
          车队绩效 (月度)
        </h2>
        <div className="flex items-center gap-2 text-sm text-slate-500">
           <TrendingUp className="w-4 h-4" />
           <span>优秀标兵</span>
        </div>
      </div>

      <div className="flex-1 p-4 flex flex-col lg:flex-row gap-6">
        {/* Chart Section */}
        <div className="flex-1 min-h-[300px]">
           <ResponsiveContainer width="100%" height="100%">
            <BarChart data={sortedStats} layout="vertical" margin={{ top: 5, right: 30, left: 40, bottom: 5 }}>
              <CartesianGrid strokeDasharray="3 3" horizontal={false} stroke="#f1f5f9" />
              <XAxis type="number" hide />
              <YAxis 
                type="category" 
                dataKey="name" 
                tick={{ fontSize: 12, fill: '#64748b' }} 
                width={80}
              />
              <Tooltip content={<CustomTooltip />} cursor={{fill: '#f8fafc'}} />
              <Bar dataKey="completedOrders" radius={[0, 4, 4, 0]} barSize={20}>
                {sortedStats.map((entry, index) => (
                  <Cell key={`cell-${index}`} fill={index < 3 ? '#6366f1' : '#cbd5e1'} />
                ))}
              </Bar>
            </BarChart>
          </ResponsiveContainer>
        </div>

        {/* Detailed Table Section */}
        <div className="flex-1 overflow-x-auto">
          <table className="w-full text-sm text-left text-slate-600">
            <thead className="text-xs text-slate-400 uppercase bg-slate-50 border-b border-slate-100">
              <tr>
                <th className="px-4 py-3">司机</th>
                <th className="px-4 py-3 text-right">订单数</th>
                <th className="px-4 py-3 text-right">里程 (km)</th>
                <th className="px-4 py-3 text-right">效率分</th>
              </tr>
            </thead>
            <tbody>
              {sortedStats.map((stat) => (
                <tr key={stat.driverId} className="border-b border-slate-50 hover:bg-slate-50 transition-colors">
                  <td className="px-4 py-3 font-medium text-slate-800">{stat.name}</td>
                  <td className="px-4 py-3 text-right">{stat.completedOrders}</td>
                  <td className="px-4 py-3 text-right">{stat.totalDistance.toLocaleString()}</td>
                  <td className="px-4 py-3 text-right">
                    <span className={`
                      px-2 py-1 rounded-full text-xs font-bold
                      ${stat.efficiencyScore >= 90 ? 'bg-emerald-100 text-emerald-700' : 
                        stat.efficiencyScore >= 80 ? 'bg-blue-100 text-blue-700' : 
                        'bg-amber-100 text-amber-700'}
                    `}>
                      {stat.efficiencyScore}
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