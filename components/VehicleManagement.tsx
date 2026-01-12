import React, { useState } from 'react';
import { Vehicle } from '../types';
import { 
  Car, Wrench, ShieldCheck, AlertTriangle, 
  Settings, X, Edit2, PlusCircle, Power, PowerOff, Check,
  Palette, Users as UsersIcon, Calendar as CalendarIcon, Gauge, Trash2, Save
} from 'lucide-react';

interface Props {
  vehicles: Vehicle[];
  onUpdateVehicle: (vehicle: Vehicle) => void;
  onAddVehicle: (vehicle: Vehicle) => void;
  onDeleteVehicle?: (id: string) => void;
}

const VehicleManagement: React.FC<Props> = ({ vehicles, onUpdateVehicle, onAddVehicle, onDeleteVehicle }) => {
  const [editingVehicle, setEditingVehicle] = useState<Vehicle | null>(null);
  const [isAdding, setIsAdding] = useState(false);
  
  const [newVehicleData, setNewVehicleData] = useState<Partial<Vehicle>>({
    plateNumber: '', 
    model: '', 
    type: 'Sedan', 
    mileage: 0,
    lastService: new Date().toISOString().split('T')[0],
    color: 'White', 
    seats: 5, 
    age: 1, 
    isActive: true
  });

  const toggleVehicleActive = (vehicle: Vehicle) => {
    onUpdateVehicle({ ...vehicle, isActive: !vehicle.isActive });
  };

  const handleDelete = (vehicle: Vehicle) => {
    if (window.confirm(`⚠️ 资产清理确认\n\n确定要从档案中永久移除车辆 [${vehicle.plateNumber}] 吗？\n该资产的相关数据将从 D1 云端集群中同步注销。`)) {
      if (onDeleteVehicle) {
        onDeleteVehicle(vehicle.id);
      }
    }
  };

  const handleEdit = (vehicle: Vehicle) => setEditingVehicle({ ...vehicle });

  const handleSaveEdit = (e: React.FormEvent) => {
    e.preventDefault();
    if (editingVehicle) {
      onUpdateVehicle(editingVehicle);
      setEditingVehicle(null);
    }
  };

  const handleAddSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    const finalPlate = newVehicleData.plateNumber?.trim() || `待定-${Date.now().toString().slice(-4)}`;

    const vehicle: Vehicle = {
      id: `v-${Date.now()}`,
      plateNumber: finalPlate,
      model: newVehicleData.model || '通用型车辆',
      type: (newVehicleData.type as any) || 'Sedan',
      currentDriverId: null,
      mileage: Number(newVehicleData.mileage) || 0,
      lastService: newVehicleData.lastService || new Date().toISOString().split('T')[0],
      color: newVehicleData.color || '白色',
      seats: Number(newVehicleData.seats) || 5,
      age: Number(newVehicleData.age) || 0,
      isActive: true
    };

    onAddVehicle(vehicle);
    setIsAdding(false);
    setNewVehicleData({
      plateNumber: '', model: '', type: 'Sedan', mileage: 0,
      lastService: new Date().toISOString().split('T')[0],
      color: 'White', seats: 5, age: 1, isActive: true
    });
  };

  return (
    <div className="h-full flex flex-col gap-6 md:gap-8 animate-in fade-in duration-700 p-2 md:p-0">
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
        <div>
          <h2 className="text-2xl md:text-3xl font-black text-slate-800 tracking-tight italic uppercase">全量资产档案</h2>
          <p className="text-slate-500 font-bold mt-1 uppercase tracking-widest text-[10px] md:text-[11px]">
            当前车队规模: {vehicles.length} 台资产 / 独立状态开关
          </p>
        </div>
        <button 
          onClick={() => setIsAdding(true)}
          className="w-full sm:w-auto bg-slate-900 hover:bg-slate-800 text-white px-8 py-4 rounded-2xl font-black shadow-2xl transition-all flex items-center justify-center gap-2 active:scale-95"
        >
          <PlusCircle className="w-5 h-5" />
          资产入库
        </button>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6 md:gap-8 overflow-y-auto pb-20 pr-2 scrollbar-hide">
        {vehicles.map(vehicle => (
          <div key={vehicle.id} className={`bg-white rounded-[32px] md:rounded-[40px] border border-slate-100 shadow-sm p-6 md:p-8 hover:shadow-2xl transition-all relative group overflow-hidden flex flex-col min-h-[350px] md:min-h-[380px] ${!vehicle.isActive ? 'opacity-50 grayscale' : ''}`}>
            <div className="flex justify-between items-start mb-6 md:mb-8">
              <div className={`w-14 h-14 md:w-16 md:h-16 rounded-[20px] md:rounded-[24px] flex items-center justify-center shadow-inner ${vehicle.isActive ? 'bg-indigo-50 text-indigo-600' : 'bg-rose-50 text-rose-600'}`}>
                {vehicle.isActive ? <Car className="w-7 h-7 md:w-8 md:h-8" /> : <Wrench className="w-7 h-7 md:w-8 md:h-8" />}
              </div>
              <div className="flex gap-2 z-10">
                <button 
                  onClick={() => handleDelete(vehicle)} 
                  className="p-2 md:p-3 bg-rose-50 text-rose-500 rounded-xl md:opacity-0 group-hover:opacity-100 transition-all hover:bg-rose-500 hover:text-white shadow-sm active:scale-90"
                  title="注销资产"
                >
                  <Trash2 className="w-4 h-4" />
                </button>
                <button 
                  onClick={() => toggleVehicleActive(vehicle)}
                  className={`p-2 md:p-3 rounded-xl transition-all active:scale-90 ${vehicle.isActive ? 'bg-emerald-50 text-emerald-600' : 'bg-rose-50 text-rose-600'}`}
                >
                  {vehicle.isActive ? <Power className="w-4 h-4" /> : <PowerOff className="w-4 h-4" />}
                </button>
                <button onClick={() => handleEdit(vehicle)} className="p-2 md:p-3 text-slate-400 hover:text-indigo-600 bg-slate-50 rounded-xl transition-all active:scale-90">
                  <Edit2 className="w-4 h-4" />
                </button>
              </div>
            </div>

            <div className="mb-auto">
               <h3 className="font-black text-slate-800 text-xl md:text-2xl tracking-tighter mb-1">{vehicle.plateNumber}</h3>
               <div className="flex gap-2 mt-2">
                  <span className="text-[7px] md:text-[8px] font-black uppercase tracking-widest px-2 py-1 rounded bg-slate-100 text-slate-500">{vehicle.type}</span>
                  <span className="text-[7px] md:text-[8px] font-black uppercase tracking-widest px-2 py-1 rounded bg-slate-100 text-slate-500">{vehicle.color}</span>
               </div>
               <p className="text-slate-400 font-bold text-[10px] md:text-[11px] uppercase tracking-widest mt-4 leading-tight">
                 {vehicle.model}
               </p>
            </div>

            <div className="grid grid-cols-2 gap-3 md:gap-4 p-4 md:p-5 bg-slate-50 rounded-[24px] md:rounded-[32px] mt-6 md:mt-8 border border-white">
              <div className="flex flex-col">
                <span className="text-[7px] md:text-[8px] font-black uppercase tracking-widest text-slate-400 mb-1">载客量</span>
                <span className="text-xs font-black text-slate-800">{vehicle.seats} 座</span>
              </div>
              <div className="flex flex-col">
                <span className="text-[7px] md:text-[8px] font-black uppercase tracking-widest text-slate-400 mb-1">运行里程</span>
                <span className="text-xs font-black text-slate-800">{(vehicle.mileage || 0).toLocaleString()} KM</span>
              </div>
            </div>
          </div>
        ))}
      </div>

      {/* 编辑资产模态框 - FIX: Added missing modal UI */}
      {editingVehicle && (
        <div className="fixed inset-0 z-[100] flex items-center justify-center p-4">
          <div className="absolute inset-0 bg-slate-900/60 backdrop-blur-xl animate-in fade-in duration-300" onClick={() => setEditingVehicle(null)}></div>
          <div className="relative bg-white rounded-[40px] md:rounded-[56px] shadow-2xl w-full max-w-2xl p-8 md:p-12 animate-in zoom-in-95 duration-300 max-h-[90vh] overflow-y-auto scrollbar-hide">
             <div className="flex justify-between items-center mb-8 md:mb-10">
                <div className="flex items-center gap-4">
                  <div className="w-10 h-10 md:w-12 md:h-12 bg-indigo-600 rounded-xl md:rounded-2xl flex items-center justify-center text-white shadow-xl">
                    <Edit2 className="w-5 h-5 md:w-6 md:h-6" />
                  </div>
                  <h3 className="text-xl md:text-2xl font-black text-slate-800 italic uppercase tracking-tighter">修正资产档案</h3>
                </div>
                <button onClick={() => setEditingVehicle(null)} className="w-10 h-10 bg-slate-50 rounded-full flex items-center justify-center hover:bg-slate-100 transition-all text-slate-400 active:scale-90"><X className="w-5 h-5" /></button>
             </div>
             
             <form onSubmit={handleSaveEdit} className="space-y-6">
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-6">
                  <div className="space-y-2">
                    <label className="block text-[10px] font-black text-slate-400 uppercase tracking-widest px-1">车牌号码</label>
                    <input type="text" value={editingVehicle.plateNumber} onChange={e => setEditingVehicle({...editingVehicle, plateNumber: e.target.value})} className="w-full p-4 md:p-5 bg-slate-50 border-2 border-slate-50 focus:border-indigo-500/20 focus:bg-white rounded-2xl font-bold transition-all outline-none" />
                  </div>
                  <div className="space-y-2">
                    <label className="block text-[10px] font-black text-slate-400 uppercase tracking-widest px-1">品牌型号</label>
                    <input type="text" value={editingVehicle.model} onChange={e => setEditingVehicle({...editingVehicle, model: e.target.value})} className="w-full p-4 md:p-5 bg-slate-50 border-2 border-slate-50 focus:border-indigo-500/20 focus:bg-white rounded-2xl font-bold transition-all outline-none" />
                  </div>
                </div>
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-6">
                  <div className="space-y-2">
                    <label className="block text-[10px] font-black text-slate-400 uppercase tracking-widest px-1">车辆类型</label>
                    <select value={editingVehicle.type} onChange={e => setEditingVehicle({...editingVehicle, type: e.target.value as any})} className="w-full p-4 md:p-5 bg-slate-50 border-2 border-slate-50 rounded-2xl font-bold outline-none appearance-none">
                      <option value="Sedan">舒适轿车</option>
                      <option value="Van">商务车</option>
                      <option value="Truck">货运卡车</option>
                    </select>
                  </div>
                  <div className="space-y-2">
                    <label className="block text-[10px] font-black text-slate-400 uppercase tracking-widest px-1">外观颜色</label>
                    <input type="text" value={editingVehicle.color} onChange={e => setEditingVehicle({...editingVehicle, color: e.target.value})} className="w-full p-4 md:p-5 bg-slate-50 border-2 border-slate-50 focus:border-indigo-500/20 focus:bg-white rounded-2xl font-bold outline-none" />
                  </div>
                </div>
                <div className="grid grid-cols-3 gap-4 md:gap-6">
                  <div className="space-y-2">
                    <label className="block text-[10px] font-black text-slate-400 uppercase tracking-widest px-1">载客</label>
                    <input type="number" min="1" value={editingVehicle.seats} onChange={e => setEditingVehicle({...editingVehicle, seats: Number(e.target.value)})} className="w-full p-4 md:p-5 bg-slate-50 border-2 border-slate-50 rounded-2xl font-bold outline-none" />
                  </div>
                  <div className="space-y-2">
                    <label className="block text-[10px] font-black text-slate-400 uppercase tracking-widest px-1">车龄</label>
                    <input type="number" min="0" value={editingVehicle.age} onChange={e => setEditingVehicle({...editingVehicle, age: Number(e.target.value)})} className="w-full p-4 md:p-5 bg-slate-50 border-2 border-slate-50 rounded-2xl font-bold outline-none" />
                  </div>
                  <div className="space-y-2">
                    <label className="block text-[10px] font-black text-slate-400 uppercase tracking-widest px-1">里程</label>
                    <input type="number" min="0" value={editingVehicle.mileage} onChange={e => setEditingVehicle({...editingVehicle, mileage: Number(e.target.value)})} className="w-full p-4 md:p-5 bg-slate-50 border-2 border-slate-50 rounded-2xl font-bold outline-none" />
                  </div>
                </div>
                <div className="pt-6 md:pt-8">
                  <button type="submit" className="w-full bg-indigo-600 hover:bg-indigo-500 text-white py-5 md:py-6 rounded-[28px] md:rounded-[32px] font-black uppercase tracking-[0.2em] text-[10px] md:text-xs flex items-center justify-center gap-4 shadow-2xl shadow-indigo-900/40 transition-all active:scale-95">
                    <Save className="w-5 h-5" /> 更新资产数据
                  </button>
                </div>
             </form>
          </div>
        </div>
      )}

      {isAdding && (
         <div className="fixed inset-0 z-[100] flex items-center justify-center p-4">
            <div className="absolute inset-0 bg-slate-900/60 backdrop-blur-xl animate-in fade-in duration-300" onClick={() => setIsAdding(false)}></div>
            <div className="relative bg-white rounded-[40px] md:rounded-[56px] shadow-2xl w-full max-w-3xl p-8 md:p-12 animate-in zoom-in-95 duration-300 max-h-[90vh] overflow-y-auto scrollbar-hide">
               <div className="flex justify-between items-center mb-8 md:mb-10">
                  <div className="flex items-center gap-4">
                     <div className="w-10 h-10 md:w-12 md:h-12 bg-indigo-600 rounded-xl md:rounded-2xl flex items-center justify-center text-white shadow-xl">
                        <PlusCircle className="w-5 h-5 md:w-6 md:h-6" />
                     </div>
                     <h3 className="text-xl md:text-2xl font-black italic uppercase">资产录入入库</h3>
                  </div>
                  <button onClick={() => setIsAdding(false)} className="w-10 h-10 bg-slate-50 rounded-full flex items-center justify-center hover:bg-slate-100 transition-all text-slate-400 active:scale-90"><X className="w-5 h-5" /></button>
               </div>
               
               <form onSubmit={handleAddSubmit} className="space-y-6 md:space-y-8">
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-6 md:gap-8">
                    <div className="space-y-2">
                      <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest px-1">车牌号码</label>
                      <div className="relative">
                        <Car className="absolute left-5 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-300" />
                        <input type="text" placeholder="如：京A·88888" value={newVehicleData.plateNumber} onChange={e => setNewVehicleData({...newVehicleData, plateNumber: e.target.value})} className="w-full pl-12 p-4 bg-slate-50 border-2 border-slate-50 focus:border-indigo-500/20 rounded-2xl font-bold transition-all outline-none" />
                      </div>
                    </div>
                    <div className="space-y-2">
                      <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest px-1">品牌型号</label>
                      <div className="relative">
                        <Settings className="absolute left-5 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-300" />
                        <input type="text" placeholder="如：丰田 凯美瑞" value={newVehicleData.model} onChange={e => setNewVehicleData({...newVehicleData, model: e.target.value})} className="w-full pl-12 p-4 bg-slate-50 border-2 border-slate-50 focus:border-indigo-500/20 rounded-2xl font-bold transition-all outline-none" />
                      </div>
                    </div>
                  </div>

                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-6 md:gap-8">
                    <div className="space-y-2">
                      <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest px-1">车辆类型</label>
                      <select value={newVehicleData.type} onChange={e => setNewVehicleData({...newVehicleData, type: e.target.value as any})} className="w-full p-4 bg-slate-50 border-2 border-slate-50 rounded-2xl font-bold outline-none appearance-none">
                        <option value="Sedan">舒适轿车 (Sedan)</option>
                        <option value="Van">商务车 (Van)</option>
                        <option value="Truck">货运卡车 (Truck)</option>
                      </select>
                    </div>
                    <div className="space-y-2">
                      <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest px-1">外观颜色</label>
                      <div className="relative">
                        <Palette className="absolute left-5 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-300" />
                        <input type="text" placeholder="白色 / 黑色 / 银色" value={newVehicleData.color} onChange={e => setNewVehicleData({...newVehicleData, color: e.target.value})} className="w-full pl-12 p-4 bg-slate-50 border-2 border-slate-50 focus:border-indigo-500/20 rounded-2xl font-bold transition-all outline-none" />
                      </div>
                    </div>
                  </div>

                  <div className="grid grid-cols-3 gap-4 md:gap-8">
                    <div className="space-y-2">
                      <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest px-1 flex items-center gap-2">
                        <UsersIcon className="w-3 h-3" /> 核定载客
                      </label>
                      <input type="number" min="1" max="50" value={newVehicleData.seats} onChange={e => setNewVehicleData({...newVehicleData, seats: Number(e.target.value)})} className="w-full p-4 bg-slate-50 border-2 border-slate-50 rounded-2xl font-bold outline-none" />
                    </div>
                    <div className="space-y-2">
                      <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest px-1 flex items-center gap-2">
                        <CalendarIcon className="w-3 h-3" /> 车龄
                      </label>
                      <input type="number" min="0" max="20" value={newVehicleData.age} onChange={e => setNewVehicleData({...newVehicleData, age: Number(e.target.value)})} className="w-full p-4 bg-slate-50 border-2 border-slate-50 rounded-2xl font-bold outline-none" />
                    </div>
                    <div className="space-y-2">
                      <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest px-1 flex items-center gap-2">
                        <Gauge className="w-3 h-3" /> 里程 (KM)
                      </label>
                      <input type="number" min="0" value={newVehicleData.mileage} onChange={e => setNewVehicleData({...newVehicleData, mileage: Number(e.target.value)})} className="w-full p-4 bg-slate-50 border-2 border-slate-50 rounded-2xl font-bold outline-none" />
                    </div>
                  </div>

                  <div className="pt-4 md:pt-6">
                    <button type="submit" className="w-full bg-indigo-600 hover:bg-indigo-500 text-white py-5 md:py-6 rounded-[28px] md:rounded-[32px] font-black uppercase tracking-[0.2em] text-[10px] md:text-xs flex items-center justify-center gap-4 shadow-2xl shadow-indigo-900/40 transition-all active:scale-95">
                      <Check className="w-5 h-5" /> 确认入库并推送云端 D1
                    </button>
                    <p className="text-center text-[8px] md:text-[9px] text-slate-400 font-black uppercase tracking-widest mt-4">同步协议：已启用自动清洗，空缺字段将以默认值入库</p>
                  </div>
               </form>
            </div>
         </div>
      )}
    </div>
  );
};

export default VehicleManagement;