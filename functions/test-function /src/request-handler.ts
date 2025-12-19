import { GliaAPIService } from './services';
import { BaseRequestPayload, FunctionConfig, LoggerInterface, ServiceResponse } from './types';

export class RequestHandler {
  private gliaApiService: GliaAPIService;

  constructor(
    config: FunctionConfig,
    private logger: LoggerInterface,
  ) {
    this.gliaApiService = new GliaAPIService(config, logger);
  }

  async handleRequest(requestPayload: BaseRequestPayload): Promise<ServiceResponse<unknown>> {
    await this.logger.info('Handling request with payload:');
    return {
      message: 'Successfully handled request',
      data: {},
    };
  }
}
