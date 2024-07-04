# Programming Language - TypeScript

## Status

Accepted

## Context

A programming language must be chosen in order to program.
The chosen language should support all features needed for a web application.
A few possible options are:
- [JavaScript](https://tc39.es/ecma262/)
- [TypeScript](https://www.typescriptlang.org/)
- A language that compiles to [WebAssembly](https://webassembly.org/), for example [Rust](https://www.rust-lang.org/)

## Decision

Languages that use WebAssembly are a rather new thing and widespread support is flaky.
In addition to that, my personal experience with those is also mostly thin.

JavaScript and TypeScript were considered as valid options and the decision is:
* Use [TypeScript](https://www.typescriptlang.org/)

This is because it can be used both for the frontend and for the backend.
It wins over JavaScript since it is regarded as the better option by most seasoned web developers.

## Consequences

Pros:
* Flexible and robust type system
* Catching potential type issues and resulting bugs at "compile-time" (rather "transpile-time" since there is no real compilation step)
* Solid typehinting in most IDEs

Cons:
* Typing can bring developing overhead
* Additional Tooling and dependencies required (TypeScript Compiler, type packages)
  * At least for some runtimes
* Additional Configuration necessary
* It is still JS under the hood, so most caveats that come with that still mostly apply such as slowness in comparison to compiled languages.
