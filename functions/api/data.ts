
// Locally define Cloudflare types as they are missing from the global type scope in this environment
interface D1Database {
  prepare(query: string): {
    bind(...args: any[]): {
      first<T = any>(): Promise<T | null>;
      run(): Promise<any>;
    };
  };
}

type PagesFunction<E = any> = (context: {
  request: Request;
  env: E;
  params: Record<string, string>;
}) => Promise<Response>;

interface Env {
  DB: D1Database;
}

export const onRequestGet: PagesFunction<Env> = async (context) => {
  const { searchParams } = new URL(context.request.url);
  const key = searchParams.get('key');

  if (!key) {
    return new Response('Missing key', { status: 400 });
  }

  try {
    // Fixed: The first() method now accepts the type argument correctly thanks to the local D1Database interface
    const result = await context.env.DB.prepare(
      "SELECT value FROM app_data WHERE key = ?"
    ).bind(key).first<{ value: string }>();

    return new Response(result?.value || "null", {
      headers: { "Content-Type": "application/json" }
    });
  } catch (e: any) {
    return new Response(JSON.stringify({ error: e.message }), { status: 500 });
  }
}

export const onRequestPost: PagesFunction<Env> = async (context) => {
  try {
    const { key, value } = await context.request.json() as { key: string, value: any };
    
    await context.env.DB.prepare(
      "INSERT OR REPLACE INTO app_data (key, value, updated_at) VALUES (?, ?, CURRENT_TIMESTAMP)"
    ).bind(key, JSON.stringify(value)).run();

    return new Response("OK", { status: 200 });
  } catch (e: any) {
    return new Response(JSON.stringify({ error: e.message }), { status: 500 });
  }
}
