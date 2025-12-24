import axios from 'axios'

const API_SERVICE_URI = "http://localhost:8080/api";

const API_SERVICE = axios.create({
    baseURL: API_SERVICE_URI,
    timeout: 5000,
    headers: {
        'Content-Type': 'application/json'
    }
})

interface IBookServiceAdapter {
    existsByBookId(bookId: number): Promise<boolean>
}

export const BookServiceAdapter : IBookServiceAdapter = {
    async existsByBookId(bookId: number) {
        try {
            const res = await API_SERVICE.get("/books/" + bookId);

            return !(res.status == 404 || res.data['id'] !== bookId);
        } catch (error){
            return false;
        }
    }
}