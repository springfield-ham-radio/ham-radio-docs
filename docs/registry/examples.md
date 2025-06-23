# Examples

This page provides practical examples of using the Ham Radio Registry in your application.

## Discover All Configurations

```typescript
import { createRegistry } from '@springfield/ham-radio-registry';
import { MockLogLayer } from 'loglayer';

const logger = new MockLogLayer();
const registry = createRegistry(logger);

const configurations = await registry.discoverConfigurations();
console.log(configurations);
```

## Get a Configuration by Model ID

```typescript
const config = await registry.getConfiguration('baofeng-uv5r');
console.log(config);
```

## Get Configurations by Manufacturer

```typescript
const baofengConfigs = await registry.getConfigurationsByManufacturer('Baofeng');
console.log(baofengConfigs);
```

## Install a New Plugin

```typescript
await registry.installPlugin('radio-module-custom-manufacturer');
```

## Validate a Plugin Before Installation

```typescript
const validation = await registry.validatePlugin('radio-module-custom-manufacturer');
if (!validation.isValid) {
  throw new Error(`Plugin validation failed: ${validation.errors.join(', ')}`);
}
```

## Get a Codec for a Radio Model

```typescript
const codec = await registry.getCodec('baofeng-uv5r');
```

## List Installed Plugins

```typescript
const plugins = await registry.listInstalledPlugins();
console.log(plugins);
```

For more advanced examples, see the [API Reference](./api-reference) and the source code. 
