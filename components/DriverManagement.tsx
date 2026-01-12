
import React, { useState } from 'react';
import { Driver, DriverStats, DriverStatus } from '../types';
import { 
  Phone, Edit2, X, Star, Calendar, 
  User, UserCircle, Power, PowerOff, PlusCircle, Check,
  Briefcase, Trash2, Save
} from 'lucide-react';

interface Props {
  drivers: Driver[];
  stats: DriverStats[];
  onUpdateDriver: (driver: Driver) => void;
  onAddDriver: (driver: Driver) => void;
  onDeleteDriver?: (id: string) => void;
}

const DriverManagement: React.FC<Props> = ({ drivers, stats, onUpdateDriver, onAddDriver, onDeleteDriver }) => {
  const [editingDriver, setEditingDriver] = useState<Driver | null>(null);
  const [isAdding, setIsAdding] = useState(false);
  const [newDriverData, setNewDriverData] = useState<Partial<Driver>>({
    name: '',
    phone: '',
    gender: 'Male',
    experience_years: 1,
    isActive: true
  });

  const toggleDriverActive = (driver: Driver) => {
    onUpdateDriver({ ...driver, isActive: !driver.isActive });
  };

  const handleDelete = (driver: Driver) => {
    if (window.confirm(`⚠️ 安全预警\n\n确定要永久注销司机 [${driver.name}] 的档案吗？\n此操作将同时同步清理 D1 云端数据库记录且无法恢复。`)) {
      if (onDeleteDriver) {
        onDeleteDriver(driver.id);
      }
    }
  };

  const handleEditSave = (e: React.FormEvent) => {
    e.preventDefault();
    if (editingDriver) {
      onUpdateDriver(editingDriver);
      setEditingDriver(null);
    }
  };

  const handleAddSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    const finalName = newDriverData.name?.trim() || `临时编号-${Date.now().toString().slice(-4)}`;
    const newDriver: Driver = {
      id: `d-${Date.now()}`,
      name: finalName,
      gender: newDriverData.gender as any || 'Male',
      phone: newDriverData.phone || '暂无电话',
      joinDate: new Date().toISOString().split('T')[0],
      experience_years: Number(newDriverData.experience_years) || 0,
      isActive: true,
      currentStatus: DriverStatus.FREE,
      coordinates: { x: 50, y: 50 },
      avatar: `https://i.pravatar.cc/150?u=new-${Date.now()}`,
      rating: 5.0
    };
    onAddDriver(newDriver);
    setIsAdding(false);
    setNewDriverData({ name: '', phone: '', gender: 'Male', experience_years: 1, isActive: true });
  };

  return (
    <div className="h-full flex flex-col gap-8 animate-in fade-in duration-700">
      <div className="flex justify-between items-center">
        <div>
          <h2 className="text-3xl font-black text-slate-800 tracking-tight italic uppercase">司机人才档案库</h2>
          <p className="text-slate-500 font-bold mt-1 uppercase tracking-widest text-[11px]">
            全量在册: {drivers.length} 名驾驶员 / 手动可用性控制
          </p>
        </div>
        <button 
          onClick={() => setIsAdding(true)} 
          className="bg-slate-900 hover:bg-slate-800 text-white px-8 py-4 rounded-2xl font-black shadow-2xl transition-all flex items-center gap-2"
        >
          <PlusCircle className="w-5 h-5" /> 录入新司机
        </button>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-8 overflow-y-auto pb-16 scrollbar-hide">
        {drivers.map(driver => {
          const driverStat = stats.find(s => s.driverId === driver.id);
          return (
            <div key={driver.id} className={`bg-white p-8 rounded-[40px] border border-slate-100 shadow-sm hover:shadow-xl transition-all relative group overflow-hidden ${!driver.isActive ? 'opacity-60 grayscale' : ''}`}>
              <div className="absolute top-6 right-6 flex gap-2">
                <button 
                  onClick={() => handleDelete(driver)} 
                  className="p-3 bg-rose-50 text-rose-500 rounded-xl opacity-0 group-hover:opacity-100 transition-all hover:bg-rose-500 hover:text-white shadow-sm"
                  title="注销档案"
                >
                  <Trash2 className="w-4 h-4" />
                </button>
                <button 
                  onClick={() => toggleDriverActive(driver)} 
                  className={`p-3 rounded-xl transition-all ${driver.isActive ? 'bg-emerald-50 text-emerald-600' : 'bg-rose-50 text-rose-600'}`}
                >
                  {driver.isActive ? <Power className="w-4 h-4" /> : <PowerOff className="w-4 h-4" />}
                </button>
                <button onClick={() => setEditingDriver({...driver})} className="p-3 text-slate-300 hover:text-indigo-600 bg-slate-50 rounded-xl transition-all">
                  <Edit2 className="w-4 h-4" />
                </button>
              </div>

              <div className="flex items-center gap-5 mb-8">
                <div className={`w-16 h-16 rounded-[24px] flex items-center justify-center text-white shadow-xl ${driver.isActive ? 'bg-slate-900' : 'bg-slate-400'}`}>
                   <UserCircle className="w-10 h-10" />
                </div>
                <div>
                  <h3 className="font-black text-slate-800 text-2xl tracking-tighter mb-1">{driver.name}</h3>
                  <div className="flex items-center gap-3">
                    <span className="text-[10px] font-black text-slate-400 uppercase tracking-widest">{driver.gender === 'Male' ? '男' : '女'}</span>
                    <span className="w-1 h-1 bg-slate-200 rounded-full"></span>
                    <span className={`text-[10px] font-black uppercase tracking-widest ${driver.isActive ? 'text-emerald-500' : 'text-rose-500'}`}>
                        {driver.isActive ? '工作中' : '暂停服务'}
                    </span>
                  </div>
                </div>
              </div>

              <div className="grid grid-cols-2 gap-4 mb-8 bg-slate-50 p-6 rounded-[32px] border border-white">
                 <div className="flex flex-col">
                    <span className="text-[9px] text-slate-400 font-black uppercase tracking-widest mb-1">累计单量</span>
                    <span className="font-black text-slate-800 text-xl">{driverStat?.completedOrders || 0}</span>
                 </div>
                 <div className="flex flex-col">
                    <span className="text-[9px] text-slate-400 font-black uppercase tracking-widest mb-1">服务指数</span>
                    <div className="flex items-center gap-1">
                       <span className="font-black text-slate-800 text-xl">{driver.rating.toFixed(1)}</span>
                       <Star className="w-4 h-4 text-yellow-400 fill-yellow-400" />
                    </div>
                 </div>
              </div>
              
              <div className="space-y-4">
                 <div className="flex items-center gap-4 text-slate-600">
                    <Phone className="w-4 h-4" />
                    <span className="font-bold text-sm tracking-tighter">{driver.phone}</span>
                 </div>
                 <div className="flex items-center gap-4 text-slate-600">
                    <Briefcase className="w-4 h-4" />
                    <span className="font-bold text-sm">驾龄: {driver.experience_years} 年</span>
                 </div>
              </div>
            </div>
          );
        })}
      </div>

      {/* 新增：编辑司机浮层 */}
      {editingDriver && (
        <div className="fixed inset-0 z-[100] flex items-center justify-center p-4">
          <div className="absolute inset-0 bg-slate-900/80 backdrop-blur-2xl animate-in fade-in duration-300" onClick={() => setEditingDriver(null)}></div>
          <div className="relative bg-white rounded-[56px] shadow-2xl w-full max-w-xl p-12 animate-in zoom-in-95 duration-300 border border-white/20">
             <div className="flex justify-between items-center mb-10">
                <div className="flex items-center gap-4">
                  <div className="w-12 h-12 bg-indigo-600 rounded-2xl flex items-center justify-center text-white shadow-lg">
                    <Edit2 className="w-6 h-6" />
                  </div>
                  <div>
                    <h3 className="text-2xl font-black text-slate-800 italic uppercase tracking-tighter">编辑司机档案</h3>
                    <p className="text-[9px] font-black text-slate-400 uppercase tracking-[0.2em]">{editingDriver.id}</p>
                  </div>
                </div>
                <button onClick={() => setEditingDriver(null)} className="w-10 h-10 bg-slate-50 rounded-full flex items-center justify-center hover:bg-slate-100 transition-all text-slate-400"><X className="w-5 h-5" /></button>
             </div>
             
             <form onSubmit={handleEditSave} className="space-y-6">
                <div className="space-y-2">
                  <label className="block text-[10px] font-black text-slate-400 uppercase tracking-widest px-1">真实姓名</label>
                  <input type="text" value={editingDriver.name} onChange={e => setEditingDriver({...editingDriver, name: e.target.value})} className="w-full p-5 bg-slate-50 border-2 border-slate-50 focus:border-indigo-500/20 focus:bg-white rounded-2xl font-bold transition-all outline-none" required />
                </div>
                <div className="space-y-2">
                  <label className="block text-[10px] font-black text-slate-400 uppercase tracking-widest px-1">联系电话</label>
                  <input type="tel" value={editingDriver.phone} onChange={e => setEditingDriver({...editingDriver, phone: e.target.value})} className="w-full p-5 bg-slate-50 border-2 border-slate-50 focus:border-indigo-500/20 focus:bg-white rounded-2xl font-bold transition-all outline-none" required />
                </div>
                <div className="grid grid-cols-2 gap-6">
                  <div className="space-y-2">
                    <label className="block text-[10px] font-black text-slate-400 uppercase tracking-widest px-1">性别</label>
                    <select value={editingDriver.gender} onChange={e => setEditingDriver({...editingDriver, gender: e.target.value as any})} className="w-full p-5 bg-slate-50 border-2 border-slate-50 rounded-2xl font-bold outline-none appearance-none">
                      <option value="Male">男性</option>
                      <option value="Female">女性</option>
                    </select>
                  </div>
                  <div className="space-y-2">
                    <label className="block text-[10px] font-black text-slate-400 uppercase tracking-widest px-1">驾龄 (年)</label>
                    <input type="number" min="0" max="50" value={editingDriver.experience_years} onChange={e => setEditingDriver({...editingDriver, experience_years: Number(e.target.value)})} className="w-full p-5 bg-slate-50 border-2 border-slate-50 rounded-2xl font-bold outline-none" />
                  </div>
                </div>
                <div className="pt-8">
                  <button type="submit" className="w-full bg-slate-900 hover:bg-slate-800 text-white py-6 rounded-[32px] font-black uppercase tracking-[0.2em] text-xs flex items-center justify-center gap-4 shadow-2xl transition-all active:scale-95">
                    <Save className="w-5 h-5 text-indigo-400" /> 保存变更并推送到云端
                  </button>
                  <p className="text-center text-[9px] text-slate-400 font-black uppercase tracking-widest mt-4">变更将实时反映在 D1 后台数据库</p>
                </div>
             </form>
          </div>
        </div>
      )}

      {isAdding && (
        <div className="fixed inset-0 z-[100] flex items-center justify-center p-4">
          <div className="absolute inset-0 bg-slate-900/60 backdrop-blur-xl animate-in fade-in duration-300" onClick={() => setIsAdding(false)}></div>
          <div className="relative bg-white rounded-[56px] shadow-2xl w-full max-w-xl p-12 animate-in zoom-in-95 duration-300">
             <div className="flex justify-between items-center mb-10">
                <div className="flex items-center gap-4">
                  <div className="w-12 h-12 bg-indigo-600 rounded-2xl flex items-center justify-center text-white shadow-lg">
                    <PlusCircle className="w-6 h-6" />
                  </div>
                  <h3 className="text-2xl font-black text-slate-800 italic uppercase tracking-tighter">录入新驾驶员</h3>
                </div>
                <button onClick={() => setIsAdding(false)} className="w-10 h-10 bg-slate-50 rounded-full flex items-center justify-center hover:bg-slate-100 transition-all text-slate-400"><X className="w-5 h-5" /></button>
             </div>
             
             <form onSubmit={handleAddSubmit} className="space-y-6">
                <div className="space-y-2">
                  <label className="block text-[10px] font-black text-slate-400 uppercase tracking-widest px-1">真实姓名</label>
                  <input type="text" value={newDriverData.name} onChange={e => setNewDriverData({...newDriverData, name: e.target.value})} className="w-full p-5 bg-slate-50 border-2 border-slate-50 focus:border-indigo-500/20 focus:bg-white rounded-2xl font-bold transition-all outline-none" placeholder="输入司机姓名 (选填)" />
                </div>
                <div className="space-y-2">
                  <label className="block text-[10px] font-black text-slate-400 uppercase tracking-widest px-1">联系电话</label>
                  <input type="tel" value={newDriverData.phone} onChange={e => setNewDriverData({...newDriverData, phone: e.target.value})} className="w-full p-5 bg-slate-50 border-2 border-slate-50 focus:border-indigo-500/20 focus:bg-white rounded-2xl font-bold transition-all outline-none" placeholder="138 **** **** (选填)" />
                </div>
                <div className="grid grid-cols-2 gap-6">
                  <div className="space-y-2">
                    <label className="block text-[10px] font-black text-slate-400 uppercase tracking-widest px-1">性别</label>
                    <select value={newDriverData.gender} onChange={e => setNewDriverData({...newDriverData, gender: e.target.value as any})} className="w-full p-5 bg-slate-50 border-2 border-slate-50 rounded-2xl font-bold outline-none appearance-none">
                      <option value="Male">男性</option>
                      <option value="Female">女性</option>
                    </select>
                  </div>
                  <div className="space-y-2">
                    <label className="block text-[10px] font-black text-slate-400 uppercase tracking-widest px-1">驾龄 (年)</label>
                    <input type="number" min="0" max="50" value={newDriverData.experience_years} onChange={e => setNewDriverData({...newDriverData, experience_years: Number(e.target.value)})} className="w-full p-5 bg-slate-50 border-2 border-slate-50 rounded-2xl font-bold outline-none" />
                  </div>
                </div>
                <div className="pt-8">
                  <button type="submit" className="w-full bg-indigo-600 hover:bg-indigo-500 text-white py-6 rounded-[32px] font-black uppercase tracking-[0.2em] text-xs flex items-center justify-center gap-4 shadow-2xl shadow-indigo-900/40 transition-all active:scale-95">
                    <Check className="w-5 h-5" /> 确认录入系统并同步云端
                  </button>
                  <p className="text-center text-[9px] text-slate-400 font-black uppercase tracking-widest mt-4">已启用弹性同步机制：非法或空缺数值将被自动纠偏</p>
                </div>
             </form>
          </div>
        </div>
      )}
    </div>
  );
};

export default DriverManagement;
