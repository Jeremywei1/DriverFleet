
export enum DriverStatus {
  FREE = 'FREE',
  BUSY = 'BUSY',
  BREAK = 'BREAK',
  OFF_DUTY = 'OFF_DUTY'
}

export interface Driver {
  id: string;
  name: string;
  gender: 'Male' | 'Female';
  phone: string;
  joinDate: string;
  experience_years: number;
  isActive: boolean; // 手动控制：是否在职/可用
  // Added properties to fix LiveMap.tsx compilation errors
  currentStatus: DriverStatus;
  coordinates: { x: number; y: number };
  avatar: string;
  rating: number;
}

export interface Vehicle {
  id: string;
  plateNumber: string;
  model: string;
  type: 'Sedan' | 'Van' | 'Truck';
  color: string;
  seats: number;
  age: number;
  currentDriverId: string | null;
  mileage: number; // 车辆本身的行驶里程保留，作为资产维护依据
  lastService: string;
  isActive: boolean; // 手动控制：是否可派单/维修中
}

export interface Task {
  id: string;
  date: string;
  title: string;
  driverId: string | null;
  driverName?: string; // 冗余存储司机姓名
  vehicleId: string | null;
  vehiclePlate?: string; // 冗余存储车牌
  
  // V3.0 资产战略快照 (关键！)
  vehicleType?: 'Sedan' | 'Van' | 'Truck'; // 记录当时车型
  vehicleSeats?: number; // 记录当时座位数
  
  status: 'IN_PROGRESS' | 'COMPLETED' | 'CANCELLED';
  startTime: string;
  endTime: string;
  locationStart: string;
  locationEnd: string;
  // distanceKm Removed
  priority: 'HIGH' | 'MEDIUM' | 'LOW';
  operation_timestamp: string;
  notes?: string; 
  
  // V2.0 经营性字段
  taskType?: 'PASSENGER' | 'CARGO' | 'MAINTENANCE'; 
  score?: number; 
}

export interface DriverStats {
  driverId: string;
  name: string;
  totalDays: number;
  totalHours: number;
  // totalDistance Removed
  completedOrders: number;
  efficiencyScore: number;
}

export interface DriverSchedule {
  driverId: string;
  date: string;
  slots: {
    hour: number;
    status: DriverStatus;
  }[];
}

export interface VehicleSchedule {
  vehicleId: string;
  date: string;
  slots: {
    hour: number;
    isAvailable: boolean;
  }[];
}
