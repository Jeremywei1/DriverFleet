
import React, { useState, useMemo } from 'react';
import { Driver, Vehicle, DriverStatus, VehicleStatus, Task, DriverSchedule, VehicleSchedule } from '../types';
import { 
  Zap, ArrowRight, User, Car, Clock, MapPin, 
  CheckCircle2, AlertCircle, Calendar, Sparkles, PlusCircle,
  Timer, Info, ChevronRight
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
  const [startHour, setStartHour] = useState<number>(8); // 默认早班 8 点开始
  const [duration, setDuration] = useState<number>(2);
  const [from, setFrom] = useState('');
  const [to, setTo] = useState('');

  const hours = Array.from({ length: 24 }, (_, i) => i);

  // 核心校验逻辑：检查资源在特定时间段是否全程可用
  const checkDriverAvailability = (driverId: string, start: number, dur: number) => {
    const schedule = driverSchedules.find(s => s.driverId === driverId);
    if (!schedule) return false;
    const end = Math.min(23, start + dur - 1);
    for (let h = start; h <= end; h++) {
      const slot = schedule.slots.find(s => s.hour === h);
      if (!slot || slot.status !== DriverStatus.FREE) return false;
    }
    return true;
  };

  const checkVehicleAvailability = (vehicleId: string, start: number, dur: number) => {
    const vehicle = vehicles.find(v => v.id === vehicleId);
    if (!vehicle || vehicle.status !== VehicleStatus.ACTIVE) return false;
    const schedule = vehicleSchedules.find(s => s.vehicleId === vehicleId);
    if (!schedule) return false;
    const end = Math.min(23, start + dur - 1);
    for (let h = start; h <= end; h++) {
      const slot = schedule.slots.find(s => s.hour === h);
      if (!slot || !slot.isAvailable) return false;
    }
    return true;
  };

  // 动态过滤可用资源
  const availableDrivers = useMemo(() => 
    drivers.filter(d => checkDriverAvailability(d.id, startHour, duration)),
    [drivers, driverSchedules, startHour, duration]
  );

  const availableVehicles = useMemo(() => 
    vehicles.filter(v => checkVehicleAvailability(v.id, startHour, duration)),
    [vehicles, vehicleSchedules, startHour, duration]
  );

  // 表单完整性校验
  const isFormValid = useMemo(() => {
    return selectedDriverId !== '' && 
           selectedVehicleId !== '' && 
           from.trim() !== '' && 
           to.trim() !== '' &&
           taskDate !== '';
  }, [selectedDriverId, selectedVehicleId, from, to, taskDate]);

  const handleAssign = (e?: React.FormEvent) => {
    if (e) e.preventDefault();
    if (!isFormValid) return;

    // 根据选择的日期和小时构造 ISO 字符串
    const baseDate = new Date(taskDate);
    const startTime = new Date(baseDate.setHours(startHour, 0, 0, 0)).toISOString();
    const endTime = new Date(baseDate.setHours(startHour + duration, 0, 0, 0)).toISOString();

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

    // 重置表单
    setFrom('');
    setTo('');
    setSelectedDriverId('');
    setSelectedVehicleId('');
  };

  const gridStyle = {
    display: 'grid',
    gridTemplateColumns: 'repeat(24, minmax(0, 1fr))',
    gap: '4px'
  };

  return (
    <div className="flex flex-col gap-6 animate-in fade-in slide-in-from-bottom-6 duration-700 pb-10">
      {/* 顶部状态栏 - 移除即时性词汇 */}
      <div className="flex justify-between items-center bg-white p-6 rounded-[32px] border border-slate-100 shadow-sm">
        <div>
          <h2 className="text-2xl font-black text-slate-800 tracking-tight">资源规划中心</h2>
          <p className="text-slate-500 font-bold text-[10px] uppercase tracking-widest flex items-center gap-2 mt-1">
            <Sparkles className="w-3.5 h-3.5 text-amber-400" />
            前瞻性任务排程 · 预先锁定未来运力
          </p>
        </div>
        <div className="flex items-center gap-4">
          <div className="hidden md:flex flex-col items-end mr-4">
            <span className="text-[10px] font-black text-slate-400 uppercase tracking-widest">视图时段</span>
            <span className="text-sm font-black text-indigo-600">{startHour}:00 - {Math.min(24, startHour + duration)}:00</span>
          </div>
          <div className="flex gap-2">
            <div className="px-4 py-2 bg-emerald-50 text-emerald-600 rounded-2xl text-[10px] font-black uppercase border border-emerald-100 flex items-center gap-2">
              建议司机: {availableDrivers.length}
            </div>
            <div className="px-4 py-2 bg-indigo-50 text-indigo-600 rounded-2xl text-[10px] font-black uppercase border border-indigo-100 flex items-center gap-2">
              建议车辆: {availableVehicles.length}
            </div>
          </div>
        </div>
      </div>

      <div className="grid grid-cols-1 xl:grid-cols-12 gap-6 min-h-0">
        
        {/* 左侧：可视化矩阵 (显示选定日期的负载) */}
        <div className="xl:col-span-7 bg-white rounded-[40px] border border-slate-100 shadow-sm flex flex-col h-[750px] overflow-hidden">
          <div className="p-6 border-b border-slate-50 bg-slate-50/30 flex justify-between items-center">
            <div className="flex items-center gap-3">
              <Calendar className="w-5 h-5 text-indigo-500" />
              <span className="font-black text-slate-800 uppercase tracking-tight text-sm">资源负载透视 ({taskDate})</span>
            </div>
            <div className="flex gap-6">
              <div className="flex items-center gap-2 text-[9px] font-black uppercase text-slate-400">
                <div className="w-3 h-3 bg-emerald-100 rounded-md"></div> 可排程
              </div>
              <div className="flex items-center gap-2 text-[9px] font-black uppercase text-slate-400">
                <div className="w-3 h-3 bg-rose-200 rounded-md"></div> 已锁定
              </div>
            </div>
          </div>

          <div className="flex-1 overflow-y-auto p-8 scrollbar-hide space-y-12">
            <section>
              <div className="flex items-center mb-6">
                <div className="w-28 flex-shrink-0 font-black text-[10px] text-slate-400 uppercase tracking-widest">
                  司机队列
                </div>
                <div className="flex-1" style={gridStyle}>
                  {hours.filter(h => h % 4 === 0).map(h => (
                    <div key={h} className="text-[9px] font-black text-slate-300" style={{ gridColumnStart: h + 1 }}>{h}:00</div>
                  ))}
                </div>
              </div>
              <div className="space-y-4">
                {drivers.map(d => {
                  const schedule = driverSchedules.find(s => s.driverId === d.id);
                  const isSelected = selectedDriverId === d.id;
                  return (
                    <div key={d.id} className={`flex items-center transition-all ${isSelected ? 'scale-[1.01] z-10' : ''}`}>
                      <div className="w-28 flex-shrink-0 flex items-center gap-2 pr-2">
                        <img src={d.avatar} className="w-8 h-8 rounded-lg border border-slate-100 shadow-sm" alt="" />
                        <span className={`text-[10px] font-black truncate ${isSelected ? 'text-indigo-600' : 'text-slate-600'}`}>
                          {d.name}
                        </span>
                      </div>
                      <div className={`flex-1 p-1 rounded-xl transition-all ${isSelected ? 'bg-indigo-50 ring-2 ring-indigo-200' : 'bg-slate-50/50'}`} style={gridStyle}>
                        {schedule?.slots.map(slot => {
                          const isWithinRange = slot.hour >= startHour && slot.hour < startHour + duration;
                          return (
                            <div 
                              key={slot.hour}
                              className={`h-7 rounded-md transition-all ${
                                slot.status === DriverStatus.FREE ? 'bg-emerald-100/60' : 
                                slot.status === DriverStatus.OFF_DUTY ? 'bg-slate-200/40' : 'bg-rose-300'
                              } ${isWithinRange && isSelected ? 'ring-2 ring-indigo-500 shadow-lg scale-110 z-20' : ''}`}
                            ></div>
                          );
                        })}
                      </div>
                    </div>
                  );
                })}
              </div>
            </section>

            <section>
              <div className="flex items-center mb-6">
                <div className="w-28 flex-shrink-0 font-black text-[10px] text-slate-400 uppercase tracking-widest">
                  资产队列
                </div>
              </div>
              <div className="space-y-4">
                {vehicles.map(v => {
                  const schedule = vehicleSchedules.find(s => s.vehicleId === v.id);
                  const isSelected = selectedVehicleId === v.id;
                  return (
                    <div key={v.id} className={`flex items-center transition-all ${isSelected ? 'scale-[1.01] z-10' : ''}`}>
                      <div className="w-28 flex-shrink-0 flex items-center gap-2 pr-2">
                        <div className={`w-8 h-8 rounded-lg flex items-center justify-center border text-[8px] font-black ${isSelected ? 'bg-indigo-600 border-indigo-600 text-white' : 'bg-white border-slate-100 text-slate-400'}`}>
                          {v.plateNumber.slice(-2)}
                        </div>
                        <span className={`text-[9px] font-black truncate ${isSelected ? 'text-indigo-600' : 'text-slate-500'}`}>
                          {v.plateNumber}
                        </span>
                      </div>
                      <div className={`flex-1 p-1 rounded-xl transition-all ${isSelected ? 'bg-indigo-50 ring-2 ring-indigo-200' : 'bg-slate-50/50'}`} style={gridStyle}>
                        {schedule?.slots.map(slot => {
                          const isWithinRange = slot.hour >= startHour && slot.hour < startHour + duration;
                          return (
                            <div 
                              key={slot.hour}
                              className={`h-7 rounded-md transition-all ${
                                slot.isAvailable ? 'bg-indigo-100/60' : 'bg-slate-300/50'
                              } ${isWithinRange && isSelected ? 'ring-2 ring-indigo-500 shadow-lg scale-110 z-20' : ''}`}
                            ></div>
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

        {/* 右侧：调度排程表单 */}
        <div className="xl:col-span-5 flex flex-col h-[750px]">
          <form onSubmit={handleAssign} className="bg-slate-900 rounded-[40px] p-8 text-white shadow-2xl flex flex-col gap-6 h-full border border-slate-800">
            <div className="flex items-center gap-4">
              <div className="w-12 h-12 bg-indigo-500 rounded-2xl flex items-center justify-center shadow-lg shadow-indigo-500/20">
                <PlusCircle className="w-6 h-6 text-white" />
              </div>
              <div>
                <h3 className="text-xl font-black italic tracking-tight uppercase">创建任务调度单</h3>
                <p className="text-[9px] text-slate-500 font-bold tracking-widest uppercase">Plan New Assignment</p>
              </div>
            </div>

            <div className="flex-1 flex flex-col gap-5 overflow-y-auto pr-2 scrollbar-hide">
              {/* 1. 任务日期选择 */}
              <div className="space-y-3">
                <label className="text-[10px] font-black text-slate-500 uppercase tracking-widest px-1">1. 选定执行日期</label>
                <div className="relative">
                  <input 
                    type="date"
                    value={taskDate}
                    onChange={(e) => setTaskDate(e.target.value)}
                    className="w-full px-5 py-4 bg-white/5 border border-white/10 rounded-2xl focus:outline-none focus:ring-2 focus:ring-indigo-500 font-bold text-xs appearance-none cursor-pointer transition-colors hover:bg-white/10"
                  />
                  <Calendar className="absolute right-4 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-600 pointer-events-none" />
                </div>
              </div>

              {/* 2. 时间窗口 */}
              <div className="space-y-3">
                <label className="text-[10px] font-black text-slate-500 uppercase tracking-widest px-1">2. 设定时间范围</label>
                <div className="grid grid-cols-2 gap-4">
                  <div className="relative">
                    <select 
                      value={startHour}
                      onChange={(e) => {
                        setStartHour(parseInt(e.target.value));
                        setSelectedDriverId('');
                        setSelectedVehicleId('');
                      }}
                      className="w-full px-5 py-4 bg-white/5 border border-white/10 rounded-2xl focus:outline-none focus:ring-2 focus:ring-indigo-500 font-bold text-xs appearance-none cursor-pointer transition-colors hover:bg-white/10"
                    >
                      {hours.map(h => <option key={h} value={h} className="text-slate-900">{h}:00 开始</option>)}
                    </select>
                    <Clock className="absolute right-4 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-600 pointer-events-none" />
                  </div>
                  <div className="relative">
                    <select 
                      value={duration}
                      onChange={(e) => {
                        setDuration(parseInt(e.target.value));
                        setSelectedDriverId('');
                        setSelectedVehicleId('');
                      }}
                      className="w-full px-5 py-4 bg-white/5 border border-white/10 rounded-2xl focus:outline-none focus:ring-2 focus:ring-indigo-500 font-bold text-xs appearance-none cursor-pointer transition-colors hover:bg-white/10"
                    >
                      {[1, 2, 3, 4, 6, 8, 12].map(d => <option key={d} value={d} className="text-slate-900">历时 {d} 小时</option>)}
                    </select>
                    <Timer className="absolute right-4 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-600 pointer-events-none" />
                  </div>
                </div>
              </div>

              {/* 3. 资源匹配 */}
              <div className="space-y-4">
                <div className="space-y-2">
                  <label className="text-[10px] font-black text-slate-500 uppercase tracking-widest px-1 flex justify-between">
                    3. 指派司机 <span>({availableDrivers.length} 可用)</span>
                  </label>
                  <select 
                    value={selectedDriverId}
                    onChange={(e) => setSelectedDriverId(e.target.value)}
                    className="w-full px-5 py-4 bg-white/5 border border-white/10 rounded-2xl focus:outline-none focus:ring-2 focus:ring-indigo-500 font-bold text-xs appearance-none transition-colors hover:bg-white/10"
                  >
                    <option value="" className="text-slate-900">请选择...</option>
                    {availableDrivers.map(d => <option key={d.id} value={d.id} className="text-slate-900">{d.name} (评分 {d.rating.toFixed(1)})</option>)}
                  </select>
                </div>

                <div className="space-y-2">
                  <label className="text-[10px] font-black text-slate-500 uppercase tracking-widest px-1 flex justify-between">
                    4. 指派车辆 <span>({availableVehicles.length} 可用)</span>
                  </label>
                  <select 
                    value={selectedVehicleId}
                    onChange={(e) => setSelectedVehicleId(e.target.value)}
                    className="w-full px-5 py-4 bg-white/5 border border-white/10 rounded-2xl focus:outline-none focus:ring-2 focus:ring-indigo-500 font-bold text-xs appearance-none transition-colors hover:bg-white/10"
                  >
                    <option value="" className="text-slate-900">请选择...</option>
                    {availableVehicles.map(v => <option key={v.id} value={v.id} className="text-slate-900">{v.plateNumber} ({v.model})</option>)}
                  </select>
                </div>
              </div>

              {/* 4. 行程路线 */}
              <div className="space-y-4 bg-white/5 p-6 rounded-[32px] border border-white/5">
                <label className="text-[10px] font-black text-slate-500 uppercase tracking-widest px-1">5. 路线规划</label>
                <div className="space-y-4">
                  <div className="flex items-center gap-4 bg-black/20 p-4 rounded-2xl border border-white/5 group focus-within:border-indigo-500/50 transition-colors">
                    <MapPin className="w-4 h-4 text-emerald-400" />
                    <input 
                      type="text" 
                      placeholder="任务起始地点..."
                      value={from}
                      onChange={(e) => setFrom(e.target.value)}
                      className="flex-1 bg-transparent text-sm font-bold focus:outline-none placeholder:text-slate-700"
                    />
                  </div>
                  <div className="flex items-center gap-4 bg-black/20 p-4 rounded-2xl border border-white/5 group focus-within:border-indigo-500/50 transition-colors">
                    <MapPin className="w-4 h-4 text-rose-400" />
                    <input 
                      type="text" 
                      placeholder="任务目标地点..."
                      value={to}
                      onChange={(e) => setTo(e.target.value)}
                      className="flex-1 bg-transparent text-sm font-bold focus:outline-none placeholder:text-slate-700"
                    />
                  </div>
                </div>
              </div>

              {!isFormValid && (
                <div className="flex items-start gap-4 p-4 bg-indigo-500/10 border border-indigo-500/20 rounded-2xl text-indigo-200/60 text-[10px] leading-relaxed">
                  <Info className="w-4 h-4 flex-shrink-0 text-indigo-400" />
                  完成所有排程信息后，系统将正式锁定相关资源的调度计划。
                </div>
              )}
            </div>

            {/* 操作按钮：核心交互点 */}
            <div className="pt-6 border-t border-white/5 mt-auto">
              <button 
                type="submit"
                disabled={!isFormValid}
                className={`w-full py-5 rounded-[28px] font-black shadow-2xl transition-all uppercase tracking-widest text-sm flex items-center justify-center gap-3 active:scale-95 ${
                  isFormValid 
                    ? 'bg-indigo-600 hover:bg-indigo-500 text-white shadow-indigo-500/40 hover:scale-[1.02] cursor-pointer' 
                    : 'bg-white/5 text-slate-700 cursor-not-allowed opacity-40'
                }`}
              >
                <CheckCircle2 className="w-6 h-6" />
                确认并提交排单
                <ChevronRight className="w-4 h-4 ml-1 opacity-50" />
              </button>
            </div>
          </form>
        </div>
      </div>
    </div>
  );
};

export default MatchingCenter;
