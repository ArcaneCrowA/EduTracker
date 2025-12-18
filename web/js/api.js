export const API_BASE_URL = "http://localhost:8080/api/v1";

export let state = {
    jwtToken: localStorage.getItem("jwtToken"),
    currentUserData: JSON.parse(localStorage.getItem("currentUser")),
    allUsers: null,
    allCourses: null,
    studentCandidates: [],
    courseCandidates: [],
};

export function setToken(token) {
    state.jwtToken = token;
    localStorage.setItem("jwtToken", token);
}

export function setUser(user) {
    state.currentUserData = user;
    localStorage.setItem("currentUser", JSON.stringify(user));
}

export function clearSession() {
    state.jwtToken = null;
    state.currentUserData = null;
    localStorage.removeItem("jwtToken");
    localStorage.removeItem("currentUser");
}
