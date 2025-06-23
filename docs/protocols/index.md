# Protocols & DSL Overview

The Springfield Ham Radio ecosystem uses a declarative, JSON-based Domain Specific Language (DSL) to define radio communication protocols. This approach enables radio-independent driver implementations and makes it easy to add support for new radios without duplicating protocol logic.

## Why a Protocol DSL?

- **Radio Independence**: Protocols are defined in configuration, not code, allowing a single driver to support many radios.
- **Maintainability**: Protocol changes don't require code changes—just update the JSON.
- **Extensibility**: New radio types can be added by providing new protocol definitions.
- **Documentation**: Protocols are self-documenting through their JSON structure.

## What You'll Find Here

- [Protocol DSL](./dsl): Full documentation of the protocol DSL, including structure, step types, and examples.
- How the DSL integrates with the registry and drivers.
- Best practices for defining and testing protocols.

## Next Steps

- Learn the [Protocol DSL](./dsl) in detail.
- See how protocols are used in [Registry Architecture](/registry/architecture).
- Try out protocol-driven drivers in your own modules. 
