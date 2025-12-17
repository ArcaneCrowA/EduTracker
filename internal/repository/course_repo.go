package repository

import (
	"github.com/arcanecrowa/EduTracker/internal/models"
	"gorm.io/gorm"
)

type CourseRepository struct {
	db *gorm.DB
}

func NewCourseRepository(db *gorm.DB) *CourseRepository {
	return &CourseRepository{db: db}
}

func (r *CourseRepository) CreateCourse(course *models.Course) (*models.Course, error) {
	result := r.db.Create(course)
	return course, result.Error
}

func (r *CourseRepository) GetCourse(id int) (*models.Course, error) {
	var course models.Course
	result := r.db.First(&course, id)
	return &course, result.Error
}

func (r *CourseRepository) GetAllCourses() ([]models.Course, error) {
	var courses []models.Course
	result := r.db.Find(&courses)
	return courses, result.Error
}

func (r *CourseRepository) UpdateCourse(course *models.Course) (*models.Course, error) {
	result := r.db.Save(course)
	return course, result.Error
}

func (r *CourseRepository) DeleteCourse(id int) error {
	result := r.db.Delete(&models.Course{}, id)
	return result.Error
}
