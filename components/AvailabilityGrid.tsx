
import React, { useState } from 'react';
import { Driver, DriverSchedule, DriverStatus } from '../types';
import { User, Clock, Check, X, Car, Truck, Bus } from 'lucide-react';

interface Props {
  drivers: Driver[];
  schedule: DriverSchedule[];
  onUpdateSlot: (driverId: string, hour: number, newStatus: DriverStatus) => void;
}

const AvailabilityGrid: React.FC<Props> = ({ drivers, schedule, onUpdateSlot }) => {
  const [editingSlot, setEditingSlot] = useState<{ driverId: string; driverName: string; hour: number; currentStatus: DriverStatus } | null>(null);
  
  const getStatusStyle = (status: DriverStatus) => {
    switch (status) {
      case DriverStatus.BUSY: 
        return 'bg-rose-300 border-rose-400 shadow-[inset_0_-3px_0_rgba(0,0,0,0.1)]';
      case DriverStatus.FREE: 
        return 'bg-emerald-100 border-emerald-200 shadow-[inset_0_-3px_0_rgba(0,0,0,0.05)]';
      case DriverStatus.BREAK: 
        return 'bg-amber-200 border-amber-300 shadow-[inset_0_-3px_0_rgba(0,0,0,0.1)]';
      case DriverStatus.OFF_DUTY: 
        return 'bg-slate-100 border-slate-200 opacity-60';
      default: 
        return 'bg-gray-100';
    }
  };

  const hours = Array.from({ length: 24 }, (_, i) => i);

  const handleSlotClick = (driverId: string, driverName: string, hour: number, currentStatus: DriverStatus) => {
    if (currentStatus === DriverStatus.OFF_DUTY) return;
    setEditingSlot({ driverId, driverName, hour, currentStatus });
  };

  const handleConfirmChange = (newStatus: DriverStatus) => {
    if (editingSlot) {
      onUpdateSlot(editingSlot.driverId, editingSlot.hour, newStatus);
      setEditingSlot(null);
    }
  };

  return (
    <div className="bg-white rounded-[32px] overflow-hidden flex flex-col h-full relative">
      <div className="p-6 border-b border-slate-100 flex justify-between items-center bg-slate-50/30">
        <h2 className="text-lg font-black text-slate-800 flex items-center gap-3">
          <Clock className="w-6 h-6 text-indigo-500 fill-indigo-100" />
          全员排班与运力分布
        </h2>
        <div className="flex gap-4 text-[10px] font-black text-slate-500 uppercase tracking-widest">
          <div className="flex items-center gap-2">
            <div className="w-3 h-3 bg-emerald-100 border border-emerald-200 rounded shadow-sm"></div> 空闲
          </div>
          <div className="flex items-center gap-2">
            <div className="w-3 h-3 bg-rose-300 border border-rose-400 rounded shadow-sm"></div> 忙碌
          </div>
          <div className="flex items-center gap-2">
            <div className="w-3 h-3 bg-amber-200 border border-amber-300 rounded shadow-sm"></div> 休息
          </div>
        </div>
      </div>

      <div className="overflow-x-auto flex-1 scrollbar-hide">
        <div className="min-w-[1100px] p-6">
          <div className="flex mb-4">
            <div className="w-56 flex-shrink-0 font-black text-slate-400 text-[10px] uppercase tracking-widest pl-2">司机信息 (灵活排班)</div>
            <div className="flex-1 grid grid-cols-[repeat(24,minmax(0,1fr))] gap-1.5">
              {hours.map(h => (
                <div key={h} className="text-center text-[11px] font-black text-slate-400 font-mono">
                  {h.toString().padStart(2, '0')}
                </div>
              ))}
            </div>
          </div>

          <div className="space-y-4">
            {drivers.map(driver => {
              const driverSched = schedule.find(s => s.driverId === driver.id);
              
              return (
                <div key={driver.id} className="flex items-center group">
                  <div className="w-56 flex-shrink-0 flex items-center gap-3 pr-4">
                    <div className="relative">
                       <img src={driver.avatar} alt={driver.name} className="w-12 h-12 rounded-[18px] border-2 border-white shadow-md object-cover" />
                       <div className="absolute -bottom-1 -right-1 bg-white rounded-full p-0.5 shadow-sm">
                         <div className={`w-3 h-3 rounded-full ${driver.rating > 4.8 ? 'bg-emerald-500' : 'bg-amber-400'}`}></div>
                       </div>
                    </div>
                    <div>
                      <p className="font-black text-slate-800 text-sm tracking-tight">{driver.name}</p>
                      <div className="flex items-center gap-1.5 text-[9px] font-black text-slate-400 uppercase tracking-widest mt-0.5 bg-slate-50 px-1.5 py-0.5 rounded-md border border-slate-100">
                         在线司机
                      </div>
                    </div>
                  </div>
                  
                  <div className="flex-1 grid grid-cols-[repeat(24,minmax(0,1fr))] gap-1.5 bg-slate-50/50 rounded-2xl p-2 border border-slate-100/80">
                    {driverSched?.slots.map((slot) => (
                      <div
                        key={slot.hour}
                        onClick={() => handleSlotClick(driver.id, driver.name, slot.hour, slot.status)}
                        className={`
                          h-10 rounded-lg transition-all duration-300 cursor-pointer 
                          hover:z-20 hover:scale-110 hover:shadow-2xl hover:ring-2 hover:ring-white
                          border-b-4
                          ${getStatusStyle(slot.status)}
                        `}
                        title={`${driver.name} | ${slot.hour}:00 | ${slot.status}`}
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

      {/* Status Selection Modal */}
      {editingSlot && (
        <div className="fixed inset-0 z-[100] flex items-center justify-center p-4">
          <div className="absolute inset-0 bg-slate-900/60 backdrop-blur-md" onClick={() => setEditingSlot(null)}></div>
          <div className="relative bg-white rounded-[40px] shadow-2xl w-full max-w-sm overflow-hidden animate-in zoom-in-95 duration-200">
            <div className="p-8">
              <div className="flex justify-between items-center mb-8">
                <h3 className="text-2xl font-black text-slate-800 tracking-tight">调度快速修改</h3>
                <button onClick={() => setEditingSlot(null)} className="p-2 hover:bg-slate-50 rounded-full text-slate-400">
                  <X className="w-6 h-6" />
                </button>
              </div>
              
              <div className="mb-8 p-6 bg-slate-50 rounded-[24px] border border-slate-100">
                <p className="text-[10px] text-slate-400 font-black uppercase tracking-widest mb-1">司机 / 时间点</p>
                <p className="font-black text-slate-800 text-lg">{editingSlot.driverName} · {editingSlot.hour}:00</p>
              </div>

              <div className="space-y-3">
                {[
                  { id: DriverStatus.FREE, label: '设为空闲', color: 'bg-emerald-50 text-emerald-700 border-emerald-100 hover:bg-emerald-100' },
                  { id: DriverStatus.BUSY, label: '设为忙碌', color: 'bg-rose-50 text-rose-700 border-rose-100 hover:bg-rose-100' },
                  { id: DriverStatus.BREAK, label: '设为休息', color: 'bg-amber-50 text-amber-700 border-amber-100 hover:bg-amber-100' },
                ].map((option) => (
                  <button
                    key={option.id}
                    onClick={() => handleConfirmChange(option.id)}
                    className={`w-full flex items-center justify-between p-5 rounded-[24px] border-2 transition-all font-black text-sm uppercase tracking-widest ${option.color} ${editingSlot.currentStatus === option.id ? 'ring-4 ring-indigo-500/20 scale-[1.02]' : 'border-transparent'}`}
                  >
                    <span>{option.label}</span>
                    {editingSlot.currentStatus === option.id && <Check className="w-5 h-5" />}
                  </button>
                ))}
              </div>
            </div>
            <div className="bg-slate-50 p-8 flex justify-end">
              <button onClick={() => setEditingSlot(null)} className="px-8 py-2 text-slate-400 font-black uppercase tracking-widest text-xs hover:text-slate-600 transition-colors">
                放弃修改
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default AvailabilityGrid;
