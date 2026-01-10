
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
  const date = searchParams.get('date') || new Date().toISOString().split('T')[0];

  if (!table) return new Response('Missing table param', { status: 400 });

  try {
    let result;
    if (id) {
      // 增加 date 分区查询逻辑
      result = await context.env.DB.prepare(`SELECT * FROM ${table} WHERE date = ? AND id = ?`).bind(date, id).first();
    } else {
      // 查询当日分区数据
      const { results } = await context.env.DB.prepare(`SELECT * FROM ${table} WHERE date = ?`).bind(date).all();
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
    const date = data.date || new Date().toISOString().split('T')[0];
    
    if (table === 'drivers') {
      await context.env.DB.prepare(`
        INSERT OR REPLACE INTO drivers (date, id, name, avatar, rating, currentStatus, phone, joinDate, coord_x, coord_y)
        VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
      `).bind(date, data.id, data.name, data.avatar, data.rating, data.currentStatus, data.phone, data.joinDate, data.coordinates.x, data.coordinates.y).run();
    } else if (table === 'vehicles') {
      await context.env.DB.prepare(`
        INSERT OR REPLACE INTO vehicles (id, plateNumber, model, type, status, currentDriverId, mileage, lastService)
        VALUES (?, ?, ?, ?, ?, ?, ?, ?)
      `).bind(data.id, data.plateNumber, data.model, data.type, data.status, data.currentDriverId, data.mileage, data.lastService).run();
    } else if (table === 'tasks') {
      await context.env.DB.prepare(`
        INSERT OR REPLACE INTO tasks (date, id, title, driverId, vehicleId, status, startTime, endTime, locationStart, locationEnd, distanceKm, priority)
        VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
      `).bind(date, data.id, data.title, data.driverId, data.vehicleId, data.status, data.startTime, data.endTime, data.locationStart, data.locationEnd, data.distanceKm, data.priority).run();
    } else {
      await context.env.DB.prepare(`
        INSERT OR REPLACE INTO app_data (key, value) VALUES (?, ?)
      `).bind(table, JSON.stringify(data)).run();
    }

    return new Response("OK", { status: 200 });
  } catch (e: any) {
    return new Response(JSON.stringify({ error: e.message }), { status: 500 });
  }
}
