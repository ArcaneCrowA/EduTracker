package repository

import (
	"github.com/arcanecrowa/EduTracker/internal/models"
	"gorm.io/gorm"
)

type EnrollmentRepository struct {
	db *gorm.DB
}

func NewEnrollmentRepository(db *gorm.DB) *EnrollmentRepository {
	return &EnrollmentRepository{db: db}
}

func (r *EnrollmentRepository) CreateEnrollment(enrollment *models.Enrollment) (*models.Enrollment, error) {
	result := r.db.Create(enrollment)
	return enrollment, result.Error
}

func (r *EnrollmentRepository) GetEnrollmentsByCourseID(courseID uint) ([]models.Enrollment, error) {
	var enrollments []models.Enrollment
	result := r.db.Where("course_id = ?", courseID).Find(&enrollments)
	return enrollments, result.Error
}

func (r *EnrollmentRepository) GetEnrollmentsByUserID(userID uint) ([]models.Enrollment, error) {
	var enrollments []models.Enrollment
	result := r.db.Where("user_id = ?", userID).Find(&enrollments)
	return enrollments, result.Error
}

func (r *EnrollmentRepository) DeleteEnrollment(userID, courseID uint) error {
	result := r.db.Where("user_id = ? AND course_id = ?", userID, courseID).Delete(&models.Enrollment{})
	return result.Error
}
