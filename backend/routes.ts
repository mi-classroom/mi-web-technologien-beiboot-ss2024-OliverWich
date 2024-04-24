import {Elysia} from "elysia"
import data from "../package.json"

/**
 * The routes of the backend.
 *
 * * GET /status => Returns a status info
 */
export const backend = new Elysia()
    .get('/status', getStatusMessage)

function getStatusMessage () {
    return {
        name: 'still-moving',
        online: true,
        version: data.version
    }
}
