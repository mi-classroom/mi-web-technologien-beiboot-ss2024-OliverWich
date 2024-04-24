import { Elysia } from "elysia";
import {frontend} from "../frontend"
import {backend} from "./routes"
import {registerExitHandlers} from "./RuntimeHelpers"

const app = new Elysia()
    .use(frontend)
    .use(backend)
    .listen(3000);

console.log(
  `🦊 Elysia is running at ${app.server?.hostname}:${app.server?.port}`
);

registerExitHandlers()
