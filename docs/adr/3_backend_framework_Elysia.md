# Backend - Elysia

## Status

Accepted

## Context

Every web application needs a backend and backend development is way easier when using a framework.

A few popular choices for JavaScript based applications are:
* [Express](https://expressjs.com/)
* [Elysia](https://elysiajs.com/)
* [koa](https://koajs.com/)
* [Fastify](https://fastify.dev/)

## Decision

Because Elysia uses Bun as its native runtime, it was chosen as the framework.

Other options would work just as well and my personal experience in express would have made it the perfect choice.
However, I want to use and explore the Bun ecosystem, thus something "Bun-native" was chosen.

## Consequences

Pros:
* Build for Bun
  * Fast, and good DX
* Easily extendable via plugins or middlewares

Cons:
* Very new and possibly not feature complete / buggy
