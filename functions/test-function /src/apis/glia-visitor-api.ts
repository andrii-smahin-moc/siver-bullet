import type { FunctionConfig, HttpResponse, LoggerInterface, UnknownResponse } from '../types';

import { HttpRequest } from './http-request';

export class GliaVisitorApi {
  private gliaConfig: FunctionConfig['glia'];

  private httpRequest: HttpRequest;

  constructor(config: FunctionConfig, logger: LoggerInterface) {
    this.gliaConfig = config.glia;
    this.httpRequest = new HttpRequest(config, logger);
  }

  async createVisitor(token: string): Promise<HttpResponse<UnknownResponse>> {
    const headers = new Headers();
    headers.append('Authorization', `Bearer ${token}`);
    headers.append('Content-Type', 'application/json');

    const requestOptions = {
      headers,
      method: 'POST',
    };

    const url = `${this.gliaConfig.apiDomain}/visitors`;
    return this.httpRequest.fetchWithRetry<UnknownResponse>(url, requestOptions, 'createVisitor');
  }
}
