import {Context, Static, t} from "elysia"
import {getProjectForName} from "../Projects"

import ffmpegPath from "ffmpeg-static"
import { path as ffprobePath} from "ffprobe-static"
import ffmpeg, {FfprobeData} from "fluent-ffmpeg"
import {access, readdir} from "node:fs/promises"
import sharp from "sharp"

ffmpeg.setFfmpegPath(<string>ffmpegPath)
ffmpeg.setFfprobePath(ffprobePath)


export abstract class ProjectService {
    static async process (projectName: string, options: any, response: Context["set"]) {
        const project = await getProjectForName(projectName)

        if (!project.sourceFile.name) {
            const errorString = `Could not find project file for project "${projectName}"`
            console.error(errorString)
            response.status = 404
            return errorString
        }

        // Extract frames from the video
        await this.runFfmpeg(project.sourceFile.name, project.fps, project.framePath, options?.resolution)

        response.status = 204
    }

    private static async runFfmpeg (targetFilePath: string, fps: number, targetFolder: string, resolution: number = 720): Promise<void> {
        return new Promise((resolve, reject) => {
            try {
                console.info(`Starting to extract frames from ${targetFilePath} to ${targetFolder} with ${fps} fps and resolution ${resolution}.`)

                ffmpeg(targetFilePath)
                    .outputOptions('-vf',`scale=-2:${resolution}`)
                    .fps(fps)
                    .saveToFile(`${targetFolder}/%3d.png`)
                    .on('end', function() {
                        console.info(`Finished processing file ${targetFilePath} to ${targetFolder} with ${fps} fps and resolution ${resolution}.`)
                        resolve()
                    })
            } catch (error) {
                reject(error)
            }
        })
    }

    static async expose (projectName: string, options: any, _response: Context["set"]) {
        const project = await getProjectForName(projectName)

        const frames = await project.getFrames(options.fps, options.slices)

        console.info(`Exposing ${frames.length} frames out of ${options.slices.length} slices from Project "${project.name}" which corresponds to ${options.fps} fps with mode "${options.mode}".`)

        async function writeOutFile (path: string) {
            switch (options.mode) {
                case 'mean': return manualMeanCalculation(path)
                default: return useSharpCompositing(path)
            }
        }

        async function useSharpCompositing(path: string) {
            const sharpInputFrames = frames.map(frame => {
                return {
                    input: frame.name,
                    blend: options.mode
                }
            })

            await sharp(sharpInputFrames.pop()?.input)
                .composite(sharpInputFrames)
                .toFile(path)
        }

        async function manualMeanCalculation (path: string) {
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

            await sharp(Buffer.from(meanPixelValues), {
                raw: {
                    width: width,
                    height: height,
                    channels: 3,
                }
            })
                .toFormat('png')
                .toFile(path)
        }

        const outPath = `${project.outPath}/out.png`

        await writeOutFile(outPath)

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
            frame_count: frameCount
        }
    }

    /**
     * Returns a thumbnail for the requested frame.
     * If it is present, return it, but if it wasn't, generate it on the fly and save to disk.
     *
     * @param projectName
     * @param frameNumber
     * @param response
     */
    static async getThumbnailForFrame (projectName: string, frameNumber: number, response: Context["set"]) {
        const project = await getProjectForName(projectName)

        const thumbnailPath = `${project.thumbnailPath}/${(await project.getFrameNameByNumber(frameNumber)).slice(0, -3)}webp`

        // if thumbnail already exists, return it
        try {
            await access(thumbnailPath)
            return Bun.file(thumbnailPath)
        } catch (_) {
            console.info(`Creating new thumbnail for frame ${frameNumber} of project "${projectName}"`)
        }

        const frame = await project.getFrameByNumber(frameNumber)

        await sharp(frame.name)
            .resize({ height: 360 })
            .toFormat('webp')
            .toFile(thumbnailPath)

        response.status = 200
        return Bun.file(thumbnailPath)
    }

    static async getProjectThumbnail (projectName: string, response: Context["set"]) {
        const project = await getProjectForName(projectName)

        // If thumbnail already exists, return it
        const thumbnailPath = `${project.outPath}/thumbnail.webp`
        try {
            await access(thumbnailPath)
            return Bun.file(thumbnailPath)
        } catch (error) {
            console.info(`No thumbnail found for project "${projectName}".`)
        }

        console.info(`Creating thumbnail for project "${projectName}".`)

        // We don't have a thumbnail, get a frame from the first second and use that
        const frames = await project.getFrames(1, [{start: 0, end: 1}])

        if (frames.length === 0) {
            const errorString = `Could not get any frames for project "${projectName}"`
            console.error(errorString)
            response.status = 500
            return errorString
        }

        await sharp(frames[0].name)
            .resize({ height: 360 })
            .toFormat('webp')
            .toFile(thumbnailPath)

        response.status = 200
        return Bun.file(thumbnailPath)
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
    frame_count: t.Number(),
})
