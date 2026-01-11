
const TABLE_MAP: Record<string, string> = {
  DRIVERS: 'drivers',
  VEHICLES: 'vehicles',
  TASKS: 'tasks'
};

/**
 * 针对 D1 存储的深度清洗和扁平化
 */
const sanitizeForSync = (obj: any, tableName: string): any => {
  if (Array.isArray(obj)) return obj.map(item => sanitizeForSync(item, tableName));
  
  if (obj !== null && typeof obj === 'object') {
    const clean: any = {};
    for (const [key, value] of Object.entries(obj)) {
      // 扁平化 Driver 的坐标
      if (tableName === 'drivers' && key === 'coordinates' && value && typeof value === 'object') {
        const coords = value as { x: number, y: number };
        clean.coord_x = coords.x;
        clean.coord_y = coords.y;
        continue;
      }
      clean[key] = value === undefined ? null : value;
    }
    return clean;
  }
  return obj;
};

/**
 * 加载时的逆向转换：将扁平化字段转回嵌套对象
 */
const restoreFromSync = (data: any, tableName: string): any => {
  if (!data) return data;
  if (Array.isArray(data)) return data.map(item => restoreFromSync(item, tableName));
  
  if (typeof data === 'object') {
    const restored = { ...data };
    
    if (tableName === 'drivers' && 'coord_x' in restored) {
      restored.coordinates = { 
        x: Number(restored.coord_x) || 0, 
        y: Number(restored.coord_y) || 0 
      };
      // 强制转换 isActive 状态
      restored.isActive = restored.isActive === 1 || restored.isActive === true;
    }

    if (tableName === 'vehicles' || tableName === 'drivers') {
      restored.isActive = restored.isActive === 1 || restored.isActive === true;
    }
    
    return restored;
  }
  return data;
};

const notifySync = (status: 'pending' | 'success' | 'error', table: string, action: string, errorMsg?: string) => {
  window.dispatchEvent(new CustomEvent('sync-status-change', {
    detail: { status, table, action, errorMsg, timestamp: new Date().toLocaleTimeString() }
  }));
};

export const storage = {
  save: async (key: string, data: any) => {
    const tableName = TABLE_MAP[key] || key;
    const cleanData = sanitizeForSync(data, tableName);
    localStorage.setItem(key, JSON.stringify(data)); // 本地保留原结构

    notifySync('pending', tableName, '云端全量同步中');
    try {
      const res = await fetch('/api/data', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ table: tableName, data: cleanData })
      });
      if (res.ok) {
        notifySync('success', tableName, '同步成功');
      } else {
        const err = await res.json().catch(() => ({ error: '解析失败' }));
        throw new Error(err.error || 'Server Side Reject');
      }
    } catch (e: any) {
      notifySync('error', tableName, '同步连接异常', e.message);
    }
  },

  syncSingle: async (tableName: 'tasks' | 'drivers' | 'vehicles', data: any) => {
    const cleanData = sanitizeForSync(data, tableName);
    const actionLabel = data.name || data.plateNumber || data.title || '记录更新';
    
    notifySync('pending', tableName, `推送: ${actionLabel}`);
    try {
      const res = await fetch('/api/data', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ table: tableName, data: cleanData })
      });
      if (res.ok) {
        notifySync('success', tableName, `入库成功: ${actionLabel}`);
      } else {
        const err = await res.json().catch(() => ({error: 'Response Parse Error'}));
        throw new Error(err.error || 'Server Error');
      }
    } catch (e: any) {
      notifySync('error', tableName, `推送失败: ${actionLabel}`, e.message);
    }
  },

  deleteResource: async (tableName: 'tasks' | 'drivers' | 'vehicles', id: string, queryParams: string = '') => {
    notifySync('pending', tableName, `正在移除 ID: ${id.slice(-6)}`);
    try {
      const url = `/api/data?table=${tableName}&id=${id}${queryParams ? '&' + queryParams : ''}`;
      const res = await fetch(url, { method: 'DELETE' });
      if (!res.ok) throw new Error('Delete failed');
      notifySync('success', tableName, '云端数据已清理');
    } catch (e: any) {
      notifySync('error', tableName, '删除请求失败', e.message);
    }
  },

  // Legacy helper, now calls generic deleteResource
  deleteTask: async (id: string, date: string) => {
    return storage.deleteResource('tasks', id, `date=${date}`);
  },

  load: async <T>(key: string, queryParams: string = ''): Promise<T | null> => {
    const tableName = TABLE_MAP[key] || key;
    try {
      const response = await fetch(`/api/data?table=${tableName}${queryParams ? '&' + queryParams : ''}`);
      if (response.ok) {
        const cloudData = await response.json();
        if (cloudData) {
          const restored = restoreFromSync(cloudData, tableName);
          localStorage.setItem(key, JSON.stringify(restored));
          return restored as T;
        }
      }
    } catch (e) {
      console.warn('Cloud load error', e);
    }
    const local = localStorage.getItem(key);
    return local ? JSON.parse(local) : null;
  }
};
