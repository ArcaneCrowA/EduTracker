package models

import (
	"time"
)

type Enrollment struct {
	UserID    uint      `gorm:"not null" json:"title"`
	CourseID  uint      `gorm:"not null" json:"description"`
	StartDate time.Time `gorm:"not null" json:"start_date"`
	User      User
	Course    Course
}
