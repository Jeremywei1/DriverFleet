
import React, { useState } from 'react';
import { Driver, DriverStats } from '../types';
import { ShieldCheck, Map, Phone, MoreHorizontal, Mail, Edit2, X, Star, Calendar } from 'lucide-react';

interface Props {
  drivers: Driver[];
  stats: DriverStats[];
  onUpdateDriver: (driver: Driver) => void;
}

const DriverManagement: React.FC<Props> = ({ drivers, stats, onUpdateDriver }) => {
  const [editingDriver, setEditingDriver] = useState<Driver | null>(null);

  const handleSave = (e: React.FormEvent) => {
    e.preventDefault();
    if (editingDriver) {
      onUpdateDriver(editingDriver);
      setEditingDriver(null);
    }
  };

  return (
    <div className="h-full flex flex-col gap-6 animate-in fade-in duration-500">
      <div className="flex justify-between items-center">
        <div>
          <h2 className="text-2xl font-black text-slate-800">司机车队</h2>
          <p className="text-slate-500 font-medium">管理您的 {drivers.length} 名活跃司机及个人档案</p>
        </div>
        <button className="bg-indigo-600 hover:bg-indigo-700 text-white px-6 py-3 rounded-2xl font-black shadow-xl shadow-indigo-100 transition-all flex items-center gap-2">
          + 添加新司机
        </button>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-6 overflow-y-auto pb-12 pr-2">
        {drivers.map(driver => {
          const driverStat = stats.find(s => s.driverId === driver.id);
          
          return (
            <div key={driver.id} className="bg-white p-6 rounded-[32px] border border-slate-100 shadow-sm hover:shadow-xl transition-all group relative overflow-visible">
              <div className="absolute top-4 right-4 flex gap-1">
                <button 
                  onClick={() => setEditingDriver(driver)}
                  className="p-2.5 text-slate-300 hover:text-indigo-600 hover:bg-indigo-50 rounded-xl transition-all"
                  title="编辑资料"
                >
                  <Edit2 className="w-4 h-4" />
                </button>
                <button className="p-2.5 text-slate-300 hover:text-slate-600 hover:bg-slate-50 rounded-xl transition-all">
                  <MoreHorizontal className="w-5 h-5" />
                </button>
              </div>

              <div className="flex items-center gap-4 mb-6">
                <div className="relative">
                   <img src={driver.avatar} alt={driver.name} className="w-16 h-16 rounded-[20px] object-cover shadow-sm bg-slate-50 border-2 border-white" />
                   <div className="absolute -bottom-1 -right-1 w-5 h-5 bg-emerald-500 rounded-full border-2 border-white flex items-center justify-center">
                      <ShieldCheck className="w-3 h-3 text-white" />
                   </div>
                </div>
                <div>
                  <h3 className="font-black text-slate-800 text-xl tracking-tight leading-none mb-1">{driver.name}</h3>
                  <div className="flex items-center gap-1.5 text-[10px] font-black text-slate-400 uppercase tracking-widest">
                     ID: {driver.id} · 资深驾驶员
                  </div>
                </div>
              </div>

              {/* Stats Grid - Fixed UI Bug by ensuring proper layout and no overflow clipping */}
              <div className="grid grid-cols-2 gap-3 mb-6">
                 <div className="bg-slate-50 p-4 rounded-2xl flex flex-col justify-center min-h-[80px]">
                    <div className="text-[10px] text-slate-400 uppercase font-black tracking-widest mb-1.5">完成订单</div>
                    <div className="font-black text-slate-800 text-2xl leading-none">
                      {driverStat?.completedOrders || 0}
                    </div>
                 </div>
                 <div className="bg-slate-50 p-4 rounded-2xl flex flex-col justify-center min-h-[80px]">
                    <div className="text-[10px] text-slate-400 uppercase font-black tracking-widest mb-1.5">综合评分</div>
                    <div className="font-black text-slate-800 text-2xl leading-none flex items-center gap-1.5">
                      {driver.rating.toFixed(1)} 
                      <Star className="w-5 h-5 text-yellow-400 fill-yellow-400" />
                    </div>
                 </div>
              </div>
              
              <div className="space-y-3 mb-6 px-1">
                 <div className="flex items-center gap-3 text-sm font-bold text-slate-500">
                    <Map className="w-4 h-4 text-slate-300" />
                    <span>本月里程: {driverStat?.totalDistance.toLocaleString()} km</span>
                 </div>
                 <div className="flex items-center gap-3 text-sm font-bold text-slate-500">
                    <Phone className="w-4 h-4 text-slate-300" />
                    <span>手机: {driver.phone || '未绑定号码'}</span>
                 </div>
                 <div className="flex items-center gap-3 text-sm font-bold text-slate-500">
                    <Calendar className="w-4 h-4 text-slate-300" />
                    <span>入职日期: {driver.joinDate}</span>
                 </div>
              </div>

              <div className="flex gap-2">
                <button className="flex-1 bg-slate-900 text-white py-3.5 rounded-2xl text-xs font-black uppercase tracking-widest hover:bg-slate-800 transition-all shadow-lg shadow-slate-200">
                  查看运营报告
                </button>
                <button className="w-14 flex items-center justify-center bg-slate-50 hover:bg-slate-100 text-slate-600 rounded-2xl transition-all group">
                  <Mail className="w-5 h-5 group-hover:scale-110 transition-transform" />
                </button>
              </div>
            </div>
          );
        })}
      </div>

      {/* Edit Driver Modal */}
      {editingDriver && (
        <div className="fixed inset-0 z-[100] flex items-center justify-center p-4">
          <div className="absolute inset-0 bg-slate-900/60 backdrop-blur-md" onClick={() => setEditingDriver(null)}></div>
          <div className="relative bg-white rounded-[40px] shadow-2xl w-full max-w-xl overflow-hidden animate-in zoom-in-95 duration-200">
            <form onSubmit={handleSave} className="p-10">
              <div className="flex justify-between items-center mb-10">
                <div>
                  <h3 className="text-3xl font-black text-slate-800">编辑司机档案</h3>
                  <p className="text-slate-400 font-bold uppercase tracking-widest text-[10px] mt-1">系统内部 ID: {editingDriver.id}</p>
                </div>
                <button type="button" onClick={() => setEditingDriver(null)} className="p-3 hover:bg-slate-50 rounded-full text-slate-400 transition-colors">
                  <X className="w-8 h-8" />
                </button>
              </div>

              <div className="space-y-8">
                <div className="grid grid-cols-2 gap-6">
                  <div>
                    <label className="block text-[10px] font-black text-slate-400 uppercase tracking-widest mb-3 px-1">司机姓名</label>
                    <input 
                      type="text" 
                      value={editingDriver.name}
                      onChange={(e) => setEditingDriver({...editingDriver, name: e.target.value})}
                      className="w-full px-6 py-4 bg-slate-50 border border-slate-100 rounded-2xl focus:outline-none focus:ring-4 focus:ring-indigo-100 font-black text-slate-700 transition-all"
                      placeholder="输入姓名"
                    />
                  </div>
                  <div>
                    <label className="block text-[10px] font-black text-slate-400 uppercase tracking-widest mb-3 px-1">联系电话</label>
                    <input 
                      type="text" 
                      value={editingDriver.phone || ''}
                      onChange={(e) => setEditingDriver({...editingDriver, phone: e.target.value})}
                      className="w-full px-6 py-4 bg-slate-50 border border-slate-100 rounded-2xl focus:outline-none focus:ring-4 focus:ring-indigo-100 font-black text-slate-700 transition-all"
                      placeholder="138XXXXXXXX"
                    />
                  </div>
                </div>

                <div>
                  <label className="block text-[10px] font-black text-slate-400 uppercase tracking-widest mb-3 px-1">服务评分 (0.0 - 5.0)</label>
                  <input 
                    type="range" 
                    min="0"
                    max="5"
                    step="0.1"
                    value={editingDriver.rating}
                    onChange={(e) => setEditingDriver({...editingDriver, rating: parseFloat(e.target.value)})}
                    className="w-full h-2 bg-slate-100 rounded-lg appearance-none cursor-pointer accent-indigo-600 mb-2"
                  />
                  <div className="flex justify-between text-[10px] font-black text-slate-400 px-1">
                    <span>0.0</span>
                    <span className="text-indigo-600 font-black text-lg">{editingDriver.rating.toFixed(1)}</span>
                    <span>5.0</span>
                  </div>
                </div>

                <div className="p-6 bg-amber-50 rounded-3xl border border-amber-100 flex items-start gap-3">
                   <div className="w-10 h-10 bg-amber-100 rounded-2xl flex items-center justify-center flex-shrink-0">
                      <Calendar className="w-5 h-5 text-amber-600" />
                   </div>
                   <div>
                      <p className="text-xs font-black text-amber-800 uppercase tracking-widest mb-1">提示</p>
                      <p className="text-sm text-amber-700 font-medium">司机与其所驾驶的车辆现已解绑。您可以在排班中心灵活指派车辆。</p>
                   </div>
                </div>
              </div>

              <div className="mt-12 flex gap-4">
                <button type="button" onClick={() => setEditingDriver(null)} className="flex-1 py-5 font-black text-slate-400 hover:text-slate-600 transition-colors uppercase tracking-widest">取消</button>
                <button type="submit" className="flex-[2] bg-slate-900 text-white py-5 rounded-[24px] font-black shadow-2xl hover:bg-slate-800 transition-all uppercase tracking-widest">确认保存</button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};

export default DriverManagement;
