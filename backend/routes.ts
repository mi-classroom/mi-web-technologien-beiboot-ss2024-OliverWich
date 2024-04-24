import {Elysia, t} from "elysia"
import data from "../package.json"
import {UploadService} from "./services/UploadService"
import {getAllProjects} from "./Projects"

/**
 * The routes of the backend.
 */
export const backend = new Elysia()
    .get('/status', getStatusMessage)
    .get('/projects', () => {
        return getAllProjects()
    })
    .post('/upload', ({body, set}) => {
            return UploadService.handleFileUpload(body.file, set)
        }, {
            body: t.Object({
                file: t.File()
            })
        }
    )

function getStatusMessage() {
    return {
        name: 'still-moving',
        online: true,
        version: data.version
    }
}
