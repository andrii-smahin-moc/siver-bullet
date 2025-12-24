import { InferOutput } from 'valibot';

import { BaseRequestPayloadSchema, GetResultsRequestSchema, InitializeTestRequestSchema } from '../schemas';

export type BaseRequestPayload = InferOutput<typeof BaseRequestPayloadSchema>;

export type InitializeTestRequestPayload = InferOutput<typeof InitializeTestRequestSchema>;
export type GetResultRequestPayload = InferOutput<typeof GetResultsRequestSchema>;
