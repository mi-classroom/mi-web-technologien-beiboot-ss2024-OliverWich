FROM oven/bun as frontend-build

WORKDIR /app

COPY package.json .
COPY bun.lockb .

# Fake the package.json of the backend workspace because bun install can't filter down workspaces
RUN mkdir "backend"
RUN echo "{'name': 'backend'}" >> backend/package.json

COPY frontend frontend

RUN bun install

COPY tsconfig.json .

RUN bun frontend:build

FROM oven/bun as final

WORKDIR /app

COPY package.json  .

COPY backend backend
COPY --from=frontend-build /app/frontend/dist frontend/dist
COPY --from=frontend-build /app/frontend/index.ts frontend/index.ts

# Fake the package.json of the frontend workspace because bun install can't filter down workspaces
RUN echo "{'name': 'frontend'}" >> frontend/package.json

RUN bun install --production

VOLUME /app/projects

ENV NODE_ENV production
CMD ["bun", "backend:start"]

EXPOSE 3000
