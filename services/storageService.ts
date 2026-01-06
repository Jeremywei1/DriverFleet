
import { Driver, Vehicle, Task, DriverSchedule, VehicleSchedule } from '../types';

const STORAGE_KEYS = {
  DRIVERS: 'fleet_drivers',
  VEHICLES: 'fleet_vehicles',
  TASKS: 'fleet_tasks',
  DRIVER_SCHEDULES: 'fleet_driver_schedules',
  VEHICLE_SCHEDULES: 'fleet_vehicle_schedules',
  LAST_SYNC: 'fleet_last_sync'
};

export const storage = {
  save: (key: keyof typeof STORAGE_KEYS, data: any) => {
    try {
      localStorage.setItem(STORAGE_KEYS[key], JSON.stringify(data));
      localStorage.setItem(STORAGE_KEYS.LAST_SYNC, new Date().toISOString());
    } catch (e) {
      console.error('Storage Save Error:', e);
    }
  },

  load: <T>(key: keyof typeof STORAGE_KEYS): T | null => {
    try {
      const data = localStorage.getItem(STORAGE_KEYS[key]);
      return data ? JSON.parse(data) as T : null;
    } catch (e) {
      console.error('Storage Load Error:', e);
      return null;
    }
  },

  clear: () => {
    Object.values(STORAGE_KEYS).forEach(key => localStorage.removeItem(key));
  },

  getLastSync: () => localStorage.getItem(STORAGE_KEYS.LAST_SYNC)
};
