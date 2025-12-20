import React, { useState, useMemo, useCallback } from 'react';
import { generateDrivers, generateSchedule, generateTasks, generateStats, generateVehicles } from './services/mockData';
import AvailabilityGrid from './components/AvailabilityGrid';
import TaskList from './components/TaskList';
import PerformanceReport from './components/PerformanceReport';
import AIInsight from './components/AIInsight';
import DriverManagement from './components/DriverManagement';
import VehicleManagement from './components/VehicleManagement';
import LiveMap from './components/LiveMap'; 
import { LayoutDashboard, Users, BarChart3, Settings, Calendar as CalendarIcon, Bell, Map, Clock, Car } from 'lucide-react';
import { DriverStatus, Driver } from './types';

const App: React.FC = () => {
  const [currentDate, setCurrentDate] = useState<string>(new Date().toISOString().split('T')[0]);
  const [activeTab, setActiveTab] = useState<'dashboard' | 'reports' | 'drivers' | 'map' | 'monitor' | 'vehicles'>('dashboard');

  // Unified drivers state to allow management/updates
  const [drivers, setDrivers] = useState<Driver[]>(() => generateDrivers());
  
  // Memoized derived data
  const vehicles = useMemo(() => generateVehicles(drivers), [drivers]);
  const stats = useMemo(() => generateStats(drivers), [drivers]);
  const tasks = useMemo(() => generateTasks(drivers, currentDate), [drivers, currentDate]);
  
  // Schedules state for interactive monitoring
  const [schedules, setSchedules] = useState(() => generateSchedule(drivers, currentDate));

  // Sync schedules if date or drivers change
  useMemo(() => {
    setSchedules(generateSchedule(drivers, currentDate));
  }, [drivers, currentDate]);

  const handleUpdateSlot = useCallback((driverId: string, hour: number, newStatus: DriverStatus) => {
    setSchedules(prevSchedules => 
      prevSchedules.map(sched => {
        if (sched.driverId === driverId) {
          return {
            ...sched,
            slots: sched.slots.map(slot => 
              slot.hour === hour ? { ...slot, status: newStatus } : slot
            )
          };
        }
        return sched;
      })
    );
  }, []);

  const handleUpdateDriver = useCallback((updatedDriver: Driver) => {
    setDrivers(prev => prev.map(d => d.id === updatedDriver.id ? updatedDriver : d));
  }, []);

  return (
    <div className="min-h-screen bg-slate-50 flex flex-col md:flex-row font-sans">
      
      {/* Sidebar Navigation */}
      <aside className="w-full md:w-64 bg-slate-900 text-white flex-shrink-0 flex flex-col">
        <div className="p-8 border-b border-slate-800/50">
          <div className="flex items-center gap-3 font-black text-2xl tracking-tighter uppercase italic">
             <div className="w-10 h-10 bg-indigo-500 rounded-2xl flex items-center justify-center text-white font-mono not-italic shadow-xl shadow-indigo-500/20 ring-2 ring-indigo-400/20">DF</div>
             FLEET
          </div>
        </div>
        
        <nav className="flex-1 p-5 space-y-1.5 overflow-y-auto scrollbar-hide">
          {[
            { id: 'dashboard', label: '运营中心', icon: LayoutDashboard },
            { id: 'monitor', label: '运力监控', icon: Clock },
            { id: 'map', label: '上帝视角', icon: Map },
            { id: 'reports', label: '绩效报表', icon: BarChart3 },
            { id: 'drivers', label: '司机管理', icon: Users },
            { id: 'vehicles', label: '资产管理', icon: Car },
          ].map(item => (
            <button 
              key={item.id}
              onClick={() => setActiveTab(item.id as any)}
              className={`w-full flex items-center gap-3 px-5 py-4 rounded-[20px] font-black transition-all ${
                activeTab === item.id 
                  ? 'bg-indigo-600 text-white shadow-2xl shadow-indigo-900/40 translate-x-1' 
                  : 'text-slate-500 hover:bg-slate-800 hover:text-white'
              }`}
            >
              <item.icon className={`w-5 h-5 ${activeTab === item.id ? 'text-white' : 'text-slate-600'}`} />
              <span className="text-sm uppercase tracking-widest">{item.label}</span>
            </button>
          ))}
        </nav>

        <div className="p-6 border-t border-slate-800/50">
           <div className="flex items-center gap-3 px-4 py-2 text-slate-500 text-[10px] font-black uppercase tracking-widest hover:text-white cursor-pointer transition-colors">
             <Settings className="w-4 h-4" />
             系统参数设置
           </div>
        </div>
      </aside>

      {/* Main Content Area */}
      <main className="flex-1 flex flex-col h-screen overflow-hidden">
        <header className="bg-white border-b border-slate-100 p-6 flex justify-between items-center z-10 shadow-[0_4px_20px_-10px_rgba(0,0,0,0.05)]">
           <div className="flex items-center gap-6">
             <h1 className="text-2xl font-black text-slate-800 hidden md:block uppercase tracking-tight">
               {activeTab === 'dashboard' && '运营枢纽'}
               {activeTab === 'monitor' && '运力时间轴'}
               {activeTab === 'map' && '实时分布图'}
               {activeTab === 'reports' && '数据看板'}
               {activeTab === 'drivers' && '司机档案管理'}
               {activeTab === 'vehicles' && '车辆资产清点'}
             </h1>
             <div className="flex items-center gap-2 bg-slate-50 rounded-2xl px-5 py-2.5 border border-slate-100 shadow-inner group">
                <CalendarIcon className="w-4 h-4 text-slate-400 group-focus-within:text-indigo-500 transition-colors" />
                <input 
                  type="date" 
                  value={currentDate} 
                  onChange={(e) => setCurrentDate(e.target.value)}
                  className="bg-transparent text-sm text-slate-700 focus:outline-none font-black cursor-pointer"
                />
             </div>
           </div>

           <div className="flex items-center gap-4">
              <button className="relative p-3 text-slate-400 hover:bg-slate-50 rounded-2xl transition-all">
                 <Bell className="w-6 h-6" />
                 <span className="absolute top-3 right-3 w-2.5 h-2.5 bg-rose-500 rounded-full border-2 border-white"></span>
              </button>
              <div className="flex items-center gap-4 pl-6 border-l border-slate-100">
                 <div className="text-right hidden md:block">
                    <p className="text-sm font-black text-slate-800 leading-none mb-1">管理员 · 阿强</p>
                    <p className="text-[10px] text-slate-400 font-black uppercase tracking-widest">高级调度中心</p>
                 </div>
                 <img src="https://api.dicebear.com/7.x/avataaars/svg?seed=Admin" alt="Admin" className="w-12 h-12 rounded-[18px] bg-slate-100 border-2 border-white shadow-md" />
              </div>
           </div>
        </header>

        <div className="flex-1 overflow-auto p-6 md:p-10 space-y-10 bg-slate-50/50 scroll-smooth">
          
          {activeTab === 'dashboard' && (
            <div className="grid grid-cols-1 xl:grid-cols-3 gap-8 h-full">
              <div className="xl:col-span-2 flex flex-col gap-8">
                <div className="flex-none bg-white rounded-[40px] p-2 border border-slate-100 shadow-sm">
                  <AvailabilityGrid 
                    drivers={drivers} 
                    schedule={schedules} 
                    onUpdateSlot={handleUpdateSlot}
                  />
                </div>
                <div className="flex-none">
                  <AIInsight stats={stats} tasks={tasks} schedules={schedules} />
                </div>
              </div>
              <div className="xl:col-span-1 min-h-[600px] xl:h-auto">
                <TaskList tasks={tasks} drivers={drivers} />
              </div>
            </div>
          )}

          {activeTab === 'monitor' && (
             <div className="bg-white rounded-[40px] p-4 border border-slate-100 shadow-xl h-full">
                <div className="mb-6 px-4">
                   <h2 className="text-xl font-black text-slate-800">实时运力监控中心</h2>
                   <p className="text-slate-500 font-medium">点击时间槽可直接修改司机状态，帮助快速排班。</p>
                </div>
                <AvailabilityGrid 
                  drivers={drivers} 
                  schedule={schedules} 
                  onUpdateSlot={handleUpdateSlot}
                />
             </div>
          )}

          {activeTab === 'map' && (
             <div className="h-full bg-white rounded-[40px] overflow-hidden border border-slate-100 shadow-sm">
                {/* Fixed: Pass vehicles prop to LiveMap */}
                <LiveMap drivers={drivers} vehicles={vehicles} />
             </div>
          )}

          {activeTab === 'reports' && (
            <div className="space-y-8">
               <PerformanceReport stats={stats} />
            </div>
          )}

          {activeTab === 'drivers' && (
            <DriverManagement 
              drivers={drivers} 
              stats={stats} 
              onUpdateDriver={handleUpdateDriver}
            />
          )}

          {activeTab === 'vehicles' && (
            <VehicleManagement vehicles={vehicles} />
          )}

        </div>
      </main>
    </div>
  );
};

export default App;