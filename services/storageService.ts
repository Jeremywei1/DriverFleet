
const TABLE_MAP: Record<string, string> = {
  DRIVERS: 'drivers',
  VEHICLES: 'vehicles',
  TASKS: 'tasks'
};

// 发送同步状态通知的辅助函数
const notifySync = (status: 'pending' | 'success' | 'error', table: string, action: string) => {
  window.dispatchEvent(new CustomEvent('sync-status-change', {
    detail: { 
      status, 
      table, 
      action,
      timestamp: new Date().toLocaleTimeString() 
    }
  }));
};

export const storage = {
  // 保存全量数据到本地，同时尝试同步到云端
  save: async (key: string, data: any) => {
    const tableName = TABLE_MAP[key] || key;
    localStorage.setItem(key, JSON.stringify(data));

    notifySync('pending', tableName, '全量全表同步');
    try {
      const res = await fetch('/api/data', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ table: tableName, data: data })
      });
      if (res.ok) {
        notifySync('success', tableName, '云端同步成功');
      } else {
        throw new Error();
      }
    } catch (e) {
      notifySync('error', tableName, '同步连接异常');
      console.warn(`D1 Sync failed for ${tableName}:`, e);
    }
  },

  // 同步单条数据（任务、司机或车辆），解决“只更新第一项”的问题
  syncSingle: async (tableName: 'tasks' | 'drivers' | 'vehicles', data: any) => {
    const actionLabel = data.name || data.plateNumber || data.title || '单条记录更新';
    notifySync('pending', tableName, `推送: ${actionLabel}`);
    try {
      const res = await fetch('/api/data', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ table: tableName, data: data })
      });
      if (res.ok) {
        notifySync('success', tableName, `成功入库: ${actionLabel}`);
      } else {
        throw new Error();
      }
    } catch (e) {
      notifySync('error', tableName, `推送失败: ${actionLabel}`);
      console.error(`Failed to sync single ${tableName} record:`, e);
    }
  },

  deleteTask: async (id: string, date: string) => {
    notifySync('pending', 'tasks', `物理移除: ${id.slice(-4)}`);
    try {
      const res = await fetch(`/api/data?table=tasks&id=${id}&date=${date}`, {
        method: 'DELETE',
      });
      if (res.ok) {
        notifySync('success', 'tasks', `移除成功: ${id.slice(-4)}`);
      } else {
        throw new Error();
      }
    } catch (e) {
      notifySync('error', 'tasks', '删除指令失败');
      console.error('Cloud delete failed:', e);
    }
  },

  load: async <T>(key: string, queryParams: string = ''): Promise<T | null> => {
    const tableName = TABLE_MAP[key] || key;
    const url = `/api/data?table=${tableName}${queryParams ? '&' + queryParams : ''}`;
    
    try {
      const response = await fetch(url);
      if (response.ok) {
        const cloudData = await response.json();
        if (cloudData) {
          localStorage.setItem(key, JSON.stringify(cloudData));
          return cloudData as T;
        }
      }
    } catch (e) {
      console.warn('Cloud load failed, using local fallback', e);
    }

    const localData = localStorage.getItem(key);
    return localData ? JSON.parse(localData) : null;
  },

  clear: () => {
    localStorage.clear();
  },

  getLastSync: () => localStorage.getItem('fleet_last_sync')
};
