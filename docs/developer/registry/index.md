# Ham Radio Registry

The Ham Radio Registry is a unified platform for discovering, managing, and using radio configurations across the ham radio ecosystem. It provides a standardized way to work with different radio models and manufacturers through a consistent API.

## Overview

The Ham Radio Registry loads radio JSON configs and codecs for HamBench and for Node tools. The desktop app installs modules from GitHub Releases via the official catalog. For local development, clone a module repo and load its `configs/` JSON. `NpmBasedConfigRegistry` can still scan `node_modules` when you are working in a Yarn workspace.

- **Configuration Discovery**: Find available radio configurations
- **Codec Management**: Load and use radio-specific codecs
- **Shared Components**: Reuse schemas, protocols, and codecs
- **Plugin System**: Extend with third-party radio modules

## Quick Start

### 1. Install the Registry

```bash
yarn add @springfield/ham-radio-registry
```

### 2. Install Radio Modules

Radio modules are JSON zips from GitHub Releases, not npm packages. The desktop app installs them from the official catalog. For local development, clone the module repo and load its `configs/` JSON.

### 3. Use the API

```typescript
import { RadioConfigRegistry } from '@springfield/ham-radio-registry';

const registry = new RadioConfigRegistry();

// Discover all available radio configurations
const radios = await registry.discoverConfigurations();
console.log(`Found ${radios.length} radio configurations`);

// Get a specific radio configuration
const baofengConfig = await registry.getConfiguration('baofeng-uv5r');

// Get a codec for programming
const codec = await registry.getCodec({ model: 'baofeng-uv5r', manufacturer: 'Baofeng' });

// Encode a radio program
const program = {
  channels: [
    {
      channelNumber: 0,
      radioChannel: {
        name: 'REPEAT',
        receiveFrequency: 146520000,
        transmitFrequency: 146520000,
        receiveTone: { type: 'NONE' },
        transmitTone: { type: 'NONE' },
      },
      settings: { transmitPower: 5 },
    },
  ],
  settings: {},
};

const memory = codec.encode(program);
```

## Key Features

### 1. **Automatic Discovery**

The registry lists radio configs from installed modules (workspace / `node_modules` in Node, or the app’s installed JSON catalog):

```typescript
// List all installed radio modules
const modules = await registry.listInstalledPlugins();

// Discover all radio configurations
const configs = await registry.discoverConfigurations();

// Find radios by manufacturer
const baofengRadios = await registry.getConfigurationsByManufacturer('Baofeng');
```

### 2. **Unified Codec Interface**

All radios use the same codec interface:

```typescript
// Get codec for any supported radio
const codec = await registry.getCodec(modelId);

// Decode radio memory
const program = codec.decode(memory);

// Encode radio program
const encodedMemory = codec.encode(program);
```

### 3. **Shared Components**

Reuse codecs, schemas, and protocols across related radio models:

```json
{
  "settingsSchema": {
    "model": "baofeng-uv5r",
    "settingsSchema": { "$ref": "src/shared/schemas/settings-schema.json" },
    "channelSchema": { "$ref": "src/shared/schemas/channel-schema.json" }
  },
  "codec": {
    "type": "memoryMap"
  }
}
```

### 4. **Plugin System**

Third-party developers can create and distribute radio modules:

```json
{
  "name": "radio-module-custom",
  "keywords": ["ham-radio", "radio-module"],
  "springfield": {
    "pluginType": "radio-module",
    "manufacturer": "Custom Manufacturer"
  }
}
```

## Use Cases

### Radio Programming Software

```typescript
class UniversalProgrammer {
  constructor(private registry: RadioConfigRegistry) {}

  async programRadio(radioModel: string, program: RadioProgram) {
    const codec = await this.registry.getCodec(radioModel);
    const memory = codec.encode(program);
    await this.writeToRadio(memory);
  }

  async readRadio(radioModel: string): Promise<RadioProgram> {
    const memory = await this.readFromRadio();
    const codec = await this.registry.getCodec(radioModel);
    return codec.decode(memory);
  }
}
```

### Configuration Management

```typescript
class ConfigManager {
  constructor(private registry: RadioConfigRegistry) {}

  async backupConfiguration(radioModel: string) {
    const memory = await this.readFromRadio();
    const codec = await this.registry.getCodec(radioModel);
    const program = codec.decode(memory);
    
    await this.saveToFile(`${radioModel}-backup.json`, program);
  }

  async restoreConfiguration(radioModel: string, backupFile: string) {
    const program = await this.loadFromFile(backupFile);
    const codec = await this.registry.getCodec(radioModel);
    const memory = codec.encode(program);
    
    await this.writeToRadio(memory);
  }
}
```

### Radio Analysis

```typescript
class RadioAnalyzer {
  constructor(private registry: RadioConfigRegistry) {}

  async analyzeConfiguration(radioModel: string, memory: RadioMemory) {
    const codec = await this.registry.getCodec(radioModel);
    const program = codec.decode(memory);
    
    return {
      channelCount: program.channels.length,
      frequencyRange: this.calculateFrequencyRange(program.channels),
      toneUsage: this.analyzeToneUsage(program.channels),
      powerSettings: this.analyzePowerSettings(program.channels)
    };
  }
}
```

## Security

The registry implements comprehensive security measures:

- **Validation**: All configurations are validated against schemas
- **Sandboxing**: Codecs are loaded in isolated environments
- **Tamper Detection**: File integrity is verified
- **Version Compatibility**: Ensures compatibility between components

## Contributing

### Creating a Radio Module

1. **Follow the Structure**: Use the standard module layout
2. **Implement Codecs**: Create encoder/decoder for your radio
3. **Define Schemas**: Create JSON schemas for validation
4. **Test Thoroughly**: Ensure your module works correctly
5. **Publish a GitHub Release zip**: Add the module to `radio-module-catalog` (not npm)

### Documentation

- [Plugin Development](./plugin-development) - How to create radio modules
- [Architecture](./architecture) - Technical design details
- [API Reference](./api-reference) - Complete API documentation
- [Examples](./examples) - Usage examples and patterns

## Support

- **Documentation**: Comprehensive guides and examples
- **Community**: Active development community
- **Issues**: Report bugs and request features
- **Discussions**: Share ideas and get help

The Ham Radio Registry is designed to grow with the community. Whether you're building radio programming software, creating radio modules, or just exploring the ecosystem, the registry provides the foundation for a more connected and innovative ham radio community.

## Next Steps

- [Why Registry?](./why-registry) - Learn about the problems the registry solves
- [Architecture](./architecture) - Understand the technical architecture
- [Getting Started](./getting-started) - Set up and use the registry
- [Plugin Development](./plugin-development) - Create your own radio modules
- [API Reference](./api-reference) - Complete API documentation
- [Examples](./examples) - Code examples and use cases 
