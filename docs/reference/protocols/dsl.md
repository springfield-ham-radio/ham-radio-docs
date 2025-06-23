# Protocol DSL

This page documents the JSON-based Domain Specific Language (DSL) for defining radio communication protocols in the Springfield Ham Radio ecosystem. The DSL enables generic, radio-independent drivers and makes it easy to add support for new radios by providing protocol definitions in configuration files.

## Overview

The Protocol DSL is a declarative, JSON-based Domain Specific Language that describes radio communication protocols. It allows for radio-independent driver implementations that can support multiple radio types through configuration rather than hard-coded protocol logic.

## Problem Statement

Traditional radio driver implementations are tightly coupled to specific radio protocols. To support additional radio types, new driver classes must be created with duplicated protocol logic. This approach doesn't scale well and makes it difficult to maintain consistency across different radio implementations.

## Solution

The DSL creates a declarative approach where communication protocols are defined in JSON configuration files. The driver implementation becomes a generic interpreter that executes protocol steps defined in these configuration files.

## Configuration Structure

The protocol DSL is one component of a larger radio configuration system. A complete radio configuration includes:

- **Protocol Definition**: The DSL protocol steps (this document)
- **Serial Configuration**: Communication settings
- **Memory Configuration**: Memory layout and segments
- **Schema Definitions**: Data structure validation
- **Codec Configuration**: Data encoding/decoding
- **Metadata**: Module and version information

For a complete overview of radio configuration structure, see the [Radio Configuration Overview](../configuration/overview.md).

## DSL Structure

### Root Configuration

Each protocol definition starts with a root configuration object that defines the radio model, serial settings, memory layout, and protocol steps.

```json
{
  "radioModel": "baofeng-uv5r",
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
  "readMemory": [...],
  "writeMemory": [...]
}
```

## Protocol Steps

Each step in the protocol is defined as an object with a single key representing the step type and a value containing the step configuration. The system uses a priority-based executor registry to automatically select the appropriate executor for each step type.

### 1. Send/Receive Step

Combines sending data and receiving a response in a single atomic operation.

```json
{
  "sendReceive": {
    "send": [0x50, 0xbb, 0xff, 0x20, 0x12, 0x07, 0x25],
    "receive": {
      "type": "exact",
      "value": 0x06,
      "length": 1
    },
    "timeout": 5000,
    "description": "Send magic number and expect ACK"
  }
}
```

### 2. Send Only Step

Sends data without expecting a response.

```json
{
  "send": {
    "data": [0x02],
    "description": "Request radio identifier"
  }
}
```

### 3. Receive Only Step

Receives data without sending anything first.

```json
{
  "receive": {
    "length": 8,
    "description": "Receive radio identifier"
  }
}
```

### 4. Read Segment Command

Handles reading memory segments with automatic iteration through all segments.

```json
{
  "readSegment": {
    "segments": ["channels", "settings"],
    "startChunk": {
      "send": ["S", "address:2", "segment.chunkSize"],
      "receive": {
        "type": "pattern",
        "pattern": [
          "X",                           // Literal 'X' (0x58) - 1 byte
          { "field": "address", "size": 2 },  // Address (high + low) - 2 bytes
          { "field": "length", "size": 1 },   // Length - 1 byte
          { "field": "data", "size": 0 }      // Data (variable size) - rest of response
        ]
      }
    },
    "endChunk": {
      "send": [0x06],
      "receive": {
        "type": "exact",
        "value": 0x06,
        "length": 1
      }
    },
    "description": "Read all memory segments"
  }
}
```

### 5. Write Segment Command

Handles writing memory segments with automatic iteration through all segments.

```json
{
  "writeSegment": {
    "segments": ["channels", "settings"],
    "send": ["X", "segment.startAddress:2", "segment.chunkSize"],
    "data": "segment.data",
    "receive": {
      "type": "exact",
      "value": 0x06,
      "length": 1
    },
    "description": "Write all memory segments"
  }
}
```

### 6. Variable Assignment

Sets variables for use in subsequent steps.

```json
{
  "setVariable": {
    "name": "nextAddress",
    "value": "0x0000"
  }
}
```

## Complete Examples

### Baofeng UV-5R Read Protocol

```json
{
  "radioModel": "baofeng-uv5r",
  "version": "1.0.0",
  "description": "Baofeng UV-5R radio configuration",
  "serialConfig": {
    "baudRate": 9600
  },
  "memoryConfig": {
    "chunkSize": 64,
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
      "sendReceive": {
        "send": [0x50, 0xbb, 0xff, 0x20, 0x12, 0x07, 0x25],
        "receive": {
          "type": "exact",
          "value": 0x06,
          "length": 1
        },
        "description": "Send magic number"
      }
    },
    {
      "sendReceive": {
        "send": [0x02],
        "receive": {
          "type": "variable",
          "length": 8
        },
        "description": "Get radio identifier"
      }
    },
    {
      "sendReceive": {
        "send": [0x06],
        "receive": {
          "type": "exact",
          "value": 0x06,
          "length": 1
        },
        "description": "Begin clone operation"
      }
    },
    {
      "readSegment": {
        "segments": ["channels", "settings"],
        "startChunk": {
          "send": ["S", "address:2", "segment.chunkSize"],
          "receive": {
            "type": "pattern",
            "pattern": [
              "X",
              { "field": "address", "size": 2 },
              { "field": "length", "size": 1 },
              { "field": "data", "size": 0 }
            ]
          }
        },
        "endChunk": {
          "send": [0x06],
          "receive": {
            "type": "exact",
            "value": 0x06,
            "length": 1
          }
        },
        "description": "Read all memory segments"
      }
    }
  ]
}
```

### Write Protocol Example

```json
{
  "writeMemory": [
    {
      "sendReceive": {
        "send": [0x50, 0xbb, 0xff, 0x20, 0x12, 0x07, 0x25],
        "receive": {
          "type": "exact",
          "value": 0x06,
          "length": 1
        }
      }
    },
    {
      "writeSegment": {
        "segments": ["channels", "settings"],
        "send": ["X", "segment.startAddress:2", "segment.chunkSize"],
        "data": "segment.data",
        "receive": {
          "type": "exact",
          "value": 0x06,
          "length": 1
        },
        "description": "Write all memory segments"
      }
    }
  ]
}
```

## Data Types and Expressions

### Literal Values
- **Numbers**: `123`, `0x1a`, `0b1010`
- **Strings**: `"hello"`, `'world'`
- **Arrays**: `[1, 2, 3]`, `[0x50, 0xbb]`
- **Booleans**: `true`, `false`

### Variables
- **Reference**: `"variableName"` (resolved from context variables map)
- **Assignment**: `"setVariable"` step type

### Expressions
The system uses a factory pattern with multiple resolvers in priority order:

1. **Context Variables**: `"address"`, `"segment.chunkSize"`, `"segment.startAddress"`, `"segment.endAddress"`, `"segment.data"`, `"lastReceivedData"`
2. **Variables Map**: Any string not matching context variables or character codes
3. **Character Codes**: `"'A'"` (converts to ASCII code 65)
4. **Default**: Returns expression unchanged

### Multi-Byte Expressions
- **Format**: `"expression:size"` where `expression` is resolved to a number and `size` is the number of bytes
- **Byte Order**: Little-endian (least significant byte first)
- **Examples**:
  - `"address:2"` - Converts address to 2 bytes (e.g., 0x1000 becomes [0x00, 0x10])
  - `"segment.startAddress:3"` - Converts start address to 3 bytes
  - `"0x12345678:4"` - Converts literal value to 4 bytes

### Special Values
- **Dynamic**: `"address"` (current address being processed, automatically formatted as needed)
- **Received**: `"lastReceivedData"` (last received data)
- **Segment**: `"segment.data"` (current segment data)
- **Segment Properties**: `"segment.startAddress"`, `"segment.endAddress"`, `"segment.chunkSize"` (current segment properties)

## Receive Pattern Types

### 1. Exact Match
Expects a specific value of a specific length.

```json
{
  "type": "exact",
  "value": 0x06,
  "length": 1
}
```

### 2. Variable Length
Receives a fixed number of bytes.

```json
{
  "type": "variable",
  "length": 8
}
```

### 3. Pattern Match
Receives data matching a specific pattern with variable-sized fields.

```json
{
  "type": "pattern",
  "pattern": [
    "X",                           // Literal value (1 byte)
    { "field": "address", "size": 2 },  // 2-byte address
    { "field": "length", "size": 1 },   // 1-byte length
    { "field": "data", "size": 0 }      // Variable data (rest of response)
  ]
}
```

**Pattern Elements:**
- **Literal Values**: `string` or `number` - Fixed values that must match exactly (1 byte each)
- **Fields**: `{ field: string; size: number }` - Variable data with specified size
  - `size: 0` indicates variable-length data (rest of response)
  - `size: n` indicates exactly n bytes for fixed-size fields

**Data Length:**
- The length of the data portion (where `size: 0`) is always determined by the segment configuration (e.g., `chunkSize`).
- There is no `dataLength` property in the pattern definition; the driver will use the segment's chunk size for the data portion.

**Examples:**
- **Baofeng UV-5R**: `[X][address_2bytes][length_1byte][data...]` (data length = segment.chunkSize)
- **Alternative Format**: `[0xFF][address_3bytes][length_2bytes][data...]` (data length = segment.chunkSize)
- **Simple Protocol**: `[ACK][data...]` (data length = segment.chunkSize)

### 4. Any Value
Accepts any value of a specific length.

```json
{
  "type": "any",
  "length": 1
}
```

## Implementation Architecture

### 1. Protocol Interpreter

The `ProtocolInterpreter` class manages the execution of protocol steps:

```typescript
class ProtocolInterpreter {
  async executeProtocol(protocol: any, operation: 'readMemory' | 'writeMemory', buffer?: Uint8Array): Promise<void>;
  registerExecutor(executor: StepExecutor): void;
}
```

### 2. Protocol Context

The `ProtocolContext` interface provides the execution environment:

```typescript
interface ProtocolContext {
  port: SerialPort;
  variables: Map<string, any>;
  memoryBuffer: Uint8Array;
  bufferOffset: number;
  memoryConfig: RadioMemoryConfig;
  currentSegment?: {
    name: string;
    config: RadioMemorySegment;
    currentAddress: number;
  };
  logger: ILogLayer;
  uiLogger?: UILogger;
  progressIndicator: RadioProgressIndicator;
}
```

### 3. Step Executor Registry

The `StepExecutorRegistry` uses a priority-based system to automatically select executors:

```typescript
class StepExecutorRegistry {
  private executors: StepExecutor[] = [
    new SendReceiveExecutor(),    // Highest priority (most specific)
    new SendExecutor(),
    new ReceiveExecutor(),
    new ReadSegmentExecutor(),
    new WriteSegmentExecutor(),
    new SetVariableExecutor(),    // Lowest priority (most general)
  ];
  
  async executeStep(step: RadioProtocolStep, context: ProtocolContext): Promise<void>;
  registerExecutor(executor: StepExecutor): void;
}
```

### 4. Step Executors

Each executor implements the `StepExecutor` interface:

```typescript
interface StepExecutor {
  canExecute(step: RadioProtocolStep): boolean;
  execute(step: RadioProtocolStep, context: ProtocolContext): Promise<void>;
}
```

### 5. Expression Resolution

The system uses a factory pattern with multiple resolvers:

```typescript
class ExpressionResolverFactory {
  private static readonly resolvers: ExpressionResolver[] = [
    new ContextVariableResolver(),
    new VariablesMapResolver(),
    new CharacterCodeResolver(),
    new DefaultResolver(),
  ];
  
  static resolve(expression: string | number, context: ProtocolContext): string | number;
}
```

### 6. Receive Pattern Validation

The system uses a factory pattern for pattern validation:

```typescript
class ReceivePatternValidatorFactory {
  private static validators: ReceivePatternValidator[] = [
    new ExactReceivePatternValidator(),
    new VariableReceivePatternValidator(),
    new PatternReceivePatternValidator(),
    new AnyReceivePatternValidator()
  ];
  
  static getValidator(pattern: RadioReceivePattern): ReceivePatternValidator;
}
```

### 7. Radio Driver

The `RadioDriver` class provides the high-level interface:

```typescript
class RadioDriver {
  constructor(radio: Radio, logger: ILogLayer, uiLogger?: UILogger);
  async readRadio(serialPortPath: string, progressIndicator: RadioProgressIndicator): Promise<Uint8Array>;
  async writeRadio(serialPortPath: string, data: Uint8Array, progressIndicator: RadioProgressIndicator): Promise<void>;
}
```

## Command-Specific Logic

### Read Segment Command
The `ReadSegmentExecutor` handles:
- Iterating through all memory segments in order
- Managing address transitions between segments
- Handling the start/end chunk protocol for each segment
- Accumulating chunk logs for UI display
- Returning complete segment data

### Write Segment Command
The `WriteSegmentExecutor` handles:
- Iterating through all memory segments in order
- Sending segment data with proper addressing
- Managing acknowledgments for each segment
- Handling completion when all segments are written

## Benefits

1. **Radio Independence**: Single driver implementation supports multiple radio types
2. **Declarative**: Protocol logic is defined in configuration, not code
3. **Maintainable**: Protocol changes don't require code changes
4. **Testable**: Protocol definitions can be unit tested independently
5. **Extensible**: New radio types can be added without code changes
6. **Documentation**: Protocol is self-documenting through JSON structure
7. **Simplified**: No explicit loop constructs needed - commands handle iteration internally
8. **Generic Patterns**: Variable-sized placeholders support any radio protocol format
9. **Flexible**: Each protocol can define its own response structure with explicit sizes
10. **Multi-Byte Support**: Proper handling of addresses and other multi-byte values with explicit byte counts
11. **Priority-Based Execution**: Automatic executor selection based on step content
12. **Factory Pattern**: Extensible expression resolution and pattern validation
13. **Template Method**: Consistent operation flow with specialized behavior
14. **Strategy Pattern**: Different validation approaches for different pattern types

## Migration Strategy

1. **Phase 1**: Create DSL specification and interpreter ✅
2. **Phase 2**: Convert Baofeng driver to use DSL ✅
3. **Phase 3**: Add support for additional radio types
4. **Phase 4**: Deprecate hard-coded drivers

## Future Enhancements

1. **Validation**: JSON schema validation for protocol definitions
2. **Visual Editor**: GUI for creating protocol definitions
3. **Protocol Library**: Repository of radio protocol definitions
4. **Versioning**: Protocol version management and migration
5. **Testing Framework**: Automated protocol testing and validation
6. **Custom Executors**: Support for user-defined step executors
7. **Protocol Composition**: Ability to compose protocols from reusable components
8. **Real-time Monitoring**: Live protocol execution monitoring and debugging

--- 
