import {access, mkdir, readdir, rm} from "node:fs/promises"
import {readdirSync} from "node:fs"
import {BunFile} from "bun"

const projectsPath = `${import.meta.dir}/../projects`

export async function getProjectForFileName(fileName: string): Promise<Project> {
    const projectName = getFileNameWithoutExtension(fileName)

    return await Project.create(projectName, `${projectsPath}/${projectName}`, fileName)
}

export async function getProjectForName(name: string): Promise<Project> {
    return await Project.create(name, `${projectsPath}/${name}`)
}

export async function getAllProjects() {
    return (await readdir(projectsPath)).filter((file) => file !== '.gitkeep')
}

function getFileNameWithoutExtension(fileName: string) {
    return fileName.substring(0, fileName.lastIndexOf("."))
}

export class Project {
    name: string
    path: string
    framePath: string
    frameFileType: string = "png"
    thumbnailPath: string
    outPath: string
    sourceFile: BunFile
    fps: number = 30

    get frameCount() {
        return this.frameNames.length
    }

    _frameNames: Array<string> = []
    get frameNames() {
        if (!this._frameNames.length) {
            this._frameNames = readdirSync(this.framePath)
        }

        return this._frameNames
    }

    private constructor(name: string, path: string, sourceFile: BunFile) {
        this.name = name
        this.path = path
        this.framePath = `${this.path}/frames`
        this.thumbnailPath = `${this.path}/thumbs`
        this.outPath = `${this.path}/out`
        this.sourceFile = sourceFile
    }

    static async create(name: string, path: string, sourceFileName: string = `${name}.*`) {
        async function getSourceFile() {
            if (sourceFileName.includes('*')) {
                return await readdir(path)
                    .then(candidates => candidates.filter(candidate => candidate.includes(name)))
                    .then(candidates => {
                        return Bun.file(`${path}/${candidates[0]}`)
                    })
            }

            return Bun.file(`${path}/${sourceFileName}`)
        }

        const newProject = new Project(
            name,
            path,
            await getSourceFile()
        )

        async function createDirIfNotExists (dir: string) {
            return access(dir)
                .then(() => undefined)
                .catch(() => mkdir(dir))
        }

        await createDirIfNotExists(`${newProject.path}`)
        await createDirIfNotExists(`${newProject.framePath}`)
        await createDirIfNotExists(`${newProject.thumbnailPath}`)
        await createDirIfNotExists(`${newProject.outPath}`)

        return newProject
    }

    async delete() {
        console.info(`Deleting project ${this.name} in ${this.path}...`)
        await rm(this.path, {recursive: true})
    }

    async saveSourceFile(file: File) {
        const filePath = `${this.path}/${file.name}`

        await Bun.write(filePath, await file.arrayBuffer())
        this.sourceFile = Bun.file(filePath)
    }

    getFrameNameByNumber(frameNumber: number) {
        const frameDigits = this.frameCount.toString().length

        // Frames are zero indexed, but frame files start at e.g. 001
        frameNumber++

        const frameName = frameNumber.toString().padStart(frameDigits, '0')

        return `${frameName}.${this.frameFileType}`
    }

    getFrameByNumber(frameNumber: number): BunFile {
        return Bun.file(`${this.framePath}/${this.getFrameNameByNumber(frameNumber)}`)
    }

    /**
     * @param slices The slices to get the frames for
     * @param fps How many frames per second equivalent to return
     */
    async getFrames(slices: Array<Slice>, fps: number = this.fps): Promise<Array<BunFile>> {
        const frameNames = this.frameNames
        const frameFiles: Array<BunFile> = []

        const frameInterval = Math.floor(this.fps / fps)

        for (let slice of slices) {
            frameFiles.push(...this.getFramesForSlice(slice, frameNames, frameInterval))
        }

        return frameFiles
    }

    private getFramesForSlice(slice: Slice, frameNames: Array<string>, frameInterval: number): Array<BunFile> {
        const frameFiles: Array<BunFile> = []

        const startIndex = Math.floor(slice.start * this.fps)
        if (startIndex >= frameNames.length) {
            throw new Error(`Start ${slice.start} not valid! Must be 0 < slice.start < ${frameNames.length / this.fps}`)
        }

        const endIndex = slice.end === -1 ? frameNames.length : Math.floor(slice.end * this.fps)

        if (endIndex < 0 || endIndex > frameNames.length || endIndex < startIndex) {
            throw new Error(`End ${slice.end} not valid! Must be slice.start < slice.end < ${frameNames.length / this.fps}`)
        }

        // If start and end are the same, this slice consists of just this one image
        if (startIndex === endIndex)
            return [this.getFrameByNumber(startIndex)]

        for (let frameIndex = startIndex; frameIndex < endIndex; frameIndex += frameInterval) {
            frameFiles.push(this.getFrameByNumber(frameIndex))
        }

        return frameFiles
    }
}

export type Slice = {start: number, end: number}
