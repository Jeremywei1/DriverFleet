
import React from 'react';
import { DriverStats } from '../types';
import { calculateBonus } from '../services/bonusService';
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, Cell } from 'recharts';
import { BarChart3, TrendingUp, Wallet } from 'lucide-react';

interface Props {
  stats: DriverStats[];
}

const PerformanceReport: React.FC<Props> = ({ stats }) => {
  const sortedStats = [...stats].sort((a, b) => b.completedOrders - a.completedOrders);

  const CustomTooltip = ({ active, payload, label }: any) => {
    if (active && payload && payload.length) {
      return (
        <div className="bg-white p-3 border border-slate-100 shadow-xl rounded-lg">
          <p className="font-bold text-slate-800 mb-1">{label}</p>
          <p className="text-indigo-600 text-sm">订单: {payload[0].value}</p>
          <p className="text-emerald-600 text-xs font-bold">预估奖金: ¥{calculateBonus(payload[0].payload).totalBonus}</p>
        </div>
      );
    }
    return null;
  };

  return (
    <div className="bg-white rounded-2xl shadow-sm border border-slate-100 flex flex-col h-full overflow-hidden">
      <div className="p-4 border-b border-slate-100 flex justify-between items-center bg-slate-50">
        <h2 className="text-lg font-bold text-slate-800 flex items-center gap-2">
          <BarChart3 className="w-5 h-5 text-indigo-600" />
          车队绩效与奖金核算
        </h2>
        <div className="flex items-center gap-2 text-sm text-emerald-600 font-bold">
           <Wallet className="w-4 h-4" />
           <span>奖金激励模式已激活</span>
        </div>
      </div>

      <div className="flex-1 p-4 flex flex-col lg:flex-row gap-6 overflow-hidden">
        <div className="flex-[1.5] min-h-[300px]">
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

        <div className="flex-1 overflow-x-auto">
          <table className="w-full text-sm text-left text-slate-600">
            <thead className="text-xs text-slate-400 uppercase bg-slate-50 border-b border-slate-100">
              <tr>
                <th className="px-4 py-3">司机</th>
                <th className="px-4 py-3 text-right">订单</th>
                <th className="px-4 py-3 text-right">预估奖金</th>
                <th className="px-4 py-3 text-right">效率</th>
              </tr>
            </thead>
            <tbody>
              {sortedStats.map((stat) => {
                const bonus = calculateBonus(stat);
                return (
                  <tr key={stat.driverId} className="border-b border-slate-50 hover:bg-slate-50 transition-colors">
                    <td className="px-4 py-3 font-medium text-slate-800">{stat.name}</td>
                    <td className="px-4 py-3 text-right font-bold">{stat.completedOrders}</td>
                    <td className="px-4 py-3 text-right">
                       <span className="text-emerald-600 font-black">¥{bonus.totalBonus}</span>
                    </td>
                    <td className="px-4 py-3 text-right">
                      <span className={`px-2 py-1 rounded-full text-[10px] font-black ${stat.efficiencyScore >= 90 ? 'bg-emerald-100 text-emerald-700' : 'bg-slate-100 text-slate-400'}`}>
                        {stat.efficiencyScore}
                      </span>
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
};

export default PerformanceReport;
