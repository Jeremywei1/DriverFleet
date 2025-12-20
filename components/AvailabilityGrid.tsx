
import React, { useState, useEffect, useMemo } from 'react';
import { Driver, DriverSchedule, DriverStatus, Vehicle, VehicleSchedule, VehicleStatus } from '../types';
import { Clock, Check, X, User, Car, Wrench, AlertCircle, Settings2, Timer, Moon } from 'lucide-react';

interface Props {
  mode: 'driver' | 'vehicle';
  drivers?: Driver[];
  schedule?: DriverSchedule[];
  vehicles?: Vehicle[];
  vehicleSchedule?: VehicleSchedule[];
  onUpdateSlot?: (id: string, hour: number, newStatus: any) => void;
  onUpdateVehicleStatus?: (id: string, status: VehicleStatus) => void;
  selectedDate?: string; // 接收当前选择的日期
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
  const [editingSlot, setEditingSlot] = useState<{ id: string; name: string; hour: number; currentStatus: any } | null>(null);
  const [editingVehicle, setEditingVehicle] = useState<Vehicle | null>(null);
  const [now, setNow] = useState(new Date());

  // 每分钟更新一次当前时间
  useEffect(() => {
    const timer = setInterval(() => {
      setNow(new Date());
    }, 60000);
    return () => clearInterval(timer);
  }, []);

  // 判断是否为今天，如果是今天则显示时间线
  const isToday = useMemo(() => {
    if (!selectedDate) return true;
    const todayStr = new Date().toISOString().split('T')[0];
    return selectedDate === todayStr;
  }, [selectedDate]);

  // 计算时间线的位置百分比
  const timeLinePosition = useMemo(() => {
    const hours = now.getHours();
    const minutes = now.getMinutes();
    return ((hours + minutes / 60) / 24) * 100;
  }, [now]);

  const getDriverStatusStyle = (status: DriverStatus) => {
    switch (status) {
      case DriverStatus.BUSY: 
        return 'bg-rose-300 border-rose-400 shadow-[inset_0_-3px_0_rgba(0,0,0,0.1)]';
      case DriverStatus.FREE: 
        return 'bg-emerald-100 border-emerald-200 shadow-[inset_0_-3px_0_rgba(0,0,0,0.05)]';
      case DriverStatus.BREAK: 
        return 'bg-amber-200 border-amber-300 shadow-[inset_0_-3px_0_rgba(0,0,0,0.1)]';
      case DriverStatus.OFF_DUTY: 
        return 'bg-slate-100 border-slate-200 opacity-60';
      default: 
        return 'bg-gray-100';
    }
  };

  const getVehicleStatusStyle = (isAvailable: boolean, status: VehicleStatus) => {
    if (status === VehicleStatus.MAINTENANCE) {
      return 'bg-amber-100 border-amber-200 opacity-80 cursor-pointer hover:bg-amber-200';
    }
    if (status === VehicleStatus.OUT_OF_SERVICE) {
      return 'bg-slate-200 border-slate-300 opacity-60 cursor-pointer hover:bg-slate-300';
    }
    return isAvailable 
      ? 'bg-indigo-100 border-indigo-200 shadow-[inset_0_-3px_0_rgba(0,0,0,0.05)] cursor-pointer hover:bg-indigo-200' 
      : 'bg-slate-300 border-slate-400 opacity-90 cursor-pointer hover:bg-slate-400';
  };

  const hours = Array.from({ length: 24 }, (_, i) => i);

  const handleSlotClick = (id: string, name: string, hour: number, currentStatus: any) => {
    if (mode === 'driver') {
      // 移除原有的 OFF_DUTY 拦截逻辑，支持全时段点击
      setEditingSlot({ id, name, hour, currentStatus });
    } else {
      const v = vehicles?.find(veh => veh.id === id);
      if (v) setEditingVehicle(v);
    }
  };

  const gridStyle = {
    display: 'grid',
    gridTemplateColumns: 'repeat(24, minmax(0, 1fr))',
    gap: '6px'
  };

  return (
    <div className="bg-white rounded-[32px] overflow-hidden flex flex-col h-full relative">
      <div className="p-6 border-b border-slate-100 flex justify-between items-center bg-slate-50/30">
        <h2 className="text-lg font-black text-slate-800 flex items-center gap-3">
          <Clock className="w-6 h-6 text-indigo-500 fill-indigo-100" />
          {mode === 'driver' ? '全员运力监控表' : '车辆资产可用性矩阵'}
        </h2>
        <div className="flex gap-4 text-[10px] font-black text-slate-500 uppercase tracking-widest">
          {mode === 'driver' ? (
            <>
              <div className="flex items-center gap-2"><div className="w-3 h-3 bg-emerald-100 border border-emerald-200 rounded shadow-sm"></div> 空闲</div>
              <div className="flex items-center gap-2"><div className="w-3 h-3 bg-rose-300 border border-rose-400 rounded shadow-sm"></div> 忙碌</div>
              <div className="flex items-center gap-2"><div className="w-3 h-3 bg-amber-200 border border-amber-300 rounded shadow-sm"></div> 休息</div>
              <div className="flex items-center gap-2"><div className="w-3 h-3 bg-slate-100 border border-slate-200 rounded opacity-60"></div> 下班</div>
            </>
          ) : (
            <>
              <div className="flex items-center gap-2"><div className="w-3 h-3 bg-indigo-100 border border-indigo-200 rounded shadow-sm"></div> 可用</div>
              <div className="flex items-center gap-2"><div className="w-3 h-3 bg-slate-300 border border-slate-400 rounded shadow-sm"></div> 任务中</div>
              <div className="flex items-center gap-2"><div className="w-3 h-3 bg-amber-100 border border-amber-200 rounded shadow-sm"></div> 维保</div>
            </>
          )}
        </div>
      </div>

      <div className="overflow-x-auto flex-1 scrollbar-hide">
        <div className="min-w-[1100px] p-6 relative">
          <div className="flex mb-4">
            <div className="w-64 flex-shrink-0 font-black text-slate-400 text-[10px] uppercase tracking-widest pl-2">
              {mode === 'driver' ? '司机档案 (Name/ID)' : '车辆资产 (Plate/Model)'}
            </div>
            <div className="flex-1" style={gridStyle}>
              {hours.map(h => (
                <div key={h} className="text-center text-[11px] font-black text-slate-400 font-mono">
                  {h.toString().padStart(2, '0')}
                </div>
              ))}
            </div>
          </div>

          <div className="space-y-4 relative">
            {/* 实时时间轴 */}
            {isToday && (
              <div 
                className="absolute top-0 bottom-0 z-40 flex flex-col items-center pointer-events-none transition-all duration-1000 ease-linear"
                style={{ 
                  left: `calc(16rem + 8px + (100% - 16rem - 16px) * ${timeLinePosition / 100})`, 
                  transform: 'translateX(-50%)' 
                }}
              >
                <div className="bg-rose-500 text-white text-[9px] font-black px-1.5 py-0.5 rounded-full shadow-lg mb-1 flex items-center gap-1">
                  <Timer className="w-2.5 h-2.5" />
                  {now.getHours().toString().padStart(2, '0')}:{now.getMinutes().toString().padStart(2, '0')}
                </div>
                <div className="w-0.5 flex-1 bg-gradient-to-b from-rose-500 via-rose-500 to-rose-400 shadow-[0_0_10px_rgba(244,63,94,0.3)]"></div>
                <div className="w-2.5 h-2.5 rounded-full bg-rose-500 border-2 border-white shadow-md"></div>
              </div>
            )}

            {mode === 'driver' && drivers?.map(driver => {
              const driverSched = schedule?.find(s => s.driverId === driver.id);
              return (
                <div key={driver.id} className="flex items-center group">
                  <div className="w-64 flex-shrink-0 flex items-center gap-3 pr-4">
                    <img src={driver.avatar} className="w-10 h-10 rounded-xl border border-slate-100 shadow-sm" alt="" />
                    <div className="truncate">
                      <p className="font-black text-slate-800 text-sm tracking-tight">{driver.name}</p>
                      <p className="text-[9px] font-black text-slate-400 uppercase">Driver ID: {driver.id}</p>
                    </div>
                  </div>
                  <div className="flex-1 bg-slate-50/50 rounded-2xl p-2 border border-slate-100/80" style={gridStyle}>
                    {driverSched?.slots.map((slot) => (
                      <div
                        key={slot.hour}
                        onClick={() => handleSlotClick(driver.id, driver.name, slot.hour, slot.status)}
                        className={`h-10 rounded-lg transition-all cursor-pointer border-b-4 ${getDriverStatusStyle(slot.status)} hover:scale-105 hover:z-50`}
                      ></div>
                    ))}
                  </div>
                </div>
              );
            })}

            {mode === 'vehicle' && vehicles?.map(vehicle => {
              const vSched = vehicleSchedule?.find(s => s.vehicleId === vehicle.id);
              return (
                <div key={vehicle.id} className="flex items-center group">
                  <div className="w-64 flex-shrink-0 flex items-center gap-3 pr-4">
                    <div className={`w-10 h-10 rounded-xl flex items-center justify-center border ${
                      vehicle.status === VehicleStatus.MAINTENANCE ? 'bg-amber-50 border-amber-200 text-amber-500' : 'bg-indigo-50 border-indigo-100 text-indigo-500'
                    }`}>
                      {vehicle.status === VehicleStatus.MAINTENANCE ? <Wrench className="w-5 h-5" /> : <Car className="w-5 h-5" />}
                    </div>
                    <div className="truncate">
                      <p className="font-black text-slate-800 text-sm tracking-tight">{vehicle.plateNumber}</p>
                      <p className="text-[9px] font-black text-slate-400 uppercase truncate">{vehicle.model}</p>
                    </div>
                  </div>
                  <div className="flex-1 bg-slate-50/50 rounded-2xl p-2 border border-slate-100/80" style={gridStyle}>
                    {vSched?.slots.map((slot) => (
                      <div
                        key={slot.hour}
                        onClick={() => handleSlotClick(vehicle.id, vehicle.plateNumber, slot.hour, null)}
                        className={`h-10 rounded-lg transition-all border-b-4 ${getVehicleStatusStyle(slot.isAvailable, vehicle.status)} hover:scale-105 hover:z-50`}
                        title={`${vehicle.plateNumber} | ${slot.hour}:00 | ${vehicle.status}`}
                      ></div>
                    ))}
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      </div>

      {/* 司机排班编辑 */}
      {editingSlot && (
        <div className="fixed inset-0 z-[100] flex items-center justify-center p-4">
          <div className="absolute inset-0 bg-slate-900/60 backdrop-blur-md" onClick={() => setEditingSlot(null)}></div>
          <div className="relative bg-white rounded-[40px] shadow-2xl w-full max-w-sm overflow-hidden animate-in zoom-in-95 duration-200">
            <div className="p-8">
              <h3 className="text-2xl font-black text-slate-800 tracking-tight mb-8">快速调度修改</h3>
              <div className="mb-8 p-6 bg-slate-50 rounded-[24px] border border-slate-100">
                <p className="text-xs text-slate-400 font-bold uppercase mb-1">Target</p>
                <p className="font-black text-slate-800 text-lg">{editingSlot.name} · {editingSlot.hour}:00</p>
              </div>
              <div className="space-y-3">
                {[
                  { id: DriverStatus.FREE, label: '设为空闲待命' },
                  { id: DriverStatus.BUSY, label: '手动标记忙碌' },
                  { id: DriverStatus.BREAK, label: '设为临时休息' },
                  { id: DriverStatus.OFF_DUTY, label: '标记为已下班', icon: <Moon className="w-4 h-4" /> },
                ].map((option) => (
                  <button
                    key={option.id}
                    onClick={() => {
                      onUpdateSlot?.(editingSlot.id, editingSlot.hour, option.id);
                      setEditingSlot(null);
                    }}
                    className={`w-full p-5 rounded-[24px] border-2 border-transparent bg-slate-50 hover:bg-indigo-50 hover:text-indigo-700 transition-all font-black text-sm uppercase tracking-widest flex items-center justify-between group`}
                  >
                    {option.label}
                    {option.icon && <span className="opacity-40 group-hover:opacity-100 transition-opacity">{option.icon}</span>}
                  </button>
                ))}
              </div>
            </div>
          </div>
        </div>
      )}

      {/* 车辆状态一键修改 */}
      {editingVehicle && (
        <div className="fixed inset-0 z-[100] flex items-center justify-center p-4">
          <div className="absolute inset-0 bg-slate-900/60 backdrop-blur-md" onClick={() => setEditingVehicle(null)}></div>
          <div className="relative bg-white rounded-[40px] shadow-2xl w-full max-w-sm overflow-hidden animate-in zoom-in-95 duration-200">
            <div className="p-8">
              <h3 className="text-2xl font-black text-slate-800 tracking-tight mb-8 flex items-center gap-3">
                <Settings2 className="w-6 h-6 text-indigo-500" />
                车辆可用性管理
              </h3>
              <div className="mb-8 p-6 bg-slate-50 rounded-[24px] border border-slate-100">
                <p className="text-xs text-slate-400 font-bold uppercase mb-1">Vehicle</p>
                <p className="font-black text-slate-800 text-lg">{editingVehicle.plateNumber}</p>
                <p className="text-xs text-slate-500">{editingVehicle.model}</p>
              </div>
              <div className="space-y-3">
                {[
                  { id: VehicleStatus.ACTIVE, label: '标记为：正常运行', color: 'text-emerald-600' },
                  { id: VehicleStatus.MAINTENANCE, label: '标记为：维保检修', color: 'text-amber-600' },
                  { id: VehicleStatus.OUT_OF_SERVICE, label: '标记为：停止服务', color: 'text-rose-600' },
                ].map((option) => (
                  <button
                    key={option.id}
                    onClick={() => {
                      onUpdateVehicleStatus?.(editingVehicle.id, option.id);
                      setEditingVehicle(null);
                    }}
                    className={`w-full p-5 rounded-[24px] border-2 border-transparent bg-slate-50 hover:bg-slate-100 transition-all font-black text-sm uppercase tracking-widest ${option.color} flex items-center justify-between group`}
                  >
                    {option.label}
                    {editingVehicle.status === option.id && <Check className="w-5 h-5" />}
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
