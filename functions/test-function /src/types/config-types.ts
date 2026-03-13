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
  siteApiKey: string;
  siteApiKeySecret: string;
  siteId: string;
  webhookUrl: string;
}

export interface GliaAIConfig {
  prompt: string;
  systemMessage: string;
  confidence: number;
  temperature: number;
  maxTokens: number;
  model: string;
  stopSequences: string[];
}

export interface FunctionConfig {
  callRetries: number;
  dataDog: DataDogConfig;
  gliaAI: GliaAIConfig;
  glia: GliaConfig;
  requestTimeout: number;
  retryDelay: number;
}
