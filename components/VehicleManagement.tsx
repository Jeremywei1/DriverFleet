
import React, { useState } from 'react';
import { Vehicle, VehicleStatus } from '../types';
import { 
  Car, Wrench, ShieldCheck, AlertTriangle, 
  Settings, X, Edit2, Hash, Gauge, Calendar, PlusCircle
} from 'lucide-react';

interface Props {
  vehicles: Vehicle[];
  onUpdateVehicle: (vehicle: Vehicle) => void;
  onAddVehicle: (vehicle: Vehicle) => void;
}

const VehicleManagement: React.FC<Props> = ({ vehicles, onUpdateVehicle, onAddVehicle }) => {
  const [editingVehicle, setEditingVehicle] = useState<Vehicle | null>(null);
  const [isAdding, setIsAdding] = useState(false);
  
  // 用于新增车辆的临时状态
  const [newVehicleData, setNewVehicleData] = useState<Partial<Vehicle>>({
    plateNumber: '',
    model: '',
    type: 'Sedan',
    status: VehicleStatus.ACTIVE,
    mileage: 0,
    lastService: new Date().toISOString().split('T')[0]
  });

  const getStatusBadge = (status: VehicleStatus) => {
    switch (status) {
      case VehicleStatus.ACTIVE:
        return <span className="px-3 py-1 bg-emerald-50 text-emerald-600 text-[10px] font-black rounded-full uppercase tracking-wider border border-emerald-100">运行中</span>;
      case VehicleStatus.MAINTENANCE:
        return <span className="px-3 py-1 bg-amber-50 text-amber-600 text-[10px] font-black rounded-full uppercase tracking-wider border border-amber-100">维保中</span>;
      case VehicleStatus.OUT_OF_SERVICE:
        return <span className="px-3 py-1 bg-rose-50 text-rose-600 text-[10px] font-black rounded-full uppercase tracking-wider border border-rose-100">已停运</span>;
      default:
        return <span className="px-3 py-1 bg-slate-50 text-slate-600 text-[10px] font-black rounded-full uppercase tracking-wider border border-slate-100">未知</span>;
    }
  };

  const handleEdit = (vehicle: Vehicle) => {
    setEditingVehicle({ ...vehicle });
  };

  const handleSaveEdit = (e: React.FormEvent) => {
    e.preventDefault();
    if (editingVehicle) {
      onUpdateVehicle(editingVehicle);
      setEditingVehicle(null);
    }
  };

  const handleAddSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    const vehicle: Vehicle = {
      id: `v-${Date.now()}`,
      plateNumber: newVehicleData.plateNumber || `京A·${Math.floor(10000 + Math.random() * 90000)}`,
      model: newVehicleData.model || '通用型汽车',
      type: (newVehicleData.type as any) || 'Sedan',
      status: newVehicleData.status || VehicleStatus.ACTIVE,
      currentDriverId: null,
      mileage: newVehicleData.mileage || 0,
      lastService: newVehicleData.lastService || new Date().toISOString().split('T')[0]
    };
    onAddVehicle(vehicle);
    setIsAdding(false);
    setNewVehicleData({ plateNumber: '', model: '', type: 'Sedan', status: VehicleStatus.ACTIVE, mileage: 0 });
  };

  return (
    <div className="h-full flex flex-col gap-8 animate-in fade-in duration-700">
      <div className="flex justify-between items-center">
        <div>
          <h2 className="text-3xl font-black text-slate-800 tracking-tight italic uppercase">资产与车辆档案</h2>
          <p className="text-slate-500 font-bold mt-1 uppercase tracking-widest text-[11px]">
            当前车队规模: {vehicles.length} 台资产 / 状态实时监测中
          </p>
        </div>
        <button 
          onClick={() => setIsAdding(true)}
          className="bg-slate-900 hover:bg-slate-800 text-white px-8 py-4 rounded-2xl font-black shadow-2xl transition-all hover:scale-[1.02] active:scale-95 flex items-center gap-2"
        >
          <PlusCircle className="w-5 h-5" />
          采购入库
        </button>
      </div>

      {vehicles.length === 0 ? (
        <div className="flex flex-col items-center justify-center py-20 bg-white rounded-[48px] border-2 border-dashed border-slate-200">
           <div className="w-20 h-20 bg-slate-50 rounded-3xl flex items-center justify-center text-slate-300 mb-6">
              <Car className="w-10 h-10" />
           </div>
           <p className="text-slate-400 font-black uppercase tracking-widest">暂无资产记录，请点击采购入库</p>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-8 overflow-y-auto pb-20 pr-2 scrollbar-hide">
          {vehicles.map(vehicle => (
            <div key={vehicle.id} className="bg-white rounded-[40px] border border-slate-100 shadow-sm p-8 hover:shadow-2xl transition-all duration-300 relative group overflow-hidden border-b-8 border-b-slate-50 min-h-[380px] flex flex-col">
              <div className="flex justify-between items-start mb-8">
                <div className={`w-16 h-16 rounded-[24px] flex items-center justify-center shadow-inner ${
                  vehicle.status === VehicleStatus.ACTIVE ? 'bg-emerald-50 text-emerald-600' : 
                  vehicle.status === VehicleStatus.MAINTENANCE ? 'bg-amber-50 text-amber-600' : 'bg-rose-50 text-rose-600'
                }`}>
                  {vehicle.status === VehicleStatus.ACTIVE ? <ShieldCheck className="w-8 h-8" /> : 
                   vehicle.status === VehicleStatus.MAINTENANCE ? <Wrench className="w-8 h-8" /> : <AlertTriangle className="w-8 h-8" />}
                </div>
                <button 
                  onClick={() => handleEdit(vehicle)}
                  className="p-3 text-slate-300 hover:text-indigo-600 hover:bg-indigo-50 rounded-2xl transition-all"
                >
                  <Edit2 className="w-5 h-5" />
                </button>
              </div>

              <div className="mb-auto">
                 <h3 className="font-black text-slate-800 text-2xl tracking-tighter mb-2 min-h-[32px]">
                   {vehicle.plateNumber || '未登记车牌'}
                 </h3>
                 <div className="flex items-center gap-2 mb-3">
                   {getStatusBadge(vehicle.status)}
                 </div>
                 <p className="text-slate-400 font-bold text-[11px] uppercase tracking-widest leading-tight">
                   {vehicle.model || '通用型汽车'}
                 </p>
              </div>

              <div className="space-y-4 p-6 bg-slate-50 rounded-[32px] border border-white mt-8">
                <div className="flex justify-between items-center text-xs">
                  <span className="text-slate-400 font-black uppercase tracking-widest">资产类型</span>
                  <span className="text-slate-800 font-black uppercase">{vehicle.type || 'SEDAN'}</span>
                </div>
                <div className="flex justify-between items-center text-xs">
                  <span className="text-slate-400 font-black uppercase tracking-widest">累计运行里程</span>
                  <span className="text-slate-800 font-black">{(vehicle.mileage || 0).toLocaleString()} KM</span>
                </div>
              </div>
            </div>
          ))}
        </div>
      )}

      {/* 采购入库模态框 */}
      {isAdding && (
        <div className="fixed inset-0 z-[300] flex items-center justify-center p-4">
          <div className="absolute inset-0 bg-slate-900/60 backdrop-blur-xl animate-in fade-in duration-300" onClick={() => setIsAdding(false)}></div>
          <div className="relative bg-white rounded-[56px] shadow-2xl w-full max-w-2xl overflow-hidden animate-in zoom-in-95 duration-500 border border-slate-100">
            <form onSubmit={handleAddSubmit} className="p-12">
              <div className="flex justify-between items-center mb-12">
                <div className="flex items-center gap-4">
                  <div className="w-14 h-14 bg-emerald-600 rounded-3xl flex items-center justify-center text-white shadow-xl">
                    <Car className="w-7 h-7" />
                  </div>
                  <div>
                    <h3 className="text-3xl font-black text-slate-800 tracking-tighter italic">新资产入库申请</h3>
                    <p className="text-slate-400 font-bold uppercase tracking-widest text-[10px] mt-1">FLEET ASSET REGISTRATION SYSTEM</p>
                  </div>
                </div>
                <button type="button" onClick={() => setIsAdding(false)} className="p-4 hover:bg-slate-50 rounded-full text-slate-300 hover:text-slate-600 transition-colors">
                  <X className="w-8 h-8" />
                </button>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-x-10 gap-y-8">
                <div>
                  <label className="block text-[10px] font-black text-slate-400 uppercase tracking-widest mb-3 px-1">车牌号码</label>
                  <input 
                    type="text" 
                    required
                    placeholder="例如: 京A·88888"
                    value={newVehicleData.plateNumber}
                    onChange={(e) => setNewVehicleData({...newVehicleData, plateNumber: e.target.value})}
                    className="w-full px-6 py-4 bg-slate-50 border border-slate-100 rounded-2xl focus:ring-4 focus:ring-emerald-100 font-black text-slate-800"
                  />
                </div>
                <div>
                  <label className="block text-[10px] font-black text-slate-400 uppercase tracking-widest mb-3 px-1">车辆品牌型号</label>
                  <input 
                    type="text" 
                    required
                    placeholder="例如: 特斯拉 Model Y"
                    value={newVehicleData.model}
                    onChange={(e) => setNewVehicleData({...newVehicleData, model: e.target.value})}
                    className="w-full px-6 py-4 bg-slate-50 border border-slate-100 rounded-2xl focus:ring-4 focus:ring-emerald-100 font-black text-slate-800"
                  />
                </div>
                <div>
                  <label className="block text-[10px] font-black text-slate-400 uppercase tracking-widest mb-3 px-1">资产类别</label>
                  <select 
                    value={newVehicleData.type}
                    onChange={(e) => setNewVehicleData({...newVehicleData, type: e.target.value as any})}
                    className="w-full px-6 py-4 bg-slate-50 border border-slate-100 rounded-2xl focus:ring-4 focus:ring-emerald-100 font-black text-slate-800 appearance-none"
                  >
                    <option value="Sedan">轿车 (SEDAN)</option>
                    <option value="Van">商务车 (VAN)</option>
                    <option value="Truck">货运车 (TRUCK)</option>
                  </select>
                </div>
                <div>
                  <label className="block text-[10px] font-black text-slate-400 uppercase tracking-widest mb-3 px-1">初始里程 (KM)</label>
                  <input 
                    type="number" 
                    value={newVehicleData.mileage}
                    onChange={(e) => setNewVehicleData({...newVehicleData, mileage: parseInt(e.target.value)})}
                    className="w-full px-6 py-4 bg-slate-50 border border-slate-100 rounded-2xl focus:ring-4 focus:ring-emerald-100 font-black text-slate-800"
                  />
                </div>
              </div>

              <div className="mt-16 flex gap-4">
                <button type="button" onClick={() => setIsAdding(false)} className="flex-1 py-6 font-black text-slate-400 hover:text-slate-600 transition-colors uppercase tracking-widest text-xs">放弃录入</button>
                <button type="submit" className="flex-[2] bg-slate-900 text-white py-6 rounded-[28px] font-black shadow-2xl hover:bg-slate-800 transition-all uppercase tracking-widest text-xs">执行采购入库</button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* 编辑模态框 */}
      {editingVehicle && (
        <div className="fixed inset-0 z-[300] flex items-center justify-center p-4">
          <div className="absolute inset-0 bg-slate-900/60 backdrop-blur-xl animate-in fade-in duration-300" onClick={() => setEditingVehicle(null)}></div>
          <div className="relative bg-white rounded-[56px] shadow-2xl w-full max-w-2xl overflow-hidden animate-in zoom-in-95 duration-500 border border-slate-100">
            <form onSubmit={handleSaveEdit} className="p-12">
              <div className="flex justify-between items-center mb-12">
                <div className="flex items-center gap-4">
                  <div className="w-14 h-14 bg-slate-900 rounded-3xl flex items-center justify-center text-white shadow-xl">
                    <Settings className="w-7 h-7" />
                  </div>
                  <div>
                    <h3 className="text-3xl font-black text-slate-800 tracking-tighter italic">资产档案修正</h3>
                    <p className="text-slate-400 font-bold uppercase tracking-widest text-[10px] mt-1">INTERNAL ASSET ID: {editingVehicle.id}</p>
                  </div>
                </div>
                <button type="button" onClick={() => setEditingVehicle(null)} className="p-4 hover:bg-slate-50 rounded-full text-slate-300 hover:text-slate-600 transition-colors">
                  <X className="w-8 h-8" />
                </button>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-x-10 gap-y-8">
                <div>
                  <label className="block text-[10px] font-black text-slate-400 uppercase tracking-widest mb-3 px-1">车牌号码</label>
                  <input 
                    type="text" 
                    value={editingVehicle.plateNumber}
                    onChange={(e) => setEditingVehicle({...editingVehicle, plateNumber: e.target.value})}
                    className="w-full px-6 py-4 bg-slate-50 border border-slate-100 rounded-2xl focus:ring-4 focus:ring-indigo-100 font-black text-slate-800"
                  />
                </div>
                <div>
                  <label className="block text-[10px] font-black text-slate-400 uppercase tracking-widest mb-3 px-1">品牌型号</label>
                  <input 
                    type="text" 
                    value={editingVehicle.model}
                    onChange={(e) => setEditingVehicle({...editingVehicle, model: e.target.value})}
                    className="w-full px-6 py-4 bg-slate-50 border border-slate-100 rounded-2xl focus:ring-4 focus:ring-indigo-100 font-black text-slate-800"
                  />
                </div>
                <div>
                  <label className="block text-[10px] font-black text-slate-400 uppercase tracking-widest mb-3 px-1">当前运营状态</label>
                  <select 
                    value={editingVehicle.status}
                    onChange={(e) => setEditingVehicle({...editingVehicle, status: e.target.value as VehicleStatus})}
                    className="w-full px-6 py-4 bg-slate-50 border border-slate-100 rounded-2xl focus:ring-4 focus:ring-indigo-100 font-black text-slate-800 appearance-none"
                  >
                    <option value={VehicleStatus.ACTIVE}>🟢 运行中 (ACTIVE)</option>
                    <option value={VehicleStatus.MAINTENANCE}>🟡 维保中 (MAINTENANCE)</option>
                    <option value={VehicleStatus.OUT_OF_SERVICE}>🔴 已停运 (OUT_OF_SERVICE)</option>
                  </select>
                </div>
                <div>
                  <label className="block text-[10px] font-black text-slate-400 uppercase tracking-widest mb-3 px-1">当前累计里程 (KM)</label>
                  <input 
                    type="number" 
                    value={editingVehicle.mileage}
                    onChange={(e) => setEditingVehicle({...editingVehicle, mileage: parseInt(e.target.value)})}
                    className="w-full px-6 py-4 bg-slate-50 border border-slate-100 rounded-2xl focus:ring-4 focus:ring-indigo-100 font-black text-slate-800"
                  />
                </div>
              </div>

              <div className="mt-16 flex gap-4">
                <button type="button" onClick={() => setEditingVehicle(null)} className="flex-1 py-6 font-black text-slate-400 hover:text-slate-600 transition-colors uppercase tracking-widest text-xs">取消修改</button>
                <button type="submit" className="flex-[2] bg-indigo-600 text-white py-6 rounded-[28px] font-black shadow-2xl hover:bg-indigo-700 transition-all uppercase tracking-widest text-xs">确认更新档案</button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};

export default VehicleManagement;
