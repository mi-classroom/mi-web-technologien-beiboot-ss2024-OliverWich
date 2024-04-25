FROM oven/bun as build

WORKDIR /app

COPY package.json .
COPY bun.lockb .

RUN bun install

COPY backend backend
COPY frontend frontend
COPY tsconfig.json .

RUN bun frontend:build

FROM oven/bun as final

WORKDIR /app

COPY package.json  .

COPY --from=build /app/backend backend
COPY --from=build /app/frontend/dist frontend/dist
COPY --from=build /app/frontend/index.ts frontend/index.ts

RUN bun install --production

ENV NODE_ENV production
CMD ["bun", "backend/index.ts"]

EXPOSE 3000
