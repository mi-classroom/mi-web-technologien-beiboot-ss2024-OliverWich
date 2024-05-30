export function apiCall(url: string, method: string = 'GET', body: any = null) {
    if (!url.startsWith('/api')) {
        url = `/api${url}`
    }

    return fetch(url, {
        method: method,
        body: body ? JSON.stringify(body) : undefined,
        headers: {
            'Content-Type': 'application/json'
        }
    }).then(response => response.json())
}

export function apiGET(url: string) {
    return apiCall(url, 'GET')
}

export function apiPOST(url: string, body: any) {
    return apiCall(url, 'POST', body)
}

export function getProjects() {
    return apiGET('/projects')
}
