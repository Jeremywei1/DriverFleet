
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
import { 
  LayoutDashboard, Users, BarChart3, Settings, Calendar as CalendarIcon, 
  Bell, Clock, Car, Zap, Database, Cloud, CheckCircle2, Loader2,
  ClipboardList, Activity, Code, Copy, Lock, KeyRound, LogOut, ArrowRight
} from 'lucide-react';
import { DriverStatus, Driver, Vehicle, Task, DriverSchedule, VehicleSchedule, VehicleStatus } from './types';

// ----------------------------------------------------------------------
// 登录拦截组件 (保持现状)
// ----------------------------------------------------------------------
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

// ----------------------------------------------------------------------
// 主应用组件
// ----------------------------------------------------------------------
const App: React.FC = () => {
  const [isLoggedIn, setIsLoggedIn] = useState(() => sessionStorage.getItem('fleet_session') === 'active');
  const [currentDate] = useState<string>(new Date().toISOString().split('T')[0]);
  const [activeTab, setActiveTab] = useState<'dashboard' | 'reports' | 'drivers' | 'monitor' | 'vehicles' | 'matching' | 'deploy'>('dashboard');
  const [monitorSubTab, setMonitorSubTab] = useState<'driver' | 'vehicle'>('driver');
  const [lastSync, setLastSync] = useState<string | null>(null);
  const [isCloudConnected, setIsCloudConnected] = useState(false);
  const [isLoading, setIsLoading] = useState(true);

  const [drivers, setDrivers] = useState<Driver[]>([]);
  const [vehicles, setVehicles] = useState<Vehicle[]>([]);
  const [tasks, setTasks] = useState<Task[]>([]);
  const [driverSchedules, setDriverSchedules] = useState<DriverSchedule[]>([]);
  const [vehicleSchedules, setVehicleSchedules] = useState<VehicleSchedule[]>([]);

  useEffect(() => {
    if (!isLoggedIn) return;
    const initData = async () => {
      setIsLoading(true);
      try {
        const loadedDrivers = await storage.load<Driver[]>('DRIVERS');
        const finalDrivers = (loadedDrivers && loadedDrivers.length > 0) ? loadedDrivers : generateDrivers();
        setDrivers(finalDrivers);

        const loadedVehicles = await storage.load<Vehicle[]>('VEHICLES');
        const finalVehicles = (loadedVehicles && loadedVehicles.length > 0) ? loadedVehicles : generateVehicles(finalDrivers);
        setVehicles(finalVehicles);

        const loadedTasks = await storage.load<Task[]>('TASKS');
        setTasks(loadedTasks || []);
        
        const loadedDched = await storage.load<DriverSchedule[]>('DRIVER_SCHEDULES');
        setDriverSchedules(loadedDched || generateSchedule(finalDrivers, currentDate));

        const loadedVsched = await storage.load<VehicleSchedule[]>('VEHICLE_SCHEDULES');
        setVehicleSchedules(loadedVsched || generateVehicleSchedule(finalVehicles, currentDate));
        
        setIsCloudConnected(true);
      } catch (e) {
        setIsCloudConnected(false);
      } finally {
        setIsLoading(false);
        setLastSync(storage.getLastSync());
      }
    };
    initData();
  }, [currentDate, isLoggedIn]);

  useEffect(() => {
    if (!isLoading && isLoggedIn) {
      storage.save('DRIVERS', drivers);
      storage.save('VEHICLES', vehicles);
      storage.save('TASKS', tasks);
      storage.save('DRIVER_SCHEDULES', driverSchedules);
      storage.save('VEHICLE_SCHEDULES', vehicleSchedules);
      setLastSync(new Date().toISOString());
    }
  }, [drivers, vehicles, tasks, driverSchedules, vehicleSchedules, isLoading, isLoggedIn]);

  const stats = useMemo(() => generateStats(drivers), [drivers]);

  const todayTasksCount = useMemo(() => {
    return tasks.filter(t => t.startTime.startsWith(currentDate)).length;
  }, [tasks, currentDate]);

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
    setActiveTab('dashboard');
  }, []);

  const handleUpdateSlotRange = useCallback((driverId: string, startIdx: number, endIdx: number, newStatus: DriverStatus) => {
    setDriverSchedules(prev => prev.map(s => s.driverId === driverId ? {
      ...s,
      slots: s.slots.map((slot, idx) => (idx >= startIdx && idx <= endIdx) ? { ...slot, status: newStatus } : slot)
    } : s));
  }, []);

  const handleUpdateDriver = (updatedDriver: Driver) => setDrivers(prev => prev.map(d => d.id === updatedDriver.id ? updatedDriver : d));
  const handleUpdateVehicle = (updatedVehicle: Vehicle) => setVehicles(prev => prev.map(v => v.id === updatedVehicle.id ? updatedVehicle : v));
  const handleAddVehicle = (newVehicle: Vehicle) => {
    setVehicles(prev => [...prev, newVehicle]);
    const newSched = generateVehicleSchedule([newVehicle], currentDate)[0];
    setVehicleSchedules(prev => [...prev, newSched]);
  };
  const handleUpdateVehicleStatus = (id: string, status: VehicleStatus) => setVehicles(prev => prev.map(v => v.id === id ? { ...v, status } : v));

  if (!isLoggedIn) return <LoginGate onLogin={handleLogin} />;

  if (isLoading) {
    return (
      <div className="h-screen w-screen bg-slate-900 flex flex-col items-center justify-center gap-6">
        <div className="w-20 h-20 bg-indigo-600 rounded-[32px] flex items-center justify-center animate-bounce shadow-2xl shadow-indigo-500/20">
          <Database className="w-10 h-10 text-white" />
        </div>
        <div className="text-center text-white">同步中...</div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-slate-50 flex flex-col md:flex-row font-sans overflow-hidden">
      <aside className="w-full md:w-64 bg-slate-900 text-white flex-shrink-0 flex flex-col h-screen sticky top-0 z-[100] border-r border-slate-800 shadow-2xl">
        <div className="p-8 border-b border-slate-800/50">
          <div className="flex items-center gap-3 font-black text-2xl tracking-tighter uppercase italic">
             <div className="w-10 h-10 bg-indigo-500 rounded-2xl flex items-center justify-center text-white font-mono not-italic shadow-xl">DF</div>
             FLEET PRO
          </div>
        </div>
        <nav className="flex-1 p-5 space-y-1.5 overflow-y-auto scrollbar-hide">
          {[
            { id: 'dashboard', label: '运营枢纽', icon: LayoutDashboard },
            { id: 'matching', label: '资源规划', icon: Zap },
            { id: 'monitor', label: '运力监控', icon: Clock },
            { id: 'reports', label: '绩效看板', icon: BarChart3 },
            { id: 'drivers', label: '司机管理', icon: Users },
            { id: 'vehicles', label: '资产管理', icon: Car },
          ].map(item => (
            <button key={item.id} onClick={() => setActiveTab(item.id as any)} className={`w-full flex items-center gap-3 px-5 py-4 rounded-[24px] font-black transition-all ${activeTab === item.id ? 'bg-indigo-600 text-white shadow-2xl shadow-indigo-900/40' : 'text-slate-500 hover:bg-slate-800 hover:text-white'}`}>
              <item.icon className="w-5 h-5" /><span className="text-sm uppercase tracking-widest">{item.label}</span>
            </button>
          ))}
          <div className="pt-4 mt-4 border-t border-slate-800">
            <button onClick={() => setActiveTab('deploy')} className={`w-full flex items-center gap-3 px-5 py-4 rounded-[24px] font-black transition-all ${activeTab === 'deploy' ? 'bg-orange-600 text-white shadow-2xl shadow-orange-900/40' : 'text-slate-500 hover:bg-slate-800 hover:text-white'}`}>
              <Cloud className="w-5 h-5" /><span className="text-sm uppercase tracking-widest">系统设置</span>
            </button>
          </div>
        </nav>
        <div className="p-6 bg-slate-950/50 border-t border-slate-800">
           <button onClick={handleLogout} className="w-full flex items-center justify-between px-5 py-3 rounded-xl bg-white/5 hover:bg-rose-500/10 text-slate-400 hover:text-rose-500 transition-all border border-transparent hover:border-rose-500/20 mb-4 group">
              <span className="text-[10px] font-black uppercase tracking-widest">退出系统</span>
              <LogOut className="w-4 h-4" />
           </button>
           <div className="flex items-center gap-3">
              <div className={`w-8 h-8 rounded-lg flex items-center justify-center ${isCloudConnected ? 'bg-emerald-500/10' : 'bg-slate-500/10'}`}>
                <Database className={`w-4 h-4 ${isCloudConnected ? 'text-emerald-500' : 'text-slate-500'}`} />
              </div>
              <div className="flex flex-col">
                 <span className="text-[9px] font-black text-slate-400 uppercase tracking-widest">{isCloudConnected ? 'Cloud Active' : 'Offline'}</span>
                 <span className="text-[8px] text-slate-600 font-bold truncate">Synced: {lastSync ? new Date(lastSync).toLocaleTimeString() : '...'}</span>
              </div>
           </div>
        </div>
      </aside>

      <main className="flex-1 flex flex-col h-screen overflow-hidden relative">
        <header className="bg-white border-b border-slate-100 p-6 flex justify-between items-center z-[50] shrink-0 shadow-sm">
           <h1 className="text-2xl font-black text-slate-800 uppercase tracking-tight italic">
             {activeTab === 'dashboard' && '运营枢纽'}
             {activeTab === 'matching' && '资源规划中心'}
             {activeTab === 'monitor' && '运力监控轴'}
             {activeTab === 'reports' && '车队绩效看板'}
             {activeTab === 'drivers' && '司机管理档案'}
             {activeTab === 'vehicles' && '资产管理档案'}
             {activeTab === 'deploy' && '系统管理'}
           </h1>
        </header>

        <div className="flex-1 overflow-auto p-8 bg-slate-50/50 scrollbar-hide relative">
          {activeTab === 'dashboard' && (
            <div className="space-y-10 animate-in fade-in slide-in-from-bottom-4 duration-700">
              {/* 核心看板卡片 */}
              <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
                <div className="bg-white p-8 rounded-[40px] border border-slate-100 shadow-sm transition-transform hover:scale-[1.02]">
                  <div className="w-12 h-12 bg-indigo-50 rounded-2xl flex items-center justify-center mb-6 text-indigo-500">
                    <ClipboardList className="w-6 h-6" />
                  </div>
                  <div className="text-[10px] font-black text-slate-400 uppercase tracking-widest mb-1">今日总任务</div>
                  <div className="text-3xl font-black text-slate-800 italic">{todayTasksCount} <span className="text-xs text-slate-300 not-italic uppercase ml-1">Orders</span></div>
                </div>
                <div className="bg-white p-8 rounded-[40px] border border-slate-100 shadow-sm transition-transform hover:scale-[1.02]">
                  <div className="w-12 h-12 bg-emerald-50 rounded-2xl flex items-center justify-center mb-6 text-emerald-500">
                    <Users className="w-6 h-6" />
                  </div>
                  <div className="text-[10px] font-black text-slate-400 uppercase tracking-widest mb-1">注册司机</div>
                  <div className="text-3xl font-black text-slate-800 italic">{drivers.length} <span className="text-xs text-slate-300 not-italic uppercase ml-1">Drivers</span></div>
                </div>
                <div className="bg-white p-8 rounded-[40px] border border-slate-100 shadow-sm transition-transform hover:scale-[1.02]">
                  <div className="w-12 h-12 bg-blue-50 rounded-2xl flex items-center justify-center mb-6 text-blue-500">
                    <Car className="w-6 h-6" />
                  </div>
                  <div className="text-[10px] font-black text-slate-400 uppercase tracking-widest mb-1">活跃车辆资产</div>
                  <div className="text-3xl font-black text-slate-800 italic">{vehicles.filter(v => v.status === VehicleStatus.ACTIVE).length} <span className="text-xs text-slate-300 not-italic uppercase ml-1">Active</span></div>
                </div>
                <div className="bg-white p-8 rounded-[40px] border border-slate-100 shadow-sm transition-transform hover:scale-[1.02]">
                  <div className="w-12 h-12 bg-rose-50 rounded-2xl flex items-center justify-center mb-6 text-rose-500">
                    <Activity className="w-6 h-6" />
                  </div>
                  <div className="text-[10px] font-black text-slate-400 uppercase tracking-widest mb-1">核心运营负载</div>
                  <div className="text-3xl font-black text-slate-800 italic">82 <span className="text-xs text-slate-300 not-italic uppercase ml-1">%</span></div>
                </div>
              </div>

              <div className="grid grid-cols-1 xl:grid-cols-3 gap-10">
                <div className="xl:col-span-2 flex flex-col gap-10">
                  <AIInsight stats={stats} tasks={tasks} schedules={driverSchedules} />
                  <div className="bg-white rounded-[48px] p-2 border border-slate-100 shadow-sm overflow-hidden h-[600px]">
                    <AvailabilityGrid mode="driver" drivers={drivers} schedule={driverSchedules} selectedDate={currentDate} />
                  </div>
                </div>
                <div className="xl:col-span-1 h-full">
                  <TaskList tasks={tasks} drivers={drivers} />
                </div>
              </div>
            </div>
          )}
          {activeTab === 'matching' && <MatchingCenter drivers={drivers} vehicles={vehicles} driverSchedules={driverSchedules} vehicleSchedules={vehicleSchedules} onCreateTask={handleCreateTask} />}
          {activeTab === 'monitor' && (
            <div className="flex flex-col gap-6 h-full">
              <div className="flex gap-2 p-1.5 bg-slate-200/50 w-fit rounded-2xl mb-2">
                <button onClick={() => setMonitorSubTab('driver')} className={`px-8 py-2.5 rounded-xl text-xs font-black transition-all ${monitorSubTab === 'driver' ? 'bg-white shadow-xl text-indigo-600' : 'text-slate-500 hover:text-slate-700'}`}>全域运力监控</button>
                <button onClick={() => setMonitorSubTab('vehicle')} className={`px-8 py-2.5 rounded-xl text-xs font-black transition-all ${monitorSubTab === 'vehicle' ? 'bg-white shadow-xl text-indigo-600' : 'text-slate-500 hover:text-slate-700'}`}>资产状态矩阵</button>
              </div>
              <div className="flex-1 bg-white rounded-[48px] p-2 border border-slate-100 shadow-sm overflow-hidden min-h-[600px]">
                <AvailabilityGrid mode={monitorSubTab} drivers={drivers} schedule={driverSchedules} vehicles={vehicles} vehicleSchedule={vehicleSchedules} onUpdateVehicleStatus={handleUpdateVehicleStatus} selectedDate={currentDate} />
              </div>
            </div>
          )}
          {activeTab === 'reports' && <PerformanceReport stats={stats} tasks={tasks} />}
          {activeTab === 'drivers' && <DriverManagement drivers={drivers} stats={stats} onUpdateDriver={handleUpdateDriver} />}
          {activeTab === 'vehicles' && <VehicleManagement vehicles={vehicles} onUpdateVehicle={handleUpdateVehicle} onAddVehicle={handleAddVehicle} />}
          {activeTab === 'deploy' && (
            <div className="max-w-5xl mx-auto space-y-10 animate-in fade-in slide-in-from-bottom-4 duration-700">
              <div className="grid grid-cols-1 lg:grid-cols-2 gap-10">
                <div className="bg-white rounded-[40px] p-10 border border-slate-100 shadow-sm">
                  <div className="flex justify-between items-start mb-8">
                    <div className="flex items-center gap-4">
                      <div className="w-14 h-14 bg-indigo-500 rounded-2xl flex items-center justify-center text-white shadow-lg"><Database className="w-8 h-8" /></div>
                      <div>
                        <h2 className="text-2xl font-black text-slate-800 tracking-tight italic uppercase">D1 存储中心</h2>
                        <p className="text-slate-400 text-sm font-bold uppercase tracking-widest mt-1">Cloudflare Edge Storage</p>
                      </div>
                    </div>
                  </div>
                  <div className="space-y-4">
                    <div className={`p-6 rounded-3xl border flex items-center gap-4 ${isCloudConnected ? 'bg-emerald-50 border-emerald-100' : 'bg-amber-50 border-amber-100'}`}>
                      <CheckCircle2 className={`w-6 h-6 ${isCloudConnected ? 'text-emerald-500' : 'text-amber-500'}`} />
                      <div>
                        <h4 className="font-black text-slate-800 text-sm uppercase italic">D1 数据库连接: {isCloudConnected ? '已激活' : '本地模式'}</h4>
                        <p className="text-xs text-slate-500 font-medium">所有资产、任务和排班变更将实时同步。</p>
                      </div>
                    </div>
                  </div>
                </div>
                <div className="bg-slate-900 rounded-[40px] p-10 shadow-2xl border-[8px] border-slate-800">
                   <div className="flex items-center gap-4 mb-8">
                      <div className="w-12 h-12 bg-slate-800 rounded-xl flex items-center justify-center text-indigo-400"><Code className="w-6 h-6" /></div>
                      <div>
                        <h3 className="text-white font-black italic uppercase tracking-tighter">常用 D1 查询指令</h3>
                      </div>
                   </div>
                   <div className="space-y-6">
                      <div className="space-y-3">
                         <div className="flex justify-between items-center px-1">
                            <span className="text-[10px] font-black text-slate-500 uppercase tracking-widest">查询今日任务总量</span>
                            <Copy className="w-3 h-3 text-slate-600 cursor-pointer hover:text-white" onClick={() => navigator.clipboard.writeText("SELECT count(*) FROM tasks WHERE date = date('now', 'localtime');")} />
                         </div>
                         <div className="bg-black/50 p-4 rounded-xl font-mono text-[11px] text-indigo-300 border border-white/5 break-all">
                           SELECT count(*) FROM tasks WHERE date = date('now', 'localtime');
                         </div>
                      </div>
                   </div>
                </div>
              </div>
            </div>
          )}
        </div>
      </main>
    </div>
  );
};

export default App;
