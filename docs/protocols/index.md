# Protocols & DSL Overview

The Springfield Ham Radio ecosystem uses a declarative, JSON-based Domain Specific Language (DSL) to define radio communication protocols. This approach enables radio-independent driver implementations and makes it easy to add support for new radios without duplicating protocol logic.

## Why a Protocol DSL?

- **Radio Independence**: Protocols are defined in configuration, not code, allowing a single driver to support many radios.
- **Maintainability**: Protocol changes don't require code changes—just update the JSON.
- **Extensibility**: New radio types can be added by providing new protocol definitions.
- **Documentation**: Protocols are self-documenting through their JSON structure.
- **Testability**: Protocol definitions can be unit tested independently.
- **Flexibility**: Supports any radio protocol format with variable-sized fields and multi-byte expressions.

## What You'll Find in the DSL Documentation

The [Protocol DSL](./dsl) documentation provides comprehensive coverage of:

### Core Concepts
- **DSL Structure**: How protocol definitions are organized
- **Protocol Steps**: All available step types (send/receive, read/write segments, etc.)
- **Data Types**: Literal values, variables, expressions, and multi-byte formats
- **Pattern Matching**: Different ways to handle received data

### Step Types
- **Send/Receive**: Combined send and receive operations
- **Send Only**: Data transmission without response
- **Receive Only**: Data reception without transmission
- **Read Segment**: Automatic memory segment reading with iteration
- **Write Segment**: Automatic memory segment writing with iteration
- **Variable Assignment**: Setting variables for use in subsequent steps

### Advanced Features
- **Multi-Byte Expressions**: Proper handling of addresses and large values
- **Pattern Matching**: Flexible response parsing with variable-sized fields
- **Segment Management**: Automatic iteration through memory segments
- **Expression Language**: Arithmetic, bitwise, and logical operations

### Complete Examples
- **Baofeng UV-5R**: Full read and write protocol examples
- **Implementation Architecture**: TypeScript interfaces and class structures
- **Migration Strategy**: How to transition from hard-coded drivers

## Integration with the Ecosystem

- **Registry Integration**: How protocols are discovered and loaded via the registry
- **Driver Architecture**: How the generic driver interprets protocol definitions
- **Testing**: Best practices for testing protocol definitions
- **Validation**: JSON schema validation for protocol definitions

## Next Steps

- Learn the [Protocol DSL](./dsl) in detail to understand all available features
- See how protocols integrate with the [Registry Architecture](/registry/architecture)
- Explore the [Development Guide](/development-guide) for implementation details
- Try creating your own protocol definitions for new radio types 
