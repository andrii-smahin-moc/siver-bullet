export interface DataDogConfig {
  callRetries: number;
  customer: string;
  ddApiKey: string;
  functionName: string;
  isDevMode: boolean;
  requestTimeout: number;
  retryDelay: number;
  siteId: string;
  version: string;
}

export interface GliaConfig {
  apiDomain: string;
  operatorApiKey: string;
  operatorApiKeySecret: string;
  engineId: string;
}

export interface FunctionConfig {
  callRetries: number;
  dataDog: DataDogConfig;
  glia: GliaConfig;
  requestTimeout: number;
  retryDelay: number;
}
