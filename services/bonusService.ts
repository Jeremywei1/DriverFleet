
import { DriverStats, Task } from '../types';

export interface BonusReport {
  driverId: string;
  driverName: string;
  baseBonus: number; // 基础奖金 (按订单数)
  efficiencyBonus: number; // 效率奖金 (按评分)
  totalBonus: number;
}

export const calculateBonus = (stats: DriverStats): BonusReport => {
  // 模拟逻辑：每单 5 元奖励，如果效率分 > 90 再加 100 元
  const baseBonus = stats.completedOrders * 5;
  const efficiencyBonus = stats.efficiencyScore > 90 ? 100 : 0;
  
  return {
    driverId: stats.driverId,
    driverName: stats.name,
    baseBonus,
    efficiencyBonus,
    totalBonus: baseBonus + efficiencyBonus
  };
};
