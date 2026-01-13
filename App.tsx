
import React, { useState, useMemo, useCallback, useEffect, useRef } from 'react';
import { generateDrivers, generateTasks, generateStats, generateVehicles } from './services/mockData';
import { storage } from './services/storageService';
import AvailabilityGrid from './components/AvailabilityGrid';
import TaskList from './components/TaskList';
import PerformanceReport from './components/PerformanceReport';
import AIInsight from './components/AIInsight';
import DriverManagement from './components/DriverManagement';
import VehicleManagement from './components/VehicleManagement';
import MatchingCenter from './components/MatchingCenter';
import SyncMonitor from './components/SyncMonitor';
import { 
  LayoutDashboard, Users, BarChart3, Settings, Clock, Car, Zap, Database, 
  ClipboardList, Activity, Code, Copy, Lock, KeyRound, 
  LogOut, ArrowRight, Info, Loader2, Calendar as CalendarIcon, ChevronLeft, ChevronRight,
  Trash2, Search, Table2, Terminal
} from 'lucide-react';
import { Driver, Vehicle, Task } from './types';

const schemaSQL = `
-- Fleet Pro D1 Schema (v3.1) - 建表语句
CREATE TABLE IF NOT EXISTS drivers (
  id TEXT PRIMARY KEY, name TEXT, gender TEXT, phone TEXT, joinDate TEXT, experience_years INTEGER,
  isActive INTEGER DEFAULT 1, currentStatus TEXT DEFAULT 'FREE', coord_x REAL DEFAULT 0,
  coord_y REAL DEFAULT 0, avatar TEXT, rating REAL DEFAULT 5.0
);
CREATE TABLE IF NOT EXISTS vehicles (
  id TEXT PRIMARY KEY, plateNumber TEXT, model TEXT, type TEXT, color TEXT, seats INTEGER,
  age INTEGER, mileage REAL DEFAULT 0, lastService TEXT, currentDriverId TEXT, isActive INTEGER DEFAULT 1
);
CREATE TABLE IF NOT EXISTS tasks (
  id TEXT PRIMARY KEY, date TEXT, title TEXT, driverId TEXT, vehicleId TEXT, status TEXT,
  startTime TEXT, endTime TEXT, locationStart TEXT, locationEnd TEXT, distanceKm REAL,
  priority TEXT, operation_timestamp TEXT
);
`;

const dropSQL = `
-- ⚠️ 危险操作：格式化（删除）所有底表
DROP TABLE IF EXISTS drivers;
DROP TABLE IF EXISTS vehicles;
DROP TABLE IF EXISTS tasks;
`;

const performanceReviewSQL = `
-- 查询特定司机在指定日期范围内的任务量及出勤工时
SELECT 
  driverId, 
  COUNT(*) as total_tasks,             -- 总单量
  SUM(distanceKm) as total_distance,   -- 总里程 (KM)
  -- 计算累计工时：(结束时间 - 开始时间) * 24小时，保留1位小数
  ROUND(SUM((julianday(endTime) - julianday(startTime)) * 24), 1) as total_hours
FROM tasks 
WHERE 
  driverId = 'd-123'         -- [参数] 替换为实际 Driver ID
  AND date >= '2024-01-01'   -- [参数] 起始日期
  AND date <= '2024-01-31'   -- [参数] 结束日期
GROUP BY driverId;
`;

const assetReviewSQL = `
-- 1. 检视全量司机档案
SELECT id, name, phone, currentStatus, rating FROM drivers ORDER BY joinDate DESC;

-- 2. 检视全量车辆资产
SELECT id, plateNumber, model, type, isActive FROM vehicles ORDER BY id ASC;
`;

const LoginGate: React.FC<{ onLogin: () => void }> = ({ onLogin }) => {
  const [password, setPassword] = useState('');
  const [error, setError] = useState(false);
  const [loading, setLoading] = useState(false);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setTimeout(() => {
      if (password === 'admin258') { onLogin(); setError(false); }
      else { setError(true); setPassword(''); }
      setLoading(false);
    }, 800);
  };

  return (
    <div className="h-screen w-screen bg-slate-950 flex items-center justify-center p-6 font-sans">
      <div className="w-full max-w-md animate-in fade-in zoom-in duration-700">
        <div className="text-center mb-10">
          <div className="w-20 h-20 bg-indigo-600 rounded-[32px] flex items-center justify-center mx-auto mb-6 shadow-2xl shadow-indigo-500/20">
            <Lock className="w-10 h-10 text-white" />
          </div>
          <h1 className="text-3xl font-black text-white italic tracking-tighter uppercase">Fleet Pro Access</h1>
        </div>
        <form onSubmit={handleSubmit} className="bg-white/5 border border-white/10 backdrop-blur-xl p-10 rounded-[48px] shadow-2xl space-y-8">
          <input 
            type="password" value={password} onChange={(e) => {setPassword(e.target.value); setError(false);}}
            placeholder="请输入管理密码" className={`w-full bg-black/40 border-2 ${error ? 'border-rose-500/50 animate-shake' : 'border-white/5'} p-6 rounded-[24px] font-black text-white focus:outline-none focus:ring-4 focus:ring-indigo-500/20 transition-all`}
          />
          <button type="submit" disabled={loading || !password} className="w-full bg-indigo-600 hover:bg-indigo-500 text-white py-6 rounded-[24px] font-black uppercase text-xs flex items-center justify-center gap-4 transition-all">
            {loading ? <Loader2 className="w-5 h-5 animate-spin" /> : <>验证并进入系统 <ArrowRight className="w-4 h-4" /></>}
          </button>
        </form>
      </div>
    </div>
  );
};

const App: React.FC = () => {
  const [isLoggedIn, setIsLoggedIn] = useState(() => sessionStorage.getItem('fleet_session') === 'active');
  const [currentDate, setCurrentDate] = useState<string>(new Date().toISOString().split('T')[0]);
  const [activeTab, setActiveTab] = useState<'dashboard' | 'reports' | 'drivers' | 'monitor' | 'vehicles' | 'matching' | 'deploy'>('dashboard');
  const [monitorSubTab, setMonitorSubTab] = useState<'driver' | 'vehicle'>('driver');
  // Deploy Tab 的子状态
  const [deploySubTab, setDeploySubTab] = useState<'format' | 'performance' | 'asset'>('format');
  
  const [isInitialLoading, setIsInitialLoading] = useState(true);
  const [isRefreshing, setIsRefreshing] = useState(false);
  const [drivers, setDrivers] = useState<Driver[]>([]);
  const [vehicles, setVehicles] = useState<Vehicle[]>([]);
  const [tasks, setTasks] = useState<Task[]>([]);
  const [taskCache, setTaskCache] = useState<Record<string, Task[]>>({});
  const loadTimeoutRef = useRef<number | null>(null);

  useEffect(() => {
    if (!isLoggedIn) return;
    const initBaseData = async () => {
      try {
        const loadedDrivers = await storage.load<Driver[]>('DRIVERS');
        setDrivers(loadedDrivers && loadedDrivers.length > 0 ? loadedDrivers : generateDrivers());
        const loadedVehicles = await storage.load<Vehicle[]>('VEHICLES');
        setVehicles(loadedVehicles && loadedVehicles.length > 0 ? loadedVehicles : generateVehicles(loadedDrivers || []));
      } finally { setIsInitialLoading(false); }
    };
    initBaseData();
  }, [isLoggedIn]);

  useEffect(() => {
    if (!isLoggedIn || isInitialLoading) return;
    const loadDateData = async () => {
      if (taskCache[currentDate]) {
        setTasks(taskCache[currentDate]);
        setIsRefreshing(true);
      } else {
        setTasks([]);
        setIsRefreshing(true);
      }
      try {
        const loadedTasks = await storage.load<Task[]>('TASKS', `date=${currentDate}`);
        const finalTasks = Array.isArray(loadedTasks) ? loadedTasks : [];
        setTaskCache(prev => ({ ...prev, [currentDate]: finalTasks }));
        setTasks(finalTasks);
      } finally { setIsRefreshing(false); }
    };
    if (loadTimeoutRef.current) window.clearTimeout(loadTimeoutRef.current);
    loadTimeoutRef.current = window.setTimeout(loadDateData, 150);
  }, [currentDate, isLoggedIn, isInitialLoading]);

  const handleCreateTask = useCallback(async (partialTask: Partial<Task>) => {
    const now = new Date();
    const ts = `${now.toISOString().split('T')[0]} - ${now.toTimeString().split(' ')[0]}`;
    const newTask: Task = {
      id: `task-${Date.now()}`,
      title: partialTask.title || '新任务',
      driverId: partialTask.driverId || null,
      vehicleId: partialTask.vehicleId || null,
      status: 'IN_PROGRESS', 
      startTime: partialTask.startTime || new Date().toISOString(),
      endTime: partialTask.endTime || new Date().toISOString(),
      locationStart: partialTask.locationStart || '起点',
      locationEnd: partialTask.locationEnd || '终点',
      distanceKm: partialTask.distanceKm || 10,
      priority: partialTask.priority || 'MEDIUM',
      date: partialTask.date || currentDate,
      operation_timestamp: ts
    };
    if (newTask.date === currentDate) setTasks(prev => [newTask, ...prev]);
    setTaskCache(prev => ({ ...prev, [newTask.date]: [newTask, ...(prev[newTask.date] || [])] }));
    await storage.syncSingle('tasks', newTask);
    setActiveTab('dashboard');
  }, [currentDate]);

  const handleDeleteTask = useCallback(async (id: string, date: string) => {
    setTasks(prev => prev.filter(t => t.id !== id));
    setTaskCache(prev => ({ ...prev, [date]: (prev[date] || []).filter(t => t.id !== id) }));
    await storage.deleteResource('tasks', id, `date=${date}`);
  }, []);

  const changeDateByOffset = (offset: number) => {
    const d = new Date(currentDate);
    d.setDate(d.getDate() + offset);
    setCurrentDate(d.toISOString().split('T')[0]);
  };

  const handleLogout = () => {
    if (confirm('确定要退出管理系统吗？')) {
      setIsLoggedIn(false);
      sessionStorage.removeItem('fleet_session');
    }
  };

  const copyToClipboard = (text: string) => {
    navigator.clipboard.writeText(text);
    alert('SQL 脚本已复制到剪贴板');
  };

  if (!isLoggedIn) return <LoginGate onLogin={() => {setIsLoggedIn(true); sessionStorage.setItem('fleet_session', 'active');}} />;
  if (isInitialLoading) return <div className="h-screen w-screen bg-slate-900 flex items-center justify-center"><Loader2 className="w-12 h-12 text-indigo-500 animate-spin" /></div>;

  return (
    <div className="min-h-screen bg-slate-50 flex flex-col md:flex-row font-sans overflow-hidden">
      {/* 侧边栏 */}
      <aside className="w-full md:w-64 bg-slate-900 text-white flex-shrink-0 flex flex-col h-screen border-r border-slate-800 shadow-2xl z-[100]">
        <div className="p-8 border-b border-slate-800/50">
          <div className="flex items-center gap-3 font-black text-2xl tracking-tighter uppercase italic">
             <div className="w-10 h-10 bg-indigo-50 rounded-2xl flex items-center justify-center text-indigo-600 font-mono not-italic shadow-xl">DP</div>
             FLEET PRO
          </div>
        </div>
        <nav className="flex-1 p-5 space-y-1.5 overflow-y-auto scrollbar-hide">
          {[
            { id: 'dashboard', label: '运营枢纽', icon: LayoutDashboard },
            { id: 'matching', label: '资源规划', icon: Zap },
            { id: 'monitor', label: '负载监控', icon: Clock },
            { id: 'reports', label: '效能看板', icon: BarChart3 },
            { id: 'drivers', label: '司机管理', icon: Users },
            { id: 'vehicles', label: '车辆管理', icon: Car },
          ].map(item => (
            <button key={item.id} onClick={() => setActiveTab(item.id as any)} className={`w-full flex items-center gap-3 px-5 py-4 rounded-[24px] font-black transition-all ${activeTab === item.id ? 'bg-indigo-600 text-white shadow-xl shadow-indigo-900/40' : 'text-slate-500 hover:bg-slate-800 hover:text-white'}`}>
              <item.icon className="w-5 h-5" /><span className="text-sm uppercase tracking-widest">{item.label}</span>
            </button>
          ))}
        </nav>
        <div className="p-6 bg-slate-950/50 border-t border-slate-800 flex-shrink-0">
           <button onClick={handleLogout} className="w-full flex items-center justify-between px-5 py-3 rounded-xl bg-white/5 hover:bg-rose-500/10 text-slate-400 hover:text-rose-500 transition-all border border-transparent hover:border-rose-500/20 mb-3 group">
              <span className="text-[10px] font-black uppercase tracking-widest">退出管理</span>
              <LogOut className="w-4 h-4" />
           </button>
           <button onClick={() => setActiveTab('deploy')} className={`w-full flex items-center gap-3 px-5 py-3 rounded-xl transition-all ${activeTab === 'deploy' ? 'bg-indigo-600 text-white shadow-lg' : 'bg-indigo-500/10 text-indigo-400 hover:bg-indigo-500 hover:text-white'}`}>
              <Settings className="w-4 h-4" />
              <span className="text-[10px] font-black uppercase tracking-widest">底表格式</span>
           </button>
        </div>
      </aside>

      <main className="flex-1 flex flex-col h-screen overflow-hidden relative">
        <header className="bg-white border-b border-slate-100 p-6 flex justify-between items-center z-[50] flex-shrink-0">
           <div className="flex items-center gap-8">
              <h1 className="text-2xl font-black text-slate-800 uppercase tracking-tight italic">
                {activeTab === 'dashboard' && '运营枢纽'}
                {activeTab === 'matching' && '排程规划'}
                {activeTab === 'monitor' && '资产负载轴'}
                {activeTab === 'reports' && '效能看板'}
                {activeTab === 'deploy' && 'D1 数据结构控制台'}
                {activeTab === 'drivers' && '司机管理'}
                {activeTab === 'vehicles' && '车辆管理'}
              </h1>
              {isRefreshing && <div className="flex items-center gap-2 bg-indigo-50 px-3 py-1 rounded-full animate-pulse"><Loader2 className="w-3 h-3 text-indigo-600 animate-spin" /><span className="text-[9px] font-black text-indigo-600 uppercase">刷新中...</span></div>}
           </div>

           <div className="flex items-center bg-slate-100 p-1.5 rounded-[20px] gap-2 border border-slate-200">
              <button onClick={() => changeDateByOffset(-1)} className="p-2 hover:bg-white hover:shadow-sm rounded-xl text-slate-400 hover:text-indigo-600 transition-all"><ChevronLeft className="w-4 h-4" /></button>
              <div className="relative group px-4 py-1.5 flex items-center gap-3 bg-white shadow-sm rounded-xl border border-slate-100">
                 <CalendarIcon className="w-4 h-4 text-indigo-500" />
                 <input 
                   type="date" value={currentDate} onChange={(e) => setCurrentDate(e.target.value)} 
                   className="text-sm font-black text-slate-700 bg-transparent outline-none cursor-pointer uppercase tracking-tighter"
                 />
              </div>
              <button onClick={() => changeDateByOffset(1)} className="p-2 hover:bg-white hover:shadow-sm rounded-xl text-slate-400 hover:text-indigo-600 transition-all"><ChevronRight className="w-4 h-4" /></button>
           </div>
        </header>

        <div className="flex-1 overflow-auto p-8 bg-slate-50/50 scrollbar-hide">
          {activeTab === 'dashboard' && (
            <div className={`space-y-10 animate-in fade-in duration-500 ${isRefreshing && tasks.length === 0 ? 'opacity-50 blur-sm' : ''}`}>
              <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
                 {[
                   { label: `${currentDate} 任务量`, val: tasks.length, icon: ClipboardList },
                   { label: '在册人力', val: drivers.length, icon: Users },
                   { label: '资产规模', val: vehicles.length, icon: Car },
                   { label: '平均负载率', val: '84%', icon: Activity }
                 ].map((s, i) => (
                   <div key={i} className="bg-white p-8 rounded-[40px] border border-slate-100 shadow-sm">
                      <div className="w-12 h-12 bg-indigo-50 rounded-2xl flex items-center justify-center mb-6 text-indigo-500"><s.icon className="w-6 h-6" /></div>
                      <div className="text-[10px] font-black text-slate-400 uppercase tracking-widest mb-1">{s.label}</div>
                      <div className="text-3xl font-black text-slate-800 italic">{s.val}</div>
                   </div>
                 ))}
              </div>
              <div className="grid grid-cols-1 xl:grid-cols-3 gap-10">
                <div className="xl:col-span-2 space-y-10">
                  <AIInsight stats={generateStats(drivers)} tasks={tasks} schedules={[]} />
                  <div className="bg-white rounded-[48px] p-2 border border-slate-100 shadow-sm h-[500px] overflow-hidden">
                    <AvailabilityGrid mode="driver" drivers={drivers} tasks={tasks} selectedDate={currentDate} />
                  </div>
                </div>
                <div className="xl:col-span-1">
                  <TaskList tasks={tasks} drivers={drivers} onDeleteTask={handleDeleteTask} selectedDate={currentDate} />
                </div>
              </div>
            </div>
          )}
          {activeTab === 'matching' && <MatchingCenter drivers={drivers} vehicles={vehicles} driverSchedules={[]} vehicleSchedules={[]} onCreateTask={handleCreateTask} currentDate={currentDate} onDateChange={setCurrentDate} />}
          {activeTab === 'monitor' && (
            <div className="space-y-6 h-full flex flex-col">
               <div className="flex gap-2 p-1 bg-slate-100 rounded-2xl w-fit">
                  <button onClick={() => setMonitorSubTab('driver')} className={`px-8 py-2.5 rounded-xl text-xs font-black transition-all ${monitorSubTab === 'driver' ? 'bg-white shadow-xl text-indigo-600' : 'text-slate-500'}`}>人力负载轴</button>
                  <button onClick={() => setMonitorSubTab('vehicle')} className={`px-8 py-2.5 rounded-xl text-xs font-black transition-all ${monitorSubTab === 'vehicle' ? 'bg-white shadow-xl text-indigo-600' : 'text-slate-500'}`}>资产占用矩阵</button>
               </div>
               <div className="flex-1 bg-white rounded-[48px] p-2 border border-slate-100 shadow-sm h-full overflow-hidden">
                 <AvailabilityGrid mode={monitorSubTab} drivers={drivers} vehicles={vehicles} tasks={tasks} selectedDate={currentDate} />
               </div>
            </div>
          )}
          {activeTab === 'drivers' && <DriverManagement drivers={drivers} stats={generateStats(drivers)} onUpdateDriver={async (d) => {setDrivers(prev => prev.map(old => old.id === d.id ? d : old)); await storage.syncSingle('drivers', d);}} onAddDriver={async (d) => {setDrivers(prev => [...prev, d]); await storage.syncSingle('drivers', d);}} onDeleteDriver={async (id) => {setDrivers(prev => prev.filter(d => d.id !== id)); await storage.deleteResource('drivers', id);}} />}
          {activeTab === 'vehicles' && <VehicleManagement vehicles={vehicles} onUpdateVehicle={async (v) => {setVehicles(prev => prev.map(old => old.id === v.id ? v : old)); await storage.syncSingle('vehicles', v);}} onAddVehicle={async (v) => {setVehicles(prev => [...prev, v]); await storage.syncSingle('vehicles', v);}} onDeleteVehicle={async (id) => {setVehicles(prev => prev.filter(v => v.id !== id)); await storage.deleteResource('vehicles', id);}} />}
          {activeTab === 'reports' && <PerformanceReport stats={generateStats(drivers)} tasks={tasks} />}
          
          {/* 核心修改区域: Deploy Tab */}
          {activeTab === 'deploy' && (
            <div className="max-w-5xl mx-auto space-y-8 animate-in slide-in-from-bottom-4 duration-500">
              <div className="bg-slate-900 rounded-[40px] p-12 shadow-2xl border-[10px] border-slate-800 text-white">
                 <div className="flex items-center gap-4 mb-10">
                    <div className="w-16 h-16 bg-indigo-500 rounded-3xl flex items-center justify-center text-white shadow-xl ring-4 ring-indigo-500/20">
                       <Terminal className="w-8 h-8" />
                    </div>
                    <div>
                      <h3 className="text-3xl font-black italic uppercase tracking-tighter">D1 数据库指引</h3>
                      <p className="text-[10px] text-indigo-400 font-bold uppercase tracking-[0.2em] mt-1">SQL Command Generator</p>
                    </div>
                 </div>

                 {/* Sub-Tab Navigation */}
                 <div className="flex flex-wrap gap-4 mb-10 bg-black/30 p-2 rounded-2xl border border-white/5 w-fit">
                    <button 
                      onClick={() => setDeploySubTab('format')}
                      className={`px-6 py-3 rounded-xl text-xs font-black uppercase tracking-widest transition-all flex items-center gap-2 ${deploySubTab === 'format' ? 'bg-indigo-600 text-white shadow-lg' : 'text-slate-500 hover:text-white hover:bg-white/5'}`}
                    >
                      <Trash2 className="w-4 h-4" /> 格式化全部底表
                    </button>
                    <button 
                      onClick={() => setDeploySubTab('performance')}
                      className={`px-6 py-3 rounded-xl text-xs font-black uppercase tracking-widest transition-all flex items-center gap-2 ${deploySubTab === 'performance' ? 'bg-indigo-600 text-white shadow-lg' : 'text-slate-500 hover:text-white hover:bg-white/5'}`}
                    >
                      <Search className="w-4 h-4" /> 司机绩效 Review
                    </button>
                    <button 
                      onClick={() => setDeploySubTab('asset')}
                      className={`px-6 py-3 rounded-xl text-xs font-black uppercase tracking-widest transition-all flex items-center gap-2 ${deploySubTab === 'asset' ? 'bg-indigo-600 text-white shadow-lg' : 'text-slate-500 hover:text-white hover:bg-white/5'}`}
                    >
                      <Table2 className="w-4 h-4" /> 资产 Review
                    </button>
                 </div>
                 
                 {/* Sub-Tab Content */}
                 <div className="space-y-6">
                    {deploySubTab === 'format' && (
                      <div className="animate-in fade-in zoom-in-95 duration-300 space-y-6">
                        <div className="bg-black/50 p-6 rounded-3xl border border-white/5 shadow-inner">
                           <div className="flex justify-between items-center mb-4">
                              <span className="text-xs font-bold text-rose-400 uppercase tracking-widest flex items-center gap-2">
                                <span className="w-2 h-2 rounded-full bg-rose-500 animate-pulse"></span>
                                删除表结构 (Drop Table)
                              </span>
                              <button onClick={() => copyToClipboard(dropSQL)} className="text-[10px] text-slate-400 hover:text-white flex items-center gap-1 transition-colors"><Copy className="w-3 h-3" /> 复制</button>
                           </div>
                           <pre className="font-mono text-[11px] text-rose-300 leading-relaxed overflow-x-auto">{dropSQL.trim()}</pre>
                        </div>
                        
                        <div className="bg-black/50 p-6 rounded-3xl border border-white/5 shadow-inner">
                           <div className="flex justify-between items-center mb-4">
                              <span className="text-xs font-bold text-emerald-400 uppercase tracking-widest flex items-center gap-2">
                                <span className="w-2 h-2 rounded-full bg-emerald-500"></span>
                                重建表结构 (Create Schema)
                              </span>
                              <button onClick={() => copyToClipboard(schemaSQL)} className="text-[10px] text-slate-400 hover:text-white flex items-center gap-1 transition-colors"><Copy className="w-3 h-3" /> 复制</button>
                           </div>
                           <pre className="font-mono text-[11px] text-emerald-300 leading-relaxed overflow-x-auto max-h-[300px]">{schemaSQL.trim()}</pre>
                        </div>
                      </div>
                    )}

                    {deploySubTab === 'performance' && (
                      <div className="animate-in fade-in zoom-in-95 duration-300">
                        <div className="bg-black/50 p-8 rounded-3xl border border-white/5 shadow-inner relative overflow-hidden">
                           <div className="absolute top-0 right-0 p-4 opacity-10"><BarChart3 className="w-32 h-32 text-indigo-500" /></div>
                           <div className="flex justify-between items-center mb-6 relative z-10">
                              <div className="space-y-1">
                                <span className="text-xs font-bold text-indigo-400 uppercase tracking-widest flex items-center gap-2">
                                  任务计数 & 工时查询 (Performance Query)
                                </span>
                                <p className="text-[10px] text-slate-500">用于核对指定时间段内特定司机的完单总数及累计出勤小时</p>
                              </div>
                              <button onClick={() => copyToClipboard(performanceReviewSQL)} className="bg-white/10 hover:bg-white/20 px-4 py-2 rounded-xl text-[10px] font-black uppercase text-white flex items-center gap-2 transition-all"><Copy className="w-3 h-3" /> 复制 SQL</button>
                           </div>
                           <pre className="font-mono text-xs text-indigo-200 leading-relaxed overflow-x-auto relative z-10">{performanceReviewSQL.trim()}</pre>
                        </div>
                      </div>
                    )}

                    {deploySubTab === 'asset' && (
                       <div className="animate-in fade-in zoom-in-95 duration-300">
                         <div className="bg-black/50 p-8 rounded-3xl border border-white/5 shadow-inner relative">
                            <div className="flex justify-between items-center mb-6">
                               <div className="space-y-1">
                                 <span className="text-xs font-bold text-amber-400 uppercase tracking-widest flex items-center gap-2">
                                   全量资源检视 (Select All)
                                 </span>
                                 <p className="text-[10px] text-slate-500">用于导出当前数据库中所有活跃的人力和资产</p>
                               </div>
                               <button onClick={() => copyToClipboard(assetReviewSQL)} className="bg-white/10 hover:bg-white/20 px-4 py-2 rounded-xl text-[10px] font-black uppercase text-white flex items-center gap-2 transition-all"><Copy className="w-3 h-3" /> 复制 SQL</button>
                            </div>
                            <pre className="font-mono text-xs text-amber-200 leading-relaxed overflow-x-auto">{assetReviewSQL.trim()}</pre>
                         </div>
                       </div>
                    )}
                 </div>
              </div>
            </div>
          )}
        </div>
        <SyncMonitor />
      </main>
    </div>
  );
};

export default App;
