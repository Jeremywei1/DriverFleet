
import React, { useState, useEffect, useMemo } from 'react';
import { Driver, DriverStatus, Vehicle, VehicleStatus, DriverSchedule } from '../types';
import { Clock, Car, Wrench, Settings2, Timer } from 'lucide-react';

interface Props {
  mode: 'driver' | 'vehicle';
  drivers?: Driver[];
  schedule?: DriverSchedule[];
  vehicles?: Vehicle[];
  vehicleSchedule?: any[];
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
  const [hoverState, setHoverState] = useState<{ id: string; idx: number } | null>(null);
  const [selectionModal, setSelectionModal] = useState<{ id: string; name: string; start: number; end: number } | null>(null);
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

  const onMouseDown = (id: string, index: number) => {
    setDragStart({ id, index });
    setDragEnd(index);
  };

  const getBlock3DStyles = (status: DriverStatus) => {
    switch (status) {
      case DriverStatus.BUSY: 
        return 'bg-[#F87171] border-[#FCA5A5] shadow-[0_4px_0_0_#B91C1C,inset_0_1px_2px_rgba(255,255,255,0.4)]';
      case DriverStatus.FREE: 
        return 'bg-[#10B981] border-[#34D399] shadow-[0_4px_0_0_#064E3B,inset_0_1px_3px_rgba(255,255,255,0.6)]';
      case DriverStatus.BREAK: 
        return 'bg-[#FBBF24] border-[#FDE68A] shadow-[0_4px_0_0_#B45309,inset_0_1px_2px_rgba(255,255,255,0.4)]';
      case DriverStatus.OFF_DUTY: 
        return 'bg-[#E2E8F0] border-[#F1F5F9] shadow-[0_2px_0_0_#94A3B8] opacity-30';
      default: 
        return 'bg-slate-50 border-slate-100';
    }
  };

  const getVehicleBlock3D = (isAvailable: boolean, status: VehicleStatus) => {
    if (status === VehicleStatus.MAINTENANCE) return 'bg-[#FBBF24] border-[#FDE68A] shadow-[0_4px_0_0_#B45309]';
    if (status === VehicleStatus.OUT_OF_SERVICE) return 'bg-[#E2E8F0] border-[#F1F5F9] shadow-[0_2px_0_0_#94A3B8]';
    return isAvailable 
      ? 'bg-[#0EA5E9] border-[#38BDF8] shadow-[0_4px_0_0_#075985,inset_0_1px_3px_rgba(255,255,255,0.6)]' 
      : 'bg-[#CBD5E1] border-[#E2E8F0] shadow-[0_4px_0_0_#64748B]';
  };

  const formatIdxToTime = (idx: number) => {
    const h = Math.floor(idx / 2);
    const m = idx % 2 === 0 ? '00' : '30';
    return `${h.toString().padStart(2, '0')}:${m}`;
  };

  const hours24 = Array.from({ length: 24 }, (_, i) => i);

  return (
    <div className="bg-[#FFFFFF] rounded-[48px] flex flex-col h-full relative select-none overflow-hidden" onMouseLeave={() => {setDragStart(null); setDragEnd(null); setHoverState(null);}}>
      
      <div className="relative z-[150] bg-white border-b border-slate-50 p-8 flex justify-between items-center shadow-sm">
        <h2 className="text-xl font-black text-slate-800 flex items-center gap-4">
          <div className="w-10 h-10 bg-slate-50 rounded-2xl flex items-center justify-center border border-slate-100">
            <Clock className="w-6 h-6 text-slate-400" />
          </div>
          {mode === 'driver' ? '全域运力分布轴' : '资产可用性矩阵'}
        </h2>
        <div className="flex items-center gap-3 bg-slate-50 px-5 py-2.5 rounded-[16px] border border-slate-100">
          <div className="w-2 h-2 rounded-full bg-[#10B981] animate-pulse"></div>
          <span className="text-[10px] font-black text-slate-400 uppercase tracking-widest">全贯穿高精对齐系统</span>
        </div>
      </div>

      <div className="overflow-auto flex-1 scrollbar-hide relative">
        {/* 内容容器设为 h-fit 确保 relative 父级包裹所有行 */}
        <div className="min-w-[1600px] relative p-8 pt-0 flex flex-col h-fit">
          
          {/* 纵向虚线背景层 - 置于背景 z-0，使用 inset-y-0 贯穿整个内容高度 */}
          <div className="absolute inset-y-0 left-8 right-8 pointer-events-none flex z-0">
             <div className="w-64 flex-shrink-0 border-r border-slate-100/50"></div>
             <div className="flex-1 grid grid-cols-24 gap-0">
                {hours24.map(h => (
                  <div key={h} className="border-l border-slate-200/40 border-dashed h-full"></div>
                ))}
                <div className="border-l border-slate-200/40 border-dashed h-full"></div>
             </div>
          </div>

          {/* 时间轴表头 - sticky 在顶层 */}
          <div className="sticky top-0 z-[140] bg-white/95 backdrop-blur-sm flex py-6 mb-8 border-b border-slate-100">
            <div className="w-64 flex-shrink-0 font-black text-slate-300 text-[10px] uppercase tracking-widest pl-4 pt-3">
              LIVE GRID SYSTEM
            </div>
            <div className="flex-1 grid grid-cols-24 gap-0">
              {hours24.map(h => (
                <div key={h} className="flex justify-center items-center">
                  <div className={`w-[85%] py-2 text-[11px] font-black transition-all rounded-lg border-2 ${h % 2 === 0 ? 'bg-slate-50 border-slate-100 text-slate-500' : 'bg-white border-slate-50 text-slate-300'}`}>
                    {h.toString().padStart(2, '0')}
                  </div>
                </div>
              ))}
            </div>
          </div>

          {/* 数据行容器 - z-10 确保在虚线之上 */}
          <div className="relative z-10 space-y-12 pb-20" onMouseUp={() => {
            if (dragStart && dragEnd !== null) {
              const start = Math.min(dragStart.index, dragEnd);
              const end = Math.max(dragStart.index, dragEnd);
              const name = drivers?.find(d => d.id === dragStart.id)?.name || '未知司机';
              setSelectionModal({ id: dragStart.id, name, start, end });
            }
            setDragStart(null);
            setDragEnd(null);
          }}>
            
            {isToday && (
              <div 
                className="absolute top-0 bottom-0 z-[130] flex flex-col items-center pointer-events-none transition-all duration-1000 ease-linear"
                style={{ 
                  left: `calc(16rem + (100% - 16rem) * ${timeLinePosition / 100})`, 
                  transform: 'translateX(-50%)' 
                }}
              >
                <div className="bg-slate-900 text-white text-[9px] font-black px-2.5 py-1.5 rounded-md shadow-xl mb-1 ring-2 ring-white">
                  {now.getHours().toString().padStart(2, '0')}:{now.getMinutes().toString().padStart(2, '0')}
                </div>
                <div className="w-0.5 flex-1 bg-[#10B981]"></div>
              </div>
            )}

            {mode === 'driver' && drivers?.map(driver => {
              const driverSched = schedule?.find(s => s.driverId === driver.id);
              return (
                <div key={driver.id} className="flex items-center group/row">
                  <div className="w-64 flex-shrink-0 flex items-center gap-5 pr-6 transition-all group-hover/row:translate-x-1">
                    <div className="relative">
                      <div className="w-14 h-14 rounded-[18px] overflow-hidden border-2 border-white shadow-sm bg-slate-50">
                        <img src={driver.avatar} className="w-full h-full object-cover" alt="" />
                      </div>
                      <div className={`absolute -bottom-0.5 -right-0.5 w-4.5 h-4.5 rounded-full border-2 border-white ${driver.currentStatus === DriverStatus.FREE ? 'bg-[#10B981]' : 'bg-[#F87171]'}`}></div>
                    </div>
                    <div>
                       <span className="block font-black text-slate-700 text-sm tracking-tight truncate group-hover/row:text-slate-900 transition-colors">{driver.name}</span>
                       <span className="text-[9px] font-bold text-slate-300 uppercase tracking-widest">{driver.id.slice(-6)}</span>
                    </div>
                  </div>
                  
                  <div className="flex-1 grid grid-cols-24 gap-0 py-4 bg-slate-50/5 rounded-[28px] border border-slate-100/60 group-hover/row:bg-white/80 group-hover/row:shadow-md transition-all">
                    {hours24.map(h => (
                      <div key={h} className="flex justify-center items-center h-10">
                        <div className="grid grid-cols-2 gap-1.5 w-[85%] h-full">
                          {[0, 1].map(half => {
                            const idx = h * 2 + half;
                            const slot = driverSched?.slots[idx];
                            const isDragging = dragStart?.id === driver.id && dragEnd !== null && 
                              idx >= Math.min(dragStart.index, dragEnd) && idx <= Math.max(dragStart.index, dragEnd);
                            const isHovered = hoverState?.id === driver.id && hoverState?.idx === idx;
                            
                            return (
                              <div
                                key={half}
                                onMouseDown={() => onMouseDown(driver.id, idx)}
                                onMouseEnter={() => {
                                  if (dragStart) setDragEnd(idx);
                                  setHoverState({ id: driver.id, idx });
                                }}
                                className={`
                                  relative rounded-md cursor-pointer transition-all duration-300 border
                                  ${isDragging ? 'z-[100] scale-[1.1] -translate-y-1 ring-2 ring-white' : 'z-20'}
                                  ${isHovered && !isDragging ? 'scale-125 -translate-y-2 z-[90] shadow-xl' : ''}
                                  ${getBlock3DStyles(slot?.status || DriverStatus.OFF_DUTY)}
                                `}
                              >
                                <div className="absolute inset-x-1 top-0.5 h-0.5 bg-white/40 rounded-full"></div>
                              </div>
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
                  <div className="w-64 flex-shrink-0 flex items-center gap-5 pr-6 cursor-pointer">
                    <div className="w-14 h-14 rounded-[18px] flex items-center justify-center border-2 border-white bg-white shadow-sm group-hover/row:scale-105 transition-all">
                      {vehicle.status === VehicleStatus.MAINTENANCE ? <Wrench className="w-6 h-6 text-[#FBBF24]" /> : <Car className="w-6 h-6 text-slate-400" />}
                    </div>
                    <div>
                      <span className="block text-sm font-black text-slate-700 tracking-tight group-hover/row:text-slate-900 transition-colors">{vehicle.plateNumber}</span>
                      <span className="text-[9px] font-bold text-slate-300 uppercase tracking-widest">{vehicle.type}</span>
                    </div>
                  </div>
                  
                  <div className="flex-1 grid grid-cols-24 gap-0 py-4 bg-slate-50/5 rounded-[28px] border border-slate-100/60 group-hover/row:bg-white/80 group-hover/row:shadow-md transition-all">
                    {hours24.map(h => (
                      <div key={h} className="flex justify-center items-center h-10">
                        <div className="grid grid-cols-2 gap-1.5 w-[85%] h-full">
                          {[0, 1].map(half => {
                            const idx = h * 2 + half;
                            const slot = vSched?.slots[idx];
                            const isHovered = hoverState?.id === vehicle.id && hoverState?.idx === idx;
                            return (
                              <div
                                key={half}
                                onMouseEnter={() => setHoverState({ id: vehicle.id, idx })}
                                className={`
                                  relative rounded-md transition-all duration-300 border
                                  ${isHovered ? 'scale-125 -translate-y-2 z-[90] shadow-xl' : 'z-20'}
                                  ${getVehicleBlock3D(slot?.isAvailable || false, vehicle.status)}
                                `}
                              >
                                <div className="absolute inset-x-1 top-0.5 h-0.5 bg-white/40 rounded-full"></div>
                              </div>
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

      {selectionModal && (
        <div className="fixed inset-0 z-[300] flex items-center justify-center p-6">
          <div className="absolute inset-0 bg-slate-900/10 backdrop-blur-md animate-in fade-in duration-300" onClick={() => setSelectionModal(null)}></div>
          <div className="relative bg-white rounded-[40px] shadow-2xl w-full max-w-sm overflow-hidden animate-in zoom-in-95 duration-400 border border-slate-100">
            <div className="p-10 text-center">
              <div className="w-16 h-16 bg-slate-900 rounded-2xl flex items-center justify-center mx-auto mb-6">
                <Timer className="w-8 h-8 text-white" />
              </div>
              <h3 className="text-xl font-black text-slate-800 tracking-tighter mb-1 italic">调度决策</h3>
              <p className="text-slate-400 font-bold uppercase text-[9px] tracking-widest mb-10">{selectionModal.name} • {formatIdxToTime(selectionModal.start)}</p>
              
              <div className="space-y-4">
                {[
                  { id: DriverStatus.FREE, label: '设为空闲待命', style: 'bg-[#10B981] shadow-[0_4px_0_0_#064E3B] text-white' },
                  { id: DriverStatus.BUSY, label: '指派新任务', style: 'bg-[#F87171] shadow-[0_4px_0_0_#B91C1C] text-white' },
                  { id: DriverStatus.BREAK, label: '休息中', style: 'bg-[#FBBF24] shadow-[0_4px_0_0_#B45309] text-white' },
                  { id: DriverStatus.OFF_DUTY, label: '离线状态', style: 'bg-[#E2E8F0] shadow-[0_4px_0_0_#94A3B8] text-slate-400' },
                ].map((option) => (
                  <button
                    key={option.id}
                    onClick={() => {
                      onUpdateSlot?.(selectionModal.id, selectionModal.start, selectionModal.end, option.id);
                      setSelectionModal(null);
                    }}
                    className={`w-full py-4 rounded-xl font-black text-[11px] uppercase tracking-widest transition-all hover:-translate-y-1 active:translate-y-1 border-t border-white/30 ${option.style}`}
                  >
                    {option.label}
                  </button>
                ))}
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default AvailabilityGrid;
