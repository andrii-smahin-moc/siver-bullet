import { TestingService } from './services';
import { FunctionConfig, LoggerInterface, RequestPayload, ServiceResponse } from './types';

export class RequestHandler {
  private testingService: TestingService;

  constructor(
    config: FunctionConfig,
    private logger: LoggerInterface,
  ) {
    this.testingService = new TestingService(config, logger);
  }

  async handleRequest(requestPayload: RequestPayload): Promise<ServiceResponse<unknown>> {
    await this.logger.info('Handling request with payload:');

    if ('requestType' in requestPayload) {
      switch (requestPayload.requestType) {
        case 'getResults': {
          return this.testingService.getResults(requestPayload.payload);
        }

        case 'initTest': {
          return this.testingService.initializeTest(requestPayload.payload);
        }
      }
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
