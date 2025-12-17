const API_BASE_URL = "http://localhost:8080/api/v1";

const loginView = document.getElementById("login-view");
const infoView = document.getElementById("info-view");
const loginUserInput = document.getElementById("login-user");
const loginPasswordInput = document.getElementById("login-password");
const loginBtn = document.getElementById("login-btn");
const dashboardLink = document.getElementById("dashboard-link");
const usersLink = document.getElementById("users-link");
const coursesLink = document.getElementById("courses-link");
const attendanceLink = document.getElementById("attendance-link");
const logoutLink = document.getElementById("logout-link");
const content = document.getElementById("content");
const currentUser = document.getElementById("current-user");

let jwtToken = null;
let currentUserData = null;
let allUsers = null;
let allCourses = null;
let studentCandidates = [];
let courseCandidates = [];

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
  // Compact header: only show name on most pages
  currentUser.innerHTML = `<p><strong>Name:</strong> ${user.full_name}</p>`;
}

function renderMyInfoPage() {
  if (!currentUserData) return;
  content.innerHTML = `<h2>My Info</h2>
    <p><strong>ID:</strong> ${currentUserData.ID}</p>
    <p><strong>Name:</strong> ${currentUserData.full_name}</p>
    <p><strong>Login:</strong> ${currentUserData.login}</p>
    <p><strong>Role:</strong> ${currentUserData.is_admin ? "Admin" : "Student"}</p>`;
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
      // Student view: show enrolled courses and allow joining new ones
      const response = await fetch(
        `${API_BASE_URL}/users/${currentUserData.ID}/courses`,
        {
          headers: {
            Authorization: `Bearer ${jwtToken}`,
          },
        },
      );
      const myCourses = await response.json();

      const list = document.createElement("div");
      list.id = "my-courses-list";
      myCourses.forEach((course) => {
        const item = document.createElement("div");
        item.className = "item";
        item.textContent = `ID: ${course.ID}, Title: ${course.title}`;
        list.appendChild(item);
      });

      const joinBtn = document.createElement("button");
      joinBtn.textContent = "Join course";
      joinBtn.style.marginTop = "16px";
      joinBtn.addEventListener("click", () =>
        showAvailableCoursesForJoin(myCourses),
      );

      content.appendChild(list);
      content.appendChild(joinBtn);

      const joinContainer = document.createElement("div");
      joinContainer.id = "available-courses";
      joinContainer.style.marginTop = "16px";
      content.appendChild(joinContainer);
    }
  } catch (error) {
    console.error("Error fetching courses:", error);
  }
}

async function showAvailableCoursesForJoin(currentCourses) {
  const container = document.getElementById("available-courses");
  if (!container) return;
  container.innerHTML = "<h3>Available courses</h3>";

  try {
    const response = await fetch(`${API_BASE_URL}/courses`, {
      headers: {
        Authorization: `Bearer ${jwtToken}`,
      },
    });
    const allCourses = await response.json();
    const currentIds = new Set(currentCourses.map((c) => c.ID));
    const available = allCourses.filter((c) => !currentIds.has(c.ID));

    if (available.length === 0) {
      container.innerHTML += "<p>No more courses available to join.</p>";
      return;
    }

    available.forEach((course) => {
      const row = document.createElement("div");
      row.className = "item";
      const title = document.createElement("span");
      title.textContent = `ID: ${course.ID}, Title: ${course.title}`;
      const btn = document.createElement("button");
      btn.textContent = "Join";
      btn.style.marginTop = "8px";
      btn.addEventListener("click", async () => {
        await joinCourse(course.ID);
        // reload courses view after join
        await loadCourses();
      });

      row.appendChild(title);
      row.appendChild(btn);
      container.appendChild(row);
    });
  } catch (err) {
    console.error("Error loading available courses:", err);
    container.innerHTML += "<p>Error loading available courses.</p>";
  }
}

async function joinCourse(courseId) {
  try {
    const today = new Date().toISOString().split("T")[0];
    const start_date = `${today}T00:00:00Z`;

    const response = await fetch(`${API_BASE_URL}/enrollments/enroll`, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        Authorization: `Bearer ${jwtToken}`,
      },
      body: JSON.stringify({
        user_id: currentUserData.ID,
        course_id: courseId,
        start_date,
      }),
    });

    if (!response.ok) {
      const text = await response.text();
      alert(`Failed to join course: ${text}`);
    }
  } catch (err) {
    console.error("Error joining course:", err);
    alert("Error joining course");
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
            <div id="student-candidates" class="suggestions"></div>
            <input type="text" id="attend-course-title" placeholder="Course title (regex or text)" required />
            <div id="course-candidates" class="suggestions"></div>
            <label>Date:
              <input type="date" id="attend-date" required />
            </label>
          </form>
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

      // Live search on typing
      const userInput = document.getElementById("attend-user-name");
      const courseInput = document.getElementById("attend-course-title");
      userInput.addEventListener("input", () => {
        searchAttendanceCandidates();
      });
      courseInput.addEventListener("input", () => {
        searchAttendanceCandidates();
      });
      userInput.addEventListener("keydown", (e) => {
        handleCandidateKeyDown("student", e);
      });
      courseInput.addEventListener("keydown", (e) => {
        handleCandidateKeyDown("course", e);
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
        const courseTitle =
          attendance.course && attendance.course.title
            ? attendance.course.title
            : `Course ${attendance.course_id}`;
        const dateOnly = attendance.start_date
          ? String(attendance.start_date).split("T")[0]
          : "";
        item.textContent = `Course: ${courseTitle}, ${dateOnly}`;
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
    if (!allUsers) {
      const usersResp = await fetch(`${API_BASE_URL}/users`, {
        headers: { Authorization: `Bearer ${jwtToken}` },
      });
      allUsers = await usersResp.json();
    }
    let studentRegex = null;
    try {
      studentRegex = new RegExp(nameQuery, "i");
    } catch {
      studentRegex = null;
    }
    studentCandidates = allUsers.filter((u) => {
      const name = (u.full_name || "").toLowerCase();
      if (!nameQuery) return false;
      return studentRegex ? studentRegex.test(u.full_name) : name.includes(nameQuery);
    }).slice(0, 5);

    // find course by title
    if (!allCourses) {
      const coursesResp = await fetch(`${API_BASE_URL}/courses`, {
        headers: { Authorization: `Bearer ${jwtToken}` },
      });
      allCourses = await coursesResp.json();
    }
    let courseRegex = null;
    try {
      courseRegex = new RegExp(courseQuery, "i");
    } catch {
      courseRegex = null;
    }
    courseCandidates = allCourses.filter((c) => {
      const title = (c.title || "").toLowerCase();
      if (!courseQuery) return false;
      return courseRegex ? courseRegex.test(c.title) : title.includes(courseQuery);
    }).slice(0, 5);

    studentListEl.innerHTML = "";
    if (studentCandidates.length === 0) {
      studentListEl.innerHTML += "<p>No matching students (max 5 shown)</p>";
    } else {
      studentCandidates.forEach((u, idx) => {
        const div = document.createElement("div");
        div.className = "suggestion-item";
        div.dataset.index = idx.toString();
        div.innerHTML = `${u.full_name} (id: ${u.ID})`;
        div.addEventListener("mousedown", (e) => {
          e.preventDefault();
          setCandidateSelection("student", idx);
        });
        studentListEl.appendChild(div);
      });
    }

    courseListEl.innerHTML = "";
    if (courseCandidates.length === 0) {
      courseListEl.innerHTML += "<p>No matching courses (max 5 shown)</p>";
    } else {
      courseCandidates.forEach((c, idx) => {
        const div = document.createElement("div");
        div.className = "suggestion-item";
        div.dataset.index = idx.toString();
        div.innerHTML = `${c.title} (id: ${c.ID})`;
        div.addEventListener("mousedown", (e) => {
          e.preventDefault();
          setCandidateSelection("course", idx);
        });
        courseListEl.appendChild(div);
      });
    }

    if (studentCandidates.length === 0 || courseCandidates.length === 0) {
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
  const studentIdx = getCurrentIndex("student");
  const courseIdx = getCurrentIndex("course");

  if (studentIdx === -1 || courseIdx === -1) {
    resultEl.textContent = "Please select one student and one course.";
    return;
  }

  const userId = studentCandidates[studentIdx].ID;
  const courseId = courseCandidates[courseIdx].ID;
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

function handleCandidateKeyDown(type, event) {
  // Arrow navigation between suggestions
  if (event.key === "ArrowDown" || event.key === "ArrowUp") {
    event.preventDefault();

    const maxIndex =
      type === "student"
        ? studentCandidates.length - 1
        : courseCandidates.length - 1;
    if (maxIndex < 0) return;

    let index = getCurrentIndex(type);
    if (index === -1) {
      index = event.key === "ArrowDown" ? 0 : maxIndex;
    } else if (event.key === "ArrowDown") {
      index = Math.min(index + 1, maxIndex);
    } else if (event.key === "ArrowUp") {
      index = Math.max(index - 1, 0);
    }

    setCandidateSelection(type, index);
    return;
  }

  // Prevent Enter from submitting the form; keep current selection
  if (event.key === "Enter") {
    event.preventDefault();

    const arr =
      type === "student" ? studentCandidates : courseCandidates;
    if (arr.length > 0 && getCurrentIndex(type) === -1) {
      setCandidateSelection(type, 0);
    }
  }
}

function getCurrentIndex(type) {
  const containerId = type === "student" ? "student-candidates" : "course-candidates";
  const container = document.getElementById(containerId);
  if (!container) return -1;
  const items = Array.from(container.querySelectorAll(".suggestion-item"));
  const idx = items.findIndex((el) => el.classList.contains("selected"));
  return idx;
}

function setCandidateSelection(type, index) {
  const containerId = type === "student" ? "student-candidates" : "course-candidates";
  const container = document.getElementById(containerId);
  if (!container) return;
  const items = Array.from(container.querySelectorAll(".suggestion-item"));
  items.forEach((el, i) => {
    el.classList.toggle("selected", i === index);
  });

  // Also update the input text to reflect the selected suggestion
  const inputId = type === "student" ? "attend-user-name" : "attend-course-title";
  const input = document.getElementById(inputId);
  if (input) {
    const candidate =
      type === "student"
        ? studentCandidates[index]
        : courseCandidates[index];
    if (candidate) {
      input.value =
        type === "student" ? candidate.full_name : candidate.title;
    }
  }
}

if (loginBtn) {
  loginBtn.addEventListener("click", login);
}
if (logoutLink) {
  logoutLink.addEventListener("click", logout);
}
if (dashboardLink) {
  dashboardLink.addEventListener("click", (e) => {
    e.preventDefault();
    renderMyInfoPage();
  });
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
