import * as v from 'valibot';

export const InitializeRequestSchema = v.object({
  testingQueueId: v.string(),
});

export const GetResultsRequestSchema = v.object({
  isActive: v.boolean(),
});

export const TestRequestPayloadSchema = v.variant('requestType', [
  v.object({
    payload: GetResultsRequestSchema,
    requestType: v.literal('getResults'),
  }),
  v.object({
    payload: InitializeRequestSchema,
    requestType: v.literal('initTest'),
  }),
]);

export const GliaEngagementStartPayloadSchema = v.object({
  engagement: v.object({
    id: v.string(),
    source: v.string(),
    visitor_id: v.string(),
  }),
  event_type: v.literal('engagement.start'),
});

export const GliaChatMessagePayloadSchema = v.object({
  message: v.object({
    content: v.string(),
    engagement_id: v.string(),
    target: v.string(),
    timestamp: v.string(),
    type: v.string(),
  }),
  event_type: v.literal('engagement.chat.message'),
});

export const GliaWebhookPayloadSchema = v.variant('event_type', [GliaEngagementStartPayloadSchema, GliaChatMessagePayloadSchema]);

export const UnionRequestSchema = v.union([TestRequestPayloadSchema, GliaWebhookPayloadSchema]);
