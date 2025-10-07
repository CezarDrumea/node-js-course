import axios from "axios";

const api = axios.create({baseURL: "http://localhost:5000"}); //port backend Node.js


export async function list() {
    const data = await api.readFile(dbPath, 'utf-8');
    return JSON.parse(data);
}

export async function create(notite) {
    const {data} = await api.post("/notes/api", notite);
    return data;
}

export async function update(id, newText) {
    const patch = {text: newText};
    try {
        const {data} = await api.patch(`/notes/api/${encodeURIComponent(id)}`, patch);
        return data;
    }
    catch(err) {
        if(err.response && err.response.status === 404) return null;
        throw err;
    }
}

export async function remove(id) {
    try {
        await api.delete(`/notes/api/${encodeURIComponent(id)}`);
        return true;
    } catch(err) {
        if(err.response && err.response.status === 404) return false;
        throw err;
    }
}