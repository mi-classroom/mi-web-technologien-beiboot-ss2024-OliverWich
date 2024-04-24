import {Elysia, error} from "elysia"
import {staticPlugin} from "@elysiajs/static"

/**
 * This serves the static files of the frontend SPA.
 *
 * **It causes all not defined routes to be redirected to the index.html of it!**
 */
export const frontend = new Elysia()
    .onError(({ code, error }) => {
        if (code === 'NOT_FOUND')
            return Bun.file('./frontend/dist/index.html')
        else {
            console.error(error)
            return error
        }
    })
    .use(staticPlugin({
        assets: './frontend/dist/',
        prefix: '/',
    }))
