# Getting Started

This guide will help you get up and running with the Ham Radio Registry. You'll learn how to install the registry, discover radio configurations, and use them in your application.

## 1. Install the Registry

Add the registry package to your project using yarn:

```sh
yarn add @springfield/ham-radio-registry
```

## 2. Install Radio Modules

You can install official or third-party radio modules from npm. For example, to install the official Baofeng module:

```sh
yarn add @springfield/radio-module-baofeng
```

## 3. Create a Registry Instance

Import and create a registry instance in your code:

```typescript
import { createRegistry } from '@springfield/ham-radio-registry';
import { MockLogLayer } from 'loglayer';

const logger = new MockLogLayer();
const registry = createRegistry(logger);
```

## 4. Discover Available Configurations

Use the registry to discover all available radio configurations:

```typescript
const configurations = await registry.discoverConfigurations();
console.log(configurations);
```

## 5. Get a Specific Configuration

Retrieve a configuration by its model ID:

```typescript
const baofengConfig = await registry.getConfiguration('baofeng-uv5r');
```

## 6. Get Configurations by Manufacturer

List all configurations for a specific manufacturer:

```typescript
const baofengConfigs = await registry.getConfigurationsByManufacturer('Baofeng');
```

## 7. Install Additional Plugins

You can install new radio modules at any time:

```typescript
await registry.installPlugin('radio-module-custom-manufacturer');
```

## 8. Validate Plugins

Validate a plugin before installation:

```typescript
const validation = await registry.validatePlugin('radio-module-custom-manufacturer');
if (!validation.isValid) {
  throw new Error(`Plugin validation failed: ${validation.errors.join(', ')}`);
}
```

## 9. Get a Codec for a Radio Model

Retrieve a codec instance for a specific radio model:

```typescript
const codec = await registry.getCodec('baofeng-uv5r');
```

## Next Steps

- [Plugin Development](./plugin-development) - Learn how to create your own radio modules
- [API Reference](./api-reference) - Explore the full API
- [Examples](./examples) - See more usage examples 
