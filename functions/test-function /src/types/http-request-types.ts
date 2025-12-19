export interface FetchReTryConfig {
  callRetries: number;
  requestTimeout: number;
  retryDelay: number;
}

export interface ExtraReTryConfig {
  nonRetirableStatusCodes?: number[];
}

export interface HttpBaseResponse {
  statusCode: number;
  headers: Record<string, string>;
}

export type HttpResponse<T = unknown> =
  | (HttpBaseResponse & {
      ok: false;
      // TODO: type the payload
      payload: T;
    })
  | (HttpBaseResponse & {
      ok: true;
      payload: T;
    });
