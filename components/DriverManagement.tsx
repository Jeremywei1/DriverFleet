import React from 'react';
import { Driver, DriverStats } from '../types';
import { ShieldCheck, Map, Phone, MoreHorizontal, Mail } from 'lucide-react';

interface Props {
  drivers: Driver[];
  stats: DriverStats[];
}

const DriverManagement: React.FC<Props> = ({ drivers, stats }) => {
  return (
    <div className="h-full flex flex-col gap-6">
      <div className="flex justify-between items-center">
        <div>
          <h2 className="text-2xl font-bold text-slate-800">司机车队</h2>
          <p className="text-slate-500">管理您的 {drivers.length} 名活跃司机</p>
        </div>
        <button className="bg-indigo-600 hover:bg-indigo-700 text-white px-4 py-2 rounded-xl font-medium shadow-lg shadow-indigo-200 transition-all flex items-center gap-2">
          + 添加新司机
        </button>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-4 overflow-y-auto pb-4">
        {drivers.map(driver => {
          const driverStat = stats.find(s => s.driverId === driver.id);
          
          return (
            <div key={driver.id} className="bg-white p-5 rounded-2xl border border-slate-100 shadow-sm hover:shadow-md transition-shadow group">
              <div className="flex justify-between items-start mb-4">
                <div className="flex items-center gap-3">
                  <img src={driver.avatar} alt={driver.name} className="w-14 h-14 rounded-2xl object-cover shadow-sm" />
                  <div>
                    <h3 className="font-bold text-slate-800 text-lg">{driver.name}</h3>
                    <div className="flex items-center gap-1 text-xs font-medium text-slate-500 bg-slate-50 px-2 py-1 rounded-full">
                       <ShieldCheck className="w-3 h-3 text-emerald-500" />
                       已认证司机
                    </div>
                  </div>
                </div>
                <button className="text-slate-300 hover:text-slate-600 p-1">
                  <MoreHorizontal className="w-5 h-5" />
                </button>
              </div>

              <div className="grid grid-cols-2 gap-2 mb-4">
                 <div className="bg-slate-50 p-2 rounded-xl text-center">
                    <div className="text-xs text-slate-400 uppercase font-bold tracking-wider">完成单量</div>
                    <div className="font-bold text-slate-700 text-lg">{driverStat?.completedOrders || 0}</div>
                 </div>
                 <div className="bg-slate-50 p-2 rounded-xl text-center">
                    <div className="text-xs text-slate-400 uppercase font-bold tracking-wider">评分</div>
                    <div className="font-bold text-slate-700 text-lg flex items-center justify-center gap-1">
                      {driver.rating.toFixed(1)} <span className="text-yellow-400 text-sm">★</span>
                    </div>
                 </div>
              </div>
              
              <div className="space-y-2 mb-5">
                 <div className="flex items-center gap-3 text-sm text-slate-600">
                    <Map className="w-4 h-4 text-slate-400" />
                    <span>总里程 {driverStat?.totalDistance.toLocaleString()} 公里</span>
                 </div>
                 <div className="flex items-center gap-3 text-sm text-slate-600">
                    <Phone className="w-4 h-4 text-slate-400" />
                    <span>+86 138-0000-0000</span>
                 </div>
              </div>

              <div className="flex gap-2">
                <button className="flex-1 bg-white border border-slate-200 hover:border-indigo-300 hover:text-indigo-600 text-slate-600 py-2 rounded-xl text-sm font-bold transition-colors">
                  查看详情
                </button>
                <button className="w-10 flex items-center justify-center bg-indigo-50 hover:bg-indigo-100 text-indigo-600 rounded-xl transition-colors">
                  <Mail className="w-4 h-4" />
                </button>
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
};

export default DriverManagement;