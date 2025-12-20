import React, { useState } from 'react';
import { Driver, DriverStatus, Vehicle } from '../types';
import { Map, Navigation, Car, Truck, Zap, User, Radio } from 'lucide-react';

interface Props {
  drivers: Driver[];
  vehicles: Vehicle[];
}

const LiveMap: React.FC<Props> = ({ drivers, vehicles }) => {
  const [selectedDriver, setSelectedDriver] = useState<Driver | null>(null);
  const [filter, setFilter] = useState<'ALL' | 'FREE' | 'BUSY'>('ALL');

  // Find the vehicle associated with the selected driver for details panel
  const selectedVehicle = selectedDriver 
    ? vehicles.find(v => v.currentDriverId === selectedDriver.id) 
    : null;

  const filteredDrivers = drivers.filter(d => {
    if (filter === 'ALL') return true;
    return d.currentStatus === filter;
  });

  const getStatusColor = (status: DriverStatus) => {
    switch (status) {
      case DriverStatus.BUSY: return 'bg-rose-500 shadow-rose-200';
      case DriverStatus.FREE: return 'bg-emerald-500 shadow-emerald-200';
      case DriverStatus.BREAK: return 'bg-amber-400 shadow-amber-200';
      default: return 'bg-slate-400';
    }
  };

  return (
    <div className="flex h-full gap-6">
      {/* Map Area */}
      <div className="flex-1 bg-slate-100 rounded-3xl relative overflow-hidden border border-slate-200 shadow-inner group">
        
        {/* Map Background Pattern (Simulated City Grid) */}
        <div className="absolute inset-0 opacity-10 pointer-events-none" 
             style={{
                 backgroundImage: 'linear-gradient(#94a3b8 1px, transparent 1px), linear-gradient(90deg, #94a3b8 1px, transparent 1px)',
                 backgroundSize: '40px 40px'
             }}>
        </div>
        
        {/* Decorative Map Elements */}
        <div className="absolute top-10 left-10 w-32 h-32 bg-blue-200/20 rounded-full blur-xl"></div>
        <div className="absolute bottom-20 right-20 w-64 h-64 bg-indigo-200/20 rounded-full blur-3xl"></div>
        
        {/* Map Controls */}
        <div className="absolute top-4 left-4 z-10 bg-white/90 backdrop-blur-sm p-2 rounded-xl border border-slate-200 shadow-sm flex flex-col gap-2">
           <button 
             onClick={() => setFilter('ALL')}
             className={`p-2 rounded-lg text-xs font-bold transition-all ${filter === 'ALL' ? 'bg-slate-800 text-white' : 'hover:bg-slate-100 text-slate-600'}`}
           >
             全部显示
           </button>
           <button 
             onClick={() => setFilter('FREE')}
             className={`p-2 rounded-lg text-xs font-bold transition-all ${filter === 'FREE' ? 'bg-emerald-500 text-white' : 'hover:bg-emerald-50 text-emerald-600'}`}
           >
             只看空闲
           </button>
           <button 
             onClick={() => setFilter('BUSY')}
             className={`p-2 rounded-lg text-xs font-bold transition-all ${filter === 'BUSY' ? 'bg-rose-500 text-white' : 'hover:bg-rose-50 text-rose-600'}`}
           >
             只看忙碌
           </button>
        </div>

        <div className="absolute bottom-4 left-4 z-10 bg-white/80 backdrop-blur px-3 py-1.5 rounded-full border border-slate-200 text-xs font-mono text-slate-500 flex items-center gap-2">
           <Radio className="w-3 h-3 animate-pulse text-indigo-500" />
           实时数据同步中...
        </div>

        {/* Drivers on Map */}
        {filteredDrivers.map(driver => {
          // Find vehicle associated with this specific driver for icon selection
          const vehicle = vehicles.find(v => v.currentDriverId === driver.id);
          return (
            <div
              key={driver.id}
              onClick={() => setSelectedDriver(driver)}
              className="absolute transition-all duration-500 ease-in-out cursor-pointer hover:scale-125 group/marker z-20"
              style={{ left: `${driver.coordinates.x}%`, top: `${driver.coordinates.y}%` }}
            >
              {/* Pulsing Effect for Free Drivers */}
              {driver.currentStatus === DriverStatus.FREE && (
                <div className="absolute -inset-2 bg-emerald-400/30 rounded-full animate-ping"></div>
              )}
              
              {/* Driver Dot */}
              <div className={`
                w-8 h-8 rounded-full flex items-center justify-center text-white shadow-lg border-2 border-white
                ${getStatusColor(driver.currentStatus)}
                ${selectedDriver?.id === driver.id ? 'ring-4 ring-indigo-400 ring-opacity-50 scale-110' : ''}
              `}>
                 {vehicle?.type === 'Truck' ? <Truck className="w-4 h-4" /> : <Car className="w-4 h-4" />}
              </div>

              {/* Label on Hover */}
              <div className="absolute -bottom-8 left-1/2 -translate-x-1/2 bg-slate-800 text-white text-[10px] px-2 py-1 rounded shadow-lg opacity-0 group-hover/marker:opacity-100 transition-opacity whitespace-nowrap z-30">
                {driver.name} ({driver.currentStatus === 'FREE' ? '空闲' : '忙碌'})
              </div>
            </div>
          );
        })}

        {/* Emergency Dispatch Simulation (Clicking anywhere on empty map) */}
        <div className="absolute top-4 right-4 z-10">
           <div className="bg-red-50 text-red-600 border border-red-200 px-4 py-3 rounded-xl shadow-lg flex items-center gap-3">
              <div className="w-10 h-10 bg-red-100 rounded-full flex items-center justify-center animate-pulse">
                <Zap className="w-5 h-5" />
              </div>
              <div>
                 <div className="text-xs font-bold uppercase tracking-wider opacity-70">模拟紧急插单</div>
                 <div className="text-sm font-bold">上帝视角模式开启</div>
              </div>
           </div>
        </div>
      </div>

      {/* Detail Sidebar */}
      <div className={`w-80 bg-white rounded-3xl border border-slate-100 shadow-xl transition-all duration-300 overflow-hidden flex flex-col ${selectedDriver ? 'translate-x-0 opacity-100' : 'translate-x-10 opacity-50 pointer-events-none grayscale'}`}>
         {selectedDriver ? (
           <>
             <div className="relative h-32 bg-slate-800">
                <div className="absolute inset-0 bg-gradient-to-t from-slate-900 to-transparent opacity-80"></div>
                <img src={selectedDriver.avatar} alt="bg" className="w-full h-full object-cover opacity-50" />
                <div className="absolute -bottom-10 left-6">
                   <img src={selectedDriver.avatar} alt={selectedDriver.name} className="w-20 h-20 rounded-2xl border-4 border-white shadow-lg" />
                </div>
             </div>
             
             <div className="pt-12 px-6 pb-6 flex-1 flex flex-col">
                <div className="flex justify-between items-start mb-1">
                   <div>
                     <h3 className="text-xl font-bold text-slate-800">{selectedDriver.name}</h3>
                     {/* Fix: use selectedVehicle to access plateNumber and type instead of selectedDriver */}
                     <p className="text-sm text-slate-500">{selectedVehicle?.plateNumber || '无牌照'} • {selectedVehicle?.type || '未知车型'}</p>
                   </div>
                   <div className={`px-2 py-1 rounded-lg text-xs font-bold ${
                      selectedDriver.currentStatus === 'FREE' ? 'bg-emerald-100 text-emerald-700' : 'bg-rose-100 text-rose-700'
                   }`}>
                      {selectedDriver.currentStatus === 'FREE' ? '空闲中' : '服务中'}
                   </div>
                </div>

                <div className="flex items-center gap-1 mb-6">
                   {Array.from({length: 5}).map((_, i) => (
                      <span key={i} className={`text-lg ${i < Math.round(selectedDriver.rating) ? 'text-yellow-400' : 'text-slate-200'}`}>★</span>
                   ))}
                   <span className="text-xs text-slate-400 ml-2">{selectedDriver.rating.toFixed(1)}</span>
                </div>

                <div className="space-y-4">
                   <div className="bg-slate-50 p-3 rounded-xl flex items-center gap-3">
                      <Navigation className="w-5 h-5 text-indigo-500" />
                      <div>
                         <p className="text-xs text-slate-400 font-bold uppercase">当前位置</p>
                         <p className="text-sm font-medium text-slate-700">东三环中路辅路 (模拟坐标)</p>
                      </div>
                   </div>
                   
                   <div className="bg-slate-50 p-3 rounded-xl flex items-center gap-3">
                      <User className="w-5 h-5 text-indigo-500" />
                      <div>
                         <p className="text-xs text-slate-400 font-bold uppercase">今日状态</p>
                         <p className="text-sm font-medium text-slate-700">在线 6.5 小时 • 完成 8 单</p>
                      </div>
                   </div>
                </div>

                <div className="mt-auto pt-6">
                   <button className="w-full bg-slate-900 text-white py-3 rounded-xl font-bold shadow-lg hover:bg-slate-800 transition-colors flex items-center justify-center gap-2">
                      <Zap className="w-4 h-4 text-yellow-400" />
                      即刻指派任务
                   </button>
                </div>
             </div>
           </>
         ) : (
           <div className="h-full flex flex-col items-center justify-center text-center p-8 text-slate-400">
              <Map className="w-12 h-12 mb-4 text-slate-200" />
              <p>请在地图上点击车辆图标<br/>查看司机实时详情</p>
           </div>
         )}
      </div>
    </div>
  );
};

export default LiveMap;