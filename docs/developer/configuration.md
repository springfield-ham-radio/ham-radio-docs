# Radio Configuration Overview

This document provides an overview of the complete radio configuration system in the HamBench ecosystem. Radio configurations are JSON files that define all aspects of a radio's communication protocol, memory layout, data structures, and metadata.

## Configuration Components

A complete radio configuration consists of several interconnected components:

### 1. Protocol Definition
The core communication protocol that defines how to read from and write to the radio's memory.

**Documentation**: [Protocol DSL](/developer/protocols/dsl)

**Key Elements**:
- `readMemory`: Array of protocol steps for reading radio memory
- `writeMemory`: Array of protocol steps for writing radio memory
- Step types: exchange (`send` / `expect`), `read`, `write`

### 2. Serial Configuration
Communication settings for the serial connection to the radio.

**Key Elements**:
- `baudRate`: Default communication speed used to open the programming port (e.g., 9600)
- `baudRates`: Optional list of baud rates the radio accepts. When more than one value is listed, HamBench lets the user choose on import and write. `baudRate` is the default selection.
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
HamBench encodes and decodes with the generic memory-map codec. The module points at a JSON map; it does not ship TypeScript.

**Key Elements**:
- `codec.type`: `"memoryMap"`
- `memoryMap.$ref`: path to the memory-map JSON under `src/shared/memory-maps/`

### 6. Metadata
Information about the configuration and its source module.

**Key Elements**:
- `moduleId`: Package identifier
- `moduleVersion`: Version of the module
- `author`: Module author
- `license`: Module license
- `lastUpdated`: Timestamp of last update

The radio JSON also has a top-level `version`. That is this radio's driver version (protocol, serial, memory, and the schemas and memory maps it references). Bump it in the same change that edits those files. It is independent of `package.json`, which is the module zip version. `metadata.moduleVersion` is filled in when the registry loads a packaged module.

## For Radio Module Developers

If you're developing a radio module to support a new radio model, this section provides everything you need to get started.

### Quick Start

1. **Create your module structure** (see directory structure below)
2. **Write your radio configuration** (see complete example below)
3. **Add package.json configuration** (see package.json example below)
4. **Publish a GitHub Release zip** and add the module to `radio-module-catalog`

### Complete Radio Module Example

Here's a complete example for a Baofeng UV-5R radio module:

#### Directory Structure
```
radio-module-baofeng/
├── package.json
├── configs/
│   └── baofeng-uv5r.json
├── src/shared/
│   ├── schemas/
│   │   ├── channel-schema.json
│   │   └── settings-schema.json
│   └── memory-maps/
│       └── uv5r-settings.json
└── test/
```

#### Package.json
```json
{
  "name": "@springfield/radio-module-baofeng",
  "version": "1.0.0",
  "description": "JSON radio module for Baofeng UV-5R",
  "files": ["configs/", "src/shared/schemas/", "src/shared/memory-maps/"],
  "springfield": {
    "pluginType": "radio-module",
    "manufacturer": "Baofeng",
    "configPath": "configs",
    "sharedPath": "src/shared",
    "capabilities": {
      "dslProtocols": true,
      "memoryRead": true,
      "memoryWrite": true
    }
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
    "memoryRead": true,
    "memoryWrite": true,
    "channelProgramming": true,
    "settingsProgramming": true
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
        "delay": 50,
        "ready": "0x06",
        "ack": {
          "send": ["0x06"],
          "expect": "0x06",
          "timeout": 50
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
  "memoryMap": {
    "$ref": "../src/shared/memory-maps/uv5r-settings.json"
  },
  "codec": {
    "type": "memoryMap"
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

### Key Development Resources

- **[Protocol DSL Documentation](/developer/protocols/dsl)**: Complete guide to writing protocol definitions
- **[Registry Configuration Guide](/developer/configuration)**: Detailed registry format specification
- **[Plugin Development Guide](/developer/registry/plugin-development)**: Step-by-step plugin development tutorial
- **[Registry Architecture](/developer/registry/architecture)**: Understanding how the registry system works

### Development Checklist

- [ ] Create module directory structure
- [ ] Write radio configuration(s) with protocol definitions
- [ ] Create shared schemas and a memory-map JSON
- [ ] Set `codec.type` to `"memoryMap"`
- [ ] Configure package.json with springfield plugin settings
- [ ] Test configuration with radio driver
- [ ] Test module discovery with registry
- [ ] Publish a GitHub Release zip and update radio-module-catalog

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
Enhanced format used by the registry (same JSON files; not a separate npm plugin).

**Documentation**: [Registry Configuration](/developer/configuration)

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
    "memoryRead": true,
    "memoryWrite": true,
    "channelProgramming": true,
    "settingsProgramming": true
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
        "delay": 50,
        "ready": "0x06",
        "ack": {
          "send": ["0x06"],
          "expect": "0x06",
          "timeout": 50
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
  "memoryMap": {
    "$ref": "../src/shared/memory-maps/uv5r-settings.json"
  },
  "codec": {
    "type": "memoryMap"
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

Radio modules are JSON zips on GitHub Releases. See [Publish a module](/developer/publishing-modules).

### Directory Structure
```
radio-module-baofeng/
├── package.json
├── configs/
│   └── baofeng-uv5r.json
└── src/shared/
    ├── schemas/
    └── memory-maps/
```

## Related Documentation

- **[Protocol DSL](/developer/protocols/dsl)**: Detailed documentation of the protocol definition language
- **[Registry Configuration](/developer/configuration)**: Documentation of the registry-specific configuration format
- **[Registry Architecture](/developer/registry/architecture)**: Overview of the registry system architecture
- **[Plugin Development](/developer/registry/plugin-development)**: Guide for developing radio module plugins

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
5. **Distributed**: Configurations ship as JSON zips on GitHub Releases
6. **Versioned**: Proper versioning and compatibility management
7. **Discoverable**: Automatic discovery of available radio configurations

--- 
