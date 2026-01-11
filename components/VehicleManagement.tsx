
import React, { useState } from 'react';
import { Vehicle } from '../types';
import { 
  Car, Wrench, ShieldCheck, AlertTriangle, 
  Settings, X, Edit2, PlusCircle, Power, PowerOff, Check,
  Palette, Users as UsersIcon, Calendar as CalendarIcon, Gauge
} from 'lucide-react';

interface Props {
  vehicles: Vehicle[];
  onUpdateVehicle: (vehicle: Vehicle) => void;
  onAddVehicle: (vehicle: Vehicle) => void;
}

const VehicleManagement: React.FC<Props> = ({ vehicles, onUpdateVehicle, onAddVehicle }) => {
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
    // 即使没填牌照也给个默认值，防止由于严格必填导致的心理负担
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
    <div className="h-full flex flex-col gap-8 animate-in fade-in duration-700">
      <div className="flex justify-between items-center">
        <div>
          <h2 className="text-3xl font-black text-slate-800 tracking-tight italic uppercase">全量资产档案</h2>
          <p className="text-slate-500 font-bold mt-1 uppercase tracking-widest text-[11px]">
            当前车队规模: {vehicles.length} 台资产 / 独立状态开关
          </p>
        </div>
        <button 
          onClick={() => setIsAdding(true)}
          className="bg-slate-900 hover:bg-slate-800 text-white px-8 py-4 rounded-2xl font-black shadow-2xl transition-all flex items-center gap-2"
        >
          <PlusCircle className="w-5 h-5" />
          资产入库
        </button>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-8 overflow-y-auto pb-20 pr-2 scrollbar-hide">
        {vehicles.map(vehicle => (
          <div key={vehicle.id} className={`bg-white rounded-[40px] border border-slate-100 shadow-sm p-8 hover:shadow-2xl transition-all relative overflow-hidden flex flex-col min-h-[380px] ${!vehicle.isActive ? 'opacity-50 grayscale' : ''}`}>
            <div className="flex justify-between items-start mb-8">
              <div className={`w-16 h-16 rounded-[24px] flex items-center justify-center shadow-inner ${vehicle.isActive ? 'bg-indigo-50 text-indigo-600' : 'bg-rose-50 text-rose-600'}`}>
                {vehicle.isActive ? <Car className="w-8 h-8" /> : <Wrench className="w-8 h-8" />}
              </div>
              <div className="flex gap-2">
                <button 
                  onClick={() => toggleVehicleActive(vehicle)}
                  className={`p-3 rounded-xl transition-all ${vehicle.isActive ? 'bg-emerald-50 text-emerald-600' : 'bg-rose-50 text-rose-600'}`}
                >
                  {vehicle.isActive ? <Power className="w-4 h-4" /> : <PowerOff className="w-4 h-4" />}
                </button>
                <button onClick={() => handleEdit(vehicle)} className="p-3 text-slate-300 hover:text-indigo-600 bg-slate-50 rounded-xl transition-all">
                  <Edit2 className="w-4 h-4" />
                </button>
              </div>
            </div>

            <div className="mb-auto">
               <h3 className="font-black text-slate-800 text-2xl tracking-tighter mb-1">{vehicle.plateNumber}</h3>
               <div className="flex gap-2 mt-2">
                  <span className="text-[8px] font-black uppercase tracking-widest px-2 py-1 rounded bg-slate-100 text-slate-500">{vehicle.type}</span>
                  <span className="text-[8px] font-black uppercase tracking-widest px-2 py-1 rounded bg-slate-100 text-slate-500">{vehicle.color}</span>
               </div>
               <p className="text-slate-400 font-bold text-[11px] uppercase tracking-widest mt-4 leading-tight">
                 {vehicle.model}
               </p>
            </div>

            <div className="grid grid-cols-2 gap-4 p-5 bg-slate-50 rounded-[32px] mt-8 border border-white">
              <div className="flex flex-col">
                <span className="text-[8px] font-black uppercase tracking-widest text-slate-400 mb-1">载客量</span>
                <span className="text-xs font-black text-slate-800">{vehicle.seats} 座</span>
              </div>
              <div className="flex flex-col">
                <span className="text-[8px] font-black uppercase tracking-widest text-slate-400 mb-1">运行里程</span>
                <span className="text-xs font-black text-slate-800">{(vehicle.mileage || 0).toLocaleString()} KM</span>
              </div>
            </div>
          </div>
        ))}
      </div>

      {isAdding && (
         <div className="fixed inset-0 z-[100] flex items-center justify-center p-4">
            <div className="absolute inset-0 bg-slate-900/60 backdrop-blur-xl animate-in fade-in duration-300" onClick={() => setIsAdding(false)}></div>
            <div className="relative bg-white rounded-[56px] shadow-2xl w-full max-w-3xl p-12 animate-in zoom-in-95 duration-300">
               <div className="flex justify-between items-center mb-10">
                  <div className="flex items-center gap-4">
                     <div className="w-12 h-12 bg-indigo-600 rounded-2xl flex items-center justify-center text-white shadow-xl">
                        <PlusCircle className="w-6 h-6" />
                     </div>
                     <h3 className="text-2xl font-black italic uppercase">资产录入入库</h3>
                  </div>
                  <button onClick={() => setIsAdding(false)} className="w-10 h-10 bg-slate-50 rounded-full flex items-center justify-center hover:bg-slate-100 transition-all text-slate-400"><X className="w-5 h-5" /></button>
               </div>
               
               <form onSubmit={handleAddSubmit} className="space-y-8">
                  <div className="grid grid-cols-2 gap-8">
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

                  <div className="grid grid-cols-2 gap-8">
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

                  <div className="grid grid-cols-3 gap-8">
                    <div className="space-y-2">
                      <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest px-1 flex items-center gap-2">
                        <UsersIcon className="w-3 h-3" /> 核定载客 (人)
                      </label>
                      {/* Fixed: cast e.target.value to Number to resolve type mismatch on line 192 */}
                      <input type="number" min="1" max="50" value={newVehicleData.seats} onChange={e => setNewVehicleData({...newVehicleData, seats: Number(e.target.value)})} className="w-full p-4 bg-slate-50 border-2 border-slate-50 rounded-2xl font-bold outline-none" />
                    </div>
                    <div className="space-y-2">
                      <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest px-1 flex items-center gap-2">
                        <CalendarIcon className="w-3 h-3" /> 车龄 (年)
                      </label>
                      {/* Fixed: cast e.target.value to Number to resolve type mismatch on line 198 */}
                      <input type="number" min="0" max="20" value={newVehicleData.age} onChange={e => setNewVehicleData({...newVehicleData, age: Number(e.target.value)})} className="w-full p-4 bg-slate-50 border-2 border-slate-50 rounded-2xl font-bold outline-none" />
                    </div>
                    <div className="space-y-2">
                      <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest px-1 flex items-center gap-2">
                        <Gauge className="w-3 h-3" /> 当前里程 (KM)
                      </label>
                      {/* Fixed: cast e.target.value to Number to resolve type mismatch on line 204 */}
                      <input type="number" min="0" value={newVehicleData.mileage} onChange={e => setNewVehicleData({...newVehicleData, mileage: Number(e.target.value)})} className="w-full p-4 bg-slate-50 border-2 border-slate-50 rounded-2xl font-bold outline-none" />
                    </div>
                  </div>

                  <div className="pt-6">
                    <button type="submit" className="w-full bg-indigo-600 hover:bg-indigo-500 text-white py-6 rounded-[32px] font-black uppercase tracking-[0.2em] text-xs flex items-center justify-center gap-4 shadow-2xl shadow-indigo-900/40 transition-all hover:scale-[1.01] active:scale-95">
                      <Check className="w-5 h-5" /> 确认入库并推送云端 D1
                    </button>
                    <p className="text-center text-[9px] text-slate-400 font-black uppercase tracking-widest mt-4">同步协议：已启用自动清洗，空缺字段将以默认值入库</p>
                  </div>
               </form>
            </div>
         </div>
      )}
    </div>
  );
};

export default VehicleManagement;
