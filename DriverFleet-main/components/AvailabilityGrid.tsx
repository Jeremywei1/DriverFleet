
import React, { useState, useEffect, useMemo } from 'react';
import { Driver, Task, Vehicle, DriverStatus } from '../types';
import { Clock } from 'lucide-react';

interface Props {
  mode: 'driver' | 'vehicle';
  drivers?: Driver[];
  vehicles?: Vehicle[];
  tasks?: Task[];
  selectedDate?: string;
}

const AvailabilityGrid: React.FC<Props> = ({ 
  mode, 
  drivers, 
  vehicles,
  tasks = [],
  selectedDate,
}) => {
  const [now, setNow] = useState(new Date());

  useEffect(() => {
    const timer = setInterval(() => setNow(new Date()), 60000);
    return () => clearInterval(timer);
  }, []);

  const timeLinePosition = useMemo(() => {
    const hours = now.getHours();
    const minutes = now.getMinutes();
    return ((hours + minutes / 60) / 24) * 100;
  }, [now]);

  // 动态计算资源在特定时刻的状态
  const getResourceStatusAt = (resource: Driver | Vehicle, hourIdx: number): 'BUSY' | 'FREE' | 'INACTIVE' => {
    // Fixed typo: Use 'INACTIVE' to match the function return type definition
    if (!resource.isActive) return 'INACTIVE';

    const timeInHours = hourIdx / 2;
    const isBusy = tasks.some(task => {
      const taskResId = mode === 'driver' ? task.driverId : task.vehicleId;
      if (taskResId !== resource.id || task.status === 'CANCELLED') return false;
      
      const start = new Date(task.startTime);
      const end = new Date(task.endTime);
      const taskStartHour = start.getHours() + start.getMinutes() / 60;
      const taskEndHour = end.getHours() + end.getMinutes() / 60;
      
      return timeInHours >= taskStartHour && timeInHours < taskEndHour;
    });

    return isBusy ? 'BUSY' : 'FREE';
  };

  const hours24 = Array.from({ length: 24 }, (_, i) => i);

  const resources = mode === 'driver' ? drivers : vehicles;

  return (
    <div className="bg-white rounded-[48px] flex flex-col h-full relative overflow-hidden">
      <div className="p-8 border-b border-slate-50 flex justify-between items-center">
        <h2 className="text-xl font-black text-slate-800 flex items-center gap-3 italic uppercase">
          <Clock className="w-5 h-5 text-indigo-600" />
          {mode === 'driver' ? '全域运力负载轴' : '资产实时占用矩阵'}
        </h2>
        <div className="flex items-center gap-6">
          <div className="flex items-center gap-1.5">
             <div className="w-3 h-3 rounded-full bg-emerald-500"></div>
             <span className="text-[10px] font-black text-slate-400 uppercase tracking-widest">可用</span>
          </div>
          <div className="flex items-center gap-1.5">
             <div className="w-3 h-3 rounded-full bg-rose-500"></div>
             <span className="text-[10px] font-black text-slate-400 uppercase tracking-widest">占用</span>
          </div>
          <div className="flex items-center gap-1.5">
             <div className="w-3 h-3 rounded-full bg-slate-300"></div>
             <span className="text-[10px] font-black text-slate-400 uppercase tracking-widest">停运/休假</span>
          </div>
        </div>
      </div>

      <div className="overflow-auto flex-1 scrollbar-hide relative">
        <div className="min-w-[1200px] p-8">
          <div className="sticky top-0 z-30 bg-white/95 backdrop-blur-sm flex border-b border-slate-50 mb-6 pb-2">
            <div className="w-48 flex-shrink-0 text-[10px] font-black text-slate-300 uppercase tracking-[0.2em]">资源名称</div>
            <div className="flex-1 grid grid-cols-24">
              {hours24.map(h => (
                <div key={h} className="text-center text-[10px] font-black text-slate-400">{h}h</div>
              ))}
            </div>
          </div>

          <div className="relative space-y-4">
            {/* 时间指示线 */}
            <div className="absolute top-0 bottom-0 z-20 pointer-events-none" style={{ left: `calc(12rem + (100% - 12rem) * ${timeLinePosition / 100})` }}>
               <div className="w-0.5 h-full bg-indigo-500 opacity-30 shadow-[0_0_10px_indigo]"></div>
            </div>

            {resources?.map(item => (
              <div key={item.id} className={`flex items-center group transition-opacity ${!item.isActive ? 'opacity-40' : ''}`}>
                <div className="w-48 flex-shrink-0 flex flex-col">
                  <span className="font-black text-slate-700 text-sm italic uppercase truncate">{mode === 'driver' ? (item as Driver).name : (item as Vehicle).plateNumber}</span>
                  {!item.isActive && <span className="text-[8px] text-rose-500 font-black uppercase tracking-widest">停运中</span>}
                </div>
                <div className="flex-1 grid grid-cols-24 gap-1 h-8">
                  {hours24.map(h => (
                    <div key={h} className="grid grid-cols-2 gap-0.5">
                       {[0, 1].map(half => {
                         const status = getResourceStatusAt(item, h * 2 + half);
                         return (
                           <div key={half} className={`rounded-sm transition-all duration-300 ${
                             status === 'BUSY' ? 'bg-rose-500' : 
                             // Fixed typo: Change 'IN_ACTIVE' to 'INACTIVE' to match logic
                             status === 'INACTIVE' ? 'bg-slate-200' : 'bg-emerald-500/10 border border-emerald-500/10'
                           }`}></div>
                         );
                       })}
                    </div>
                  ))}
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
};

export default AvailabilityGrid;
