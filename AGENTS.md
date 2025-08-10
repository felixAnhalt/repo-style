# AGENTS.md — Operational Rules for Coding Agents

## 0) Repository Context
- Repo: local
- Commit: b9479536b0b0873228925c387cc3fcb021ce7a89
- Languages: (inferred)
- Build/test entrypoints: (inferred)

## 1) Global Operating Posture
- Produce the smallest diff possible. Do not refactor unless a rule mandates it.
- Do not alter CI/publishing unless a rule mandates it.
- Prefer existing patterns; avoid new libs.

## 2) Enforced Rules (blocking)
### async-test-handling — Async Test Handling
**Statement:** Async tests SHOULD use await for asynchronous operations to ensure proper sequencing and error detection.  
**Scope:** **/*  
**Severity:** warn
### deduplicate-logic — Deduplicate Logic
**Statement:** Code MUST deduplicate data and avoid processing duplicates.  
**Scope:** **/*  
**Severity:** error
### deduplicate-rules — Deduplicate Rules
**Statement:** Rules lists MUST be deduplicated before rendering or processing.  
**Scope:** **/*  
**Severity:** warn
### explicit-error-handling — Explicit Error Handling
**Statement:** Code SHOULD handle errors explicitly and provide context when failures occur.  
**Scope:** **/*  
**Severity:** warn
### explicit-return-type — Explicit Return Types
**Statement:** All exported async functions SHOULD declare explicit return types.  
**Scope:** **/*  
**Severity:** warn
### explicit-serialization — Explicit Serialization
**Statement:** Serialization and deserialization logic SHOULD be explicit and separated from business logic.  
**Scope:** **/*  
**Severity:** warn
### explicit-type-definitions — Explicit Type Definitions
**Statement:** Types and interfaces MUST be explicitly defined for core data structures.  
**Scope:** **/*  
**Severity:** error
### fail-fast-errors — Fail Fast on Errors
**Statement:** Code that detects invalid state or input MUST throw errors immediately with context.  
**Scope:** **/*  
**Severity:** error
### fail-fast-on-error — Fail Fast on Error
**Statement:** Functions interacting with external services MUST throw explicit errors immediately when responses are invalid or indicate failure.  
**Scope:** **/*  
**Severity:** error
### limit-side-effects — Limit Side Effects
**Statement:** Helper functions SHOULD avoid side effects and only return computed values.  
**Scope:** **/*  
**Severity:** warn
### modular-commands — Modular Command Registration
**Statement:** Command modules SHOULD be registered separately to promote modularity and maintainability.  
**Scope:** src/cli/*  
**Severity:** warn
### parse-and-validate-response — Parse and Validate External Responses
**Statement:** Responses from external APIs that are expected to be structured data MUST be parsed and validated before use.  
**Scope:** **/*  
**Severity:** error
### prefer-async-actions — Prefer Async Actions
**Statement:** Actions that perform I/O or external calls SHOULD be implemented as async functions.  
**Scope:** **/*  
**Severity:** warn
### prefer-async-io — Prefer Async IO
**Statement:** File operations SHOULD use asynchronous APIs to avoid blocking the event loop.  
**Scope:** **/*  
**Severity:** warn
### prefer-early-return — Prefer Early Return
**Statement:** Functions SHOULD use early return to minimize nesting and improve readability.  
**Scope:** **/*  
**Severity:** warn
### pure-function-design — Pure Function Design
**Statement:** Functions that transform data and produce outputs without side effects SHOULD be designed as pure functions.  
**Scope:** **/*  
**Severity:** warn
### pure-render-functions — Pure Render Functions
**Statement:** Rendering functions SHOULD be pure and only transform input data to output strings without side effects.  
**Scope:** **/*  
**Severity:** warn
### separate-blocking-nonblocking — Separate Blocking and Non-blocking Rules
**Statement:** Rules MUST be categorized into blocking (enforced) and non-blocking (candidate) groups based on confidence thresholds.  
**Scope:** **/*  
**Severity:** error
### single-responsibility — Single Responsibility Functions
**Statement:** Functions SHOULD have a single, clear responsibility.  
**Scope:** **/*  
**Severity:** warn
### single-responsibility-functions — Single Responsibility Functions
**Statement:** Functions SHOULD be designed to perform a single, well-defined task.  
**Scope:** **/*  
**Severity:** warn
### sort-for-determinism — Sort for Determinism
**Statement:** Rule outputs SHOULD be sorted deterministically before rendering.  
**Scope:** **/*  
**Severity:** warn
### test-side-effects — Test Side Effects
**Statement:** Tests that produce or rely on file system side effects MUST verify the existence and content of generated files.  
**Scope:** **/*  
**Severity:** error
### test-timeout-control — Test Timeout Control
**Statement:** Long-running tests MUST explicitly set a timeout to avoid indefinite execution.  
**Scope:** **/*  
**Severity:** warn
### TS-TYPE-004 — No exported any types
**Statement:** Avoid exporting APIs that use `any` types.  
**Scope:** **/*.ts, **/*.tsx  
**Severity:** warn
### validate-inputs — Validate Inputs
**Statement:** Functions that process user or CLI input MUST validate and handle input values explicitly.  
**Scope:** **/*  
**Severity:** error

## 6) 🟡 Candidate Rules (non-blocking)

Last generated: 2025-08-10T19:24:03.511Z • Source: repostyle.contract.yaml
