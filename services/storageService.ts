
const TABLE_MAP: Record<string, string> = {
  DRIVERS: 'drivers',
  VEHICLES: 'vehicles',
  TASKS: 'tasks',
  DRIVER_SCHEDULES: 'driver_schedules',
  VEHICLE_SCHEDULES: 'vehicle_schedules'
};

export const storage = {
  save: async (key: string, data: any) => {
    const tableName = TABLE_MAP[key] || key;
    localStorage.setItem(key, JSON.stringify(data));

    try {
      // 如果是数组（列表），我们目前简单处理为循环保存或发送整个对象
      // 在生产环境中建议只发送变更的部分
      await fetch('/api/data', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ table: tableName, data: data })
      });
    } catch (e) {
      console.warn('D1 Sync failed:', e);
    }
  },

  load: async <T>(key: string): Promise<T | null> => {
    const tableName = TABLE_MAP[key] || key;
    
    try {
      const response = await fetch(`/api/data?table=${tableName}`);
      if (response.ok) {
        const cloudData = await response.json();
        if (cloudData) {
          // 修正坐标数据的映射格式 (从 DB 的 x, y 转回坐标对象)
          if (tableName === 'drivers' && Array.isArray(cloudData)) {
            const formatted = cloudData.map((d: any) => ({
              ...d,
              coordinates: { x: d.coord_x, y: d.coord_y }
            }));
            localStorage.setItem(key, JSON.stringify(formatted));
            return formatted as any;
          }
          localStorage.setItem(key, JSON.stringify(cloudData));
          return cloudData as T;
        }
      }
    } catch (e) {
      console.warn('Cloud load failed, using local fallback');
    }

    const localData = localStorage.getItem(key);
    return localData ? JSON.parse(localData) : null;
  },

  clear: () => {
    localStorage.clear();
  },

  getLastSync: () => localStorage.getItem('fleet_last_sync')
};
