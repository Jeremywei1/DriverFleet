
import React, { useState } from 'react';
import { Driver, DriverStats } from '../types';
import { 
  Phone, Edit2, X, Star, Calendar, 
  User, UserCircle, Power, PowerOff
} from 'lucide-react';

interface Props {
  drivers: Driver[];
  stats: DriverStats[];
  onUpdateDriver: (driver: Driver) => void;
}

const DriverManagement: React.FC<Props> = ({ drivers, stats, onUpdateDriver }) => {
  const [editingDriver, setEditingDriver] = useState<Driver | null>(null);

  const toggleDriverActive = (driver: Driver) => {
    onUpdateDriver({ ...driver, isActive: !driver.isActive });
  };

  const handleSave = (e: React.FormEvent) => {
    e.preventDefault();
    if (editingDriver) {
      onUpdateDriver(editingDriver);
      setEditingDriver(null);
    }
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
        <button className="bg-slate-900 hover:bg-slate-800 text-white px-8 py-4 rounded-2xl font-black shadow-2xl transition-all flex items-center gap-2">
          <User className="w-5 h-5" /> 录入新司机
        </button>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-8 overflow-y-auto pb-16 scrollbar-hide">
        {drivers.map(driver => {
          const driverStat = stats.find(s => s.driverId === driver.id);
          return (
            <div key={driver.id} className={`bg-white p-8 rounded-[40px] border border-slate-100 shadow-sm hover:shadow-xl transition-all relative overflow-hidden ${!driver.isActive ? 'opacity-60 grayscale' : ''}`}>
              <div className="absolute top-6 right-6 flex gap-2">
                <button 
                  onClick={() => toggleDriverActive(driver)} 
                  className={`p-3 rounded-xl transition-all ${driver.isActive ? 'bg-emerald-50 text-emerald-600 hover:bg-rose-50 hover:text-rose-600' : 'bg-rose-50 text-rose-600 hover:bg-emerald-50 hover:text-emerald-600'}`}
                  title={driver.isActive ? "暂停接单/设为离职" : "恢复正常接单"}
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
                    <span className="text-[9px] text-slate-400 font-black uppercase tracking-widest mb-1">历史订单</span>
                    <span className="font-black text-slate-800 text-xl">{driverStat?.completedOrders || 0}</span>
                 </div>
                 <div className="flex flex-col">
                    <span className="text-[9px] text-slate-400 font-black uppercase tracking-widest mb-1">服务评分</span>
                    <div className="flex items-center gap-1">
                       <span className="font-black text-slate-800 text-xl">4.9</span>
                       <Star className="w-4 h-4 text-yellow-400 fill-yellow-400" />
                    </div>
                 </div>
              </div>
              
              <div className="space-y-4">
                 <div className="flex items-center gap-4">
                    <Phone className="w-4 h-4 text-slate-300" />
                    <span className="font-black text-slate-700 text-sm">{driver.phone}</span>
                 </div>
                 <div className="flex items-center gap-4">
                    <Calendar className="w-4 h-4 text-slate-300" />
                    <span className="font-black text-slate-700 text-sm">入职: {driver.joinDate}</span>
                 </div>
              </div>
            </div>
          );
        })}
      </div>

      {editingDriver && (
        <div className="fixed inset-0 z-[100] flex items-center justify-center p-4">
          <div className="absolute inset-0 bg-slate-900/60 backdrop-blur-xl" onClick={() => setEditingDriver(null)}></div>
          <div className="relative bg-white rounded-[56px] shadow-2xl w-full max-w-xl p-12 animate-in zoom-in-95 duration-300">
             <div className="flex justify-between items-center mb-10">
                <h3 className="text-2xl font-black text-slate-800 italic uppercase">修改资料</h3>
                <button onClick={() => setEditingDriver(null)}><X className="w-6 h-6 text-slate-300" /></button>
             </div>
             <form onSubmit={handleSave} className="space-y-6">
                <div>
                  <label className="block text-[10px] font-black text-slate-400 uppercase tracking-widest mb-2">姓名</label>
                  <input type="text" value={editingDriver.name} onChange={e => setEditingDriver({...editingDriver, name: e.target.value})} className="w-full p-4 bg-slate-50 border border-slate-100 rounded-2xl font-bold" />
                </div>
                <div>
                  <label className="block text-[10px] font-black text-slate-400 uppercase tracking-widest mb-2">电话</label>
                  <input type="text" value={editingDriver.phone} onChange={e => setEditingDriver({...editingDriver, phone: e.target.value})} className="w-full p-4 bg-slate-50 border border-slate-100 rounded-2xl font-bold" />
                </div>
                <div className="pt-6">
                  <button type="submit" className="w-full bg-slate-900 text-white py-5 rounded-2xl font-black uppercase tracking-widest">保存更新</button>
                </div>
             </form>
          </div>
        </div>
      )}
    </div>
  );
};

export default DriverManagement;
