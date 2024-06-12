FROM oven/bun as frontend-build

WORKDIR /app

COPY package.json .
COPY bun.lockb .

RUN bun install

COPY frontend frontend
COPY tsconfig.json .

RUN bun frontend:build

FROM oven/bun as final

WORKDIR /app

COPY package.json  .

COPY backend backend
COPY --from=frontend-build /app/frontend/dist frontend/dist
COPY --from=frontend-build /app/frontend/index.ts frontend/index.ts
COPY --from=frontend-build /app/bun.lockb bun.lockb

RUN bun install --production

VOLUME /app/projects

ENV NODE_ENV production
CMD ["bun", "backend/index.ts"]

EXPOSE 3000
