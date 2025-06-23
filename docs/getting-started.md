# Getting Started

Welcome to the Springfield Ham Radio software ecosystem! This guide will help you get up and running quickly.

## Quick Overview

Springfield Ham Radio is a modular software ecosystem for amateur radio that provides:

- **Generic Radio Driver**: Single driver implementation that supports multiple radio types through configuration
- **Protocol DSL**: Domain-specific language for defining radio communication protocols
- **Module Registry**: Discover and manage radio configurations from npm modules
- **Plugin Architecture**: Extensible system for third-party radio module development

## Choose Your Path

### 🚀 New to Springfield Ham Radio?
Start with the [Overview](/overview) to understand the system architecture and key concepts.

### 🏗️ Understanding the Architecture
Read the [Architecture Overview](/reference/architecture) to understand how all the components work together.

### 📚 Ready to Dive In?
Jump directly to the [Development Guide](/development-guide) for detailed implementation information.

## Key Concepts

### Radio Modules
Radio configurations are distributed as npm modules with standardized structure:
- Protocol definitions using the DSL
- Memory layout and serial configuration
- Data schemas and codec implementations
- Shared components for reuse

### Registry System
The registry automatically discovers and manages radio modules:
- Scans `node_modules` for radio modules
- Validates configurations and capabilities
- Provides unified access to radio configurations
- Supports plugin installation and management

### Protocol DSL
A declarative language for defining radio communication protocols:
- JSON-based configuration
- Step-by-step protocol definition
- Expression resolution and pattern matching
- Extensible executor system

## Next Steps

1. **Read the Overview** - Understand the system architecture
2. **Explore the Architecture** - Learn how components interact
3. **Check the Development Guide** - Get implementation details
4. **Try the Examples** - See working configurations

## Getting Help

- **Documentation**: All documentation is available in the sidebar
- **GitHub**: View source code and issues on [GitHub](https://github.com/springfield-ham-radio)
- **Examples**: Check the registry and protocol documentation for examples

---

Ready to start building? Check out the [Radio Module Development](/radio-module-dev) section to create your first radio module! 
