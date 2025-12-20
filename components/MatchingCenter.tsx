
import React, { useState } from 'react';
import { Driver, Vehicle, DriverStatus, VehicleStatus, Task, DriverSchedule, VehicleSchedule } from '../types';
import { 
  Zap, ArrowRight, User, Car, Clock, MapPin, 
  CheckCircle2, AlertCircle, Calendar, Sparkles, PlusCircle,
  Timer
} from 'lucide-react';

interface Props {
  drivers: Driver[];
  vehicles: Vehicle[];
  driverSchedules: DriverSchedule[];
  vehicleSchedules: VehicleSchedule[];
  onCreateTask: (task: Partial<Task>) => void;
}

const MatchingCenter: React.FC<Props> = ({ drivers, vehicles, driverSchedules, vehicleSchedules, onCreateTask }) => {
  const [selectedDriverId, setSelectedDriverId] = useState<string>('');
  const [selectedVehicleId, setSelectedVehicleId] = useState<string>('');
  const [startHour, setStartHour] = useState<number>(new Date().getHours());
  const [duration, setDuration] = useState<number>(2);
  const [from, setFrom] = useState('');
  const [to, setTo] = useState('');
  const [priority, setPriority] = useState<'HIGH' | 'MEDIUM' | 'LOW'>('MEDIUM');

  const hours = Array.from({ length: 24 }, (_, i) => i);

  // 核心逻辑：基于起始时间和持续时长，判断司机/车辆是否全程空闲
  const isDriverAvailableForRange = (driverId: string, start: number, dur: number) => {
    const sched = driverSchedules.find(s => s.driverId === driverId);
    if (!sched) return false;
    const end = Math.min(23, start + dur - 1);
    const rangeSlots = sched.slots.filter(s => s.hour >= start && s.hour <= end);
    return rangeSlots.every(s => s.status === DriverStatus.FREE);
  };

  const isVehicleAvailableForRange = (vehicleId: string, start: number, dur: number) => {
    const v = vehicles.find(v => v.id === vehicleId);
    if (!v || v.status !== VehicleStatus.ACTIVE) return false;
    const sched = vehicleSchedules.find(s => s.vehicleId === vehicleId);
    if (!sched) return false;
    const end = Math.min(23, start + dur - 1);
    const rangeSlots = sched.slots.filter(s => s.hour >= start && s.hour <= end);
    return rangeSlots.every(s => s.isAvailable);
  };

  const availableDrivers = drivers.filter(d => isDriverAvailableForRange(d.id, startHour, duration));
  const availableVehicles = vehicles.filter(v => isVehicleAvailableForRange(v.id, startHour, duration));

  const handleAssign = (e: React.FormEvent) => {
    e.preventDefault();
    if (!selectedDriverId || !selectedVehicleId || !from || !to) return;

    const driver = drivers.find(d => d.id === selectedDriverId);
    const vehicle = vehicles.find(v => v.id === selectedVehicleId);

    const startTime = new Date();
    startTime.setHours(startHour, 0, 0, 0);
    const endTime = new Date(startTime);
    endTime.setHours(startTime.getHours() + duration);

    onCreateTask({
      title: `${driver?.name} | ${vehicle?.plateNumber} | 接送任务`,
      driverId: selectedDriverId,
      vehicleId: selectedVehicleId,
      startTime: startTime.toISOString(),
      endTime: endTime.toISOString(),
      locationStart: from,
      locationEnd: to,
      priority,
      status: 'PENDING'
    });

    setFrom('');
    setTo('');
    setSelectedDriverId('');
    setSelectedVehicleId('');
  };

  return (
    <div className="h-full flex flex-col gap-8 animate-in fade-in slide-in-from-bottom-6 duration-700">
      <div className="flex justify-between items-center">
        <div>
          <h2 className="text-3xl font-black text-slate-800 tracking-tight">智能排班匹配中心</h2>
          <p className="text-slate-500 font-bold mt-1 uppercase tracking-widest text-[11px] flex items-center gap-2">
            <Sparkles className="w-4 h-4 text-amber-400" />
            全时段资源穿透视图 · 一键自动化锁资源
          </p>
        </div>
      </div>

      <div className="flex-1 grid grid-cols-1 xl:grid-cols-4 gap-8 overflow-hidden">
        {/* Availability Visualization Grid */}
        <div className="xl:col-span-3 bg-white rounded-[48px] border border-slate-100 shadow-sm flex flex-col overflow-hidden">
           <div className="p-8 border-b border-slate-50 flex justify-between items-center bg-slate-50/50">
              <div className="flex items-center gap-4">
                 <div className="bg-indigo-600 text-white p-3 rounded-2xl shadow-lg">
                    <Calendar className="w-6 h-6" />
                 </div>
                 <div>
                    <h3 className="font-black text-slate-800 text-lg">资源 24H 占用矩阵</h3>
                    <p className="text-[10px] font-bold text-slate-400 uppercase">实时同步：{new Date().toLocaleDateString()}</p>
                 </div>
              </div>
              <div className="flex items-center gap-6 bg-white px-6 py-3 rounded-2xl border border-slate-100">
                 <div className="flex items-center gap-2 text-[10px] font-black uppercase text-slate-400">
                    <div className="w-3 h-3 bg-emerald-100 rounded-sm"></div> 空闲可用
                 </div>
                 <div className="flex items-center gap-2 text-[10px] font-black uppercase text-slate-400">
                    <div className="w-3 h-3 bg-rose-200 rounded-sm"></div> 已分配/休息
                 </div>
                 <div className="flex items-center gap-2 text-[10px] font-black uppercase text-slate-400">
                    <div className="w-3 h-3 bg-slate-200 rounded-sm"></div> 维保/下班
                 </div>
              </div>
           </div>

           <div className="flex-1 overflow-auto p-10 scrollbar-hide space-y-12">
              {/* Drivers Matrix */}
              <section>
                <div className="flex justify-between items-end mb-6">
                  <h4 className="text-[11px] font-black text-slate-500 uppercase tracking-widest flex items-center gap-2">
                    <User className="w-4 h-4 text-indigo-500" /> 司机运力队列 (全时段)
                  </h4>
                  <div className="grid grid-cols-24 gap-1 w-[75%] px-1">
                    {[0, 6, 12, 18, 23].map(h => (
                      <span key={h} className="text-[9px] font-black text-slate-300" style={{ gridColumnStart: h + 1 }}>{h}:00</span>
                    ))}
                  </div>
                </div>
                <div className="space-y-4">
                  {drivers.map(d => (
                    <div key={d.id} className="flex items-center gap-6 group">
                      <div className="w-32 flex-shrink-0 flex items-center gap-3">
                        <img src={d.avatar} className="w-10 h-10 rounded-xl bg-slate-50 border border-slate-100 shadow-sm" alt="" />
                        <span className="text-sm font-black text-slate-700 truncate">{d.name}</span>
                      </div>
                      <div className="flex-1 grid grid-cols-24 gap-1 h-8">
                        {driverSchedules.find(s => s.driverId === d.id)?.slots.map(slot => (
                          <div 
                            key={slot.hour} 
                            className={`rounded-md transition-all ${
                              slot.status === DriverStatus.FREE ? 'bg-emerald-100 hover:bg-emerald-200' : 
                              slot.status === DriverStatus.OFF_DUTY ? 'bg-slate-100' : 'bg-rose-200'
                            }`}
                          ></div>
                        ))}
                      </div>
                    </div>
                  ))}
                </div>
              </section>

              {/* Vehicles Matrix */}
              <section>
                <div className="flex justify-between items-end mb-6">
                  <h4 className="text-[11px] font-black text-slate-500 uppercase tracking-widest flex items-center gap-2">
                    <Car className="w-4 h-4 text-indigo-500" /> 车辆资产队列 (全时段)
                  </h4>
                </div>
                <div className="space-y-4">
                  {vehicles.map(v => (
                    <div key={v.id} className="flex items-center gap-6 group">
                      <div className="w-32 flex-shrink-0">
                        <p className="text-sm font-black text-slate-700">{v.plateNumber}</p>
                        <p className="text-[9px] text-slate-400 font-bold truncate">{v.model}</p>
                      </div>
                      <div className="flex-1 grid grid-cols-24 gap-1 h-8">
                        {vehicleSchedules.find(s => s.vehicleId === v.id)?.slots.map(slot => (
                          <div 
                            key={slot.hour} 
                            className={`rounded-md transition-all ${
                              slot.isAvailable ? 'bg-indigo-50 hover:bg-indigo-100' : 'bg-slate-200'
                            }`}
                          ></div>
                        ))}
                      </div>
                    </div>
                  ))}
                </div>
              </section>
           </div>
        </div>

        {/* Dispatch Panel */}
        <div className="xl:col-span-1">
           <form onSubmit={handleAssign} className="bg-slate-900 rounded-[48px] p-10 text-white shadow-2xl flex flex-col gap-8 h-full sticky top-0">
              <div className="flex items-center gap-4 mb-2">
                 <div className="w-12 h-12 bg-white/10 rounded-2xl flex items-center justify-center border border-white/10">
                    <PlusCircle className="w-6 h-6 text-indigo-400" />
                 </div>
                 <h3 className="text-2xl font-black tracking-tight italic">NEW ORDER</h3>
              </div>

              <div className="space-y-6 flex-1 overflow-y-auto pr-2 scrollbar-hide">
                 <div>
                    <label className="block text-[10px] font-black text-slate-500 uppercase tracking-widest mb-3 px-1">任务时段锁定</label>
                    <div className="grid grid-cols-2 gap-4">
                       <div className="relative">
                          <select 
                             value={startHour}
                             onChange={(e) => setStartHour(parseInt(e.target.value))}
                             className="w-full px-5 py-4 bg-white/5 border border-white/10 rounded-2xl focus:outline-none focus:ring-2 focus:ring-indigo-500 font-bold text-xs appearance-none text-white"
                          >
                             {hours.map(h => <option key={h} value={h} className="text-slate-900">{h}:00 开始</option>)}
                          </select>
                          <Clock className="absolute right-4 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-600 pointer-events-none" />
                       </div>
                       <div className="relative">
                          <select 
                             value={duration}
                             onChange={(e) => setDuration(parseInt(e.target.value))}
                             className="w-full px-5 py-4 bg-white/5 border border-white/10 rounded-2xl focus:outline-none focus:ring-2 focus:ring-indigo-500 font-bold text-xs appearance-none text-white"
                          >
                             {[1, 2, 3, 4, 6, 8, 12].map(d => <option key={d} value={d} className="text-slate-900">预计 {d} 小时</option>)}
                          </select>
                          <Timer className="absolute right-4 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-600 pointer-events-none" />
                       </div>
                    </div>
                 </div>

                 <div className="space-y-6">
                    <div>
                       <label className="block text-[10px] font-black text-slate-500 uppercase tracking-widest mb-3 px-1">可用司机筛选 ({availableDrivers.length})</label>
                       <select 
                          value={selectedDriverId}
                          onChange={(e) => setSelectedDriverId(e.target.value)}
                          className="w-full px-5 py-4 bg-white/5 border border-white/10 rounded-2xl focus:outline-none focus:ring-2 focus:ring-indigo-500 font-bold text-xs text-white"
                       >
                          <option value="" className="text-slate-900">选择一名空闲司机</option>
                          {availableDrivers.map(d => <option key={d.id} value={d.id} className="text-slate-900">{d.name} (评分 {d.rating.toFixed(1)})</option>)}
                       </select>
                    </div>

                    <div>
                       <label className="block text-[10px] font-black text-slate-500 uppercase tracking-widest mb-3 px-1">可用车辆筛选 ({availableVehicles.length})</label>
                       <select 
                          value={selectedVehicleId}
                          onChange={(e) => setSelectedVehicleId(e.target.value)}
                          className="w-full px-5 py-4 bg-white/5 border border-white/10 rounded-2xl focus:outline-none focus:ring-2 focus:ring-indigo-500 font-bold text-xs text-white"
                       >
                          <option value="" className="text-slate-900">选择一台健康车辆</option>
                          {availableVehicles.map(v => <option key={v.id} value={v.id} className="text-slate-900">{v.plateNumber} ({v.model})</option>)}
                       </select>
                    </div>

                    <div className="space-y-4">
                       <label className="block text-[10px] font-black text-slate-500 uppercase tracking-widest px-1">行程地点</label>
                       <input 
                          type="text" 
                          placeholder="输入起点..."
                          value={from}
                          onChange={(e) => setFrom(e.target.value)}
                          className="w-full px-5 py-4 bg-white/5 border border-white/10 rounded-2xl focus:outline-none focus:ring-2 focus:ring-indigo-500 font-bold text-xs text-white"
                       />
                       <input 
                          type="text" 
                          placeholder="输入目的地..."
                          value={to}
                          onChange={(e) => setTo(e.target.value)}
                          className="w-full px-5 py-4 bg-white/5 border border-white/10 rounded-2xl focus:outline-none focus:ring-2 focus:ring-indigo-500 font-bold text-xs text-white"
                       />
                    </div>
                 </div>
              </div>

              <button 
                 type="submit"
                 disabled={!selectedDriverId || !selectedVehicleId || !from || !to}
                 className="w-full bg-indigo-600 hover:bg-indigo-700 disabled:bg-white/10 disabled:text-slate-500 text-white py-6 rounded-[32px] font-black shadow-2xl transition-all hover:scale-[1.02] active:scale-95 uppercase tracking-widest text-[10px] flex items-center justify-center gap-3"
              >
                 <CheckCircle2 className="w-5 h-5" />
                 生成接送订单
              </button>
           </form>
        </div>
      </div>
    </div>
  );
};

export default MatchingCenter;
