
import React, { useState, useMemo, useCallback, useEffect } from 'react';
import { generateDrivers, generateSchedule, generateTasks, generateStats, generateVehicles, generateVehicleSchedule } from './services/mockData';
import AvailabilityGrid from './components/AvailabilityGrid';
import TaskList from './components/TaskList';
import PerformanceReport from './components/PerformanceReport';
import AIInsight from './components/AIInsight';
import DriverManagement from './components/DriverManagement';
import VehicleManagement from './components/VehicleManagement';
import MatchingCenter from './components/MatchingCenter';
import LiveMap from './components/LiveMap'; 
import { LayoutDashboard, Users, BarChart3, Settings, Calendar as CalendarIcon, Bell, Map, Clock, Car, Zap } from 'lucide-react';
import { DriverStatus, Driver, Vehicle, Task, DriverSchedule, VehicleSchedule, VehicleStatus } from './types';

const App: React.FC = () => {
  const [currentDate, setCurrentDate] = useState<string>(new Date().toISOString().split('T')[0]);
  const [activeTab, setActiveTab] = useState<'dashboard' | 'reports' | 'drivers' | 'map' | 'monitor' | 'vehicles' | 'matching'>('dashboard');
  const [monitorSubTab, setMonitorSubTab] = useState<'driver' | 'vehicle'>('driver');

  // 初始化统一状态
  const [drivers, setDrivers] = useState<Driver[]>(() => generateDrivers());
  const [vehicles, setVehicles] = useState<Vehicle[]>(() => generateVehicles([]));
  const [tasks, setTasks] = useState<Task[]>([]);
  const [driverSchedules, setDriverSchedules] = useState<DriverSchedule[]>(() => generateSchedule(drivers, currentDate));
  const [vehicleSchedules, setVehicleSchedules] = useState<VehicleSchedule[]>(() => generateVehicleSchedule(vehicles, currentDate));
  
  // 核心反应逻辑：当车辆状态变更（如转为维修）时，自动锁定该车辆的时间轴
  useEffect(() => {
    setVehicleSchedules(prevSchedules => 
      prevSchedules.map(sched => {
        const vehicle = vehicles.find(v => v.id === sched.vehicleId);
        if (vehicle) {
          return {
            ...sched,
            slots: sched.slots.map(slot => ({
              ...slot,
              // 如果车辆状态不是 ACTIVE，则所有时段强制置为不可用
              isAvailable: vehicle.status === VehicleStatus.ACTIVE ? slot.isAvailable : false
            }))
          };
        }
        return sched;
      })
    );
  }, [vehicles]);

  const stats = useMemo(() => generateStats(drivers), [drivers]);

  // 处理任务创建
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

    const startH = new Date(newTask.startTime).getHours();
    const endH = new Date(newTask.endTime).getHours();
    const busyHours = Array.from({ length: Math.max(1, endH - startH) }, (_, i) => startH + i);

    // 同步更新司机排班
    if (newTask.driverId) {
      setDriverSchedules(prev => prev.map(s => {
        if (s.driverId === newTask.driverId) {
          return {
            ...s,
            slots: s.slots.map(slot => 
              busyHours.includes(slot.hour) ? { ...slot, status: DriverStatus.BUSY, taskId: newTask.id } : slot
            )
          };
        }
        return s;
      }));
    }

    // 同步更新车辆排班
    if (newTask.vehicleId) {
      setVehicleSchedules(prev => prev.map(s => {
        if (s.vehicleId === newTask.vehicleId) {
          return {
            ...s,
            slots: s.slots.map(slot => 
              busyHours.includes(slot.hour) ? { ...slot, isAvailable: false, taskId: newTask.id } : slot
            )
          };
        }
        return s;
      }));
    }

    setActiveTab('dashboard');
  }, []);

  const handleUpdateSlot = useCallback((driverId: string, hour: number, newStatus: DriverStatus) => {
    setDriverSchedules(prev => prev.map(s => s.driverId === driverId ? {
      ...s,
      slots: s.slots.map(slot => slot.hour === hour ? { ...slot, status: newStatus } : slot)
    } : s));
  }, []);

  const handleUpdateDriver = useCallback((updatedDriver: Driver) => {
    setDrivers(prev => prev.map(d => d.id === updatedDriver.id ? { ...updatedDriver } : d));
  }, []);

  const handleUpdateVehicle = useCallback((updatedVehicle: Vehicle) => {
    setVehicles(prev => prev.map(v => v.id === updatedVehicle.id ? { ...updatedVehicle } : v));
  }, []);

  // 新增：从可用性网格直接更新车辆状态
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
            { id: 'matching', label: '资源匹配', icon: Zap },
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
      </aside>

      <main className="flex-1 flex flex-col h-screen overflow-hidden">
        <header className="bg-white border-b border-slate-100 p-6 flex justify-between items-center z-10">
           <div className="flex items-center gap-6">
             <h1 className="text-2xl font-black text-slate-800 uppercase tracking-tight">
               {activeTab === 'dashboard' && '运营枢纽'}
               {activeTab === 'matching' && '调度资源匹配'}
               {activeTab === 'monitor' && '全资源监控轴'}
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
        </header>

        <div className="flex-1 overflow-auto p-8 bg-slate-50/50">
          {activeTab === 'dashboard' && (
            <div className="grid grid-cols-1 xl:grid-cols-3 gap-10">
              <div className="xl:col-span-2 flex flex-col gap-10">
                <AIInsight stats={stats} tasks={tasks} schedules={driverSchedules} />
                <div className="bg-white rounded-[48px] p-2 border border-slate-100 shadow-sm">
                  <AvailabilityGrid mode="driver" drivers={drivers} schedule={driverSchedules} onUpdateSlot={handleUpdateSlot} selectedDate={currentDate} />
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
                    司机运力表
                  </button>
                  <button 
                    onClick={() => setMonitorSubTab('vehicle')}
                    className={`px-8 py-3 rounded-xl font-black text-xs uppercase tracking-widest transition-all ${monitorSubTab === 'vehicle' ? 'bg-indigo-600 text-white shadow-indigo-200 shadow-lg' : 'text-slate-400 hover:text-slate-600'}`}
                  >
                    车辆可用性
                  </button>
               </div>
               
               <div className="bg-white rounded-[48px] p-4 border border-slate-100 shadow-xl flex-1 overflow-hidden">
                 <AvailabilityGrid 
                    mode={monitorSubTab} 
                    drivers={drivers} 
                    schedule={driverSchedules} 
                    vehicles={vehicles} 
                    vehicleSchedule={vehicleSchedules}
                    onUpdateSlot={monitorSubTab === 'driver' ? handleUpdateSlot : undefined}
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
