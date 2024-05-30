import {Context, Static, t} from "elysia"
import {getProjectForName} from "../Projects"

import ffmpegPath from "ffmpeg-static"
import { path as ffprobePath} from "ffprobe-static"
import ffmpeg, {FfprobeData} from "fluent-ffmpeg"
import {access, mkdir, readdir} from "node:fs/promises"
import sharp from "sharp"

ffmpeg.setFfmpegPath(<string>ffmpegPath)
ffmpeg.setFfprobePath(ffprobePath)


export abstract class ProjectService {
    static async process (projectName: string, options: any, response: Context["set"]) {
        const project = await getProjectForName(projectName)

        // TODO: handle case where the file is already processed. In this case abort with 409 and only go through if user specified the `force` option
        async function createDirIfNotExists (dir: string) {
            return access(dir)
                .then(() => undefined)
                .catch(() => mkdir(dir))
        }

        await createDirIfNotExists(`${project.path}/frames`)

        async function runFfmpeg (): Promise<void> {
            return new Promise((resolve, reject) => {
                try {
                    console.info(`Starting to extract frames from ${project.sourceFile.name}`)

                    ffmpeg(project.sourceFile.name)
                        .outputOptions('-vf','scale=-2:720')
                        .fps(project.fps)
                        .saveToFile(`${project.framePath}/%3d.png`)
                        .on('end', function() {
                            console.info(`Finished processing file ${project.sourceFile.name}`)
                            response.status = 204
                            resolve()
                        })
                        .run()
                } catch (error) {
                    reject(error)
                }
            })
        }

        return await runFfmpeg()
    }

    static async expose (projectName: string, options: any, _response: Context["set"]) {
        const project = await getProjectForName(projectName)

        const frames = await project.getFrames(options.fps, options.slices)

        console.info(`Exposing ${frames.length} frames out of ${options.slices.length} slices from Project "${project.name}" which corresponds to ${options.fps} fps with mode "${options.mode}".`)

        async function getOutFileBuffer () {
            switch (options.mode) {
                case 'mean': return manualMeanCalculation()
                default: return useSharpCompositing()
            }
        }

        async function useSharpCompositing() {
            const sharpInputFrames = frames.map(frame => {
                return {
                    input: frame.name,
                    blend: options.mode
                }
            })

            return await sharp(sharpInputFrames.pop()?.input)
                .composite(sharpInputFrames)
                .toBuffer()
        }

        async function manualMeanCalculation (): Promise<Buffer> {
            const firstImage = sharp(frames[0].name)
            const { width, height } = await firstImage.metadata()

            if (!width || !height) {
                throw new Error("Could not read metaData for Frames. Did you process the project first?")
            }

            // Initialize array to store pixel values for 3 channels
            const pixelValues = Array(height * width * 3).fill(0)

            // Extract pixel values from each image
            for (let i = 0; i < frames.length; i++) {
                const image = sharp(frames[i].name)
                const pixels = await image.removeAlpha().raw().toBuffer()

                for (let j = 0; j < pixels.length; j++) {
                    pixelValues[j] += pixels[j]
                }
            }

            // Calculate mean pixel values
            const meanPixelValues = pixelValues.map(value => Math.floor(value / frames.length))

            return sharp(Buffer.from(meanPixelValues), {
                raw: {
                    width: width,
                    height: height,
                    channels: 3,
                }
            })
                .toFormat('png')
                .toBuffer()
        }

        const outPath = `${project.outPath}/out.png`
        await Bun.write(outPath, await getOutFileBuffer())
        return Bun.file(outPath)
    }

    static async getProjectInfo (projectName: string, response: Context["set"]) : Promise<Static<typeof projectInfoDTO> | string>{
        const project = await getProjectForName(projectName)

        const projectFileName = project.sourceFile.name

        if (!projectFileName) {
            const errorString = `Could not find project file for project "${projectName}"`
            console.error(errorString)
            response.status = 404
            return errorString
        }

        const metaData = await this.runFfprobe(projectFileName)

        if (!metaData || !metaData.format) {
            const errorString = `Could not get meta data for project "${projectName}"`
            console.error(errorString)
            response.status = 500
            return errorString
        }

        if (!metaData.format.duration) {
            const errorString = `Could not get duration for project "${projectName}"`
            console.error(errorString)
            response.status = 500
            return errorString
        }

        const frameCount = await readdir(project.framePath).then(files => files.length)

        response.status = 200
        return {
            name: project.name,
            fps: project.fps,
            duration: metaData.format.duration,
            processed_frames: frameCount
        }
    }

    private static async runFfprobe(fileName: string): Promise<FfprobeData> {
        return new Promise((resolve, reject) => {
            ffmpeg.ffprobe(fileName, (err, metadata) => {
                if (err) {
                    reject(err)
                }

                resolve(metadata)
            })
        })
    }
}

export const projectInfoDTO = t.Object({
    name: t.String(),
    fps: t.Number(),
    duration: t.Number(),
    processed_frames: t.Number(),
})
