
import React, { useState, useMemo } from 'react';
import { Driver, Vehicle, DriverStatus, VehicleStatus, Task, DriverSchedule, VehicleSchedule } from '../types';
import { 
  Zap, Clock, MapPin, CheckCircle2, Calendar, Sparkles, PlusCircle,
  Timer, Info, ChevronRight, MousePointer2
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

  const gridStyle = {
    display: 'grid',
    gridTemplateColumns: 'repeat(48, minmax(0, 1fr))',
    gap: '0px'
  };

  return (
    <div className="flex flex-col gap-6 animate-in fade-in slide-in-from-bottom-6 duration-700 pb-10 select-none">
      <div className="flex justify-between items-center bg-white p-6 rounded-[32px] border border-slate-100 shadow-sm">
        <div>
          <h2 className="text-2xl font-black text-slate-800 tracking-tight">资源排程中心</h2>
          <p className="text-slate-500 font-bold text-[10px] uppercase tracking-widest flex items-center gap-2 mt-1">
            <MousePointer2 className="w-3.5 h-3.5 text-indigo-400" />
            通过交替背景色轻松识别小时区间 · 支持垂直对齐
          </p>
        </div>
        <div className="bg-indigo-50 border border-indigo-100 px-6 py-3 rounded-2xl">
          <span className="text-[10px] font-black text-indigo-400 uppercase block mb-1">已选时间段</span>
          <span className="text-sm font-black text-indigo-700">
            {formatIdxToTime(startIdx)} - {formatIdxToTime(startIdx + durationIdx)}
          </span>
        </div>
      </div>

      <div className="grid grid-cols-1 xl:grid-cols-12 gap-6">
        <div className="xl:col-span-7 bg-white rounded-[40px] border border-slate-100 shadow-sm flex flex-col h-[750px] overflow-hidden">
          <div className="p-6 border-b border-slate-50 flex justify-between items-center">
            <span className="font-black text-slate-800 uppercase text-sm">调度矩阵 ({taskDate})</span>
            <div className="flex gap-4">
               <div className="flex items-center gap-1 text-[9px] font-black text-slate-400"><div className="w-2 h-2 bg-slate-50 border border-slate-200"></div> 偶数小时</div>
               <div className="flex items-center gap-1 text-[9px] font-black text-slate-400"><div className="w-2 h-2 bg-white border border-slate-200"></div> 奇数小时</div>
            </div>
          </div>

          <div className="flex-1 overflow-y-auto p-8 scrollbar-hide space-y-10" onMouseUp={() => {setDragStart(null); setDragEnd(null);}}>
            <section>
              <div className="text-[10px] font-black text-slate-400 uppercase tracking-widest mb-6 px-1 flex justify-between">
                <span>司机可用性详情</span>
                <div className="flex-1 ml-24" style={gridStyle}>
                   {Array.from({length: 48}).map((_, i) => i % 4 === 0 && (
                     <span key={i} className="text-[9px] text-slate-300" style={{gridColumnStart: i+1}}>{Math.floor(i/2)}:00</span>
                   ))}
                </div>
              </div>
              <div className="space-y-3">
                {drivers.map(d => {
                  const sched = driverSchedules.find(s => s.driverId === d.id);
                  const isSelected = selectedDriverId === d.id;
                  return (
                    <div key={d.id} className="flex items-center group/row">
                      <div className="w-24 flex-shrink-0 text-[10px] font-black text-slate-600 truncate pr-2 group-hover/row:text-indigo-600 transition-colors">{d.name}</div>
                      <div className={`flex-1 p-1 rounded-xl border transition-all ${isSelected ? 'bg-indigo-50 border-indigo-200' : 'bg-slate-50/50 border-slate-100'}`} style={gridStyle}>
                        {sched?.slots.map((slot, idx) => {
                          const isEvenHour = Math.floor(idx / 2) % 2 === 0;
                          const isHourStart = idx % 2 === 0;
                          const isPlan = idx >= startIdx && idx < startIdx + durationIdx && isSelected;
                          const isDragging = dragStart?.id === d.id && dragEnd !== null && idx >= Math.min(dragStart.index, dragEnd) && idx <= Math.max(dragStart.index, dragEnd);
                          
                          return (
                            <div 
                              key={idx}
                              onMouseDown={() => {setDragStart({id: d.id, index: idx}); setDragEnd(idx);}}
                              onMouseEnter={() => dragStart?.id === d.id && setDragEnd(idx)}
                              onMouseUp={() => onDragEnd(d.id, 'driver')}
                              className={`
                                h-8 transition-all relative
                                ${isEvenHour ? 'bg-slate-100/40' : 'bg-white/40'}
                                ${isHourStart ? 'border-l border-slate-200/50' : ''}
                                ${isPlan ? 'z-10' : ''}
                              `}
                            >
                              <div className={`
                                absolute inset-0.5 rounded-sm transition-all
                                ${slot.status === DriverStatus.FREE ? 'bg-emerald-100/60' : 'bg-rose-200/60'}
                                ${isPlan ? 'ring-2 ring-indigo-500 bg-indigo-400 !opacity-100 scale-y-110' : ''}
                                ${isDragging ? 'bg-indigo-300' : ''}
                              `}></div>
                            </div>
                          );
                        })}
                      </div>
                    </div>
                  );
                })}
              </div>
            </section>

            <section>
              <div className="text-[10px] font-black text-slate-400 uppercase tracking-widest mb-6 px-1">资产占用详情</div>
              <div className="space-y-3">
                {vehicles.map(v => {
                  const sched = vehicleSchedules.find(s => s.vehicleId === v.id);
                  const isSelected = selectedVehicleId === v.id;
                  return (
                    <div key={v.id} className="flex items-center group/row">
                      <div className="w-24 flex-shrink-0 text-[10px] font-black text-slate-600 truncate pr-2 group-hover/row:text-indigo-600 transition-colors">{v.plateNumber.slice(-4)}</div>
                      <div className={`flex-1 p-1 rounded-xl border transition-all ${isSelected ? 'bg-indigo-50 border-indigo-200' : 'bg-slate-50/50 border-slate-100'}`} style={gridStyle}>
                        {sched?.slots.map((slot, idx) => {
                          const isEvenHour = Math.floor(idx / 2) % 2 === 0;
                          const isHourStart = idx % 2 === 0;
                          const isPlan = idx >= startIdx && idx < startIdx + durationIdx && isSelected;
                          const isDragging = dragStart?.id === v.id && dragEnd !== null && idx >= Math.min(dragStart.index, dragEnd) && idx <= Math.max(dragStart.index, dragEnd);
                          
                          return (
                            <div 
                              key={idx}
                              onMouseDown={() => {setDragStart({id: v.id, index: idx}); setDragEnd(idx);}}
                              onMouseEnter={() => dragStart?.id === v.id && setDragEnd(idx)}
                              onMouseUp={() => onDragEnd(v.id, 'vehicle')}
                              className={`
                                h-8 transition-all relative
                                ${isEvenHour ? 'bg-slate-100/40' : 'bg-white/40'}
                                ${isHourStart ? 'border-l border-slate-200/50' : ''}
                              `}
                            >
                              <div className={`
                                absolute inset-0.5 rounded-sm transition-all
                                ${slot.isAvailable ? 'bg-indigo-100/60' : 'bg-slate-300/60'}
                                ${isPlan ? 'ring-2 ring-indigo-500 bg-indigo-400 !opacity-100 scale-y-110' : ''}
                                ${isDragging ? 'bg-indigo-300' : ''}
                              `}></div>
                            </div>
                          );
                        })}
                      </div>
                    </div>
                  );
                })}
              </div>
            </section>
          </div>
        </div>

        <div className="xl:col-span-5 h-[750px]">
          <form onSubmit={handleAssign} className="bg-slate-900 rounded-[40px] p-8 text-white flex flex-col gap-6 h-full shadow-2xl">
            <div className="flex items-center gap-4">
              <PlusCircle className="w-8 h-8 text-indigo-400" />
              <h3 className="text-xl font-black uppercase tracking-tight">新任务排程表单</h3>
            </div>

            <div className="flex-1 space-y-5 overflow-y-auto pr-2 scrollbar-hide">
              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-2">
                  <label className="text-[10px] font-black text-slate-500 uppercase tracking-widest">任务日期</label>
                  <input type="date" value={taskDate} onChange={(e) => setTaskDate(e.target.value)} className="w-full bg-white/5 border border-white/10 p-4 rounded-2xl font-bold text-xs" />
                </div>
                <div className="space-y-2">
                  <label className="text-[10px] font-black text-slate-500 uppercase tracking-widest">开始时间</label>
                  <select value={startIdx} onChange={(e) => setStartIdx(parseInt(e.target.value))} className="w-full bg-white/5 border border-white/10 p-4 rounded-2xl font-bold text-xs">
                    {Array.from({length:48}).map((_, i) => <option key={i} value={i} className="text-slate-900">{formatIdxToTime(i)}</option>)}
                  </select>
                </div>
              </div>

              <div className="space-y-2">
                <label className="text-[10px] font-black text-slate-500 uppercase tracking-widest">任务时长 (30min 增量)</label>
                <div className="flex items-center gap-4 bg-white/5 p-4 rounded-2xl border border-white/10">
                  <Timer className="w-5 h-5 text-indigo-400" />
                  <input type="range" min="1" max="24" value={durationIdx} onChange={(e) => setDurationIdx(parseInt(e.target.value))} className="flex-1" />
                  <span className="font-black text-indigo-400">{(durationIdx * 30 / 60).toFixed(1)}h</span>
                </div>
              </div>

              <div className="space-y-4">
                <select value={selectedDriverId} onChange={(e) => setSelectedDriverId(e.target.value)} className="w-full bg-white/5 border border-white/10 p-4 rounded-2xl font-bold text-xs">
                  <option value="" className="text-slate-900">请选择司机 ({availableDrivers.length} 可用)</option>
                  {availableDrivers.map(d => <option key={d.id} value={d.id} className="text-slate-900">{d.name}</option>)}
                </select>
                <select value={selectedVehicleId} onChange={(e) => setSelectedVehicleId(e.target.value)} className="w-full bg-white/5 border border-white/10 p-4 rounded-2xl font-bold text-xs">
                  <option value="" className="text-slate-900">请选择车辆 ({availableVehicles.length} 可用)</option>
                  {availableVehicles.map(v => <option key={v.id} value={v.id} className="text-slate-900">{v.plateNumber}</option>)}
                </select>
              </div>

              <div className="space-y-3 bg-white/5 p-5 rounded-3xl border border-white/5">
                <div className="flex gap-4"><MapPin className="text-emerald-400 w-5 h-5" /><input value={from} onChange={(e) => setFrom(e.target.value)} placeholder="起始地..." className="bg-transparent text-xs font-bold w-full" /></div>
                <div className="flex gap-4"><MapPin className="text-rose-400 w-5 h-5" /><input value={to} onChange={(e) => setTo(e.target.value)} placeholder="目的地..." className="bg-transparent text-xs font-bold w-full" /></div>
              </div>
            </div>

            <button disabled={!isFormValid} type="submit" className={`w-full py-5 rounded-[28px] font-black uppercase tracking-widest text-sm flex items-center justify-center gap-3 transition-all ${isFormValid ? 'bg-indigo-600 hover:bg-indigo-500 shadow-xl shadow-indigo-500/30' : 'bg-white/5 text-slate-700 opacity-50 cursor-not-allowed'}`}>
              <CheckCircle2 className="w-6 h-6" /> 确认提交排单
            </button>
          </form>
        </div>
      </div>
    </div>
  );
};

export default MatchingCenter;
