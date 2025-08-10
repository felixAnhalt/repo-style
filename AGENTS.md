# AGENTS.md — Operational Rules for Coding Agents

## 0) Repository Context
- Repo: local
- Commit: 937078935830f53ce20822a35b693f6cb5163b5b
- Languages: (inferred)
- Build/test entrypoints: (inferred)

## 1) Global Operating Posture
- Produce the smallest diff possible. Do not refactor unless a rule mandates it.
- Do not alter CI/publishing unless a rule mandates it.
- Prefer existing patterns; avoid new libs.

## 2) Enforced Rules (blocking)
### avoid-deep-nesting — Avoid Deep Nesting
**Statement:** Structure code to avoid deep nesting, which can reduce readability.  
**Scope:** control flow, functions  
**Severity:** info
### cli-shebang-usage — Use shebang for CLI entry points
**Statement:** Include a shebang (#!/usr/bin/env node) at the top of files intended to be executed as command-line interfaces.  
**Scope:** cli, entrypoint, nodejs  
**Severity:** info
### env-encapsulate-access — Encapsulate environment variable access
**Statement:** Centralize and encapsulate access to environment variables in a dedicated module to avoid scattering configuration logic throughout the codebase.  
**Scope:** configuration, environment variables, project structure  
**Severity:** info
### env-use-defaults-cautiously — Use default values for environment variables cautiously
**Statement:** Avoid defaulting environment variables to empty strings unless it is safe for the application to proceed without them.  
**Scope:** configuration, environment variables  
**Severity:** warn
### env-validate-required-vars — Validate presence of required environment variables
**Statement:** Explicitly validate that all required environment variables are set and fail fast if any are missing.  
**Scope:** configuration, environment variables, initialization  
**Severity:** error
### explicit-error-messages — Provide explicit error messages
**Statement:** Throw errors with clear, descriptive messages that help diagnose the cause of the failure.  
**Scope:** function  
**Severity:** warn
### GEN-AGG-001 — Deduplicate aggregated results before returning
**Statement:** When aggregating results from multiple sources, deduplicate entries before returning to ensure uniqueness and prevent redundant processing.  
**Scope:** **/*.ts, **/*.js  
**Severity:** info
### GEN-ASYNC-001 — Prefer early returns and guard clauses in async functions
**Statement:** Use early returns and guard clauses in async functions to avoid unnecessary nesting and improve readability.  
**Scope:** **/*.ts, **/*.js  
**Severity:** info
### GEN-ERROR-001 — Handle errors explicitly in async operations
**Statement:** Always handle errors explicitly in async/await code, especially when dealing with external resources or I/O.  
**Scope:** **/*.ts, **/*.js  
**Severity:** warn
### GEN-IMMUT-001 — Prefer immutability for collections and state
**Statement:** Favor immutable data structures and avoid mutating collections directly to reduce side effects and improve maintainability.  
**Scope:** **/*.ts, **/*.js  
**Severity:** info
### GEN-INPUT-001 — Validate inputs before processing
**Statement:** Validate function inputs and external data before processing to prevent runtime errors and unexpected behavior.  
**Scope:** **/*.ts, **/*.js  
**Severity:** warn
### GEN-PURE-001 — Prefer pure functions for utility logic
**Statement:** Implement utility logic as pure functions where possible to improve testability and predictability.  
**Scope:** **/*.ts, **/*.js  
**Severity:** info
### handle-async-errors-explicitly — Handle errors explicitly in async operations
**Statement:** Use explicit error handling (such as .catch or try/catch) when performing asynchronous operations to prevent unhandled promise rejections.  
**Scope:** function, async  
**Severity:** warn
### handle-errors-explicitly — Handle errors explicitly using try-catch
**Statement:** Wrap potentially error-throwing code in try-catch blocks to handle errors gracefully and return fallback values when appropriate.  
**Scope:** function, method  
**Severity:** warn
### handle-errors-explicitly-with-defaults — Handle errors explicitly and provide safe defaults
**Statement:** When performing asynchronous operations that may fail, handle errors explicitly and provide safe default values to ensure program stability.  
**Scope:** async function, file IO  
**Severity:** warn
### handle-external-api-errors-explicitly — Handle external API errors explicitly
**Statement:** Check the response status of external API calls and handle error cases explicitly, rather than assuming success.  
**Scope:** function  
**Severity:** error
### parse-and-validate-api-responses — Parse and validate API responses before use
**Statement:** Always parse and validate the structure and content of API responses before using them in application logic.  
**Scope:** function  
**Severity:** error
### prefer-async-await-for-async-actions — Prefer async/await for asynchronous actions
**Statement:** Use async/await syntax when handling asynchronous operations within command actions to improve readability and error handling.  
**Scope:** function, command-action  
**Severity:** info
### prefer-async-await-for-async-operations — Prefer async/await for asynchronous operations
**Statement:** Use async/await syntax for handling asynchronous operations instead of callbacks or promise chains.  
**Scope:** function, method  
**Severity:** info
### prefer-async-await-for-io — Prefer async/await for asynchronous I/O operations
**Statement:** Use async/await syntax when performing asynchronous I/O operations such as file writing to improve readability and maintainability.  
**Scope:** function, module  
**Severity:** info
### prefer-async-await-in-tests — Prefer async/await for asynchronous operations in tests
**Statement:** Use async/await syntax when testing asynchronous code to improve readability and avoid callback hell.  
**Scope:** test  
**Severity:** info
### prefer-async-await-over-callbacks — Prefer async/await for asynchronous operations
**Statement:** Use async/await syntax for handling asynchronous operations instead of callbacks or promise chains.  
**Scope:** function, async function  
**Severity:** info
### prefer-async-io — Prefer asynchronous I/O operations
**Statement:** Use asynchronous file operations to avoid blocking the event loop and improve performance.  
**Scope:** function, module  
**Severity:** info
### prefer-async-io-operations — Prefer asynchronous I/O operations
**Statement:** Use asynchronous file operations to avoid blocking the event loop and improve scalability.  
**Scope:** file-io, nodejs, typescript  
**Severity:** info
### prefer-composition-over-nesting — Prefer composition over deep nesting for aggregating results
**Statement:** Aggregate results from multiple sources using composition (e.g., array spreading and concatenation) rather than deeply nested loops or conditionals.  
**Scope:** function, array operations  
**Severity:** info
### prefer-early-continue-empty-or-invalid-input — Prefer early continue for empty or invalid input
**Statement:** Use early continue statements to skip processing when input data is empty or invalid, reducing unnecessary nesting and improving readability.  
**Scope:** function, loop  
**Severity:** info
### prefer-early-continue-in-loops — Prefer early continue in loops to reduce nesting
**Statement:** Use early continue statements in loops to skip unnecessary processing and reduce nesting.  
**Scope:** function, loop  
**Severity:** info
### prefer-early-resource-cleanup — Prefer early resource cleanup after use
**Statement:** Ensure that any resources or temporary artifacts created during execution are cleaned up as soon as they are no longer needed.  
**Scope:** resource management, async functions, CLI tools  
**Severity:** warn
### prefer-early-return — Prefer Early Return to Reduce Nesting
**Statement:** Use early returns or guard clauses to minimize nesting and improve code readability.  
**Scope:** function, method  
**Severity:** info
### prefer-early-return-cleanup — Prefer early return with cleanup in async functions
**Statement:** Ensure that any necessary cleanup logic is executed before returning from an async function, especially when dealing with resources or side effects.  
**Scope:** function, async function  
**Severity:** warn
### prefer-early-return-for-validation — Prefer early returns for input validation
**Statement:** Use early returns to handle invalid or unexpected input as soon as possible, reducing nesting and improving readability.  
**Scope:** function, method  
**Severity:** info
### prefer-early-returns — Prefer Early Returns to Reduce Nesting
**Statement:** Use early returns or conditional execution to minimize nesting and improve code readability.  
**Scope:** function, method  
**Severity:** info
### prefer-early-returns-over-nesting — Prefer Early Returns Over Deep Nesting
**Statement:** Use early returns or guard clauses to reduce nesting and improve code readability.  
**Scope:** functions, control flow  
**Severity:** info
### prefer-entry-point-separation — Prefer separation of entry point and application logic
**Statement:** Keep the entry point file minimal by delegating logic to separate modules or files.  
**Scope:** entry-point, project-structure  
**Severity:** info
### prefer-explicit-async-return — Prefer Explicit Async Return Types
**Statement:** When defining asynchronous functions, explicitly specify the Promise return type with the contained type.  
**Scope:** function-definition  
**Severity:** info
### prefer-explicit-configuration — Prefer Explicit Configuration Over Defaults
**Statement:** Explicitly specify configuration options rather than relying on defaults to improve clarity and maintainability.  
**Scope:** build configuration, project setup  
**Severity:** info
### prefer-explicit-types — Prefer Explicit Types for Data Structures
**Statement:** Define explicit TypeScript types for complex data structures to ensure type safety and clarity.  
**Scope:** typescript, type-definitions  
**Severity:** info
### prefer-immutability — Prefer Immutability
**Statement:** Avoid mutating input data or shared state; prefer creating new objects or arrays.  
**Scope:** data handling, state management  
**Severity:** info
### prefer-immutability-for-accumulation — Prefer immutability when accumulating results
**Statement:** Use immutable patterns (such as pushing to a new array) when accumulating results within a loop to avoid unintended side effects.  
**Scope:** loop, accumulation  
**Severity:** info
### prefer-immutable-accumulators — Prefer immutability for accumulator variables where possible
**Statement:** Favor immutable patterns for accumulator variables to reduce side effects and improve code clarity.  
**Scope:** function, variable  
**Severity:** info
### prefer-modular-command-definitions — Prefer Modular Command Definitions
**Statement:** Define CLI commands in separate modules and import them into the main entry point for composition.  
**Scope:** cli, application entrypoint, command-line tools  
**Severity:** info
### prefer-optional-properties-for-flexibility — Use Optional Properties for Flexible Data Models
**Statement:** Mark properties as optional when they are not always present to allow for flexible and extensible data models.  
**Scope:** typescript, type-definitions  
**Severity:** info
### prefer-pure-functions — Prefer pure functions where possible
**Statement:** Write functions that do not have side effects and whose output depends only on their input parameters.  
**Scope:** function  
**Severity:** info
### prefer-pure-functions-for-visitors — Prefer pure functions for AST visitors
**Statement:** Design AST visitor functions to be pure and stateless where possible, only accumulating results externally if necessary.  
**Scope:** function, recursion  
**Severity:** info
### prefer-readonly-interfaces — Prefer Readonly Data Contracts Where Applicable
**Statement:** Use readonly or immutable patterns for contract and evidence types to prevent accidental mutation.  
**Scope:** typescript, type-definitions  
**Severity:** warn
### prefer-typed-objects — Prefer explicit typing for objects and function parameters
**Statement:** Define explicit types for objects and function parameters to improve type safety and code clarity.  
**Scope:** type, function parameter  
**Severity:** info
### prefer-union-types-for-enums — Prefer Union Types for Enumerated Values
**Statement:** Use TypeScript union types for fields with a limited set of string values instead of loose strings.  
**Scope:** typescript, type-definitions  
**Severity:** info
### TS-TYPE-004 — No exported any types
**Statement:** Avoid exporting APIs that use `any` types.  
**Scope:** **/*.ts, **/*.tsx  
**Severity:** warn
### use-guard-clauses-for-error-handling — Use guard clauses for error handling
**Statement:** Prefer guard clauses to check for error conditions and return or throw early, rather than deeply nesting logic.  
**Scope:** function  
**Severity:** info
### validate-env-vars-early — Validate environment variables early
**Statement:** Check that all required environment variables are present before proceeding with API calls or logic that depends on them.  
**Scope:** function, module  
**Severity:** error
### validate-inputs — Validate function inputs before use
**Statement:** Check that function inputs meet expected criteria before using them, returning null or throwing errors if validation fails.  
**Scope:** function, method  
**Severity:** warn
### validate-inputs-and-defaults — Validate function inputs and provide sensible defaults
**Statement:** Validate function inputs and provide sensible defaults to ensure robust and predictable behavior.  
**Scope:** function, parameter  
**Severity:** warn
### validate-inputs-and-parameters — Validate inputs and parameters
**Statement:** Validate function inputs and parameters, such as file paths and limits, before processing to avoid runtime errors.  
**Scope:** function, input  
**Severity:** warn
### validate-inputs-before-processing — Validate Inputs Before Processing
**Statement:** Always validate input data against a schema or expected structure before further processing or persisting it.  
**Scope:** function, module  
**Severity:** error

## 6) 🟡 Candidate Rules (non-blocking)

Last generated: 2025-08-10T18:38:53.269Z • Source: repostyle.contract.yaml
