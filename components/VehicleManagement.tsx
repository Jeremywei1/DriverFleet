
import React from 'react';
import { Vehicle, VehicleStatus } from '../types';
import { Car, Wrench, ShieldCheck, AlertTriangle, MoreVertical, Settings } from 'lucide-react';

interface Props {
  vehicles: Vehicle[];
}

const VehicleManagement: React.FC<Props> = ({ vehicles }) => {
  const getStatusBadge = (status: VehicleStatus) => {
    switch (status) {
      case VehicleStatus.ACTIVE:
        return <span className="px-2 py-1 bg-emerald-100 text-emerald-700 text-[10px] font-black rounded-full uppercase tracking-wider">运行中</span>;
      case VehicleStatus.MAINTENANCE:
        return <span className="px-2 py-1 bg-amber-100 text-amber-700 text-[10px] font-black rounded-full uppercase tracking-wider">维修中</span>;
      case VehicleStatus.OUT_OF_SERVICE:
        return <span className="px-2 py-1 bg-rose-100 text-rose-700 text-[10px] font-black rounded-full uppercase tracking-wider">停运</span>;
    }
  };

  return (
    <div className="h-full flex flex-col gap-6 animate-in fade-in duration-500">
      <div className="flex justify-between items-center">
        <div>
          <h2 className="text-2xl font-black text-slate-800">车辆资产管理</h2>
          <p className="text-slate-500 font-medium">监控车队中 {vehicles.length} 台车辆的运行与维保状态</p>
        </div>
        <button className="bg-slate-900 text-white px-5 py-2.5 rounded-2xl font-black hover:bg-slate-800 transition-all flex items-center gap-2 shadow-xl shadow-slate-200">
          <Car className="w-4 h-4" />
          新增车辆
        </button>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
        {vehicles.map(vehicle => (
          <div key={vehicle.id} className="bg-white rounded-[32px] border border-slate-100 shadow-sm p-6 hover:shadow-xl transition-all relative group overflow-hidden">
            {/* Background Accent */}
            <div className={`absolute top-0 right-0 w-32 h-32 -mr-12 -mt-12 rounded-full opacity-5 blur-2xl ${
              vehicle.status === VehicleStatus.ACTIVE ? 'bg-emerald-500' : 'bg-amber-500'
            }`}></div>

            <div className="flex justify-between items-start mb-6">
              <div className={`w-14 h-14 rounded-2xl flex items-center justify-center ${
                vehicle.status === VehicleStatus.ACTIVE ? 'bg-emerald-50 text-emerald-600' : 'bg-amber-50 text-amber-600'
              }`}>
                {vehicle.status === VehicleStatus.ACTIVE ? <ShieldCheck className="w-8 h-8" /> : <Wrench className="w-8 h-8" />}
              </div>
              <button className="p-2 text-slate-300 hover:text-slate-600 hover:bg-slate-50 rounded-xl transition-colors">
                <MoreVertical className="w-5 h-5" />
              </button>
            </div>

            <div className="mb-4">
               <div className="flex items-center gap-2 mb-1">
                 <h3 className="font-black text-slate-800 text-xl">{vehicle.plateNumber}</h3>
                 {getStatusBadge(vehicle.status)}
               </div>
               <p className="text-slate-400 font-bold text-sm tracking-wide">{vehicle.model}</p>
            </div>

            <div className="space-y-3 pt-4 border-t border-slate-50">
              <div className="flex justify-between text-xs">
                <span className="text-slate-400 font-black uppercase tracking-widest">车辆类型</span>
                <span className="text-slate-800 font-black">{vehicle.type === 'Sedan' ? '轿车' : vehicle.type === 'Van' ? '商务车' : '货车'}</span>
              </div>
              <div className="flex justify-between text-xs">
                <span className="text-slate-400 font-black uppercase tracking-widest">累计里程</span>
                <span className="text-slate-800 font-black">{vehicle.mileage.toLocaleString()} KM</span>
              </div>
              <div className="flex justify-between text-xs">
                <span className="text-slate-400 font-black uppercase tracking-widest">下次保养</span>
                <span className="text-slate-800 font-black">{vehicle.lastService}</span>
              </div>
            </div>

            <div className="mt-6 flex gap-2">
              <button className="flex-1 bg-slate-50 text-slate-600 py-3 rounded-2xl text-xs font-black hover:bg-slate-100 transition-all uppercase tracking-widest">
                维保日志
              </button>
              <button className="w-12 bg-slate-900 text-white flex items-center justify-center rounded-2xl hover:bg-slate-800 transition-all">
                <Settings className="w-4 h-4" />
              </button>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
};

export default VehicleManagement;
