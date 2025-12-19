
import { Driver, DriverSchedule, DriverStatus, Task, DriverStats, Vehicle, VehicleStatus } from '../types';

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
  return DRIVER_NAMES.map((name, index) => {
    const rand = Math.random();
    let currentStatus = DriverStatus.FREE;
    if (rand > 0.6) currentStatus = DriverStatus.BUSY;
    else if (rand > 0.9) currentStatus = DriverStatus.BREAK;

    return {
      id: `d-${index}`,
      name,
      avatar: `https://api.dicebear.com/7.x/avataaars/svg?seed=${name}`,
      rating: 4.5 + Math.random() * 0.5,
      currentStatus,
      coordinates: {
        x: 10 + Math.random() * 80,
        y: 10 + Math.random() * 80
      },
      phone: `138${Math.floor(10000000 + Math.random() * 90000000)}`,
      joinDate: '2023-01-12'
    };
  });
};

export const generateVehicles = (drivers: Driver[]): Vehicle[] => {
  // 车辆独立生成，可能暂时没有分配司机
  return Array.from({ length: 12 }, (_, index) => {
    const type = VEHICLE_TYPES[index % VEHICLE_TYPES.length];
    return {
      id: `v-${index}`,
      plateNumber: `京A·${Math.floor(10000 + Math.random() * 90000)}`,
      model: VEHICLE_MODELS[type][Math.floor(Math.random() * 3)],
      type,
      status: Math.random() > 0.8 ? VehicleStatus.MAINTENANCE : VehicleStatus.ACTIVE,
      currentDriverId: index < drivers.length ? drivers[index].id : null,
      mileage: 5000 + Math.floor(Math.random() * 50000),
      lastService: '2024-02-15'
    };
  });
};

export const generateSchedule = (drivers: Driver[], date: string): DriverSchedule[] => {
  return drivers.map(driver => {
    const slots = Array.from({ length: 24 }, (_, i) => {
      const rand = Math.random();
      let status = DriverStatus.FREE;
      if (i < 6 || i > 22) status = DriverStatus.OFF_DUTY;
      else if (rand > 0.7) status = DriverStatus.BUSY;
      else if (rand > 0.9) status = DriverStatus.BREAK;
      
      return {
        hour: i,
        status,
        taskId: status === DriverStatus.BUSY ? `t-${driver.id}-${i}` : undefined
      };
    });

    return {
      driverId: driver.id,
      date,
      slots
    };
  });
};

export const generateTasks = (drivers: Driver[], date: string): Task[] => {
  const tasks: Task[] = [];
  const numTasks = 15 + Math.floor(Math.random() * 10);

  for (let i = 0; i < numTasks; i++) {
    const driver = drivers[Math.floor(Math.random() * drivers.length)];
    const startHour = 8 + Math.floor(Math.random() * 12);
    
    tasks.push({
      id: `task-${i}`,
      title: `专车接送服务 #${1000 + i}`,
      driverId: driver.id,
      status: Math.random() > 0.5 ? 'COMPLETED' : 'IN_PROGRESS',
      startTime: `${date}T${startHour.toString().padStart(2, '0')}:00:00`,
      endTime: `${date}T${(startHour + 1 + Math.floor(Math.random() * 2)).toString().padStart(2, '0')}:00:00`,
      locationStart: LOCATIONS[Math.floor(Math.random() * LOCATIONS.length)],
      locationEnd: LOCATIONS[Math.floor(Math.random() * LOCATIONS.length)],
      distanceKm: 10 + Math.floor(Math.random() * 50),
      priority: Math.random() > 0.7 ? 'HIGH' : 'MEDIUM'
    });
  }
  return tasks;
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
