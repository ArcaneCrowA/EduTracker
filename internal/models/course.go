package models

import (
	"time"

	"gorm.io/gorm"
)

// Course represents a course in the system
type Course struct {
	gorm.Model
	Title        string    `gorm:"not null" json:"title" example:"Introduction to Go"`
	Description  string    `gorm:"not null" json:"description" example:"A beginner-friendly course on the Go programming language."`
	StartDate    time.Time `gorm:"not null" json:"start_date" example:"2025-01-01T00:00:00Z"`
	EndDate      time.Time `gorm:"not null" json:"end_date" example:"2025-05-01T00:00:00Z"`
	InstructorID uint      `json:"instructor_id" example:"1"`
}
