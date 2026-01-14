
import React from 'react';
import { Task, Driver } from '../types';
import { MapPin, Calendar, Truck, ArrowRight, Trash2, AlertCircle, Layers, FileText, Banknote } from 'lucide-react';

interface Props {
  tasks: Task[];
  drivers: Driver[];
  onDeleteTask?: (id: string, date: string) => void;
  selectedDate: string;
}

const TaskList: React.FC<Props> = ({ tasks, drivers, onDeleteTask, selectedDate }) => {
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
        <span className="flex items-center gap-1.5 text-emerald-600 font-black">
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
        <div className="flex flex-col">
          <h2 className="text-xl font-black text-slate-800 flex items-center gap-3 italic uppercase">
            <Truck className="w-5 h-5 text-indigo-600" />
            调度日志
          </h2>
          <span className="text-[9px] font-black text-slate-400 uppercase tracking-widest mt-1 italic">{selectedDate} 日程明细</span>
        </div>
        <span className="bg-indigo-50 text-indigo-600 text-[10px] px-3 py-1 rounded-xl font-black uppercase tracking-widest border border-indigo-100 shadow-sm">
          {tasks.length} 笔记录
        </span>
      </div>

      <div className="flex-1 overflow-y-auto p-6 space-y-4 scrollbar-hide bg-slate-50/20">
        {tasks.length === 0 ? (
          <div className="flex flex-col items-center justify-center py-24 text-slate-300">
            <div className="w-16 h-16 bg-white rounded-3xl flex items-center justify-center mb-4 shadow-sm border border-slate-100">
               <AlertCircle className="w-8 h-8 text-slate-100" />
            </div>
            <p className="text-[10px] font-black uppercase tracking-[0.2em] italic">选定日期暂无调度任务</p>
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
                  <div className="flex flex-col gap-1">
                    <h3 className="font-black text-slate-800 italic uppercase tracking-tight truncate max-w-[140px] text-base">{task.title}</h3>
                    <div className="text-[10px] font-bold text-slate-400 flex items-center uppercase tracking-widest">
                      {formatTaskTime(task)}
                    </div>
                  </div>
                  <span className={`text-[9px] px-2.5 py-1 rounded-lg font-black uppercase tracking-widest border ${statusConfig.class}`}>
                    {statusConfig.label}
                  </span>
                </div>
                
                <div className="flex items-center gap-2 mb-4 bg-slate-50 p-4 rounded-2xl text-[10px] font-bold text-slate-500 border border-slate-100/50 group-hover:bg-slate-100 transition-colors">
                   <div className="flex-1 truncate">
                      {task.locationStart}
                   </div>
                   <ArrowRight className="w-3 h-3 text-indigo-300 mx-1" />
                   <div className="flex-1 truncate text-right">
                      {task.locationEnd}
                   </div>
                </div>
                
                {/* 备注与金额显示区域 */}
                {(task.notes || (task.revenue && task.revenue > 0)) && (
                   <div className="mb-4 flex gap-2">
                      {task.notes && (
                        <div className="flex-1 bg-amber-50 p-3 rounded-xl border border-amber-100 text-amber-800/80 flex items-start gap-2">
                           <FileText className="w-3 h-3 mt-0.5 shrink-0" />
                           <p className="text-[10px] font-bold leading-relaxed line-clamp-1">{task.notes}</p>
                        </div>
                      )}
                      {task.revenue && task.revenue > 0 && (
                        <div className="bg-emerald-50 p-3 rounded-xl border border-emerald-100 text-emerald-700 flex items-center gap-1.5 shrink-0">
                           <Banknote className="w-3.5 h-3.5" />
                           <span className="text-xs font-black">¥{task.revenue.toLocaleString()}</span>
                        </div>
                      )}
                   </div>
                )}

                <div className="flex justify-between items-center mt-2">
                  <div className="flex items-center gap-3">
                     <div className="w-8 h-8 rounded-xl bg-slate-900 flex items-center justify-center text-[10px] font-black text-white uppercase italic shadow-lg group-hover:bg-indigo-600 transition-colors">
                        {getDriverName(task.driverId).charAt(0)}
                     </div>
                     <span className="text-slate-700 font-black text-xs italic uppercase tracking-tighter">{getDriverName(task.driverId)}</span>
                  </div>
                  <div className="flex flex-col items-end gap-1">
                    <span className="text-slate-400 text-[9px] font-black uppercase tracking-widest">距离 {task.distanceKm} KM</span>
                    {task.priority === 'HIGH' && <span className="w-1.5 h-1.5 rounded-full bg-rose-500 animate-pulse"></span>}
                  </div>
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
