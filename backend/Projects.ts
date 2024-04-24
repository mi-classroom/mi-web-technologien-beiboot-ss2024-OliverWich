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
    sourceFile: BunFile

    private constructor(name: string, path: string, sourceFile: BunFile) {
        this.name = name
        this.path = path
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
            await getSourceFile(name, path, sourceFileName)
        )
    }

    async saveSourceFile(file: File) {
        const filePath = `${this.path}/${file.name}`

        await Bun.write(filePath, await file.arrayBuffer())
        this.sourceFile = Bun.file(filePath)
        this.initialized = true
    }
}
