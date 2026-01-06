
import React, { useState, useMemo, useCallback, useEffect } from 'react';
import { generateDrivers, generateSchedule, generateTasks, generateStats, generateVehicles, generateVehicleSchedule } from './services/mockData';
import { storage } from './services/storageService';
import AvailabilityGrid from './components/AvailabilityGrid';
import TaskList from './components/TaskList';
import PerformanceReport from './components/PerformanceReport';
import AIInsight from './components/AIInsight';
import DriverManagement from './components/DriverManagement';
import VehicleManagement from './components/VehicleManagement';
import MatchingCenter from './components/MatchingCenter';
import LiveMap from './components/LiveMap'; 
import { LayoutDashboard, Users, BarChart3, Settings, Calendar as CalendarIcon, Bell, Map, Clock, Car, Zap, Database } from 'lucide-react';
import { DriverStatus, Driver, Vehicle, Task, DriverSchedule, VehicleSchedule, VehicleStatus } from './types';

const App: React.FC = () => {
  const [currentDate, setCurrentDate] = useState<string>(new Date().toISOString().split('T')[0]);
  const [activeTab, setActiveTab] = useState<'dashboard' | 'reports' | 'drivers' | 'map' | 'monitor' | 'vehicles' | 'matching'>('dashboard');
  const [monitorSubTab, setMonitorSubTab] = useState<'driver' | 'vehicle'>('driver');
  const [lastSync, setLastSync] = useState<string | null>(storage.getLastSync());

  // 初始化数据：优先从存储加载，否则生成初始数据
  const [drivers, setDrivers] = useState<Driver[]>(() => 
    storage.load<Driver[]>('DRIVERS') || generateDrivers()
  );
  const [vehicles, setVehicles] = useState<Vehicle[]>(() => 
    storage.load<Vehicle[]>('VEHICLES') || generateVehicles([])
  );
  const [tasks, setTasks] = useState<Task[]>(() => 
    storage.load<Task[]>('TASKS') || []
  );
  const [driverSchedules, setDriverSchedules] = useState<DriverSchedule[]>(() => 
    storage.load<DriverSchedule[]>('DRIVER_SCHEDULES') || generateSchedule(drivers, currentDate)
  );
  const [vehicleSchedules, setVehicleSchedules] = useState<VehicleSchedule[]>(() => 
    storage.load<VehicleSchedule[]>('VEHICLE_SCHEDULES') || generateVehicleSchedule(vehicles, currentDate)
  );

  // 当重要数据变动时，自动保存到存储
  useEffect(() => {
    storage.save('DRIVERS', drivers);
    storage.save('VEHICLES', vehicles);
    storage.save('TASKS', tasks);
    storage.save('DRIVER_SCHEDULES', driverSchedules);
    storage.save('VEHICLE_SCHEDULES', vehicleSchedules);
    setLastSync(new Date().toISOString());
  }, [drivers, vehicles, tasks, driverSchedules, vehicleSchedules]);

  useEffect(() => {
    setVehicleSchedules(prevSchedules => 
      prevSchedules.map(sched => {
        const vehicle = vehicles.find(v => v.id === sched.vehicleId);
        if (vehicle) {
          return {
            ...sched,
            slots: sched.slots.map(slot => ({
              ...slot,
              isAvailable: vehicle.status === VehicleStatus.ACTIVE ? slot.isAvailable : false
            }))
          };
        }
        return sched;
      })
    );
  }, [vehicles]);

  const stats = useMemo(() => generateStats(drivers), [drivers]);

  const handleCreateTask = useCallback((partialTask: Partial<Task>) => {
    const newTask: Task = {
      id: `task-${Date.now()}`,
      title: partialTask.title || '新接送任务',
      driverId: partialTask.driverId || null,
      vehicleId: partialTask.vehicleId || null,
      status: 'PENDING',
      startTime: partialTask.startTime || new Date().toISOString(),
      endTime: partialTask.endTime || new Date().toISOString(),
      locationStart: partialTask.locationStart || '未指定起点',
      locationEnd: partialTask.locationEnd || '未指定终点',
      distanceKm: Math.floor(Math.random() * 30) + 5,
      priority: partialTask.priority || 'MEDIUM'
    };

    setTasks(prev => [newTask, ...prev]);

    const startDate = new Date(newTask.startTime);
    const endDate = new Date(newTask.endTime);
    const startIdx = startDate.getHours() * 2 + (startDate.getMinutes() >= 30 ? 1 : 0);
    const endIdx = endDate.getHours() * 2 + (endDate.getMinutes() >= 30 ? 1 : 0);
    const busyIdxs = Array.from({ length: Math.max(1, endIdx - startIdx) }, (_, i) => startIdx + i);

    if (newTask.driverId) {
      setDriverSchedules(prev => prev.map(s => {
        if (s.driverId === newTask.driverId) {
          return { ...s, slots: s.slots.map((slot, idx) => busyIdxs.includes(idx) ? { ...slot, status: DriverStatus.BUSY, taskId: newTask.id } : slot) };
        }
        return s;
      }));
    }

    if (newTask.vehicleId) {
      setVehicleSchedules(prev => prev.map(s => {
        if (s.vehicleId === newTask.vehicleId) {
          return { ...s, slots: s.slots.map((slot, idx) => busyIdxs.includes(idx) ? { ...slot, isAvailable: false, taskId: newTask.id } : slot) };
        }
        return s;
      }));
    }

    setActiveTab('dashboard');
  }, []);

  const handleUpdateSlotRange = useCallback((driverId: string, startIdx: number, endIdx: number, newStatus: DriverStatus) => {
    setDriverSchedules(prev => prev.map(s => s.driverId === driverId ? {
      ...s,
      slots: s.slots.map((slot, idx) => (idx >= startIdx && idx <= endIdx) ? { ...slot, status: newStatus } : slot)
    } : s));
  }, []);

  const handleUpdateDriver = useCallback((updatedDriver: Driver) => {
    setDrivers(prev => prev.map(d => d.id === updatedDriver.id ? { ...updatedDriver } : d));
  }, []);

  const handleUpdateVehicle = useCallback((updatedVehicle: Vehicle) => {
    setVehicles(prev => prev.map(v => v.id === updatedVehicle.id ? { ...updatedVehicle } : v));
  }, []);

  const handleUpdateVehicleStatus = useCallback((id: string, status: VehicleStatus) => {
    setVehicles(prev => prev.map(v => v.id === id ? { ...v, status } : v));
  }, []);

  return (
    <div className="min-h-screen bg-slate-50 flex flex-col md:flex-row font-sans">
      <aside className="w-full md:w-64 bg-slate-900 text-white flex-shrink-0 flex flex-col">
        <div className="p-8 border-b border-slate-800/50">
          <div className="flex items-center gap-3 font-black text-2xl tracking-tighter uppercase italic">
             <div className="w-10 h-10 bg-indigo-500 rounded-2xl flex items-center justify-center text-white font-mono not-italic shadow-xl">DF</div>
             FLEET
          </div>
        </div>
        
        <nav className="flex-1 p-5 space-y-1.5 overflow-y-auto scrollbar-hide">
          {[
            { id: 'dashboard', label: '运营枢纽', icon: LayoutDashboard },
            { id: 'matching', label: '资源规划', icon: Zap },
            { id: 'monitor', label: '运力监控', icon: Clock },
            { id: 'map', label: '上帝视角', icon: Map },
            { id: 'reports', label: '绩效看板', icon: BarChart3 },
            { id: 'drivers', label: '司机管理', icon: Users },
            { id: 'vehicles', label: '资产管理', icon: Car },
          ].map(item => (
            <button 
              key={item.id}
              onClick={() => setActiveTab(item.id as any)}
              className={`w-full flex items-center gap-3 px-5 py-4 rounded-[24px] font-black transition-all ${
                activeTab === item.id 
                  ? 'bg-indigo-600 text-white shadow-2xl shadow-indigo-900/40 translate-x-1' 
                  : 'text-slate-500 hover:bg-slate-800 hover:text-white'
              }`}
            >
              <item.icon className="w-5 h-5" />
              <span className="text-sm uppercase tracking-widest">{item.label}</span>
            </button>
          ))}
        </nav>
        
        {/* 数据状态指示器 */}
        <div className="p-6 bg-slate-950/50 border-t border-slate-800">
           <div className="flex items-center gap-3">
              <div className="w-8 h-8 rounded-lg bg-emerald-500/10 flex items-center justify-center">
                 <Database className="w-4 h-4 text-emerald-500" />
              </div>
              <div className="flex flex-col">
                 <span className="text-[9px] font-black text-slate-400 uppercase tracking-widest">持久化存储已启用</span>
                 <span className="text-[8px] text-slate-600 font-bold truncate">上次同步: {lastSync ? new Date(lastSync).toLocaleTimeString() : '尚未同步'}</span>
              </div>
           </div>
        </div>
      </aside>

      <main className="flex-1 flex flex-col h-screen overflow-hidden">
        <header className="bg-white border-b border-slate-100 p-6 flex justify-between items-center z-10">
           <div className="flex items-center gap-6">
             <h1 className="text-2xl font-black text-slate-800 uppercase tracking-tight">
               {activeTab === 'dashboard' && '运营枢纽'}
               {activeTab === 'matching' && '排程规划中心'}
               {activeTab === 'monitor' && '资源负荷轴'}
               {activeTab === 'map' && '上帝视角'}
               {activeTab === 'reports' && '绩效看板'}
               {activeTab === 'drivers' && '司机管理'}
               {activeTab === 'vehicles' && '资产清查'}
             </h1>
             <div className="flex items-center gap-2 bg-slate-50 rounded-2xl px-5 py-2.5 border border-slate-100">
                <CalendarIcon className="w-4 h-4 text-slate-400" />
                <input 
                  type="date" 
                  value={currentDate} 
                  onChange={(e) => setCurrentDate(e.target.value)}
                  className="bg-transparent text-sm text-slate-700 focus:outline-none font-black cursor-pointer"
                />
             </div>
           </div>
           
           <div className="flex items-center gap-4">
              <button 
                onClick={() => {
                  if(confirm('确定要清除所有本地数据并重置吗？')) {
                    storage.clear();
                    window.location.reload();
                  }
                }}
                className="p-3 text-slate-300 hover:text-rose-500 transition-colors"
                title="重置数据"
              >
                <Settings className="w-5 h-5" />
              </button>
              <div className="w-10 h-10 rounded-2xl bg-slate-100 flex items-center justify-center text-slate-400">
                <Bell className="w-5 h-5" />
              </div>
           </div>
        </header>

        <div className="flex-1 overflow-auto p-8 bg-slate-50/50">
          {activeTab === 'dashboard' && (
            <div className="grid grid-cols-1 xl:grid-cols-3 gap-10">
              <div className="xl:col-span-2 flex flex-col gap-10">
                <AIInsight stats={stats} tasks={tasks} schedules={driverSchedules} />
                <div className="bg-white rounded-[48px] p-2 border border-slate-100 shadow-sm overflow-hidden">
                  <AvailabilityGrid mode="driver" drivers={drivers} schedule={driverSchedules} onUpdateSlot={handleUpdateSlotRange} selectedDate={currentDate} />
                </div>
              </div>
              <div className="xl:col-span-1">
                <TaskList tasks={tasks} drivers={drivers} />
              </div>
            </div>
          )}

          {activeTab === 'matching' && (
            <MatchingCenter 
              drivers={drivers}
              vehicles={vehicles}
              driverSchedules={driverSchedules}
              vehicleSchedules={vehicleSchedules}
              onCreateTask={handleCreateTask}
            />
          )}

          {activeTab === 'vehicles' && (
            <VehicleManagement 
              vehicles={vehicles} 
              onUpdateVehicle={handleUpdateVehicle}
            />
          )}

          {activeTab === 'drivers' && (
            <DriverManagement 
              drivers={drivers} 
              stats={stats} 
              onUpdateDriver={handleUpdateDriver}
            />
          )}

          {activeTab === 'map' && <LiveMap drivers={drivers} vehicles={vehicles} />}
          {activeTab === 'reports' && <PerformanceReport stats={stats} />}
          
          {activeTab === 'monitor' && (
            <div className="flex flex-col gap-8 h-full">
               <div className="flex p-1.5 bg-white rounded-2xl border border-slate-100 w-fit self-center shadow-lg">
                  <button 
                    onClick={() => setMonitorSubTab('driver')}
                    className={`px-8 py-3 rounded-xl font-black text-xs uppercase tracking-widest transition-all ${monitorSubTab === 'driver' ? 'bg-indigo-600 text-white shadow-indigo-200 shadow-lg' : 'text-slate-400 hover:text-slate-600'}`}
                  >
                    司机运力轴
                  </button>
                  <button 
                    onClick={() => setMonitorSubTab('vehicle')}
                    className={`px-8 py-3 rounded-xl font-black text-xs uppercase tracking-widest transition-all ${monitorSubTab === 'vehicle' ? 'bg-indigo-600 text-white shadow-indigo-200 shadow-lg' : 'text-slate-400 hover:text-slate-600'}`}
                  >
                    资产可用性
                  </button>
               </div>
               
               <div className="bg-white rounded-[48px] p-4 border border-slate-100 shadow-xl flex-1 overflow-hidden">
                 <AvailabilityGrid 
                    mode={monitorSubTab} 
                    drivers={drivers} 
                    schedule={driverSchedules} 
                    vehicles={vehicles} 
                    vehicleSchedule={vehicleSchedules}
                    onUpdateSlot={monitorSubTab === 'driver' ? handleUpdateSlotRange : undefined}
                    onUpdateVehicleStatus={handleUpdateVehicleStatus}
                    selectedDate={currentDate}
                 />
               </div>
            </div>
          )}
        </div>
      </main>
    </div>
  );
};

export default App;
