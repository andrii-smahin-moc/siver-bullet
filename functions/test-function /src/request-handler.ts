import { TestingService } from './services';
import { BaseRequestPayload, FunctionConfig, LoggerInterface, ServiceResponse } from './types';

export class RequestHandler {
  private testingService: TestingService;

  constructor(
    config: FunctionConfig,
    private logger: LoggerInterface,
  ) {
    this.testingService = new TestingService(config, logger);
  }

  async handleRequest(requestPayload: BaseRequestPayload): Promise<ServiceResponse<unknown>> {
    await this.logger.info('Handling request with payload:');

    switch (requestPayload.requestType) {
      case 'getResults': {
        return this.testingService.getResults(requestPayload.payload);
      }

      case 'initTest': {
        return this.testingService.initializeTest(requestPayload.payload);
      }
    }

    return {
      error: 'Unsupported request type',
      status: false,
    };
  }
}
