const BASE_URL = import.meta.env.VITE_API_BASE_URL ?? "";

export class ApiError extends Error {
  constructor(
    public status: number,
    message: string,
  ) {
    super(message);
    this.name = "ApiError";
  }
}

export async function request<T>(
  method: string,
  path: string,
  body?: FormData | Record<string, unknown>,
): Promise<T> {
  const headers: HeadersInit = {};
  let reqBody: BodyInit | undefined;

  if (body instanceof FormData) {
    reqBody = body;
  } else if (body) {
    headers["Content-Type"] = "application/json";
    reqBody = JSON.stringify(body);
  }

  const res = await fetch(`${BASE_URL}${path}`, {
    method,
    headers,
    body: reqBody,
  });

  if (!res.ok) {
    const text = await res.text().catch(() => res.statusText);
    throw new ApiError(res.status, text);
  }

  return res.json() as Promise<T>;
}
