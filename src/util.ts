export function getJSON<T>(url: string) {
    return fetch(url).then<T>(r => r.json());
}


export function postJSON<T>(url: string, data: any) {
    return fetch(url, {
        method: 'post',
        body: JSON.stringify(data),
        headers: {
            'Content-Type': 'application/json',
        }
    }).then<T>(function (response) {
        return response.json();
    });
}