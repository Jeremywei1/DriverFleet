
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
  // 获取显式传递的日期，否则使用服务器日期
  const date = searchParams.get('date') || new Date().toISOString().split('T')[0];

  if (!table) return new Response('Missing table param', { status: 400 });

  try {
    let result;
    if (table === 'drivers' || table === 'vehicles') {
      if (id) {
        result = await context.env.DB.prepare(`SELECT * FROM ${table} WHERE id = ?`).bind(id).first();
      } else {
        const { results } = await context.env.DB.prepare(`SELECT * FROM ${table}`).all();
        result = results;
      }
    } else {
      if (id) {
        result = await context.env.DB.prepare(`SELECT * FROM ${table} WHERE date = ? AND id = ?`).bind(date, id).first();
      } else {
        const { results } = await context.env.DB.prepare(`SELECT * FROM ${table} WHERE date = ?`).bind(date).all();
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
    
    // 统一处理：如果是数组，我们可能需要循环插入，但为了性能和简单，建议前端发送单条数据
    // 如果是数组且有多条数据，目前仅处理第一条（兼容旧代码），建议使用 syncSingle 发送单对象
    const items = Array.isArray(data) ? data : [data];
    
    if (table === 'drivers') {
      for (const item of items) {
        await context.env.DB.prepare(`
          INSERT OR REPLACE INTO drivers (id, name, gender, phone, joinDate, experience_years, isActive)
          VALUES (?, ?, ?, ?, ?, ?, ?)
        `).bind(item.id, item.name, item.gender, item.phone, item.joinDate, item.experience_years, item.isActive ? 1 : 0).run();
      }
    } else if (table === 'tasks') {
      for (const item of items) {
        await context.env.DB.prepare(`
          INSERT OR REPLACE INTO tasks (id, date, title, driverId, vehicleId, status, startTime, endTime, locationStart, locationEnd, distanceKm, priority, operation_timestamp)
          VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
        `).bind(item.id, item.date, item.title, item.driverId, item.vehicleId, item.status, item.startTime, item.endTime, item.locationStart, item.locationEnd, item.distanceKm, item.priority, opTs).run();
      }
    } else if (table === 'vehicles') {
       for (const item of items) {
         await context.env.DB.prepare(`
          INSERT OR REPLACE INTO vehicles (id, plateNumber, model, type, color, seats, age, mileage, lastService, currentDriverId, isActive)
          VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
        `).bind(item.id, item.plateNumber, item.model, item.type, item.color, item.seats, item.age, item.mileage, item.lastService, item.currentDriverId, item.isActive ? 1 : 0).run();
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
    await context.env.DB.prepare(`DELETE FROM ${table} WHERE id = ?`).bind(id).run();
    return new Response("DELETED", { status: 200 });
  } catch (e: any) {
    return new Response(JSON.stringify({ error: e.message }), { status: 500 });
  }
}
