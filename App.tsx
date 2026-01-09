
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
import { 
  LayoutDashboard, Users, BarChart3, Settings, Calendar as CalendarIcon, 
  Bell, Map, Clock, Car, Zap, Database, Cloud, ExternalLink, Info, CheckCircle2, RotateCcw
} from 'lucide-react';
import { DriverStatus, Driver, Vehicle, Task, DriverSchedule, VehicleSchedule, VehicleStatus } from './types';

const App: React.FC = () => {
  const [currentDate, setCurrentDate] = useState<string>(new Date().toISOString().split('T')[0]);
  const [activeTab, setActiveTab] = useState<'dashboard' | 'reports' | 'drivers' | 'map' | 'monitor' | 'vehicles' | 'matching' | 'deploy'>('dashboard');
  const [monitorSubTab, setMonitorSubTab] = useState<'driver' | 'vehicle'>('driver');
  const [lastSync, setLastSync] = useState<string | null>(storage.getLastSync());
  const [showDeployGuide, setShowDeployGuide] = useState(false);

  // 数据初始化与校验逻辑
  const [drivers, setDrivers] = useState<Driver[]>(() => {
    const loaded = storage.load<Driver[]>('DRIVERS');
    return (loaded && loaded.length > 0 && loaded[0].name) ? loaded : generateDrivers();
  });

  const [vehicles, setVehicles] = useState<Vehicle[]>(() => {
    const loaded = storage.load<Vehicle[]>('VEHICLES');
    if (loaded && loaded.length > 0 && loaded[0].plateNumber) {
      return loaded;
    }
    return generateVehicles(drivers);
  });

  const [tasks, setTasks] = useState<Task[]>(() => storage.load<Task[]>('TASKS') || []);
  
  const [driverSchedules, setDriverSchedules] = useState<DriverSchedule[]>(() => {
    const loaded = storage.load<DriverSchedule[]>('DRIVER_SCHEDULES');
    return (loaded && loaded.length > 0) ? loaded : generateSchedule(drivers, currentDate);
  });

  const [vehicleSchedules, setVehicleSchedules] = useState<VehicleSchedule[]>(() => {
    const loaded = storage.load<VehicleSchedule[]>('VEHICLE_SCHEDULES');
    return (loaded && loaded.length > 0) ? loaded : generateVehicleSchedule(vehicles, currentDate);
  });

  useEffect(() => {
    storage.save('DRIVERS', drivers);
    storage.save('VEHICLES', vehicles);
    storage.save('TASKS', tasks);
    storage.save('DRIVER_SCHEDULES', driverSchedules);
    storage.save('VEHICLE_SCHEDULES', vehicleSchedules);
    setLastSync(new Date().toISOString());
  }, [drivers, vehicles, tasks, driverSchedules, vehicleSchedules]);

  const stats = useMemo(() => generateStats(drivers), [drivers]);

  const handleResetData = () => {
    if (confirm('确定要重置所有本地模拟数据吗？这将清除您当前的排班和任务记录。')) {
      storage.clear();
      window.location.reload();
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
    // 为新车辆生成排班轴
    const newSched = generateVehicleSchedule([newVehicle], currentDate)[0];
    setVehicleSchedules(prev => [...prev, newSched]);
  };

  const handleUpdateVehicleStatus = (id: string, status: VehicleStatus) => setVehicles(prev => prev.map(v => v.id === id ? { ...v, status } : v));

  const renderActiveTab = () => {
    switch (activeTab) {
      case 'dashboard':
        return (
          <div className="grid grid-cols-1 xl:grid-cols-3 gap-10">
            <div className="xl:col-span-2 flex flex-col gap-10">
              <AIInsight stats={stats} tasks={tasks} schedules={driverSchedules} />
              <div className="bg-white rounded-[48px] p-2 border border-slate-100 shadow-sm overflow-hidden h-[600px]">
                <AvailabilityGrid mode="driver" drivers={drivers} schedule={driverSchedules} onUpdateSlot={handleUpdateSlotRange} selectedDate={currentDate} />
              </div>
            </div>
            <div className="xl:col-span-1">
              <TaskList tasks={tasks} drivers={drivers} />
            </div>
          </div>
        );
      case 'matching':
        return <MatchingCenter drivers={drivers} vehicles={vehicles} driverSchedules={driverSchedules} vehicleSchedules={vehicleSchedules} onCreateTask={handleCreateTask} />;
      case 'monitor':
        return (
          <div className="flex flex-col gap-6 h-full">
            <div className="flex gap-2 p-1.5 bg-slate-200/50 w-fit rounded-2xl mb-2">
              <button onClick={() => setMonitorSubTab('driver')} className={`px-8 py-2.5 rounded-xl text-xs font-black transition-all ${monitorSubTab === 'driver' ? 'bg-white shadow-xl text-indigo-600' : 'text-slate-500 hover:text-slate-700'}`}>全域运力监控</button>
              <button onClick={() => setMonitorSubTab('vehicle')} className={`px-8 py-2.5 rounded-xl text-xs font-black transition-all ${monitorSubTab === 'vehicle' ? 'bg-white shadow-xl text-indigo-600' : 'text-slate-500 hover:text-slate-700'}`}>资产状态矩阵</button>
            </div>
            <div className="flex-1 bg-white rounded-[48px] p-2 border border-slate-100 shadow-sm overflow-hidden">
              <AvailabilityGrid mode={monitorSubTab} drivers={drivers} schedule={driverSchedules} vehicles={vehicles} vehicleSchedule={vehicleSchedules} onUpdateSlot={handleUpdateSlotRange} onUpdateVehicleStatus={handleUpdateVehicleStatus} selectedDate={currentDate} />
            </div>
          </div>
        );
      case 'map':
        return <LiveMap drivers={drivers} vehicles={vehicles} />;
      case 'reports':
        return <PerformanceReport stats={stats} />;
      case 'drivers':
        return <DriverManagement drivers={drivers} stats={stats} onUpdateDriver={handleUpdateDriver} />;
      case 'vehicles':
        return <VehicleManagement vehicles={vehicles} onUpdateVehicle={handleUpdateVehicle} onAddVehicle={handleAddVehicle} />;
      case 'deploy':
        return (
          <div className="max-w-4xl mx-auto space-y-10 animate-in fade-in slide-in-from-bottom-4 duration-700">
            <div className="bg-white rounded-[40px] p-10 border border-slate-100 shadow-sm">
              <div className="flex justify-between items-start mb-8">
                <div className="flex items-center gap-4">
                  <div className="w-14 h-14 bg-orange-500 rounded-2xl flex items-center justify-center text-white shadow-lg">
                    <Cloud className="w-8 h-8" />
                  </div>
                  <div>
                    <h2 className="text-2xl font-black text-slate-800">Cloudflare Pages 部署路径</h2>
                    <p className="text-slate-400 text-sm font-bold uppercase tracking-widest">按照以下步骤将应用推向生产环境</p>
                  </div>
                </div>
                <button onClick={handleResetData} className="px-6 py-3 bg-rose-50 text-rose-600 rounded-xl font-black text-xs uppercase tracking-widest border border-rose-100 hover:bg-rose-100 transition-colors flex items-center gap-2"><RotateCcw className="w-4 h-4" />重置本地缓存</button>
              </div>
              <div className="space-y-6">
                {[
                  { step: 1, title: '代码准备', desc: '将当前所有文件上传到您的 GitHub 仓库。', icon: ExternalLink, done: true },
                  { step: 2, title: '登录 Cloudflare', desc: '进入控制台，点击 "Workers & Pages" -> "Create Application" -> "Pages" -> "Connect to Git"。', icon: LayoutDashboard, done: false },
                  { step: 3, title: '配置构建命令', desc: 'Build Command 输入 "npm run build"，Output directory 输入 "dist"。', icon: Settings, done: false },
                  { step: 4, title: '添加 API 密钥', desc: '在 Settings -> Environment Variables 中添加 API_KEY 变量，填入您的 Gemini Key。', icon: Zap, done: false },
                  { step: 5, title: '激活 D1 数据库 (后续)', desc: '在控制台创建 D1 数据库并绑定到本项目，即可实现永久存储。', icon: Database, done: false },
                ].map((s) => (
                  <div key={s.step} className="flex gap-6 p-6 rounded-3xl border border-slate-50 bg-slate-50/30 hover:bg-white hover:shadow-xl transition-all group">
                    <div className={`w-12 h-12 rounded-xl flex items-center justify-center font-black ${s.done ? 'bg-emerald-500 text-white' : 'bg-slate-200 text-slate-400'}`}>{s.step}</div>
                    <div className="flex-1">
                      <h3 className="font-black text-slate-800 flex items-center gap-2">{s.title}{s.done && <CheckCircle2 className="w-4 h-4 text-emerald-500" />}</h3>
                      <p className="text-slate-500 text-sm mt-1">{s.desc}</p>
                    </div>
                    <s.icon className="w-5 h-5 text-slate-300 group-hover:text-indigo-500 transition-colors" />
                  </div>
                ))}
              </div>
            </div>
          </div>
        );
      default:
        return null;
    }
  };

  return (
    <div className="min-h-screen bg-slate-50 flex flex-col md:flex-row font-sans">
      <aside className="w-full md:w-64 bg-slate-900 text-white flex-shrink-0 flex flex-col h-screen sticky top-0 z-[200]">
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
            <button key={item.id} onClick={() => setActiveTab(item.id as any)} className={`w-full flex items-center gap-3 px-5 py-4 rounded-[24px] font-black transition-all ${activeTab === item.id ? 'bg-indigo-600 text-white shadow-2xl shadow-indigo-900/40' : 'text-slate-500 hover:bg-slate-800 hover:text-white'}`}>
              <item.icon className="w-5 h-5" /><span className="text-sm uppercase tracking-widest">{item.label}</span>
            </button>
          ))}
          <div className="pt-4 mt-4 border-t border-slate-800">
            <button onClick={() => setActiveTab('deploy')} className={`w-full flex items-center gap-3 px-5 py-4 rounded-[24px] font-black transition-all ${activeTab === 'deploy' ? 'bg-orange-600 text-white shadow-2xl shadow-orange-900/40' : 'text-slate-500 hover:bg-slate-800 hover:text-white'}`}>
              <Cloud className="w-5 h-5" /><span className="text-sm uppercase tracking-widest">部署与云同步</span>
            </button>
          </div>
        </nav>
        <div className="p-6 bg-slate-950/50 border-t border-slate-800">
           <div className="flex items-center gap-3">
              <div className="w-8 h-8 rounded-lg bg-emerald-500/10 flex items-center justify-center"><Database className="w-4 h-4 text-emerald-500" /></div>
              <div className="flex flex-col">
                 <span className="text-[9px] font-black text-slate-400 uppercase tracking-widest">Local Persistence</span>
                 <span className="text-[8px] text-slate-600 font-bold truncate">Synced: {lastSync ? new Date(lastSync).toLocaleTimeString() : 'Never'}</span>
              </div>
           </div>
        </div>
      </aside>
      <main className="flex-1 flex flex-col h-screen overflow-hidden">
        <header className="bg-white border-b border-slate-100 p-6 flex justify-between items-center z-10 shrink-0">
           <div className="flex items-center gap-6">
             <h1 className="text-2xl font-black text-slate-800 uppercase tracking-tight">
               {activeTab === 'dashboard' && '运营枢纽'}
               {activeTab === 'matching' && '资源规划中心'}
               {activeTab === 'monitor' && '全域运力监控轴'}
               {activeTab === 'map' && '实时调度上帝视角'}
               {activeTab === 'reports' && '车队绩效看板'}
               {activeTab === 'drivers' && '司机管理档案'}
               {activeTab === 'vehicles' && '车队资产档案'}
               {activeTab === 'deploy' && 'CLOUDFLARE 部署向导'}
             </h1>
             {activeTab === 'deploy' && (
               <div className="flex items-center gap-2 bg-orange-50 text-orange-600 px-4 py-1.5 rounded-full border border-orange-100 animate-pulse">
                  <Info className="w-4 h-4" /><span className="text-xs font-black uppercase tracking-tighter">待执行云端绑定</span>
               </div>
             )}
           </div>
           <div className="flex items-center gap-4">
              <div className="w-10 h-10 rounded-2xl bg-slate-100 flex items-center justify-center text-slate-400"><Bell className="w-5 h-5" /></div>
           </div>
        </header>
        <div className="flex-1 overflow-auto p-8 bg-slate-50/50 scrollbar-hide">{renderActiveTab()}</div>
      </main>
    </div>
  );
};

export default App;
