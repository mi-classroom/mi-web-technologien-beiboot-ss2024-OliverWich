import { readdir } from "node:fs/promises";
import {BunFile} from "bun"

const projectsPath = "./projects"

export async function getProjectForFileName(fileName: string): Promise<Project> {
    const projectName = getFileNameWithoutExtension(fileName)

    return new Project(projectName, `${projectsPath}/${projectName}`, fileName)
}

export async function getAllProjects() {
    return (await readdir(projectsPath)).filter((file) => file !== '.gitkeep')
}

function getFileNameWithoutExtension(fileName: string) {
    return fileName.substring(0, fileName.lastIndexOf("."));
}

class Project {
    name: string
    path: string

    initialized: boolean = false
    sourceFile: BunFile

    constructor(name: string, path: string, sourceFileName?: string) {
        this.name = name
        this.path = path

        this.sourceFile = Bun.file(`${this.path}/${sourceFileName}`)
        this.sourceFile.exists().then(result => {
            this.initialized = result
        })
    }

    async saveSourceFile(file: File) {
        const filePath = `${this.path}/${file.name}`

        await Bun.write(filePath, await file.arrayBuffer())
        this.sourceFile = Bun.file(filePath)
        this.initialized = true
    }
}
