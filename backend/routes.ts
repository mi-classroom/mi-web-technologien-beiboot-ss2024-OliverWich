import {Elysia, t} from "elysia"
import data from "../package.json"
import {UploadService} from "./services/UploadService"
import {getAllProjects} from "./Projects"
import {ProjectService} from "./services/ProjectService"

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
    .post('/process', ({body, set}) => {
        return ProjectService.process(body.project, body.options, set)
    }, {
        body: t.Object({
            project: t.String(),
            options: t.Optional(t.Object({})),
        }),
        response: {
            200: t.String()
        }
    })
    .post('/expose', ({body, set}) => {
        return ProjectService.expose(body.project, body.options, set)
    }, {
        body: t.Object({
            project: t.String(),
            options: t.Object({
                mode: t.String({
                    default: 'overlay',
                    fps: 30
                })
            }),
        }),
        response: {
            200: t.File()
        }
    })

function getStatusMessage() {
    return {
        name: 'still-moving',
        online: true,
        version: data.version
    }
}
