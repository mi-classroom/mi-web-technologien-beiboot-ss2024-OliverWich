import {access, mkdir, readdir} from "node:fs/promises"
import {BunFile} from "bun"

const projectsPath = "./projects"

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

class Project {
    name: string
    path: string
    framePath: string
    thumbnailPath: string
    outPath: string
    sourceFile: BunFile
    // TODO: store this in a config file per project
    fps: number = 30

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

    async saveSourceFile(file: File) {
        const filePath = `${this.path}/${file.name}`

        await Bun.write(filePath, await file.arrayBuffer())
        this.sourceFile = Bun.file(filePath)
    }

    async getFrameNameByNumber(frameNumber: number) {
        const frameNames = await readdir(this.framePath)
        return frameNames[frameNumber]
    }

    async getFrameByNumber(frameNumber: number): Promise<BunFile> {
        return Bun.file(`${this.framePath}/${await this.getFrameNameByNumber(frameNumber)}`)
    }

    /**
     * @param fps How many frames per second equivalent to return
     * @param slices The slices to get the frames for
     */
    async getFrames (fps: number = this.fps, slices: Array<Slice>): Promise<Array<BunFile>> {
        const frameNames = await readdir(this.framePath)
        const frameFiles: Array<BunFile> = []

        const frameInterval = Math.floor(this.fps / fps)

        for (let slice of slices) {
            frameFiles.push(...this.getFramesForSlice(slice, frameNames, frameInterval))
        }

        return frameFiles
    }

    private getFramesForSlice(slice: Slice, frameNames: Array<string>, frameInterval: number): Array<BunFile> {
        const frameFiles: Array<BunFile> = []

        const startIndex = slice.start * this.fps
        if (startIndex >= frameNames.length) {
            throw new Error(`Start ${slice.start} not valid! Must be 0 < slice.start > ${frameNames.length / this.fps}`)
        }

        const endIndex = slice.end === -1 ? frameNames.length : slice.end * this.fps
        if (endIndex < 0 || endIndex > frameNames.length || endIndex < startIndex) {
            throw new Error(`End ${slice.end} not valid! Must be slice.start < slice.end > ${frameNames.length / this.fps}`)
        }

        for (let frameIndex = startIndex; frameIndex < endIndex; frameIndex += frameInterval) {
            frameFiles.push(Bun.file(`${this.framePath}/${frameNames[frameIndex]}`))
        }

        return frameFiles
    }
}

export type Slice = {start: number, end: number}
