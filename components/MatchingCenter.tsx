
import React, { useState, useMemo } from 'react';
import { Driver, Vehicle, DriverStatus, Task, DriverSchedule, VehicleSchedule } from '../types';
import { 
  Zap, Clock, MapPin, CheckCircle2, Calendar, Sparkles, PlusCircle,
  Timer, Info, ChevronRight, Car, AlertCircle, Layers,
  ChevronLeft
} from 'lucide-react';

interface Props {
  drivers: Driver[];
  vehicles: Vehicle[];
  driverSchedules: DriverSchedule[];
  vehicleSchedules: VehicleSchedule[];
  onCreateTask: (task: Partial<Task>) => void;
  currentDate: string;
  onDateChange: (date: string) => void;
}

const MatchingCenter: React.FC<Props> = ({ 
  drivers, 
  vehicles, 
  driverSchedules, 
  vehicleSchedules, 
  onCreateTask,
  currentDate,
  onDateChange
}) => {
  const [isMultiDay, setIsMultiDay] = useState(false);
  const [endDate, setEndDate] = useState<string>(currentDate);
  const [selectedDriverId, setSelectedDriverId] = useState<string>('');
  const [selectedVehicleId, setSelectedVehicleId] = useState<string>('');
  const [startIdx, setStartIdx] = useState<number>(16); 
  const [durationIdx, setDurationIdx] = useState<number>(4); 
  const [from, setFrom] = useState('');
  const [to, setTo] = useState('');

  const availableDrivers = useMemo(() => 
    drivers.filter(d => {
      if (!d.isActive) return false;
      if (isMultiDay) return true;
      const schedule = driverSchedules.find(s => s.driverId === d.id);
      if (!schedule || !schedule.slots) return true; 
      for(let i = startIdx; i < Math.min(48, startIdx + durationIdx); i++) {
        if(schedule.slots[i] && schedule.slots[i].status !== DriverStatus.FREE) return false;
      }
      return true;
    }),
    [drivers, driverSchedules, startIdx, durationIdx, isMultiDay]
  );

  const availableVehicles = useMemo(() => 
    vehicles.filter(v => {
      if (!v.isActive) return false;
      if (isMultiDay) return true;
      const schedule = vehicleSchedules.find(s => s.vehicleId === v.id);
      if (!schedule || !schedule.slots) return true;
      for(let i = startIdx; i < Math.min(48, startIdx + durationIdx); i++) {
        if(schedule.slots[i] && !schedule.slots[i].isAvailable) return false;
      }
      return true;
    }),
    [vehicles, vehicleSchedules, startIdx, durationIdx, isMultiDay]
  );

  const handleAssign = (e?: React.FormEvent) => {
    if (e) e.preventDefault();
    if (!selectedDriverId || !selectedVehicleId || !from.trim() || !to.trim()) return;

    let startTime, endTime;
    if (isMultiDay) {
      startTime = `${currentDate}T00:00:00`;
      endTime = `${endDate}T23:59:59`;
    } else {
      const baseDate = new Date(currentDate);
      const startHour = Math.floor(startIdx / 2);
      const startMin = startIdx % 2 === 0 ? 0 : 30;
      const endIdxTotal = startIdx + durationIdx;
      const endHour = Math.floor(endIdxTotal / 2);
      const endMin = endIdxTotal % 2 === 0 ? 0 : 30;
      startTime = new Date(new Date(baseDate).setHours(startHour, startMin, 0, 0)).toISOString();
      endTime = new Date(new Date(baseDate).setHours(endHour, endMin, 0, 0)).toISOString();
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
      date: currentDate
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
    <div className="flex flex-col gap-6 animate-in fade-in duration-700 pb-12 select-none h-full max-h-full">
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 flex-1 min-h-0">
        
        {/* 左侧负载轴矩阵：优化行高与视觉节奏 */}
        <div className={`lg:col-span-7 bg-white rounded-[40px] border border-slate-100 shadow-xl flex flex-col overflow-hidden transition-all ${isMultiDay ? 'opacity-30 blur-[2px] pointer-events-none' : ''}`}>
          <div className="bg-white px-8 py-6 border-b border-slate-50 flex justify-between items-center flex-shrink-0">
            <span className="font-black text-slate-800 uppercase text-xs tracking-widest italic flex items-center gap-2">
              <Sparkles className="w-4 h-4 text-indigo-500" />
              当日负载趋势图 ({currentDate})
            </span>
          </div>

          <div className="flex-1 overflow-auto p-6 scrollbar-hide relative">
            <div className="sticky top-0 z-[110] bg-white flex py-3 -mx-6 px-6 mb-6 border-b border-slate-50">
                <span className="w-20 shrink-0 text-xs font-black text-slate-300 uppercase">驾驶员</span>
                <div className="flex-1 grid grid-cols-24 gap-0 text-center text-[10px] font-black text-slate-400">
                   {hours24.map(h => <div key={h}>{h}</div>)}
                </div>
            </div>

            <div className="space-y-3 h-fit">
              {drivers.map(d => (
                <div key={d.id} className="flex items-center group/row">
                  <div 
                    onClick={() => setSelectedDriverId(d.id)} 
                    className={`w-20 shrink-0 text-sm font-black truncate pr-3 cursor-pointer transition-colors ${selectedDriverId === d.id ? 'text-indigo-600' : 'text-slate-700 group-hover/row:text-indigo-400'}`}
                  >
                    {d.name}
                  </div>
                  <div className={`flex-1 grid grid-cols-24 gap-1 py-2 px-1 rounded-xl border transition-all ${selectedDriverId === d.id ? 'bg-indigo-50/50 border-indigo-200' : 'bg-slate-50/10 border-slate-50 group-hover/row:bg-slate-50/50'}`}>
                     {hours24.map(h => (
                       <div key={h} className="flex justify-center items-center h-6">
                         <div className="grid grid-cols-2 gap-0.5 w-full h-full px-0.5">
                           {[0, 1].map(half => {
                             const isPlan = (h * 2 + half) >= startIdx && (h * 2 + half) < startIdx + durationIdx && selectedDriverId === d.id;
                             return <div key={half} className={`rounded-[2px] transition-all border ${isPlan ? 'bg-indigo-600 border-indigo-700 shadow-md scale-110 z-10' : 'bg-emerald-500/10 border-emerald-500/5'}`} />;
                           })}
                         </div>
                       </div>
                     ))}
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>

        {/* 右侧：调度指挥表单 - 字体微调优化版 */}
        <div className="lg:col-span-5 flex flex-col">
          <form onSubmit={handleAssign} className="bg-slate-900 rounded-[40px] p-8 text-white flex flex-col gap-6 h-full shadow-2xl border border-slate-800 relative overflow-hidden">
            {/* 饰景纹理 */}
            <div className="absolute top-0 right-0 w-32 h-32 bg-indigo-500/10 blur-[60px] rounded-full -mr-16 -mt-16 pointer-events-none"></div>

            <div className="flex items-center justify-between flex-shrink-0 z-10">
              <div>
                <h3 className="text-2xl font-black uppercase tracking-tight italic">创建执行调度单</h3>
                <p className="text-[10px] text-indigo-400/60 font-black uppercase tracking-[0.2em] mt-0.5 italic">COMMAND CENTER</p>
              </div>
              <div className="bg-indigo-500/20 p-2.5 rounded-xl border border-indigo-500/30"><PlusCircle className="w-6 h-6 text-indigo-400" /></div>
            </div>

            <div className="flex-1 space-y-6 overflow-y-auto pr-2 scrollbar-hide z-10">
              
              {/* 核心模式切换：集成在此 */}
              <div className="bg-white/5 p-1 rounded-2xl flex border border-white/5 flex-shrink-0">
                <button 
                  type="button" onClick={() => setIsMultiDay(false)}
                  className={`flex-1 py-3 rounded-xl text-[10px] font-black uppercase tracking-widest transition-all ${!isMultiDay ? 'bg-indigo-600 text-white shadow-lg' : 'text-slate-500 hover:text-slate-300'}`}
                >
                  单日指派
                </button>
                <button 
                  type="button" onClick={() => setIsMultiDay(true)}
                  className={`flex-1 py-3 rounded-xl text-[10px] font-black uppercase tracking-widest transition-all ${isMultiDay ? 'bg-indigo-600 text-white shadow-lg' : 'text-slate-500 hover:text-slate-300'}`}
                >
                  跨天长途
                </button>
              </div>

              {/* 日期选择区：随模式变动 */}
              <div className="space-y-4">
                 <div className="grid grid-cols-2 gap-3">
                    <div className="space-y-1.5">
                       <label className="text-[10px] font-black text-slate-500 uppercase tracking-widest px-1">{isMultiDay ? '起始日期' : '任务日期'}</label>
                       <div className="relative">
                          <Calendar className="absolute left-3 top-1/2 -translate-y-1/2 w-3.5 h-3.5 text-indigo-400" />
                          <input 
                            type="date" value={currentDate} onChange={(e) => onDateChange(e.target.value)}
                            className="w-full bg-black/40 border border-white/5 p-3 pl-10 rounded-xl font-black text-xs text-white outline-none focus:border-indigo-500/50 transition-all cursor-pointer" 
                          />
                       </div>
                    </div>
                    {isMultiDay && (
                      <div className="space-y-1.5 animate-in slide-in-from-right-2">
                         <label className="text-[10px] font-black text-slate-500 uppercase tracking-widest px-1">结束日期</label>
                         <div className="relative">
                            <Calendar className="absolute left-3 top-1/2 -translate-y-1/2 w-3.5 h-3.5 text-emerald-400" />
                            <input 
                              type="date" value={endDate} min={currentDate} onChange={(e) => setEndDate(e.target.value)}
                              className="w-full bg-black/40 border border-white/5 p-3 pl-10 rounded-xl font-black text-xs text-white outline-none focus:border-indigo-500/50 transition-all cursor-pointer" 
                            />
                         </div>
                      </div>
                    )}
                 </div>

                 {/* 单日时段选择器：修复滑块布局 */}
                 {!isMultiDay && (
                   <div className="grid grid-cols-2 gap-3 animate-in fade-in">
                      <div className="space-y-1.5">
                        <label className="text-[10px] font-black text-slate-500 uppercase tracking-widest px-1">开始时刻</label>
                        <select value={startIdx} onChange={(e) => setStartIdx(parseInt(e.target.value))} className="w-full bg-white/5 border border-white/5 p-3 rounded-xl font-black text-xs text-white outline-none appearance-none">
                          {Array.from({length:48}).map((_, i) => <option key={i} value={i} className="text-slate-900">{formatIdxToTime(i)}</option>)}
                        </select>
                      </div>
                      <div className="space-y-1.5 overflow-hidden">
                        <div className="flex justify-between items-center px-1">
                          <label className="text-[10px] font-black text-slate-500 uppercase tracking-widest">预估时长</label>
                          <span className="text-[10px] font-black text-indigo-400">{durationIdx * 0.5} H</span>
                        </div>
                        <div className="flex items-center px-1 h-[42px]">
                          <input 
                            type="range" min="1" max="24" value={durationIdx} 
                            onChange={(e) => setDurationIdx(parseInt(e.target.value))} 
                            className="w-full accent-indigo-500 h-1 bg-white/10 rounded-lg appearance-none cursor-pointer" 
                          />
                        </div>
                      </div>
                   </div>
                 )}
              </div>

              {/* 资源匹配区 */}
              <div className="space-y-4 pt-2 border-t border-white/5">
                 <div className="space-y-1.5">
                    <label className="text-[10px] font-black text-slate-500 uppercase tracking-widest px-1">分配驾驶员</label>
                    <div className="relative">
                      <select value={selectedDriverId} onChange={(e) => setSelectedDriverId(e.target.value)} className="w-full bg-white/5 border border-white/10 p-3.5 rounded-xl font-black text-sm appearance-none text-white outline-none focus:border-indigo-500">
                        <option value="" className="text-slate-900">🪪 选择可用人员 ({availableDrivers.length})</option>
                        {availableDrivers.map(d => <option key={d.id} value={d.id} className="text-slate-900">{d.name}</option>)}
                      </select>
                      <div className="absolute right-4 top-1/2 -translate-y-1/2 pointer-events-none opacity-40"><ChevronRight className="w-4 h-4" /></div>
                    </div>
                 </div>
                 
                 <div className="space-y-1.5">
                    <label className="text-[10px] font-black text-slate-500 uppercase tracking-widest px-1">匹配执行资产</label>
                    <div className="relative">
                      <select value={selectedVehicleId} onChange={(e) => setSelectedVehicleId(e.target.value)} className="w-full bg-white/5 border border-white/10 p-3.5 rounded-xl font-black text-sm appearance-none text-white outline-none focus:border-indigo-500">
                        <option value="" className="text-slate-900">🚚 选择可用车辆 ({availableVehicles.length})</option>
                        {availableVehicles.map(v => <option key={v.id} value={v.id} className="text-slate-900">{v.plateNumber}</option>)}
                      </select>
                      <div className="absolute right-4 top-1/2 -translate-y-1/2 pointer-events-none opacity-40"><ChevronRight className="w-4 h-4" /></div>
                    </div>
                 </div>
              </div>

              {/* 地址输入区 */}
              <div className="space-y-2 pt-2">
                <div className="flex gap-3 items-center bg-black/40 p-3.5 rounded-xl border border-white/5 group-focus-within:border-indigo-500/30 transition-all">
                  <MapPin className="text-emerald-400 w-4 h-4" />
                  <input value={from} onChange={(e) => setFrom(e.target.value)} placeholder="起始位置..." className="bg-transparent text-xs font-black w-full text-white outline-none placeholder:text-slate-700" />
                </div>
                <div className="flex gap-3 items-center bg-black/40 p-3.5 rounded-xl border border-white/5 group-focus-within:border-indigo-500/30 transition-all">
                  <MapPin className="text-rose-400 w-4 h-4" />
                  <input value={to} onChange={(e) => setTo(e.target.value)} placeholder="目标终点..." className="bg-transparent text-xs font-black w-full text-white outline-none placeholder:text-slate-700" />
                </div>
              </div>
            </div>

            <button 
              disabled={!selectedDriverId || !selectedVehicleId || !from.trim() || !to.trim()} 
              type="submit" 
              className={`w-full py-5 rounded-2xl font-black uppercase tracking-[0.2em] text-xs flex items-center justify-center gap-4 transition-all active:scale-95 flex-shrink-0 z-10 ${ (selectedDriverId && selectedVehicleId && from.trim()) ? 'bg-indigo-600 hover:bg-indigo-500 text-white shadow-xl shadow-indigo-900/40' : 'bg-white/5 text-slate-700 cursor-not-allowed opacity-50'}`}
            >
              <CheckCircle2 className="w-5 h-5" /> 确认指派并执行
            </button>
          </form>
        </div>
      </div>
    </div>
  );
};

export default MatchingCenter;
