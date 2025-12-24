import { UnionRequestSchema } from './schemas';
import type { RequestPayload, ValidationResult } from './types';
import { validateSchema } from './validator';

export const validatePayload = async (request: Request): Promise<ValidationResult<RequestPayload>> => {
  try {
    const requestJson = (await request.json()) as Record<string, unknown>;

    return validateSchema(UnionRequestSchema, requestJson, 'Request Payload validation');
  } catch (error: unknown) {
    const message = `Invalid payload: ${(error as Error)?.message ?? 'Unknown error'}`;
    console.error(message);
    return {
      message,
      status: false,
    };
  }
};
