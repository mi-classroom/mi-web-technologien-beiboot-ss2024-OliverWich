import {getProjectForFileName} from "../Projects"
import {Context} from "elysia"
export abstract class UploadService {

    static async handleFileUpload (file: File, response: Context["set"]) {
        console.info(`Received file "${file.name}" to upload.`)

        const project = await getProjectForFileName(file.name)

        await project.saveSourceFile(file)

        response.status = 201
        console.info(`File "${file.name}" uploaded successfully. Project "${project.name}" created.`)
        return project.name
    }
}
