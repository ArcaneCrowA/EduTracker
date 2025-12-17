package models

import (
	"gorm.io/gorm"
)

// User represents a user in the system
type User struct {
	gorm.Model
	FullName string `gorm:"not null" json:"full_name" example:"John Doe"`
	Year     uint   `gorm:"not null" json:"year" example:"3"`
	Login    string `gorm:"not null" json:"login" example:"johndoe"`
	Password string `gorm:"not null" json:"password" example:"password123"`
}
