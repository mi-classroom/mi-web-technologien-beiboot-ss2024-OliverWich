import { Elysia } from "elysia";
import { swagger } from '@elysiajs/swagger'
import {frontend} from "../frontend"
import {backend} from "./routes"
import {registerExitHandlers} from "./RuntimeHelpers"

try {
    const app = startServer()
    console.log(`🦊 Elysia is running at ${app.server?.hostname}:${app.server?.port}`);
} catch (e) {
    console.log("Something went horribly wrong. Could not start Elysia", e)
}

function startServer () {
    return new Elysia()
        .use(swagger({
            documentation: {
                info: {
                    title: "Still Moving documentation"
                }
            }
        }))
        .use(frontend)
        .use(backend)
        .listen(3000);
}

registerExitHandlers()
