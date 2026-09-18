import { config } from "@/config/index.js";

export class RestError extends Error {
  constructor(
    message: string,
    public readonly status: number,
    /** Machine-readable code from the API, e.g. FORBIDDEN or VALIDATION_ERROR. */
    public readonly code?: string,
    public readonly details?: unknown,
  ) {
    super(message);
    this.name = "RestError";
  }
}

export async function callRest<T = unknown>(
  restToken: string,
  method: "GET" | "POST",
  path: string,
  body?: unknown,
): Promise<T> {
  const url = `${config.REST_RESOURCE_URL}${path}`;
  const res = await fetch(url, {
    method,
    headers: {
      Authorization: `Bearer ${restToken}`,
      ...(body != null ? { "Content-Type": "application/json" } : {}),
    },
    ...(body != null ? { body: JSON.stringify(body) } : {}),
  });

  const json = (await res.json()) as {
    success: boolean;
    data?: T;
    error?: { code?: string; message: string; details?: unknown };
  };

  if (!res.ok || !json.success) {
    // Carried through in full so an MCP client sees the same reason a REST
    // caller would, rather than a flattened "request failed".
    throw new RestError(
      json.error?.message ?? `HTTP ${res.status}`,
      res.status,
      json.error?.code,
      json.error?.details,
    );
  }

  return json.data as T;
}
