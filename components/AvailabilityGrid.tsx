
import React, { useState, useEffect, useMemo, useRef } from 'react';
import { Driver, DriverSchedule, DriverStatus, Vehicle, VehicleSchedule, VehicleStatus } from '../types';
import { Clock, Check, User, Car, Wrench, Settings2, Timer, Moon, MousePointer2 } from 'lucide-react';

interface Props {
  mode: 'driver' | 'vehicle';
  drivers?: Driver[];
  schedule?: DriverSchedule[];
  vehicles?: Vehicle[];
  vehicleSchedule?: VehicleSchedule[];
  onUpdateSlot?: (id: string, startIdx: number, endIdx: number, newStatus: any) => void;
  onUpdateVehicleStatus?: (id: string, status: VehicleStatus) => void;
  selectedDate?: string;
}

const AvailabilityGrid: React.FC<Props> = ({ 
  mode, 
  drivers, 
  schedule, 
  vehicles, 
  vehicleSchedule, 
  onUpdateSlot,
  onUpdateVehicleStatus,
  selectedDate
}) => {
  const [dragStart, setDragStart] = useState<{ id: string; index: number } | null>(null);
  const [dragEnd, setDragEnd] = useState<number | null>(null);
  const [selectionModal, setSelectionModal] = useState<{ id: string; name: string; start: number; end: number } | null>(null);
  const [editingVehicle, setEditingVehicle] = useState<Vehicle | null>(null);
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

  const getDriverStatusStyle = (status: DriverStatus) => {
    switch (status) {
      case DriverStatus.BUSY: return 'bg-rose-400 border-rose-500';
      case DriverStatus.FREE: return 'bg-emerald-200 border-emerald-300';
      case DriverStatus.BREAK: return 'bg-amber-300 border-amber-400';
      case DriverStatus.OFF_DUTY: return 'bg-slate-200 border-slate-300 opacity-60';
      default: return 'bg-gray-100';
    }
  };

  const getVehicleStatusStyle = (isAvailable: boolean, status: VehicleStatus) => {
    if (status === VehicleStatus.MAINTENANCE) return 'bg-amber-100 border-amber-200 opacity-80';
    if (status === VehicleStatus.OUT_OF_SERVICE) return 'bg-slate-200 border-slate-300 opacity-60';
    return isAvailable ? 'bg-indigo-100 border-indigo-200' : 'bg-slate-400 border-slate-500 opacity-90';
  };

  const slots48 = Array.from({ length: 48 }, (_, i) => i);

  const onMouseDown = (id: string, index: number) => {
    if (mode === 'vehicle') return;
    setDragStart({ id, index });
    setDragEnd(index);
  };

  const onMouseEnter = (index: number) => {
    if (dragStart) setDragEnd(index);
  };

  const onMouseUp = () => {
    if (dragStart && dragEnd !== null) {
      const start = Math.min(dragStart.index, dragEnd);
      const end = Math.max(dragStart.index, dragEnd);
      const name = drivers?.find(d => d.id === dragStart.id)?.name || '未知司机';
      setSelectionModal({ id: dragStart.id, name, start, end });
    }
    setDragStart(null);
    setDragEnd(null);
  };

  const formatIdxToTime = (idx: number) => {
    const h = Math.floor(idx / 2);
    const m = idx % 2 === 0 ? '00' : '30';
    return `${h.toString().padStart(2, '0')}:${m}`;
  };

  const gridStyle = {
    display: 'grid',
    gridTemplateColumns: 'repeat(48, minmax(0, 1fr))',
    gap: '0px' // 移除 gap，使用边框和背景色区分，让视觉更连续
  };

  return (
    <div className="bg-white rounded-[32px] overflow-hidden flex flex-col h-full relative select-none" onMouseLeave={() => {setDragStart(null); setDragEnd(null);}}>
      <div className="p-6 border-b border-slate-100 flex justify-between items-center bg-slate-50/30">
        <h2 className="text-lg font-black text-slate-800 flex items-center gap-3">
          <Clock className="w-6 h-6 text-indigo-500 fill-indigo-100" />
          {mode === 'driver' ? '全时段精细运力轴' : '资产高频可用性矩阵'}
        </h2>
        <div className="flex items-center gap-4 bg-white px-4 py-2 rounded-xl border border-slate-100 shadow-sm">
          <div className="w-2 h-2 rounded-full bg-indigo-500 animate-pulse"></div>
          <span className="text-[10px] font-black text-slate-500 uppercase tracking-widest">30分钟精度 / 垂直小时对齐</span>
        </div>
      </div>

      <div className="overflow-x-auto flex-1 scrollbar-hide">
        <div className="min-w-[1400px] p-6 relative" onMouseUp={onMouseUp}>
          
          {/* 时间轴头部 */}
          <div className="flex mb-4">
            <div className="w-64 flex-shrink-0 font-black text-slate-400 text-[10px] uppercase tracking-widest pl-2">
              资源与任务分配状况
            </div>
            <div className="flex-1" style={gridStyle}>
              {slots48.map(idx => {
                const isHourStart = idx % 2 === 0;
                return (
                  <div key={idx} className={`text-center py-2 text-[9px] font-black transition-colors ${isHourStart ? 'text-slate-800 border-l border-slate-200' : 'text-slate-300'}`}>
                    {isHourStart ? formatIdxToTime(idx) : ''}
                  </div>
                );
              })}
            </div>
          </div>

          <div className="space-y-4 relative">
            {/* 实时时间线 */}
            {isToday && (
              <div 
                className="absolute top-0 bottom-0 z-40 flex flex-col items-center pointer-events-none transition-all duration-1000 ease-linear"
                style={{ 
                  left: `calc(16rem + (100% - 16rem) * ${timeLinePosition / 100})`, 
                  transform: 'translateX(-50%)' 
                }}
              >
                <div className="bg-rose-500 text-white text-[9px] font-black px-1.5 py-0.5 rounded-full shadow-lg mb-1 whitespace-nowrap">
                  {now.getHours().toString().padStart(2, '0')}:{now.getMinutes().toString().padStart(2, '0')}
                </div>
                <div className="w-0.5 flex-1 bg-rose-500 shadow-[0_0_8px_rgba(244,63,94,0.4)]"></div>
              </div>
            )}

            {mode === 'driver' && drivers?.map(driver => {
              const driverSched = schedule?.find(s => s.driverId === driver.id);
              return (
                <div key={driver.id} className="flex items-center group/row">
                  <div className="w-64 flex-shrink-0 flex items-center gap-3 pr-4 group-hover/row:translate-x-1 transition-transform">
                    <img src={driver.avatar} className="w-9 h-9 rounded-xl border border-slate-100 shadow-sm" alt="" />
                    <span className="font-black text-slate-700 text-xs truncate group-hover/row:text-indigo-600">{driver.name}</span>
                  </div>
                  <div className="flex-1 bg-white rounded-xl overflow-hidden p-1 border border-slate-100" style={gridStyle}>
                    {driverSched?.slots.map((slot, idx) => {
                      const hourNum = Math.floor(idx / 2);
                      const isEvenHour = hourNum % 2 === 0;
                      const isHourStart = idx % 2 === 0;
                      const isDragging = dragStart?.id === driver.id && dragEnd !== null && 
                        idx >= Math.min(dragStart.index, dragEnd) && idx <= Math.max(dragStart.index, dragEnd);
                      
                      return (
                        <div
                          key={idx}
                          onMouseDown={() => onMouseDown(driver.id, idx)}
                          onMouseEnter={() => onMouseEnter(idx)}
                          className={`
                            h-10 transition-all cursor-crosshair relative border-b border-white/20
                            ${isEvenHour ? 'bg-slate-50/50' : 'bg-white'} 
                            ${isHourStart ? 'border-l border-slate-100' : ''}
                            ${isDragging ? 'z-20 scale-y-110' : ''}
                          `}
                        >
                          {/* 内部状态色块 */}
                          <div className={`
                            absolute inset-1 rounded-md transition-all border
                            ${getDriverStatusStyle(slot.status)}
                            ${isDragging ? 'ring-2 ring-indigo-500 shadow-xl !bg-indigo-400' : ''}
                          `}></div>
                        </div>
                      );
                    })}
                  </div>
                </div>
              );
            })}

            {mode === 'vehicle' && vehicles?.map(vehicle => {
              const vSched = vehicleSchedule?.find(s => s.vehicleId === vehicle.id);
              return (
                <div key={vehicle.id} className="flex items-center group/row">
                  <div className="w-64 flex-shrink-0 flex items-center gap-3 pr-4 cursor-pointer" onClick={() => setEditingVehicle(vehicle)}>
                    <div className="w-9 h-9 rounded-xl flex items-center justify-center border bg-white shadow-sm group-hover/row:border-indigo-200 group-hover/row:scale-105 transition-all">
                      {vehicle.status === VehicleStatus.MAINTENANCE ? <Wrench className="w-4 h-4 text-amber-500" /> : <Car className="w-4 h-4 text-indigo-500" />}
                    </div>
                    <span className="text-[10px] font-black text-slate-600 truncate group-hover/row:text-indigo-600">{vehicle.plateNumber}</span>
                  </div>
                  <div className="flex-1 bg-white rounded-xl overflow-hidden p-1 border border-slate-100" style={gridStyle}>
                    {vSched?.slots.map((slot, idx) => {
                      const hourNum = Math.floor(idx / 2);
                      const isEvenHour = hourNum % 2 === 0;
                      const isHourStart = idx % 2 === 0;
                      return (
                        <div
                          key={idx}
                          className={`
                            h-10 relative border-b border-white/20
                            ${isEvenHour ? 'bg-slate-50/50' : 'bg-white'} 
                            ${isHourStart ? 'border-l border-slate-100' : ''}
                          `}
                        >
                          <div className={`
                            absolute inset-1 rounded-md transition-all border
                            ${getVehicleStatusStyle(slot.isAvailable, vehicle.status)}
                          `}></div>
                        </div>
                      );
                    })}
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      </div>

      {/* 批量操作弹窗保持不变 */}
      {selectionModal && (
        <div className="fixed inset-0 z-[100] flex items-center justify-center p-4">
          <div className="absolute inset-0 bg-slate-900/60 backdrop-blur-md" onClick={() => setSelectionModal(null)}></div>
          <div className="relative bg-white rounded-[40px] shadow-2xl w-full max-w-sm overflow-hidden animate-in zoom-in-95 duration-200">
            <div className="p-8">
              <h3 className="text-xl font-black text-slate-800 tracking-tight mb-6">批量排程指派</h3>
              <div className="mb-6 p-5 bg-indigo-50 rounded-[24px] border border-indigo-100">
                <p className="text-[10px] text-indigo-400 font-bold uppercase mb-1">已选时段 ({selectionModal.name})</p>
                <div className="flex items-center gap-2 font-black text-indigo-700">
                  <span>{formatIdxToTime(selectionModal.start)}</span>
                  <div className="h-px flex-1 bg-indigo-200"></div>
                  <span>{formatIdxToTime(selectionModal.end + 1)}</span>
                </div>
              </div>
              <div className="space-y-2">
                {[
                  { id: DriverStatus.FREE, label: '设为空闲待命' },
                  { id: DriverStatus.BUSY, label: '设为任务忙碌' },
                  { id: DriverStatus.BREAK, label: '设为临时休息' },
                  { id: DriverStatus.OFF_DUTY, label: '设为下班状态' },
                ].map((option) => (
                  <button
                    key={option.id}
                    onClick={() => {
                      onUpdateSlot?.(selectionModal.id, selectionModal.start, selectionModal.end, option.id);
                      setSelectionModal(null);
                    }}
                    className="w-full p-4 rounded-2xl bg-slate-50 hover:bg-indigo-600 hover:text-white transition-all font-black text-xs uppercase tracking-widest text-left"
                  >
                    {option.label}
                  </button>
                ))}
              </div>
            </div>
          </div>
        </div>
      )}

      {editingVehicle && (
        <div className="fixed inset-0 z-[100] flex items-center justify-center p-4">
          <div className="absolute inset-0 bg-slate-900/60 backdrop-blur-md" onClick={() => setEditingVehicle(null)}></div>
          <div className="relative bg-white rounded-[40px] shadow-2xl w-full max-w-sm overflow-hidden p-8 animate-in zoom-in-95 duration-200">
            <h3 className="text-xl font-black text-slate-800 mb-6 flex items-center gap-3">
              <Settings2 className="w-5 h-5 text-indigo-500" />
              资产可用性
            </h3>
            <div className="space-y-3">
              {[VehicleStatus.ACTIVE, VehicleStatus.MAINTENANCE, VehicleStatus.OUT_OF_SERVICE].map(status => (
                <button
                  key={status}
                  onClick={() => { onUpdateVehicleStatus?.(editingVehicle.id, status); setEditingVehicle(null); }}
                  className="w-full p-4 rounded-2xl bg-slate-50 hover:bg-slate-100 font-black text-xs uppercase tracking-widest text-left"
                >
                  {status}
                </button>
              ))}
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default AvailabilityGrid;
