
import React, { useState, useMemo } from 'react';
import { Driver, Vehicle, DriverStatus, VehicleStatus, Task, DriverSchedule, VehicleSchedule } from '../types';
import { 
  Zap, Clock, MapPin, CheckCircle2, Calendar, Sparkles, PlusCircle,
  Timer, Info, ChevronRight, MousePointer2, Car
} from 'lucide-react';

interface Props {
  drivers: Driver[];
  vehicles: Vehicle[];
  driverSchedules: DriverSchedule[];
  vehicleSchedules: VehicleSchedule[];
  onCreateTask: (task: Partial<Task>) => void;
}

const MatchingCenter: React.FC<Props> = ({ drivers, vehicles, driverSchedules, vehicleSchedules, onCreateTask }) => {
  const [taskDate, setTaskDate] = useState<string>(new Date().toISOString().split('T')[0]);
  const [selectedDriverId, setSelectedDriverId] = useState<string>('');
  const [selectedVehicleId, setSelectedVehicleId] = useState<string>('');
  const [startIdx, setStartIdx] = useState<number>(16); 
  const [durationIdx, setDurationIdx] = useState<number>(4); 
  const [from, setFrom] = useState('');
  const [to, setTo] = useState('');

  const [dragStart, setDragStart] = useState<{ id: string; index: number } | null>(null);
  const [dragEnd, setDragEnd] = useState<number | null>(null);
  const [hoverState, setHoverState] = useState<{ id: string; idx: number } | null>(null);

  const availableDrivers = useMemo(() => 
    drivers.filter(d => {
      const schedule = driverSchedules.find(s => s.driverId === d.id);
      if (!schedule) return false;
      for(let i=startIdx; i<Math.min(48, startIdx + durationIdx); i++) {
        if(schedule.slots[i].status !== DriverStatus.FREE) return false;
      }
      return true;
    }),
    [drivers, driverSchedules, startIdx, durationIdx]
  );

  const availableVehicles = useMemo(() => 
    vehicles.filter(v => {
      const schedule = vehicleSchedules.find(s => s.vehicleId === v.id);
      if (!schedule || v.status !== VehicleStatus.ACTIVE) return false;
      for(let i=startIdx; i<Math.min(48, startIdx + durationIdx); i++) {
        if(!schedule.slots[i].isAvailable) return false;
      }
      return true;
    }),
    [vehicles, vehicleSchedules, startIdx, durationIdx]
  );

  const isFormValid = selectedDriverId && selectedVehicleId && from.trim() && to.trim();

  const handleAssign = (e?: React.FormEvent) => {
    if (e) e.preventDefault();
    if (!isFormValid) return;

    const baseDate = new Date(taskDate);
    const startHour = Math.floor(startIdx / 2);
    const startMin = startIdx % 2 === 0 ? 0 : 30;
    const endIdxTotal = startIdx + durationIdx;
    const endHour = Math.floor(endIdxTotal / 2);
    const endMin = endIdxTotal % 2 === 0 ? 0 : 30;

    const startTime = new Date(new Date(baseDate).setHours(startHour, startMin, 0, 0)).toISOString();
    const endTime = new Date(new Date(baseDate).setHours(endHour, endMin, 0, 0)).toISOString();

    onCreateTask({
      title: `${from} → ${to}`,
      driverId: selectedDriverId,
      vehicleId: selectedVehicleId,
      startTime,
      endTime,
      locationStart: from,
      locationEnd: to,
      priority: 'MEDIUM',
      status: 'PENDING'
    });

    setFrom(''); setTo(''); setSelectedDriverId(''); setSelectedVehicleId('');
  };

  const onDragEnd = (id: string, type: 'driver' | 'vehicle') => {
    if (dragStart && dragEnd !== null) {
      const start = Math.min(dragStart.index, dragEnd);
      const length = Math.abs(dragStart.index - dragEnd) + 1;
      setStartIdx(start);
      setDurationIdx(length);
      if (type === 'driver') setSelectedDriverId(id);
      else setSelectedVehicleId(id);
    }
    setDragStart(null);
    setDragEnd(null);
  };

  const formatIdxToTime = (idx: number) => {
    const h = Math.floor(idx / 2);
    const m = idx % 2 === 0 ? '00' : '30';
    return `${h.toString().padStart(2, '0')}:${m}`;
  };

  const hours24 = Array.from({ length: 24 }, (_, i) => i);

  return (
    <div className="flex flex-col gap-8 animate-in fade-in duration-700 pb-12 select-none" onMouseLeave={() => setHoverState(null)}>
      <div className="flex justify-between items-center bg-white p-10 rounded-[48px] border-2 border-slate-100 shadow-sm relative overflow-hidden">
        <div className="relative z-10">
          <h2 className="text-3xl font-black text-slate-800 tracking-tighter italic uppercase flex items-center gap-4">
            <Zap className="w-10 h-10 text-slate-400 fill-slate-50" />
            排程规划中心
          </h2>
          <p className="text-slate-500 font-bold text-xs uppercase tracking-widest flex items-center gap-2 mt-3">
            <MousePointer2 className="w-4 h-4 text-slate-300" />
            纵向深度监控模式
          </p>
        </div>
        <div className="bg-slate-900 border-[8px] border-slate-800 px-12 py-6 rounded-[40px] shadow-2xl relative z-10 group transition-all hover:scale-105">
          <span className="text-[10px] font-black text-slate-500 uppercase block mb-1">选定规划时间窗</span>
          <span className="text-2xl font-black text-[#10B981] flex items-center gap-4">
            <Clock className="w-6 h-6 group-hover:rotate-12 transition-transform" />
            {formatIdxToTime(startIdx)} — {formatIdxToTime(startIdx + durationIdx)}
          </span>
        </div>
      </div>

      <div className="grid grid-cols-1 xl:grid-cols-12 gap-10">
        <div className="xl:col-span-7 bg-white rounded-[56px] border-2 border-slate-100 shadow-xl flex flex-col h-[850px] overflow-hidden">
          <div className="relative z-[120] bg-white p-8 border-b-2 border-slate-50 flex justify-between items-center shadow-sm">
            <span className="font-black text-slate-800 uppercase text-xs tracking-widest italic flex items-center gap-3">
              <Sparkles className="w-5 h-5 text-slate-300" />
              运力规划精准矩阵
            </span>
          </div>

          <div className="flex-1 overflow-auto p-10 scrollbar-hide relative flex flex-col" onMouseUp={() => {setDragStart(null); setDragEnd(null);}}>
            
            {/* 虚线对齐背景 - 修复: 使用 h-fit 父级及 inset-y-0 保证贯穿 */}
            <div className="absolute inset-y-0 left-34 right-10 pointer-events-none flex z-0">
               <div className="flex-1 grid grid-cols-24 gap-0">
                  {hours24.map(h => (
                    <div key={h} className="border-l border-slate-100 border-dashed h-full"></div>
                  ))}
                  <div className="border-l border-slate-100 border-dashed h-full"></div>
               </div>
            </div>

            <div className="sticky top-0 z-[110] bg-white flex py-6 -mx-10 px-10 mb-10 border-b-2 border-slate-50">
                <span className="w-24 flex-shrink-0 text-[11px] font-black text-slate-400 uppercase tracking-widest pl-2 pt-2">资源轴</span>
                <div className="flex-1 grid grid-cols-24 gap-0">
                   {hours24.map(h => (
                     <div key={h} className="flex justify-center items-center">
                       <span className={`text-[11px] font-black ${h % 2 === 0 ? 'text-slate-500' : 'text-slate-200'}`}>{h}</span>
                     </div>
                   ))}
                </div>
            </div>

            <div className="relative z-10 space-y-20 flex-1 h-fit pb-10">
              <section className="space-y-12">
                  {drivers.map(d => {
                    const sched = driverSchedules.find(s => s.driverId === d.id);
                    const isSelected = selectedDriverId === d.id;
                    return (
                      <div key={d.id} className="flex items-center group/row">
                        <div className="w-24 flex-shrink-0 text-sm font-black text-slate-700 truncate pr-4 group-hover/row:text-slate-900 transition-colors z-20">{d.name}</div>
                        <div className={`flex-1 grid grid-cols-24 gap-0 py-4 rounded-[28px] border-2 transition-all ${isSelected ? 'bg-slate-50 border-slate-200 scale-[1.01] shadow-xl' : 'bg-slate-50/10 border-slate-100'} z-10`}>
                          {hours24.map(h => (
                            <div key={h} className="flex justify-center items-center h-10">
                              <div className="grid grid-cols-2 gap-1.5 w-[85%] h-full">
                                {[0, 1].map(half => {
                                  const idx = h * 2 + half;
                                  const slot = sched?.slots[idx];
                                  const isPlan = idx >= startIdx && idx < startIdx + durationIdx && isSelected;
                                  const isHovered = hoverState?.id === d.id && hoverState?.idx === idx;

                                  return (
                                    <div 
                                      key={half}
                                      onMouseDown={() => {setDragStart({id: d.id, index: idx}); setDragEnd(idx);}}
                                      onMouseEnter={() => {
                                        if(dragStart?.id === d.id) setDragEnd(idx);
                                        setHoverState({ id: d.id, idx });
                                      }}
                                      onMouseUp={() => onDragEnd(d.id, 'driver')}
                                      className={`
                                        relative rounded-md transition-all border
                                        ${slot?.status === DriverStatus.FREE ? 'bg-[#10B981] border-[#34D399] shadow-[0_4px_0_0_#064E3B]' : 'bg-[#F87171] border-[#FCA5A5] shadow-[0_4px_0_0_#B91C1C]'}
                                        ${isPlan ? 'ring-4 ring-indigo-400 !bg-indigo-600 !border-indigo-700 !shadow-none scale-125 z-50 translate-y-[-2px]' : ''}
                                        ${isHovered && !isPlan ? 'scale-150 -translate-y-3 z-[100] shadow-2xl ring-2 ring-white/50' : ''}
                                      `}
                                    >
                                      <div className="absolute inset-x-1 top-0.5 h-0.5 bg-white/30 rounded-full"></div>
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
              </section>

              <section className="space-y-12">
                  {vehicles.map(v => {
                    const sched = vehicleSchedules.find(s => s.vehicleId === v.id);
                    const isSelected = selectedVehicleId === v.id;
                    return (
                      <div key={v.id} className="flex items-center group/row">
                        <div className="w-24 flex-shrink-0 text-xs font-black text-slate-400 truncate pr-4 group-hover/row:text-slate-900 transition-colors z-20">{v.plateNumber.slice(-4)}</div>
                        <div className={`flex-1 grid grid-cols-24 gap-0 py-4 rounded-[28px] border-2 transition-all ${isSelected ? 'bg-slate-50 border-slate-200 scale-[1.01] shadow-xl' : 'bg-slate-50/10 border-slate-100'} z-10`}>
                          {hours24.map(h => (
                            <div key={h} className="flex justify-center items-center h-10">
                              <div className="grid grid-cols-2 gap-1.5 w-[85%] h-full">
                                {[0, 1].map(half => {
                                  const idx = h * 2 + half;
                                  const slot = sched?.slots[idx];
                                  const isPlan = idx >= startIdx && idx < startIdx + durationIdx && isSelected;
                                  const isHovered = hoverState?.id === v.id && hoverState?.idx === idx;

                                  return (
                                    <div 
                                      key={half}
                                      onMouseDown={() => {setDragStart({id: v.id, index: idx}); setDragEnd(idx);}}
                                      onMouseEnter={() => {
                                        if(dragStart?.id === v.id) setDragEnd(idx);
                                        setHoverState({ id: v.id, idx });
                                      }}
                                      onMouseUp={() => onDragEnd(v.id, 'vehicle')}
                                      className={`
                                        relative rounded-md transition-all border
                                        ${slot?.isAvailable ? 'bg-[#0EA5E9] border-[#38BDF8] shadow-[0_4px_0_0_#075985]' : 'bg-[#CBD5E1] border-[#E2E8F0] shadow-[0_4px_0_0_#64748B]'}
                                        ${isPlan ? 'ring-4 ring-indigo-400 !bg-indigo-600 !border-indigo-700 !shadow-none scale-125 z-50 translate-y-[-2px]' : ''}
                                        ${isHovered && !isPlan ? 'scale-150 -translate-y-3 z-[100] shadow-2xl ring-2 ring-white/50' : ''}
                                      `}
                                    >
                                      <div className="absolute inset-x-1 top-0.5 h-0.5 bg-white/30 rounded-full"></div>
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
              </section>
            </div>
          </div>
        </div>

        <div className="xl:col-span-5 h-[850px]">
          <form onSubmit={handleAssign} className="bg-slate-900 rounded-[56px] p-12 text-white flex flex-col gap-12 h-full shadow-2xl border-[12px] border-slate-800">
            <div className="flex items-center gap-6">
              <div className="w-16 h-16 bg-slate-800 rounded-[24px] flex items-center justify-center shadow-2xl group hover:scale-110 transition-transform">
                <PlusCircle className="w-8 h-8 text-white" />
              </div>
              <div>
                <h3 className="text-2xl font-black uppercase tracking-tight italic">创建排程调度单</h3>
                <p className="text-[11px] text-slate-600 font-black uppercase tracking-widest mt-2">New Fleet Operation Plan</p>
              </div>
            </div>

            <div className="flex-1 space-y-12 overflow-y-auto pr-4 scrollbar-hide">
              <div className="grid grid-cols-2 gap-8">
                <div className="space-y-4">
                  <label className="text-[10px] font-black text-slate-500 uppercase tracking-widest px-1">任务日期</label>
                  <input type="date" value={taskDate} onChange={(e) => setTaskDate(e.target.value)} className="w-full bg-white/5 border-2 border-white/10 p-6 rounded-[20px] font-black text-sm focus:ring-4 focus:ring-indigo-500/20 transition-all text-white" />
                </div>
                <div className="space-y-4">
                  <label className="text-[10px] font-black text-slate-500 uppercase tracking-widest px-1">开始时刻</label>
                  <select value={startIdx} onChange={(e) => setStartIdx(parseInt(e.target.value))} className="w-full bg-white/5 border-2 border-white/10 p-6 rounded-[20px] font-black text-sm focus:ring-4 focus:ring-indigo-500/20 transition-all appearance-none text-white">
                    {Array.from({length:48}).map((_, i) => <option key={i} value={i} className="text-slate-900">{formatIdxToTime(i)}</option>)}
                  </select>
                </div>
              </div>

              <div className="space-y-6">
                <label className="text-[10px] font-black text-slate-500 uppercase tracking-widest px-1 flex justify-between items-center">
                  预计任务总历时 ({(durationIdx * 30 / 60).toFixed(1)}H)
                  <Timer className="w-5 h-5 text-slate-600" />
                </label>
                <div className="px-8 py-10 bg-white/5 rounded-[28px] border-2 border-white/5 shadow-inner">
                  <input type="range" min="1" max="24" value={durationIdx} onChange={(e) => setDurationIdx(parseInt(e.target.value))} className="w-full h-4 bg-slate-800 rounded-full appearance-none cursor-pointer accent-indigo-500 shadow-2xl" />
                </div>
              </div>

              <div className="space-y-6">
                 <select value={selectedDriverId} onChange={(e) => setSelectedDriverId(e.target.value)} className="w-full bg-white/5 border-2 border-white/10 p-7 rounded-[24px] font-black text-sm appearance-none focus:ring-4 focus:ring-indigo-500/20 transition-all text-white">
                   <option value="" className="text-slate-900">🪪 选择执行司机...</option>
                   {availableDrivers.map(d => <option key={d.id} value={d.id} className="text-slate-900">{d.name} (空闲)</option>)}
                 </select>
                 <select value={selectedVehicleId} onChange={(e) => setSelectedVehicleId(e.target.value)} className="w-full bg-white/5 border-2 border-white/10 p-7 rounded-[24px] font-black text-sm appearance-none focus:ring-4 focus:ring-indigo-500/20 transition-all text-white">
                   <option value="" className="text-slate-900">🚚 选择调度车辆...</option>
                   {availableVehicles.map(v => <option key={v.id} value={v.id} className="text-slate-900">{v.plateNumber} ({v.type})</option>)}
                 </select>
              </div>

              <div className="space-y-6 bg-white/5 p-10 rounded-[40px] border-2 border-white/5 shadow-inner">
                <div className="flex gap-5 items-center bg-black/40 p-7 rounded-[20px] border-2 border-white/5 group-focus-within:border-emerald-500/50 transition-colors">
                  <MapPin className="text-emerald-400 w-7 h-7" />
                  <input value={from} onChange={(e) => setFrom(e.target.value)} placeholder="设定起始位置..." className="bg-transparent text-sm font-black w-full focus:outline-none placeholder:text-slate-700" />
                </div>
                <div className="flex gap-5 items-center bg-black/40 p-7 rounded-[20px] border-2 border-white/5 group-focus-within:border-rose-500/50 transition-colors">
                  <MapPin className="text-rose-400 w-7 h-7" />
                  <input value={to} onChange={(e) => setTo(e.target.value)} placeholder="设定目标终点..." className="bg-transparent text-sm font-black w-full focus:outline-none placeholder:text-slate-700" />
                </div>
              </div>
            </div>

            <button disabled={!isFormValid} type="submit" className={`w-full py-8 rounded-[28px] font-black uppercase tracking-[0.4em] text-xs flex items-center justify-center gap-6 transition-all ${isFormValid ? 'bg-indigo-600 hover:bg-indigo-500 shadow-[0_25px_50px_rgba(79,70,229,0.3)] hover:scale-[1.03] active:scale-95' : 'bg-white/5 text-slate-800 opacity-50 cursor-not-allowed border-2 border-white/5'}`}>
              <CheckCircle2 className="w-7 h-7" /> 确认指派调度单
            </button>
          </form>
        </div>
      </div>
    </div>
  );
};

export default MatchingCenter;
