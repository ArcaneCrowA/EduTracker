import { API_BASE_URL, state } from "./api.js";
import { elements, showSection } from "./ui.js";

let usersFormInitialized = false;

export async function loadUsers() {
    if (!elements.usersLink) return;
    showSection("users");

    const list = document.getElementById("users-list");
    if (!list) return;
    list.innerHTML = "Loading users...";

    try {
        const response = await fetch(`${API_BASE_URL}/users`, {
            headers: { Authorization: `Bearer ${state.jwtToken}` },
        });
        const users = await response.json();
        list.innerHTML = "";
        users.forEach((user) => {
            const item = document.createElement("div");
            item.className = "item";
            item.textContent = `ID: ${user.ID}, Name: ${user.full_name}, Login: ${user.login}, Role: ${user.is_admin ? "Admin" : "Student"}`;
            list.appendChild(item);
        });

        if (!usersFormInitialized) {
            const form = document.getElementById("create-user-form");
            if (form) {
                form.addEventListener("submit", async (e) => {
                    e.preventDefault();
                    await createUserFromForm();
                    await loadUsers();
                });
                usersFormInitialized = true;
            }
        }
    } catch (error) {
        console.error("Error fetching users:", error);
        list.innerHTML = "Error loading users.";
    }
}

async function createUserFromForm() {
    const fullName = document.getElementById("new-user-fullname").value;
    const year = parseInt(document.getElementById("new-user-year").value, 10);
    const login = document.getElementById("new-user-login").value;
    const password = document.getElementById("new-user-password").value;
    const isAdmin = document.getElementById("new-user-is-admin").checked;

    try {
        const response = await fetch(`${API_BASE_URL}/users`, {
            method: "POST",
            headers: {
                "Content-Type": "application/json",
                Authorization: `Bearer ${state.jwtToken}`,
            },
            body: JSON.stringify({
                full_name: fullName,
                year,
                login,
                password,
                is_admin: isAdmin,
            }),
        });
        if (!response.ok) {
            const text = await response.text();
            alert(`Failed to create user: ${text}`);
        }
    } catch (err) {
        console.error("Error creating user:", err);
        alert("Error creating user");
    }
}
