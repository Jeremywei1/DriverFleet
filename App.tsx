
import React, { useState, useMemo, useEffect } from 'react';
import { generateDrivers, generateSchedule, generateTasks, generateStats } from './services/mockData';
import AvailabilityGrid from './components/AvailabilityGrid';
import TaskList from './components/TaskList';
import PerformanceReport from './components/PerformanceReport';
import AIInsight from './components/AIInsight';
import DriverManagement from './components/DriverManagement';
import LiveMap from './components/LiveMap';
import SyncCenter from './components/SyncCenter';
import { syncDailyData } from './services/supabaseService';
import { LayoutDashboard, Users, BarChart3, Settings, Calendar as CalendarIcon, Bell, Map, Cloud, CloudCheck, CloudOff, Loader2, Database } from 'lucide-react';
import { SyncLog } from './types';

const App: React.FC = () => {
  const [currentDate, setCurrentDate] = useState<string>(new Date().toISOString().split('T')[0]);
  const [activeTab, setActiveTab] = useState<'dashboard' | 'reports' | 'drivers' | 'map' | 'sync'>('dashboard');
  
  // Sync States
  const [syncStatus, setSyncStatus] = useState<'idle' | 'syncing' | 'success' | 'error'>('idle');
  const [syncLogs, setSyncLogs] = useState<SyncLog[]>([]);

  const drivers = useMemo(() => generateDrivers(), []);
  const schedule = useMemo(() => generateSchedule(drivers, currentDate), [drivers, currentDate]);
  const tasks = useMemo(() => generateTasks(drivers, currentDate), [drivers, currentDate]);
  const stats = useMemo(() => generateStats(drivers), [drivers]);

  // Handle Sync Logic
  const handleSync = async () => {
    setSyncStatus('syncing');
    const result = await syncDailyData(currentDate, drivers, stats, tasks);
    
    const newLog: SyncLog = {
      id: Math.random().toString(36).substr(2, 9),
      date: currentDate,
      status: result.success ? 'SUCCESS' : 'FAILED',
      timestamp: result.timestamp,
      details: result.message
    };

    setSyncLogs(prev => [newLog, ...prev]);
    setSyncStatus(result.success ? 'success' : 'error');
  };

  // Auto-sync on date change (Simulation)
  useEffect(() => {
    setSyncStatus('idle'); // Reset when date changes
    const timer = setTimeout(() => {
       // handleSync(); // 你可以取消注释来实现真正的自动同步
    }, 2000);
    return () => clearTimeout(timer);
  }, [currentDate]);

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
          {[
            { id: 'dashboard', label: '运营中心', icon: LayoutDashboard },
            { id: 'map', label: '上帝视角', icon: Map },
            { id: 'reports', label: '绩效报表', icon: BarChart3 },
            { id: 'drivers', label: '司机管理', icon: Users },
            { id: 'sync', label: '数据中心', icon: Database },
          ].map(tab => (
            <button 
              key={tab.id}
              onClick={() => setActiveTab(tab.id as any)}
              className={`w-full flex items-center gap-3 px-4 py-3 rounded-xl transition-all ${
                activeTab === tab.id ? 'bg-indigo-600 text-white shadow-lg shadow-indigo-900/20' : 'text-slate-400 hover:bg-slate-800 hover:text-white'
              }`}
            >
              <tab.icon className="w-5 h-5" />
              <span>{tab.label}</span>
            </button>
          ))}
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
                activeTab === 'map' ? '实时运力分布' :
                activeTab === 'reports' ? '数据概览' : 
                activeTab === 'drivers' ? '司机车队' : '备份与同步'}
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
              {/* Sync Notification Button */}
              <button 
                onClick={handleSync}
                className={`flex items-center gap-2 px-3 py-2 rounded-xl border transition-all ${
                  syncStatus === 'success' ? 'bg-emerald-50 text-emerald-600 border-emerald-100' :
                  syncStatus === 'error' ? 'bg-rose-50 text-rose-600 border-rose-100' :
                  syncStatus === 'syncing' ? 'bg-indigo-50 text-indigo-600 border-indigo-100' :
                  'bg-slate-50 text-slate-400 border-slate-200'
                }`}
              >
                {syncStatus === 'syncing' ? <Loader2 className="w-4 h-4 animate-spin" /> : 
                 syncStatus === 'success' ? <CloudCheck className="w-4 h-4" /> :
                 syncStatus === 'error' ? <CloudOff className="w-4 h-4" /> : <Cloud className="w-4 h-4" />}
                <span className="text-xs font-bold hidden sm:block">
                  {syncStatus === 'syncing' ? '同步中...' : 
                   syncStatus === 'success' ? '已备份' :
                   syncStatus === 'error' ? '失败' : '未同步'}
                </span>
              </button>

              <button className="relative p-2 text-slate-400 hover:bg-slate-100 rounded-full transition-colors">
                 <Bell className="w-5 h-5" />
                 <span className="absolute top-2 right-2 w-2 h-2 bg-red-500 rounded-full border border-white"></span>
              </button>
              <div className="flex items-center gap-3 pl-4 border-l border-slate-200">
                 <img src="https://api.dicebear.com/7.x/avataaars/svg?seed=Felix" alt="Admin" className="w-8 h-8 rounded-full bg-slate-100" />
                 <div className="hidden md:block text-left">
                    <p className="text-xs font-bold text-slate-700 leading-none">调度员 阿强</p>
                    <p className="text-[10px] text-slate-400">高级管理员</p>
                 </div>
              </div>
           </div>
        </header>

        <div className="flex-1 overflow-auto p-4 md:p-6 space-y-6 bg-slate-50/50">
          {activeTab === 'dashboard' && (
            <div className="grid grid-cols-1 xl:grid-cols-3 gap-6 h-full">
              <div className="xl:col-span-2 flex flex-col gap-6">
                <AvailabilityGrid drivers={drivers} schedule={schedule} />
                <AIInsight stats={stats} tasks={tasks} schedules={schedule} />
              </div>
              <div className="xl:col-span-1 h-[600px] xl:h-auto">
                <TaskList tasks={tasks} drivers={drivers} />
              </div>
            </div>
          )}

          {activeTab === 'map' && <LiveMap drivers={drivers} />}
          {activeTab === 'reports' && <PerformanceReport stats={stats} />}
          {activeTab === 'drivers' && <DriverManagement drivers={drivers} stats={stats} />}
          {activeTab === 'sync' && (
            <SyncCenter 
              logs={syncLogs} 
              isSyncing={syncStatus === 'syncing'} 
              onManualSync={handleSync} 
            />
          )}
        </div>
      </main>
    </div>
  );
};

export default App;