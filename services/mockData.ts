
import { Driver, DriverSchedule, DriverStatus, Task, DriverStats, Vehicle, VehicleStatus, VehicleSchedule } from '../types';

const DRIVER_NAMES = [
  "张师傅", "李大爷", "小王", "刘哥", 
  "陈姐", "阿强", "赵叔", "大伟"
];

const LOCATIONS = [
  "T3 航站楼", "市中心", "科技园", "火车站", 
  "国际酒店", "万达广场", "城北新区", "南湾码头"
];

const VEHICLE_TYPES = ['Sedan', 'Van', 'Truck'] as const;
const VEHICLE_MODELS = {
  Sedan: ["丰田 凯美瑞", "本田 雅阁", "大众 帕萨特"],
  Van: ["别克 GL8", "丰田 赛那", "本田 艾力绅"],
  Truck: ["福田 奥铃", "五十铃 翼放", "江淮 帅铃"]
};

export const generateDrivers = (): Driver[] => {
  return DRIVER_NAMES.map((name, index) => ({
    id: `d-${index}`,
    name,
    avatar: `https://api.dicebear.com/7.x/avataaars/svg?seed=${name}`,
    rating: 4.5 + Math.random() * 0.5,
    currentStatus: DriverStatus.FREE,
    coordinates: {
      x: 10 + Math.random() * 80,
      y: 10 + Math.random() * 80
    },
    phone: `138${Math.floor(10000000 + Math.random() * 90000000)}`,
    joinDate: '2023-01-12'
  }));
};

export const generateVehicles = (drivers: Driver[]): Vehicle[] => {
  return Array.from({ length: 10 }, (_, index) => {
    const type = VEHICLE_TYPES[index % VEHICLE_TYPES.length];
    return {
      id: `v-${index}`,
      plateNumber: `京A·${Math.floor(10000 + Math.random() * 90000)}`,
      model: VEHICLE_MODELS[type][Math.floor(Math.random() * 3)],
      type,
      status: VehicleStatus.ACTIVE,
      currentDriverId: null,
      mileage: 5000 + Math.floor(Math.random() * 50000),
      lastService: '2024-02-15'
    };
  });
};

export const generateSchedule = (drivers: Driver[], date: string): DriverSchedule[] => {
  return drivers.map(driver => ({
    driverId: driver.id,
    date,
    slots: Array.from({ length: 24 }, (_, i) => ({
      hour: i,
      // 移除原有的 8点-20点限制，默认全天候可调度
      status: DriverStatus.FREE
    }))
  }));
};

export const generateVehicleSchedule = (vehicles: Vehicle[], date: string): VehicleSchedule[] => {
  return vehicles.map(v => ({
    vehicleId: v.id,
    date,
    slots: Array.from({ length: 24 }, (_, i) => ({
      hour: i,
      isAvailable: v.status === VehicleStatus.ACTIVE
    }))
  }));
};

export const generateTasks = (drivers: Driver[], vehicles: Vehicle[], date: string): Task[] => {
  return []; // 初始任务为空，由用户在匹配中心创建
};

export const generateStats = (drivers: Driver[]): DriverStats[] => {
  return drivers.map(d => ({
    driverId: d.id,
    name: d.name,
    totalDays: 20 + Math.floor(Math.random() * 5),
    totalHours: 160 + Math.floor(Math.random() * 40),
    totalDistance: 2000 + Math.floor(Math.random() * 1000),
    completedOrders: 40 + Math.floor(Math.random() * 30),
    efficiencyScore: 85 + Math.floor(Math.random() * 15)
  }));
};
