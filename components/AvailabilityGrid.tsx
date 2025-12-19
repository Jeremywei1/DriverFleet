
import React from 'react';
import { Driver, DriverSchedule, DriverStatus } from '../types';
import { Clock } from 'lucide-react';

interface Props {
  drivers: Driver[];
  schedule: DriverSchedule[];
}

const AvailabilityGrid: React.FC<Props> = ({ drivers, schedule }) => {
  
  const getStatusStyle = (status: DriverStatus) => {
    switch (status) {
      case DriverStatus.BUSY: 
        return 'bg-rose-300 border-rose-400 shadow-[inset_0_-2px_0_rgba(0,0,0,0.1)]';
      case DriverStatus.FREE: 
        return 'bg-sky-100 border-sky-200 shadow-[inset_0_-2px_0_rgba(0,0,0,0.05)]';
      case DriverStatus.BREAK: 
        return 'bg-amber-200 border-amber-300 shadow-[inset_0_-2px_0_rgba(0,0,0,0.1)]';
      case DriverStatus.OFF_DUTY: 
        return 'bg-slate-100 border-slate-200 opacity-60';
      default: 
        return 'bg-gray-100';
    }
  };

  const hours = Array.from({ length: 24 }, (_, i) => i);

  return (
    <div className="bg-white rounded-3xl shadow-sm border border-slate-100 overflow-hidden flex flex-col h-full">
      <div className="p-5 border-b border-slate-100 flex justify-between items-center bg-slate-50/50">
        <h2 className="text-lg font-bold text-slate-800 flex items-center gap-2">
          <Clock className="w-6 h-6 text-indigo-500 fill-indigo-100" />
          实时运力监控
        </h2>
        <div className="flex gap-4 text-xs font-bold text-slate-500 uppercase tracking-wide">
          <div className="flex items-center gap-2">
            <div className="w-4 h-4 bg-sky-100 border border-sky-200 rounded-md shadow-sm"></div> 空闲
          </div>
          <div className="flex items-center gap-2">
            <div className="w-4 h-4 bg-rose-300 border border-rose-400 rounded-md shadow-sm"></div> 忙碌
          </div>
        </div>
      </div>

      <div className="overflow-x-auto flex-1 custom-scrollbar">
        <div className="min-w-[1000px] p-5">
          <div className="flex mb-3">
            <div className="w-48 flex-shrink-0 font-bold text-slate-400 text-xs uppercase tracking-wider pl-2">司机团队</div>
            <div className="flex-1 grid grid-cols-24 gap-1">
              {hours.map(h => (
                <div key={h} className="text-center text-xs font-bold text-slate-400 font-mono">
                  {h}
                </div>
              ))}
            </div>
          </div>

          <div className="space-y-4">
            {drivers.map(driver => {
              const driverSched = schedule.find(s => s.driverId === driver.id);
              
              return (
                <div key={driver.id} className="flex items-center group">
                  <div className="w-48 flex-shrink-0 flex items-center gap-3 pr-4">
                    <img src={driver.avatar} alt={driver.name} className="w-11 h-11 rounded-2xl border-2 border-white shadow-md object-cover" />
                    <div>
                      <p className="font-bold text-slate-700 text-sm leading-tight">{driver.name}</p>
                      <p className="text-[10px] text-slate-400 font-medium">{driver.plateNumber}</p>
                    </div>
                  </div>
                  
                  <div className="flex-1 grid grid-cols-24 gap-1 bg-slate-50/50 rounded-xl p-1.5 border border-slate-100/80">
                    {driverSched?.slots.map((slot) => (
                      <div
                        key={slot.hour}
                        title={`${driver.name} - ${slot.hour}点`}
                        className={`h-9 rounded-md transition-all duration-200 border-b-2 ${getStatusStyle(slot.status)}`}
                      >
                      </div>
                    ))}
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      </div>
    </div>
  );
};

export default AvailabilityGrid;
