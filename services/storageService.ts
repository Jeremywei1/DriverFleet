
const TABLE_MAP: Record<string, string> = {
  DRIVERS: 'drivers',
  VEHICLES: 'vehicles',
  TASKS: 'tasks'
};

export const storage = {
  // 保存全量数据到本地，同时尝试同步到云端
  save: async (key: string, data: any) => {
    const tableName = TABLE_MAP[key] || key;
    localStorage.setItem(key, JSON.stringify(data));

    try {
      await fetch('/api/data', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ table: tableName, data: data })
      });
    } catch (e) {
      console.warn(`D1 Sync failed for ${tableName}:`, e);
    }
  },

  // 新增：同步单条数据（任务、司机或车辆），解决“只更新第一项”的问题
  syncSingle: async (tableName: 'tasks' | 'drivers' | 'vehicles', data: any) => {
    try {
      await fetch('/api/data', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ table: tableName, data: data })
      });
    } catch (e) {
      console.error(`Failed to sync single ${tableName} record:`, e);
    }
  },

  deleteTask: async (id: string, date: string) => {
    try {
      await fetch(`/api/data?table=tasks&id=${id}&date=${date}`, {
        method: 'DELETE',
      });
    } catch (e) {
      console.error('Cloud delete failed:', e);
    }
  },

  // 扩展 load 方法，支持传递 query 字符串（如 date=2023-10-27）
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
