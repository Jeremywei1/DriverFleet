
import React, { useState, useMemo } from 'react';
import { Driver, Vehicle, DriverStatus, Task, DriverSchedule, VehicleSchedule } from '../types';
import { 
  Zap, Clock, MapPin, CheckCircle2, Calendar, Sparkles, PlusCircle,
  Timer, Info, ChevronRight, MousePointer2, Car, AlertCircle, ToggleLeft, ToggleRight, Layers
} from 'lucide-react';

interface Props {
  drivers: Driver[];
  vehicles: Vehicle[];
  driverSchedules: DriverSchedule[];
  vehicleSchedules: VehicleSchedule[];
  onCreateTask: (task: Partial<Task>) => void;
}

const MatchingCenter: React.FC<Props> = ({ drivers, vehicles, driverSchedules, vehicleSchedules, onCreateTask }) => {
  // 基础状态
  const [isMultiDay, setIsMultiDay] = useState(false);
  const [taskDate, setTaskDate] = useState<string>(new Date().toISOString().split('T')[0]);
  const [endDate, setEndDate] = useState<string>(new Date().toISOString().split('T')[0]);
  
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
      if (isMultiDay) return d.isActive; // 跨天模式简化判断
      const schedule = driverSchedules.find(s => s.driverId === d.id);
      if (!schedule || !schedule.slots) return true; 
      for(let i = startIdx; i < Math.min(48, startIdx + durationIdx); i++) {
        const slot = schedule.slots[i];
        if(slot && slot.status !== DriverStatus.FREE) return false;
      }
      return true;
    }),
    [drivers, driverSchedules, startIdx, durationIdx, isMultiDay]
  );

  const availableVehicles = useMemo(() => 
    vehicles.filter(v => {
      if (!v.isActive) return false;
      if (isMultiDay) return true; // 跨天模式简化判断
      const schedule = vehicleSchedules.find(s => s.vehicleId === v.id);
      if (!schedule || !schedule.slots) return true;
      for(let i = startIdx; i < Math.min(48, startIdx + durationIdx); i++) {
        const slot = schedule.slots[i];
        if(slot && !slot.isAvailable) return false;
      }
      return true;
    }),
    [vehicles, vehicleSchedules, startIdx, durationIdx, isMultiDay]
  );

  const isFormValid = selectedDriverId && selectedVehicleId && from.trim() && to.trim();

  const handleAssign = (e?: React.FormEvent) => {
    if (e) e.preventDefault();
    if (!isFormValid) return;

    let startTime, endTime, finalDate;

    if (isMultiDay) {
      // 跨天模式：设置全天占用
      startTime = `${taskDate}T00:00:00`;
      endTime = `${endDate}T23:59:59`;
      finalDate = taskDate; // 以起始日作为主关联日期
    } else {
      // 单天模式：精细化小时选择
      const baseDate = new Date(taskDate);
      const startHour = Math.floor(startIdx / 2);
      const startMin = startIdx % 2 === 0 ? 0 : 30;
      const endIdxTotal = startIdx + durationIdx;
      const endHour = Math.floor(endIdxTotal / 2);
      const endMin = endIdxTotal % 2 === 0 ? 0 : 30;

      startTime = new Date(new Date(baseDate).setHours(startHour, startMin, 0, 0)).toISOString();
      endTime = new Date(new Date(baseDate).setHours(endHour, endMin, 0, 0)).toISOString();
      finalDate = taskDate;
    }

    onCreateTask({
      title: `${from} → ${to}`,
      driverId: selectedDriverId,
      vehicleId: selectedVehicleId,
      startTime,
      endTime,
      locationStart: from,
      locationEnd: to,
      priority: isMultiDay ? 'HIGH' : 'MEDIUM',
      status: 'IN_PROGRESS',
      date: finalDate
    });

    setFrom(''); setTo(''); setSelectedDriverId(''); setSelectedVehicleId('');
  };

  const formatIdxToTime = (idx: number) => {
    const h = Math.floor(idx / 2);
    const m = idx % 2 === 0 ? '00' : '30';
    return `${h.toString().padStart(2, '0')}:${m}`;
  };

  const hours24 = Array.from({ length: 24 }, (_, i) => i);

  return (
    <div className="flex flex-col gap-8 animate-in fade-in duration-700 pb-12 select-none">
      <div className="flex justify-between items-center bg-white p-10 rounded-[48px] border-2 border-slate-100 shadow-sm relative overflow-hidden">
        <div className="relative z-10">
          <h2 className="text-3xl font-black text-slate-800 tracking-tighter italic uppercase flex items-center gap-4">
            <Zap className="w-10 h-10 text-slate-400 fill-slate-50" />
            排程规划中心
          </h2>
        </div>
        <div className="flex items-center gap-6">
           {/* 跨天模式切换器 */}
           <div className="flex items-center bg-slate-100 p-1.5 rounded-2xl gap-2">
              <span className="text-[10px] font-black text-slate-400 uppercase tracking-widest px-3">任务类型</span>
              <button 
                onClick={() => setIsMultiDay(false)}
                className={`px-4 py-2 rounded-xl text-[10px] font-black uppercase tracking-widest transition-all ${!isMultiDay ? 'bg-white shadow-md text-indigo-600' : 'text-slate-400'}`}
              >
                单日精细
              </button>
              <button 
                onClick={() => setIsMultiDay(true)}
                className={`px-4 py-2 rounded-xl text-[10px] font-black uppercase tracking-widest transition-all ${isMultiDay ? 'bg-indigo-600 shadow-md text-white' : 'text-slate-400'}`}
              >
                跨天长途
              </button>
           </div>

           <div className="bg-slate-900 border-[8px] border-slate-800 px-12 py-6 rounded-[40px] shadow-2xl relative z-10 group transition-all hover:scale-105 text-center text-white min-w-[280px]">
             <span className="text-[10px] font-black text-slate-500 uppercase block mb-1">
               {isMultiDay ? '选定跨天时段' : '选定规划时间窗'}
             </span>
             <span className="text-2xl font-black text-[#10B981] flex items-center justify-center gap-4">
               {isMultiDay ? (
                 <><Calendar className="w-6 h-6 text-emerald-400" /> {taskDate.slice(5)} ~ {endDate.slice(5)}</>
               ) : (
                 <><Clock className="w-6 h-6 text-emerald-400" /> {formatIdxToTime(startIdx)} — {formatIdxToTime(startIdx + durationIdx)}</>
               )}
             </span>
           </div>
        </div>
      </div>

      <div className="grid grid-cols-1 xl:grid-cols-12 gap-10">
        {/* 左侧负载轴矩阵 */}
        <div className={`xl:col-span-7 bg-white rounded-[56px] border-2 border-slate-100 shadow-xl flex flex-col h-[850px] overflow-hidden transition-opacity ${isMultiDay ? 'opacity-40 pointer-events-none grayscale' : ''}`}>
          <div className="bg-white p-8 border-b-2 border-slate-50 flex justify-between items-center shadow-sm">
            <span className="font-black text-slate-800 uppercase text-xs tracking-widest italic flex items-center gap-3">
              <Sparkles className="w-5 h-5 text-slate-300" />
              运力规划轴 (跨天模式下仅作参考)
            </span>
          </div>

          <div className="flex-1 overflow-auto p-10 scrollbar-hide relative flex flex-col">
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

            <div className="space-y-20 flex-1 h-fit pb-10">
              <section className="space-y-12">
                  <div className="text-[10px] font-black text-slate-300 uppercase tracking-[0.3em] mb-4">驾驶员资源池</div>
                  {drivers.map(d => (
                    <div key={d.id} className="flex items-center group/row">
                      <div onClick={() => setSelectedDriverId(d.id)} className={`w-24 flex-shrink-0 text-sm font-black truncate pr-4 cursor-pointer transition-colors ${selectedDriverId === d.id ? 'text-indigo-600' : 'text-slate-700'}`}>{d.name}</div>
                      <div className={`flex-1 grid grid-cols-24 gap-0 py-4 rounded-[28px] border-2 transition-all ${selectedDriverId === d.id ? 'bg-indigo-50 border-indigo-200 shadow-lg' : 'bg-slate-50/10 border-slate-100'}`}>
                         {hours24.map(h => (
                           <div key={h} className="flex justify-center items-center h-10">
                             <div className="grid grid-cols-2 gap-1.5 w-[85%] h-full">
                               {[0, 1].map(half => {
                                 const isPlan = (h * 2 + half) >= startIdx && (h * 2 + half) < startIdx + durationIdx && selectedDriverId === d.id;
                                 return <div key={half} className={`relative rounded-md transition-all border bg-[#10B981] border-[#34D399] shadow-[0_4px_0_0_#064E3B] ${isPlan ? 'ring-4 ring-indigo-400 !bg-indigo-600 !border-indigo-700 !shadow-none scale-125 z-50' : ''}`} />;
                               })}
                             </div>
                           </div>
                         ))}
                      </div>
                    </div>
                  ))}
              </section>
            </div>
          </div>
        </div>

        {/* 右侧指派表单 */}
        <div className="xl:col-span-5 h-[850px]">
          <form onSubmit={handleAssign} className="bg-slate-900 rounded-[56px] p-12 text-white flex flex-col gap-10 h-full shadow-2xl border-[12px] border-slate-800">
            <div className="flex items-center gap-6">
              <div className="w-16 h-16 bg-slate-800 rounded-[24px] flex items-center justify-center shadow-2xl">
                {isMultiDay ? <Layers className="w-8 h-8 text-emerald-400" /> : <PlusCircle className="w-8 h-8 text-white" />}
              </div>
              <div>
                <h3 className="text-2xl font-black uppercase tracking-tight italic">{isMultiDay ? '配置长途跨天任务' : '创建执行调度单'}</h3>
                <p className="text-[11px] text-slate-600 font-black uppercase tracking-widest mt-2">{isMultiDay ? 'Multi-day Long Route' : 'New Execution Plan'}</p>
              </div>
            </div>

            <div className="flex-1 space-y-10 overflow-y-auto pr-4 scrollbar-hide">
              {/* 日期/时间选择区 */}
              <div className="grid grid-cols-2 gap-8">
                <div className="space-y-3">
                  <label className="text-[10px] font-black text-slate-500 uppercase tracking-widest px-1">
                    {isMultiDay ? '起始日期' : '任务日期'}
                  </label>
                  <input type="date" value={taskDate} onChange={(e) => setTaskDate(e.target.value)} className="w-full bg-white/5 border-2 border-white/10 p-5 rounded-[20px] font-black text-sm text-white" />
                </div>
                <div className="space-y-3">
                  {isMultiDay ? (
                    <>
                      <label className="text-[10px] font-black text-slate-500 uppercase tracking-widest px-1">结束日期</label>
                      <input type="date" value={endDate} onChange={(e) => setEndDate(e.target.value)} className="w-full bg-white/5 border-2 border-white/10 p-5 rounded-[20px] font-black text-sm text-white" />
                    </>
                  ) : (
                    <>
                      <label className="text-[10px] font-black text-slate-500 uppercase tracking-widest px-1">开始时刻</label>
                      <select value={startIdx} onChange={(e) => setStartIdx(parseInt(e.target.value))} className="w-full bg-white/5 border-2 border-white/10 p-5 rounded-[20px] font-black text-sm appearance-none text-white">
                        {Array.from({length:48}).map((_, i) => <option key={i} value={i} className="text-slate-900">{formatIdxToTime(i)}</option>)}
                      </select>
                    </>
                  )}
                </div>
              </div>

              {!isMultiDay && (
                <div className="space-y-3">
                   <label className="text-[10px] font-black text-slate-500 uppercase tracking-widest px-1">持续时长 (0.5h 步长)</label>
                   <div className="flex items-center gap-4">
                     <input type="range" min="1" max="24" value={durationIdx} onChange={(e) => setDurationIdx(parseInt(e.target.value))} className="flex-1 accent-indigo-500" />
                     <span className="font-black text-indigo-400 text-lg">{durationIdx * 0.5} H</span>
                   </div>
                </div>
              )}

              <div className="space-y-4">
                 <div className="space-y-2">
                    <label className="text-[10px] font-black text-slate-500 uppercase tracking-widest px-1">指派司机</label>
                    <select value={selectedDriverId} onChange={(e) => setSelectedDriverId(e.target.value)} className="w-full bg-white/5 border-2 border-white/10 p-6 rounded-[24px] font-black text-sm appearance-none text-white">
                      <option value="" className="text-slate-900">🪪 选择可用司机 ({availableDrivers.length})</option>
                      {availableDrivers.map(d => <option key={d.id} value={d.id} className="text-slate-900">{d.name}</option>)}
                    </select>
                 </div>
                 
                 <div className="space-y-2">
                    <label className="text-[10px] font-black text-slate-500 uppercase tracking-widest px-1">调度车辆</label>
                    <select value={selectedVehicleId} onChange={(e) => setSelectedVehicleId(e.target.value)} className="w-full bg-white/5 border-2 border-white/10 p-6 rounded-[24px] font-black text-sm appearance-none text-white">
                      <option value="" className="text-slate-900">🚚 选择可用车辆 ({availableVehicles.length})</option>
                      {availableVehicles.map(v => <option key={v.id} value={v.id} className="text-slate-900">{v.plateNumber}</option>)}
                    </select>
                 </div>
              </div>

              <div className="space-y-4 bg-white/5 p-8 rounded-[40px] border-2 border-white/5 shadow-inner">
                <div className="flex gap-4 items-center bg-black/40 p-6 rounded-[20px] border-2 border-white/5">
                  <MapPin className="text-emerald-400 w-6 h-6" />
                  <input value={from} onChange={(e) => setFrom(e.target.value)} placeholder="设定起始位置..." className="bg-transparent text-sm font-black w-full text-white" />
                </div>
                <div className="flex gap-4 items-center bg-black/40 p-6 rounded-[20px] border-2 border-white/5">
                  <MapPin className="text-rose-400 w-6 h-6" />
                  <input value={to} onChange={(e) => setTo(e.target.value)} placeholder="设定目标终点..." className="bg-transparent text-sm font-black w-full text-white" />
                </div>
              </div>
            </div>

            <button disabled={!isFormValid} type="submit" className={`w-full py-7 rounded-[28px] font-black uppercase tracking-[0.4em] text-xs flex items-center justify-center gap-6 transition-all ${isFormValid ? 'bg-indigo-600 hover:bg-indigo-500 shadow-xl text-white' : 'bg-white/5 text-slate-700 border-2 border-white/5'}`}>
              <CheckCircle2 className="w-6 h-6" /> 确认指派并执行
            </button>
          </form>
        </div>
      </div>
    </div>
  );
};

export default MatchingCenter;
