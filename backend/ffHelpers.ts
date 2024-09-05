import ffmpegPath from "ffmpeg-static"
import ffmpeg, {FfprobeData} from "fluent-ffmpeg"
import {path as ffprobePath} from "ffprobe-static"

ffmpeg.setFfmpegPath(<string>ffmpegPath)
ffmpeg.setFfprobePath(ffprobePath)

export async function runFfprobe(fileName: string): Promise<FfprobeData> {
    return new Promise((resolve, reject) => {
        ffmpeg.ffprobe(fileName, (err, metadata) => {
            if (err) {
                reject(err)
            }

            resolve(metadata)
        })
    })
}

export  async function runFfmpeg (targetFilePath: string, fps: number, targetFolder: string, resolution: number = 720, frameFileType = 'png'): Promise<void> {
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
