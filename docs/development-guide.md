# Development Guide

This guide provides practical information for developers working with the Springfield Ham Radio ecosystem.

## Getting Started

Before diving into development, we recommend reading the [Architecture Overview](/reference/architecture) to understand the overall system design and the [Module Comparison](/module-comparison) to understand the purpose of each module.

## Development Environment Setup

### Prerequisites
- Node.js 18.0.0 or higher
- Yarn package manager
- TypeScript knowledge
- Familiarity with amateur radio concepts

### Required Dependencies
All modules use these core dependencies:
- `loglayer` - Structured logging
- `@springfield/ham-radio-api` - Core types and interfaces
- `typescript` - Type safety
- `oxlint` - Linting
- `chai` + `fishery` - Testing

## Module Development Patterns

### 1. Core API Module (@springfield/ham-radio-api)

**Purpose**: Define types and interfaces used by all other modules.

**Key Principles**:
- Keep dependencies minimal (only `loglayer` and `ts-brand`)
- Use branded types for type safety
- Define clear, stable interfaces
- Maintain backward compatibility

**Example Structure**:
```typescript
// Define branded types for type safety
export type Frequency = Brand<number, 'Frequency'>;
export type RadioChannelId = Brand<string, 'RadioChannelId'>;

// Define core interfaces
export interface RadioDriver {
  readRadio(serialPortPath: string, progressIndicator: RadioProgressIndicator): Promise<RadioMemory>;
  writeRadio(serialPortPath: string, memory: RadioMemory, progressIndicator: RadioProgressIndicator): Promise<void>;
}
```

### 2. Driver Module (@springfield/ham-radio-driver)

**Purpose**: Implement radio communication logic using protocol DSL.

**Key Principles**:
- Use protocol interpreter pattern
- Support progress tracking and cancellation
- Handle serial communication robustly
- Provide extensible executor system

**Example Usage**:
```typescript
import { RadioDriver } from '@springfield/ham-radio-driver';
import type { Radio, RadioProgressIndicator } from '@springfield/ham-radio-api';

const driver = new RadioDriver(radioConfig, logger);
const progressIndicator = new RadioProgressIndicator();

// Read radio memory
const memory = await driver.readRadio('/dev/ttyUSB0', progressIndicator);

// Write radio memory
await driver.writeRadio('/dev/ttyUSB0', memory, progressIndicator);
```

### 3. Utilities Module (@springfield/ham-radio-utils)

**Purpose**: Provide shared utilities and helper functions.

**Key Principles**:
- Focus on reusability across modules
- Provide comprehensive test utilities
- Include schema validation
- Support UI logging and progress reporting

**Example Usage**:
```typescript
import { SegmentedMemory, validateSchema, createUILogger } from '@springfield/ham-radio-utils';

// Memory management
const memory = new SegmentedMemory(segments);
const segment = memory.getSegment(0);

// Schema validation
const result = validateSchema(data, schema);

// UI logging
const uiLogger = createUILogger();
uiLogger.startCommand(0, 5, 'readMemory', step);
```

### 4. Registry Module (@springfield/ham-radio-registry)

**Purpose**: Discover and manage radio module plugins.

**Key Principles**:
- Support npm-based plugin discovery
- Validate configurations before loading
- Manage shared components
- Provide caching for performance

**Example Usage**:
```typescript
import { createRegistry } from '@springfield/ham-radio-registry';

const registry = createRegistry(logger);

// Discover available configurations
const configs = await registry.discoverConfigurations();

// Get specific configuration
const config = await registry.getConfiguration('baofeng:uv5r');

// Get codec for radio model
const codec = await registry.getCodec('baofeng:uv5r');
```

### 5. Radio Module (radio-module-*)

**Purpose**: Provide radio-specific implementations.

**Key Principles**:
- Follow established naming convention (`radio-module-{manufacturer}`)
- Implement required interfaces from core API
- Use utilities for common operations
- Provide comprehensive configuration

**Example Structure**:
```
radio-module-manufacturer/
├── package.json                    # Module metadata
├── configs/                        # Radio configurations
│   └── model.json
├── src/
│   ├── shared/
│   │   ├── codecs/
│   │   │   ├── manufacturer-codec.ts
│   │   │   ├── manufacturer-decoder.ts
│   │   │   └── manufacturer-encoder.ts
│   │   └── schemas/
│   │       ├── channel-schema.json
│   │       └── settings-schema.json
│   ├── codec-factory.ts
│   └── index.ts
└── README.md
```

## Testing Patterns

### Unit Testing
All modules use the Node.js native test runner with chai assertions:

```typescript
import { describe, it } from 'node:test';
import { expect } from 'chai';
import { Factory } from 'fishery';

describe('MyModule', () => {
  it('should handle basic operations', () => {
    const data = Factory.build('testData');
    const result = processData(data);
    expect(result).to.be.an('object');
  });
});
```

### Integration Testing
Use `yarn test:integration` for integration tests:

```typescript
import { describe, it } from 'node:test';
import { expect } from 'chai';

describe('Integration Tests', () => {
  it('should read radio memory end-to-end', async () => {
    // Test complete workflow
  });
});
```

### Test Data Factories
Use fishery for generating test data:

```typescript
import { Factory } from 'fishery';

export const RadioChannelFactory = Factory.define<RadioChannel>(({ sequence }) => ({
  id: `channel-${sequence}`,
  frequency: 146.520,
  name: `Channel ${sequence}`,
}));
```

## Logging Patterns

### Using LogLayer
All modules use loglayer for structured logging:

```typescript
import type { ILogLayer } from 'loglayer';

class MyClass {
  constructor(private logger: ILogLayer) {}

  async processData(data: any) {
    this.logger.withMetadata({ dataSize: data.length }).debug('Processing data');
    
    try {
      // Process data
      this.logger.info('Data processed successfully');
    } catch (error) {
      this.logger.withError(error).error('Failed to process data');
      throw error;
    }
  }
}
```

### UI Logging
For user-facing progress reporting:

```typescript
import { createUILogger } from '@springfield/ham-radio-utils';

const uiLogger = createUILogger();

uiLogger.startCommand(0, 5, 'readMemory', step);
uiLogger.logCommandSuccess(0, 5, 'readMemory', step, context);
uiLogger.logCommandFailure(0, 5, 'readMemory', step, error, context);
```

## Error Handling

### Exception Types
Use specific exception types for different error conditions:

```typescript
import { CancelledException } from '@springfield/ham-radio-driver';

if (progressIndicator.isCanceled) {
  throw new CancelledException('Operation was cancelled by user');
}
```

### Validation Errors
Use structured validation results:

```typescript
import type { ValidationResult } from '@springfield/ham-radio-api';

const result: ValidationResult = {
  isValid: false,
  errors: ['Invalid frequency value'],
  warnings: ['Deprecated field used'],
};
```

## Performance Considerations

### Memory Management
Use segmented memory for large radio memories:

```typescript
import { SegmentedMemory } from '@springfield/ham-radio-utils';

const memory = new SegmentedMemory(segments);
// Efficient access to large memory structures
```

### Caching
Implement caching for expensive operations:

```typescript
class CachedRegistry {
  private configCache = new Map<string, RegistryRadio>();
  
  async getConfiguration(id: string): Promise<RegistryRadio | null> {
    if (this.configCache.has(id)) {
      return this.configCache.get(id)!;
    }
    
    const config = await this.loadConfiguration(id);
    if (config) {
      this.configCache.set(id, config);
    }
    return config;
  }
}
```

### Progress Tracking
Support cancellation for long-running operations:

```typescript
async function processLargeData(data: Uint8Array, progress: RadioProgressIndicator) {
  for (let i = 0; i < data.length; i += chunkSize) {
    if (progress.isCanceled) {
      throw new CancelledException('Operation cancelled');
    }
    
    // Process chunk
    progress.setValue(i / data.length);
  }
}
```

## Security Best Practices

### Input Validation
Always validate external inputs:

```typescript
import { validateSchema } from '@springfield/ham-radio-utils';

const result = validateSchema(config, schema);
if (!result.isValid) {
  throw new Error(`Invalid configuration: ${result.errors.join(', ')}`);
}
```

### Type Safety
Use branded types to prevent type confusion:

```typescript
import type { Frequency, RadioChannelId } from '@springfield/ham-radio-api';

function processChannel(id: RadioChannelId, freq: Frequency) {
  // Type-safe operations
}
```

### Sandboxing
Sandbox plugin execution where possible:

```typescript
// Validate plugin before loading
const validation = await validatePlugin(moduleId);
if (!validation.isValid) {
  throw new Error(`Plugin validation failed: ${validation.errors.join(', ')}`);
}
```

## Deployment Considerations

### Package Management
Use yarn for consistent dependency management:

```json
{
  "packageManager": "yarn@4.9.2",
  "scripts": {
    "build": "tsc",
    "test": "yarn test:unit && yarn test:integration"
  }
}
```

### Version Compatibility
Maintain compatibility within major versions:

```json
{
  "dependencies": {
    "@springfield/ham-radio-api": "^16.0.0"
  }
}
```

### Build Process
Ensure proper build configuration:

```json
{
  "main": "dist/index.js",
  "types": "dist/index.d.ts",
  "files": ["src/", "dist/"]
}
```

## Contributing Guidelines

### Code Style
- Use TypeScript strict mode
- Follow project linting rules
- Sort imports and object keys
- Use blank lines around code blocks
- Never use `any` type

### Testing Requirements
- Write unit tests for all new functionality
- Include integration tests for complex workflows
- Use factory patterns for test data
- Maintain good test coverage

### Documentation
- Update relevant documentation when adding features
- Include JSDoc comments for public APIs
- Provide usage examples
- Update architecture documentation for significant changes

## Resources

- [Architecture Overview](/reference/architecture) - Complete system architecture
- [Module Comparison](/module-comparison) - Quick reference for all modules
- [Registry Documentation](/reference/registry/) - Plugin system details
- [API Examples](/api-examples) - Code examples and patterns 
