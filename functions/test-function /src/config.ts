import type * as v from 'valibot';

import { BaseEnvironmentSchema } from './schemas';
import { FunctionConfig, ValidationResult } from './types';
import { validateSchema } from './validator';

export function validateConfig(environment: Record<string, unknown>): ValidationResult<FunctionConfig> {
  const validationResult = validateSchema(BaseEnvironmentSchema, environment, 'Environment validation');

  if (!validationResult.status) {
    return validationResult;
  }

  const validatedEnvironment: v.InferOutput<typeof BaseEnvironmentSchema> = validationResult.output;

  return {
    output: {
      callRetries: Number(validatedEnvironment.CALL_RETRIES) || 3,
      dataDog: {
        callRetries: Number(validatedEnvironment.CALL_RETRIES) || 3,
        customer: 'example',
        ddApiKey: validatedEnvironment.DD_API_KEY,
        functionName: 'gva-example',
        isDevMode: validatedEnvironment.IS_DEV_MOD === 'true',
        requestTimeout: Number(validatedEnvironment.REQUEST_TIMEOUT) || 5000,
        retryDelay: Number(validatedEnvironment.RETRY_DELAY) || 3000,
        siteId: validatedEnvironment.SITE_ID,
        version: validatedEnvironment.FDMS_VERSION,
      },

      glia: {
        apiDomain: validatedEnvironment.GLIA_API_DOMAIN,
        operatorApiKey: validatedEnvironment.GLIA_USER_API_KEY,
        operatorApiKeySecret: validatedEnvironment.GLIA_USER_API_KEY_SECRET,
        siteApiKey: validatedEnvironment.GLIA_SITE_API_KEY,
        siteApiKeySecret: validatedEnvironment.GLIA_SITE_API_KEY_SECRET,
        siteId: validatedEnvironment.SITE_ID,
        webhookUrl: validatedEnvironment.GLIA_WEBHOOK_URL,
      },

      requestTimeout: Number(validatedEnvironment.REQUEST_TIMEOUT) || 5000,
      retryDelay: Number(validatedEnvironment.RETRY_DELAY) || 3000,
    },
    status: true,
  };
}
