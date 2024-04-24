import { Elysia } from "elysia";
import { staticPlugin } from '@elysiajs/static'


const app = new Elysia()
    .onError(({ code, path, set }) => {
        if (code === 'NOT_FOUND')
            return Bun.file('./frontend/dist/index.html')
    })
    .use(staticPlugin({
        assets: './frontend/dist/',
        prefix: '/',
    }))
    .get('/test', () => 'test')
    .listen(3000);

console.log(
  `🦊 Elysia is running at ${app.server?.hostname}:${app.server?.port}`
);

process.on("SIGINT", () => {
    console.log("Received SIGINT, dying");
    process.exit()
});

process.on("SIGTERM", () => {
    console.log("Received SIGTERM, dying");
    process.exit()
});
