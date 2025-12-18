# EduTracker
A containerized web platform for managing courses, students, and attendance with RESTful APIs and frontend integration.

## API Endpoints

All endpoints are prefixed with `/api/v1`.

### Public Routes

| Method | Endpoint | Description | Request Body |
|--------|----------|-------------|--------------|
| POST   | `/public/login` | User login | `{"login": "johndoe", "password": "password123"}` |

### Protected Routes

**Required Header for all protected routes:** `Authorization: Bearer <token>`

#### Authentication
| Method | Endpoint | Description | Request Body |
|--------|----------|-------------|--------------|
| POST   | `/logout` | User logout | None |

#### Users
| Method | Endpoint | Description | Request Body |
|--------|----------|-------------|--------------|
| GET    | `/users` | Get all users | None |
| POST   | `/users` | Create new user | `{"full_name": "Name", "year": 1, "login": "user", "password": "pass", "is_admin": false}` |
| GET    | `/users/me` | Get current user profile | None |
| GET    | `/users/:id` | Get user by ID | None |
| PUT    | `/users/:id` | Update user details | `{"full_name": "New Name", "year": 2, ...}` |
| DELETE | `/users/:id` | Delete user | None |
| GET    | `/users/:id/courses` | Get user's courses | None |
| GET    | `/users/:id/attendances` | Get user's attendance | None |

#### Courses
| Method | Endpoint | Description | Request Body |
|--------|----------|-------------|--------------|
| GET    | `/courses` | Get all courses | None |
| POST   | `/courses` | Create new course | `{"title": "Go", "description": "...", "start_date": "ISO8601", "end_date": "ISO8601"}` |
| GET    | `/courses/:id` | Get course by ID | None |
| PUT    | `/courses/:id` | Update course details | `{"title": "New Title", ...}` |
| DELETE | `/courses/:id` | Delete course | None |

#### Attendance
| Method | Endpoint | Description | Request Body |
|--------|----------|-------------|--------------|
| GET    | `/attendances` | Get all attendances | None |
| POST   | `/attendances/mark` | Mark attendance / Attend | `{"user_id": 1, "course_id": 1, "start_date": "ISO8601"}` |
| GET    | `/attendances/courses/:id` | Get attendances for course | None |
| GET    | `/attendances/users/:id` | Get attendances for user | None |
| DELETE | `/attendances/remove/user/:userId/course/:courseId` | Remove attendance | None |
