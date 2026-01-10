
import { Driver, DriverSchedule, DriverStatus, Task, DriverStats, Vehicle, VehicleSchedule } from '../types';

const DRIVER_NAMES = ["张师傅", "李大爷", "小王", "刘哥", "陈姐", "阿强", "赵叔", "大伟"];
const VEHICLE_TYPES = ['Sedan', 'Van', 'Truck'] as const;

export const generateDrivers = (): Driver[] => {
  return DRIVER_NAMES.map((name, index) => ({
    id: `d-${index}`,
    name,
    gender: index % 4 === 0 ? 'Female' : 'Male',
    phone: `138${Math.floor(10000000 + Math.random() * 90000000)}`,
    joinDate: '2023-01-12',
    experience_years: 5 + index,
    isActive: true,
    // Fixed: Added mandatory properties for the updated Driver interface used in LiveMap
    currentStatus: DriverStatus.FREE,
    coordinates: { x: 15 + Math.random() * 70, y: 15 + Math.random() * 70 },
    avatar: `https://i.pravatar.cc/150?u=driver-${index}`,
    rating: 4.5 + Math.random() * 0.5
  }));
};

export const generateVehicles = (drivers: Driver[]): Vehicle[] => {
  return Array.from({ length: 10 }, (_, index) => {
    const type = VEHICLE_TYPES[index % VEHICLE_TYPES.length];
    return {
      id: `v-${index}`,
      plateNumber: `京A·${Math.floor(10000 + Math.random() * 90000)}`,
      model: index % 2 === 0 ? "丰田 凯美瑞" : "别克 GL8",
      type,
      color: 'White',
      seats: type === 'Van' ? 7 : 5,
      age: 2,
      currentDriverId: null,
      mileage: 20000,
      lastService: '2024-02-15',
      isActive: true
    };
  });
};

export const generateSchedule = (drivers: Driver[], date: string): DriverSchedule[] => {
  return drivers.map(driver => ({
    driverId: driver.id,
    date,
    slots: Array.from({ length: 48 }, (_, i) => ({
      hour: i / 2,
      status: DriverStatus.FREE
    }))
  }));
};

export const generateVehicleSchedule = (vehicles: Vehicle[], date: string): VehicleSchedule[] => {
  return vehicles.map(v => ({
    vehicleId: v.id,
    date,
    slots: Array.from({ length: 48 }, (_, i) => ({
      hour: i / 2,
      isAvailable: v.isActive
    }))
  }));
};

export const generateTasks = (drivers: Driver[], vehicles: Vehicle[], date: string): Task[] => []; 

export const generateStats = (drivers: Driver[]): DriverStats[] => {
  return drivers.map(d => ({
    driverId: d.id,
    name: d.name,
    totalDays: 20,
    totalHours: 160,
    totalDistance: 2500,
    completedOrders: 45,
    efficiencyScore: 92
  }));
};
