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

function redirectAfterLogin() {
  if (!currentUserData) return;
  if (currentUserData.is_admin) {
    window.location.href = "admin.html";
  } else {
    window.location.href = "user.html";
  }
}

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
      localStorage.setItem("currentUser", JSON.stringify(currentUserData));
      redirectAfterLogin();
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
  localStorage.removeItem("currentUser");
  window.location.href = "index.html";
}

function displayCurrentUser(user) {
  currentUser.innerHTML = `<h2>User Information</h2>
    <p><strong>ID:</strong> ${user.ID}</p>
    <p><strong>Name:</strong> ${user.full_name}</p>
    <p><strong>Login:</strong> ${user.login}</p>
    <p><strong>Role:</strong> ${user.is_admin ? "Admin" : "Student"}</p>`;
}

function showLoginView() {
  if (loginView) {
    loginView.style.display = "block";
  }
  if (infoView) {
    infoView.style.display = "none";
  }
}

function showInfoView() {
  if (loginView) {
    loginView.style.display = "none";
  }
  if (infoView) {
    infoView.style.display = "block";
  }
}

async function loadUsers() {
  if (!usersLink) return; // only on admin page
  content.innerHTML = `
    <h2>Users</h2>
    <div id="create-user">
      <h3>Create New User</h3>
      <form id="create-user-form">
        <input type="text" id="new-user-fullname" placeholder="Full name" required />
        <input type="number" id="new-user-year" placeholder="Year" min="1" max="10" required />
        <input type="text" id="new-user-login" placeholder="Login" required />
        <input type="password" id="new-user-password" placeholder="Password" required />
        <label>
          <input type="checkbox" id="new-user-is-admin" />
          Admin
        </label>
        <button type="submit">Create user</button>
      </form>
      <hr />
    </div>
    <div id="users-list"></div>
  `;
  try {
    const response = await fetch(`${API_BASE_URL}/users`, {
      headers: {
        Authorization: `Bearer ${jwtToken}`,
      },
    });
    const users = await response.json();
    const list = document.getElementById("users-list");
    users.forEach((user) => {
      const item = document.createElement("div");
      item.className = "item";
      item.textContent = `ID: ${user.ID}, Name: ${user.full_name}, Login: ${user.login}, Role: ${
        user.is_admin ? "Admin" : "Student"
      }`;
      list.appendChild(item);
    });

    const form = document.getElementById("create-user-form");
    form.addEventListener("submit", async (e) => {
      e.preventDefault();
      await createUserFromForm();
      await loadUsers();
    });
  } catch (error) {
    console.error("Error fetching users:", error);
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
        Authorization: `Bearer ${jwtToken}`,
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

async function loadCourses() {
  content.innerHTML = "<h2>Courses</h2>";
  try {
    // For admins, show management view; for regular users, just show their courses
    const isAdmin = currentUserData && currentUserData.is_admin;

    if (isAdmin) {
      content.innerHTML = `
        <h2>Courses</h2>
        <div id="create-course">
          <h3>Create New Course</h3>
          <form id="create-course-form">
            <input type="text" id="new-course-title" placeholder="Title" required />
            <input type="text" id="new-course-description" placeholder="Description" required />
            <label>Start date:
              <input type="date" id="new-course-start-date" required />
            </label>
            <label>End date:
              <input type="date" id="new-course-end-date" required />
            </label>
            <button type="submit">Create course</button>
          </form>
          <hr />
        </div>
        <div id="courses-list"></div>
      `;

      const response = await fetch(`${API_BASE_URL}/courses`, {
        headers: {
          Authorization: `Bearer ${jwtToken}`,
        },
      });
      const courses = await response.json();
      const list = document.getElementById("courses-list");
      courses.forEach((course) => {
        const item = document.createElement("div");
        item.className = "item";
        item.textContent = `ID: ${course.ID}, Title: ${course.title}, Start: ${course.start_date}, End: ${course.end_date}`;
        list.appendChild(item);
      });

      const form = document.getElementById("create-course-form");
      form.addEventListener("submit", async (e) => {
        e.preventDefault();
        await createCourseFromForm();
        await loadCourses();
      });
    } else {
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
    }
  } catch (error) {
    console.error("Error fetching courses:", error);
  }
}

async function createCourseFromForm() {
  const title = document.getElementById("new-course-title").value;
  const description = document.getElementById("new-course-description").value;
  const startDate = document.getElementById("new-course-start-date").value;
  const endDate = document.getElementById("new-course-end-date").value;

  // Convert YYYY-MM-DD to full ISO with midnight UTC so backend's time.Time can parse cleanly
  const start_date = `${startDate}T00:00:00Z`;
  const end_date = `${endDate}T00:00:00Z`;

  try {
    const response = await fetch(`${API_BASE_URL}/courses`, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        Authorization: `Bearer ${jwtToken}`,
      },
      body: JSON.stringify({
        title,
        description,
        start_date,
        end_date,
      }),
    });
    if (!response.ok) {
      const text = await response.text();
      alert(`Failed to create course: ${text}`);
    }
  } catch (err) {
    console.error("Error creating course:", err);
    alert("Error creating course");
  }
}

async function loadAttendance() {
  const isAdmin = currentUserData && currentUserData.is_admin;
  content.innerHTML = "<h2>Attendance</h2>";
  try {
    if (isAdmin) {
      content.innerHTML += `
        <div id="take-attendance">
          <h3>Take Attendance</h3>
          <form id="attendance-search-form">
            <input type="text" id="attend-user-name" placeholder="Student name (regex or text)" required />
            <input type="text" id="attend-course-title" placeholder="Course title (regex or text)" required />
            <label>Date:
              <input type="date" id="attend-date" required />
            </label>
            <button type="submit">Search</button>
          </form>
          <div id="student-candidates"></div>
          <div id="course-candidates"></div>
          <button id="confirm-attendance-btn" disabled>Mark attended</button>
          <p id="attendance-result"></p>
          <hr />
        </div>
      `;

      const form = document.getElementById("attendance-search-form");
      form.addEventListener("submit", async (e) => {
        e.preventDefault();
        await searchAttendanceCandidates();
      });

      const confirmBtn = document.getElementById("confirm-attendance-btn");
      confirmBtn.addEventListener("click", async () => {
        await confirmAttendanceSelection();
      });
    } else {
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
        item.textContent = `Course: ${attendance.course_id}, Start: ${attendance.start_date}`;
        content.appendChild(item);
      });
    }
  } catch (error) {
    console.error("Error fetching attendance:", error);
  }
}

async function searchAttendanceCandidates() {
  const nameQuery = document
    .getElementById("attend-user-name")
    .value.toLowerCase();
  const courseQuery = document
    .getElementById("attend-course-title")
    .value.toLowerCase();
  const resultEl = document.getElementById("attendance-result");
  const studentListEl = document.getElementById("student-candidates");
  const courseListEl = document.getElementById("course-candidates");
  const confirmBtn = document.getElementById("confirm-attendance-btn");

  try {
    // find student by name
    const usersResp = await fetch(`${API_BASE_URL}/users`, {
      headers: { Authorization: `Bearer ${jwtToken}` },
    });
    const users = await usersResp.json();
    let studentRegex = null;
    try {
      studentRegex = new RegExp(nameQuery, "i");
    } catch {
      studentRegex = null;
    }
    const matchingStudents = users.filter((u) => {
      const name = (u.full_name || "").toLowerCase();
      if (!nameQuery) return false;
      return studentRegex ? studentRegex.test(u.full_name) : name.includes(nameQuery);
    }).slice(0, 5);

    // find course by title
    const coursesResp = await fetch(`${API_BASE_URL}/courses`, {
      headers: { Authorization: `Bearer ${jwtToken}` },
    });
    const courses = await coursesResp.json();
    let courseRegex = null;
    try {
      courseRegex = new RegExp(courseQuery, "i");
    } catch {
      courseRegex = null;
    }
    const matchingCourses = courses.filter((c) => {
      const title = (c.title || "").toLowerCase();
      if (!courseQuery) return false;
      return courseRegex ? courseRegex.test(c.title) : title.includes(courseQuery);
    }).slice(0, 5);

    studentListEl.innerHTML = "<h4>Select student</h4>";
    if (matchingStudents.length === 0) {
      studentListEl.innerHTML += "<p>No matching students (max 5 shown)</p>";
    } else {
      matchingStudents.forEach((u) => {
        const div = document.createElement("div");
        div.innerHTML = `<label><input type="radio" name="studentCandidate" value="${u.ID}"> ${u.full_name} (id: ${u.ID})</label>`;
        studentListEl.appendChild(div);
      });
    }

    courseListEl.innerHTML = "<h4>Select course</h4>";
    if (matchingCourses.length === 0) {
      courseListEl.innerHTML += "<p>No matching courses (max 5 shown)</p>";
    } else {
      matchingCourses.forEach((c) => {
        const div = document.createElement("div");
        div.innerHTML = `<label><input type="radio" name="courseCandidate" value="${c.ID}"> ${c.title} (id: ${c.ID})</label>`;
        courseListEl.appendChild(div);
      });
    }

    if (matchingStudents.length === 0 || matchingCourses.length === 0) {
      confirmBtn.disabled = true;
      resultEl.textContent =
        "You must have at least one matching student and course to select.";
    } else {
      confirmBtn.disabled = false;
      resultEl.textContent =
        "Select one student and one course, then click 'Mark attended'.";
    }
  } catch (err) {
    console.error("Error searching attendance candidates:", err);
    resultEl.textContent = "Error searching candidates";
  }
}

async function confirmAttendanceSelection() {
  const date = document.getElementById("attend-date").value;
  const resultEl = document.getElementById("attendance-result");
  const studentRadio = document.querySelector(
    'input[name="studentCandidate"]:checked',
  );
  const courseRadio = document.querySelector(
    'input[name="courseCandidate"]:checked',
  );

  if (!studentRadio || !courseRadio) {
    resultEl.textContent = "Please select one student and one course.";
    return;
  }

  const userId = parseInt(studentRadio.value, 10);
  const courseId = parseInt(courseRadio.value, 10);
  const start_date = `${date}T00:00:00Z`;

  try {
    const enrollResp = await fetch(`${API_BASE_URL}/enrollments/enroll`, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        Authorization: `Bearer ${jwtToken}`,
      },
      body: JSON.stringify({
        user_id: userId,
        course_id: courseId,
        start_date,
      }),
    });

    if (!enrollResp.ok) {
      const text = await enrollResp.text();
      resultEl.textContent = `Failed to mark attendance: ${text}`;
    } else {
      resultEl.textContent = `Attendance marked successfully.`;
    }
  } catch (err) {
    console.error("Error confirming attendance:", err);
    resultEl.textContent = "Error taking attendance";
  }
}

if (loginBtn) {
  loginBtn.addEventListener("click", login);
}
if (logoutLink) {
  logoutLink.addEventListener("click", logout);
}
if (usersLink) {
  usersLink.addEventListener("click", (e) => {
    e.preventDefault();
    loadUsers();
  });
}
if (coursesLink) {
  coursesLink.addEventListener("click", (e) => {
    e.preventDefault();
    loadCourses();
  });
}
if (attendanceLink) {
  attendanceLink.addEventListener("click", (e) => {
    e.preventDefault();
    loadAttendance();
  });
}

// Check login state on page load
document.addEventListener("DOMContentLoaded", () => {
  const token = localStorage.getItem("jwtToken");
  const storedUser = localStorage.getItem("currentUser");
  if (token && storedUser) {
    jwtToken = token;
    currentUserData = JSON.parse(storedUser);

    // If we're on a protected page but the role doesn't match, redirect
    const isAdminPage = window.location.pathname.endsWith("admin.html");
    const isUserPage = window.location.pathname.endsWith("user.html");

    if (isAdminPage && !currentUserData.is_admin) {
      window.location.href = "user.html";
      return;
    }
    if (isUserPage && currentUserData.is_admin) {
      window.location.href = "admin.html";
      return;
    }

    if (currentUser) {
      displayCurrentUser(currentUserData);
    }
    if (infoView) {
      showInfoView();
      // default content on each page
      if (isAdminPage && usersLink) {
        loadUsers();
      } else if (coursesLink) {
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
