
import React, { useState } from 'react';
import { Driver, DriverSchedule, DriverStatus } from '../types';
import { User, Clock, Check, X } from 'lucide-react';

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

  const handleSlotClick = (driverId: string, driverName: string, hour: number, currentStatus: DriverStatus) => {
    if (currentStatus === DriverStatus.OFF_DUTY) return; // Don't edit off-duty hours
    setEditingSlot({ driverId, driverName, hour, currentStatus });
  };

  const handleConfirmChange = (newStatus: DriverStatus) => {
    if (editingSlot) {
      onUpdateSlot(editingSlot.driverId, editingSlot.hour, newStatus);
      setEditingSlot(null);
    }
  };

  return (
    <div className="bg-white rounded-3xl shadow-sm border border-slate-100 overflow-hidden flex flex-col h-full relative">
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
          <div className="flex items-center gap-2">
            <div className="w-4 h-4 bg-amber-200 border border-amber-300 rounded-md shadow-sm"></div> 休息
          </div>
        </div>
      </div>

      <div className="overflow-x-auto flex-1 custom-scrollbar">
        <div className="min-w-[1000px] p-5">
          <div className="flex mb-3">
            <div className="w-48 flex-shrink-0 font-bold text-slate-400 text-xs uppercase tracking-wider pl-2">司机团队</div>
            <div className="flex-1 grid grid-cols-[repeat(24,minmax(0,1fr))] gap-1">
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
                    <div className="relative">
                       <img src={driver.avatar} alt={driver.name} className="w-11 h-11 rounded-2xl border-2 border-white shadow-md object-cover" />
                       <div className="absolute -bottom-1 -right-1 bg-white rounded-full p-0.5 shadow-sm">
                         <div className={`w-2.5 h-2.5 rounded-full ${driver.rating > 4.8 ? 'bg-green-500' : 'bg-yellow-500'}`}></div>
                       </div>
                    </div>
                    <div>
                      <p className="font-bold text-slate-700 text-sm">{driver.name}</p>
                      <div className="flex items-center text-xs font-medium text-slate-400 bg-slate-100 px-1.5 py-0.5 rounded-md w-fit mt-0.5">
                         <span className="text-amber-400 mr-1 text-[10px]">★</span> {driver.rating.toFixed(1)}
                      </div>
                    </div>
                  </div>
                  
                  <div className="flex-1 grid grid-cols-[repeat(24,minmax(0,1fr))] gap-1 bg-slate-50/50 rounded-xl p-1.5 border border-slate-100/80">
                    {driverSched?.slots.map((slot) => (
                      <div
                        key={slot.hour}
                        onClick={() => handleSlotClick(driver.id, driver.name, slot.hour, slot.status)}
                        title={`${driver.name} - ${slot.hour}点 - ${slot.status === 'BUSY' ? '忙碌' : slot.status === 'FREE' ? '空闲' : '休息'}`}
                        className={`
                          h-9 rounded-md transition-all duration-200 cursor-pointer 
                          hover:-translate-y-1 hover:shadow-lg hover:z-20 hover:scale-110
                          border-b-2
                          ${getStatusStyle(slot.status)}
                        `}
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
          <div 
            className="absolute inset-0 bg-slate-900/60 backdrop-blur-sm"
            onClick={() => setEditingSlot(null)}
          ></div>
          <div className="relative bg-white rounded-3xl shadow-2xl w-full max-w-sm overflow-hidden animate-in zoom-in-95 duration-200">
            <div className="p-6">
              <div className="flex justify-between items-center mb-6">
                <h3 className="text-xl font-bold text-slate-800">修改状态</h3>
                <button 
                  onClick={() => setEditingSlot(null)}
                  className="p-2 hover:bg-slate-100 rounded-full text-slate-400"
                >
                  <X className="w-5 h-5" />
                </button>
              </div>
              
              <div className="mb-6 p-4 bg-slate-50 rounded-2xl border border-slate-100">
                <p className="text-sm text-slate-500 mb-1">司机 / 时间</p>
                <p className="font-bold text-slate-800">{editingSlot.driverName} • {editingSlot.hour}:00 时段</p>
              </div>

              <div className="space-y-3">
                {[
                  { id: DriverStatus.FREE, label: '设为空闲', color: 'bg-sky-100 text-sky-700 border-sky-200 hover:bg-sky-200' },
                  { id: DriverStatus.BUSY, label: '设为忙碌', color: 'bg-rose-100 text-rose-700 border-rose-200 hover:bg-rose-200' },
                  { id: DriverStatus.BREAK, label: '设为休息', color: 'bg-amber-100 text-amber-700 border-amber-200 hover:bg-amber-200' },
                ].map((option) => (
                  <button
                    key={option.id}
                    onClick={() => handleConfirmChange(option.id)}
                    className={`w-full flex items-center justify-between p-4 rounded-2xl border-2 transition-all group font-bold ${option.color} ${editingSlot.currentStatus === option.id ? 'ring-2 ring-indigo-500 ring-offset-2' : ''}`}
                  >
                    <span>{option.label}</span>
                    {editingSlot.currentStatus === option.id && <Check className="w-5 h-5" />}
                  </button>
                ))}
              </div>
            </div>
            <div className="bg-slate-50 p-6 flex justify-end">
              <button 
                onClick={() => setEditingSlot(null)}
                className="px-6 py-2 text-slate-500 font-bold hover:text-slate-700 transition-colors"
              >
                取消
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default AvailabilityGrid;
