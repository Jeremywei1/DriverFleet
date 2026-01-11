
interface D1Database {
  prepare: (query: string) => {
    bind: (...values: any[]) => any;
    first: <T = any>(column?: string) => Promise<T | null>;
    all: <T = any>() => Promise<{ results: T[] }>;
    run: () => Promise<any>;
  };
}

type PagesFunction<Env = any> = (context: {
  request: Request;
  env: Env;
  params: Record<string, string | string[]>;
  waitUntil: (promise: Promise<any>) => void;
  next: (request?: Request) => Promise<Response>;
  data: Record<string, any>;
}) => Promise<Response> | Response;

interface Env {
  DB: D1Database;
}

/**
 * 弹性值清洗：确保值能被 SQL 接受
 * @param val 原始值
 * @param type 预期类型
 * @param fallback 兜底值
 */
const wash = (val: any, type: 'string' | 'number' | 'boolean', fallback: any = null) => {
  if (val === undefined || val === null || val === '') return fallback;
  if (type === 'number') {
    const n = Number(val);
    return isNaN(n) ? (Number(fallback) || 0) : n;
  }
  if (type === 'boolean') {
    return !!val ? 1 : 0;
  }
  return String(val);
};

const getNowTimestamp = () => {
  const now = new Date();
  const yyyymmdd = now.toISOString().split('T')[0].replace(/-/g, '');
  const hhmmss = now.toTimeString().split(' ')[0];
  return `${yyyymmdd} - ${hhmmss}`;
};

export const onRequestGet: PagesFunction<Env> = async (context) => {
  const { searchParams } = new URL(context.request.url);
  const table = searchParams.get('table');
  const id = searchParams.get('id');
  const date = searchParams.get('date') || new Date().toISOString().split('T')[0];

  if (!table) return new Response('Missing table param', { status: 400 });

  try {
    let result;
    const safeTable = table.toLowerCase();
    
    if (safeTable === 'drivers' || safeTable === 'vehicles') {
      if (id) {
        result = await context.env.DB.prepare(`SELECT * FROM ${safeTable} WHERE id = ?`).bind(wash(id, 'string')).first();
      } else {
        const { results } = await context.env.DB.prepare(`SELECT * FROM ${safeTable}`).all();
        result = results;
      }
    } else {
      if (id) {
        result = await context.env.DB.prepare(`SELECT * FROM ${safeTable} WHERE date = ? AND id = ?`).bind(wash(date, 'string'), wash(id, 'string')).first();
      } else {
        const { results } = await context.env.DB.prepare(`SELECT * FROM ${safeTable} WHERE date = ?`).bind(wash(date, 'string')).all();
        result = results;
      }
    }
    return new Response(JSON.stringify(result), { headers: { "Content-Type": "application/json" } });
  } catch (e: any) {
    return new Response(JSON.stringify({ error: e.message }), { status: 500 });
  }
}

export const onRequestPost: PagesFunction<Env> = async (context) => {
  try {
    const { table, data } = await context.request.json() as { table: string, data: any };
    const opTs = getNowTimestamp();
    const items = Array.isArray(data) ? data : [data];
    const safeTable = table.toLowerCase();
    
    if (safeTable === 'drivers') {
      for (const item of items) {
        await context.env.DB.prepare(`
          INSERT OR REPLACE INTO drivers (id, name, gender, phone, joinDate, experience_years, isActive)
          VALUES (?, ?, ?, ?, ?, ?, ?)
        `).bind(
          wash(item.id, 'string'),
          wash(item.name, 'string', '佚名司机'),
          wash(item.gender, 'string', 'Male'),
          wash(item.phone, 'string', ''),
          wash(item.joinDate, 'string', new Date().toISOString().split('T')[0]),
          wash(item.experience_years, 'number', 0),
          wash(item.isActive, 'boolean', 1)
        ).run();
      }
    } else if (safeTable === 'tasks') {
      for (const item of items) {
        await context.env.DB.prepare(`
          INSERT OR REPLACE INTO tasks (id, date, title, driverId, vehicleId, status, startTime, endTime, locationStart, locationEnd, distanceKm, priority, operation_timestamp)
          VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
        `).bind(
          wash(item.id, 'string'),
          wash(item.date, 'string'),
          wash(item.title, 'string', '新任务'),
          wash(item.driverId, 'string'),
          wash(item.vehicleId, 'string'),
          wash(item.status, 'string', 'IN_PROGRESS'),
          wash(item.startTime, 'string'),
          wash(item.endTime, 'string'),
          wash(item.locationStart, 'string', '未知起点'),
          wash(item.locationEnd, 'string', '未知终点'),
          wash(item.distanceKm, 'number', 0),
          wash(item.priority, 'string', 'MEDIUM'),
          opTs
        ).run();
      }
    } else if (safeTable === 'vehicles') {
       for (const item of items) {
         await context.env.DB.prepare(`
          INSERT OR REPLACE INTO vehicles (id, plateNumber, model, type, color, seats, age, mileage, lastService, currentDriverId, isActive)
          VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
        `).bind(
          wash(item.id, 'string'),
          wash(item.plateNumber, 'string', '无牌照'),
          wash(item.model, 'string', '未知车型'),
          wash(item.type, 'string', 'Sedan'),
          wash(item.color, 'string', 'White'),
          wash(item.seats, 'number', 5),
          wash(item.age, 'number', 0),
          wash(item.mileage, 'number', 0),
          wash(item.lastService, 'string', new Date().toISOString().split('T')[0]),
          wash(item.currentDriverId, 'string'),
          wash(item.isActive, 'boolean', 1)
        ).run();
       }
    }
    return new Response("OK", { status: 200 });
  } catch (e: any) {
    return new Response(JSON.stringify({ error: e.message }), { status: 500 });
  }
}

export const onRequestDelete: PagesFunction<Env> = async (context) => {
  const { searchParams } = new URL(context.request.url);
  const table = searchParams.get('table');
  const id = searchParams.get('id');
  if (!table || !id) return new Response('Invalid params', { status: 400 });
  try {
    const safeTable = table.toLowerCase();
    await context.env.DB.prepare(`DELETE FROM ${safeTable} WHERE id = ?`).bind(wash(id, 'string')).run();
    return new Response("DELETED", { status: 200 });
  } catch (e: any) {
    return new Response(JSON.stringify({ error: e.message }), { status: 500 });
  }
}
