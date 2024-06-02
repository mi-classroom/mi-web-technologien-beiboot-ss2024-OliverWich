export function apiCall(url: string, method: string = 'GET', body: any = undefined, formData: boolean = false) {
    if (!url.startsWith('/api')) {
        url = `/api${url}`
    }

    const headers: HeadersInit = {}

    if (formData) {
        delete headers['Content-Type']
    } else {
        headers['Content-Type'] = 'application/json'
    }

    return fetch(url, {
        method: method,
        body: createRequestBody(body, formData),
        headers: headers
    }).then(async response => {
        if (!response.ok) {
            throw new Error(response.statusText)
        }

        if (response.headers.get('content-type')?.includes('application/json')) {
            return response.json()
        } else {
            return response.text()
        }
    })
}

function createRequestBody (raw : any, formData : boolean = false) {
    if (formData) {
        const formData = new FormData()
        for (const key in raw) {
            formData.append(key, raw[key])
        }
        return formData
    } else {
        return JSON.stringify(raw)
    }
}


export function apiGET(url: string) {
    return apiCall(url, 'GET')
}

export function apiPOST(url: string, body: any, formData: boolean = false) {
    return apiCall(url, 'POST', body, formData)
}

export function createProject(projectFile: File) {
    return apiPOST('/upload', {'file' : projectFile}, true)
}

export function processProject(projectName: string) {
    return apiPOST(`/process`, {project: projectName})
}

export function getProjects() {
    return apiGET('/projects')
}

export function getProjectInfo(projectName: string) {
    return apiGET(`/project/${projectName}`)
}
