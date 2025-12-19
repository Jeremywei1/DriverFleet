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
  // New fields for Live Map
  currentStatus: DriverStatus;
  coordinates: {
    x: number; // 0-100 percentage for demo map
    y: number; // 0-100 percentage for demo map
  };
  vehicleType: 'Sedan' | 'Van' | 'Truck';
  plateNumber: string;
}

// Represents one hour slot for a driver
export interface TimeSlot {
  hour: number; // 0-23
  status: DriverStatus;
  taskId?: string; // If busy, linked to a task
}

export interface DriverSchedule {
  driverId: string;
  date: string; // YYYY-MM-DD
  slots: TimeSlot[];
}

export interface Task {
  id: string;
  title: string;
  driverId: string | null;
  status: 'PENDING' | 'IN_PROGRESS' | 'COMPLETED' | 'CANCELLED';
  startTime: string; // ISO string
  endTime: string; // ISO string
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
  efficiencyScore: number; // 0-100
}