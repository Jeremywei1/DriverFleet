
import { Driver, Vehicle, Task, DriverSchedule, VehicleSchedule } from '../types';

const STORAGE_KEYS = {
  DRIVERS: 'fleet_drivers_v2', // 使用 v2 键名避免与可能损坏的旧数据冲突
  VEHICLES: 'fleet_vehicles_v2',
  TASKS: 'fleet_tasks_v2',
  DRIVER_SCHEDULES: 'fleet_driver_schedules_v2',
  VEHICLE_SCHEDULES: 'fleet_vehicle_schedules_v2',
  LAST_SYNC: 'fleet_last_sync'
};

export const storage = {
  save: (key: keyof typeof STORAGE_KEYS, data: any) => {
    try {
      if (!data) return;
      localStorage.setItem(STORAGE_KEYS[key], JSON.stringify(data));
      localStorage.setItem(STORAGE_KEYS.LAST_SYNC, new Date().toISOString());
    } catch (e) {
      console.warn('Storage Save Warning:', e);
    }
  },

  load: <T>(key: keyof typeof STORAGE_KEYS): T | null => {
    try {
      const data = localStorage.getItem(STORAGE_KEYS[key]);
      if (!data) return null;
      
      const parsed = JSON.parse(data);
      // 基础验证：如果是数组，确保它不为空且格式大致正确
      if (Array.isArray(parsed) && parsed.length === 0) return null;
      
      return parsed as T;
    } catch (e) {
      console.error('Storage Load Error, clearing corrupted data:', e);
      localStorage.removeItem(STORAGE_KEYS[key]);
      return null;
    }
  },

  clear: () => {
    try {
      Object.values(STORAGE_KEYS).forEach(key => localStorage.removeItem(key));
    } catch (e) {
      console.error('Storage Clear Error:', e);
    }
  },

  getLastSync: () => {
    try {
      return localStorage.getItem(STORAGE_KEYS.LAST_SYNC);
    } catch {
      return null;
    }
  }
};
