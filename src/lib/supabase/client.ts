// Lightweight PostgREST-compatible Supabase Client for Vite & Node environments

const getEnv = (key: string): string => {
  try {
    if (typeof import.meta !== "undefined" && import.meta.env && import.meta.env[key]) {
      return String(import.meta.env[key]);
    }
  } catch {
    // ignore
  }
  try {
    if (typeof process !== "undefined" && process.env && process.env[key]) {
      return String(process.env[key]);
    }
  } catch {
    // ignore
  }
  return "";
};

const DEFAULT_SUPABASE_URL = "https://sfcczrhorpxctukbikkf.supabase.co";
const DEFAULT_SUPABASE_ANON_KEY = "sb_publishable_cfpEMGgbM4OB_21Pawloqg_GPVo8NL2";

const supabaseUrl =
  getEnv("VITE_SUPABASE_URL") ||
  getEnv("NEXT_PUBLIC_SUPABASE_URL") ||
  DEFAULT_SUPABASE_URL;

const supabaseKey =
  getEnv("VITE_SUPABASE_ANON_KEY") ||
  getEnv("VITE_SUPABASE_PUBLISHABLE_KEY") ||
  getEnv("NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY") ||
  getEnv("NEXT_PUBLIC_SUPABASE_ANON_KEY") ||
  DEFAULT_SUPABASE_ANON_KEY;

export const isSupabaseConfigured = (): boolean => {
  return (
    Boolean(supabaseUrl) &&
    Boolean(supabaseKey) &&
    !supabaseUrl.includes("placeholder-auriclens") &&
    !supabaseUrl.includes("your-project-ref") &&
    supabaseUrl.startsWith("http")
  );
};

class PostgrestQueryBuilder {
  private url: URL;
  private headers: Record<string, string>;
  private method: string = "GET";
  private bodyData: unknown = null;
  private isSingle: boolean = false;
  private isHead: boolean = false;
  private wantsRepresentation: boolean = false;

  constructor(baseUrl: string, apiKey: string, table: string) {
    this.url = new URL(`${baseUrl.replace(/\/$/, "")}/rest/v1/${table}`);
    this.headers = {
      apikey: apiKey,
      Authorization: `Bearer ${apiKey}`,
      "Content-Type": "application/json",
    };
  }

  select(columns: string = "*", options?: { count?: "exact"; head?: boolean }) {
    this.url.searchParams.set("select", columns);
    if (options?.count) {
      this.headers["Prefer"] = `count=${options.count}`;
    }
    if (options?.head) {
      this.isHead = true;
      this.method = "HEAD";
    } else if (this.method === "POST" || this.method === "PATCH") {
      this.wantsRepresentation = true;
      const existing = this.headers["Prefer"] || "";
      if (existing.includes("resolution=merge-duplicates")) {
        this.headers["Prefer"] = "resolution=merge-duplicates,return=representation";
      } else {
        this.headers["Prefer"] = "return=representation";
      }
    }
    return this;
  }

  order(column: string, options?: { ascending?: boolean }) {
    const dir = options?.ascending === false ? "desc" : "asc";
    this.url.searchParams.set("order", `${column}.${dir}`);
    return this;
  }

  eq(column: string, value: string | number | boolean) {
    this.url.searchParams.set(column, `eq.${value}`);
    return this;
  }

  neq(column: string, value: string | number | boolean) {
    this.url.searchParams.set(column, `neq.${value}`);
    return this;
  }

  gte(column: string, value: string | number) {
    this.url.searchParams.set(column, `gte.${value}`);
    return this;
  }

  lte(column: string, value: string | number) {
    this.url.searchParams.set(column, `lte.${value}`);
    return this;
  }

  limit(count: number) {
    this.url.searchParams.set("limit", String(count));
    return this;
  }

  single() {
    this.isSingle = true;
    this.headers["Accept"] = "application/vnd.pgrst.object+json";
    return this;
  }

  insert(values: unknown) {
    this.method = "POST";
    this.bodyData = values;
    this.headers["Prefer"] = "return=minimal";
    return this;
  }

  update(values: unknown) {
    this.method = "PATCH";
    this.bodyData = values;
    this.headers["Prefer"] = "return=minimal";
    return this;
  }

  delete() {
    this.method = "DELETE";
    return this;
  }

  upsert(values: unknown, options?: { onConflict?: string }) {
    this.method = "POST";
    this.bodyData = values;
    this.headers["Prefer"] = "resolution=merge-duplicates,return=minimal";
    if (options?.onConflict) {
      this.url.searchParams.set("on_conflict", options.onConflict);
    }
    return this;
  }

  async then<TResult1 = { data: any; error: any; count?: number | null }, TResult2 = never>(
    onfulfilled?: ((value: { data: any; error: any; count?: number | null }) => TResult1 | PromiseLike<TResult1>) | null,
    onrejected?: ((reason: any) => TResult2 | PromiseLike<TResult2>) | null
  ): Promise<TResult1 | TResult2> {
    try {
      const response = await fetch(this.url.toString(), {
        method: this.method,
        headers: this.headers,
        body: this.bodyData ? JSON.stringify(this.bodyData) : undefined,
      });

      let count: number | null = null;
      const contentRange = response.headers.get("content-range");
      if (contentRange && contentRange.includes("/")) {
        const totalStr = contentRange.split("/")[1];
        if (totalStr && totalStr !== "*") {
          count = parseInt(totalStr, 10);
        }
      }

      if (!response.ok) {
        const errText = await response.text().catch(() => response.statusText);
        const result = { data: null, error: { message: errText || `HTTP ${response.status}` }, count };
        return onfulfilled ? onfulfilled(result) : (result as unknown as TResult1);
      }

      if (
        this.isHead ||
        response.status === 204 ||
        ((this.method === "POST" || this.method === "PATCH" || this.method === "DELETE") && !this.wantsRepresentation)
      ) {
        const result = { data: this.isSingle ? null : [], error: null, count };
        return onfulfilled ? onfulfilled(result) : (result as unknown as TResult1);
      }

      const data = await response.json();
      const result = { data, error: null, count };
      return onfulfilled ? onfulfilled(result) : (result as unknown as TResult1);
    } catch (err: any) {
      const result = { data: null, error: { message: err?.message || String(err) }, count: null };
      return onfulfilled ? onfulfilled(result) : (result as unknown as TResult1);
    }
  }
}

export interface SupabaseClient {
  from: (table: string) => PostgrestQueryBuilder;
}

let clientInstance: SupabaseClient | null = null;

export const getSupabaseClient = (): SupabaseClient | null => {
  if (!isSupabaseConfigured()) {
    return null;
  }

  if (!clientInstance) {
    clientInstance = {
      from: (table: string) => new PostgrestQueryBuilder(supabaseUrl, supabaseKey, table),
    };
  }

  return clientInstance;
};

export const getSupabaseConfig = () => {
  return {
    url: supabaseUrl || "Not Configured",
    hasKey: Boolean(supabaseKey) && !supabaseKey.includes("placeholder"),
    isConfigured: isSupabaseConfigured(),
  };
};
