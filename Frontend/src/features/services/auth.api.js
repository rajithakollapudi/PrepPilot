import axios from "axios"

const API_URL = import.meta.env.VITE_API_URL || "http://localhost:3000";

const api = axios.create({
    baseURL: API_URL,
    withCredentials: true
})

export async function register({ username, email, password }) {
    try {
        const response = await api.post('/api/auth/register', {
            username, email, password
        })

        return response.data
    } catch (err) {
        console.error("Register error:", err.message)
        return { user: null }
    }
}

export async function login({ email, password }) {
    try {
        const response = await api.post("/api/auth/login", {
            email, password
        })

        return response.data

    } catch (err) {
        console.log(err)
    }
}

export async function logout() {
    try {
        const response = await api.get("/api/auth/logout")
        return response.data

    } catch (err) {
        console.error("Logout error:", err.message)
        return { success: false }
    }
}

export async function getMe() {
    try {
        const response = await api.get("/api/auth/get-me")
        return response.data

    } catch (err) {
        console.error("GetMe error:", err.message)
        return { user: null }
    }
}