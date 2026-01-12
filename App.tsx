
import React, { useState, useMemo, useCallback, useEffect } from 'react';
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
  LogOut, ArrowRight, Info, Loader2, Calendar as CalendarIcon, ChevronLeft, ChevronRight
} from 'lucide-react';
import { Driver, Vehicle, Task } from './types';

const LoginGate: React.FC<{ onLogin: () => void }> = ({ onLogin }) => {
  const [password, setPassword] = useState('');
  const [error, setError] = useState(false);
  const [loading, setLoading] = useState(false);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setTimeout(() => {
      if (password === 'admin258') {
        onLogin();
        setError(false);
      } else {
        setError(true);
        setPassword('');
      }
      setLoading(false);
    }, 800);
  };

  return (
    <div className="h-screen w-screen bg-slate-950 flex items-center justify-center p-6 font-sans">
      <div className="absolute inset-0 overflow-hidden pointer-events-none">
        <div className="absolute top-[-10%] left-[-10%] w-[40%] h-[40%] bg-indigo-500/10 blur-[120px] rounded-full"></div>
        <div className="absolute bottom-[-10%] right-[-10%] w-[40%] h-[40%] bg-emerald-500/10 blur-[120px] rounded-full"></div>
      </div>
      <div className="w-full max-w-md animate-in fade-in zoom-in duration-700">
        <div className="text-center mb-10">
          <div className="w-20 h-20 bg-indigo-600 rounded-[32px] flex items-center justify-center mx-auto mb-6 shadow-2xl shadow-indigo-500/20">
            <Lock className="w-10 h-10 text-white" />
          </div>
          <h1 className="text-3xl font-black text-white italic tracking-tighter uppercase">Fleet Pro Access</h1>
          <p className="text-slate-500 font-bold text-[10px] uppercase tracking-[0.3em] mt-3">车队管家管理终端 · 受限访问</p>
        </div>
        <form onSubmit={handleSubmit} className="bg-white/5 border border-white/10 backdrop-blur-xl p-10 rounded-[48px] shadow-2xl space-y-8">
          <div className="space-y-3">
            <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest px-1">安全访问令牌 / 密码</label>
            <div className="relative">
              <KeyRound className="absolute left-6 top-1/2 -translate-y-1/2 w-5 h-5 text-slate-600" />
              <input 
                type="password" 
                value={password}
                onChange={(e) => {setPassword(e.target.value); setError(false);}}
                placeholder="请输入管理密码"
                className={`w-full bg-black/40 border-2 ${error ? 'border-rose-500/50 animate-shake' : 'border-white/5'} p-6 pl-16 rounded-[24px] font-black text-white focus:outline-none focus:ring-4 focus:ring-indigo-500/20 transition-all`}
              />
            </div>
            {error && <p className="text-rose-500 text-[10px] font-black uppercase tracking-widest px-1">密码错误，请重新输入</p>}
          </div>
          <button type="submit" disabled={loading || !password} className="w-full bg-indigo-600 hover:bg-indigo-500 disabled:opacity-50 text-white py-6 rounded-[24px] font-black uppercase tracking-[0.2em] text-xs flex items-center justify-center gap-4 shadow-2xl shadow-indigo-900/40 transition-all hover:scale-[1.02] active:scale-95">
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
  const [isLoading, setIsLoading] = useState(true);

  const [drivers, setDrivers] = useState<Driver[]>([]);
  const [vehicles, setVehicles] = useState<Vehicle[]>([]);
  const [tasks, setTasks] = useState<Task[]>([]);

  useEffect(() => {
    if (!isLoggedIn) return;
    const initData = async () => {
      setIsLoading(true);
      try {
        const loadedDrivers = await storage.load<Driver[]>('DRIVERS');
        const finalDrivers = Array.isArray(loadedDrivers) && loadedDrivers.length > 0 ? loadedDrivers : generateDrivers();
        setDrivers(finalDrivers);

        const loadedVehicles = await storage.load<Vehicle[]>('VEHICLES');
        const finalVehicles = Array.isArray(loadedVehicles) && loadedVehicles.length > 0 ? loadedVehicles : generateVehicles(finalDrivers);
        setVehicles(finalVehicles);

        const loadedTasks = await storage.load<Task[]>('TASKS', `date=${currentDate}`);
        setTasks(Array.isArray(loadedTasks) ? loadedTasks : []);
      } catch (e) {
        console.error("Initial load failed", e);
        setDrivers(generateDrivers());
      } finally {
        setIsLoading(false);
      }
    };
    initData();
  }, [currentDate, isLoggedIn]);

  const stats = useMemo(() => generateStats(Array.isArray(drivers) ? drivers : []), [drivers]);

  // 更新：看板统计应仅包含当日任务
  const todayTasksCount = useMemo(() => {
    return tasks.length;
  }, [tasks]);

  const changeDate = (offset: number) => {
    const d = new Date(currentDate);
    d.setDate(d.getDate() + offset);
    setCurrentDate(d.toISOString().split('T')[0]);
  };

  const handleLogin = () => {
    setIsLoggedIn(true);
    sessionStorage.setItem('fleet_session', 'active');
  };

  const handleLogout = () => {
    if (confirm('确定要退出管理系统吗？')) {
      setIsLoggedIn(false);
      sessionStorage.removeItem('fleet_session');
    }
  };

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
    
    // 如果是创建当前日期的任务，立即更新 UI
    if (newTask.date === currentDate) {
      setTasks(prev => [newTask, ...prev]);
    }
    
    await storage.syncSingle('tasks', newTask);
    setActiveTab('dashboard');
  }, [currentDate]);

  const handleDeleteTask = useCallback(async (id: string, date: string) => {
    setTasks(prev => prev.filter(t => t.id !== id));
    await storage.deleteResource('tasks', id, `date=${date}`);
  }, []);

  const handleDeleteDriver = useCallback(async (id: string) => {
    setDrivers(prev => prev.filter(d => d.id !== id));
    await storage.deleteResource('drivers', id);
  }, []);

  const handleDeleteVehicle = useCallback(async (id: string) => {
    setVehicles(prev => prev.filter(v => v.id !== id));
    await storage.deleteResource('vehicles', id);
  }, []);

  const handleUpdateDriver = async (updatedDriver: Driver) => {
    setDrivers(prev => prev.map(d => d.id === updatedDriver.id ? updatedDriver : d));
    await storage.syncSingle('drivers', updatedDriver);
  };

  const handleAddDriver = async (newDriver: Driver) => {
    setDrivers(prev => [...prev, newDriver]);
    await storage.syncSingle('drivers', newDriver);
  };

  const handleUpdateVehicle = async (updatedVehicle: Vehicle) => {
    setVehicles(prev => prev.map(v => v.id === updatedVehicle.id ? updatedVehicle : v));
    await storage.syncSingle('vehicles', updatedVehicle);
  };

  const handleAddVehicle = async (newVehicle: Vehicle) => {
    setVehicles(prev => [...prev, newVehicle]);
    await storage.syncSingle('vehicles', newVehicle);
  };

  const schemaSQL = `
-- ⚠️ 终极扁平化底表脚本 (D1 控制台运行)
DROP TABLE IF EXISTS drivers;
DROP TABLE IF EXISTS vehicles;
DROP TABLE IF EXISTS tasks;

CREATE TABLE drivers (
  id TEXT PRIMARY KEY, 
  name TEXT, 
  gender TEXT, 
  phone TEXT, 
  joinDate TEXT, 
  experience_years INTEGER, 
  isActive INTEGER DEFAULT 1, 
  currentStatus TEXT, 
  coord_x REAL, 
  coord_y REAL, 
  avatar TEXT, 
  rating REAL
);

CREATE TABLE vehicles (
  id TEXT PRIMARY KEY, 
  plateNumber TEXT, 
  model TEXT, 
  type TEXT, 
  color TEXT, 
  seats INTEGER, 
  age INTEGER, 
  mileage INTEGER, 
  lastService TEXT, 
  currentDriverId TEXT, 
  isActive INTEGER DEFAULT 1
);

CREATE TABLE tasks (
  id TEXT PRIMARY KEY, 
  date TEXT, 
  title TEXT, 
  driverId TEXT, 
  vehicleId TEXT, 
  status TEXT, 
  startTime TEXT, 
  endTime TEXT, 
  locationStart TEXT, 
  locationEnd TEXT, 
  distanceKm REAL, 
  priority TEXT, 
  operation_timestamp TEXT
);
  `.trim();

  if (!isLoggedIn) return <LoginGate onLogin={handleLogin} />;

  if (isLoading) {
    return (
       <div className="h-screen w-screen bg-slate-900 flex flex-col items-center justify-center gap-6">
        <div className="w-20 h-20 bg-indigo-600 rounded-[32px] flex items-center justify-center animate-bounce shadow-2xl shadow-indigo-500/20">
          <Database className="w-10 h-10 text-white" />
        </div>
        <div className="text-center text-white font-black uppercase tracking-widest italic">云端数据架构自检中...</div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-slate-50 flex flex-col md:flex-row font-sans overflow-hidden">
      <aside className="w-full md:w-64 bg-slate-900 text-white flex-shrink-0 flex flex-col h-screen sticky top-0 z-[100] border-r border-slate-800 shadow-2xl">
        <div className="p-8 border-b border-slate-800/50">
          <div className="flex items-center gap-3 font-black text-2xl tracking-tighter uppercase italic">
             <div className="w-10 h-10 bg-indigo-50 rounded-2xl flex items-center justify-center text-white font-mono not-italic shadow-xl">DF</div>
             FLEET PRO
          </div>
        </div>
        <nav className="flex-1 p-5 space-y-1.5 overflow-y-auto scrollbar-hide">
          {[
            { id: 'dashboard', label: '运营枢纽', icon: LayoutDashboard },
            { id: 'matching', label: '资源规划', icon: Zap },
            { id: 'monitor', label: '负载轴监控', icon: Clock },
            { id: 'reports', label: '效能看板', icon: BarChart3 },
            { id: 'drivers', label: '司机主档案', icon: Users },
            { id: 'vehicles', label: '资产主档案', icon: Car },
          ].map(item => (
            <button key={item.id} onClick={() => setActiveTab(item.id as any)} className={`w-full flex items-center gap-3 px-5 py-4 rounded-[24px] font-black transition-all ${activeTab === item.id ? 'bg-indigo-600 text-white shadow-2xl shadow-indigo-900/40' : 'text-slate-500 hover:bg-slate-800 hover:text-white'}`}>
              <item.icon className="w-5 h-5" /><span className="text-sm uppercase tracking-widest">{item.label}</span>
            </button>
          ))}
        </nav>
        <div className="p-6 bg-slate-950/50 border-t border-slate-800">
           <button onClick={handleLogout} className="w-full flex items-center justify-between px-5 py-3 rounded-xl bg-white/5 hover:bg-rose-500/10 text-slate-400 hover:text-rose-500 transition-all border border-transparent hover:border-rose-500/20 mb-4 group">
              <span className="text-[10px] font-black uppercase tracking-widest">退出管理</span>
              <LogOut className="w-4 h-4" />
           </button>
           <button onClick={() => setActiveTab('deploy')} className="w-full flex items-center gap-3 px-5 py-3 rounded-xl bg-indigo-500/10 text-indigo-400 hover:bg-indigo-500 hover:text-white transition-all">
              <Settings className="w-4 h-4" />
              <span className="text-[10px] font-black uppercase tracking-widest">底表格式</span>
           </button>
        </div>
      </aside>

      <main className="flex-1 flex flex-col h-screen overflow-hidden relative">
        <header className="bg-white border-b border-slate-100 p-6 flex justify-between items-center z-[50] shrink-0">
           <div className="flex items-center gap-8">
              <h1 className="text-2xl font-black text-slate-800 uppercase tracking-tight italic">
                {activeTab === 'dashboard' && '运营中心'}
                {activeTab === 'matching' && '排程规划'}
                {activeTab === 'monitor' && '资产负载图'}
                {activeTab === 'deploy' && 'D1 数据结构'}
              </h1>

              {/* 日期导航器 - 仅在运营中心显示 */}
              {activeTab === 'dashboard' && (
                <div className="flex items-center bg-slate-900 px-4 py-2 rounded-2xl shadow-lg border border-slate-800 gap-4">
                  <button onClick={() => changeDate(-1)} className="text-slate-500 hover:text-white transition-colors"><ChevronLeft className="w-5 h-5" /></button>
                  <div className="flex items-center gap-2">
                     <CalendarIcon className="w-4 h-4 text-emerald-400" />
                     <input 
                       type="date" 
                       value={currentDate} 
                       onChange={(e) => setCurrentDate(e.target.value)}
                       className="bg-transparent text-white font-black text-[11px] uppercase tracking-widest outline-none cursor-pointer"
                     />
                  </div>
                  <button onClick={() => changeDate(1)} className="text-slate-500 hover:text-white transition-colors"><ChevronRight className="w-5 h-5" /></button>
                </div>
              )}
           </div>

           <div className="flex items-center gap-4">
              <div className="text-right hidden md:block">
                 <div className="text-[10px] font-black text-slate-400 uppercase tracking-widest">Fleet Master D1</div>
                 <div className="text-xs font-black text-emerald-500">CLOUD SYNCED</div>
              </div>
           </div>
        </header>

        <div className="flex-1 overflow-auto p-8 bg-slate-50/50 scrollbar-hide">
          {activeTab === 'dashboard' && (
            <div className="space-y-10 animate-in fade-in slide-in-from-bottom-4 duration-700">
              <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
                 {[
                   { label: `${currentDate} 任务量`, val: todayTasksCount, icon: ClipboardList, color: 'indigo' },
                   { label: '在册人力', val: Array.isArray(drivers) ? drivers.length : 0, icon: Users, color: 'emerald' },
                   { label: '资产规模', val: Array.isArray(vehicles) ? vehicles.length : 0, icon: Car, color: 'blue' },
                   { label: '平均负载率', val: '84%', icon: Activity, color: 'rose' }
                 ].map((s, i) => (
                   <div key={i} className="bg-white p-8 rounded-[40px] border border-slate-100 shadow-sm">
                      <div className={`w-12 h-12 bg-indigo-50 rounded-2xl flex items-center justify-center mb-6 text-indigo-500`}><s.icon className="w-6 h-6" /></div>
                      <div className="text-[10px] font-black text-slate-400 uppercase tracking-widest mb-1">{s.label}</div>
                      <div className="text-3xl font-black text-slate-800 italic">{s.val}</div>
                   </div>
                 ))}
              </div>
              <div className="grid grid-cols-1 xl:grid-cols-3 gap-10">
                <div className="xl:col-span-2 space-y-10">
                  <AIInsight stats={stats} tasks={Array.isArray(tasks) ? tasks : []} schedules={[]} />
                  <div className="bg-white rounded-[48px] p-2 border border-slate-100 shadow-sm overflow-hidden h-[500px]">
                    <AvailabilityGrid mode="driver" drivers={Array.isArray(drivers) ? drivers : []} tasks={Array.isArray(tasks) ? tasks : []} selectedDate={currentDate} />
                  </div>
                </div>
                <div className="xl:col-span-1">
                  <TaskList tasks={Array.isArray(tasks) ? tasks : []} drivers={Array.isArray(drivers) ? drivers : []} onDeleteTask={handleDeleteTask} />
                </div>
              </div>
            </div>
          )}
          {activeTab === 'matching' && <MatchingCenter drivers={Array.isArray(drivers) ? drivers : []} vehicles={Array.isArray(vehicles) ? vehicles : []} driverSchedules={[]} vehicleSchedules={[]} onCreateTask={handleCreateTask} />}
          {activeTab === 'monitor' && (
            <div className="space-y-6 h-full flex flex-col">
               <div className="flex gap-2 p-1 bg-slate-100 rounded-2xl w-fit">
                  <button onClick={() => setMonitorSubTab('driver')} className={`px-8 py-2.5 rounded-xl text-xs font-black transition-all ${monitorSubTab === 'driver' ? 'bg-white shadow-xl text-indigo-600' : 'text-slate-500'}`}>人力负载轴</button>
                  <button onClick={() => setMonitorSubTab('vehicle')} className={`px-8 py-2.5 rounded-xl text-xs font-black transition-all ${monitorSubTab === 'vehicle' ? 'bg-white shadow-xl text-indigo-600' : 'text-slate-500'}`}>资产占用阵</button>
               </div>
               <div className="flex-1 bg-white rounded-[48px] p-2 border border-slate-100 shadow-sm overflow-hidden">
                 <AvailabilityGrid mode={monitorSubTab} drivers={Array.isArray(drivers) ? drivers : []} vehicles={Array.isArray(vehicles) ? vehicles : []} tasks={Array.isArray(tasks) ? tasks : []} selectedDate={currentDate} />
               </div>
            </div>
          )}
          {activeTab === 'drivers' && (
            <DriverManagement 
              drivers={Array.isArray(drivers) ? drivers : []} 
              stats={stats} 
              onUpdateDriver={handleUpdateDriver} 
              onAddDriver={handleAddDriver} 
              onDeleteDriver={handleDeleteDriver}
            />
          )}
          {activeTab === 'vehicles' && (
            <VehicleManagement 
              vehicles={Array.isArray(vehicles) ? vehicles : []} 
              onUpdateVehicle={handleUpdateVehicle} 
              onAddVehicle={handleAddVehicle} 
              onDeleteVehicle={handleDeleteVehicle}
            />
          )}
          {activeTab === 'reports' && <PerformanceReport stats={stats} tasks={Array.isArray(tasks) ? tasks : []} />}
          {activeTab === 'deploy' && (
            <div className="max-w-4xl mx-auto space-y-10">
              <div className="bg-slate-900 rounded-[40px] p-12 shadow-2xl border-[10px] border-slate-800">
                 <div className="flex items-center justify-between mb-10">
                    <div className="flex items-center gap-4">
                      <div className="w-14 h-14 bg-indigo-500 rounded-2xl flex items-center justify-center text-white shadow-xl"><Code className="w-8 h-8" /></div>
                      <h3 className="text-white text-2xl font-black italic uppercase tracking-tighter">全量底表重塑脚本 (v3.1)</h3>
                    </div>
                    <button onClick={() => {navigator.clipboard.writeText(schemaSQL); alert('SQL 已复制到剪贴板');}} className="flex items-center gap-2 bg-white/5 hover:bg-white/10 px-6 py-3 rounded-xl transition-all border border-white/5">
                      <Copy className="w-4 h-4 text-indigo-400" />
                      <span className="text-[10px] font-black text-white uppercase tracking-widest">复制 SQL</span>
                    </button>
                 </div>
                 <div className="bg-black/50 p-8 rounded-3xl font-mono text-[11px] text-indigo-300 border border-white/5 leading-relaxed overflow-x-auto shadow-inner">
                   <pre>{schemaSQL}</pre>
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
