import { API_BASE_URL, setToken, setUser, clearSession, state } from "./api.js";
import { elements } from "./ui.js";

export function redirectAfterLogin() {
    if (!state.currentUserData) return;
    if (state.currentUserData.is_admin) {
        window.location.href = "admin.html";
    } else {
        window.location.href = "user.html";
    }
}

export async function login() {
    const loginData = {
        login: elements.loginUserInput.value,
        password: elements.loginPasswordInput.value,
    };

    try {
        const response = await fetch(`${API_BASE_URL}/public/login`, {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify(loginData),
        });

        if (response.ok) {
            const data = await response.json();
            setToken(data.token);
            setUser(data.user);
            redirectAfterLogin();
        } else {
            alert("Login failed");
        }
    } catch (error) {
        console.error("Login error:", error);
        alert("Login error");
    }
}

export function logout() {
    clearSession();
    window.location.href = "index.html";
}
