const API_URL = process.env.NEXT_PUBLIC_API_URL ?? "http://localhost:8000/api";
const TOKEN_KEY = "periang:token";

/** Event yang dipancarkan saat token ditolak server (401) — didengarkan auth-store. */
export const EVENT_TIDAK_SAH = "periang:unauthorized";

export function getToken(): string | null {
  if (typeof window === "undefined") return null;
  return window.localStorage.getItem(TOKEN_KEY);
}

export function setToken(token: string) {
  window.localStorage.setItem(TOKEN_KEY, token);
}

export function clearToken() {
  window.localStorage.removeItem(TOKEN_KEY);
}

export class ApiError extends Error {
  status: number;
  errors?: Record<string, string[]>;

  constructor(
    status: number,
    message: string,
    errors?: Record<string, string[]>,
  ) {
    super(message);
    this.name = "ApiError";
    this.status = status;
    this.errors = errors;
  }
}

type ApiFetchOptions = Omit<RequestInit, "body"> & {
  body?: unknown;
};

/**
 * Wrapper fetch ke API backend Laravel: menambahkan header standar (Accept,
 * Content-Type, Authorization Bearer dari token Sanctum tersimpan), lalu
 * mem-parsing body JSON & error Laravel (message + errors validasi) secara
 * konsisten. Lempar ApiError kalau respons bukan 2xx.
 */
export async function apiFetch<T = unknown>(
  path: string,
  options: ApiFetchOptions = {},
): Promise<T> {
  const { body, headers, ...rest } = options;
  const token = getToken();

  const response = await fetch(`${API_URL}${path}`, {
    ...rest,
    headers: {
      Accept: "application/json",
      ...(body !== undefined ? { "Content-Type": "application/json" } : {}),
      ...(token ? { Authorization: `Bearer ${token}` } : {}),
      ...headers,
    },
    body: body !== undefined ? JSON.stringify(body) : undefined,
  });

  const isJson = response.headers
    .get("content-type")
    ?.includes("application/json");
  const data = isJson ? await response.json().catch(() => null) : null;

  if (!response.ok) {
    if (response.status === 401 && typeof window !== "undefined") {
      clearToken();
      window.dispatchEvent(new Event(EVENT_TIDAK_SAH));
    }

    const message =
      (data && typeof data === "object" && "message" in data
        ? String((data as { message?: unknown }).message)
        : undefined) ?? "Terjadi kesalahan. Silakan coba lagi.";
    const errors =
      data && typeof data === "object" && "errors" in data
        ? (data as { errors?: Record<string, string[]> }).errors
        : undefined;

    throw new ApiError(response.status, message, errors);
  }

  return data as T;
}
