export interface ErrorResponse {
  status: false;
  error: string;
}

export interface SuccessResponse<T> {
  status: true;
  payload: T;
}

export type ServiceResponse<T> = ErrorResponse | SuccessResponse<T>;

export type UnknownResponse = Record<string, unknown>;
