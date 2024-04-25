import {readdir} from "node:fs/promises"
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
    outPath: string
    sourceFile: BunFile
    // TODO: store this in a config file per project
    fps: number = 30

    private constructor(name: string, path: string, sourceFile: BunFile) {
        this.name = name
        this.path = path
        this.framePath = `${this.path}/frames`
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

        return new Project(
            name,
            path,
            await getSourceFile()
        )
    }

    async saveSourceFile(file: File) {
        const filePath = `${this.path}/${file.name}`

        await Bun.write(filePath, await file.arrayBuffer())
        this.sourceFile = Bun.file(filePath)
    }

    /**
     * @param fps How many frames per second equivalent to return
     * @param start
     * @param end
     */
    async getFrames (fps: number = this.fps, start: number = 0, end: number = -1): Promise<Array<BunFile>> {
        const frameNames = await readdir(this.framePath)
        const frameFiles: Array<BunFile> = []

        const frameInterval = Math.floor(this.fps / fps)

        const startIndex = start * this.fps
        if (startIndex < 0 || startIndex > frameNames.length) {
            throw new Error(`Start ${start} not valid! Must be 0 < start > ${frameNames.length / this.fps}`)
        }

        const endIndex = end === -1 ? frameNames.length : end * this.fps
        if (endIndex < 0 || endIndex > frameNames.length || endIndex < startIndex) {
            throw new Error(`End ${end} not valid! Must be start < end > ${frameNames.length / this.fps}`)
        }

        for (let frameIndex = startIndex; frameIndex < endIndex; frameIndex += frameInterval) {
            frameFiles.push(Bun.file(`${this.framePath}/${frameNames[frameIndex]}`))
        }

        return frameFiles
    }
}
