import { state, clearSession } from "./api.js";
import { elements, showLoginView, showInfoView, displayCurrentUser, renderMyInfoPage } from "./ui.js";
import { login, logout } from "./auth.js";
import { loadUsers } from "./users.js";
import { loadCourses } from "./courses.js";
import { loadAttendance } from "./attendance.js";

// Event Listeners
if (elements.loginBtn) {
    elements.loginBtn.addEventListener("click", login);
}
if (elements.logoutLink) {
    elements.logoutLink.addEventListener("click", logout);
}
if (elements.dashboardLink) {
    elements.dashboardLink.addEventListener("click", (e) => {
        e.preventDefault();
        renderMyInfoPage(state.currentUserData);
    });
}
if (elements.usersLink) {
    elements.usersLink.addEventListener("click", (e) => {
        e.preventDefault();
        loadUsers();
    });
}
if (elements.coursesLink) {
    elements.coursesLink.addEventListener("click", (e) => {
        e.preventDefault();
        loadCourses();
    });
}
if (elements.attendanceLink) {
    elements.attendanceLink.addEventListener("click", (e) => {
        e.preventDefault();
        loadAttendance();
    });
}

// Check login state on page load
document.addEventListener("DOMContentLoaded", () => {
    if (state.jwtToken && state.currentUserData) {
        // If we're on a protected page but the role doesn't match, redirect
        const path = window.location.pathname;
        const isAdminPage = path.endsWith("admin.html");
        const isUserPage = path.endsWith("user.html");

        if (isAdminPage && !state.currentUserData.is_admin) {
            window.location.href = "user.html";
            return;
        }
        if (isUserPage && state.currentUserData.is_admin) {
            window.location.href = "admin.html";
            return;
        }

        if (elements.currentUser) {
            displayCurrentUser(state.currentUserData);
        }
        if (elements.infoView) {
            showInfoView();
            // default content on each page
            if (isAdminPage && elements.usersLink) {
                loadUsers();
            } else if (elements.coursesLink) {
                loadCourses();
            }
        }
    } else {
        // only login page ("/" or "/index.html") should be visible without token
        const path = window.location.pathname;
        const isRoot = path === "/" || path === "";
        const isLogin = path.endsWith("index.html");

        if (!isRoot && !isLogin) {
            window.location.href = "index.html";
            return;
        }

        showLoginView();
    }
});
