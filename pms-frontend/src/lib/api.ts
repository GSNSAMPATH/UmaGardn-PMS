// src/lib/api.ts
export const API_BASE_URL =
  process.env.NEXT_PUBLIC_API_URL ?? "http://187.127.113.203:5122";

type Params = Record<string, string | number | boolean | null | undefined>;

export type ApiOptions = Omit<RequestInit, "headers"> & {
  params?: Params;
  headers?: HeadersInit;
};

function handleUnauthorized() {
  if (typeof window === "undefined") return;

  try {
    const Cookies = require("js-cookie");

    Cookies.remove("token");
    Cookies.remove("refreshToken");
  } catch {}

    const confirmed = window.confirm(
    "Your session has expired. Click OK to login again."
  );

  if (!confirmed) return;

  localStorage.clear();
  window.location.href = "/login";
}

function buildUrl(path: string, params?: Params) {
  const base = API_BASE_URL.replace(/\/$/, "");
  const cleanPath = path.startsWith("/") ? path : `/${path}`;
  const url = new URL(base + cleanPath);

  if (params) {
    for (const [k, v] of Object.entries(params)) {
      if (v === undefined || v === null) continue;
      url.searchParams.set(k, String(v));
    }
  }

  return url.toString();
}

// ✅ use this for images/files from backend
export function assetUrl(path?: string | null) {
  if (!path) return "";
  if (/^https?:\/\//i.test(path)) return path;
  const base = API_BASE_URL.replace(/\/$/, "");
  const clean = path.startsWith("/") ? path : `/${path}`;
  return base + clean;
}

async function readBody(res: Response) {
  const text = await res.text();
  try {
    return text ? JSON.parse(text) : null;
  } catch {
    return text;
  }
}

function getTokenFromCookie(): string | null {
  if (typeof window === "undefined") return null;
  try {
    // eslint-disable-next-line @typescript-eslint/no-var-requires
    const Cookies = require("js-cookie");
    return Cookies.get("token") ?? null;
  } catch {
    return null;
  }
}

function toHeaders(input?: HeadersInit) {
  const h = new Headers();

  if (!input) return h;

  if (input instanceof Headers) {
    input.forEach((v, k) => h.set(k, v));
    return h;
  }

  if (Array.isArray(input)) {
    input.forEach(([k, v]) => h.set(k, v));
    return h;
  }

  Object.entries(input).forEach(([k, v]) => {
    if (typeof v === "string") h.set(k, v);
  });

  return h;
}

export async function apiFetch<T>(
  path: string,
  opts: ApiOptions = {}
): Promise<T> {
  const { params, headers, ...rest } = opts;

  const finalHeaders = toHeaders(headers);

  // ✅ IMPORTANT: don't force JSON header for FormData
  const isFormData =
    typeof FormData !== "undefined" && rest.body instanceof FormData;

  if (rest.body && !isFormData && !finalHeaders.has("Content-Type")) {
    finalHeaders.set("Content-Type", "application/json");
  }

  const token = getTokenFromCookie();
  if (token && !finalHeaders.has("Authorization")) {
    finalHeaders.set("Authorization", `Bearer ${token}`);
  }

  const res = await fetch(buildUrl(path, params), {
    ...rest,
    headers: finalHeaders,
    cache: "no-store",
  });

  if (res.status === 401) {
    handleUnauthorized();
  }
 

  if (!res.ok) {
    const body = await readBody(res);
    const msg =
      (body &&
        typeof body === "object" &&
        "message" in body &&
        (body as any).message) ||
      res.statusText ||
      "Request failed";
    throw new Error(`${res.status} ${msg}`);
  }

  return (await readBody(res)) as T;
}

export const api = {
  get: <T>(path: string, params?: Params, options?: ApiOptions) =>
    apiFetch<T>(path, { ...(options ?? {}), method: "GET", params }),

  post: <T>(path: string, data?: unknown, options?: ApiOptions) =>
    apiFetch<T>(path, {
      ...(options ?? {}),
      method: "POST",
      body: JSON.stringify(data ?? {}),
    }),

  put: <T>(path: string, data?: unknown, options?: ApiOptions) =>
    apiFetch<T>(path, {
      ...(options ?? {}),
      method: "PUT",
      body: JSON.stringify(data ?? {}),
    }),

  patch: <T>(path: string, data?: unknown, options?: ApiOptions) =>
    apiFetch<T>(path, {
      ...(options ?? {}),
      method: "PATCH",
      body: JSON.stringify(data ?? {}),
    }),

  delete: <T>(path: string, options?: ApiOptions) =>
    apiFetch<T>(path, { ...(options ?? {}), method: "DELETE" }),

  // ✅ NEW: multipart/form-data helper (uploads)
  form: <T>(
    path: string,
    method: "POST" | "PUT" | "PATCH",
    formData: FormData,
    options?: ApiOptions
  ) =>
    apiFetch<T>(path, {
      ...(options ?? {}),
      method,
      body: formData,
    }),
};
