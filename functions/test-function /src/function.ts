import { CatalogErrors } from './catalog-errors';
import { validateConfig } from './config';
import { LoggerWithDD } from './logger';
import { RequestHandler } from './request-handler';
import { validatePayload } from './request-validator';
import { KvStoreFactory } from './types';

export async function onInvoke(request: Request, environment: Record<string, unknown>, kvStoreFactory: KvStoreFactory) {
  const config = validateConfig(environment);

  if (!config.status) {
    const errorMessage = CatalogErrors.failedConfig(config.message).message;
    console.error(errorMessage);
    return Response.json({ message: errorMessage, status: false });
  }

  const logger = new LoggerWithDD(config.output.dataDog);
  await logger.info('--------Received request---------');

  const validatedPayload = await validatePayload(request);
  if (!validatedPayload.status) {
    const errorMessage = CatalogErrors.failedPayload(validatedPayload.message).message;
    await logger.error(errorMessage);
    return Response.json({ error: errorMessage, status: false });
  }

  const requestHandler = new RequestHandler(config.output, logger, kvStoreFactory);
  const result = await requestHandler.handleRequest(validatedPayload.output);
  await logger.info('--------Request processed---------');

  if ('utterance' in validatedPayload.output) {
    return Response.json(result.status ? result.payload : { confidence_level: 0, messages: [] });
  }

  return Response.json(result);
}
