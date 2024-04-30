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
    }, {
        response: {
            200: t.Array(
                t.String()
            )
        }
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
    })
    .post('/expose', ({body, set}) => {
        body.options.fps = body.options.fps || 30
        body.options.start = body.options.start || 0
        body.options.end = body.options.end || -1

        return ProjectService.expose(body.project, body.options, set)
    }, {
        body: t.Object({
            project: t.String(),
            options: t.Object({
                mode: t.String({
                    default: 'mean',
                }),
                fps: t.Optional(t.Number({
                    default: 30
                })),
                start: t.Optional(t.Number({
                    default: 0
                })),
                end: t.Optional(t.Number({
                    default: -1
                }))
            }),
        })
    })

function getStatusMessage() {
    return {
        name: 'still-moving',
        online: true,
        version: data.version
    }
}
