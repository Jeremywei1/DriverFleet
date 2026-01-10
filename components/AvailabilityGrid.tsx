
import React, { useState, useEffect, useMemo } from 'react';
import { Driver, DriverStatus, Vehicle, VehicleStatus, DriverSchedule, VehicleSchedule } from '../types';
import { Clock, Car, Wrench } from 'lucide-react';

// Fixed: Added onUpdateVehicleStatus to Props to resolve TS error in App.tsx and specified VehicleSchedule type
interface Props {
  mode: 'driver' | 'vehicle';
  drivers?: Driver[];
  schedule?: DriverSchedule[];
  vehicles?: Vehicle[];
  vehicleSchedule?: VehicleSchedule[];
  selectedDate?: string;
  onUpdateVehicleStatus?: (id: string, status: VehicleStatus) => void;
}

const AvailabilityGrid: React.FC<Props> = ({ 
  mode, 
  drivers, 
  schedule, 
  vehicles, 
  vehicleSchedule, 
  selectedDate,
  onUpdateVehicleStatus
}) => {
  const [hoverState, setHoverState] = useState<{ id: string; idx: number } | null>(null);
  const [now, setNow] = useState(new Date());

  useEffect(() => {
    const timer = setInterval(() => setNow(new Date()), 60000);
    return () => clearInterval(timer);
  }, []);

  const isToday = useMemo(() => {
    if (!selectedDate) return true;
    return selectedDate === new Date().toISOString().split('T')[0];
  }, [selectedDate]);

  const timeLinePosition = useMemo(() => {
    const hours = now.getHours();
    const minutes = now.getMinutes();
    return ((hours + minutes / 60) / 24) * 100;
  }, [now]);

  const getBlock3DStyles = (status: DriverStatus) => {
    switch (status) {
      case DriverStatus.BUSY: 
        return 'bg-[#F87171] border-[#FCA5A5] shadow-[0_2px_0_0_#B91C1C]';
      case DriverStatus.FREE: 
        return 'bg-[#10B981] border-[#34D399] shadow-[0_2px_0_0_#064E3B]';
      case DriverStatus.BREAK: 
        return 'bg-[#FBBF24] border-[#FDE68A] shadow-[0_2px_0_0_#B45309]';
      case DriverStatus.OFF_DUTY: 
        return 'bg-[#E2E8F0] border-[#F1F5F9] shadow-[0_1px_0_0_#94A3B8] opacity-30';
      default: 
        return 'bg-slate-50 border-slate-100';
    }
  };

  const getVehicleBlock3D = (isAvailable: boolean, status: VehicleStatus) => {
    if (status === VehicleStatus.MAINTENANCE) return 'bg-[#FBBF24] border-[#FDE68A] shadow-[0_2px_0_0_#B45309]';
    if (status === VehicleStatus.OUT_OF_SERVICE) return 'bg-[#E2E8F0] border-[#F1F5F9] shadow-[0_1px_0_0_#94A3B8]';
    return isAvailable 
      ? 'bg-[#0EA5E9] border-[#38BDF8] shadow-[0_2px_0_0_#075985]' 
      : 'bg-[#CBD5E1] border-[#E2E8F0] shadow-[0_2px_0_0_#64748B]';
  };

  const hours24 = Array.from({ length: 24 }, (_, i) => i);

  return (
    <div className="bg-[#FFFFFF] rounded-[48px] flex flex-col h-full relative select-none overflow-hidden">
      <div className="relative z-[150] bg-white border-b border-slate-50 p-6 flex justify-between items-center shadow-sm">
        <h2 className="text-lg font-black text-slate-800 flex items-center gap-3">
          <Clock className="w-5 h-5 text-slate-400" />
          {mode === 'driver' ? '运力实时分布' : '资产状态矩阵'}
        </h2>
        <span className="text-[10px] font-black text-slate-400 uppercase tracking-widest bg-slate-50 px-3 py-1.5 rounded-xl border border-slate-100">展示模式 (只读)</span>
      </div>

      <div className="overflow-auto flex-1 scrollbar-hide relative">
        <div className="min-w-[1400px] relative p-6 pt-0 flex flex-col h-fit">
          <div className="absolute inset-y-0 left-6 right-6 pointer-events-none flex z-0">
             <div className="w-56 flex-shrink-0 border-r border-slate-100/50"></div>
             <div className="flex-1 grid grid-cols-24 gap-0">
                {hours24.map(h => <div key={h} className="border-l border-slate-200/40 border-dashed h-full"></div>)}
                <div className="border-l border-slate-200/40 border-dashed h-full"></div>
             </div>
          </div>

          <div className="sticky top-0 z-[140] bg-white/95 backdrop-blur-sm flex py-4 mb-4 border-b border-slate-100">
            <div className="w-56 flex-shrink-0 font-black text-slate-300 text-[9px] uppercase tracking-widest pl-4 pt-2">FLEET MATRIX</div>
            <div className="flex-1 grid grid-cols-24 gap-0">
              {hours24.map(h => (
                <div key={h} className="flex justify-center items-center">
                  <div className={`w-[80%] py-1.5 text-[10px] font-black rounded-lg border-2 ${h % 2 === 0 ? 'bg-slate-50 border-slate-100 text-slate-500' : 'bg-white border-slate-50 text-slate-300'}`}>
                    {h.toString().padStart(2, '0')}
                  </div>
                </div>
              ))}
            </div>
          </div>

          <div className="relative z-10 space-y-4 pb-12">
            {isToday && (
              <div 
                className="absolute top-0 bottom-0 z-[130] flex flex-col items-center pointer-events-none transition-all duration-1000 ease-linear"
                style={{ left: `calc(14rem + (100% - 14rem) * ${timeLinePosition / 100})`, transform: 'translateX(-50%)' }}
              >
                <div className="w-0.5 flex-1 bg-[#10B981] opacity-50"></div>
              </div>
            )}

            {mode === 'driver' && drivers?.map(driver => {
              const driverSched = schedule?.find(s => s.driverId === driver.id);
              return (
                <div key={driver.id} className="flex items-center group/row">
                  <div className="w-56 flex-shrink-0 flex items-center gap-3 pr-4">
                    <div className="w-10 h-10 rounded-[12px] overflow-hidden border-2 border-white shadow-sm bg-slate-50">
                      <img src={driver.avatar} className="w-full h-full object-cover" alt="" />
                    </div>
                    <div>
                       <span className="block font-black text-slate-700 text-xs tracking-tight truncate">{driver.name}</span>
                       <span className="text-[8px] font-bold text-slate-300 uppercase tracking-widest">{driver.id.slice(-6)}</span>
                    </div>
                  </div>
                  <div className="flex-1 grid grid-cols-24 gap-0 py-2.5 bg-slate-50/20 rounded-[16px] border border-slate-100/60">
                    {hours24.map(h => (
                      <div key={h} className="flex justify-center items-center h-6">
                        <div className="grid grid-cols-2 gap-1 w-[80%] h-full">
                          {[0, 1].map(half => {
                            const idx = h * 2 + half;
                            const slot = driverSched?.slots[idx];
                            return (
                              <div key={half} className={`relative rounded-sm transition-all border ${getBlock3DStyles(slot?.status || DriverStatus.OFF_DUTY)}`} />
                            );
                          })}
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              );
            })}

            {mode === 'vehicle' && vehicles?.map(vehicle => {
              const vSched = vehicleSchedule?.find(s => s.vehicleId === vehicle.id);
              return (
                <div key={vehicle.id} className="flex items-center group/row">
                  <div className="w-56 flex-shrink-0 flex items-center gap-3 pr-4">
                    <div className="w-10 h-10 rounded-[12px] flex items-center justify-center border-2 border-white bg-white shadow-sm">
                      {vehicle.status === VehicleStatus.MAINTENANCE ? <Wrench className="w-4 h-4 text-[#FBBF24]" /> : <Car className="w-4 h-4 text-slate-400" />}
                    </div>
                    <div>
                      <span className="block text-xs font-black text-slate-700 tracking-tight">{vehicle.plateNumber}</span>
                      <span className="text-[8px] font-bold text-slate-300 uppercase tracking-widest">{vehicle.type}</span>
                    </div>
                  </div>
                  <div className="flex-1 grid grid-cols-24 gap-0 py-2.5 bg-slate-50/20 rounded-[16px] border border-slate-100/60">
                    {hours24.map(h => (
                      <div key={h} className="flex justify-center items-center h-6">
                        <div className="grid grid-cols-2 gap-1 w-[80%] h-full">
                          {[0, 1].map(half => {
                            const idx = h * 2 + half;
                            const slot = vSched?.slots[idx];
                            return (
                              <div key={half} className={`relative rounded-sm transition-all border ${getVehicleBlock3D(slot?.isAvailable || false, vehicle.status)}`} />
                            );
                          })}
                        </div>
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
