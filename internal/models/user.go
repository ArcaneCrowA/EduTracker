package models

import (
	"gorm.io/gorm"
)

type User struct {
	gorm.Model
	FullName string `gorm:"not null" json:"full_name"`
	Year     uint   `gorm:"not null" json:"year"`
	Login    string `gorm:"not null" json:"login"`
	Password string `gorm:"not null" json:"password"`
}
