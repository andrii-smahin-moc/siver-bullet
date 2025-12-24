import * as v from 'valibot';

export const InitializeTestRequestSchema = v.object({
  age: v.number(),
  name: v.string(),
});

export const GetResultsRequestSchema = v.object({
  isActive: v.boolean(),
});

export const BaseRequestPayloadSchema = v.variant('requestType', [
  v.object({
    payload: GetResultsRequestSchema,
    requestType: v.literal('getResults'),
  }),
  v.object({
    payload: InitializeTestRequestSchema,
    requestType: v.literal('initTest'),
  }),
]);
