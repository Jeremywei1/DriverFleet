
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
  mileage: number;
  lastService: string;
  isActive: boolean; // 手动控制：是否可派单/维修中
}

export interface Task {
  id: string;
  date: string;
  title: string;
  driverId: string | null;
  vehicleId: string | null;
  status: 'IN_PROGRESS' | 'COMPLETED' | 'CANCELLED';
  startTime: string;
  endTime: string;
  locationStart: string;
  locationEnd: string;
  distanceKm: number;
  priority: 'HIGH' | 'MEDIUM' | 'LOW';
  operation_timestamp: string;
}

export interface DriverStats {
  driverId: string;
  name: string;
  totalDays: number;
  totalHours: number;
  totalDistance: number;
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
