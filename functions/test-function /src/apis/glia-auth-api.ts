import type { FunctionConfig, GliaConfig, HttpResponse, LoggerInterface } from '../types';

import { HttpRequest } from './http-request';

interface TokenResponse {
  token: string;
}

export class GliaAuthApi {
  private gliaConfig: GliaConfig;

  private httpRequest: HttpRequest;

  constructor(config: FunctionConfig, logger: LoggerInterface) {
    this.gliaConfig = config.glia;
    this.httpRequest = new HttpRequest(config, logger);
  }

  async fetchBearerToken(apiKey: string, apiKeySecret: string): Promise<HttpResponse<TokenResponse>> {
    const headers = new Headers();
    headers.append('Content-Type', 'application/json');
    headers.append('Accept', 'application/vnd.salemove.v1+json');

    const body = JSON.stringify({
      api_key_id: apiKey,
      api_key_secret: apiKeySecret,
    });

    const requestOptions = {
      body,
      headers,
      method: 'POST',
    };

    const url = `${this.gliaConfig.apiDomain}/operator_authentication/tokens`;
    return this.httpRequest.fetchWithRetry<TokenResponse>(url, requestOptions, 'fetchBearerToken');
  }
}
