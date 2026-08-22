# Radio Configuration Overview

This document provides an overview of the complete radio configuration system in the Springfield Ham Radio ecosystem. Radio configurations are JSON files that define all aspects of a radio's communication protocol, memory layout, data structures, and metadata.

## Configuration Components

A complete radio configuration consists of several interconnected components:

### 1. Protocol Definition
The core communication protocol that defines how to read from and write to the radio's memory.

**Documentation**: [Protocol DSL](../protocols/dsl.md)

**Key Elements**:
- `readMemory`: Array of protocol steps for reading radio memory
- `writeMemory`: Array of protocol steps for writing radio memory
- Step types: exchange (`send` / `expect`), `read`, `write`

### 2. Serial Configuration
Communication settings for the serial connection to the radio.

**Key Elements**:
- `baudRate`: Communication speed (e.g., 9600)
- `dataBits`: Number of data bits (typically 8)
- `stopBits`: Number of stop bits (typically 1)
- `parity`: Parity setting (typically "none")

### 3. Memory Configuration
Layout and organization of the radio's memory structure.

**Key Elements**:
- `chunkSize`: Size of memory chunks for read/write operations
- `addressSize` / `addressEndianness`: How `$address` is encoded on the wire
- `segments`: Named memory regions with inclusive `startAddress`–`endAddress` ranges

### 4. Schema Definitions
JSON schemas that define the structure and validation rules for radio data.

**Key Elements**:
- `settingsSchema`: Schema for radio settings data
- `channelSchema`: Schema for channel memory data
- Support for `$ref` references to shared schemas

### 5. Codec Configuration
Data encoding and decoding configuration for the radio's memory format.

**Key Elements**:
- `type`: "shared" or "inline"
- `reference`: Path to codec implementation file
- `config`: Codec-specific configuration parameters

### 6. Metadata
Information about the configuration and its source module.

**Key Elements**:
- `moduleId`: NPM module identifier
- `moduleVersion`: Version of the module
- `author`: Module author
- `license`: Module license
- `lastUpdated`: Timestamp of last update

## For Radio Module Developers

If you're developing a radio module to support a new radio model, this section provides everything you need to get started.

### Quick Start

1. **Create your module structure** (see directory structure below)
2. **Write your radio configuration** (see complete example below)
3. **Add package.json configuration** (see package.json example below)
4. **Publish to npm** with the `radio-module-` prefix

### Complete Radio Module Example

Here's a complete example for a Baofeng UV-5R radio module:

#### Directory Structure
```
@springfield/radio-module-baofeng/
├── package.json
├── configs/
│   ├── uv5r.json              # Complete configuration
│   ├── uv5r-plus.json         # Additional model
│   └── uv82.json              # Additional model
├── shared/
│   ├── schemas/
│   │   ├── channel-schema.json
│   │   └── settings-schema.json
│   ├── protocols/
│   │   └── handshake.json
│   └── codecs/
│       ├── baofeng-codec.ts
│       ├── baofeng-decoder.ts
│       └── baofeng-encoder.ts
├── src/
│   ├── index.ts
│   └── codec-factory.ts
└── README.md
```

#### Package.json
```json
{
  "name": "@springfield/radio-module-baofeng",
  "version": "1.0.0",
  "description": "Radio module for Baofeng UV-5R series",
  "keywords": ["ham-radio", "radio-module", "baofeng"],
  "main": "dist/index.js",
  "types": "dist/index.d.ts",
  "springfield": {
    "pluginType": "radio-module",
    "version": "1.0.0",
    "manufacturer": "Baofeng",
    "supportedRadios": ["uv5r", "uv5r-plus", "uv82"],
    "capabilities": {
      "dslProtocols": true,
      "customCodecs": true,
      "memoryRead": true,
      "memoryWrite": true,
      "sharedComponents": true
    },
    "configPath": "configs",
    "sharedPath": "shared",
    "codecFactory": "src/codec-factory.ts"
  },
  "files": [
    "configs/",
    "shared/",
    "dist/"
  ],
  "peerDependencies": {
    "@springfield/ham-radio-api": "^12.0.0"
  },
  "dependencies": {
    "@springfield/ham-radio-driver-utils": "^7.1.0",
    "loglayer": "^6.4.2"
  }
}
```

#### Complete Radio Configuration (configs/uv5r.json)
```json
{
  "$schema": "https://springfield-ham-radio.com/schemas/radio-config-v1.json",
  "id": {
    "model": "baofeng-uv5r",
    "name": "Baofeng UV-5R",
    "manufacturer": "Baofeng"
  },
  "version": "1.0.0",
  "description": "UV-5R and UV-5RE Plus models",
  "capabilities": {
    "dslProtocols": true,
    "customCodecs": true,
    "memoryRead": true,
    "memoryWrite": true,
    "sharedComponents": true
  },
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
        "endAddress": 6143,
        "description": "Channel memory"
      },
      "settings": {
        "startAddress": 7872,
        "endAddress": 8191,
        "description": "Radio settings"
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
      "description": "Write memory",
      "write": {
        "segments": ["channels", "settings"],
        "send": ["X", "$address", "$chunkSize", "$data"],
        "expect": "0x06"
      }
    }
  ],
  "settingsSchema": {
    "model": "baofeng-uv5r",
    "settingsSchema": {
      "$ref": "shared/schemas/settings-schema.json"
    },
    "channelSchema": {
      "$ref": "shared/schemas/channel-schema.json"
    }
  },
  "codec": {
    "type": "shared",
    "reference": "shared/codecs/baofeng-codec.ts",
    "config": {
      "channelSize": 16,
      "magicNumber": [80, 187, 255, 32, 18, 7, 37],
      "powerOffset": 14,
      "receiveFrequencyOffset": 0,
      "receiveToneOffset": 8,
      "transmitFrequencyOffset": 4,
      "transmitToneOffset": 10
    }
  },
  "metadata": {
    "moduleId": "@springfield/radio-module-baofeng",
    "moduleVersion": "1.0.0",
    "pluginPath": "configs",
    "lastUpdated": "2024-01-15T10:30:00Z",
    "author": "Springfield Ham Radio",
    "license": "MIT"
  }
}
```

#### Shared Schema Example (shared/schemas/channel-schema.json)
```json
{
  "$schema": "http://json-schema.org/draft-07/schema#",
  "type": "object",
  "properties": {
    "frequency": {
      "type": "number",
      "minimum": 136000000,
      "maximum": 174000000,
      "description": "Channel frequency in Hz"
    },
    "power": {
      "type": "string",
      "enum": ["low", "high"],
      "description": "Transmit power level"
    },
    "ctcss": {
      "type": "number",
      "minimum": 67.0,
      "maximum": 254.1,
      "description": "CTCSS tone frequency"
    }
  },
  "required": ["frequency"]
}
```

#### Codec Factory Example (src/codec-factory.ts)
```typescript
import type { RadioCodec, RadioModelId } from '@springfield/ham-radio-api';
import type { ILogLayer } from 'loglayer';
import { BaofengCodec } from '../shared/codecs/baofeng-codec.js';

export interface CodecFactory {
  createCodec(modelId: RadioModelId, config: any, logger: ILogLayer): Promise<RadioCodec>;
}

export class BaofengCodecFactory implements CodecFactory {
  async createCodec(modelId: RadioModelId, config: any, logger: ILogLayer): Promise<RadioCodec> {
    return new BaofengCodec(modelId, config, logger);
  }
}

export { BaofengCodecFactory as CodecFactory };
```

### Key Development Resources

- **[Protocol DSL Documentation](../protocols/dsl.md)**: Complete guide to writing protocol definitions
- **[Registry Configuration Guide](../registry/configuration.md)**: Detailed registry format specification
- **[Plugin Development Guide](../registry/plugin-development.md)**: Step-by-step plugin development tutorial
- **[Registry Architecture](../registry/architecture.md)**: Understanding how the registry system works

### Development Checklist

- [ ] Create module directory structure
- [ ] Write radio configuration(s) with protocol definitions
- [ ] Create shared schemas for data validation
- [ ] Implement codec factory and codec classes
- [ ] Configure package.json with springfield plugin settings
- [ ] Test configuration with radio driver
- [ ] Test module discovery with registry
- [ ] Publish to npm with appropriate naming

### Testing Your Module

```typescript
// Test with radio driver
import { RadioDriver } from '@springfield/ham-radio-driver';
import radioConfig from './configs/uv5r.json';

const driver = new RadioDriver(radioConfig, logger);
const memoryData = await driver.readRadio('/dev/ttyUSB0', progressIndicator);

// Test with registry
import { createRegistry } from '@springfield/ham-radio-registry';

const registry = createRegistry(logger);
await registry.installPlugin('@springfield/radio-module-baofeng');
const configs = await registry.discoverConfigurations();
const baofengConfig = await registry.getConfiguration('baofeng-uv5r');
```

## Configuration Formats

The system supports two main configuration formats:

### Basic DSL Format
Used by the radio driver for direct protocol execution.

```json
{
  "id": {
    "model": "baofeng-uv5r",
    "name": "Baofeng UV-5R",
    "manufacturer": "Baofeng"
  },
  "version": "1.0.0",
  "description": "Baofeng UV-5R radio configuration",
  "serialConfig": { ... },
  "memoryConfig": { ... },
  "readMemory": [ ... ],
  "writeMemory": [ ... ]
}
```

### Registry Format
Enhanced format used by the ham-radio-registry module for npm module distribution.

**Documentation**: [Registry Configuration](../registry/configuration.md)

```json
{
  "$schema": "https://springfield-ham-radio.com/schemas/radio-config-v1.json",
  "id": { ... },
  "capabilities": { ... },
  "serialConfig": { ... },
  "memoryConfig": { ... },
  "readMemory": [ ... ],
  "writeMemory": [ ... ],
  "settingsSchema": { ... },
  "codec": { ... },
  "metadata": { ... }
}
```

## Complete Example

Here's a complete example showing all configuration components:

```json
{
  "$schema": "https://springfield-ham-radio.com/schemas/radio-config-v1.json",
  "id": {
    "model": "baofeng-uv5r",
    "name": "Baofeng UV-5R",
    "manufacturer": "Baofeng"
  },
  "version": "1.0.0",
  "description": "UV-5R and UV-5RE Plus models",
  "capabilities": {
    "dslProtocols": true,
    "customCodecs": true,
    "memoryRead": true,
    "memoryWrite": true,
    "sharedComponents": true
  },
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
        "endAddress": 6143,
        "description": "Channel memory"
      },
      "settings": {
        "startAddress": 7872,
        "endAddress": 8191,
        "description": "Radio settings"
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
      "description": "Write memory",
      "write": {
        "segments": ["channels", "settings"],
        "send": ["X", "$address", "$chunkSize", "$data"],
        "expect": "0x06"
      }
    }
  ],
  "settingsSchema": {
    "model": "baofeng-uv5r",
    "settingsSchema": {
      "$ref": "shared/schemas/settings-schema.json"
    },
    "channelSchema": {
      "$ref": "shared/schemas/channel-schema.json"
    }
  },
  "codec": {
    "type": "shared",
    "reference": "shared/codecs/baofeng-codec.ts",
    "config": {
      "channelSize": 16,
      "magicNumber": [80, 187, 255, 32, 18, 7, 37],
      "powerOffset": 14,
      "receiveFrequencyOffset": 0,
      "receiveToneOffset": 8,
      "transmitFrequencyOffset": 4,
      "transmitToneOffset": 10
    }
  },
  "metadata": {
    "moduleId": "@springfield/radio-module-baofeng",
    "moduleVersion": "1.0.0",
    "pluginPath": "configs",
    "lastUpdated": "2024-01-15T10:30:00Z",
    "author": "Springfield Ham Radio",
    "license": "MIT"
  }
}
```

## Module Distribution

Radio configurations are distributed as npm modules with a standardized structure:

### Package.json Configuration
```json
{
  "name": "@springfield/radio-module-baofeng",
  "version": "1.0.0",
  "springfield": {
    "pluginType": "radio-module",
    "manufacturer": "Baofeng",
    "capabilities": { ... },
    "configPath": "configs",
    "sharedPath": "shared"
  }
}
```

### Directory Structure
```
@springfield/radio-module-baofeng/
├── package.json
├── configs/                    # Radio configuration files
│   ├── uv5r.json
│   └── uv5r-plus.json
├── shared/                     # Shared components
│   ├── schemas/
│   ├── protocols/
│   └── codecs/
└── src/                        # Module source code
```

## Related Documentation

- **[Protocol DSL](../protocols/dsl.md)**: Detailed documentation of the protocol definition language
- **[Registry Configuration](../registry/configuration.md)**: Documentation of the registry-specific configuration format
- **[Registry Architecture](../registry/architecture.md)**: Overview of the registry system architecture
- **[Plugin Development](../registry/plugin-development.md)**: Guide for developing radio module plugins

## Usage

### With Radio Driver
```typescript
import { RadioDriver } from '@springfield/ham-radio-driver';
import radioConfig from './configs/baofeng-uv5r.json';

const driver = new RadioDriver(radioConfig, logger);
const memoryData = await driver.readRadio('/dev/ttyUSB0', progressIndicator);
```

### With Registry
```typescript
import { createRegistry } from '@springfield/ham-radio-registry';

const registry = createRegistry(logger);
const configs = await registry.discoverConfigurations();
const baofengConfig = await registry.getConfiguration('baofeng-uv5r');
```

## Benefits

1. **Modular**: Each component is clearly defined and documented
2. **Extensible**: New radio types can be added through configuration
3. **Reusable**: Shared components can be used across multiple radio models
4. **Validated**: JSON schemas provide validation and IDE support
5. **Distributed**: Configurations can be distributed as npm modules
6. **Versioned**: Proper versioning and compatibility management
7. **Discoverable**: Automatic discovery of available radio configurations

--- 
