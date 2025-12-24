import { InferOutput } from 'valibot';

import {
  GetResultsRequestSchema,
  GliaChatMessagePayloadSchema,
  GliaEngagementStartPayloadSchema,
  InitializeRequestSchema,
  UnionRequestSchema,
} from '../schemas';

export type RequestPayload = InferOutput<typeof UnionRequestSchema>;

export type InitializeRequestPayload = InferOutput<typeof InitializeRequestSchema>;
export type GetResultRequestPayload = InferOutput<typeof GetResultsRequestSchema>;

export type GliaEngagementStartPayload = InferOutput<typeof GliaEngagementStartPayloadSchema>;
export type GliaChatMessagePayload = InferOutput<typeof GliaChatMessagePayloadSchema>;
