import axios from 'axios';

export function getBooks(limit=10, start=0, order='asc'){
    const request = axios.get(`/api/books?limit=${limit}&skip=${start}&order=${order}`)
        .then(response => response.data)

    return {
        type: 'GET_BOOKS',
        payload: request
    }

}