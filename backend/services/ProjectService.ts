import {Context} from "elysia"
import {getProjectForName} from "../Projects"

import ffmpegPath from "ffmpeg-static"
import { path as ffprobePath} from "ffprobe-static"
import ffmpeg from "fluent-ffmpeg"
import {access, mkdir} from "node:fs/promises"

ffmpeg.setFfmpegPath(ffmpegPath)
ffmpeg.setFfprobePath(ffprobePath) // Might use this to gather infos about the file


export abstract class ProjectService {
    static async process (projectName: string, options: any, response: Context["set"]) {
        const project = await getProjectForName(projectName)

        // TODO: handle case where the file is already processed. In this case abort with 409 and only go through if user specified the `force` option
        async function createDirIfNotExists (dir: string) {
            return access(dir)
                .then(() => undefined)
                .catch(() => mkdir(dir));
        }

        await createDirIfNotExists(`${project.path}/frames`)

        async function runFfmpeg (): Promise<void> {
            return new Promise((resolve, reject) => {
                try {
                    console.info(`Starting to extract frames from ${project.sourceFile.name}`)

                    ffmpeg(project.sourceFile.name)
                        .outputOptions('-vf','scale=-2:720')
                        .fps(30)
                        .saveToFile(`${project.path}/frames/%3d.png`)
                        .on('end', function() {
                            console.info(`Finished processing file ${project.sourceFile.name}`);
                            response.status = 204
                            resolve()
                        })
                        .run()
                } catch (error) {
                    reject(error)
                }
            })
        }

        return await runFfmpeg(project)
    }
}

