// Added missing Cloudflare Pages and D1 type definitions
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

export const onRequestGet: PagesFunction<Env> = async (context) => {
  const { searchParams } = new URL(context.request.url);
  const table = searchParams.get('table');
  const id = searchParams.get('id');

  if (!table) return new Response('Missing table param', { status: 400 });

  try {
    let result;
    if (id) {
      // 查询单条数据
      result = await context.env.DB.prepare(`SELECT * FROM ${table} WHERE id = ?`).bind(id).first();
    } else {
      // 查询整表
      const { results } = await context.env.DB.prepare(`SELECT * FROM ${table}`).all();
      result = results;
    }
    
    return new Response(JSON.stringify(result), {
      headers: { "Content-Type": "application/json" }
    });
  } catch (e: any) {
    return new Response(JSON.stringify({ error: e.message }), { status: 500 });
  }
}

export const onRequestPost: PagesFunction<Env> = async (context) => {
  try {
    const { table, data } = await context.request.json() as { table: string, data: any };
    
    if (table === 'drivers') {
      await context.env.DB.prepare(`
        INSERT OR REPLACE INTO drivers (id, name, avatar, rating, currentStatus, phone, joinDate, coord_x, coord_y)
        VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?)
      `).bind(data.id, data.name, data.avatar, data.rating, data.currentStatus, data.phone, data.joinDate, data.coordinates.x, data.coordinates.y).run();
    } else if (table === 'vehicles') {
      await context.env.DB.prepare(`
        INSERT OR REPLACE INTO vehicles (id, plateNumber, model, type, status, currentDriverId, mileage, lastService)
        VALUES (?, ?, ?, ?, ?, ?, ?, ?)
      `).bind(data.id, data.plateNumber, data.model, data.type, data.status, data.currentDriverId, data.mileage, data.lastService).run();
    } else if (table === 'tasks') {
      await context.env.DB.prepare(`
        INSERT OR REPLACE INTO tasks (id, title, driverId, vehicleId, status, startTime, endTime, locationStart, locationEnd, distanceKm, priority)
        VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
      `).bind(data.id, data.title, data.driverId, data.vehicleId, data.status, data.startTime, data.endTime, data.locationStart, data.locationEnd, data.distanceKm, data.priority).run();
    } else {
      // 处理排班等其他 key-value 或 简单 JSON 存储
      await context.env.DB.prepare(`
        INSERT OR REPLACE INTO app_data (key, value) VALUES (?, ?)
      `).bind(table, JSON.stringify(data)).run();
    }

    return new Response("OK", { status: 200 });
  } catch (e: any) {
    return new Response(JSON.stringify({ error: e.message }), { status: 500 });
  }
}