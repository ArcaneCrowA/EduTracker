import { API_BASE_URL, state } from "./api.js";
import { elements, showSection } from "./ui.js";

let coursesFormInitialized = false;
let joinBtnInitialized = false;

export async function loadCourses() {
    showSection("courses");
    try {
        const isAdmin = state.currentUserData && state.currentUserData.is_admin;

        if (isAdmin) {
            const list = document.getElementById("courses-list");
            if (!list) return;
            list.innerHTML = "Loading courses...";

            const response = await fetch(`${API_BASE_URL}/courses`, {
                headers: { Authorization: `Bearer ${state.jwtToken}` },
            });
            const courses = await response.json();
            list.innerHTML = "";
            courses.forEach((course) => {
                const item = document.createElement("div");
                item.className = "item";
                item.textContent = `ID: ${course.ID}, Title: ${course.title}, Start: ${course.start_date}, End: ${course.end_date}`;
                list.appendChild(item);
            });

            if (!coursesFormInitialized) {
                const form = document.getElementById("create-course-form");
                if (form) {
                    form.addEventListener("submit", async (e) => {
                        e.preventDefault();
                        await createCourseFromForm();
                        await loadCourses();
                    });
                    coursesFormInitialized = true;
                }
            }
        } else {
            const list = document.getElementById("my-courses-list");
            if (!list) return;
            list.innerHTML = "Loading my courses...";

            const response = await fetch(
                `${API_BASE_URL}/users/${state.currentUserData.ID}/courses`,
                { headers: { Authorization: `Bearer ${state.jwtToken}` } },
            );
            const myCourses = await response.json();
            list.innerHTML = "";
            myCourses.forEach((course) => {
                const item = document.createElement("div");
                item.className = "item";
                item.textContent = `ID: ${course.ID}, Title: ${course.title}`;
                list.appendChild(item);
            });

            if (!joinBtnInitialized) {
                const joinBtn = document.getElementById("show-join-courses-btn");
                if (joinBtn) {
                    joinBtn.addEventListener("click", () => showAvailableCoursesForJoin(myCourses));
                    joinBtnInitialized = true;
                }
            }
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
            headers: { Authorization: `Bearer ${state.jwtToken}` },
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

        const response = await fetch(`${API_BASE_URL}/attendances/mark`, {
            method: "POST",
            headers: {
                "Content-Type": "application/json",
                Authorization: `Bearer ${state.jwtToken}`,
            },
            body: JSON.stringify({
                user_id: state.currentUserData.ID,
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

    const start_date = `${startDate}T00:00:00Z`;
    const end_date = `${endDate}T00:00:00Z`;

    try {
        const response = await fetch(`${API_BASE_URL}/courses`, {
            method: "POST",
            headers: {
                "Content-Type": "application/json",
                Authorization: `Bearer ${state.jwtToken}`,
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
