export const ErrorCodes = {
  FAILED_CONFIG: 0,
  FAILED_PAYLOAD: 1,
};

export const CatalogErrors = {
  failedConfig: (errorMessage: string) => ({
    message: `Function configuration is invalid: ${errorMessage}`,
    code: ErrorCodes.FAILED_CONFIG,
  }),

  failedPayload: (errorMessage: string) => ({
    message: `Provided payload is invalid: ${errorMessage}`,
    code: ErrorCodes.FAILED_PAYLOAD,
  }),
};
