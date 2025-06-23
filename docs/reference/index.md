# Reference Documentation

This section provides comprehensive reference documentation for the Springfield Ham Radio ecosystem. These documents contain detailed technical information, specifications, and complete API references.

## Quick Access

### Core System Documentation
- **[Registry System](/registry/)** - Module discovery, management, and plugin architecture
- **[Protocol DSL](/protocols/dsl)** - Domain-specific language for radio communication protocols
- **[Configuration Format](/configuration/overview)** - Radio configuration structure and components

## Reference Documentation

### Architecture Reference
- **[Architecture Reference](/reference/architecture)**: Complete system architecture, design patterns, and implementation details
- **[Module Comparison](/module-comparison)**: Detailed comparison of different module types and their purposes
- **[Documentation Standards](/documentation-guide)**: Standards and practices for writing documentation

## System Components

### Registry System
The registry provides automatic discovery and management of radio modules:

- **[Registry Overview](/registry/)**: System overview and key concepts
- **[Registry Architecture](/registry/architecture)**: Detailed architecture and implementation
- **[Why Registry?](/registry/why-registry)**: Design rationale and benefits
- **[Getting Started](/registry/getting-started)**: Quick start guide for registry usage
- **[Plugin Development](/registry/plugin-development)**: Guide for creating plugins
- **[API Reference](/registry/api-reference)**: Complete API documentation
- **[Examples](/registry/examples)**: Working examples and use cases

### Protocol DSL
The Domain-Specific Language for defining radio communication protocols:

- **[Protocol DSL](/protocols/dsl)**: Complete language reference with examples
- **[Protocol Overview](/protocols/)**: High-level overview and concepts

### Configuration Format
Understanding how radio configurations are structured and managed:

- **[Configuration Overview](/configuration/overview)**: Complete configuration structure and components
- **[For Radio Module Developers](/configuration/overview#for-radio-module-developers)**: Quick start guide for module development

## Quick Reference

### Registry Usage
```typescript
import { createRegistry } from '@springfield/ham-radio-registry';

const registry = createRegistry(logger);
const configs = await registry.discoverConfigurations();
const radioConfig = await registry.getConfiguration('baofeng-uv5r');
```

### Protocol DSL Examples
```json
{
  "sendReceive": {
    "send": [0x50, 0xbb, 0xff, 0x20, 0x12, 0x07, 0x25],
    "receive": {
      "type": "exact",
      "value": 0x06,
      "length": 1
    }
  }
}
```

### Configuration Structure
```json
{
  "radioModel": "example-radio",
  "version": "1.0.0",
  "manufacturer": "Example",
  "serialConfig": { ... },
  "memoryConfig": { ... },
  "readMemory": [ ... ],
  "writeMemory": [ ... ]
}
```

## API References

### Core APIs
- **Registry API**: Module discovery and management
- **Driver API**: Radio communication and memory operations
- **Protocol API**: Step execution and context management
- **Codec API**: Data encoding and decoding

### Type Definitions
- **Radio Configuration**: Complete configuration type definitions
- **Protocol Steps**: All step types and their properties
- **Registry Types**: Plugin and configuration types
- **Utility Types**: Shared utility type definitions

## Implementation Details

### Architecture Patterns
- **Factory Pattern**: Codec and executor creation
- **Strategy Pattern**: Protocol step execution
- **Template Method**: Operation flow control
- **Registry Pattern**: Module discovery and management

### Design Principles
- **Separation of Concerns**: Clear module boundaries
- **Extensibility**: Plugin-based architecture
- **Type Safety**: Full TypeScript support
- **Testability**: Comprehensive testing support

## Standards and Conventions

### Naming Conventions
- **Modules**: `radio-module-{manufacturer}`
- **Packages**: `@springfield/{module-name}`
- **Configurations**: `{radio-model}.json`
- **Schemas**: `{data-type}-schema.json`

### File Organization
- **Configs**: Radio configuration files
- **Schemas**: JSON schema definitions
- **Codecs**: Encoding/decoding implementations
- **Tests**: Unit and integration tests

### Documentation Standards
- **API Documentation**: Comprehensive type definitions
- **Examples**: Working code samples
- **Architecture**: Clear design documentation
- **Testing**: Test coverage and examples

## Getting Help

### Finding Information
- **Search**: Use the search functionality to find specific topics
- **Navigation**: Use the sidebar navigation for each section
- **Examples**: Check the examples for working code samples
- **API Docs**: Use the API references for implementation details

### Community Resources
- **GitHub**: [springfield-ham-radio](https://github.com/springfield-ham-radio)
- **Issues**: Report bugs and request features
- **Discussions**: Ask questions and share ideas

### Development Tools
- **TypeScript**: Full TypeScript support with type definitions
- **Testing**: Comprehensive test suites and examples
- **Debugging**: Built-in logging and debugging support

---

Need help with a specific topic? Use the search functionality or browse the detailed documentation in each section. 
