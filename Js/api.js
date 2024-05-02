class API {
    constructor(rootUrl, defaultHeaders) {
        this.rootUrl = rootUrl;
        this.defaultHeaders = defaultHeaders;
    }

    async request(subUrl = "", headers = null, method = "GET", body = null) {
        const response = await fetch(`${this.rootUrl}${subUrl}`, {
            headers: headers || this.defaultHeaders,
            method,
            body: body ? JSON.stringify(body) : null,
        });

        if (response.body) {
            return await response.json();
        }

        return response;
    }

    async get(subUrl = "", headers = null) {
        return await this.request(subUrl, headers, "GET");
    }

    async post(subUrl, headers = null, body = null) {
        return await this.request(subUrl, headers, "POST", body);
    }

    async patch(subUrl, headers = null, body = null) {
        return await this.request(subUrl, headers, "PATCH", body);
    }

    async put(subUrl, headers = null, body = null) {
        return await this.request(subUrl, headers, "PUT", body);
    }

    async delete(subUrl, headers = null) {
        return await this.request(subUrl, headers, "DELETE");
    }
}

// const jsonPlaceholderAPI = new API("https://jsonplaceholder.typicode.com", {
//     "Content-type": "application/json",
// });

// jsonPlaceholderAPI.get("/users").then((data) => console.log(data, "USERS"));