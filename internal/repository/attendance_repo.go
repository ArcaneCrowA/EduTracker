package repository

import (
	"github.com/arcanecrowa/EduTracker/internal/models"
	"gorm.io/gorm"
)

type AttendanceRepository struct {
	db *gorm.DB
}

func NewAttendanceRepository(db *gorm.DB) *AttendanceRepository {
	return &AttendanceRepository{db: db}
}

func (r *AttendanceRepository) CreateAttendance(attendance *models.Attendance) (*models.Attendance, error) {
	result := r.db.Create(attendance)
	return attendance, result.Error
}

func (r *AttendanceRepository) GetAttendancesByCourseID(courseID uint) ([]models.Attendance, error) {
	var attendances []models.Attendance
	result := r.db.Where("course_id = ?", courseID).Find(&attendances)
	return attendances, result.Error
}

func (r *AttendanceRepository) GetAttendancesByUserID(userID uint) ([]models.Attendance, error) {
	var attendances []models.Attendance
	result := r.db.Where("user_id = ?", userID).Find(&attendances)
	return attendances, result.Error
}

func (r *AttendanceRepository) GetAllAttendancesWithDetails() ([]models.Attendance, error) {
	var attendances []models.Attendance
	result := r.db.Preload("User").Preload("Course").Find(&attendances)
	return attendances, result.Error
}

func (r *AttendanceRepository) DeleteAttendance(userID, courseID uint) error {
	result := r.db.Where("user_id = ? AND course_id = ?", userID, courseID).Delete(&models.Attendance{})
	return result.Error
}
