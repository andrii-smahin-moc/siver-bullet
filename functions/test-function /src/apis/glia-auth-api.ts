import type { FunctionConfig, GliaConfig, HttpResponse, LoggerInterface, UnknownResponse } from '../types';

import { HttpRequest } from './http-request';

export class GliaAuthApi {
  private gliaConfig: GliaConfig;

  private httpRequest: HttpRequest;

  constructor(config: FunctionConfig, logger: LoggerInterface) {
    this.gliaConfig = config.glia;
    this.httpRequest = new HttpRequest(config, logger);
  }

  async fetchBearerToken(): Promise<HttpResponse<UnknownResponse>> {
    const headers = new Headers();
    headers.append('Content-Type', 'application/json');
    headers.append('Accept', 'application/vnd.salemove.v1+json');

    const body = JSON.stringify({
      api_key_id: this.gliaConfig.operatorApiKey,
      api_key_secret: this.gliaConfig.operatorApiKeySecret,
    });

    const requestOptions = {
      body,
      headers,
      method: 'POST',
    };

    const url = `${this.gliaConfig.apiDomain}/operator_authentication/tokens`;
    return this.httpRequest.fetchWithRetry<UnknownResponse>(url, requestOptions, 'fetchBearerToken');
  }

  async fetchSiteBearerToken(): Promise<HttpResponse<UnknownResponse>> {
    const headers = new Headers();
    headers.append('Content-Type', 'application/json');
    headers.append('Accept', 'application/vnd.salemove.v1+json');

    const body = JSON.stringify({
      api_key_id: this.gliaConfig.siteApiKey,
      api_key_secret: this.gliaConfig.siteApiKeySecret,
      site_ids: [this.gliaConfig.siteId],
    });

    const requestOptions = {
      body,
      headers,
      method: 'POST',
    };

    const url = `${this.gliaConfig.apiDomain}/sites/tokens`;
    return this.httpRequest.fetchWithRetry<UnknownResponse>(url, requestOptions, 'fetchSiteBearerToken');
  }
}
