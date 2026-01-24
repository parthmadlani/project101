export const API_URL = process.env.REACT_APP_API_URL || "http://localhost:8080";

export const getAuthToken = () => localStorage.getItem("r2r_token");
export const setAuthToken = (token) => localStorage.setItem("r2r_token", token);
export const removeAuthToken = () => localStorage.removeItem("r2r_token");

export const login = async (email, password) => {
    const res = await fetch(`${API_URL}/auth/login`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ email, password })
    });
    if (!res.ok) {
        const err = await res.json();
        throw new Error(err.error || "Login failed");
    }
    return await res.json();
};

export const signup = async (username, email, password) => {
    const res = await fetch(`${API_URL}/auth/signup`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ username, email, password })
    });
    if (!res.ok) {
        const err = await res.json();
        throw new Error(err.error || "Signup failed");
    }
    return await res.json();
};

export const getProfile = async () => {
    const token = getAuthToken();
    const headers = {};
    if (token) headers.Authorization = `Bearer ${token}`;

    const res = await fetch(`${API_URL}/profiles/me`, { headers });
    if (!res.ok) return null;
    return await res.json();
};

export const getRecommendations = async (sector) => {
    try {
        const token = getAuthToken();
        const headers = { "Content-Type": "application/json" };
        if (token) headers.Authorization = `Bearer ${token}`;

        const response = await fetch(`${API_URL}/recommendations`, {
            method: "POST",
            headers,
            body: JSON.stringify({ sector: sector.toLowerCase(), skills: {} })
        });
        if (!response.ok) throw new Error("Failed to fetch recommendations");
        return await response.json();
    } catch (error) {
        console.error("API Error:", error);
        return null;
    }
};

// Enroll in a course/sector
export const enrollInCourse = async (sector) => {
    const token = getAuthToken();
    const headers = { "Content-Type": "application/json" };
    if (token) headers.Authorization = `Bearer ${token}`;

    const res = await fetch(`${API_URL}/enrollments`, {
        method: "POST",
        headers,
        body: JSON.stringify({ sector })
    });
    return await res.json();
};

// Get user's enrollments
export const getEnrollments = async () => {
    const token = getAuthToken();
    const headers = {};
    if (token) headers.Authorization = `Bearer ${token}`;

    const res = await fetch(`${API_URL}/enrollments/me`, { headers });
    if (!res.ok) return { enrollments: [] };
    return await res.json();
};

// Mark video as watched
export const markVideoWatched = async (sector, videoId, videoTitle) => {
    const token = getAuthToken();
    const headers = { "Content-Type": "application/json" };
    if (token) headers.Authorization = `Bearer ${token}`;

    const res = await fetch(`${API_URL}/progress/video`, {
        method: "POST",
        headers,
        body: JSON.stringify({ sector, video_id: videoId, video_title: videoTitle })
    });
    return await res.json();
};

// Get progress stats for profile charts
export const getProgressStats = async () => {
    const token = getAuthToken();
    const headers = {};
    if (token) headers.Authorization = `Bearer ${token}`;

    const res = await fetch(`${API_URL}/progress/stats`, { headers });
    if (!res.ok) return null;
    return await res.json();
};

// Get user's certificates
export const getCertificates = async () => {
    const token = getAuthToken();
    const headers = {};
    if (token) headers.Authorization = `Bearer ${token}`;

    const res = await fetch(`${API_URL}/certificates/me`, { headers });
    if (!res.ok) return { certificates: [] };
    return await res.json();
};
