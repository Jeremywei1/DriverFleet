
import React, { useState, useMemo, useCallback } from 'react';
import { generateDrivers, generateSchedule, generateTasks, generateStats } from './services/mockData';
import AvailabilityGrid from './components/AvailabilityGrid';
import TaskList from './components/TaskList';
import PerformanceReport from './components/PerformanceReport';
import AIInsight from './components/AIInsight';
import DriverManagement from './components/DriverManagement';
import LiveMap from './components/LiveMap'; 
import { LayoutDashboard, Users, BarChart3, Settings, Calendar as CalendarIcon, Bell, Map } from 'lucide-react';
import { DriverStatus } from './types';

const App: React.FC = () => {
  const [currentDate, setCurrentDate] = useState<string>(new Date().toISOString().split('T')[0]);
  const [activeTab, setActiveTab] = useState<'dashboard' | 'reports' | 'drivers' | 'map'>('dashboard');

  const drivers = useMemo(() => generateDrivers(), []);
  
  // Initialize schedule with state to allow modifications
  const [schedules, setSchedules] = useState(() => generateSchedule(drivers, currentDate));

  // Regenerate schedules if date changes (simulated for demo)
  useMemo(() => {
    setSchedules(generateSchedule(drivers, currentDate));
  }, [drivers, currentDate]);

  const tasks = useMemo(() => generateTasks(drivers, currentDate), [drivers, currentDate]);
  const stats = useMemo(() => generateStats(drivers), [drivers]);

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

  return (
    <div className="min-h-screen bg-slate-50 flex flex-col md:flex-row font-sans">
      
      <aside className="w-full md:w-64 bg-slate-900 text-white flex-shrink-0 flex flex-col">
        <div className="p-6 border-b border-slate-800">
          <div className="flex items-center gap-2 font-bold text-xl tracking-tight">
             <div className="w-8 h-8 bg-indigo-500 rounded-lg flex items-center justify-center text-white font-mono">管</div>
             车队管家
          </div>
        </div>
        
        <nav className="flex-1 p-4 space-y-2">
          <button 
            onClick={() => setActiveTab('dashboard')}
            className={`w-full flex items-center gap-3 px-4 py-3 rounded-xl transition-all ${
              activeTab === 'dashboard' ? 'bg-indigo-600 text-white shadow-lg shadow-indigo-900/20' : 'text-slate-400 hover:bg-slate-800 hover:text-white'
            }`}
          >
            <LayoutDashboard className="w-5 h-5" />
            <span>运营中心</span>
          </button>
          
          <button 
            onClick={() => setActiveTab('map')}
            className={`w-full flex items-center gap-3 px-4 py-3 rounded-xl transition-all ${
              activeTab === 'map' ? 'bg-indigo-600 text-white shadow-lg shadow-indigo-900/20' : 'text-slate-400 hover:bg-slate-800 hover:text-white'
            }`}
          >
            <Map className="w-5 h-5" />
            <span>上帝视角</span>
          </button>

          <button 
            onClick={() => setActiveTab('reports')}
            className={`w-full flex items-center gap-3 px-4 py-3 rounded-xl transition-all ${
              activeTab === 'reports' ? 'bg-indigo-600 text-white shadow-lg shadow-indigo-900/20' : 'text-slate-400 hover:bg-slate-800 hover:text-white'
            }`}
          >
            <BarChart3 className="w-5 h-5" />
            <span>绩效报表</span>
          </button>

          <button 
            onClick={() => setActiveTab('drivers')}
            className={`w-full flex items-center gap-3 px-4 py-3 rounded-xl transition-all ${
              activeTab === 'drivers' ? 'bg-indigo-600 text-white shadow-lg shadow-indigo-900/20' : 'text-slate-400 hover:bg-slate-800 hover:text-white'
            }`}
          >
             <Users className="w-5 h-5" />
             <span>司机管理</span>
          </button>
        </nav>

        <div className="p-4 border-t border-slate-800">
           <div className="flex items-center gap-3 px-4 py-2 text-slate-400 text-sm hover:text-white cursor-pointer transition-colors">
             <Settings className="w-4 h-4" />
             系统设置
           </div>
        </div>
      </aside>

      <main className="flex-1 flex flex-col h-screen overflow-hidden">
        <header className="bg-white border-b border-slate-200 p-4 flex justify-between items-center shadow-sm z-10">
           <div className="flex items-center gap-4">
             <h1 className="text-xl font-bold text-slate-800 hidden md:block">
               {activeTab === 'dashboard' ? '每日运营' : 
                activeTab === 'map' ? '实时运力分布 (Live Map)' :
                activeTab === 'reports' ? '数据概览' : '司机车队'}
             </h1>
             <div className="flex items-center gap-2 bg-slate-100 rounded-lg px-3 py-2 border border-slate-200">
                <CalendarIcon className="w-4 h-4 text-slate-500" />
                <input 
                  type="date" 
                  value={currentDate} 
                  onChange={(e) => setCurrentDate(e.target.value)}
                  className="bg-transparent text-sm text-slate-700 focus:outline-none font-medium"
                />
             </div>
           </div>

           <div className="flex items-center gap-4">
              <button className="relative p-2 text-slate-400 hover:bg-slate-100 rounded-full transition-colors">
                 <Bell className="w-5 h-5" />
                 <span className="absolute top-2 right-2 w-2 h-2 bg-red-500 rounded-full border border-white"></span>
              </button>
              <div className="flex items-center gap-3 pl-4 border-l border-slate-200">
                 <img src="https://picsum.photos/id/64/100/100" alt="Admin" className="w-8 h-8 rounded-full" />
                 <div className="hidden md:block">
                    <p className="text-sm font-bold text-slate-700">调度员 小珍</p>
                 </div>
              </div>
           </div>
        </header>

        <div className="flex-1 overflow-auto p-4 md:p-6 space-y-6 bg-slate-50/50">
          
          {activeTab === 'dashboard' && (
            <div className="grid grid-cols-1 xl:grid-cols-3 gap-6 h-full">
              <div className="xl:col-span-2 flex flex-col gap-6">
                <div className="flex-none">
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
              
              <div className="xl:col-span-1 h-[600px] xl:h-auto">
                <TaskList tasks={tasks} drivers={drivers} />
              </div>
            </div>
          )}

          {activeTab === 'map' && (
             <div className="h-full">
                <LiveMap drivers={drivers} />
             </div>
          )}

          {activeTab === 'reports' && (
             <div className="h-full flex flex-col gap-6">
               <PerformanceReport stats={stats} />
               <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                 <div className="bg-white p-6 rounded-2xl border border-slate-100 shadow-sm">
                    <h3 className="font-bold text-lg mb-4 text-slate-800">车队利用率</h3>
                    <div className="h-64 flex items-center justify-center text-slate-400 bg-slate-50 rounded-xl border-2 border-dashed border-slate-200">
                       更多图表即将上线
                    </div>
                 </div>
                 <div className="bg-white p-6 rounded-2xl border border-slate-100 shadow-sm">
                    <h3 className="font-bold text-lg mb-4 text-slate-800">成本分析</h3>
                    <div className="h-64 flex items-center justify-center text-slate-400 bg-slate-50 rounded-xl border-2 border-dashed border-slate-200">
                       更多图表即将上线
                    </div>
                 </div>
               </div>
             </div>
          )}

          {activeTab === 'drivers' && (
            <DriverManagement drivers={drivers} stats={stats} />
          )}

        </div>
      </main>
    </div>
  );
};

export default App;
