
import React, { useState } from 'react';
import { Vehicle } from '../types';
import { 
  Car, Wrench, ShieldCheck, AlertTriangle, 
  Settings, X, Edit2, PlusCircle, Power, PowerOff, Check
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
    if (!newVehicleData.plateNumber || !newVehicleData.model) return;

    // 严格清洗数值字段，防止 NaN 导致 D1 500 错误
    const safeMileage = isNaN(Number(newVehicleData.mileage)) ? 0 : Number(newVehicleData.mileage);
    const safeSeats = isNaN(Number(newVehicleData.seats)) ? 5 : Number(newVehicleData.seats);
    const safeAge = isNaN(Number(newVehicleData.age)) ? 1 : Number(newVehicleData.age);

    const vehicle: Vehicle = {
      id: `v-${Date.now()}`,
      plateNumber: newVehicleData.plateNumber,
      model: newVehicleData.model,
      type: (newVehicleData.type as any) || 'Sedan',
      currentDriverId: null,
      mileage: safeMileage,
      lastService: newVehicleData.lastService || new Date().toISOString().split('T')[0],
      color: newVehicleData.color || 'White',
      seats: safeSeats,
      age: safeAge,
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
          <div key={vehicle.id} className={`bg-white rounded-[40px] border border-slate-100 shadow-sm p-8 hover:shadow-2xl transition-all relative overflow-hidden flex flex-col min-h-[350px] ${!vehicle.isActive ? 'opacity-50 grayscale' : ''}`}>
            <div className="flex justify-between items-start mb-8">
              <div className={`w-16 h-16 rounded-[24px] flex items-center justify-center shadow-inner ${vehicle.isActive ? 'bg-emerald-50 text-emerald-600' : 'bg-rose-50 text-rose-600'}`}>
                {vehicle.isActive ? <ShieldCheck className="w-8 h-8" /> : <Wrench className="w-8 h-8" />}
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
               <span className={`text-[9px] font-black uppercase tracking-widest px-2 py-1 rounded-md ${vehicle.isActive ? 'bg-emerald-50 text-emerald-600' : 'bg-rose-50 text-rose-600'}`}>
                   {vehicle.isActive ? '可派单' : '库库/维修'}
               </span>
               <p className="text-slate-400 font-bold text-[11px] uppercase tracking-widest mt-3 leading-tight">
                 {vehicle.model}
               </p>
            </div>

            <div className="space-y-4 p-6 bg-slate-50 rounded-[32px] mt-8 border border-white">
              <div className="flex justify-between items-center text-[10px] font-black uppercase tracking-widest text-slate-400">
                <span>资产类别 / 颜色</span>
                <span className="text-slate-800">{vehicle.type} / {vehicle.color}</span>
              </div>
              <div className="flex justify-between items-center text-[10px] font-black uppercase tracking-widest text-slate-400">
                <span>运行里程</span>
                <span className="text-slate-800">{vehicle.mileage.toLocaleString()} KM</span>
              </div>
            </div>
          </div>
        ))}
      </div>

      {isAdding && (
         <div className="fixed inset-0 z-[100] flex items-center justify-center p-4">
            <div className="absolute inset-0 bg-slate-900/60 backdrop-blur-xl" onClick={() => setIsAdding(false)}></div>
            <div className="relative bg-white rounded-[56px] shadow-2xl w-full max-w-2xl p-12 animate-in zoom-in-95 duration-300">
               <div className="flex justify-between items-center mb-10">
                  <h3 className="text-2xl font-black italic uppercase">资产录入入库</h3>
                  <button onClick={() => setIsAdding(false)} className="w-10 h-10 bg-slate-50 rounded-full flex items-center justify-center hover:bg-slate-100 transition-all"><X className="w-5 h-5 text-slate-400" /></button>
               </div>
               <form onSubmit={handleAddSubmit} className="space-y-6">
                  <div className="grid grid-cols-2 gap-6">
                    <div>
                      <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest mb-1 block px-1">车牌号码</label>
                      <input required type="text" placeholder="京A·88888" value={newVehicleData.plateNumber} onChange={e => setNewVehicleData({...newVehicleData, plateNumber: e.target.value})} className="w-full p-4 bg-slate-50 border-2 border-slate-50 focus:border-indigo-500/20 rounded-2xl font-bold transition-all outline-none" />
                    </div>
                    <div>
                      <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest mb-1 block px-1">品牌型号</label>
                      <input required type="text" placeholder="丰田 凯美瑞" value={newVehicleData.model} onChange={e => setNewVehicleData({...newVehicleData, model: e.target.value})} className="w-full p-4 bg-slate-50 border-2 border-slate-50 focus:border-indigo-500/20 rounded-2xl font-bold transition-all outline-none" />
                    </div>
                  </div>

                  <div className="grid grid-cols-2 gap-6">
                    <div>
                      <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest mb-1 block px-1">车辆类型</label>
                      <select value={newVehicleData.type} onChange={e => setNewVehicleData({...newVehicleData, type: e.target.value as any})} className="w-full p-4 bg-slate-50 border-2 border-slate-50 rounded-2xl font-bold outline-none appearance-none">
                        <option value="Sedan">轿车 (Sedan)</option>
                        <option value="Van">商务车 (Van)</option>
                        <option value="Truck">货车 (Truck)</option>
                      </select>
                    </div>
                    <div>
                      <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest mb-1 block px-1">外观颜色</label>
                      <input type="text" placeholder="白色 / 黑色 / 银色" value={newVehicleData.color} onChange={e => setNewVehicleData({...newVehicleData, color: e.target.value})} className="w-full p-4 bg-slate-50 border-2 border-slate-50 focus:border-indigo-500/20 rounded-2xl font-bold transition-all outline-none" />
                    </div>
                  </div>

                  <div className="grid grid-cols-3 gap-6">
                    <div>
                      <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest mb-1 block px-1">核定载客</label>
                      <input type="number" value={newVehicleData.seats} onChange={e => setNewVehicleData({...newVehicleData, seats: e.target.value === '' ? 0 : Number(e.target.value)})} className="w-full p-4 bg-slate-50 border-2 border-slate-50 rounded-2xl font-bold outline-none" />
                    </div>
                    <div>
                      <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest mb-1 block px-1">车龄 (年)</label>
                      <input type="number" value={newVehicleData.age} onChange={e => setNewVehicleData({...newVehicleData, age: e.target.value === '' ? 0 : Number(e.target.value)})} className="w-full p-4 bg-slate-50 border-2 border-slate-50 rounded-2xl font-bold outline-none" />
                    </div>
                    <div>
                      <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest mb-1 block px-1">当前里程 (KM)</label>
                      <input type="number" value={newVehicleData.mileage} onChange={e => setNewVehicleData({...newVehicleData, mileage: e.target.value === '' ? 0 : Number(e.target.value)})} className="w-full p-4 bg-slate-50 border-2 border-slate-50 rounded-2xl font-bold outline-none" />
                    </div>
                  </div>

                  <div className="pt-6">
                    <button type="submit" className="w-full bg-indigo-600 hover:bg-indigo-500 text-white py-6 rounded-[24px] font-black uppercase tracking-[0.2em] text-xs flex items-center justify-center gap-4 shadow-2xl shadow-indigo-900/40 transition-all active:scale-95">
                      <Check className="w-5 h-5" /> 确认入库并推送云端 D1
                    </button>
                  </div>
               </form>
            </div>
         </div>
      )}
    </div>
  );
};

export default VehicleManagement;
