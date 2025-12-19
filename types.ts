
export enum DriverStatus {
  FREE = 'FREE',
  BUSY = 'BUSY',
  BREAK = 'BREAK',
  OFF_DUTY = 'OFF_DUTY'
}

export interface Driver {
  id: string;
  name: string;
  avatar: string;
  rating: number;
  currentStatus: DriverStatus;
  coordinates: {
    x: number;
    y: number;
  };
  vehicleType: 'Sedan' | 'Van' | 'Truck';
  plateNumber: string;
}

export interface TimeSlot {
  hour: number;
  status: DriverStatus;
  taskId?: string;
}

export interface DriverSchedule {
  driverId: string;
  date: string;
  slots: TimeSlot[];
}

export interface Task {
  id: string;
  title: string;
  driverId: string | null;
  status: 'PENDING' | 'IN_PROGRESS' | 'COMPLETED' | 'CANCELLED';
  startTime: string;
  endTime: string;
  locationStart: string;
  locationEnd: string;
  distanceKm: number;
  priority: 'HIGH' | 'MEDIUM' | 'LOW';
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

export interface SyncLog {
  id: string;
  date: string;
  status: 'SUCCESS' | 'FAILED' | 'PENDING';
  timestamp: string;
  details: string;
}