import { TestingService } from './services/testing-service';
import type { FunctionConfig } from './types/config-types';
import type { KvStoreFactory } from './types/kv-storage-types';
import type { LoggerInterface } from './types/logger-types';
import type { RequestPayload } from './types/request-payload-types';
import type { ServiceResponse } from './types/response-payload-types';

export class RequestHandler {
  private testingService: TestingService;

  constructor(
    config: FunctionConfig,
    private logger: LoggerInterface,
    kvStoreFactory: KvStoreFactory,
  ) {
    this.testingService = new TestingService(config, logger, kvStoreFactory);
  }

  async handleRequest(requestPayload: RequestPayload): Promise<ServiceResponse<unknown>> {
    await this.logger.info('Handling request with payload:');

    if ('requestType' in requestPayload) {
      switch (requestPayload.requestType) {
        case 'initTest': {
          return this.testingService.initializeTest(requestPayload.payload);
        }
      }
    }

    if ('utterance' in requestPayload) {
      return this.testingService.handleUtterance(requestPayload);
    }

    if ('event_type' in requestPayload) {
      switch (requestPayload.event_type) {
        case 'engagement.chat.message': {
          return this.testingService.handleChatMessage(requestPayload);
        }

        case 'engagement.start': {
          return this.testingService.handleEngagementStart(requestPayload);
        }
      }
    }

    return {
      error: 'Unsupported request type',
      status: false,
    };
  }
}
