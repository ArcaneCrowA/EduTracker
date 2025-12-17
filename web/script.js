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
const currentUser = document.getElementById("current-user");

let jwtToken = null;
let currentUserData = null;

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
      currentUserData = data.user;
      localStorage.setItem("jwtToken", jwtToken);
      displayCurrentUser(currentUserData);
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

function displayCurrentUser(user) {
  currentUser.innerHTML = `<h2>User Information</h2>
    <p><strong>ID:</strong> ${user.ID}</p>
    <p><strong>Name:</strong> ${user.full_name}</p>
    <p><strong>Login:</strong> ${user.login}</p>`;
}

function showLoginView() {
  loginView.style.display = "block";
  infoView.style.display = "none";
}

function showInfoView() {
  loginView.style.display = "none";
  infoView.style.display = "block";
  loadCourses();
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
    const response = await fetch(
      `${API_BASE_URL}/users/${currentUserData.ID}/courses`,
      {
        headers: {
          Authorization: `Bearer ${jwtToken}`,
        },
      },
    );
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
  try {
    const response = await fetch(
      `${API_BASE_URL}/users/${currentUserData.ID}/attendances`,
      {
        headers: {
          Authorization: `Bearer ${jwtToken}`,
        },
      },
    );
    const attendances = await response.json();
    attendances.forEach((attendance) => {
      const item = document.createElement("div");
      item.className = "item";
      item.textContent = `Course: ${attendance.course_id}, Date: ${attendance.date}, Status: ${attendance.status}`;
      content.appendChild(item);
    });
  } catch (error) {
    console.error("Error fetching attendance:", error);
  }
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
    fetch(`${API_BASE_URL}/users/me`, {
      headers: {
        Authorization: `Bearer ${jwtToken}`,
      },
    })
      .then((response) => response.json())
      .then((data) => {
        currentUserData = data;
        displayCurrentUser(currentUserData);
        showInfoView();
      })
      .catch((error) => {
        console.error("Error fetching user data:", error);
        logout();
      });
  } else {
    showLoginView();
  }
});
