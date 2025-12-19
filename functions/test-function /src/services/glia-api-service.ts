import { GliaAuthApi } from '../apis';
import type { FunctionConfig, LoggerInterface } from '../types';

export class GliaAPIService {
  private gliaAuthApi: GliaAuthApi;

  constructor(
    private config: FunctionConfig,
    private logger: LoggerInterface,
  ) {
    this.gliaAuthApi = new GliaAuthApi(config, logger);
  }

  async fetchOperatorToken(): Promise<string | null> {
    try {
      const authResponse = await this.gliaAuthApi.fetchBearerToken(this.config.glia.operatorApiKey, this.config.glia.operatorApiKeySecret);
      if (authResponse.ok && authResponse.payload.token) {
        return authResponse.payload.token;
      }
      return null;
    } catch (error) {
      const message = error instanceof Error ? error.message : 'Unknown error in fetchOperatorToken';
      await this.logger.error(`Error fetching operator token: ${message}`);
      return null;
    }
  }
}
