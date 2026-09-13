# API Reference

This page documents the main API for the Ham Radio Registry. All types and interfaces are available from the `@springfield/ham-radio-registry` package.

## Registry Creation

```typescript
import { createRegistry } from '@springfield/ham-radio-registry';
import { MockLogLayer } from 'loglayer';

const logger = new MockLogLayer();
const registry = createRegistry(logger);
```

## RadioConfigRegistry Interface

```typescript
interface RadioConfigRegistry {
  // Discover radio configurations from loaded modules
  discoverConfigurations(): Promise<RegistryRadio[]>;

  // Get configuration by ID
  getConfiguration(configId: string): Promise<RegistryRadio | null>;

  // Get configurations by manufacturer
  getConfigurationsByManufacturer(manufacturer: string): Promise<RegistryRadio[]>;

  // Get configurations by module
  getConfigurationsByModule(moduleId: string): Promise<RegistryRadio[]>;

  // Validate configuration
  validateConfiguration(config: RegistryRadio): ValidationResult;

  // Register a new configuration
  registerConfiguration(config: RegistryRadio): Promise<void>;

  // Install and load a new plugin module
  installPlugin(moduleId: string): Promise<void>;

  // List installed plugin modules
  listInstalledPlugins(): Promise<PluginModule[]>;

  // Get codec for a radio model
  getCodec(modelId: RadioModelId): Promise<RadioCodec | null>;
}
```

## Types

### RegistryRadio

```typescript
interface RegistryRadio {
  $schema?: string;
  id: {
    model: string;
    name: string;
    manufacturer: string;
  };
  version: string;
  description: string;
  capabilities: RadioCapabilities;
  cat?: RadioCatConfig;
  serialConfig: SerialConfig;
  memoryConfig: MemoryConfig;
  readMemory: ProtocolStep[];
  writeMemory: ProtocolStep[];
  settingsSchema: {
    model: string;
    settingsSchema: any;
    channelSchema: any;
  };
  codec?: CodecConfig;
  metadata: RadioConfigMetadata;
}
```

### PluginModule

```typescript
interface PluginModule {
  name: string;
  version: string;
  manufacturer?: string;
  configPath: string;
  sharedPath: string;
  codecFactoryPath?: string;
  capabilities: Record<string, boolean>;
  packageJson: any;
}
```

### ValidationResult

```typescript
interface ValidationResult {
  isValid: boolean;
  errors: string[];
  warnings: string[];
}
```

### CodecConfig

```typescript
interface CodecConfig {
  type: 'shared' | 'inline' | 'memoryMap';
  reference?: string;
  config?: Record<string, any>;
}
```

### RadioCapabilities

```typescript
interface RadioCapabilities {
  memoryRead: boolean;
  memoryWrite: boolean;
  channelProgramming: boolean;
  settingsProgramming: boolean;
  liveControl: boolean;
}
```

`liveControl` is live VFO / mode / PTT on the programming PC port. It is independent of memory protocol: a radio may clone EEPROM and still set `liveControl`. Omit it or set `false` when the port has no computer control. When it is `true`, add a `cat` block so HamBench knows the command family and the per-radio layout (VFO count, frequency command, mode and power names).

### RadioCatConfig

```typescript
interface RadioCatConfig {
  protocol: string;
  wakeCr?: boolean;
  vfoCount?: number;
  frequencyCommands?: string[];
  frequencyWidth?: number;
  vfoChannel?: boolean;
  modes?: string[];
  powers?: string[];
  modeCommand?: string;
  powerBandIndex?: boolean;
  bandControl?: boolean;
}
```

Kenwood modules set `protocol` to `kenwood` and fill in the rest. Power labels must match the radio faceplate (`High` / `Medium` / `Low` on a TM-D710A). HamBench does not infer that from the model name.

## Example Usage

```typescript
// Discover all configurations
const configs = await registry.discoverConfigurations();

// Get a configuration by model ID
const config = await registry.getConfiguration('baofeng-uv5r');

// Validate a configuration
const validation = registry.validateConfiguration(config);

// Install a new plugin
await registry.installPlugin('radio-module-custom-manufacturer');

// Get a codec for a radio model
const codec = await registry.getCodec('baofeng-uv5r');
```

For more details, see the source code and type definitions in the registry package. 
