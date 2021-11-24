const baseUrl = 'http://127.0.0.1:8700'; // TODO: where to configure it?

class ApiError extends Error {
    constructor(statusCode, statusMessage, ...params) {
        // Pass remaining arguments (including vendor specific ones) to parent constructor
        super(...params);

        // Maintains proper stack trace for where our error was thrown (only available on V8)
        if (Error.captureStackTrace) {
            Error.captureStackTrace(this, ApiError);
        }

        this.name = 'ApiError';
        this.statusCode = statusCode;
        this.statusMessage = statusMessage;
    }
}

function handleErrors(response) {
    if (response.status < 400) {
        return response;
    }
    throw new ApiError(
        response.status,
        response.statusText,
        response.statusText);
}

function toJson(response) {
    return response.json();
}

function toData(json) {
    return json.data;
}

function getJson(endpoint, session) {
    const headers = {};
    if (session) {
        headers['x-session'] = session;
    }

    return fetch(
        baseUrl + endpoint,
        {
            mode: 'cors',
            headers
        })
        .then(handleErrors)
        .then(toJson)
        .then(toData);
}

function postJson(endpoint, data, session) {
    const headers = {
        'Content-Type': 'application/json'
    };
    if (session) {
        headers['x-session'] = session;
    }

    return fetch(
        baseUrl + endpoint,
        {
            method: 'POST',
            mode: 'cors',
            cache: 'no-cache',
            headers,
            body: data ? JSON.stringify(data) : null
        })
        .then(handleErrors)
        .then(toJson)
        .then(toData);
}

function putJson(endpoint, data, session) {
    const headers = {
        'Content-Type': 'application/json'
    };
    if (session) {
        headers['x-session'] = session;
    }

    return fetch(
        baseUrl + endpoint,
        {
            method: 'PUT',
            mode: 'cors',
            cache: 'no-cache',
            headers,
            body: data ? JSON.stringify(data) : null
        })
        .then(handleErrors)
        .then(toJson)
        .then(toData);
}

export const signIn = (idToken) => {
    return postJson('/signin', {id_token: idToken});
};

export const getTest = (session) => {
    return getJson(`/test`, session);
};

