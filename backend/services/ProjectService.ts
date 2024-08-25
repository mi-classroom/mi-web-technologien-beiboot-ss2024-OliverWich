import {Context, Static, t} from "elysia"
import {getAllProjects, getProjectForName} from "../Projects"

import ffmpegPath from "ffmpeg-static"
import { path as ffprobePath} from "ffprobe-static"
import ffmpeg, {FfprobeData} from "fluent-ffmpeg"
import {access} from "node:fs/promises"
import sharp, {OverlayOptions} from "sharp"
import {BunFile} from "bun"

import type {Project} from "../Projects"

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
        await this.runFfmpeg(project.sourceFile.name, project.fps, project.framePath, options?.resolution, project.frameFileType)

        response.status = 204
    }

    private static async runFfmpeg (targetFilePath: string, fps: number, targetFolder: string, resolution: number = 720, frameFileType = 'png'): Promise<void> {
        return new Promise((resolve, reject) => {
            try {
                console.info(`Starting to extract frames from ${targetFilePath} to ${targetFolder} with ${fps} fps and resolution ${resolution}.`)

                ffmpeg(targetFilePath)
                    .outputOptions('-vf',`scale=-2:${resolution}`)
                    .fps(fps)
                    .saveToFile(`${targetFolder}/%3d.${frameFileType}`)
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

        const frames = await project.getFrames(options.slices, options.fps)

        console.info(`Exposing ${frames.length} frames out of ${options.slices.length} slices from Project "${project.name}" which corresponds to ${options.fps} fps with mode "${options.mode}".`)

        const outPath = `${project.outPath}/out.png`

        await this.runExposure(options, frames, outPath)

        if (options.focus && options.focus.frameTimestamps.length) {
            console.info(`Overlaying focus frames with timestamps [${options.focus.frameTimestamps}] to image...`)

            await this.applyFocusFrames(project, options.focus, outPath)
        }

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

        response.status = 200
        return {
            name: project.name,
            fps: project.fps,
            duration: metaData.format.duration,
            frame_count: project.frameCount
        }
    }

    /**
     * Deletes all project files without a trace.
     *
     * @param projectName
     * @param response
     */
    static async deleteProject (projectName: string, response: Context["set"]) {
        const projects = await getAllProjects()

        if (!projects.includes(projectName)) {
            response.status = 404
            return `Could not find project "${projectName}"`
        }

        const project = await getProjectForName(projectName)
        await project.delete()

        response.status = 200
        return `Deleted project "${projectName}"`
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

        const thumbnailPath = `${project.thumbnailPath}/${(project.getFrameNameByNumber(frameNumber)).slice(0, -3)}webp`

        // if thumbnail already exists, return it
        try {
            await access(thumbnailPath)
            return Bun.file(thumbnailPath)
        } catch (_) {
            console.info(`Creating new thumbnail for frame ${frameNumber} of project "${projectName}"`)
        }

        const frame = project.getFrameByNumber(frameNumber)

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

        // We don't have a thumbnail, get the first frame and use that
        const firstFrame = project.getFrameByNumber(0)

        if (!await firstFrame.exists()) {
            const errorString = `Could not get any frames for project "${projectName}"`
            console.error(errorString)
            response.status = 500
            return errorString
        }

        await sharp(firstFrame.name)
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

    private static async applyFocusFrames (project: Project, focusOptions: any, outPath: string) {
        // Create fake slices for the focus frames that only contain one frame
        const focusSlices = focusOptions.frameTimestamps.map((timeStamp: number) => {
            return {
                start: timeStamp,
                end: timeStamp,
            }
        })

        // Merge focus frames into one
        const focusFrames = await project.getFrames(focusSlices)
        const focusMergedRawPath = `${project.outPath}/outFocus-Raw.png`
        console.info(`Exposing ${focusFrames.length} focus frames with mode "${focusOptions.blendMode ?? 'mean'}"...`)
        await this.runExposure({mode: focusOptions.blendMode ?? 'mean'}, focusFrames, focusMergedRawPath)

        // Copy outPath to outBeforeFocus.png because we cannot run sharp on the same file later
        const outBeforeFocusPath = `${project.outPath}/outBeforeFocus.png`
        await Bun.write(outBeforeFocusPath, Bun.file(outPath))

        // Make focus Frame semi-transparent
        const focusPath = `${project.outPath}/outFocus.png`
        console.info(`Applying opacity ${focusOptions.opacity ?? 0.5} to merged focus frames...`)
        await sharp(focusMergedRawPath)
            .ensureAlpha(focusOptions.opacity ?? 0.5)
            .toFile(focusPath)

        // Overlay focus frames
        console.info(`Overlaying merged focus frames with mode "${focusOptions.overlayMode ?? 'mean'}"...`)
        await this.runExposure({mode: focusOptions.overlayMode ?? 'mean'}, [
            Bun.file(outBeforeFocusPath),
            Bun.file(focusPath)
        ], outPath)
    }

    private static async runExposure (options: any, frameFiles: Array<BunFile>, outPath: string) {
        switch (options.mode) {
            case 'mean': return this.manualMeanCalculation(frameFiles, outPath)
            default: return this.useSharpCompositing(options.mode, frameFiles, outPath)
        }
    }

    private static async useSharpCompositing(mode: string, frameFiles: Array<BunFile>, outputPath: string) {
        const sharpInputFrames = frameFiles.map(frame => {
            return {
                input: frame.name,
                blend: mode
            }
        })

        await sharp(sharpInputFrames.pop()?.input)
            .composite(sharpInputFrames as OverlayOptions[])
            .toFile(outputPath)
    }

    private static async manualMeanCalculation (frameFiles: Array<BunFile>, outputPath: string) {
        const firstImage = sharp(frameFiles[0].name)
        const { width, height } = await firstImage.metadata()

        if (!width || !height) {
            throw new Error("Could not read metaData for Frames. Did you process the project first?")
        }

        // Initialize array to store pixel values for 3 channels
        const pixelValues = Array(height * width * 3).fill(0)

        // Initialize total weight. This will be the factor we divide the pixel values by to get the (weighted based on alpha) mean
        let totalWeight = 0

        // Extract pixel values from each image
        for (let i = 0; i < frameFiles.length; i++) {
            const image = sharp(frameFiles[i].name)

            let alphaWeight = 1

            const hasAlpha = (await image.metadata()).hasAlpha

            if (hasAlpha) {
                // Retrieve alpha channel mean value
                const imageStats = await image.stats()
                const meanAlpha = imageStats.channels[3].mean

                // Normalize alpha value to 0-1 to use it as a factor
                alphaWeight = meanAlpha / 255
            }

            totalWeight += alphaWeight

            const pixels = await image.removeAlpha().raw().toBuffer()

            for (let j = 0; j < pixels.length; j++) {
                pixelValues[j] += pixels[j] * alphaWeight
            }
        }

        // Calculate (weighted) mean pixel values
        const meanPixelValues = pixelValues.map(value => Math.floor(value / totalWeight))

        await sharp(Buffer.from(meanPixelValues), {
            raw: {
                width: width,
                height: height,
                channels: 3,
            }
        })
            .toFormat('png')
            .toFile(outputPath)
    }
}

export const projectInfoDTO = t.Object({
    name: t.String(),
    fps: t.Number(),
    duration: t.Number(),
    frame_count: t.Number(),
})
