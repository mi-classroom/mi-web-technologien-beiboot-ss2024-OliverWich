import { Elysia } from "elysia";
import { swagger } from '@elysiajs/swagger'
import {frontend} from "../frontend"
import {backend} from "./routes"
import {registerExitHandlers} from "./RuntimeHelpers"
import data from "../package.json"

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
                    title: "Still-Moving API documentation",
                    version: data.version,
                }
            }
        }))
        .use(frontend)
        .use(backend)
        .listen(3000);
}

registerExitHandlers()
