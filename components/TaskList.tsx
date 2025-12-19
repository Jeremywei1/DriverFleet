import React from 'react';
import { Task, Driver } from '../types';
import { MapPin, Calendar, Truck, ArrowRight } from 'lucide-react';

interface Props {
  tasks: Task[];
  drivers: Driver[];
}

const TaskList: React.FC<Props> = ({ tasks, drivers }) => {
  const getDriverName = (id: string | null) => {
    if (!id) return "未分配";
    return drivers.find(d => d.id === id)?.name || "未知";
  };

  const getStatusConfig = (status: Task['status']) => {
    switch (status) {
      case 'COMPLETED': return { class: 'bg-green-100 text-green-700', label: '已完成' };
      case 'IN_PROGRESS': return { class: 'bg-blue-100 text-blue-700', label: '进行中' };
      case 'PENDING': return { class: 'bg-amber-100 text-amber-700', label: '待处理' };
      case 'CANCELLED': return { class: 'bg-red-100 text-red-700', label: '已取消' };
      default: return { class: 'bg-gray-100', label: '未知' };
    }
  };

  return (
    <div className="bg-white rounded-2xl shadow-sm border border-slate-100 h-full flex flex-col">
      <div className="p-4 border-b border-slate-100 flex justify-between items-center bg-slate-50">
        <h2 className="text-lg font-bold text-slate-800 flex items-center gap-2">
          <Truck className="w-5 h-5 text-indigo-600" />
          每日调度日志
        </h2>
        <span className="bg-indigo-100 text-indigo-700 text-xs px-2 py-1 rounded-full font-bold">
          {tasks.length} 单
        </span>
      </div>

      <div className="flex-1 overflow-y-auto p-4 space-y-3">
        {tasks.length === 0 ? (
          <div className="text-center py-10 text-slate-400">今日暂无任务。</div>
        ) : (
          tasks.map(task => {
            const statusConfig = getStatusConfig(task.status);
            return (
              <div key={task.id} className="border border-slate-100 rounded-xl p-4 hover:shadow-md transition-shadow bg-white">
                <div className="flex justify-between items-start mb-3">
                  <div>
                    <h3 className="font-bold text-slate-800">{task.title}</h3>
                    <p className="text-xs text-slate-500 flex items-center mt-1">
                      <Calendar className="w-3 h-3 mr-1" />
                      {new Date(task.startTime).toLocaleTimeString([], {hour: '2-digit', minute:'2-digit'})} - 
                      {new Date(task.endTime).toLocaleTimeString([], {hour: '2-digit', minute:'2-digit'})}
                    </p>
                  </div>
                  <span className={`text-xs px-2 py-1 rounded-full font-bold uppercase tracking-wider ${statusConfig.class}`}>
                    {statusConfig.label}
                  </span>
                </div>
                
                <div className="flex items-center gap-2 mb-3 bg-slate-50 p-2 rounded-lg text-sm text-slate-600">
                   <div className="flex-1 truncate flex items-center">
                      <MapPin className="w-3 h-3 mr-1 text-slate-400" /> {task.locationStart}
                   </div>
                   <ArrowRight className="w-3 h-3 text-slate-300" />
                   <div className="flex-1 truncate flex items-center justify-end">
                      {task.locationEnd} <MapPin className="w-3 h-3 ml-1 text-slate-400" />
                   </div>
                </div>

                <div className="flex justify-between items-center text-sm">
                  <div className="flex items-center gap-2">
                     <div className="w-6 h-6 rounded-full bg-slate-200 flex items-center justify-center text-xs font-bold text-slate-500 overflow-hidden">
                        {getDriverName(task.driverId).charAt(0)}
                     </div>
                     <span className="text-slate-700 font-medium">{getDriverName(task.driverId)}</span>
                  </div>
                  <span className="text-slate-400 text-xs">{task.distanceKm} 公里</span>
                </div>
              </div>
            );
          })
        )}
      </div>
    </div>
  );
};

export default TaskList;