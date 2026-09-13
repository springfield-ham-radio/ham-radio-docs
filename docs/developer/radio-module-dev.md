# Radio Module Development

This section provides everything you need to create radio modules for the HamBench ecosystem.

## Quick Start

### 1. Module Structure
Create a new module repository with this structure (JSON only; no radio-specific TypeScript):
```
radio-module-example/
├── package.json
├── configs/
│   └── example-radio.json
├── src/
│   ├── index.ts
│   ├── codec-factory.ts
│   └── shared/
│       ├── codecs/
│       └── schemas/
└── test/
    ├── integration/
    └── unit/
```

### 2. Package Configuration
```json
{
  "name": "@springfield/radio-module-example",
  "version": "1.0.0",
  "description": "Example radio module",
  "springfield": {
    "pluginType": "radio-module",
    "manufacturer": "Example",
    "capabilities": {
      "readMemory": true,
      "writeMemory": true,
      "frequencyRange": "144-148 MHz"
    }
  }
}
```

### 3. Radio Configuration
Create `configs/example-radio.json`:
```json
{
  "id": {
    "model": "example-radio",
    "name": "Example Radio",
    "manufacturer": "Example"
  },
  "version": "1.0.0",
  "description": "Example radio configuration",
  "serialConfig": {
    "baudRate": 9600,
    "dataBits": 8,
    "stopBits": 1,
    "parity": "none"
  },
  "memoryConfig": {
    "chunkSize": 64,
    "addressSize": 2,
    "addressEndianness": "big",
    "segments": {
      "channels": {
        "startAddress": 0,
        "endAddress": 1023
      }
    }
  },
  "readMemory": [
    {
      "send": ["0x02"],
      "expect": "0x06"
    }
  ]
}
```

If the radio's programming port accepts more than one baud rate, list them as `serialConfig.baudRates` and set `baudRate` to the default. HamBench shows a selector on import and write when more than one value is listed.

## Core Concepts

### Radio Configuration
A complete radio configuration includes:

- **Protocol Definition**: Communication protocol using the DSL
- **Serial Configuration**: Communication settings (`baudRate` default, optional `baudRates` list for radios that accept more than one programming speed)
- **Memory Configuration**: Memory layout and segments
- **Schema Definitions**: Data structure validation
- **Codec Configuration**: Data encoding/decoding
- **Metadata**: Module and version information

### Protocol DSL
The Domain-Specific Language for defining radio communication protocols:

- **Step types**: exchange (`send` / `expect`), `read`, `write`
- **Tokens**: hex (`"0x50"`), ASCII opcodes (`"S"`), placeholders (`$address`, `$data`)
- **Expect**: exact byte, `{ "bytes": N }`, or a framed pattern with `$` slots

### Registry Integration
The registry automatically discovers and manages your module:

- **Discovery**: The desktop app installs JSON zips from GitHub Releases. In Node, the registry can scan workspace packages.
- **Validation**: Validates configurations and capabilities
- **Access**: Provides unified access to radio configurations
- **Distribution**: Supports npm-based distribution

## Development Guide

### 1. Configuration Overview
Start with the [Configuration Overview](/developer/configuration) to understand the complete configuration structure and how all components work together.

### 2. Protocol DSL
Learn the [Protocol DSL](/developer/protocols/dsl) for defining radio communication protocols:
- Step-by-step protocol definition
- Expression resolution and pattern matching
- Complete examples and best practices

### 3. Registry Configuration
Understand [Registry Configuration](/developer/configuration) for module discovery and management:
- Package.json plugin configuration
- Capabilities and metadata
- Module directory structure

### 4. Plugin Development
Follow the [Plugin Development Guide](/developer/registry/plugin-development) for advanced module development:
- Shared component references
- Codec factory implementation
- Testing and validation

## Complete Example

### Directory Structure
```
radio-module-baofeng/
├── package.json
├── configs/
│   └── baofeng-uv5r.json
├── src/
│   └── shared/
│       ├── schemas/
│       │   ├── channel-schema.json
│       │   └── settings-schema.json
│       └── memory-maps/
│           └── uv5r-settings.json
└── test/
    ├── integration/
    └── unit/
```

### Package.json
```json
{
  "name": "@springfield/radio-module-baofeng",
  "version": "1.0.0",
  "description": "Baofeng radio module",
  "main": "src/index.ts",
  "types": "src/index.ts",
  "springfield": {
    "pluginType": "radio-module",
    "manufacturer": "Baofeng",
    "capabilities": {
      "readMemory": true,
      "writeMemory": true,
      "frequencyRange": "136-174 MHz",
      "powerOutput": "4W"
    }
  },
  "dependencies": {
    "@springfield/ham-radio-utils": "^1.0.0"
  },
  "devDependencies": {
    "@types/node": "^20.0.0",
    "typescript": "^5.0.0"
  }
}
```

### Full Configuration
```json
{
  "id": {
    "model": "baofeng-uv5r",
    "name": "Baofeng UV-5R",
    "manufacturer": "Baofeng"
  },
  "version": "1.0.0",
  "description": "Baofeng UV-5R radio configuration",
  "serialConfig": {
    "baudRate": 9600,
    "dataBits": 8,
    "stopBits": 1,
    "parity": "none"
  },
  "memoryConfig": {
    "chunkSize": 64,
    "addressSize": 2,
    "addressEndianness": "big",
    "segments": {
      "channels": {
        "startAddress": 0,
        "endAddress": 6143
      },
      "settings": {
        "startAddress": 7872,
        "endAddress": 8191
      }
    }
  },
  "readMemory": [
    {
      "description": "Send magic number",
      "send": ["0x50", "0xBB", "0xFF", "0x20", "0x12", "0x07", "0x25"],
      "expect": "0x06"
    },
    {
      "description": "Read memory",
      "read": {
        "segments": ["channels", "settings"],
        "send": ["S", "$address", "$chunkSize"],
        "expect": ["X", "$address", "$length", "$data"],
        "ack": {
          "send": ["0x06"],
          "expect": "0x06"
        }
      }
    }
  ],
  "writeMemory": [
    {
      "description": "Send magic number",
      "send": ["0x50", "0xBB", "0xFF", "0x20", "0x12", "0x07", "0x25"],
      "expect": "0x06"
    },
    {
      "description": "Get radio identifier",
      "send": ["0x02"],
      "expect": { "bytes": 8 }
    },
    {
      "description": "Begin clone operation",
      "send": ["0x06"],
      "expect": "0x06"
    },
    {
      "description": "Write memory",
      "write": {
        "segments": ["channels", "settings"],
        "chunkSize": 16,
        "delay": 50,
        "skip": [
          { "startAddress": 3312, "endAddress": 3327 },
          { "startAddress": 3568, "endAddress": 3583 }
        ],
        "send": ["X", "$address", "$length", "$data"],
        "expect": "0x06"
      }
    }
  ]
}
```

### Shared Schema
```json
{
  "type": "object",
  "properties": {
    "frequency": {
      "type": "number",
      "minimum": 136000000,
      "maximum": 174000000
    },
    "name": {
      "type": "string",
      "maxLength": 7
    }
  },
  "required": ["frequency", "name"]
}
```

### Codec Factory
```typescript
import { CodecFactory, RadioCodec } from '@springfield/ham-radio-utils';

export class BaofengCodecFactory implements CodecFactory {
  createCodec(radioModel: string): RadioCodec {
    return new BaofengCodec();
  }
}

export default BaofengCodecFactory;
```

## Development Resources

### Documentation
- **[Configuration Overview](/developer/configuration)**: Complete configuration structure
- **[Protocol DSL](/developer/protocols/dsl)**: Protocol definition language
- **[Registry Configuration](/developer/configuration)**: Module discovery and management
- **[Plugin Development](/developer/registry/plugin-development)**: Advanced development guide

### Examples
- **Baofeng Module**: Complete working example in the `radio-module-baofeng` package
- **Integration Tests**: See `test/integration/` for working examples
- **Unit Tests**: See `test/unit/` for component testing

### Best Practices
- **Naming**: Use `radio-module-{manufacturer}` naming convention
- **Versioning**: Follow semantic versioning for module releases. Radio JSON `version` is stamped from the package version on release; do not bump it by hand.
- **Testing**: Include both unit and integration tests
- **Documentation**: Provide clear examples and documentation
- **Validation**: Use JSON schemas for data validation

## Testing

### Integration Testing
```typescript
import { describe, it } from 'node:test';
import { expect } from 'chai';
import { createRegistry } from '@springfield/ham-radio-registry';

describe('Baofeng Module Integration', () => {
  it('should discover baofeng configuration', async () => {
    const registry = createRegistry(logger);
    const configs = await registry.discoverConfigurations();
    
    const baofengConfig = configs.find(c => c.radioModel === 'baofeng-uv5r');
    expect(baofengConfig).to.exist;
    expect(baofengConfig.manufacturer).to.equal('Baofeng');
  });
});
```

### Unit Testing
```typescript
import { describe, it } from 'node:test';
import { expect } from 'chai';
import { BaofengCodecFactory } from '../src/codec-factory';

describe('BaofengCodecFactory', () => {
  it('should create baofeng codec', () => {
    const factory = new BaofengCodecFactory();
    const codec = factory.createCodec('baofeng-uv5r');
    
    expect(codec).to.exist;
    expect(codec.constructor.name).to.equal('BaofengCodec');
  });
});
```

## Distribution

### GitHub Release zip

Official modules ship a JSON-only zip (`configs/`, `src/shared/schemas/`, `src/shared/memory-maps/`) on GitHub Releases (`yarn pack:release`). They are not published to npm.

Each radio JSON has a top-level `version` field. That is the **module** version HamBench shows when you install a config from a file. Do not edit it by hand. `yarn pack:release` and semantic-release stamp `package.json`'s version into every `configs/*.json` before the zip is built, and the release commit includes those files.

Update the official catalog after each release. Desktop users install from the app (**Preferences → Radios**). See [Installing Radio Modules](/guide/install-radios).

## Getting Help

### Documentation
- All documentation is available in the sidebar navigation
- Check the examples for working code samples
- Use the search functionality to find specific topics

### Community
- **GitHub**: [springfield-ham-radio](https://github.com/springfield-ham-radio)
- **Issues**: Report bugs and request features
- **Discussions**: Ask questions and share ideas

### Development Tools
- **TypeScript**: Full TypeScript support with type definitions
- **Testing**: Comprehensive test suites and examples
- **Debugging**: Built-in logging and debugging support

---

Ready to start? Check out the [Configuration Overview](/developer/configuration#for-radio-module-developers) for a detailed quick start guide! 
