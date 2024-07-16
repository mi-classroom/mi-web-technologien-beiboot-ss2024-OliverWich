import {Elysia} from "elysia"
import {staticPlugin} from "@elysiajs/static"

/**
 * This serves the static files of the frontend SPA.
 *
 * **It causes all not defined routes to be redirected to the index.html of it!**
 */
export const frontend = new Elysia()
    .onError(async ({ code, error }) => {
        if (code === 'NOT_FOUND') {
            const indexFile = Bun.file(`${import.meta.dir}/dist/index.html`)

            if (await indexFile.exists()) return indexFile
            return "Still building..."
        }
        else {
            console.error(error)
            return error
        }
    })
    .use(staticPlugin({
        assets: `${import.meta.dir}/dist/`,
        prefix: '/',
    }))
