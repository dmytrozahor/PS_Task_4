import axios from 'axios'
import tracer from "../config/datadog";

import {BackendNotAvailableError} from "../review/errors/BackendNotAvailableError";
import {MalformedBackendResponseError} from "../review/errors/MalformedBackendResponseError";

const API_SERVICE_URI = "http://book-api:8080/api";

const API_SERVICE = axios.create({
    baseURL: API_SERVICE_URI,
    timeout: 5000,
    headers: {
        'Content-Type': 'application/json'
    }
})

let bookServiceAvailable= true;

interface IBookServiceAdapter {
    isServiceUp(): boolean,
    existsByBookId(bookId: number): Promise<boolean>
}

export const BookServiceAdapter : IBookServiceAdapter = {
    isServiceUp(){
        return bookServiceAvailable;
    },

    async existsByBookId(bookId: number) {
        if (!bookServiceAvailable)
            throw new BackendNotAvailableError(
                `BookServiceAdapter couldn't resolve the backend`
            );

        return tracer.trace('book.existsByBookId', async (span) => {
            const res = await API_SERVICE.get("/books/" + bookId);

            if (!res || (res.status !== 404 && res.status !== 200)) {
                bookServiceAvailable = false;
                span.setTag('error', true);
                span.setTag('error.message', `Unexpected response: ${res?.status}`);
                throw new MalformedBackendResponseError(`Unexpected response: ${res?.status}`);
            }

            span.setTag('book.id', bookId);
            span.setTag('backend.status', res.status);

            return !(res.status === 404 || res.data.id !== bookId);
        });
    }
}