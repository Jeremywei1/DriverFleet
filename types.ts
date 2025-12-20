
export enum DriverStatus {
  FREE = 'FREE',
  BUSY = 'BUSY',
  BREAK = 'BREAK',
  OFF_DUTY = 'OFF_DUTY'
}

export enum VehicleStatus {
  ACTIVE = 'ACTIVE',
  MAINTENANCE = 'MAINTENANCE',
  OUT_OF_SERVICE = 'OUT_OF_SERVICE'
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
  phone?: string;
  joinDate: string;
}

export interface Vehicle {
  id: string;
  plateNumber: string;
  model: string;
  type: 'Sedan' | 'Van' | 'Truck';
  status: VehicleStatus;
  currentDriverId: string | null;
  mileage: number;
  lastService: string;
}

// Fixed: Corrected status type to DriverStatus as TimeSlot is specifically used for driver schedules
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

export interface VehicleSchedule {
  vehicleId: string;
  date: string;
  slots: { hour: number; isAvailable: boolean; taskId?: string }[];
}

export interface Task {
  id: string;
  title: string;
  driverId: string | null;
  vehicleId: string | null;
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