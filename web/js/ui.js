export const elements = {
    loginView: document.getElementById("login-view"),
    infoView: document.getElementById("info-view"),
    content: document.getElementById("content"),
    currentUser: document.getElementById("current-user"),
    loginUserInput: document.getElementById("login-user"),
    loginPasswordInput: document.getElementById("login-password"),
    loginBtn: document.getElementById("login-btn"),
    dashboardLink: document.getElementById("dashboard-link"),
    usersLink: document.getElementById("users-link"),
    coursesLink: document.getElementById("courses-link"),
    attendanceLink: document.getElementById("attendance-link"),
    logoutLink: document.getElementById("logout-link"),
    sections: {
        info: document.getElementById("info-section"),
        users: document.getElementById("users-section"),
        courses: document.getElementById("courses-section"),
        attendance: document.getElementById("attendance-section"),
    },
    infoDetails: document.getElementById("info-details"),
};

export function showSection(sectionName) {
    Object.keys(elements.sections).forEach((key) => {
        const section = elements.sections[key];
        if (section) {
            section.classList.toggle("hidden", key !== sectionName);
        }
    });
}

export function showLoginView() {
    if (elements.loginView) elements.loginView.style.display = "block";
    if (elements.infoView) elements.infoView.style.display = "none";
}

export function showInfoView() {
    if (elements.loginView) elements.loginView.style.display = "none";
    if (elements.infoView) elements.infoView.style.display = "block";
}

export function displayCurrentUser(user) {
    if (elements.currentUser) {
        elements.currentUser.innerHTML = `<p><strong>Name:</strong> ${user.full_name}</p>`;
    }
}

export function renderMyInfoPage(userData) {
    if (!userData || !elements.infoDetails) return;
    showSection("info");
    elements.infoDetails.innerHTML = `
    <p><strong>ID:</strong> ${userData.ID}</p>
    <p><strong>Name:</strong> ${userData.full_name}</p>
    <p><strong>Login:</strong> ${userData.login}</p>
    <p><strong>Role:</strong> ${userData.is_admin ? "Admin" : "Student"}</p>
  `;
}
