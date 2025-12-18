import { API_BASE_URL, state } from "./api.js";
import { elements, showSection } from "./ui.js";

let attendanceBtnInitialized = false;

export async function loadAttendance() {
    showSection("attendance");
    const isAdmin = state.currentUserData && state.currentUserData.is_admin;
    try {
        if (isAdmin) {
            if (!attendanceBtnInitialized) {
                const confirmBtn = document.getElementById("confirm-attendance-btn");
                if (confirmBtn) {
                    confirmBtn.addEventListener("click", async () => {
                        await confirmAttendanceSelection();
                    });
                }

                const userInput = document.getElementById("attend-user-name");
                const courseInput = document.getElementById("attend-course-title");

                if (userInput && courseInput) {
                    userInput.addEventListener("input", () => searchAttendanceCandidates());
                    courseInput.addEventListener("input", () => searchAttendanceCandidates());

                    userInput.addEventListener("keydown", (e) => handleCandidateKeyDown("student", e));
                    courseInput.addEventListener("keydown", (e) => handleCandidateKeyDown("course", e));
                }
                attendanceBtnInitialized = true;
            }
        } else {
            const list = document.getElementById("attendance-list");
            if (!list) return;
            list.innerHTML = "Loading attendance...";

            const response = await fetch(
                `${API_BASE_URL}/users/${state.currentUserData.ID}/attendances`,
                { headers: { Authorization: `Bearer ${state.jwtToken}` } },
            );
            const attendances = await response.json();
            list.innerHTML = "";
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
                list.appendChild(item);
            });
        }
    } catch (error) {
        console.error("Error fetching attendance:", error);
    }
}

async function searchAttendanceCandidates() {
    const nameQuery = document.getElementById("attend-user-name").value.toLowerCase();
    const courseQuery = document.getElementById("attend-course-title").value.toLowerCase();
    const resultEl = document.getElementById("attendance-result");
    const studentListEl = document.getElementById("student-candidates");
    const courseListEl = document.getElementById("course-candidates");
    const confirmBtn = document.getElementById("confirm-attendance-btn");

    try {
        if (!state.allUsers) {
            const usersResp = await fetch(`${API_BASE_URL}/users`, {
                headers: { Authorization: `Bearer ${state.jwtToken}` },
            });
            state.allUsers = await usersResp.json();
        }
        let studentRegex = null;
        try {
            studentRegex = new RegExp(nameQuery, "i");
        } catch {
            studentRegex = null;
        }
        state.studentCandidates = state.allUsers.filter((u) => {
            const name = (u.full_name || "").toLowerCase();
            if (!nameQuery) return false;
            return studentRegex ? studentRegex.test(u.full_name) : name.includes(nameQuery);
        }).slice(0, 5);

        if (!state.allCourses) {
            const coursesResp = await fetch(`${API_BASE_URL}/courses`, {
                headers: { Authorization: `Bearer ${state.jwtToken}` },
            });
            state.allCourses = await coursesResp.json();
        }
        let courseRegex = null;
        try {
            courseRegex = new RegExp(courseQuery, "i");
        } catch {
            courseRegex = null;
        }
        state.courseCandidates = state.allCourses.filter((c) => {
            const title = (c.title || "").toLowerCase();
            if (!courseQuery) return false;
            return courseRegex ? courseRegex.test(c.title) : title.includes(courseQuery);
        }).slice(0, 5);

        renderCandidates(studentListEl, state.studentCandidates, "student");
        renderCandidates(courseListEl, state.courseCandidates, "course");

        if (state.studentCandidates.length === 0 || state.courseCandidates.length === 0) {
            confirmBtn.disabled = true;
            resultEl.textContent = "You must have at least one matching student and course to select.";
        } else {
            confirmBtn.disabled = false;
            resultEl.textContent = "Select one student and one course, then click 'Mark attended'.";
        }
    } catch (err) {
        console.error("Error searching attendance candidates:", err);
        resultEl.textContent = "Error searching candidates";
    }
}

function renderCandidates(container, candidates, type) {
    container.innerHTML = "";
    if (candidates.length === 0) {
        container.innerHTML += `<p>No matching ${type === "student" ? "students" : "courses"} (max 5 shown)</p>`;
    } else {
        candidates.forEach((item, idx) => {
            const div = document.createElement("div");
            div.className = "suggestion-item";
            div.dataset.index = idx.toString();
            div.innerHTML = `${type === "student" ? item.full_name : item.title} (id: ${item.ID})`;
            div.addEventListener("mousedown", (e) => {
                e.preventDefault();
                setCandidateSelection(type, idx);
            });
            container.appendChild(div);
        });
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

    const userId = state.studentCandidates[studentIdx].ID;
    const courseId = state.courseCandidates[courseIdx].ID;
    const start_date = `${date}T00:00:00Z`;

    try {
        const enrollResp = await fetch(`${API_BASE_URL}/enrollments/enroll`, {
            method: "POST",
            headers: {
                "Content-Type": "application/json",
                Authorization: `Bearer ${state.jwtToken}`,
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
    if (event.key === "ArrowDown" || event.key === "ArrowUp") {
        event.preventDefault();
        const candidates = type === "student" ? state.studentCandidates : state.courseCandidates;
        const maxIndex = candidates.length - 1;
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

    if (event.key === "Enter") {
        event.preventDefault();
        const candidates = type === "student" ? state.studentCandidates : state.courseCandidates;
        if (candidates.length > 0 && getCurrentIndex(type) === -1) {
            setCandidateSelection(type, 0);
        }
    }
}

function getCurrentIndex(type) {
    const containerId = type === "student" ? "student-candidates" : "course-candidates";
    const container = document.getElementById(containerId);
    if (!container) return -1;
    const items = Array.from(container.querySelectorAll(".suggestion-item"));
    return items.findIndex((el) => el.classList.contains("selected"));
}

function setCandidateSelection(type, index) {
    const containerId = type === "student" ? "student-candidates" : "course-candidates";
    const container = document.getElementById(containerId);
    if (!container) return;
    const items = Array.from(container.querySelectorAll(".suggestion-item"));
    items.forEach((el, i) => el.classList.toggle("selected", i === index));

    const inputId = type === "student" ? "attend-user-name" : "attend-course-title";
    const input = document.getElementById(inputId);
    if (input) {
        const candidate = type === "student" ? state.studentCandidates[index] : state.courseCandidates[index];
        if (candidate) {
            input.value = type === "student" ? candidate.full_name : candidate.title;
        }
    }
}
