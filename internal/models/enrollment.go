package models

import (
	"time"
)

// Enrollment represents a user's enrollment in a course
type Enrollment struct {
	UserID    uint      `gorm:"not null" json:"user_id" example:"1"`
	CourseID  uint      `gorm:"not null" json:"course_id" example:"1"`
	StartDate time.Time `gorm:"not null" json:"start_date" example:"2025-01-01T00:00:00Z"`
	User      User      `json:"user"`
	Course    Course    `json:"course"`
}
