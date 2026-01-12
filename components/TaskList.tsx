
import React from 'react';
import { Task, Driver } from '../types';
import { MapPin, Calendar, Truck, ArrowRight, Trash2, AlertCircle, Layers } from 'lucide-react';

interface Props {
  tasks: Task[];
  drivers: Driver[];
  onDeleteTask?: (id: string, date: string) => void;
}

const TaskList: React.FC<Props> = ({ tasks, drivers, onDeleteTask }) => {
  const getDriverName = (id: string | null) => {
    if (!id) return "未分配";
    return drivers.find(d => d.id === id)?.name || "未知";
  };

  const getStatusConfig = (status: Task['status']) => {
    switch (status) {
      case 'COMPLETED': return { class: 'bg-green-100 text-green-700', label: '已完成' };
      case 'IN_PROGRESS': return { class: 'bg-indigo-100 text-indigo-700', label: '执行中' };
      case 'CANCELLED': return { class: 'bg-rose-100 text-rose-700', label: '已取消' };
      default: return { class: 'bg-slate-100', label: '未知状态' };
    }
  };

  const handleDelete = (task: Task) => {
    const taskDate = task.date || task.startTime.split('T')[0];
    if (window.confirm(`⚠️ 安全确认\n\n确定要永久删除任务 [${task.title}] 吗？\n该操作将同步清理 D1 云端数据库记录。`)) {
      if (onDeleteTask) {
        onDeleteTask(task.id, taskDate);
      }
    }
  };

  const formatTaskTime = (task: Task) => {
    const start = new Date(task.startTime);
    const end = new Date(task.endTime);
    
    // 判断是否为跨天任务
    const isMultiDay = start.toDateString() !== end.toDateString();
    
    if (isMultiDay) {
      return (
        <span className="flex items-center gap-1.5 text-emerald-600">
          <Layers className="w-3 h-3" />
          跨天: {start.getMonth()+1}/{start.getDate()} - {end.getMonth()+1}/{end.getDate()}
        </span>
      );
    }

    return (
      <span className="flex items-center">
        <Calendar className="w-3 h-3 mr-1.5 text-slate-400" />
        {start.toLocaleTimeString([], {hour: '2-digit', minute:'2-digit'})} - 
        {end.toLocaleTimeString([], {hour: '2-digit', minute:'2-digit'})}
      </span>
    );
  };

  return (
    <div className="bg-white rounded-[40px] shadow-sm border border-slate-100 h-full flex flex-col overflow-hidden">
      <div className="p-8 border-b border-slate-50 flex justify-between items-center bg-white">
        <h2 className="text-xl font-black text-slate-800 flex items-center gap-3 italic uppercase">
          <Truck className="w-5 h-5 text-indigo-600" />
          当日调度日志
        </h2>
        <span className="bg-indigo-50 text-indigo-600 text-[10px] px-3 py-1 rounded-xl font-black uppercase tracking-widest border border-indigo-100">
          {tasks.length} 笔
        </span>
      </div>

      <div className="flex-1 overflow-y-auto p-6 space-y-4 scrollbar-hide">
        {tasks.length === 0 ? (
          <div className="flex flex-col items-center justify-center py-20 text-slate-300">
            <AlertCircle className="w-10 h-10 mb-2 opacity-20" />
            <p className="text-[10px] font-black uppercase tracking-[0.2em]">选定日期暂无调度</p>
          </div>
        ) : (
          tasks.map(task => {
            const statusConfig = getStatusConfig(task.status);
            return (
              <div key={task.id} className="group relative border border-slate-100 rounded-[28px] p-6 hover:shadow-xl hover:border-indigo-100 transition-all bg-white overflow-hidden">
                <button 
                  onClick={() => handleDelete(task)}
                  className="absolute top-4 right-4 p-3 bg-rose-50 text-rose-500 rounded-2xl opacity-0 group-hover:opacity-100 transition-all hover:bg-rose-500 hover:text-white z-20 shadow-sm"
                >
                  <Trash2 className="w-4 h-4" />
                </button>

                <div className="flex justify-between items-start mb-4 pr-10">
                  <div>
                    <h3 className="font-black text-slate-800 italic uppercase tracking-tight truncate max-w-[140px]">{task.title}</h3>
                    <p className="text-[10px] font-bold text-slate-400 flex items-center mt-1 uppercase tracking-widest">
                      {formatTaskTime(task)}
                    </p>
                  </div>
                  <span className={`text-[9px] px-2.5 py-1 rounded-lg font-black uppercase tracking-widest border ${statusConfig.class}`}>
                    {statusConfig.label}
                  </span>
                </div>
                
                <div className="flex items-center gap-2 mb-4 bg-slate-50 p-4 rounded-2xl text-[10px] font-bold text-slate-500 border border-slate-100/50">
                   <div className="flex-1 truncate">
                      {task.locationStart}
                   </div>
                   <ArrowRight className="w-3 h-3 text-slate-300 mx-1" />
                   <div className="flex-1 truncate text-right">
                      {task.locationEnd}
                   </div>
                </div>

                <div className="flex justify-between items-center">
                  <div className="flex items-center gap-3">
                     <div className="w-8 h-8 rounded-xl bg-slate-900 flex items-center justify-center text-[10px] font-black text-white uppercase italic">
                        {getDriverName(task.driverId).charAt(0)}
                     </div>
                     <span className="text-slate-700 font-black text-xs italic">{getDriverName(task.driverId)}</span>
                  </div>
                  <span className="text-slate-400 text-[10px] font-black uppercase tracking-widest bg-slate-50 px-2 py-1 rounded-md">{task.distanceKm} KM</span>
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
