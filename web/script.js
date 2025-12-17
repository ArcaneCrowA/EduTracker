const API_BASE_URL = "http://localhost:8080/api/v1";

const loginView = document.getElementById("login-view");
const infoView = document.getElementById("info-view");
const loginUserInput = document.getElementById("login-user");
const loginPasswordInput = document.getElementById("login-password");
const loginBtn = document.getElementById("login-btn");
const usersLink = document.getElementById("users-link");
const coursesLink = document.getElementById("courses-link");
const attendanceLink = document.getElementById("attendance-link");
const logoutLink = document.getElementById("logout-link");
const content = document.getElementById("content");

let jwtToken = null;

async function login() {
  const loginData = {
    login: loginUserInput.value,
    password: loginPasswordInput.value,
  };

  try {
    const response = await fetch(`${API_BASE_URL}/public/login`, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify(loginData),
    });

    if (response.ok) {
      const data = await response.json();
      jwtToken = data.token;
      localStorage.setItem("jwtToken", jwtToken);
      showInfoView();
    } else {
      alert("Login failed");
    }
  } catch (error) {
    console.error("Login error:", error);
    alert("Login error");
  }
}

function logout() {
  jwtToken = null;
  localStorage.removeItem("jwtToken");
  showLoginView();
}

function showLoginView() {
  loginView.style.display = "block";
  infoView.style.display = "none";
}

function showInfoView() {
  loginView.style.display = "none";
  infoView.style.display = "block";
  loadUsers();
}

async function loadUsers() {
  content.innerHTML = "<h2>Users</h2>";
  try {
    const response = await fetch(`${API_BASE_URL}/users`, {
      headers: {
        Authorization: `Bearer ${jwtToken}`,
      },
    });
    const users = await response.json();
    users.forEach((user) => {
      const item = document.createElement("div");
      item.className = "item";
      item.textContent = `ID: ${user.ID}, Name: ${user.full_name}, Login: ${user.login}`;
      content.appendChild(item);
    });
  } catch (error) {
    console.error("Error fetching users:", error);
  }
}

async function loadCourses() {
  content.innerHTML = "<h2>Courses</h2>";
  try {
    const response = await fetch(`${API_BASE_URL}/courses`, {
      headers: {
        Authorization: `Bearer ${jwtToken}`,
      },
    });
    const courses = await response.json();
    courses.forEach((course) => {
      const item = document.createElement("div");
      item.className = "item";
      item.textContent = `ID: ${course.ID}, Title: ${course.title}`;
      content.appendChild(item);
    });
  } catch (error) {
    console.error("Error fetching courses:", error);
  }
}

async function loadAttendance() {
  content.innerHTML = "<h2>Attendance</h2>";
  // Assuming we need a user ID to fetch attendance
  // For now, let's just show a message
  content.innerHTML += "<p>Select a user to see their attendance.</p>";
}

loginBtn.addEventListener("click", login);
logoutLink.addEventListener("click", logout);
usersLink.addEventListener("click", loadUsers);
coursesLink.addEventListener("click", loadCourses);
attendanceLink.addEventListener("click", loadAttendance);

// Check login state on page load
document.addEventListener("DOMContentLoaded", () => {
  const token = localStorage.getItem("jwtToken");
  if (token) {
    jwtToken = token;
    showInfoView();
  } else {
    showLoginView();
  }
});
