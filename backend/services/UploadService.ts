import {getProjectForFileName} from "../Projects"
import {Context} from "elysia"
export abstract class UploadService {

    static async handleFileUpload (file: File, response: Context["set"]) {
        console.info(`Received file "${file.name}" to upload.`)

        const project = await getProjectForFileName(file.name)

        await project.saveSourceFile(file)

        response.status = 201
        const message = `File "${file.name}" uploaded successfully.`
        console.info(message)
        return message
    }
}
