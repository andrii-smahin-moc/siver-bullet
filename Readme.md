# GVA Function Template

A production-ready template for building Glia Virtual Assistant (GVA) functions with TypeScript. This template provides infrastructure services and utilities, allowing you to focus on implementing business logic.

## What's Included

### Infrastructure Services (Ready to Use)
- **Authentication Service** - OTP and token-based authentication
- **Engagement Service** - Chat message handling and engagement management
- **KV Service** - Key-value storage for session data
- **Queue Service** - Queue availability checking
- **Transfer Service** - Transfer to human agent functionality

### Utilities & Patterns
- **Base Service Class** - Foundation for building goal-oriented services
- **Answer Detector** - Pattern matching for user responses
- **HTTP Request** - Configured HTTP client with retry logic
- **Logger** - DataDog integration for monitoring
- **Validators** - Schema validation framework

### Configuration & Testing
- TypeScript with strict mode
- Vitest for unit testing
- ESLint configuration
- Cloudflare Workers environment

## Quick Start

### 1. Create a new repository from this template - e.g. gva-awesome-function

### 2. Update all files with the new function name:
- [Root package.json](package.json)
- [Functions folder](./functions)
- [Functions package.json](./functions/gva-example/package.json)
- [Wrangler.toml](./functions/gva-example/wrangler.toml)
- Add built function file to the root [.gitignore](.gitignore):
```
# Build output
gva-example-function.js
```
- In [config.ts](./functions/gva-example/src/config.ts), update the function and customer name:
```typescript
        customer: 'your-customer-name',
        ddApiKey: validationResult.output.DD_API_KEY,
        functionName: 'gva-awesome-function',
```

### 4. Configure Environment
- Set up your configuration in `.dev.vars.example` and rename it to `.dev.vars`.
- Set glia-kv-sdk.json, glia-ai-sdk.json, if you need to work with the Glia Key-Value and AI SDKs. If not, you can remove related files.

## Project Structure

```
functions/gva-example/
├── src/
│   ├── apis/              # API clients (Glia, DataDog, etc.)
│   ├── services/          # Business logic services
│   │   ├── glia-*.ts      # Infrastructure services
│   │   └── gva-goal-base-service.ts  # Base class for your services
│   ├── schemas/           # Zod validation schemas
│   ├── types/             # TypeScript type definitions
│   ├── utils/             # Utility functions
│   ├── constants.ts       # Workflow steps and answer options
│   ├── config.ts          # Configuration management
│   ├── function.ts        # Entry point
│   └── request-handler.ts # Request routing
├── test/                  # Unit tests
└── scripts/               # Deployment and helper scripts
```

## Key Patterns

### Step-Based Workflow
Each step in your workflow is a handler function registered with the base service:

```typescript
this.register('STEP_NAME', this.stepHandler.bind(this));
```

### State Management
Use `customJourneyContext` to maintain state between steps:

```typescript
const context = this.getCustomJourneyContext(payload);
context.STEP = 'NEXT_STEP';
context.userData = { /* your data */ };
```

### Answer Detection
Use the Answer Detector Service to match user responses:

```typescript
const detectedAnswers = await this.answerDetectorService.detect(context);
const yesAnswer = detectedAnswers.find(a => a.name === 'YES_CONFIRM');
```

### Error Handling
Transfer to human agent when needed:

```typescript
return this.transferToHumanAgent(engagementId, 'Reason for transfer');
```

## Development

### Run Tests
```bash
npm test
npm run test:coverage
```

### Build
```bash
npm run build
```



## Infrastructure Services Usage

### KV Storage
```typescript
await this.gliaKVService.setValue(key, value);
const data = await this.gliaKVService.getValue(key);
```

### Engagement Service
```typescript
await this.gliaEngagementService.sendChatMessage(engagementId, message);
```

### Transfer Service
```typescript
const success = await this.gliaTransferService.transferToQueue(engagementId);
```

### Queue Service
```typescript
const isAvailable = await this.gliaQueueService.checkQueueAvailability();
```

## Next Steps

1. Review the infrastructure services in `src/services/glia-*.ts`
2. Examine the base service class in `src/services/gva-goal-base-service.ts`
3. Create your custom service extending the base class
4. Define your workflow steps in `src/constants.ts`
5. Update the request handler to route to your service
6. Write tests for your implementation

## Resources

- [Glia Developer Portal Documentation](https://docs.glia.com/glia-dev/docs/glia-apis-and-development-kits)
- [Glia API Documentation](https://docs.glia.com/glia-dev/reference)
- [Cloudflare Workers Documentation](https://developers.cloudflare.com/workers/)
- [TypeScript Documentation](https://www.typescriptlang.org/docs/)


