import {Elysia, Static, t} from "elysia"
import data from "../package.json"
import {UploadService} from "./services/UploadService"
import {getAllProjects, Slice} from "./Projects"
import {ProjectService, projectInfoDTO } from "./services/ProjectService"

/**
 * The routes of the backend.
 */
export const backend = new Elysia({ prefix: '/api' })
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
    .get('/project/:name', ({ params: { name }, set }): Promise<Static<typeof projectInfoDTO> | string> => {
        return ProjectService.getProjectInfo(name, set)
    }, {
        response: {
            200: projectInfoDTO,
            404: t.String(),
            500: t.String()
        }
    })
    .get('/project/:name/thumbnail', ({ params: { name }, set }) => {
        return ProjectService.getProjectThumbnail(name, set)
    })
    .get('/project/:name/frame/:frameNumber/thumbnail', ({ params: { name, frameNumber }, set }) => {
        return ProjectService.getThumbnailForFrame(name, Number(frameNumber), set)
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
            options: t.Optional(t.Object({
                resolution: t.Number({
                    default: 720,
                }),
            })),
        }),
    })
    .post('/expose', ({body, set}) => {
        body.options.fps = body.options.fps || 30
        body.options.slices = body.options.slices as Array<Slice> || getDefaultFullVideoSlice()

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
                slices: t.Optional(t.Array(
                    t.Object({
                        start: t.Number({default: 0}),
                        end: t.Number({default: -1}),
                    }))),
                focus: t.Optional(t.Object({
                        opacity: t.Optional(t.Number({default: 0.5})),
                        overlayMode: t.Optional(t.String({default: 'mean'})),
                        blendMode: t.Optional(t.String({default: 'mean'})),
                        frameTimestamps: t.Array(t.Number({default: 1}))
                    }
                )),
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

function getDefaultFullVideoSlice() : Array<Slice>{
    return [
        {
            start: 0,
            end: -1
        }
    ]
}
