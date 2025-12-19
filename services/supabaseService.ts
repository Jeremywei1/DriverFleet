
import { createClient } from '@supabase/supabase-js';
import { Driver, DriverStats, Task } from '../types';

// 注意：在实际生产环境中，这些值应从 Supabase 控制台获取
// 这里我们假设它们存在于环境变量中
const supabaseUrl = process.env.SUPABASE_URL || 'https://your-project.supabase.co';
const supabaseKey = process.env.SUPABASE_ANON_KEY || 'your-anon-key';

export const supabase = createClient(supabaseUrl, supabaseKey);

export interface SyncResult {
  success: boolean;
  message: string;
  timestamp: string;
}

export const syncDailyData = async (
  date: string,
  drivers: Driver[],
  stats: DriverStats[],
  tasks: Task[]
): Promise<SyncResult> => {
  try {
    // 1. 模拟同步司机基础信息
    const { error: dError } = await supabase
      .from('drivers')
      .upsert(drivers.map(d => ({ 
        id: d.id, 
        name: d.name, 
        vehicle_type: d.vehicleType,
        plate_number: d.plateNumber
      })));

    if (dError) throw dError;

    // 2. 模拟同步每日统计
    const { error: sError } = await supabase
      .from('daily_stats')
      .upsert(stats.map(s => ({
        driver_id: s.driverId,
        date: date,
        orders: s.completedOrders,
        distance: s.totalDistance,
        efficiency: s.efficiencyScore
      })));

    if (sError) throw sError;

    // 3. 记录同步日志
    await supabase.from('sync_logs').insert({
      sync_date: date,
      status: 'SUCCESS',
      record_count: tasks.length
    });

    return {
      success: true,
      message: `日期 ${date} 的数据已成功同步。`,
      timestamp: new Date().toLocaleTimeString()
    };
  } catch (err: any) {
    console.error('Supabase Sync Error:', err);
    return {
      success: false,
      message: err.message || '连接 Supabase 失败，请检查配置。',
      timestamp: new Date().toLocaleTimeString()
    };
  }
};