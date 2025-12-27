
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
  // 严格控制 hover 状态，避免全行联动
  const [hoverState, setHoverState] = useState<{ id: string; idx: number } | null>(null);
  const [selectionModal, setSelectionModal] = useState<{ id: string; name: string; start: number; end: number } | null>(null);
  const [editingVehicle, setEditingVehicle] = useState<any | null>(null);
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

  // 莫兰迪雅致色系 - 强化 3D 方块质感
  const getBlock3DStyles = (status: DriverStatus) => {
    switch (status) {
      case DriverStatus.BUSY: 
        // 雅致烟粉
        return 'bg-[#D4A5A7] border-[#E2B9BB] shadow-[0_5px_0_0_#A67E80,inset_0_1px_2px_rgba(255,255,255,0.4)]';
      case DriverStatus.FREE: 
        // 莫兰迪鼠尾草绿 (抹茶灰) - 进一步降低饱和度
        return 'bg-[#A2B8A8] border-[#BDCFC2] shadow-[0_5px_0_0_#7F9485,inset_0_1px_2px_rgba(255,255,255,0.4)]';
      case DriverStatus.BREAK: 
        // 浅杏/香槟
        return 'bg-[#D9C8A9] border-[#E8D9BD] shadow-[0_5px_0_0_#B0A184,inset_0_1px_2px_rgba(255,255,255,0.4)]';
      case DriverStatus.OFF_DUTY: 
        // 微光灰
        return 'bg-[#EDF0F2] border-[#F8F9FA] shadow-[0_2px_0_0_#D1D5DB] opacity-40';
      default: 
        return 'bg-slate-50 border-slate-100';
    }
  };

  const getVehicleBlock3D = (isAvailable: boolean, status: VehicleStatus) => {
    if (status === VehicleStatus.MAINTENANCE) return 'bg-[#D9C8A9] border-[#E8D9BD] shadow-[0_5px_0_0_#B0A184]';
    if (status === VehicleStatus.OUT_OF_SERVICE) return 'bg-[#EDF0F2] border-[#F8F9FA] shadow-[0_2px_0_0_#D1D5DB]';
    return isAvailable 
      ? 'bg-[#BCC9D9] border-[#D1DEEB] shadow-[0_5px_0_0_#93A1B0,inset_0_1px_2px_rgba(255,255,255,0.4)]' 
      : 'bg-[#D1D5DB] border-[#E5E7EB] shadow-[0_5px_0_0_#9CA3AF]';
  };

  const formatIdxToTime = (idx: number) => {
    const h = Math.floor(idx / 2);
    const m = idx % 2 === 0 ? '00' : '30';
    return `${h.toString().padStart(2, '0')}:${m}`;
  };

  const hours24 = Array.from({ length: 24 }, (_, i) => i);

  const onMouseDown = (id: string, index: number) => {
    setDragStart({ id, index });
    setDragEnd(index);
  };

  return (
    <div className="bg-[#FFFFFF] rounded-[48px] flex flex-col h-full relative select-none overflow-hidden" onMouseLeave={() => {setDragStart(null); setDragEnd(null); setHoverState(null);}}>
      
      {/* 固定页头 */}
      <div className="relative z-[120] bg-white border-b border-slate-50 p-8 flex justify-between items-center shadow-sm">
        <h2 className="text-xl font-black text-slate-800 flex items-center gap-4">
          <div className="w-10 h-10 bg-slate-50 rounded-2xl flex items-center justify-center border border-slate-100">
            <Clock className="w-6 h-6 text-slate-400" />
          </div>
          {mode === 'driver' ? '全域运力分布轴' : '资产可用性矩阵'}
        </h2>
        <div className="flex items-center gap-3 bg-slate-50 px-5 py-2.5 rounded-[18px] border border-slate-100">
          <div className="w-2.5 h-2.5 rounded-full bg-slate-300 animate-pulse"></div>
          <span className="text-[10px] font-black text-slate-400 uppercase tracking-widest">高级拟物方块视图</span>
        </div>
      </div>

      <div className="overflow-auto flex-1 scrollbar-hide">
        <div className="min-w-[1500px] relative p-8 pt-0">
          
          {/* 粘性时间轴 */}
          <div className="sticky top-0 z-[110] bg-white flex py-6 -mx-8 px-8 mb-8 border-b border-slate-100 shadow-[0_8px_30px_rgba(0,0,0,0.02)]">
            <div className="w-64 flex-shrink-0 font-black text-slate-300 text-[10px] uppercase tracking-widest pl-4 pt-4">
              24H 实时监控网格
            </div>
            <div className="flex-1 grid grid-cols-24 gap-3">
              {hours24.map(h => (
                <div key={h} className={`text-center py-2 text-[11px] font-black transition-all rounded-xl border-2 ${h % 2 === 0 ? 'bg-slate-50 border-slate-100 text-slate-500' : 'bg-white border-slate-50 text-slate-300'}`}>
                  {h.toString().padStart(2, '0')}
                </div>
              ))}
            </div>
          </div>

          <div className="space-y-12 relative" onMouseUp={() => {
            if (dragStart && dragEnd !== null) {
              const start = Math.min(dragStart.index, dragEnd);
              const end = Math.max(dragStart.index, dragEnd);
              const name = drivers?.find(d => d.id === dragStart.id)?.name || '未知司机';
              setSelectionModal({ id: dragStart.id, name, start, end });
            }
            setDragStart(null);
            setDragEnd(null);
          }}>
            
            {/* 时间指示线 */}
            {isToday && (
              <div 
                className="absolute top-0 bottom-0 z-[100] flex flex-col items-center pointer-events-none transition-all duration-1000 ease-linear"
                style={{ 
                  left: `calc(16rem + (100% - 16rem) * ${timeLinePosition / 100})`, 
                  transform: 'translateX(-50%)' 
                }}
              >
                <div className="bg-slate-900 text-white text-[9px] font-black px-2.5 py-1.5 rounded-lg shadow-xl mb-1 ring-2 ring-white">
                  {now.getHours().toString().padStart(2, '0')}:{now.getMinutes().toString().padStart(2, '0')}
                </div>
                <div className="w-0.5 flex-1 bg-slate-200"></div>
              </div>
            )}

            {mode === 'driver' && drivers?.map(driver => {
              const driverSched = schedule?.find(s => s.driverId === driver.id);
              return (
                <div key={driver.id} className="flex items-center group/row">
                  <div className="w-64 flex-shrink-0 flex items-center gap-5 pr-6 transition-all group-hover/row:translate-x-1">
                    <div className="relative">
                      <div className="w-14 h-14 rounded-[24px] overflow-hidden border-2 border-white shadow-[0_8px_20px_rgba(0,0,0,0.06)] bg-slate-50">
                        <img src={driver.avatar} className="w-full h-full object-cover grayscale-[0.1]" alt="" />
                      </div>
                      <div className={`absolute -bottom-0.5 -right-0.5 w-5 h-5 rounded-full border-2 border-white ${driver.currentStatus === DriverStatus.FREE ? 'bg-[#A2B8A8]' : 'bg-[#D4A5A7]'}`}></div>
                    </div>
                    <div>
                       <span className="block font-black text-slate-700 text-sm tracking-tight truncate group-hover/row:text-slate-900 transition-colors">{driver.name}</span>
                       <span className="text-[9px] font-bold text-slate-300 uppercase tracking-widest">{driver.id.slice(-6)}</span>
                    </div>
                  </div>
                  
                  {/* 核心改动：将高度从 h-16 降至 h-10，使视觉上更接近方块 */}
                  <div className="flex-1 grid grid-cols-24 gap-3 p-4 bg-slate-50/20 rounded-[32px] border border-slate-100 group-hover/row:bg-white group-hover/row:shadow-md transition-all">
                    {hours24.map(h => (
                      <div key={h} className="grid grid-cols-2 gap-2 h-10">
                        {[0, 1].map(half => {
                          const idx = h * 2 + half;
                          const slot = driverSched?.slots[idx];
                          const isDragging = dragStart?.id === driver.id && dragEnd !== null && 
                            idx >= Math.min(dragStart.index, dragEnd) && idx <= Math.max(dragStart.index, dragEnd);
                          
                          // 严格匹配 id 和 idx，防止全行 hover 同步
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
                                relative rounded-lg cursor-pointer transition-all duration-300 border
                                ${isDragging ? 'z-50 scale-[1.05] -translate-y-1' : 'z-20'}
                                ${isHovered && !isDragging ? 'scale-150 -translate-y-3 z-40 shadow-2xl ring-2 ring-white/50' : ''}
                                ${getBlock3DStyles(slot?.status || DriverStatus.OFF_DUTY)}
                              `}
                            >
                              <div className="absolute inset-x-1 top-1 h-0.5 bg-white/30 rounded-full"></div>
                            </div>
                          );
                        })}
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
                  <div className="w-64 flex-shrink-0 flex items-center gap-5 pr-6 cursor-pointer" onClick={() => setEditingVehicle(vehicle)}>
                    <div className="w-14 h-14 rounded-[24px] flex items-center justify-center border-2 border-white bg-white shadow-sm group-hover/row:scale-110 transition-all">
                      {vehicle.status === VehicleStatus.MAINTENANCE ? <Wrench className="w-6 h-6 text-[#D9C8A9]" /> : <Car className="w-6 h-6 text-slate-400" />}
                    </div>
                    <div>
                      <span className="block text-sm font-black text-slate-700 tracking-tight group-hover/row:text-slate-900 transition-colors">{vehicle.plateNumber}</span>
                      <span className="text-[9px] font-bold text-slate-300 uppercase tracking-widest">{vehicle.type}</span>
                    </div>
                  </div>
                  
                  {/* 核心改动：方块化 */}
                  <div className="flex-1 grid grid-cols-24 gap-3 p-4 bg-slate-50/20 rounded-[32px] border border-slate-100 group-hover/row:bg-white group-hover/row:shadow-md transition-all">
                    {hours24.map(h => (
                      <div key={h} className="grid grid-cols-2 gap-2 h-10">
                        {[0, 1].map(half => {
                          const idx = h * 2 + half;
                          const slot = vSched?.slots[idx];
                          // 严格匹配
                          const isHovered = hoverState?.id === vehicle.id && hoverState?.idx === idx;
                          return (
                            <div
                              key={half}
                              onMouseEnter={() => setHoverState({ id: vehicle.id, idx })}
                              className={`
                                relative rounded-lg transition-all duration-300 border
                                ${isHovered ? 'scale-150 -translate-y-3 z-40 shadow-2xl ring-2 ring-white/50' : 'z-20'}
                                ${getVehicleBlock3D(slot?.isAvailable || false, vehicle.status)}
                              `}
                            >
                              <div className="absolute inset-x-1 top-1 h-0.5 bg-white/30 rounded-full"></div>
                            </div>
                          );
                        })}
                      </div>
                    ))}
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      </div>

      {/* 调度决策弹窗 */}
      {selectionModal && (
        <div className="fixed inset-0 z-[300] flex items-center justify-center p-6">
          <div className="absolute inset-0 bg-slate-900/10 backdrop-blur-md animate-in fade-in duration-300" onClick={() => setSelectionModal(null)}></div>
          <div className="relative bg-white rounded-[40px] shadow-[0_40px_100px_rgba(0,0,0,0.12)] w-full max-w-sm overflow-hidden animate-in zoom-in-95 duration-400 border border-slate-100">
            <div className="p-10 text-center">
              <div className="w-16 h-16 bg-slate-900 rounded-[20px] flex items-center justify-center mx-auto mb-6 shadow-xl">
                <Timer className="w-8 h-8 text-white" />
              </div>
              <h3 className="text-xl font-black text-slate-800 tracking-tighter mb-1 italic">调度决策指令</h3>
              <p className="text-slate-400 font-bold uppercase text-[9px] tracking-widest mb-10">{selectionModal.name} • {formatIdxToTime(selectionModal.start)}</p>
              
              <div className="space-y-4">
                {[
                  { id: DriverStatus.FREE, label: '设为空闲待命', style: 'bg-[#A2B8A8] shadow-[0_5px_0_0_#7F9485] text-slate-800' },
                  { id: DriverStatus.BUSY, label: '指派新任务', style: 'bg-[#D4A5A7] shadow-[0_5px_0_0_#A67E80] text-slate-800' },
                  { id: DriverStatus.BREAK, label: '设为休息中', style: 'bg-[#D9C8A9] shadow-[0_5px_0_0_#B0A184] text-slate-800' },
                  { id: DriverStatus.OFF_DUTY, label: '已下班/离职', style: 'bg-[#EDF0F2] shadow-[0_5px_0_0_#D1D5DB] text-slate-400' },
                ].map((option) => (
                  <button
                    key={option.id}
                    onClick={() => {
                      onUpdateSlot?.(selectionModal.id, selectionModal.start, selectionModal.end, option.id);
                      setSelectionModal(null);
                    }}
                    className={`w-full py-4.5 rounded-[18px] font-black text-[11px] uppercase tracking-widest transition-all hover:-translate-y-1 active:translate-y-1 border-t border-white/30 ${option.style}`}
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
