
import React, { useState } from 'react';
import { Driver, DriverStats, DriverStatus } from '../types';
import { 
  ShieldCheck, Map, Phone, MoreHorizontal, Mail, 
  Edit2, X, Star, Calendar, User, Check, RefreshCcw,
  Clock, Hash
} from 'lucide-react';

interface Props {
  drivers: Driver[];
  stats: DriverStats[];
  onUpdateDriver: (driver: Driver) => void;
}

const DriverManagement: React.FC<Props> = ({ drivers, stats, onUpdateDriver }) => {
  const [editingDriver, setEditingDriver] = useState<Driver | null>(null);
  const [avatarSeed, setAvatarSeed] = useState<string>('');

  const handleEditClick = (driver: Driver) => {
    setEditingDriver({ ...driver });
    // 从现有的头像 URL 中尝试提取 seed
    const urlParts = driver.avatar.split('seed=');
    setAvatarSeed(urlParts.length > 1 ? urlParts[1] : driver.name);
  };

  const handleSave = (e: React.FormEvent) => {
    e.preventDefault();
    if (editingDriver) {
      const updatedDriver = {
        ...editingDriver,
        avatar: `https://api.dicebear.com/7.x/avataaars/svg?seed=${avatarSeed || editingDriver.name}`
      };
      onUpdateDriver(updatedDriver);
      setEditingDriver(null);
    }
  };

  return (
    <div className="h-full flex flex-col gap-8 animate-in fade-in slide-in-from-bottom-4 duration-700">
      {/* 头部区域 */}
      <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
        <div>
          <h2 className="text-3xl font-black text-slate-800 tracking-tight">司机人才档案库</h2>
          <p className="text-slate-500 font-bold mt-1 uppercase tracking-widest text-[11px] flex items-center gap-2">
            <span className="inline-block w-2 h-2 rounded-full bg-indigo-500 animate-pulse"></span>
            当前在册: {drivers.length} 名专业驾驶员 / 实时管理模式
          </p>
        </div>
        <button className="bg-slate-900 hover:bg-slate-800 text-white px-8 py-4 rounded-2xl font-black shadow-2xl transition-all hover:scale-[1.02] active:scale-95 flex items-center gap-2 group">
          <User className="w-5 h-5 group-hover:rotate-12 transition-transform" />
          招募新司机
        </button>
      </div>

      {/* 列表区域 */}
      <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-8 overflow-y-auto pb-16 pr-2 scrollbar-hide">
        {drivers.map(driver => {
          const driverStat = stats.find(s => s.driverId === driver.id);
          
          return (
            <div key={driver.id} className="bg-white p-8 rounded-[40px] border border-slate-100 shadow-sm hover:shadow-2xl hover:border-indigo-100 transition-all duration-300 group relative">
              {/* 操作按钮 */}
              <div className="absolute top-6 right-6 flex gap-2">
                <button 
                  onClick={() => handleEditClick(driver)}
                  className="p-3 text-slate-300 hover:text-indigo-600 hover:bg-indigo-50 rounded-2xl transition-all"
                >
                  <Edit2 className="w-4 h-4" />
                </button>
                <button className="p-3 text-slate-300 hover:text-slate-600 hover:bg-slate-50 rounded-2xl transition-all">
                  <MoreHorizontal className="w-5 h-5" />
                </button>
              </div>

              {/* 核心信息 */}
              <div className="flex items-center gap-5 mb-8">
                <div className="relative">
                   <div className="w-20 h-20 rounded-[28px] overflow-hidden shadow-xl border-4 border-white bg-slate-50">
                     <img src={driver.avatar} alt={driver.name} className="w-full h-full object-cover" />
                   </div>
                   <div className={`absolute -bottom-1 -right-1 w-7 h-7 rounded-full border-4 border-white flex items-center justify-center shadow-lg ${
                     driver.currentStatus === DriverStatus.FREE ? 'bg-emerald-500' : 
                     driver.currentStatus === DriverStatus.BUSY ? 'bg-rose-500' : 'bg-amber-400'
                   }`}>
                      <Check className="w-3 h-3 text-white" />
                   </div>
                </div>
                <div>
                  <h3 className="font-black text-slate-800 text-2xl tracking-tighter leading-none mb-2">{driver.name}</h3>
                  <div className="flex items-center gap-2">
                    <span className="text-[10px] font-black text-slate-400 uppercase tracking-widest bg-slate-50 px-2 py-0.5 rounded-md border border-slate-100">
                      ID: {driver.id}
                    </span>
                    <div className={`px-2 py-0.5 rounded-md text-[9px] font-black uppercase tracking-widest ${
                      driver.currentStatus === DriverStatus.FREE ? 'text-emerald-500 bg-emerald-50' :
                      driver.currentStatus === DriverStatus.BUSY ? 'text-rose-500 bg-rose-50' : 'text-amber-500 bg-amber-50'
                    }`}>
                      {driver.currentStatus === DriverStatus.FREE ? '待命' : '执行中'}
                    </div>
                  </div>
                </div>
              </div>

              {/* 统计指标 - 修复显示Bug，确保文字完整 */}
              <div className="grid grid-cols-2 gap-4 mb-8">
                 <div className="bg-slate-50/80 p-5 rounded-[24px] border border-white flex flex-col justify-center min-h-[90px]">
                    <div className="text-[10px] text-slate-400 uppercase font-black tracking-widest mb-1">完成订单</div>
                    <div className="font-black text-slate-800 text-2xl truncate">
                      {driverStat?.completedOrders || 0} <span className="text-sm text-slate-400 font-bold ml-1">单</span>
                    </div>
                 </div>
                 <div className="bg-slate-50/80 p-5 rounded-[24px] border border-white flex flex-col justify-center min-h-[90px]">
                    <div className="text-[10px] text-slate-400 uppercase font-black tracking-widest mb-1">综合评分</div>
                    <div className="font-black text-slate-800 text-2xl flex items-center gap-1">
                      {driver.rating.toFixed(1)} 
                      <Star className="w-5 h-5 text-yellow-400 fill-yellow-400" />
                    </div>
                 </div>
              </div>
              
              {/* 详细信息 */}
              <div className="space-y-4 mb-8 bg-slate-50/40 p-6 rounded-[32px]">
                 <div className="flex items-center gap-4 text-sm group/info">
                    <div className="w-9 h-9 rounded-xl bg-white flex items-center justify-center text-slate-300 group-hover/info:text-indigo-500 transition-colors shadow-sm">
                      <Phone className="w-4 h-4" />
                    </div>
                    <div className="flex flex-col">
                      <span className="text-[10px] text-slate-400 font-black uppercase tracking-widest">联系电话</span>
                      <span className="font-black text-slate-700">{driver.phone || '未设置'}</span>
                    </div>
                 </div>
                 <div className="flex items-center gap-4 text-sm group/info">
                    <div className="w-9 h-9 rounded-xl bg-white flex items-center justify-center text-slate-300 group-hover/info:text-indigo-500 transition-colors shadow-sm">
                      <Calendar className="w-4 h-4" />
                    </div>
                    <div className="flex flex-col">
                      <span className="text-[10px] text-slate-400 font-black uppercase tracking-widest">入职时间</span>
                      <span className="font-black text-slate-700">{driver.joinDate}</span>
                    </div>
                 </div>
              </div>

              {/* 底部按钮 */}
              <div className="flex gap-3">
                <button className="flex-1 bg-indigo-600 text-white py-4 rounded-2xl text-[11px] font-black uppercase tracking-[0.1em] hover:bg-indigo-700 transition-all shadow-xl shadow-indigo-100 active:scale-95">
                  生成绩效报告
                </button>
                <button className="w-14 h-14 flex items-center justify-center bg-slate-900 text-white rounded-2xl hover:bg-slate-800 transition-all active:scale-95 shadow-lg">
                  <Mail className="w-5 h-5" />
                </button>
              </div>
            </div>
          );
        })}
      </div>

      {/* 高级编辑器弹窗 */}
      {editingDriver && (
        <div className="fixed inset-0 z-[100] flex items-center justify-center p-4">
          <div className="absolute inset-0 bg-slate-900/60 backdrop-blur-xl animate-in fade-in duration-300" onClick={() => setEditingDriver(null)}></div>
          <div className="relative bg-white rounded-[56px] shadow-2xl w-full max-w-2xl overflow-hidden animate-in zoom-in-95 slide-in-from-bottom-12 duration-500">
            <form onSubmit={handleSave} className="p-12">
              {/* 弹窗头部 */}
              <div className="flex justify-between items-center mb-10">
                <div className="flex items-center gap-4">
                  <div className="w-12 h-12 bg-indigo-600 rounded-2xl flex items-center justify-center text-white">
                    <Edit2 className="w-6 h-6" />
                  </div>
                  <div>
                    <h3 className="text-3xl font-black text-slate-800 tracking-tighter">全能档案编辑器</h3>
                    <p className="text-slate-400 font-bold uppercase tracking-widest text-[10px] mt-1">专属唯一编号: {editingDriver.id}</p>
                  </div>
                </div>
                <button type="button" onClick={() => setEditingDriver(null)} className="p-4 hover:bg-slate-50 rounded-full text-slate-300 hover:text-slate-600 transition-colors active:scale-90">
                  <X className="w-8 h-8" />
                </button>
              </div>

              <div className="space-y-8">
                {/* 1. 头像自定义区域 */}
                <div className="bg-slate-50 p-6 rounded-[32px] flex items-center gap-8 border border-slate-100">
                  <div className="relative group">
                    <img 
                      src={`https://api.dicebear.com/7.x/avataaars/svg?seed=${avatarSeed || editingDriver.name}`} 
                      className="w-24 h-24 rounded-3xl bg-white shadow-2xl border-4 border-white transition-transform group-hover:scale-105"
                      alt="avatar-preview"
                    />
                    <div className="absolute -top-2 -right-2 w-8 h-8 bg-emerald-500 rounded-full flex items-center justify-center text-white border-4 border-white">
                      <RefreshCcw className="w-4 h-4" />
                    </div>
                  </div>
                  <div className="flex-1">
                    <label className="block text-[10px] font-black text-slate-400 uppercase tracking-widest mb-2 px-1 flex items-center gap-2">
                      <Hash className="w-3 h-3" /> 头像标识关键词 (Seed)
                    </label>
                    <input 
                      type="text" 
                      value={avatarSeed}
                      onChange={(e) => setAvatarSeed(e.target.value)}
                      className="w-full px-6 py-4 bg-white border border-slate-200 rounded-2xl focus:outline-none focus:ring-4 focus:ring-indigo-100 font-bold text-slate-700 transition-all"
                      placeholder="尝试输入: SuperDriver..."
                    />
                    <p className="text-[9px] text-slate-400 font-bold mt-2 px-1">输入不同字符即可即时生成唯一的 AI 头像</p>
                  </div>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  {/* 2. 基础信息 */}
                  <div className="space-y-6">
                    <div>
                      <label className="block text-[10px] font-black text-slate-400 uppercase tracking-widest mb-2 px-1">司机法定姓名</label>
                      <input 
                        type="text" 
                        value={editingDriver.name}
                        onChange={(e) => setEditingDriver({...editingDriver, name: e.target.value})}
                        className="w-full px-6 py-4 bg-slate-50 border border-slate-100 rounded-2xl focus:outline-none focus:ring-4 focus:ring-indigo-100 font-black text-slate-800"
                      />
                    </div>
                    <div>
                      <label className="block text-[10px] font-black text-slate-400 uppercase tracking-widest mb-2 px-1">紧急联络电话</label>
                      <input 
                        type="text" 
                        value={editingDriver.phone || ''}
                        onChange={(e) => setEditingDriver({...editingDriver, phone: e.target.value})}
                        className="w-full px-6 py-4 bg-slate-50 border border-slate-100 rounded-2xl focus:outline-none focus:ring-4 focus:ring-indigo-100 font-black text-slate-800"
                        placeholder="138XXXXXXXX"
                      />
                    </div>
                  </div>

                  {/* 3. 运营与履历信息 */}
                  <div className="space-y-6">
                    <div>
                      <label className="block text-[10px] font-black text-slate-400 uppercase tracking-widest mb-2 px-1">入职生效日期</label>
                      <div className="relative">
                        <input 
                          type="date" 
                          value={editingDriver.joinDate}
                          onChange={(e) => setEditingDriver({...editingDriver, joinDate: e.target.value})}
                          className="w-full px-6 py-4 bg-slate-50 border border-slate-100 rounded-2xl focus:outline-none focus:ring-4 focus:ring-indigo-100 font-black text-slate-800"
                        />
                        <Calendar className="absolute right-4 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-300 pointer-events-none" />
                      </div>
                    </div>
                    <div>
                      <label className="block text-[10px] font-black text-slate-400 uppercase tracking-widest mb-2 px-1">当前运营状态</label>
                      <div className="relative">
                        <select 
                          value={editingDriver.currentStatus}
                          onChange={(e) => setEditingDriver({...editingDriver, currentStatus: e.target.value as DriverStatus})}
                          className="w-full px-6 py-4 bg-slate-50 border border-slate-100 rounded-2xl focus:outline-none focus:ring-4 focus:ring-indigo-100 font-black text-slate-800 appearance-none"
                        >
                          <option value={DriverStatus.FREE}>🟢 待命 (FREE)</option>
                          <option value={DriverStatus.BUSY}>🔴 任务中 (BUSY)</option>
                          <option value={DriverStatus.BREAK}>🟡 休息中 (BREAK)</option>
                          <option value={DriverStatus.OFF_DUTY}>⚪ 已离线 (OFF_DUTY)</option>
                        </select>
                        <Clock className="absolute right-4 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-300 pointer-events-none" />
                      </div>
                    </div>
                  </div>
                </div>

                {/* 4. 评分系统 */}
                <div className="bg-indigo-50/50 p-8 rounded-[32px] border border-indigo-100">
                  <div className="flex justify-between items-center mb-6">
                    <div>
                      <label className="block text-[10px] font-black text-slate-400 uppercase tracking-widest mb-1">年度服务综合评分</label>
                      <p className="text-xs text-indigo-400 font-bold">由过往 100 笔订单数据聚合计算</p>
                    </div>
                    <div className="flex items-end gap-1">
                      <span className="text-4xl font-black text-indigo-600 leading-none">{editingDriver.rating.toFixed(1)}</span>
                      <span className="text-sm font-black text-indigo-300 mb-1">/ 5.0</span>
                    </div>
                  </div>
                  <input 
                    type="range" 
                    min="0"
                    max="5"
                    step="0.1"
                    value={editingDriver.rating}
                    onChange={(e) => setEditingDriver({...editingDriver, rating: parseFloat(e.target.value)})}
                    className="w-full h-3 bg-white rounded-lg appearance-none cursor-pointer accent-indigo-600 shadow-inner"
                  />
                  <div className="flex justify-between text-[10px] font-black text-slate-300 mt-4 px-1">
                    <span className="flex items-center gap-1"><Star className="w-3 h-3" /> 新手期</span>
                    <span className="flex items-center gap-1 text-indigo-400">王牌驾驶员 <Star className="w-3 h-3 fill-indigo-400" /></span>
                  </div>
                </div>
              </div>

              {/* 弹窗底部 */}
              <div className="mt-12 flex gap-4">
                <button 
                  type="button" 
                  onClick={() => setEditingDriver(null)} 
                  className="flex-1 py-5 font-black text-slate-400 hover:text-slate-600 transition-colors uppercase tracking-widest text-xs active:scale-95"
                >
                  放弃修改
                </button>
                <button 
                  type="submit" 
                  className="flex-[2] bg-slate-900 text-white py-5 rounded-[24px] font-black shadow-2xl hover:bg-slate-800 transition-all hover:scale-[1.02] active:scale-95 uppercase tracking-widest text-xs"
                >
                  确认并同步全局
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};

export default DriverManagement;
