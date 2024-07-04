# Runtime - Bun

## Status

Try

## Context

As for any [JavaScript](https://tc39.es/ecma262/) based programm, a runtime is needed to actually execute the code.

A few possible options are:
- [Node](https://nodejs.org/en)
- [Deno](https://deno.com/)
- [WinterJS](https://github.com/wasmerio/winterjs)
- [Bun](https://bun.sh/)


## Decision

Because of personal interests and the ability for Bun to natively run TypeScript without any transpilation step,
**[Bun](https://bun.sh/)** was chosen as the runtime of choice.
It also has the goal of 100% node compatibility, with which I am very familiar with.

The decision was mostly between node and bun since I have no real experience with the others.

## Consequences

Pros:
* Native TypeScript support
* Way faster startup and runtime speeds than node
* Way faster dependency installation than node

Cons:
* Bun is rather new
  * This might mean showstopper bugs or other instability
* Bun on windows is even newer
  * This might mean even _more_ bugs and instability
