
const STORAGE_KEYS = {
  DRIVERS: 'fleet_drivers_v3',
  VEHICLES: 'fleet_vehicles_v3',
  TASKS: 'fleet_tasks_v3',
  DRIVER_SCHEDULES: 'fleet_driver_schedules_v3',
  VEHICLE_SCHEDULES: 'fleet_vehicle_schedules_v3',
  LAST_SYNC: 'fleet_last_sync'
};

export const storage = {
  // 异步保存到 D1 和本地
  save: async (key: keyof typeof STORAGE_KEYS, data: any) => {
    const jsonString = JSON.stringify(data);
    // 1. 先存本地缓存
    localStorage.setItem(STORAGE_KEYS[key], jsonString);
    localStorage.setItem(STORAGE_KEYS.LAST_SYNC, new Date().toISOString());

    // 2. 尝试同步到 D1
    try {
      await fetch('/api/data', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ key: STORAGE_KEYS[key], value: data })
      });
    } catch (e) {
      console.warn('D1 Sync failed, using local only:', e);
    }
  },

  // 异步从 D1 加载，失败用本地
  load: async <T>(key: keyof typeof STORAGE_KEYS): Promise<T | null> => {
    // 1. 尝试从云端获取
    try {
      const response = await fetch(`/api/data?key=${STORAGE_KEYS[key]}`);
      if (response.ok) {
        const cloudData = await response.json();
        if (cloudData) {
          localStorage.setItem(STORAGE_KEYS[key], JSON.stringify(cloudData)); // 同步到本地
          return cloudData as T;
        }
      }
    } catch (e) {
      console.warn('Cloud load failed, falling back to local storage');
    }

    // 2. 回退到本地
    const localData = localStorage.getItem(STORAGE_KEYS[key]);
    if (!localData) return null;
    try {
      return JSON.parse(localData) as T;
    } catch {
      return null;
    }
  },

  clear: () => {
    Object.values(STORAGE_KEYS).forEach(key => localStorage.removeItem(key));
  },

  getLastSync: () => localStorage.getItem(STORAGE_KEYS.LAST_SYNC)
};
